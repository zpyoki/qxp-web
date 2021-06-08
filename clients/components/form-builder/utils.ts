import { customAlphabet } from 'nanoid';
import { get } from 'lodash';

import { compareOperatorMap } from '@c/form-builder/constants';
import elements from './registry/elements';

const nanoid = customAlphabet('1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM', 8);

export function generateRandomFormFieldID(): string {
  return `field_${nanoid()}`;
}

export function wrapSchemaByMegaLayout(schema: ISchema): ISchema {
  const properties = get(schema, 'properties', {});
  const xInternal = get(schema, 'x-internal', { });
  const labelAlign = get(xInternal, 'labelAlign', 'right');
  // const columnsCount = get(xInternal, 'columns', 1);

  return {
    type: 'object',
    'x-internal': {
      ...xInternal,
      defaultValueFrom: 'customized',
    },
    properties: {
      FIELDs: {
        properties,
        type: 'object',
        'x-component': 'mega-layout',
        'x-component-props': {
          labelAlign,
          // grid: true,
          // columns: columnsCount,
          // autoRow: true,
        },
      },
    },
  };
}

export function getSourceElementOperator(elementName: string): FormBuilder.CompareOperator[] | undefined {
  return elements[elementName.toLocaleLowerCase()]?.compareOperators;
}

export function getCompareOperatorOptions(operators: FormBuilder.CompareOperator[]) {
  return operators.map((operator) => {
    return { label: compareOperatorMap[operator].title, value: operator };
  });
}
