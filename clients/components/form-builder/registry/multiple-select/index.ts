import { Select } from '@formily/antd-components';

import configSchema from './config-schema';
import toSchema, { defaultConfig } from './to-schema';

const MultipleSelectField: Omit<FormItem<typeof defaultConfig>, 'displayOrder'> = {
  configSchema,
  itemName: '下拉复选框',
  icon: 'fact_check',
  defaultConfig: defaultConfig,
  toSchema,
  component: Select,
  category: 'basic',
  type: 'MultipleSelect',
};

export default MultipleSelectField;
