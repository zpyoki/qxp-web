import qs from 'qs';
import { useHistory, useLocation } from 'react-router-dom';

type SetSearch = (init?: string[][] | Record<string, string> | string | URLSearchParams) => void;

export function useURLSearch(): [URLSearchParams, SetSearch] {
  const search = new URLSearchParams(useLocation().search);
  const history = useHistory();
  const { pathname } = useLocation();
  function update(init?: string[][] | Record<string, string> | string | URLSearchParams): void {
    const query = qs.stringify(init);
    history.push(`${pathname}${query ? '?' : ''}${query}`);
  }

  return [search, update];
}
