import React, { useState, useEffect, useRef, createContext, useMemo, JSXElementConstructor } from 'react';
import {
  SchemaForm,
  createFormActions,
  FormEffectHooks,
  ISchemaFormActions,
  ISchemaFieldComponentProps,
} from '@formily/antd';
import {
  Input as input,
  Select as select,
  Switch,
  ArrayTable,
  NumberPicker,
  DatePicker,
} from '@formily/antd-components';
import { useParams } from 'react-router-dom';
import { update } from 'lodash';

import Button from '@c/button';
import { INTERNAL_FIELD_NAMES } from '@c/form-builder/store';
import logger from '@lib/logger';

import formTableFields from './form-table-fields';
import configSchema from './config-schema';
import switcher from './switcher';
import columns from './columns';
import subordination from './subordination';
import formTableSelectorWrapper from './form-table-selector-wrapper';
import { SubTableConfig } from './convertor';
import sInput from './components/input';
import sTextarea from './components/textarea';
import sNumber from './components/number';
import sDatePicker from './components/datetime';
import sSelect from './components/select';
import sMultipleSelect from './components/multiple-select';
import { addOperate } from '../operates';
import { Store } from 'antd/lib/form/interface';
import DefaultValueLinkageConfigBtn
  from '../../form-settings-panel/form-field-config/default-value-linkage-config-btn';

export const ActionsContext = createContext<ISchemaFormActions>(createFormActions());
export const ItemActionsContext = createContext<ISchemaFormActions>(createFormActions());

type State = {
  currentFieldKey: string;
}

const { onFieldValueChange$ } = FormEffectHooks;

interface Props {
  onChange: (value: any) => void;
  initialValue: SubTableConfig;
}

let currentKey = '';

export default function ConfigForm({ onChange, initialValue }: Props) {
  const [state, setState] = useState<State>({ currentFieldKey: currentKey });
  const actions = useMemo(() => createFormActions(), []);
  const itemActions = useMemo(() => createFormActions(), []);
  const { appID } = useParams<{ appID: string}>();
  const componentMountedRef = useRef(false);

  useEffect(() => {
    actions.setFieldState('Fields.appID', (state) => {
      state.value = appID;
    });
  }, [appID]);

  useEffect(() => {
    componentMountedRef.current = true;
  }, []);

  const components: Record<string, JSXElementConstructor<ISchemaFieldComponentProps>> = {
    switcher, textarea: input.TextArea, subordination, input,
    select, formTableFields, formTableSelectorWrapper, switch: Switch,
    arraytable: ArrayTable, addoperate: addOperate, columns,
    numberpicker: NumberPicker, datepicker: DatePicker,
    defaultvaluelinkageconfigbtn: DefaultValueLinkageConfigBtn,
  };

  const componentsForSubTable: Record<
    string, Omit<FormBuilder.SourceElement<any>, 'displayOrder'>
  > = {
    ...components,
    input: sInput,
    textarea: sTextarea,
    numberpicker: sNumber,
    datepicker: sDatePicker,
    select: sSelect,
    multipleselect: sMultipleSelect,
  };

  function onFieldConfigValueChange(value: any) {
    const { items } = initialValue;
    update(items, `properties.${state.currentFieldKey}`, (schema) => {
      return {
        ...schema,
        ...componentsForSubTable[currentSchemaType]?.toSchema(value),
      };
    });
    onChange({
      ...initialValue,
      items,
    });
    actions.setFieldState('Fields.items', (state) => {
      state.value = items;
    });
    actions.getFieldState('Fields.columns', (st1) => {
      const columns: {title: string; dataIndex: string}[] = st1.value || [];
      actions.setFieldState('Fields.columns', (st2) => {
        st2.value = columns.map((col) => {
          if (col.dataIndex === state.currentFieldKey) {
            return { ...col, title: value.title };
          }
          return col;
        });
      });
    });
  }

  function convertSchema({ properties }: FormBuilder.Schema = {}): Record<string, Store> {
    if (!properties) {
      return {};
    }
    const sortedKeys = Object.keys(properties).sort((keyA, keyB) => {
      const keyAIndex = properties[keyA]['x-index'] || 0;
      const keyBIndex = properties[keyB]['x-index'] || 0;
      return keyAIndex - keyBIndex;
    }).filter((key) => !INTERNAL_FIELD_NAMES.includes(key));

    const fields = sortedKeys.reduce((cur: Record<string, Store>, key) => {
      const componentName = properties[key]['x-component']?.toLowerCase() || '';
      if (!componentsForSubTable?.[componentName]?.toConfig) {
        logger.error('fatal! there is no x-component in schema:', properties[key]);
        return {};
      }

      const configValue = componentsForSubTable[componentName].toConfig(properties[key]);
      cur[key] = configValue;
      return cur;
    }, {});
    return fields;
  }

  const currentSubSchema = initialValue.items?.properties?.[state.currentFieldKey];
  const currentSchemaType = currentSubSchema?.['x-component']?.toLowerCase() as string;
  const currentSubSchemaDefault = componentsForSubTable[currentSchemaType]?.configSchema;

  function onGoBack() {
    currentKey = '';
    actions.setFieldState('Fields.curConfigSubTableKey', (state) => {
      state.value = '';
    });
  }

  const initialValues = convertSchema(initialValue.items);

  return (
    <>
      <ActionsContext.Provider value={actions}>
        <SchemaForm
          initialValues={initialValue}
          components={components}
          onChange={onChange}
          schema={configSchema}
          actions={actions}
          hidden={!!currentSubSchema}
          effects={() => {
            onFieldValueChange$('Fields.curConfigSubTableKey').subscribe((st) => {
              if (!componentMountedRef.current) {
                return;
              }
              setState({ currentFieldKey: st.value });
              currentKey = st.value;
            });
          }}
        />
      </ActionsContext.Provider>
      {currentSubSchema && (
        <ItemActionsContext.Provider value={itemActions}>
          <div className="flex flex-row items-center mb-10">
            <Button className="mr-10" onClick={onGoBack}>返回</Button>
            <p>子表单</p>
          </div>
          <SchemaForm
            initialValues={initialValues[state.currentFieldKey]}
            components={components}
            onChange={onFieldConfigValueChange}
            schema={currentSubSchemaDefault}
            actions={itemActions}
          />
        </ItemActionsContext.Provider>
      )}
    </>
  );
}