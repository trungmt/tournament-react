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
import DeleteIcon from '@mui/icons-material/Delete';
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
import { Add, Search } from '@mui/icons-material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import EnhancedTableHead, {
  HeadCell,
} from '../../components/table/EnhancedTableHead';
import FakeProgress from '../../components/ui/FakeProgress';

interface ITeam {
  flagIcon: string;
  name: string;
  shortName: string;
  permalink: string;
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
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const { numSelected } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
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
        <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
          <OutlinedInput
            id="outlined-adornment-weight"
            value={''}
            onChange={() => {}}
            aria-describedby="outlined-weight-helper-text"
            startAdornment={
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            }
            inputProps={{
              'aria-label': 'weight',
            }}
            placeholder="Search team..."
          />
        </FormControl>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const limitQueryParams = searchParams.get('limit');
  const pageQueryParams = searchParams.get('page');
  const searchQueryParams = searchParams.get('query');

  const [page, setPage] = useState(
    pageQueryParams ? parseInt(pageQueryParams, 10) : 1
  );
  const [rowsPerPage, setRowsPerPage] = useState(
    limitQueryParams ? parseInt(limitQueryParams, 10) : 10
  );
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
      const rowPerPageQuery = rowsPerPage || '';
      const pageQuery = page || '';
      let url = `http://localhost:3001/api/admin/teams?limit=${rowPerPageQuery}&page=${pageQuery}`;
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
  }, [rowsPerPage, page]);

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
      limit: rowsPerPage.toString(),
      page: newPage.toString(),
    });
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
    setSearchParams({});
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

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
          <EnhancedTableToolbar numSelected={selected.length} />
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
                      onClick={event => handleTableRowClick(event, row.name)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.name}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
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
