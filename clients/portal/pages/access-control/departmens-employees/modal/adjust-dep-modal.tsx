import React, { createRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Modal, Icon, Form, Loading, Message } from '@QCFE/lego-ui';

import DepartmentPicker from '@c/tree-picker';
import Button from '@c/button';
import { UserInfo } from '@net/auth';
import { departmentToTreeNode } from '@lib/utils';
import { getERPTree, batchAdjustDep } from '@net/corporate-directory';

import { BatchDepParams } from '../employees';

interface IAdjustDepModalProps {
  userList: UserInfo[];
  closeModal(): void;
}

export default function AdjustDepModal({ userList, closeModal }: IAdjustDepModalProps) {
  const formRef = createRef<Form>();
  const queryClient = useQueryClient();

  const { data: depData, isLoading } = useQuery('GET_ERP_TREE', getERPTree, {
    refetchOnWindowFocus: false,
  });

  const depMutation = useMutation(batchAdjustDep, {
    onSuccess: (res) => {
      if (res && res.code === 0) {
        Message.success('操作成功');
        closeModal();
        queryClient.invalidateQueries('GET_USER_ADMIN_INFO');
      } else {
        Message.error('操作失败');
        closeModal();
      }
    },
  });

  const handleSubmit = () => {
    if (!formRef.current?.validateForm()) {
      return;
    }

    const isHaveLeader = userList.find((user) => user.isDEPLeader === 1);
    if (isHaveLeader) {
      Message.error('当前已选择员工列表中存在部门主管，不能参与调整部门！');
      return;
    }
    const params: BatchDepParams = {
      usersID: [],
      oldDepID: '',
      newDepID: '',
    };

    const values = formRef.current?.getFieldsValue();
    if (!values?.pid) {
      Message.error('请选择部门');
      return;
    }

    params.newDepID = values.pid;
    params.oldDepID = (userList && userList[0] && userList[0].dep?.id) || '';
    userList.forEach((user) => params.usersID.push(user.id));
    depMutation.mutate(params);
  };

  return (
    <Modal
      visible
      title="调整部门"
      className="static-modal"
      onCancel={closeModal}
      footer={
        <div className="flex items-center">
          <Button
            icon={<Icon name="close" className="mr-4" />} onClick={closeModal}
            className="mr-20"
          >
            取消
          </Button>
          <Button
            className="bg-black-900"
            textClassName="text-white"
            icon={<Icon name="check" type="light" className="mr-4" />}
            onClick={handleSubmit}
          >
            确定
          </Button>
        </div>
      }
    >
      <div className="w-full">
        <div className="w-full">
          <p className="text-gray-600 text-14">已选择员工</p>
          <ul className="flex items-center flex-wrap">
            {userList.map((user) => {
              return (
                <li key={user.id} className="rounded-tl-4 rounded-br-4
                px-8 bg-blue-200 mr-8 mb-8 whitespace-nowrap">
                  <span className="text-blue-600 text-14">{user.userName}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <Form layout="vertical" ref={formRef}>
          {isLoading ? (
            <Loading />
          ) : (
            <DepartmentPicker
              treeData={departmentToTreeNode(depData as Department)}
              labelKey="departmentName"
              name="pid"
              required
              label="选择要调整的部门"
              closeOnSelect
              help="请选择部门"
              toggleable={false}
            />
          )}
        </Form>
      </div>
    </Modal>
  );
}
