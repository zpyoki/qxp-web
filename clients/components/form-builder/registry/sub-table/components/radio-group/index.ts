import { Radio } from '@formily/antd-components';

import configSchema from './config-schema';
import { defaultConfig, toSchema, toConfig, RadioGroupConfig } from './convertor';

const RadioField: Omit<FormBuilder.SourceElement<RadioGroupConfig>, 'displayOrder'> = {
  displayName: '单选框',
  category: 'basic',
  icon: 'radio_button_checked',
  componentName: 'RadioGroup',
  component: Radio.Group,
  configSchema,
  defaultConfig: defaultConfig,
  toConfig,
  toSchema,
};

export default RadioField;
