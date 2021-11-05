import React from 'react';

import Tab from '@c/tab';

import ManagePermission from './manage-permission';
import UserPermission from '../users-and-permissions';

function AppControl(): JSX.Element {
  return (
    <div className="flex-1 h-full opacity-95 access-control">
      <Tab
        strechNavs={false}
        separator={false}
        navsClassName="overflow-auto nav-background-image"
        navTitleClassName="text-12"
        className="corner-8-8-0-0"
        contentClassName="control-content"
        items={[
          {
            id: 'homePermission',
            name: '访问端权限',
            content: (<UserPermission />),
          },
          {
            id: 'managePermission',
            name: '管理端权限',
            content: (<ManagePermission />),
          }]}
      />
    </div>
  );
}

export default AppControl;
