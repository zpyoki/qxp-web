import { validateDatasetElement } from '@c/form-builder/utils';

import RadioGroup from './radioGroup';
import DatasetConfig from '../../form-settings-panel/form-field-config/dataset-config';
import configSchema from './config-schema';
import { defaultConfig, toSchema, toConfig, RadioGroupConfig } from './convertor';

const RadioField: Omit<FormBuilder.SourceElement<RadioGroupConfig>, 'displayOrder'> = {
  displayName: '单选框',
  category: 'basic',
  icon: 'radio_button_checked',
  componentName: 'RadioGroup',
  component: RadioGroup,
  configSchema,
  defaultConfig: defaultConfig,
  toConfig,
  toSchema,
  compareOperators: ['==', '!=', '∈', '∉'],
  configDependencies: { DatasetConfig },
  validate: validateDatasetElement,
};

export default RadioField;
