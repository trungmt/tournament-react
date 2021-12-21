import { useState, useContext, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { NotFoundPage } from '..';
import FakeProgress from '../../components/ui/FakeProgress';

type TeamFormInput = Omit<ITeam, '_id' | 'flagIcon'> & {
  flagIconAdd: string;
  flagIconDelete?: string;
};
interface TeamFormResponse extends CustomResponse {
  data: TeamFormInput;
}

export function AdminTeamFormPage() {
  const { accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const { _id } = useParams();
  const [teamInfo, setTeamInfo] = useState<ITeam>({
    _id: '',
    name: '',
    permalink: '',
    shortName: '',
    flagIcon: '',
  });

  const [isTeamNotFound, setIsTeamNotFound] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const getTeam = useCallback(async (_id: string) => {
    setIsFetching(true);
    const axiosAdminClient = axiosClient(accessToken);
    try {
      const response = await axiosAdminClient.get<ITeam>(`/teams/${_id}`);
      const { name, permalink, shortName, flagIcon } = response.data;
      setTeamInfo({
        _id,
        name,
        permalink,
        shortName,
        flagIcon,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const { status } = (error as AxiosError<TeamFormResponse>).response!;

        if (status === 404) {
          setIsTeamNotFound(true);
        }
      }
      // TODO: handle outbound errors
    }
    setIsFetching(false);
  }, []);

  useEffect(() => {
    if (typeof _id !== 'undefined') {
      getTeam(_id);
    }
  }, [_id, getTeam]);

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
    flagIconAdd: _id
      ? string()
          .defined()
          .default('')
          .label('Flag Icon')
          .when('flagIconDelete', {
            is: (flagIconDelete: string) => {
              console.log('flagIconDelete', flagIconDelete);
              return flagIconDelete !== '';
            },
            then: string().required(),
            otherwise: string().defined(),
          })
      : string().required().label('Flag Icon'),
    flagIconDelete: string().default(''),
  });

  const formik = useFormik<TeamFormInput>({
    initialValues: {
      name: teamInfo.name,
      shortName: teamInfo.shortName,
      permalink: teamInfo.permalink,
      flagIconAdd: '',
    },
    validationSchema: TeamSchema,
    enableReinitialize: true,
    onSubmit: async teamForm => {
      const axiosAdminClient = axiosClient(accessToken);
      try {
        if (_id) {
          await axiosAdminClient.patch(`/teams/${_id}`, teamForm);
        } else {
          await axiosAdminClient.post('/teams', teamForm);
        }

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
              flagIconAdd: formErrors.flagIconAdd,
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

  // console.log('errors', errors);

  const flagIconUploadDoneHandler = useCallback(
    async (addFlagIcon: string, deleteFlagIcon: string) => {
      await setFieldValue('flagIconAdd', addFlagIcon);
      await setFieldValue('flagIconDelete', deleteFlagIcon);
    },
    [setFieldValue]
  );

  if (typeof _id !== 'undefined' && isTeamNotFound) {
    return (
      <NotFoundPage
        redirectUrl="/admin/teams"
        redirectLabel="Back to team list"
      />
    );
  }

  if (isFetching) {
    return <FakeProgress />;
  }
  return (
    <AdminLayout>
      <AdminMainContent
        pageName={_id ? 'Edit Team' : 'New Team'}
        wrappedWithCard={false}
      >
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
                tempImageURL={`${constants.DEFAULT_BACKEND_URL}/temp/teams`}
                realImageURL={`${constants.DEFAULT_BACKEND_URL}/teams`}
                initialFiles={
                  _id && teamInfo.flagIcon ? [teamInfo.flagIcon] : undefined
                }
                onUploadDone={flagIconUploadDoneHandler}
              />
              <FormHelperText error>{errors.flagIconAdd}</FormHelperText>
            </FormPart>
            <Stack flexDirection="row" justifyContent="flex-end" mb={2}>
              <LoadingButton
                variant="contained"
                type="submit"
                size="large"
                loading={isSubmitting}
              >
                {_id ? 'Edit' : 'Create'}
              </LoadingButton>
            </Stack>
          </Form>
        </FormikProvider>
      </AdminMainContent>
    </AdminLayout>
  );
}
