import React, { useContext, useEffect } from 'react';
import { Radio, RadioChangeEvent } from 'antd';
import { ISchemaFieldComponentProps } from '@formily/react-schema-renderer';
import { useMutation } from 'react-query';

import { ActionsContext, StoreContext } from '../context';
import { createBlankFormTable } from '../api';
import { LINKED_TABLE } from '../constants';

export type SubordinationType = 'sub_table' | 'foreign_table';

function Subordination({ value, mutators, props }: ISchemaFieldComponentProps): JSX.Element {
  const { actions } = useContext(ActionsContext);
  const { appID } = useContext(StoreContext);

  const runnerMap: Record<SubordinationType, (reset?: boolean) => void> = {
    sub_table: onSubTable,
    foreign_table: onForeignTable,
  };

  useEffect(() => {
    value === 'sub_table' && onSubTable(false);
  }, []);

  const createTableMutation = useMutation(createBlankFormTable, {
    onSuccess: (data) => {
      if (!data?.tableID) {
        return;
      }
      actions.getFieldState('Fields.linkedTable', (state) => {
        actions.setFieldState('Fields.linkedTable', (st) => {
          st.value = Object.assign(state.value || LINKED_TABLE, { tableID: data.tableID });
          if (!st.value?.appID) {
            st.value = Object.assign(st.value, { appID });
          }
        });
      });
    },
  });

  function onSubTable(reset = true): void {
    actions.getFieldState('Fields.linkedTable', (state) => {
      if (state.tableID) {
        return;
      }
      createTableMutation.mutate({ appID });
      reset && actions.setFieldState('Fields.subTableSchema', (state) => {
        state.value = {
          type: 'object',
          properties: {},
        };
      });
    });
  }

  function onForeignTable(): void {
    actions.setFieldState('Fields.subTableColumns', (state) => {
      state.value = [];
    });
  }

  function onChange(value: SubordinationType): void {
    runnerMap[value]();
    mutators.change(value);
  }

  return (
    <Radio.Group
      value={value}
      onChange={(e: RadioChangeEvent): void => onChange(e.target.value)}
    >
      {props.enum.map(({ label, value }: Record<string, string>) => {
        return (
          <Radio key={value} value={value}>{label}</Radio>
        );
      })}
    </Radio.Group>
  );
}

Subordination.isFieldComponent = true;

export default Subordination;
