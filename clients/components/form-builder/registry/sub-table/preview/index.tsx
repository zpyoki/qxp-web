import React, { useEffect, useState, JSXElementConstructor, ChangeEvent } from 'react';
import { ISchemaFieldComponentProps } from '@formily/react-schema-renderer';
import { Button } from 'antd';
import moment, { Moment } from 'moment';
import { Input, Radio, DatePicker, NumberPicker, Select } from '@formily/antd-components';
import {
  InternalFieldList as FieldList,
  FormItem,
} from '@formily/antd';

import logger from '@lib/logger';

import { getFormTableSchema } from '../config/api';

type Column = {
  title: string;
  dataIndex: string;
  component?: JSXElementConstructor<any>;
  props: Record<string, unknown>;
}

type Components = typeof components;

const components = {
  input: Input,
  radiogroup: Radio.Group,
  textarea: Input.TextArea,
  datepicker: DatePicker,
  numberpicker: NumberPicker,
  select: Select,
  multipleselect: Select,
};

interface Props extends ISchemaFieldComponentProps {
  props: {
    [key: string]: any;
    ['x-component-props']: {
      columns: string[];
      appID: string;
      tableID: string;
      subordination: 'foreign_table' | 'sub_table';
      tableName: string;
    }
  }
}

function SubTable(compProps: Props) {
  const [schemaData, setSchemaData] = useState<{tableID: string; schema: ISchema} | null>(null);
  const { schema: definedSchema, initialValue, mutators: ms, name } = compProps;
  const {
    tableID, appID, subordination, columns: definedColumns,
  } = compProps.props['x-component-props'];
  const isFromEmpty = subordination === 'sub_table';
  const isFromForeign = subordination === 'foreign_table';

  useEffect(() => {
    if (!isFromForeign || !appID || !tableID) {
      return;
    }
    getFormTableSchema<{schema: ISchema; tableID: string;}>({ appID, tableID }).then(setSchemaData);
  }, [tableID, appID]);

  const schema = (isFromEmpty ? definedSchema.items : schemaData?.schema) as ISchema;

  function buildColumnFromSchema(dataIndex: string, sc: ISchema) {
    const componentName = sc['x-component']?.toLowerCase() as keyof Components;
    const componentProps = sc['x-component-props'] || {};
    if (!components[componentName]) {
      logger.error('component %s is missing in subTable', componentName);
      return null;
    }
    return {
      title: sc.title as string,
      dataIndex,
      component: components[componentName],
      props: componentProps,
    };
  }

  const emptyRow: Record<string, string> = {};
  const columns: Column[] = Object.entries(schema?.properties || {}).reduce(
    (cur: Column[], next) => {
      const [key, sc] = next;
      const componentProps = sc['x-component-props'] || {};
      if ((isFromForeign && !definedColumns.includes(key)) || key === '_id') {
        return cur;
      }
      const newColumn = buildColumnFromSchema(key, sc);
      if (newColumn) {
        Object.assign(emptyRow, { [key]: sc.default || componentProps?.defaultValue });
        cur.push(newColumn);
      }
      return cur;
    }, []) as Column[];

  function getChangedValue(e: ChangeEvent<HTMLInputElement> | string | Moment) {
    let changedValue = '';
    if (moment.isMoment(e)) {
      changedValue = e.format('YYYY-MM-DD HH:mm:ss');
    } else if ((e as ChangeEvent<HTMLInputElement>).target) {
      changedValue = (e as ChangeEvent<HTMLInputElement>).target.value;
    } else {
      changedValue = e as string;
    }
    return changedValue;
  }

  if (!columns.length) {
    return null;
  }

  return (
    <FieldList
      name={name}
      initialValue={initialValue.length ? initialValue : [emptyRow]}
    >
      {({ state, mutators }) => {
        const onAdd = () => mutators.push();
        return (
          <div>
            {state.value.map((item: any, index: number) => {
              const onRemove = (index: number) => mutators.remove(index);
              const onItemChange = (
                e: ChangeEvent<HTMLInputElement> | string,
                dataIndex: string
              ) => {
                ms.change(state.value.map((vItem: any, idx: number) => {
                  if (index !== idx) {
                    return vItem;
                  }
                  return {
                    ...vItem,
                    [dataIndex]: getChangedValue(e),
                  };
                }));
              };
              return (
                <div key={index} className="flex items-start justify-between">
                  {columns.map(({ title, dataIndex, component, props }) => (
                    <FormItem
                      className="mr-8 mb-8"
                      key={dataIndex}
                      name={`${name}.${index}.${dataIndex}`}
                      component={component}
                      title={title}
                      props={props}
                      value={item?.[dataIndex] || undefined}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        onItemChange(e, dataIndex);
                      }}
                    />
                  ))}
                  <Button className="ml-10" onClick={onRemove.bind(null, index)}>
                    删除
                  </Button>
                </div>
              );
            })}
            <Button className="mt-12 mb-3" onClick={onAdd}>添加</Button>
          </div>
        );
      }}
    </FieldList>
  );
}

SubTable.isFieldComponent = true;

export default SubTable;