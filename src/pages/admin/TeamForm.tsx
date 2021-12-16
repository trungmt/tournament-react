import { useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormControl, TextField, FormHelperText, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { Form, FormikProvider, useFormik } from 'formik';
import { object, string, SchemaOf } from 'yup';

import { AdminLayout, AdminMainContent } from '../../components';
import constants from '../../config/constants';
import FormPart from '../../components/form/FormPart';
import FileInput from '../../components/form/FileInput';
import { axiosClient } from '../../config/axios';
import AuthContext from '../../store/auth-context';
import axios, { AxiosError } from 'axios';

type TeamFormInput = Omit<ITeam, '_id'>;
interface TeamFormResponse extends CustomResponse {
  data: TeamFormInput;
}

export function AdminTeamFormPage() {
  const { accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const TeamSchema: SchemaOf<TeamFormInput> = object({
    name: string().required().label('Team Name'),
    permalink: string()
      .required()
      .matches(
        /^([a-zA-Z0-9]+-)*[a-zA-Z0-9]+$/,
        '${label} only accepts alphanumeric connected by dash'
      )
      .lowercase()
      .label('Permalink'),
    shortName: string().required().label('Short Name'),
    flagIcon: string().required().label('Flag Icon'),
  });

  const formik = useFormik<TeamFormInput>({
    initialValues: {
      name: 'Team Liquid',
      permalink: 'team-liquid',
      shortName: 'Liquid',
      flagIcon: '',
    },
    validationSchema: TeamSchema,
    onSubmit: async teamForm => {
      const axiosAdminClient = axiosClient(accessToken);
      try {
        await axiosAdminClient.post('/teams', teamForm);

        navigate('/admin/teams');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const formErrors = (error as AxiosError<TeamFormResponse>).response
            ?.data?.data;
          if (typeof formErrors !== 'undefined') {
            setErrors({
              name: formErrors.name,
              shortName: formErrors.shortName,
              permalink: formErrors.permalink,
              flagIcon: formErrors.flagIcon,
            });
          }
        }
        // TODO: handle outbound errors
      }
    },
  });

  const {
    handleSubmit,
    handleChange,
    getFieldProps,
    isSubmitting,
    values,
    touched,
    errors,
    setFieldValue,
    setErrors,
  } = formik;

  const flagIconUploadDoneHandler = useCallback(
    (filename: string) => {
      setFieldValue('flagIcon', filename);
    },
    [setFieldValue]
  );
  return (
    <AdminLayout>
      <AdminMainContent pageName="New Team" wrappedWithCard={false}>
        <FormikProvider value={formik}>
          <Form onSubmit={handleSubmit}>
            <FormPart formPartName="Basic details">
              <FormControl sx={{ flexDirection: 'column' }}>
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
              <FormControl sx={{ flexDirection: 'column', mt: 3 }}>
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
              <FormControl sx={{ flexDirection: 'column', mt: 3 }}>
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
                <FormHelperText>
                  {values.permalink &&
                    `${constants.SITE_URL}/teams/${values.permalink}`}
                </FormHelperText>
                <FormHelperText>
                  Permalink only accepts alphanumeric connected by dash
                </FormHelperText>
              </FormControl>
            </FormPart>
            <FormPart formPartName="Flag Icon">
              <FileInput
                maxFiles={1}
                uploadUrl="/teams/upload/flagIcon"
                fieldName="flagIcon"
                onUploadDone={flagIconUploadDoneHandler}
              />
              <FormHelperText error>
                {touched.flagIcon && errors.flagIcon}
              </FormHelperText>
            </FormPart>
            <Stack flexDirection="row" justifyContent="flex-end" mb={2}>
              <LoadingButton
                variant="contained"
                type="submit"
                size="large"
                loading={isSubmitting}
              >
                Create
              </LoadingButton>
            </Stack>
          </Form>
        </FormikProvider>
      </AdminMainContent>
    </AdminLayout>
  );
}
