import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { inject } from 'mobx-react';

import More from '@c/more';
import Icon from '@c/icon';

import BgIcon from '../bg-icon';
import AppInfoView from '../app-info-view';

type Props = {
  appDetailsStore?: any
  appListStore?: any
}

function AppDropdown({ appDetailsStore, appListStore }: Props) {
  const history = useHistory();
  useEffect(() => {
    appListStore.fetchAppList();
  }, []);

  const handleChange = (appId: string) => {
    history.replace(`/appManager/details/${appId}`);
  };

  const appListItems: JSX.Element[] = React.useMemo(() => {
    return appListStore.appList.map((appInfo: AppInfo) => (
      <div
        className='app-global-header-drop-item'
        key={appInfo.id}
        onClick={() => handleChange(appInfo.id)}
      >
        <AppInfoView appInfo={appInfo} />
      </div>
    ));
  }, [appListStore.appList]);

  const { appIcon = '', useStatus, appName } = appDetailsStore.appDetails;
  const { bgColor, iconName } = (appIcon ? JSON.parse(appIcon) : {}) as AppIcon;

  return (
    <More contentClassName='app-global-header-drop-more' items={appListItems}>
      <div className='flex items-center cursor-pointer app-global-header-cur-app'>
        <BgIcon className='mr-8' size={32} bgColor={bgColor} iconName={iconName} iconSize={20} />
        <span>{appName}</span>
        <span className='ml-6 text-gray-500 mr-4'>({useStatus > 0 ? '已发布' : '未发布'})</span>
        <Icon name='expand_more' size={20} />
      </div>
    </More>
  );
}

export default inject('appDetailsStore')(inject('appListStore')(AppDropdown));
