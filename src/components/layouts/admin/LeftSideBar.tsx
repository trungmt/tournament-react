import { List } from '@mui/material';
import LeftSideBarItem from './LeftSideBarItem';
import sidebarConfig from './LeftSideBarConfig';

export function LeftSideBar() {
  return (
    <List
      sx={{
        paddingTop: { xs: 6, sm: 7, md: 8 },
        height: '100vh',
        position: 'sticky',
        top: 0,
        px: 0,
        backgroundColor: { xs: 'primary.main', md: '#fff' },
        borderRight: '1px solid #ece7e7',
        color: { xs: '#fff', md: '#637381' },
      }}
    >
      {sidebarConfig.map(config => (
        <LeftSideBarItem
          key={config.title}
          icon={config.icon}
          title={config.title}
          path={config.path}
        />
      ))}
    </List>
  );
}
