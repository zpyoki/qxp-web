import React from 'react';
import moment from 'moment';

import SubTable from '@c/form-builder/registry/sub-table/preview';
import AssociatedRecords from '@c/form-builder/registry/associated-records/associated-records';
import { Schema } from '@formily/react-schema-renderer';

type Value = string | string[] | Record<string, unknown> | Record<string, unknown>[] | undefined;

type Props = {
  value: Value;
  className?: string;
  schema: Schema;
}

type Option = {
  value: string;
  label: string;
}

function getBasicValue(schema: Schema, value: Value): string {
  const format = schema['x-component-props']?.format || 'YYYY-MM-DD HH:mm:ss';
  switch (schema.type) {
  case 'label-value':
    return (([] as Record<string, unknown>[]).concat(value as Record<string, unknown>[]))
      .map((itm) => itm.label).join(',');
  case 'datetime':
    if (Array.isArray(value)) {
      return (value as string[]).map((value: string) => {
        return moment(value).format(format);
      }).join('-');
    }
    return moment(value).format(format);
  case 'string':
    if (schema.enum && schema.enum.length) {
      return (schema.enum.find(({ value }: any) => value === value) as Option)?.label || '';
    }

    return value as string;
  case 'array':
    if (schema.enum && schema.enum.length) {
      return (value as string[]).map((_value: string) => {
        if (!schema.enum) {
          return '';
        }

        const enumTmp = schema.enum[0];
        if (typeof enumTmp === 'object') {
          return (schema.enum.find(({ value }: any) => value === _value) as Option)?.label || '';
        }

        return _value;
      }).join(',');
    }

    return (value as Option[]).map(({ label }) => label).join(',');
  default:
    if (Array.isArray(value)) {
      return value.join(',');
    }

    if (typeof value === 'object' && value?.label) {
      return value?.label as string;
    }

    return value as string;
  }
}

function FormDataValueRenderer({ value, schema, className }: Props): JSX.Element {
  if (schema?.['x-component']?.toLowerCase() === 'subtable') {
    return (
      <SubTable
        value={value as Record<string, unknown>[]}
        schema={schema}
        readonly
      />
    );
  }

  if (schema?.['x-component']?.toLowerCase() === 'associatedrecords') {
    return (
      <AssociatedRecords
        readOnly
        props={schema}
        value={value}
      />
    );
  }

  return <span className={className}>{getBasicValue(schema, value)}</span>;
}

export default FormDataValueRenderer;