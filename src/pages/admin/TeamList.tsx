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
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { AdminLayout } from '../../components';
import AuthContext from '../../store/auth-context';

interface ITeam {
  flagIcon: string;
  name: string;
  shortName: string;
  permalink: string;
}

// const rows: Data[] = [];
// function createData(
//   flagIcon: string,
//   name: string,
//   shortName: string,
//   permalink: string
// ): ITeam {
//   return {
//     flagIcon,
//     name,
//     shortName,
//     permalink,
//   };
// }

// const rows = [
//   createData(
//     'https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Flag_of_England.svg/1200px-Flag_of_England.svg.png',
//     'England',
//     'ENG',
//     'endland'
//   ),
//   createData(
//     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Flag_of_France_%281794%E2%80%931815%2C_1830%E2%80%931958%29.svg/1280px-Flag_of_France_%281794%E2%80%931815%2C_1830%E2%80%931958%29.svg.png',
//     'France',
//     'FRA',
//     'france'
//   ),
//   createData(
//     'https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Flag_of_Germany.svg/1200px-Flag_of_Germany.svg.png',
//     'Germany',
//     'GER',
//     'germany'
//   ),
// ];
interface HeadCell {
  disablePadding: boolean;
  id: keyof ITeam;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'flagIcon',
    numeric: false,
    disablePadding: false,
    label: 'Flag',
  },
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
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
];

interface EnhancedTableProps {
  numSelected: number;
  onSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, numSelected, rowCount } = props;

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

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
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Teams
        </Typography>
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
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [rows, setRows] = useState<ITeam[]>([]);

  const { accessToken } = useContext(AuthContext);
  const getTeamList = useCallback(async () => {
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
    } catch (error) {
      console.log(error);
    }
  }, [accessToken, rowsPerPage, page]);

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

  const handleClick = (event: MouseEvent<unknown>, name: string) => {
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
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <EnhancedTableToolbar numSelected={selected.length} />
      <TableContainer>
        <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
          <EnhancedTableHead
            numSelected={selected.length}
            onSelectAllClick={handleSelectAllClick}
            rowCount={rows.length}
          />
          <TableBody>
            {/* if you don't need to support IE11, you can replace the `stableSort` call with:
              rows.slice().sort(getComparator(order, orderBy)) */}
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const isItemSelected = isSelected(row.name);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={event => handleClick(event, row.name)}
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
                    <TableCell align="left">
                      <img
                        src={`http://localhost:3001/teams/${row.flagIcon}`}
                        width="30"
                        alt={row.name}
                      />
                    </TableCell>
                    <TableCell
                      id={labelId}
                      align="left"
                      scope="row"
                      padding="none"
                    >
                      {row.name}
                    </TableCell>

                    <TableCell align="left">{row.shortName}</TableCell>
                    <TableCell align="left">{row.permalink}</TableCell>
                  </TableRow>
                );
              })}
            {emptyRows > 0 && (
              <TableRow
                style={{
                  height: 53 * emptyRows,
                }}
              >
                <TableCell colSpan={5} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[2, 3, 5]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
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
