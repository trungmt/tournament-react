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
  isInit: boolean;
  returnFilename: string;
  uploadProgress: number;
  isSuspended: boolean;
  cancelToken?: CancelTokenSource;
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
  tempImageURL: string;
  realImageURL: string;
  initialFiles?: string[];
  onUploadDone(
    addFiles: string | string[],
    deleteFiles: string | string[]
  ): void;
}

export default function FileInput({
  maxFiles,
  uploadUrl,
  fieldName,
  tempImageURL,
  realImageURL,
  initialFiles,
  onUploadDone,
}: FileInputProps) {
  const { accessToken } = useContext(AuthContext);
  const axiosAdminClient = axiosClient(accessToken);
  const isMultiple: boolean = maxFiles > 1;

  const [files, setFiles] = useState<ImageFile[]>([]);
  const [filesErrors, setFilesErrors] = useState<string[]>([]);
  const [isDropped, setIsDropped] = useState<boolean>(
    initialFiles ? false : true
  );

  useEffect(() => {
    if (!isDropped) return;
    const isAllFilesUploadDone =
      files.length > 0 &&
      files.every(
        file => file.isSuspended === true || file.uploadProgress === 100
      );

    if (isAllFilesUploadDone) {
      console.log('files', files);
      let addFiles: string | string[] = files
        .filter(
          file => file.isSuspended === false && file.returnFilename !== ''
        )
        .map(file => file.returnFilename);
      let deleteFiles: string | string[] = files
        .filter(file => file.isSuspended === true && file.isInit === true)
        .map(file => file.returnFilename);

      if (maxFiles === 1) {
        const addFilesLength = addFiles.length;
        addFiles = addFiles.length > 0 ? addFiles[addFilesLength - 1] : '';

        const deleteFilesLength = deleteFiles.length;
        deleteFiles =
          deleteFiles.length > 0 ? deleteFiles[deleteFilesLength - 1] : '';
      }
      console.log('addFiles', addFiles);
      console.log('deleteFiles', deleteFiles);
      onUploadDone(addFiles, deleteFiles);
    }
  }, [files, isDropped, maxFiles, onUploadDone]);

  useEffect(() => {
    if (isDropped === false && initialFiles) {
      const files = initialFiles.map(filename => {
        const fileObject = new File([], filename);
        return {
          ...fileObject,
          isInit: true,
          returnFilename: filename,
          preview: `${realImageURL}/${filename}`,
          uploadProgress: 100,
          isSuspended: false,
        };
      });
      setFiles(files);
    }
  }, [isDropped, initialFiles, realImageURL]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/jpeg, image/png, image/tiff, image/gif',
    maxFiles,
    onDrop: () => {},
    onDropAccepted: async acceptedFiles => {
      let newFiles: ImageFile[] = [];
      let currentFilesIndex: number = files.length;

      newFiles = acceptedFiles.map(file => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        return {
          ...file,
          returnFilename: '',
          isInit: false,
          preview: URL.createObjectURL(file),
          uploadProgress: 1,
          isSuspended: false,
          cancelToken: source,
        };
      });
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      if (maxFiles === 1) {
        console.log('fileStopUploadHandler');
        fileStopUploadHandler(files.length - 1);
      }
      setIsDropped(true);
      const requests = acceptedFiles.map((acceptedFile, acceptedFileIndex) => {
        const formData = new FormData();

        formData.append(fieldName, acceptedFile);

        const config: AxiosRequestConfig<FormData> = {
          cancelToken: newFiles[acceptedFileIndex].cancelToken!.token,
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
          const returnFilename = (
            rawResponse.value as AxiosResponse<FlagIconUploadResponse>
          ).data.data.filename;
          setFiles(prevState => {
            return prevState.map((file, index) => {
              if (index === findIndex && file.isSuspended === false) {
                URL.revokeObjectURL(file.preview);
                return {
                  ...file,
                  uploadProgress: 100,
                  returnFilename,
                  preview: `${tempImageURL}/${returnFilename}`,
                };
              }
              return { ...file };
            });
          });
        } else {
          setFiles(prevState => {
            return prevState.map((file, index) => {
              if (index === findIndex && file.isSuspended === false) {
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

  const fileStopUploadHandler = (fileIndex?: number) => {
    setIsDropped(true);
    setFiles(prevState => {
      return prevState.map((file, index) => {
        if (index === fileIndex && file.isSuspended === false) {
          if (file.cancelToken) {
            file.cancelToken!.cancel();
          }
          if (file.uploadProgress < 100) {
            URL.revokeObjectURL(file.preview);
          }

          return { ...file, isSuspended: true };
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
              <LinearProgressWithLabel
                progress={file.uploadProgress}
                sx={file.isInit ? { visibility: 'hidden' } : {}}
              />
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
