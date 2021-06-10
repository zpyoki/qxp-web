import React, { useState, useEffect, memo } from 'react';

import More from '@c/more';
import Icon from '@c/icon';
import RadioGroup from '@c/radio/group';
import Radio from '@c/radio';
import Select from '@c/select';
import usePrevious from '@lib/hooks/use-previous';
import ActionButtonGroup from '@flow/detail/content/editor/components/_common/action-button-group';
import type { FieldValue } from '@flow/detail/content/editor/type';
import FormRenderer from '@c/form-builder/form-renderer';

interface Props {
  defaultValue?: FieldValue;
  onSave: (value: FieldValue) => void;
  variableOptions?: {label: string; value: string;}[];
  schema: ISchema;
}

function FieldValueEditor({
  defaultValue = { variable: '', staticValue: '' },
  variableOptions,
  onSave,
  schema,
}: Props) {
  const [type, setType] = useState(defaultValue.variable ? 'variable' : 'staticValue');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const previousType = usePrevious(type);
  useEffect(() => {
    if (previousType !== type) {
      setValue({
        variable: '',
        staticValue: '',
      });
    }
  }, [type]);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  function onCancel() {
    setValue(defaultValue);
    setIsEditorOpen(false);
  }

  function onSubmit() {
    onSave(value);
    setIsEditorOpen(false);
  }

  function onFormValueChange(value: Record<string, string>) {
    setValue((v) => ({ ...v, staticValue: Object.values(value)[0] }));
  }

  return (
    <More<JSX.Element>
      open={isEditorOpen}
      contentClassName="right-0 w-auto p-0"
      contentItemClassName="hover:bg-white rounded-12"
      items={[(
        <div
          className="px-16 pt-16 w-316"
          key="fieldValueEditor"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-12 text-body2">设置字段初始值</p>
          <div className="flex items-center mb-8">
            <RadioGroup onChange={(value) => setType(value as string)}>
              <Radio
                defaultChecked={type === 'variable'}
                value="variable"
                label="使用工作流变量"
                className="mr-16"
              />
              <Radio
                defaultChecked={type === 'staticValue'}
                value="staticValue"
                label="使用固定值"
              />
            </RadioGroup>
          </div>
          {
            type === 'variable' && (
              <Select<string>
                options={variableOptions || []}
                defaultValue={value.variable}
                onChange={(value: string) => setValue((v) => ({ ...v, variable: value }))}
                placeholder="选择工作流中的变量"
                className="h-32 py-4 border border-gray-300 corner-2-8-8-8
                  px-12 text-12 flex items-center flex-1 mb-8 mt-8"
              />
            )
          }
          {
            type === 'staticValue' && schema && (
              <>
                <FormRenderer
                  schema={schema}
                  defaultValue={value.staticValue}
                  onFormValueChange={onFormValueChange}
                >
                  <ActionButtonGroup className="mt-16" onCancel={onCancel} onSubmit={onSubmit} />
                </FormRenderer>
              </>
            )
          }
        </div>
      )]}
    >
      <div onClick={() => setIsEditorOpen(true)}>
        {(defaultValue.staticValue || defaultValue.variable) && (
          <span className="cursor-pointer">{defaultValue.staticValue || defaultValue.variable}</span>
        )}
        {(!defaultValue.staticValue && !defaultValue.variable) && (
          <Icon
            name="edit"
            className="ml-4 cursor-pointer"
          />
        )}
      </div>
    </More>
  );
}

export default memo(FieldValueEditor) as typeof FieldValueEditor;