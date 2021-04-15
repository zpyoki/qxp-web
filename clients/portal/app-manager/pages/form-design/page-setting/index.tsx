import React from 'react';

import AppPageData from '@appC/app-page-data';
import Button from '@c/button';
import Icon from '@c/icon';

import PageSettingConfig from './page-setting-config';

import './index.scss';

function PageSetting() {
  return (
    <>
      <div className='form-design-tool'>
        <Button modifier="primary">
          <Icon name="save" />
          保存表单
        </Button>
        <Button>
          <Icon name="preview" />
          预览
        </Button>
        <span className='text-underline-no-color cursor-pointer'>
          🎬 查看新手指引
        </span>
      </div>
      <div className='flex-1 flex overflow-hidden'>
        <div className='flex-1 p-20'>
          <p className='text-caption-no-color text-gray-400 mb-8'>预览页面视图</p>
          <AppPageData />
        </div>
        <PageSettingConfig />
      </div>
    </>
  );
}

export default PageSetting;
