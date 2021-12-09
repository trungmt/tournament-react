import { useState, useEffect } from 'react';
import {
  FormControl,
  Grid,
  Stack,
  TextField,
  Typography,
  FormHelperText,
  Card,
} from '@mui/material';
import { Form, FormikProvider, useFormik } from 'formik';
import { AdminLayout, AdminMainContent } from '../../components';
import constants from '../../config/constants';
import { object, string, SchemaOf } from 'yup';
import { useDropzone } from 'react-dropzone';

interface ImageFile extends File {
  preview: string;
}
type TeamFormInput = Omit<ITeam, '_id'>;
export function AdminTeamFormPage() {
  const TeamSchema: SchemaOf<TeamFormInput> = object({
    name: string().required().label('Team Name'),
    permalink: string()
      .required()
      .matches(
        /^([a-zA-Z0-9]+-)*[a-zA-Z0-9]+$/,
        '${label} only accepts alphanumeric and dash'
      )
      .lowercase()
      .label('Permalink'),
    shortName: string().required().label('Short Name'),
    flagIcon: string().required().label('Flag Icon'),
  });

  const formik = useFormik<TeamFormInput>({
    initialValues: {
      name: '',
      permalink: '',
      shortName: '',
      flagIcon: '',
    },
    validationSchema: TeamSchema,
    onSubmit: () => {},
  });

  const {
    handleSubmit,
    handleChange,
    getFieldProps,
    values,
    touched,
    errors,
    setFieldValue,
  } = formik;

  const [flagIcon, setFlagIcon] = useState<ImageFile[]>([]);
  const [flagIconError, setFlagIconError] = useState<string>('');
  const [flagIconTouch, setFlagIconTouch] = useState<boolean>(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/jpeg, image/png, image/tiff, image/gif',
    maxFiles: 1,
    onDropAccepted: acceptedFiles => {
      setFlagIcon(
        acceptedFiles.map(file =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
    onDropRejected: rejectedFiles => {},
  });

  const thumbs = flagIcon.map(file => (
    <div key={file.name}>
      <div>
        <img src={file.preview} alt={file.name} />
      </div>
    </div>
  ));

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      flagIcon.forEach(file => URL.revokeObjectURL(file.preview));
    },
    [flagIcon]
  );

  return (
    <AdminLayout>
      <AdminMainContent pageName="New Team" wrappedWithCard={false}>
        <FormikProvider value={formik}>
          <Form onSubmit={handleSubmit}>
            <Card sx={{ mb: 4 }}>
              <Grid container sx={{ px: 3, py: 4 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6"> Basic details</Typography>
                </Grid>
                <Grid item xs={12} md={8} sx={{ pt: { xs: 3, md: 0 } }}>
                  <Stack>
                    <FormControl
                      sx={{ flexDirection: 'column' }}
                      variant="outlined"
                    >
                      <TextField
                        required
                        {...getFieldProps('name')}
                        label="Team Name"
                        placeholder="Team Name"
                        sx={{ mr: 2 }}
                        fullWidth
                        error={Boolean(touched.name && errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </FormControl>
                    <FormControl
                      sx={{ flexDirection: 'column', mt: 3 }}
                      variant="outlined"
                    >
                      <TextField
                        required
                        {...getFieldProps('shortName')}
                        label="Short Name"
                        placeholder="Short Name"
                        sx={{ mr: 2 }}
                        fullWidth
                        error={Boolean(touched.shortName && errors.shortName)}
                        helperText={touched.shortName && errors.shortName}
                      />
                    </FormControl>
                    <FormControl
                      sx={{ flexDirection: 'column', mt: 3 }}
                      variant="outlined"
                    >
                      <TextField
                        required
                        {...getFieldProps('permalink')}
                        onChange={event => {
                          handleChange(event);
                          setFieldValue(
                            'permalink',
                            event.target.value.replace(/\s/g, '-')
                          );
                        }}
                        label="Permalink"
                        placeholder="Permalink"
                        sx={{ mr: 2 }}
                        fullWidth
                        error={Boolean(touched.permalink && errors.permalink)}
                        helperText={touched.permalink && errors.permalink}
                      />
                      <FormHelperText>{`${constants.SITE_URL}/teams/${values.permalink}`}</FormHelperText>
                      <FormHelperText>
                        (Permalink only accepts alphanumeric and dash)
                      </FormHelperText>
                    </FormControl>
                  </Stack>
                </Grid>
              </Grid>
            </Card>

            <Card sx={{ mb: 4 }}>
              <Grid container sx={{ px: 3, py: 4 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6"> Flag Icon</Typography>
                </Grid>
                <Grid item xs={12} md={8} sx={{ pt: { xs: 3, md: 0 } }}>
                  <Stack>
                    <FormControl
                      sx={{
                        flexDirection: 'column',
                        border: '1px solid black',
                      }}
                      variant="outlined"
                      {...getRootProps({ className: 'dropzone' })}
                    >
                      <input {...getInputProps()} />
                      <p>
                        Drag 'n' drop some files here, or click to select files
                      </p>
                      {thumbs}
                      <FormHelperText color="error">
                        (Permalink only accepts alphanumeric and dash)
                      </FormHelperText>
                    </FormControl>
                  </Stack>
                </Grid>
              </Grid>
            </Card>
          </Form>
        </FormikProvider>
      </AdminMainContent>
    </AdminLayout>
  );
}
