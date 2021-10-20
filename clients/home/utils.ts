import { omit, isEmpty } from 'lodash';

import schemaToFields, { schemaToMap } from '@lib/schema-convert';
import {
  FormDataRequestUpdateParamsRef,
  FormDataBody,
  SubTableUpdateData,
} from '@lib/http-client';
import { SYSTEM_FIELDS } from '@c/form-builder/constants';

type Values = Record<string, any>;

function parseDeleted(
  oldValue: Values[], newValue: Values[],
): string[] {
  return (oldValue || []).reduce<string[]>((acc, value) => {
    if (value?._id && !newValue.find(({ _id: id }) => id === value._id)) {
      return [...acc, value._id];
    }

    return acc;
  }, []);
}

export function formDataDiff(
  currentValues: Values,
  defaultValues: Values,
  schema: ISchema,
): Record<string, any> {
  const schemaMap = schemaToMap(schema);
  const resultValue: any = {};
  Object.entries(currentValues).forEach(([fieldKey, cValue]) => {
    if (SYSTEM_FIELDS.includes(fieldKey)) {
      return;
    }

    const oldValue = defaultValues[fieldKey];
    switch (schemaMap[fieldKey]?.['x-component']) {
    case 'OrganizationPicker':
    case 'UserPicker':
    case 'ImageUpload':
    case 'FileUpload': {
      const newValueStr = cValue ? (cValue as LabelValue[]).map(({ value }) => value).sort().join('') : '';
      const oldValueStr = oldValue ? (oldValue as LabelValue[]).map(({ value }) => {
        return value;
      }).sort().join('') : '';

      if (newValueStr !== oldValueStr) {
        resultValue[fieldKey] = cValue;
      }
      break;
    }
    case 'SubTable': {
      const deleted = parseDeleted(oldValue, cValue);
      const newValues: Values[] = [];
      const updatedValues = (cValue as Record<string, any>[]).reduce<Record<string, any>[]>((acc, _value) => {
        const _oldValue = ((oldValue || []) as Record<string, any>[]).find(({ _id }) => _id === _value._id);
        if (_oldValue) {
          const _newValue = formDataDiff(
            _value,
            _oldValue,
              (schemaMap[fieldKey].items || window[`schema-${fieldKey}`]) as ISchema,
          );

          return isEmpty(_newValue) ? acc : [...acc, { ..._newValue, _id: _value._id }];
        }

        !isEmpty(_value) && newValues.push(_value);
        return acc;
      }, []);

      if (newValues.length || deleted.length || updatedValues.length) {
        resultValue[fieldKey] = [newValues, deleted, updatedValues];
      }
      break;
    }
    case 'CheckboxGroup':
    case 'MultipleSelect':
    case 'AssociatedRecords': {
      if (oldValue?.sort().toString() !== cValue.sort().toString()) {
        resultValue[fieldKey] = cValue;
      }
      break;
    }
    case 'CascadeSelector':
    case 'AssociatedData': {
      if (cValue?.value !== oldValue?.value) {
        resultValue[fieldKey] = cValue;
      }
      break;
    }
    default:
      if (cValue !== oldValue) {
        resultValue[fieldKey] = cValue;
      }
      break;
    }
  });

  return resultValue;
}

function buildSubTableParams(
  type: string,
  valueList = [],
  ref?: FormDataRequestUpdateParamsRef,
): SubTableUpdateData {
  switch (type) {
  case 'create':
    return {
      new: valueList.map((value: Record<string, any>) => {
        return {
          entity: value,
          ref,
        };
      }),
    };
  case 'updated': {
    const [newValues = [], deleted = [], updatedValues = []] = valueList;
    return {
      new: (newValues as Record<string, any>[]).map((value) => {
        return {
          entity: value,
        };
      }),
      deleted: deleted,
      updated: (updatedValues as Record<string, any>[]).map((value) => {
        return {
          entity: omit(value, SYSTEM_FIELDS),
          query: {
            term: { _id: value._id },
          },
        };
      }),
    };
  }
  default:
    return {};
  }
}

function buildRef(
  schema: ISchema,
  type: string,
  values?: Record<string, any>,
): [FormDataRequestUpdateParamsRef, string[]] {
  const ref: FormDataRequestUpdateParamsRef = {};
  const refFields = schemaToFields(schema, (schemaField) => {
    return ['SubTable', 'Serial'].includes(schemaField['x-component'] || '');
  });

  if (refFields.length) {
    refFields.forEach(async (field) => {
      switch (field['x-component']) {
      case 'SubTable': {
        const { subordination, appID, tableID } = field?.['x-component-props'] || {};
        let _ref = {};
        if (subordination === 'foreign_table') {
          const [subRef] = buildRef(window[`schema-${field.id}`] as ISchema, type);
          _ref = subRef;
        }

        const _values = values?.[field.id].filter((_value: any) => {
          return !isEmpty(_value) || Array.isArray(_value);
        });

        if (_values.length) {
          ref[field.id] = {
            type: subordination || 'sub_table',
            appID,
            tableID,
            ...buildSubTableParams(type, _values, _ref),
          };
        }
      }
        break;
      case 'Serial':
        ref[field.id] = {
          type: 'serial',
        };
        break;
      }
    });
  }

  return [ref, refFields.map(({ id }) => id)];
}

export function buildFormDataReqParams(
  schema: ISchema,
  type: string,
  values?: Record<string, any>,
): FormDataBody {
  const [ref, omitFields] = buildRef(schema, type, values);

  const formDataResBody: FormDataBody = {};

  if (!isEmpty(ref)) {
    formDataResBody.ref = ref;
  }

  if (values) {
    formDataResBody.entity = omit(values, omitFields);
  }

  return formDataResBody;
}