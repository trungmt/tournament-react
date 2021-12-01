import { Home } from '@mui/icons-material';
import LeftSideBarItem from './LeftSideBarItem';
import { styled } from '@mui/system';

const LeftSideBarContainerStyle = styled('div')(({ theme }) => {
  console.log(theme.palette);
  return {
    paddingTop: theme.spacing(8),
    height: '100vh',
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: '#fff',
    border: '1px solid #ece7e7',
    color: '#637381',
    [theme.breakpoints.down('md')]: {
      color: '#fff',
      backgroundColor: theme.palette.primary.main,
    },
  };
});

export function LeftSideBar() {
  return (
    <LeftSideBarContainerStyle>
      <LeftSideBarItem component={<Home fontSize="small" />} text="Homepage" />
      <LeftSideBarItem
        component={<Home fontSize="small" />}
        text="Tournaments"
      />
      <LeftSideBarItem component={<Home fontSize="small" />} text="Team" />
      <LeftSideBarItem component={<Home fontSize="small" />} text="Group" />
      <LeftSideBarItem component={<Home fontSize="small" />} text="Homepage" />
      <LeftSideBarItem component={<Home fontSize="small" />} text="Homepage" />
      <LeftSideBarItem component={<Home fontSize="small" />} text="Homepage" />
      <LeftSideBarItem component={<Home fontSize="small" />} text="Homepage" />
    </LeftSideBarContainerStyle>
  );
}
