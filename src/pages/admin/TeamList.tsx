import TableCell from '@mui/material/TableCell';

import Typography from '@mui/material/Typography';
import { AdminLayout, AdminMainContent } from '../../components';
import { HeadCell } from '../../components/table/EnhancedTableHead';
import { EnhancedTable, IEntity } from '../../components/table/EnhancedTable';
import { Stack } from '@mui/material';
import constants from '../../config/constants';

interface ITeam extends IEntity {
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
    id: 'actions',
    numeric: false,
    disablePadding: true,
    label: 'Actions',
  },
];

const displayRowsHandler = (row: ITeam): JSX.Element => {
  return (
    <>
      <TableCell component="th" scope="row" align="left">
        <Stack direction="row" alignItems="center" spacing={2}>
          <img
            src={`${constants.DEFAULT_BACKEND_URL}/teams/${row.flagIcon}`}
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
    </>
  );
};
export function AdminTeamListPage() {
  return (
    <AdminLayout>
      <AdminMainContent pageName="Teams" addButtonLink="/admin/teams/add">
        <EnhancedTable
          headCells={headCells}
          listURLSegment="teams"
          displayRows={displayRowsHandler}
        />
      </AdminMainContent>
    </AdminLayout>
  );
}
