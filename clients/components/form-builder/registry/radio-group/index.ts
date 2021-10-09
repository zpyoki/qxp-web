import { validateDatasetElement } from '@c/form-builder/utils';
import DatasetConfig from '@c/form-builder/form-settings-panel/form-field-config/dataset-config';

import Placeholder from './placeholder';
import RadioGroup from './radioGroup';
import configSchema from './config-schema';
import { defaultConfig, toSchema, toConfig, RadioGroupConfig } from './convertor';

const RadioField: Omit<FormBuilder.SourceElement<RadioGroupConfig>, 'displayOrder'> = {
  displayName: '单选框',
  category: 'basic',
  icon: 'radio_button_checked',
  componentName: 'RadioGroup',
  placeholderComponent: Placeholder,
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
