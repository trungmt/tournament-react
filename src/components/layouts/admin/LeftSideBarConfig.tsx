import { SvgIcon, SvgIconTypeMap } from '@mui/material';
import { Home, Group, AccountTree } from '@mui/icons-material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { LeftSideBarItemProps } from './LeftSideBarItem';

const getIcon = (
  name: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
    muiName: string;
  }
) => <SvgIcon component={name} fontSize="small" />;
const sidebarConfig: LeftSideBarItemProps[] = [
  {
    title: 'Dashboard',
    icon: getIcon(Home),
    path: '/admin',
  },
  {
    title: 'Tournaments',
    icon: getIcon(AccountTree),
    path: '/admin/tournaments',
  },
  {
    title: 'Teams',
    icon: getIcon(Group),
    path: '/admin/teams',
  },
];

export default sidebarConfig;
