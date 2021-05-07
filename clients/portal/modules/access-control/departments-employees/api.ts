import { httpPost } from '@lib/utils';
import httpClient from '@lib/http';

import { FormValues } from './modal/edit-employees-modal';
import { UserStatus } from './type';

interface TreeNode {
  id: string;
  departmentName: string;
  departmentLeaderId: string;
  useStatus: number;
  superId: string;
  child: TreeNode[];
  pid?: string;
}

// ------------------ 部门 ---------------
// 获取部门树
export const getERPTree = () => {
  return httpPost<Department>('/api/v1/org/DEPTree', null, {
    'Content-Type': 'application/x-www-form-urlencoded',
  }).then(({ data }) => data);
};

// 获取部门树
export const queryERPName = ({
  depID,
  depName,
}: {
  depID: string;
  depName: string;
}) => {
  return httpPost<{ isExist: 1 | -1 }>(
    '/api/v1/org/checkDEPIsExist',
    JSON.stringify({ depID, depName }),
    {
      'Content-Type': 'application/json',
    }
  );
};

/**
 * @returns 新增
 * @param departmentName true(true：必须 false：非必须)
 * @param departmentLeaderID false
 * @param pid true
 */
export const addDEP = () => {
  return httpPost<TreeNode[]>('/api/v1/org/addDEP', null, {
    'Content-Type': 'application/json',
  }).then(({ data }) => data);
};

/**
 * @returns 管理员查询详情
 * @param id true
 */
export const getAdminDEPInfo = () => {
  return httpPost<TreeNode[]>('/api/v1/org/adminDEPInfo', null, {
    'Content-Type': 'application/json',
  }).then(({ data }) => data);
};

/**
 * @returns 管理员分页查询
 * @param departmentName true
 * @param superPID false
 * @param pid false
 * @param page true
 * @param limit true
 */
export const getAdminDEPList = (id: string) => {
  return httpPost<TreeNode[]>(
    '/api/v1/org/adminDEPList',
    JSON.stringify({ id }),
    {
      'Content-Type': 'application/json',
    }
  ).then(({ data }) => data);
};

/**
 * @returns 管理员顶层查询部门列表
 * @param superPID true
 * @param page true
 * @param limit true
 */
export const getAdminDEPSuperPID = () => {
  return httpPost<TreeNode[]>(
    '/api/v1/org/adminDEPSuperPID',
    null,
    {
      'Content-Type': 'application/json',
    }
  ).then(({ data }) => data);
};

/**
 * @returns 管理员查询当前层级部门列表
 * @param useStatus false
 * @param pid true
 * @param page true
 * @param limit true
 */
export const getAdminDEPPID = () => {
  return httpPost<TreeNode[]>('/api/v1/org/adminDEPList', null, {
    'Content-Type': 'application/json',
  }).then(({ data }) => data);
};

/**
 * @returns 修改
 * @param id false
 * @param departmentName false
 * @param departmentLeaderID false
 * @param useStatus false
 * @param pid false
 */
export const updateDEP = () => {
  return httpPost<TreeNode[]>('/api/v1/org/updateDEP', null, {
    'Content-Type': 'application/json',
  }).then(({ data }) => data);
};

/**
 * @returns 删除
 * @param id true
 */
export const deleteDEP = (id: string) => {
  return httpPost<null>(
    '/api/v1/org/delDEP',
    JSON.stringify({ id }),
    {
      'Content-Type': 'application/json',
    }
  );
};

/**
 * @returns 用户查询部门详情
 * @param id true
 */
export const getUserDEPInfo = () => {
  return httpPost<TreeNode[]>('/api/v1/org/userDEPInfo', null, {
    'Content-Type': 'application/json',
  }).then(({ data }) => data);
};

/**
 * @returns 管理员分页（根据部门id获取人员列表）
 * @param id true
 */
export const getUserAdminInfo = (depID: string, params: any) => {
  // eslint-disable-next-line camelcase
  return httpPost<{ total_count: number; data: Employee[] }>(
    '/api/v1/org/adminUserList',
    JSON.stringify({ depID, ...params }),
    {
      'Content-Type': 'application/json',
    }
  ).then(({ data }) => ({
    total: data?.total_count || 0,
    data: data?.data || [],
  }));
};

