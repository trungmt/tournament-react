import { Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import { styled } from '@mui/system';

interface LeftSideBarItemProps {
  component: JSX.Element;
  text: string;
}

export default function LeftSideBarItem({
  component,
  text,
}: LeftSideBarItemProps) {
  const ItemContainerStyle = styled('div')(({ theme }) => {
    console.log(theme.palette);
    return {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'self-start',
      [theme.breakpoints.up('md')]: {
        cursor: 'pointer',
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(2.5),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
      },
      padding: theme.spacing(2),
      '&:hover': {
        backgroundColor: blue[50],
      },
    };
  });

  const ItemTextStyle = styled(Typography)(({ theme }) => ({
    marginLeft: theme.spacing(2),
    fontWeight: 300,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  }));

  return (
    <ItemContainerStyle>
      {component}
      <ItemTextStyle>{text}</ItemTextStyle>
    </ItemContainerStyle>
  );
}
