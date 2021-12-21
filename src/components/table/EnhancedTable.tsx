import {
  useState,
  useEffect,
  useCallback,
  useContext,
  ChangeEvent,
  MouseEvent,
} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';

import Checkbox from '@mui/material/Checkbox';
import MoreMenu from '../../components/table/MoreMenu';
import AuthContext from '../../store/auth-context';
import { TablePagination } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import EnhancedTableHead, {
  HeadCell,
} from '../../components/table/EnhancedTableHead';
import FakeProgress from '../../components/ui/FakeProgress';
import SearchNotFound from '../../components/table/SearchNotFound';
import { getIntegerFromSearchParams } from '../../utils/searchParams';
import {
  EnhancedTableToolbar,
  SearchFormInput,
} from '../../components/table/EnhancedTableToolbar';
import { axiosClient } from '../../config/axios';
import constants from '../../config/constants';

interface EnhancedTableProps<T> {
  headCells: readonly HeadCell[];
  listURLSegment: string;
  displayRows: (row: T) => JSX.Element;
}

export function EnhancedTable<T extends IEntity>({
  headCells,
  listURLSegment,
  displayRows,
}: EnhancedTableProps<T>) {
  const DEFAULT_PAGINATION_OPTIONS = constants.DEFAULT_PAGING_OPTIONS;

  const [searchParams, setSearchParams] = useSearchParams();
  const limitQueryParams = searchParams.get('limit');
  const pageQueryParams = searchParams.get('page');
  const searchTextQueryParams = searchParams.get('query');

  const page = getIntegerFromSearchParams(pageQueryParams, 1);
  const rowsPerPage = getIntegerFromSearchParams(limitQueryParams, 10);
  const searchText = searchTextQueryParams || '';

  const [selected, setSelected] = useState<readonly string[]>([]);
  const [lastPage, setLastPage] = useState<number>(1);
  const [count, setCount] = useState<number>(0);
  const [rows, setRows] = useState<T[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const { accessToken } = useContext(AuthContext);
  const getList = useCallback(async () => {
    // TODO: handle error
    setIsFetching(true);
    try {
      const axiosAdminClient = axiosClient(accessToken);
      let url = `/${listURLSegment}?query=${searchText}&limit=${rowsPerPage}&page=${page}`;
      const response = await axiosAdminClient.get<PaginationResult<T>>(url);

      const paginationData = response.data;
      setRows(paginationData.results);
      setLastPage(paginationData.lastPage);
      setCount(paginationData.count);
    } catch (error) {
      console.log(error);
      // console.log(response.status);
    } finally {
      setIsFetching(false);
    }
  }, [page, rowsPerPage, searchText, listURLSegment]);

  useEffect(() => {
    getList();
  }, [getList]);

  const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map(n => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleTableRowClick = (event: MouseEvent<unknown>, _id: string) => {
    const selectedIndex = selected.indexOf(_id);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, _id);
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
      page: '1',
    });
  };

  const clearSearchFormHandler = (query: string) => {
    setSearchParams({
      query,
      limit: rowsPerPage.toString(),
      page: '1',
    });
  };

  const isSelected = (_id: string) => selected.indexOf(_id) !== -1;

  const isEmpty = rows.length === 0;
  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = isEmpty ? 0 : rowsPerPage - rows.length;

  const listTable = (
    <>
      <EnhancedTableToolbar
        defaultQuery={searchText}
        numSelected={selected.length}
        onSearchFormSubmit={searchFormSubmitHandler}
        onClearSearchForm={clearSearchFormHandler}
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
            {rows.map((row: T, index) => {
              const isItemSelected = isSelected(row._id);
              const labelId = `enhanced-table-checkbox-${row._id}`;

              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row._id}
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
                  {displayRows(row)}
                  <TableCell align="left" padding="none">
                    <MoreMenu _id={row._id} />
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
                <TableCell colSpan={headCells.length} />
              </TableRow>
            )}
          </TableBody>

          {isEmpty && (
            <TableBody>
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={headCells.length}
                  sx={{ py: 3 }}
                >
                  <SearchNotFound searchQuery={searchText} />
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
      {count > 0 && (
        <TablePagination
          rowsPerPageOptions={DEFAULT_PAGINATION_OPTIONS}
          component="div"
          count={count}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </>
  );
  return (
    <>
      {isFetching === true && <FakeProgress />}
      {listTable}
    </>
  );
}
