import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { uniq } from 'lodash';
import { Select, Input, Divider } from 'antd';
import { RefSelectProps } from 'antd/lib/select';
import { ISchemaFieldComponentProps } from '@formily/react-schema-renderer';

import toast from '@lib/toast';
import useEnumOptions from '@lib/hooks/use-enum-options';
import FormDataValueRenderer from '@c/form-data-value-renderer';

interface DropdownRenderProps {
  menu: React.ReactElement;
  isAllowCustom: boolean;
  onOtherCustomValueChange: (customValue: string) => void;
}

function DropdownRender({ menu, isAllowCustom, onOtherCustomValueChange }: DropdownRenderProps): JSX.Element {
  const [inputValue, setInputValue] = useState('');

  function handleInputValueChange(e: ChangeEvent<HTMLInputElement>): void {
    e.stopPropagation();
    setInputValue(e.target.value);
  }

  function handleAddOption(): void {
    if (!inputValue.trim()) {
      toast.error('内容不能为空');
      return;
    }

    onOtherCustomValueChange(inputValue.slice(0, 15));
    setInputValue('');
  }

  function handlePressEnter(e: React.KeyboardEvent<HTMLInputElement>): void {
    e.stopPropagation();
    handleAddOption();
  }

  if (!isAllowCustom) {
    return (<div>{menu}</div>);
  }

  return (
    <div>
      {menu}
      <Divider className="my-4" />
      <div className="px-8 flex items-center flex-nowrap">
        <Input
          style={{ height: 32 }}
          size="small"
          className="flex-auto"
          maxLength={50}
          value={inputValue}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={handleInputValueChange}
          onPressEnter={handlePressEnter}
        />
        <span
          className="flex-node p-8 block cursor-pointer whitespace-nowrap"
          onClick={handleAddOption}
        >
          新增
        </span>
      </div>
    </div>
  );
}

function MultipleSelect(fieldProps: ISchemaFieldComponentProps): JSX.Element {
  const options = useEnumOptions(fieldProps);
  const [allOptions, setAllOptions] = useState<string[]>(options);
  const [otherCustomValue, setOtherCustomValue] = useState('');
  const selectRef = useRef<RefSelectProps>(null);

  const isAllowCustom = !!fieldProps.props['x-component-props']?.allowCustom;

  useEffect(() => {
    if (!isAllowCustom || !otherCustomValue) {
      setAllOptions(options);
    } else {
      const newOptions = uniq([...allOptions, otherCustomValue]);
      //  todo count should be configurable
      if (newOptions.length - options.length > 3) {
        toast.error('自定义项不可超过三项');
        return;
      }
      setAllOptions(newOptions);
      fieldProps.mutators.change(uniq([...fieldProps.value, otherCustomValue]));
    }
  }, [isAllowCustom, options, otherCustomValue]);

  if (fieldProps.props.readOnly) {
    return <FormDataValueRenderer value={fieldProps.value} schema={fieldProps.schema} />;
  }

  return (
    <div className="flex flex-col w-full">
      <Select
        mode="multiple"
        value={fieldProps.value}
        ref={selectRef}
        options={allOptions.map((option) => ({ label: option, value: option }))}
        placeholder="请选择选项"
        onSelect={(v) => {
          fieldProps.mutators.change([
            ...fieldProps.value,
            v,
          ]);
        }}
        onDeselect={(v) => {
          fieldProps.mutators.change([
            ...fieldProps.value.filter((value: string) => v !== value),
          ]);
        }}
        dropdownRender={(menu) => (
          <DropdownRender
            menu={menu}
            isAllowCustom={isAllowCustom}
            onOtherCustomValueChange={(customValue) => {
              setOtherCustomValue(customValue);
            }}
          />
        )}
      />
    </div>
  );
}

MultipleSelect.isFieldComponent = true;

export default MultipleSelect;
