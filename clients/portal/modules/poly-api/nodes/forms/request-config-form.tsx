import React, { useState } from 'react';

import toast from '@lib/toast';
import PageLoading from '@c/page-loading';

import ApiSelector from './request-config/api-selector';
import ApiFormulaConfig from './request-config/api-formula';
import { useGetRequestNodeApi } from '../../effects/api/poly';
import ApiParamsConfig from './request-config/api-params-config';
import { convertToParamsConfig } from '../../utils/request-node';

function RequestConfigForm(): JSX.Element {
  const [apiPath, setApiPath] = useState('');

  const { data: apiDocDetail, isLoading, isSuccess, isError, error } = useGetRequestNodeApi({
    path: apiPath.slice(1),
    body: { docType: 'raw', titleFirst: true },
  }, { enabled: !!apiPath });

  if (isError) {
    toast.error(error?.message);
  }

  return (
    <>
      <ApiSelector
        setApiPath={setApiPath}
        apiDocDetail={apiDocDetail}
      />
      <div className="flex flex-1 border-t-1" style={{ height: 'calc(100% - 56px)' }}>
        {isLoading && <PageLoading />}
        {isSuccess && apiDocDetail && (
          <>
            <ApiParamsConfig configs={convertToParamsConfig(apiDocDetail)} />
            <ApiFormulaConfig />
          </>
        )}
        {( !apiPath || (isSuccess && !apiDocDetail)) && (
          <div className="m-auto flex flex-col items-center">
            <img src='/dist/images/no-approval-task.svg'/>
            <span className="mt-8 text-12 text-gray-400">暂无数据，请选择上方“全部API”选项</span>
          </div>
        )}
      </div>
    </>
  );
}
export default RequestConfigForm;