/**
 * @returns 获取所有角色列表
 */
export const getUserTemplate = () => {
  return httpPost<{ fileURL: string }>(
    '/api/v1/org/getUserTemplate',
    null
  );
};

type Roles = {
  id: string;
  name: string;
  tag: string;
  roleID: string;
};

/**
 * @returns 获取所有角色列表
 */
export const getListRole = () => {
  return httpPost<{ roles: Roles[] }>('/api/v1/goalie/listRole', null, {
    'Content-Type': 'application/x-www-form-urlencoded',
  }).then(({ data }) => data?.roles);
};

/**
 * @returns 新增部门人员
 */
export const addDepUser = (values: FormValues) => {
  return httpPost<{ roles: Roles[] }>(
    '/api/v1/nurturing/addUser',
    JSON.stringify(values),
    {
      'Content-Type': 'application/json',
    }
  );
};

/**
 * @returns 修改用户信息
 */
export const updateUser = (values: FormValues) => {
  return httpPost<{ roles: Roles[] }>(
    '/api/v1/nurturing/updateUser',
    JSON.stringify(values),
    {
      'Content-Type': 'application/json',
    }
  );
};

export interface LeaderParams {
  depID: string;
  userID?: string;
}

/**
 * @returns 设为主管
 */
export const setDEPLeader = ({
  depID,
  userID,
}: LeaderParams) => {
  return httpPost<{ code: number }>(
    '/api/v1/org/setDEPLeader',
    JSON.stringify({ depID, userID }),
    {
      'Content-Type': 'application/json',
    }
  );
};

/**
 * @returns 取消主管
 */
export const cancelDEPLeader = ({
  depID,
}: LeaderParams) => {
  return httpPost<{ code: number }>(
    '/api/v1/org/cancelDEPLeader',
    JSON.stringify({ depID }),
    {
      'Content-Type': 'application/json',
    }
  );
};

/**
 * @returns 修改用户状态
 */
export const updateUserStatus = ({
  id,
  status,
}: {
  id: string;
  status: UserStatus;
}) => {
  return httpPost<{ code: number }>(
    '/api/v1/nurturing/updateUserStatus',
    JSON.stringify({ id, useStatus: status }),
    {
      'Content-Type': 'application/json',
    }
  );
};

/**
 * @returns 获取拥有者角色列表
 */
export const getUserRole = ({
  ownerID,
  type,
}: {
  ownerID: string;
  type: 1 | 2;
}) => {
  return httpPost<{ roles: Roles[] }>(
    '/api/v1/goalie/listOwnerRole',
    JSON.stringify({ ownerID, type }),
    {
      'Content-Type': 'application/json',
    }
  ).then(({ data }) => data?.roles);
};

/**
 * @returns
 */
export const batchAdjustDep = ({
  usersID,
  oldDepID,
  newDepID,
}: {
  usersID: string[];
  oldDepID: string;
  newDepID: string;
}) => {
  return httpPost<{ code: number }>(
    '/api/v1/org/adminChangeUsersDEP',
    JSON.stringify({ usersID, oldDepID, newDepID }),
    {
      'Content-Type': 'application/json',
    }
  );
};

/**
 * @returns 重置密码
 */
export const resetUserPWD = ({
  userIDs,
  sendEmail,
  sendPhone,
}: {
  userIDs: string[];
  sendEmail: -1 | 1;
  sendPhone: -1 | 1;
}) => {
  return httpPost<{ code: number }>(
    '/api/v1/nurturing/adminResetPWD',
    JSON.stringify({ userIDs, sendEmail, sendPhone }),
    {
      'Content-Type': 'application/json',
    }
  );
};

export type FileParams = {
  depID: string;
  file: File;
};

/**
 * @returns 导入
 */
export const importTempFile = ({ depID, file }: FileParams) => {
  return httpClient('/api/v1/org/importFile', { depID, file }, undefined, true);
};

export function createDepartment(params: {
  pid: string;
  departmentName: string;
}) {
  return httpPost('/api/v1/org/addDEP', JSON.stringify(params));
}

export function editDepartment(params: {
  pid: string;
  departmentName?: string;
  departmentLeaderID?: string;
}) {
  return httpPost('/api/v1/org/updateDEP', JSON.stringify(params));
}
