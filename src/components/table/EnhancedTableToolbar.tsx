import {
  FormControl,
  InputAdornment,
  OutlinedInput,
  Toolbar,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  HighlightOff as ClearIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { object, SchemaOf, string } from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';

export interface SearchFormInput {
  query: string;
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  defaultQuery?: string;
  onSearchFormSubmit: (values: SearchFormInput) => void;
  onClearSearchForm: (value: string) => void;
}

export const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const { numSelected } = props;

  const SearchSchema: SchemaOf<SearchFormInput> = object({
    query: string().default('').label('Search Team'),
  });

  const formik = useFormik<SearchFormInput>({
    initialValues: {
      query: props.defaultQuery || '',
    },
    validationSchema: SearchSchema,
    onSubmit: props.onSearchFormSubmit,
  });

  const { handleSubmit, getFieldProps, values, setFieldValue } = formik;
  return (
    <Toolbar
      sx={{
        pl: { xs: 1, sm: 2 },
        pr: { xs: 1, sm: 1 },
        height: 96,
        ...(numSelected > 0 && {
          bgcolor: theme =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <FormikProvider value={formik}>
          <Form onSubmit={handleSubmit}>
            <FormControl
              sx={{ m: 1, width: '25ch', flexDirection: 'row' }}
              variant="outlined"
            >
              <OutlinedInput
                id="outlined-adornment-weight"
                aria-describedby="outlined-weight-helper-text"
                {...getFieldProps('query')}
                startAdornment={
                  <InputAdornment position="start">
                    {values.query ? (
                      <IconButton
                        sx={{ p: 0 }}
                        onClick={() => {
                          const emptyValue = '';
                          setFieldValue('query', emptyValue);
                          props.onClearSearchForm(emptyValue);
                        }}
                      >
                        <ClearIcon fontSize="small" color="primary" />
                      </IconButton>
                    ) : (
                      <SearchIcon fontSize="small" />
                    )}
                  </InputAdornment>
                }
                inputProps={{
                  'aria-label': 'weight',
                }}
                placeholder="Search team..."
                sx={{ mr: 2 }}
              />
            </FormControl>
          </Form>
        </FormikProvider>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </Toolbar>
  );
};
