import { useState, useContext, useEffect } from 'react';
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

  useEffect(() => {
    const isAllFilesUploadDone =
      files.length > 0 &&
      files.every(
        file => file.isSuspended === true || file.uploadProgress === 100
      );

    if (isAllFilesUploadDone) {
      let prepareUploadDoneFilenames: string | string[] = files
        .filter(
          file => file.isSuspended === false && file.returnFilename !== ''
        )
        .map(file => file.returnFilename);

      if (maxFiles === 1) {
        const length = prepareUploadDoneFilenames.length;
        prepareUploadDoneFilenames =
          prepareUploadDoneFilenames.length > 0
            ? prepareUploadDoneFilenames[length - 1]
            : '';
      }
      console.log('prepareUploadDoneFilenames', prepareUploadDoneFilenames);
      onUploadDone(prepareUploadDoneFilenames);
    }
  }, [files, maxFiles, onUploadDone]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/jpeg, image/png, image/tiff, image/gif',
    maxFiles,
    onDrop: () => {
      if (maxFiles === 1) {
        fileStopUploadHandler(0);
      }
    },
    onDropAccepted: async acceptedFiles => {
      let newFiles: ImageFile[] = [];
      let currentFilesIndex: number = files.length;

      newFiles = acceptedFiles.map(file => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        return {
          ...file,
          returnFilename: '',
          preview: URL.createObjectURL(file),
          uploadProgress: 1,
          isSuspended: false,
          cancelToken: source,
        };
      });
      setFiles(prevFiles => [...prevFiles, ...newFiles]);

      const requests = acceptedFiles.map((acceptedFile, acceptedFileIndex) => {
        const formData = new FormData();

        formData.append(fieldName, acceptedFile);

        const config: AxiosRequestConfig<FormData> = {
          cancelToken: newFiles[acceptedFileIndex].cancelToken.token,
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
      rawResponses.forEach((rawResponse, rawResponseIndex) => {
        const findIndex = rawResponseIndex + currentFilesIndex;
        if (rawResponse.status === 'fulfilled') {
          console.log('fulfilled');
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
                console.log('rejected');
                const error = (
                  rawResponse.reason
                    .response as AxiosResponse<FlagIconUploadReject>
                ).data.data.flagIcon;
                return {
                  ...file,
                  uploadProgress: 100,
                  error,
                };
              }
              return { ...file };
            });
          });
        }
      });
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
    console.log('fileStopUploadHandler');
    setFiles(prevState => {
      return prevState.map((file, index) => {
        if (index === fileIndex && file.isSuspended === false) {
          file.cancelToken.cancel();
          return { ...file, returnFilename: '', isSuspended: true };
        }
        return { ...file };
      });
    });
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
