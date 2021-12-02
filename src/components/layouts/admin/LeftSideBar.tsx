import { styled } from '@mui/system';
import { List } from '@mui/material';
import LeftSideBarItem from './LeftSideBarItem';
import sidebarConfig from './LeftSideBarConfig';

const LeftSideBarContainerStyle = styled(List)(({ theme }) => {
  console.log(theme.palette);
  return {
    paddingTop: theme.spacing(8),
    height: '100vh',
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: '#fff',
    border: '1px solid #ece7e7',
    color: '#637381',
    [theme.breakpoints.down('sm')]: {
      color: '#fff',
      backgroundColor: theme.palette.primary.main,
    },
  };
});

export function LeftSideBar() {
  return (
    <LeftSideBarContainerStyle>
      {sidebarConfig.map(config => (
        <LeftSideBarItem
          key={config.title}
          icon={config.icon}
          title={config.title}
          path={config.path}
        />
      ))}
    </LeftSideBarContainerStyle>
  );
}
