import {
  useState,
  useEffect,
  useCallback,
  useContext,
  ChangeEvent,
  MouseEvent,
} from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Pagination from '@mui/material/Pagination';
import { AdminLayout } from '../../components';
import AuthContext from '../../store/auth-context';
import {
  Button,
  Card,
  Container,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import { Add, Search, Delete as DeleteIcon } from '@mui/icons-material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import EnhancedTableHead, {
  HeadCell,
} from '../../components/table/EnhancedTableHead';
import FakeProgress from '../../components/ui/FakeProgress';
import { object, SchemaOf, string } from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';

interface ITeam {
  flagIcon: string;
  name: string;
  shortName: string;
  permalink: string;
}

interface SearchFormInput {
  query: string;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'name',
    numeric: false,
    disablePadding: false,
    label: 'Name',
  },
  {
    id: 'shortName',
    numeric: false,
    disablePadding: true,
    label: 'Short Name',
  },
  {
    id: 'permalink',
    numeric: false,
    disablePadding: true,
    label: 'Permalink',
  },
  {
    id: 'tool',
    numeric: false,
    disablePadding: true,
    label: '',
  },
];

interface EnhancedTableToolbarProps {
  numSelected: number;
  defaultQuery?: string;
  onSearchFormSubmit: (values: SearchFormInput) => void;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
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

  const { handleSubmit, getFieldProps } = formik;
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
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
                    <Search fontSize="small" />
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

function EnhancedTable() {
  const getIntegerFromSearchParams = (
    searchParams: string | null,
    defaultValue: number
  ): number => {
    if (searchParams === null) return defaultValue;

    const parseIntResult = parseInt(searchParams, 10);
    if (isNaN(parseIntResult) || parseIntResult < 0) return defaultValue;

    return parseIntResult;
  };
  const DEFAULT_PAGINATION_OPTIONS = [10, 15, 20];

  const [searchParams, setSearchParams] = useSearchParams();
  const limitQueryParams = searchParams.get('limit');
  const pageQueryParams = searchParams.get('page');
  const searchTextQueryParams = searchParams.get('query');

  const page = getIntegerFromSearchParams(pageQueryParams, 1);
  const rowsPerPage = getIntegerFromSearchParams(limitQueryParams, 10);
  const searchText = searchTextQueryParams || '';

  const [selected, setSelected] = useState<readonly string[]>([]);
  const [lastPage, setLastPage] = useState<number>(1);
  const [rows, setRows] = useState<ITeam[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const { accessToken } = useContext(AuthContext);
  const getTeamList = useCallback(async () => {
    // TODO: add search box
    // TODO: separate child components
    // TODO: make table content a separate component so that re-rendering only apply to table
    // TODO: add tool menu
    // TODO: handle no result case
    setIsFetching(true);
    try {
      let url = `http://localhost:3001/api/admin/teams?query=${searchText}&limit=${rowsPerPage}&page=${page}`;
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status !== 200) {
        console.log(response.status);
        return;
      }

      const paginationData: PaginationResult<ITeam> = await response.json();
      console.log('data', paginationData);
      setRows(paginationData.results);
      setLastPage(paginationData.lastPage);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  }, [page, rowsPerPage, searchText]);

  useEffect(() => {
    getTeamList();
  }, [getTeamList]);

  const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map(n => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleTableRowClick = (event: MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setSearchParams({
      query: searchText,
      limit: rowsPerPage.toString(),
      page: (newPage + 1).toString(),
    });
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      query: searchText,
      limit: parseInt(event.target.value, 10).toString(),
      page: '1',
    });
  };

  const searchFormSubmitHandler = ({ query }: SearchFormInput) => {
    setSearchParams({
      query,
      limit: rowsPerPage.toString(),
      page: page.toString(),
    });
  };

  const isSelected = (_id: string) => selected.indexOf(_id) !== -1;

  if (isFetching === true) {
    return <FakeProgress />;
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = rowsPerPage - rows.length;
  return (
    <Box sx={{ width: '100%' }}>
      <Container>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          my={5}
        >
          <Typography variant="h4" gutterBottom>
            Teams
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/admin/teams/add"
            startIcon={<Add />}
          >
            New Team
          </Button>
        </Stack>
        <Card sx={{ mb: 6 }}>
          <EnhancedTableToolbar
            defaultQuery={searchText}
            numSelected={selected.length}
            onSearchFormSubmit={searchFormSubmitHandler}
          />
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <EnhancedTableHead
                headCells={headCells}
                numSelected={selected.length}
                onSelectAllClick={handleSelectAllClick}
                rowCount={rows.length}
              />
              <TableBody>
                {rows.map((row, index) => {
                  const isItemSelected = isSelected(row.name);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.name}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          onClick={event => handleTableRowClick(event, row._id)}
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        id={labelId}
                        component="th"
                        scope="row"
                        align="left"
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <img
                            src={`http://localhost:3001/teams/${row.flagIcon}`}
                            width="30"
                            alt={row.name}
                          />
                          <Typography variant="subtitle2" noWrap>
                            {row.name}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell align="left" padding="none">
                        {row.shortName}
                      </TableCell>
                      <TableCell align="left" padding="none">
                        {row.permalink}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: 53 * emptyRows,
                    }}
                  >
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="flex-end"
            mr={3}
          >
            {rows.length > 0 ? (
              <Pagination
                count={lastPage}
                page={page}
                color="primary"
                onChange={handleChangePage}
                sx={{
                  my: 3,
                }}
              />
            ) : null}
            <InputLabel htmlFor="rows-per-page">Rows per page</InputLabel>
            <Select
              value={rowsPerPage.toString()}
              onChange={handleChangeRowsPerPage}
              displayEmpty
              size="small"
              inputProps={{ 'aria-label': 'Without label' }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={30}>30</MenuItem>
            </Select>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}

export function AdminTeamListPage() {
  return (
    <AdminLayout>
      <EnhancedTable />
    </AdminLayout>
  );
}
