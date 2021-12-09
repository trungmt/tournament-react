interface PaginationResult<T = any> {
  results: T[];
  count: number;
  current: number | null;
  lastPage: number;
  limit: number;
  previous: number | null;
  next: number | null;
}

interface IEntity {
  _id: string;
}

interface ITeam extends IEntity {
  flagIcon: string;
  name: string;
  shortName: string;
  permalink: string;
}
