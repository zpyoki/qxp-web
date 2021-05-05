import React, { useEffect } from 'react';
import { Route, useParams } from 'react-router-dom';

import Header from './header';
import AppDetailsContent from './app-details-content';
import AppSetting from './app-setting';
import appDetailsStore from './store';

function AppDetails() {
  const { appId } = useParams<any>();

  useEffect(() => {
    appDetailsStore.fetchAppDetails(appId);
    return () => {
      appDetailsStore.clear();
    };
  }, [appId]);

  return (
    <div>
      <Header />
      <Route exact path='/apps/details/:appId' component={AppDetailsContent} />
      <Route path='/apps/details/:appId/setting' component={AppSetting} />
    </div>
  );
}

export default AppDetails;
