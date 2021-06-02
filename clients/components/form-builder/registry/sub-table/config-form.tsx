import React, { useState, useEffect, useRef } from 'react';
import { SchemaForm, createFormActions, FormEffectHooks } from '@formily/antd';
import { Input as input, Select as select, Switch, ArrayTable } from '@formily/antd-components';
import { useParams } from 'react-router-dom';
import { update } from 'lodash';

import Button from '@c/button';

import formTableFields from './form-table-fields';
import configSchema from './config-schema';
import switcher from './switcher';
import subordination from './subordination';
import formTableSelectorWrapper from './form-table-selector-wrapper';

import { SubTableConfig } from './convertor';
import { INTERNAL_FIELD_NAMES } from '@c/form-builder/store';

import sInput from './components/input';
import sTextarea from './components/textarea';
import sRadioGroup from './components/radio-group';
import { addOperate } from '../operates';

type State = {
  currentFieldKey: string;
}

export const actions = createFormActions();
export const itemActions = createFormActions();
const { onFieldValueChange$ } = FormEffectHooks;

interface Props {
  onChange: (value: any) => void;
  initialValue: SubTableConfig;
}

let currentKey = '';

export default function ConfigForm({ onChange, initialValue }: Props) {
  const [state, setState] = useState<State>({ currentFieldKey: currentKey });
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

  const components: Record<string, any> = {
    switcher, textarea: input.TextArea, subordination, input,
    select, formTableFields, formTableSelectorWrapper, switch: Switch,
    arraytable: ArrayTable, addoperate: addOperate,
  };

  const componentsForSubTable: any = {
    ...components,
    input: sInput,
    textarea: sTextarea,
    radiogroup: sRadioGroup,
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
  }

  function convertSchema({ properties }: FormBuilder.Schema = {}): any {
    if (!properties) {
      return {};
    }
    const sortedKeys = Object.keys(properties).sort((keyA, keyB) => {
      const keyAIndex = properties[keyA]['x-index'] || 0;
      const keyBIndex = properties[keyB]['x-index'] || 0;
      return keyAIndex - keyBIndex;
    }).filter((key) => !INTERNAL_FIELD_NAMES.includes(key));

    const fields = sortedKeys.reduce((cur: any, key) => {
      const componentName = properties[key]['x-component']?.toLowerCase() ?? '';
      if (!componentsForSubTable?.[componentName]?.toConfig) {
        // @ts-ignore
        // eslint-disable-next-line
        console.error('fatal! there is no x-component in schema:', properties[key]);
        return {};
      }

      const configValue = componentsForSubTable[componentName].toConfig(properties[key]);
      cur[key] = configValue;
      return cur;
    }, {});
    return fields;
  }

  const currentSubSchema = initialValue.items?.properties?.[state.currentFieldKey];
  // @ts-ignore
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
      {currentSubSchema && (
        <>
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
        </>
      )}
    </>
  );
}
