import React, { useContext } from 'react';
import { LocaleProvider } from '@QCFE/lego-ui';
import { BrowserRouter as Router } from 'react-router-dom';

import { Loading } from './components/Loading';
import { AppContext, IContextValue } from '@clients/common/providers/context';

import locales from './locales';
import Routes from './routes';

export default function Application() {
  const { state } = useContext<IContextValue>(AppContext);

  return (
    <LocaleProvider locales={locales} currentLocale={state.siteLang}>
      <Router>
        <div className="min-h-screen bg-5976e01a">
          <React.Suspense fallback={<Loading className="min-h-screen" desc="加载中..." />}>
            <Routes />
          </React.Suspense>
        </div>
      </Router>
    </LocaleProvider>
  );
}
