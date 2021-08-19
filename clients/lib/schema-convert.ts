import { isEmpty, cloneDeep, groupBy, isUndefined } from 'lodash';

import { Option } from '@flowEditor/forms/api';
import { quickSortObjectArray } from '@lib/utils';
import { numberTransform } from '@c/form-builder/utils';

type FilterFunc = (currentSchema: ISchema) => boolean;

export function schemaToOptions(schema?: ISchema, filterFunc?: FilterFunc): Option[] {
  return schemaToFields(schema, filterFunc).map((field: SchemaFieldItem) => ({
    label: field.title as string,
    value: field.id,
    type: field.type as string,
    isSystem: field['x-internal']?.isSystem,
  }));
}

export function schemaToMap(
  schema?: ISchema, filterFunc?: FilterFunc,
): Record<string, SchemaFieldItem> {
  const fields = schemaToFields(schema, filterFunc);
  return fields.reduce((fieldsMap: Record<string, SchemaFieldItem>, field: SchemaFieldItem) => {
    fieldsMap[field.fieldName] = field;
    return fieldsMap;
  }, {});
}

function sortFields(fields: SchemaFieldItem[]): SchemaFieldItem[] {
  const {
    true: systemFields, false: normalFields,
  } = groupBy(fields, (field) => !!field['x-internal']?.isSystem);
  const sorter = (arr: SchemaFieldItem[]): SchemaFieldItem[] => quickSortObjectArray('x-index', arr);
  return [...sorter(normalFields), ...sorter(systemFields)];
}

function schemaToFields(
  schema?: ISchema,
  filterFunc?: FilterFunc,
  fields: SchemaFieldItem[] = [],
): Array<SchemaFieldItem> {
  const { properties } = cloneDeep(schema || {});
  if (!properties || isEmpty(properties)) {
    return sortFields(fields);
  }

  const newProperties: ISchema = {
    properties: {},
  };

  Object.keys(properties).forEach((key) => {
    const currentSchema: ISchema = properties[key];
    const componentName = currentSchema['x-component']?.toLowerCase();

    if (!componentName) return;

    const parentField = currentSchema?.['x-internal']?.parentField;
    const tabIndex = currentSchema?.['x-internal']?.tabIndex;

    if (componentName === 'subtable') {
      const items = currentSchema.items as ISchema;
      if (items) {
        items.properties = schemaToMap(items, filterFunc);
      }
    }

    const field: SchemaFieldItem = {
      ...currentSchema,
      'x-index': numberTransform(currentSchema),
      fieldName: key,
      componentName: componentName || '',
      parentField,
      tabIndex,
      id: key,
    };

    if (currentSchema.properties && newProperties.properties) {
      newProperties.properties = Object.assign(newProperties.properties, currentSchema.properties);
    }

    if ((filterFunc && !filterFunc(currentSchema)) || currentSchema?.['x-internal']?.isLayoutComponent) {
      return;
    }

    fields.push(field);
  });

  return schemaToFields(newProperties, filterFunc, fields);
}

export function fieldsToSchema(fields: Array<SchemaFieldItem>): ISchema {
  const properties: Record<string, ISchema> = {};

  const { false: fieldsNoParent, true: fieldsWithParent } = groupBy(fields, (field) => !!field.parentField);

  fieldsNoParent?.forEach((field) => {
    const fileName = field.fieldName;
    properties[fileName] = {
      ...field,
      properties: {},
    };
  });

  fieldsWithParent?.forEach((field) => {
    const fileName = field.fieldName;
    const parentProperties = properties[field.parentField || '']?.properties;
    if (isUndefined(parentProperties)) return;
    parentProperties[fileName] = field;
  });

  return {
    type: 'object',
    title: '',
    properties,
  };
}

export default schemaToFields;
