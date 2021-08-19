import React from 'react';
import zhCN from 'antd/lib/date-picker/locale/zh_CN';
import { DatePicker, Select, Input, InputNumber } from 'antd';

import { getPicker } from '@c/form-builder/registry/date-picker/date-picker';
import CascadeSelector, {
  DefaultValueFrom, CascadeSelectorProps,
} from '@c/form-builder/registry/cascade-selector/cascade-selector';
import OrganizationPicker from '@c/form-builder/registry/organization-select/organization-select';
import UserPicker from '@c/form-builder/registry/user-picker/user-picker';

type Props<T> = {
  field: ISchema;
  onChange: (value: T) => void;
  className?: string;
  value?: T;
  defaultValue?: T;
  style?: React.CSSProperties;
}

type Option = {
  label: string;
  value: string;
}

function FieldSwitch({ field, className, ...otherProps }: Props<any>, ref: React.Ref<any>): JSX.Element {
  switch (field['x-component']) {
  case 'CheckboxGroup':
  case 'Select':
  case 'RadioGroup':
  case 'MultipleSelect':
    return (
      <Select
        {...otherProps}
        value={otherProps.value || []}
        mode='multiple'
        className={`'w-full ${className}`}
        ref={ref}
        options={field?.enum as unknown as Option[] || []}
      />
    );
  case 'NumberPicker':
    return (
      <InputNumber
        {...field['x-component-props']}
        {...otherProps}
        className={className}
        ref={ref}
        type='number'
      />
    );
  case 'DatePicker':
    return (
      <DatePicker.RangePicker
        {...field['x-component-props']}
        {...otherProps}
        locale={zhCN}
        picker={getPicker(field['x-component-props']?.format)}
        ref={ref}
        className={`'w-full ${className}`}
      />
    );
  case 'CascadeSelector':
    return (
      <CascadeSelector
        {...otherProps}
        {...field['x-component-props'] as CascadeSelectorProps}
        predefinedDataset={field['x-internal']?.predefinedDataset || ''}
        showFullPath={field['x-internal']?.showFullPath}
        className={`'w-full ${className}`}
        defaultValueFrom={field['x-internal']?.defaultValueFrom as DefaultValueFrom}
      />
    );
  case 'OrganizationPicker':
    return (
      <OrganizationPicker
        {...field['x-component-props'] as { appID: string, placeholder?: string }}
        {...otherProps}
        multiple={field['x-internal']?.multiple}
        optionalRange={field['x-internal']?.optionalRange}
        rangeList={field['x-internal']?.rangeList}
      />
    );
  case 'UserPicker':
    return (
      <UserPicker
        {...field['x-component-props']}
        {...otherProps}
        className='flex-1'
        options={field.enum as Option[]}
        mode={field['x-internal']?.multiple}
        optionalRange={field['x-internal']?.optionalRange}
      />
    );
  default:
    return <Input {...otherProps} ref={ref} className={className} />;
  }
}

export default React.forwardRef(FieldSwitch);
