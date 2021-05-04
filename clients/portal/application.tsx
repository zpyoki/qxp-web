import React from 'react';
import { LocaleProvider } from '@QCFE/lego-ui';
import { BrowserRouter as Router } from 'react-router-dom';

import GlobalHeader from './global-header';
import Loading from '@c/loading';

import locales from './locales';
import Routes from './routes';

// ensure web socket connection
// todo how about on app-management page?
import '@lib/push';

export default function Application() {
  return (
    <LocaleProvider locales={locales} >
      <Router>
        <GlobalHeader />
        <React.Suspense fallback={<Loading className="w-screen h-screen" desc="加载中..." />}>
          <Routes />
        </React.Suspense>
      </Router>
    </LocaleProvider>
  );
}
