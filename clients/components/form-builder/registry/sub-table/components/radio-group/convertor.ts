import { generateRandomFormFieldID } from '../../../../utils';

export interface RadioGroupConfig {
  title: string;
  description?: string;
  displayModifier: FormBuilder.DisplayModifier;
  optionsLayout: 'horizontal' | 'vertical';
  required: boolean;
  availableOptions: Array<{ label: string; value: any; title: string }>,
}

export const defaultConfig: RadioGroupConfig = {
  title: '单选框',
  description: '',
  optionsLayout: 'horizontal',
  displayModifier: 'normal',
  required: false,
  availableOptions: [
    { label: '选项一', value: '选项一', title: '选项一' },
    { label: '选项二', value: '选项二', title: '选项二' },
    { label: '选项三', value: '选项三', title: '选项三' },
  ],
};

export function toSchema(value: typeof defaultConfig): FormBuilder.Schema {
  return {
    type: 'string',
    title: value.title,
    description: value.description,
    required: value.required,
    display: true,
    enum: value.availableOptions.map((option) => {
      return {
        ...option,
        value: option.value || generateRandomFormFieldID(),
        title: option.label,
        name: option.label,
      };
    }),
    'x-component': 'RadioGroup',
    // todo support optionsLayout
    ['x-component-props']: {
      name: value.title,
    },
    ['x-internal']: {
      permission: 3,
    },
  };
}

export function toConfig(schema: FormBuilder.Schema): RadioGroupConfig {
  let displayModifier: FormBuilder.DisplayModifier = 'normal';
  if (schema.readOnly) {
    displayModifier = 'readonly';
  } else if (!schema.display) {
    displayModifier = 'hidden';
  }

  return {
    title: schema.title as string,
    description: schema.description as string,
    displayModifier: displayModifier,
    // todo implement this
    optionsLayout: schema['x-component-props']?.layout as any,
    required: !!schema.required,
    // todo implement this
    // todo refactor this
    availableOptions: schema.enum as Array<{ label: string; value: any; title: string }> || [],
  };
}
