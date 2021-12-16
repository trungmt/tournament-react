import { useState, useContext, useEffect, useRef } from 'react';
import {
  FormControl,
  LinearProgress,
  LinearProgressProps,
  Typography,
  Box,
  TextField,
  Alert,
  IconButton,
  FormHelperText,
} from '@mui/material';
import {
  Done as CheckCircleIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import AuthContext from '../../store/auth-context';
import { axiosClient } from '../../config/axios';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { useDropzone } from 'react-dropzone';
import { AxiosResponse } from 'axios';

interface ImageFile extends File {
  preview: string;
  returnFilename: string;
  uploadProgress: number;
  isSuspended: boolean;
  cancelToken: CancelTokenSource;
  error?: string;
}

interface FlagIconUploadResponse extends CustomResponse {
  data: {
    filename: string;
  };
}

interface FlagIconUploadReject extends CustomResponse {
  data: {
    flagIcon: string;
  };
}

function LinearProgressWithLabel(
  props: LinearProgressProps & {
    progress: number;
    // onFileStopUpload(): void;
  }
) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, ml: 2 }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        {props.progress !== null && (
          <LinearProgress
            variant="determinate"
            value={props.progress}
            {...props}
          />
        )}
      </Box>
      <Box sx={{ minWidth: 35, lineHeight: 1 }}>
        {props.progress < 100 ? (
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            props.progress
          )}%`}</Typography>
        ) : (
          <CheckCircleIcon fontSize="small" color="primary" />
        )}
      </Box>
    </Box>
  );
}

interface FileInputProps {
  maxFiles: number;
  uploadUrl: string;
  fieldName: string;
  onUploadDone(responses: string | string[]): void;
}

export default function FileInput({
  maxFiles,
  uploadUrl,
  fieldName,
  onUploadDone,
}: FileInputProps) {
  const { accessToken } = useContext(AuthContext);
  const axiosAdminClient = axiosClient(accessToken);
  const isMultiple: boolean = maxFiles > 1;

  const [files, setFiles] = useState<ImageFile[]>([]);
  const [filesErrors, setFilesErrors] = useState<string[]>([]);

  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  const isAllFilesUploadDone = filesRef.current.every(
    file => file.isSuspended === true || file.uploadProgress === 100
  );

  const prepareUploadDoneFilenames = (): string | string[] => {
    console.log('filesRef', filesRef.current);
    const filenames = filesRef.current
      .filter(file => file.isSuspended === false && file.returnFilename !== '')
      .map(file => file.returnFilename);

    if (maxFile === 1) {
      return filenames.length > 0 ? filenames[filenames.length - 1] : '';
    }
    return filenames;
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/jpeg, image/png, image/tiff, image/gif',
    maxFiles,
    onDropAccepted: async acceptedFiles => {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      let newFiles: ImageFile[] = [];
      let uploadFiles: File[] = acceptedFiles;
      let currentFilesIndex: number = 0;
      if (maxFiles === 1) {
        const lastAcceptedFile = acceptedFiles[acceptedFiles.length - 1];
        newFiles.push({
          ...lastAcceptedFile,
          returnFilename: '',
          preview: URL.createObjectURL(lastAcceptedFile),
          uploadProgress: 1,
          isSuspended: false,
          cancelToken: source,
        });
        uploadFiles = [lastAcceptedFile];
        setFiles(newFiles);
      } else {
        newFiles = acceptedFiles.map(file => ({
          ...file,
          returnFilename: '',
          preview: URL.createObjectURL(file),
          uploadProgress: 1,
          isSuspended: false,
          cancelToken: source,
        }));
        currentFilesIndex = files.length;
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
      }

      const requests = uploadFiles.map((acceptedFile, acceptedFileIndex) => {
        const formData = new FormData();
        formData.append(fieldName, acceptedFile);

        const config: AxiosRequestConfig<FormData> = {
          cancelToken: source.token,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: progressEvent => {
            let percentComplete: number =
              progressEvent.loaded / progressEvent.total;
            percentComplete = percentComplete * 100;
            if (percentComplete >= 100) {
              percentComplete = 99;
            }
            setFiles(prevState => {
              const findIndex = acceptedFileIndex + currentFilesIndex;
              return prevState.map((file, index) => {
                if (index === findIndex && file.isSuspended === false) {
                  return { ...file, uploadProgress: percentComplete };
                }
                return { ...file };
              });
            });
          },
        };
        return axiosAdminClient.post(uploadUrl, formData, config);
      });

      const rawResponses = await Promise.allSettled(requests);
      console.log('rawResponses', rawResponses);
      if (maxFiles === 1) {
        const status = rawResponses[0].status;
        let filename: string = '';
        if (status === 'fulfilled') {
          filename = (
            rawResponses[0].value as AxiosResponse<FlagIconUploadResponse>
          ).data.data.filename;
          setFiles(prevState => {
            return prevState.map((file, index) => {
              if (index === 0 && file.isSuspended === false) {
                file.cancelToken.cancel();
                return {
                  ...file,
                  returnFilename: filename,
                  uploadProgress: 100,
                };
              }
              return { ...file };
            });
          });
        } else {
          const errorResponse = rawResponses[0].reason;
          if (!axios.isCancel(errorResponse)) {
            const errorMsg = (
              errorResponse.response as AxiosResponse<FlagIconUploadReject>
            ).data.data.flagIcon;
            setFiles(prevState => {
              return prevState.map((file, index) => {
                if (index === 0 && file.isSuspended === false) {
                  file.cancelToken.cancel();
                  return { ...file, error: errorMsg, uploadProgress: 100 };
                }
                return { ...file };
              });
            });
          }
        }
        // onUploadDone(filename);
      } else {
        const responses: string[] = rawResponses.map(
          (rawResponse, rawResponseIndex) => {
            const findIndex = rawResponseIndex + currentFilesIndex;
            if (rawResponse.status === 'fulfilled') {
              const returnFilename = (
                rawResponse.value as AxiosResponse<FlagIconUploadResponse>
              ).data.data.filename;
              setFiles(prevState => {
                return prevState.map((file, index) => {
                  if (index === findIndex && file.isSuspended === false) {
                    return {
                      ...file,
                      uploadProgress: 100,
                      returnFilename,
                    };
                  }
                  return { ...file };
                });
              });
            } else {
              setFiles(prevState => {
                return prevState.map((file, index) => {
                  if (index === findIndex && file.isSuspended === false) {
                    return {
                      ...file,
                      uploadProgress: 100,
                      error: (
                        rawResponse.reason
                          .response as AxiosResponse<FlagIconUploadReject>
                      ).data.data.flagIcon,
                    };
                  }
                  return { ...file };
                });
              });
            }

            return '';
          }
        );
      }
      if (isAllFilesUploadDone) {
        const responses = prepareUploadDoneFilenames();
        console.log('responses', responses);
        onUploadDone(responses);
      }
    },
    onDropRejected: rejectedFiles => {
      const errors: string[] = rejectedFiles.map(rejectedFile => {
        const fileName = rejectedFile.file.name;
        const errorString: string = rejectedFile.errors
          .map(error => error.message)
          .join(' & ');
        return `${fileName}: ${errorString}`;
      });
      setFilesErrors(errors);
    },
  });

  const fileStopUploadHandler = (fileIndex: number) => {
    setFiles(prevState => {
      return prevState.map((file, index) => {
        if (index === fileIndex && file.isSuspended === false) {
          file.cancelToken.cancel();
          console.log('cancel');
          return { ...file, returnFilename: '', isSuspended: true };
        }
        return { ...file };
      });
    });
    if (isAllFilesUploadDone) {
      const responses = prepareUploadDoneFilenames();
      console.log('responses', responses);
      onUploadDone(responses);
    }
  };

  const thumbs = files.map((file, index) => {
    return (
      !file.isSuspended && (
        <div key={index} style={{ marginTop: '16px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <img
              src={file.preview}
              alt={file.name}
              width="100"
              style={file.error ? { opacity: '0.5' } : undefined}
            />
            {file.error ? (
              <FormHelperText error>{file.error}</FormHelperText>
            ) : (
              <LinearProgressWithLabel progress={file.uploadProgress} />
            )}

            <Box sx={{ minWidth: 35, marginLeft: 'auto' }}>
              <IconButton onClick={() => fileStopUploadHandler(index)}>
                <ClearIcon fontSize="small" color="error" />
              </IconButton>
            </Box>
          </div>
        </div>
      )
    );
  });
  return (
    <>
      <FormControl
        sx={{
          flexDirection: 'column',
          '& fieldset': {
            borderStyle: 'dashed',
          },
        }}
        {...getRootProps({ className: 'dropzone' })}
      >
        <input {...getInputProps()} multiple={isMultiple} />
        {filesErrors.map((fileError, index) => (
          <Alert
            variant="outlined"
            severity="error"
            sx={{ mb: 1 }}
            key={`fileError${index}`}
          >
            {fileError}
          </Alert>
        ))}
        <TextField
          placeholder="Please drag and drop some files here, or click to select files"
          multiline
          disabled
          sx={{
            mr: 2,
          }}
          fullWidth
        />
      </FormControl>
      <FormControl
        sx={{
          flexDirection: 'column',
        }}
      >
        {thumbs}
      </FormControl>
    </>
  );
}
