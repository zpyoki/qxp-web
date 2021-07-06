import React from 'react';
import Tab from '@c/tab';

import FormConfig from './form-config';
import FormFieldConfig from './form-field-config';

function FormSettingPanel() {
  return (
    <Tab
      strechNavs
      separator
      style={{ width: '296px' }}
      items={[
        {
          id: 'fieldAttr',
          name: '字段属性',
          content: (<FormFieldConfig />),
        },
        {
          id: 'formAttr',
          name: '表单配置',
          content: (<FormConfig />),
        }]}
    />
  );
}

export default FormSettingPanel;
