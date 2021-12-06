import { Typography } from '@mui/material';

interface SearchNotFoundProps {
  searchQuery: string;
}
export default function SearchNotFound({
  searchQuery = '',
}: SearchNotFoundProps) {
  return (
    <>
      <Typography gutterBottom align="center" variant="subtitle1">
        No results found
      </Typography>
      {/* <Typography variant="body2" align="center">
        No results found
      </Typography> */}
    </>
  );
}
