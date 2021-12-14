import React from 'react';
import { Select, Upload, SelectProps, Button } from 'antd';
import { Input } from '@formily/antd-components';
import {
  SchemaForm,
  useForm,
  FormButtonGroup,
  Submit,
} from '@formily/antd';

import toast from '@lib/toast';
import { setUserConfig, useGetUserConfig } from '@lib/configuration-center';

import { COLORS, COLOR_DEPTH, SCHEMA, DEFAULT_CONFIG } from './constant';

type UserStyleConfig = {
  primaryColor: string,
  titleIcon: string,
  favicons: string,
}

const KEY = 'user_style_config';

function ColorSelect({ value, onChange }: SelectProps<string>): JSX.Element {
  return (
    <Select value={value} onChange={onChange}>
      {COLORS.map((color) => (
        <Select.Option key={color} value={color}>
          <div style={{ color: `var(--${color}-500)` }}>
            <span
              style={{ backgroundColor: `var(--${color}-500)` }}
              className='inline-block w-10 h-10 mr-5'
            />
            {color}
          </div>
        </Select.Option>
      ))}
    </Select>
  );
}

function ImgUpload({ value, onChange }: any): JSX.Element {
  return (
    <Upload
      headers={{ 'X-Proxy': 'API' }}
      accept='image/png,image/jpeg,image/svg+xml'
      maxCount={1}
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      action="/api/v1/fileserver/uploadFile"
      onChange={({ file }) => {
        if (file.status === 'done') {
          onChange(file.response.data.url);
        }
      }}
    >
      {value ? <img src={value} alt="avatar" style={{ width: '100%' }} /> : 'Upload'}
    </Upload>
  );
}

export default function UserStyleConfig(): JSX.Element {
  const [userStyleConfig, loading] = useGetUserConfig(KEY, '0.1.0', DEFAULT_CONFIG);
  const form = useForm({
    initialValues: userStyleConfig,
    onSubmit: handleSave,
  });

  function handleSave(formData: UserStyleConfig): void {
    setUserConfig(formData, KEY, '0.1.0').then(() => {
      window.TENANT_CONFIG = formData;
      const favicon = document.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]');
      if (favicon) {
        favicon.href = formData.favicons;
      }

      COLOR_DEPTH.forEach((depth) => {
        document.documentElement.style.setProperty(
          `--primary-${depth}`,
          `var(--${formData.primaryColor}-${depth})`,
        );
      });
      toast.success('保存成功');
    });
  }

  function handleReset(): void {
    handleSave(DEFAULT_CONFIG);
    form.setFormState((state) => {
      state.values = DEFAULT_CONFIG;
    });
  }

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <div className='py-32'>
      <div className='mx-auto p-28 bg-white w-552 rounded-12'>
        <SchemaForm
          form={form as any}
          components={{ Input, ColorSelect, ImgUpload }}
          schema={SCHEMA}
        >
          <FormButtonGroup>
            <Submit>保存</Submit>
            <Button onClick={handleReset}>重置</Button>
          </FormButtonGroup>
        </SchemaForm>
      </div>
    </div>
  );
}