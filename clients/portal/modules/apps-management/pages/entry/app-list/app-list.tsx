import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import PageLoading from '@c/page-loading';

import DeleteAppModal from './app-edit/del-app-modal';
import AppSetStatusModal from './app-edit/app-set-status-modal';
import AppItem from './app-item';
import SaveAppModal from './app-edit/app-save-modal';

type Props = {
  isLoading: boolean;
  appList: AppInfo[];
  openCreatedModal: () => void;
}

function AppList({ isLoading, appList, openCreatedModal }: Props) {
  const [modalType, setModalType] = useState('');
  const [curApp, setCurApp] = useState<AppInfo | null>(null);
  const history = useHistory();

  // const menus: MenuItem[] = [
  //   {
  //     key: 'publish',
  //     disabled: appInfo.useStatus < -1,
  //     label: (
  //       <div className="flex items-center">
  //         <Icon name="toggle_on" className="mr-4" />
  //         {appInfo.useStatus > 0 ? '下架应用' : '发布应用'}
  //       </div>
  //     ),
  //   },
  //   {
  //     key: 'visit',
  //     disabled: appInfo.useStatus < 0,
  //     label: (
  //       <div className='flex items-center'>
  //         <Icon name="login" className="mr-4" />
  //         访问应用
  //       </div>
  //     ),
  //   },
  //   {
  //     key: 'exportApp',
  //     disabled: appInfo.useStatus < -1,
  //     label: (
  //       <div className="flex items-center">
  //         <Icon name="save" className="mr-4" />
  //         导出应用
  //       </div>
  //     ),
  //   },
  //   {
  //     key: 'saveAsTemplate',
  //     disabled: appInfo.useStatus < -1,
  //     label: (
  //       <div className="flex items-center">
  //         <Icon name="save" className="mr-4" />
  //         保存为模版
  //       </div>
  //     ),
  //   },
  //   {
  //     key: 'delete',
  //     label: (
  //       <div className="flex items-center text-red-600">
  //         <Icon name="restore_from_trash" className="mr-4" />
  //         删除
  //       </div>
  //     ),
  //   },
  // ];

  const openModal = (_modalType: string, _curApp: AppInfo) => {
    setModalType(_modalType);
    setCurApp(_curApp);
  };

  const goDetails = (id: string) => {
    history.push(`/apps/details/${id}/page_setting`);
  };

  if (isLoading) {
    return <div className='relative flex-1'><PageLoading /></div>;
  }

  if (appList.length === 0) {
    return (
      <div className='app-no-data mt-58'>
        <img src='/dist/images/new_tips.svg' />
        <span>无应用数据。点击
          <span onClick={openCreatedModal} className='text-btn'>&nbsp;新建应用</span>
          ，开始构建应用
        </span>
      </div>
    );
  }

  return (
    <div className='app-list-container'>
      {appList.map((appInfo: AppInfo) => (
        <AppItem onClick={goDetails} key={appInfo.id} appInfo={appInfo} openModal={openModal} />
      ))}
      {modalType === 'delete' && curApp !== null && (
        <DeleteAppModal appInfo={curApp} onCancel={() => setModalType('')} />
      )}
      {modalType === 'publish' && curApp !== null && (
        <AppSetStatusModal
          status={curApp.useStatus > 0 ? 'soldOut' : 'publish'}
          appID={curApp.id}
          onCancel={() => setModalType('')}
        />
      )}
      {modalType === 'saveAsTemplate' && <SaveAppModal appInfo={curApp} onCancel={() => setModalType('')} />}
    </div>
  );
}

export default AppList;
