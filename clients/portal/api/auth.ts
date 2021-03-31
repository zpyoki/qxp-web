import { QueryFunctionContext } from 'react-query';

import { httpPost, getNestedPropertyToArray } from '@lib/utils';
import { IDepartment } from '@states/portal';

// get user info
export interface UserInfo {
  id: string;
  userName: string;
  phone: string;
  email: string;
  userIconURL?: string;
  dep?: IDepartment;
  depIds?: string[];
  authority?: string[];
  roleId?: string;
  deleteId?: string;
  useStatus?: number;
  isDEPLeader?: number;
}
export const getUserInfo = async (): Promise<Partial<UserInfo>> => {
  const { data } = await httpPost<UserInfo>('/api/v1/org/userUserInfo');
  if (data) {
    data.depIds = getNestedPropertyToArray<string>(data?.dep, 'id', 'child');
  }
  return data || {};
};

// get all user funcs
export const getUserFuncs = async ({ queryKey }: QueryFunctionContext): Promise<string[]> => {
  const { data } = await httpPost<
    {
      tag: string[];
    }
  >(
    '/api/v1/goalie/listUserFuncTag',
    JSON.stringify({
      departmentID: queryKey[1],
    }),
  );
  return data?.tag || [];
};

// get system func list
export const getSystemFuncs = async (): Promise<string[]> => {
  const { data } = await httpPost<
    {
      tag: string[];
    }
  >('/api/v1/goalie/listFuncTag', JSON.stringify({}));
  return data?.tag || [];
};

export interface IRole {
  id: string;
  name: string;
  tag: string;
  roleID: string;
}
export const getUserRoles = async (
  userId: string,
  departmentIDs: string[],
): Promise<{ roles: IRole[]; total: number }> => {
  const { data } = await httpPost<
    {
      roles: IRole[];
      total: number;
    }
  >(
    '/api/v1/goalie/listUserRole',
    JSON.stringify({
      departmentID: departmentIDs,
    }),
    {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Id': userId,
    },
  );
  return data || { roles: [], total: 0 };
};
