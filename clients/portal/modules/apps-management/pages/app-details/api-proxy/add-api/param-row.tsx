import React, { useContext, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import cs from 'classnames';
import { get } from 'lodash';

import Select from '@c/select';
import Checkbox from '@c/checkbox';
import Icon from '@c/icon';

import { ApiParam, ParamGroup } from './params-config';
import paramsContext from './context';

interface Props {
  className?: string;
  idx: number;
  group: ParamGroup;
}

const paramTypes = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'boolean', value: 'boolean' },
  { label: 'object', value: 'object' },
  { label: 'array', value: 'array' },
];

function ParamRow({
  id,
  name,
  required,
  type,
  description,
  readonlyKeys = [],
  group,
  idx,
  parentPath,
  _object_nodes_,
  _array_nodes_,
}: Props & ApiParam) {
  const store = useContext(paramsContext);
  const { register, formState: { errors }, control, watch } = useFormContext();
  const [expand, setExpand] = useState(false);

  /*
  level:
  query.0.name  level-1
  query.0.type
  query.0._object_nodes_.0.name    level-2 object
  query.0._object_nodes_.0._object_nodes_.0.name  level-3
  query.0._array_nodes_.1.name   level-2 array
 */
  function getFieldName(name: string): string {
    return [parentPath || group, idx, name].join('.');
  }

  function handleChangeField(fieldName: string, val: any): void {
    console.log('change field: ', fieldName, val);
    store.setFieldValue(fieldName, val);
  }

  function getValidTypes(): LabelValue[] {
    if (group === 'path') {
      return paramTypes.filter(({ value })=> ['string', 'number'].includes(value));
    }
    if (['query', 'header'].includes(group)) {
      return paramTypes.filter(({ value })=> ['string', 'number', 'boolean'].includes(value));
    }
    return paramTypes;
  }

  function getLevel(): number {
    return (parentPath || '').split('.').filter((v)=> Number.isInteger(parseInt(v))).length;
  }

  function renderExpandBtn(): JSX.Element | null {
    if ((type === 'object' && !!_object_nodes_?.length) || (type === 'array' && !!_array_nodes_?.length)) {
      return (
        <Icon
          name={expand ? 'expand_more' : 'expand_less'}
          className='-mr-3 ml-8 cursor-pointer'
          onClick={()=> setExpand((expand)=> !expand)}
          clickable
        />
      );
    }
    return null;
  }

  return (
    <tr key={id}>
      <td className={cs('param-name flex items-center')} style={{
        paddingLeft: (getLevel() * 20) + 'px',
      }}>
        <input
          type="hidden"
          className='hidden'
          defaultValue={id}
          {...register(getFieldName('id'))}
        />
        {renderExpandBtn()}
        <Controller
          render={({ field })=> {
            const readonly = readonlyKeys?.includes('name');
            return (
              <input
                type="text"
                className={cs('input', {
                  error: get(errors, getFieldName('name')),
                  'opacity-50 cursor-not-allowed': readonly,
                })}
                maxLength={32}
                placeholder='新建参数'
                {...field}
                value={name}
                onChange={(ev)=> handleChangeField(getFieldName('name'), ev.target.value)}
                onKeyDown={()=> store.addParam(group, idx)}
                readOnly={readonly}
              />
            );
          }}
          name={getFieldName('name')}
          control={control}
          rules={{
            validate: (val)=> {
              // ignore empty string
              if (!val) {
                return true;
              }
              return /^[a-zA-Z_][\w-]*$/.test(val);
            },
          }}
          shouldUnregister
        />
      </td>
      <td className='param-type'>
        <Controller
          render={({ field })=> (
            <Select
              options={getValidTypes()}
              {...field}
              value={type}
              onChange={(val)=> {
                handleChangeField(getFieldName('type'), val);
                // if type not object or array, should reset its sub nodes
                store.resetSubNodesByType(getFieldName('type'), val);
              }}
            />
          )}
          control={control}
          name={getFieldName('type')}
          shouldUnregister
        />
      </td>
      <td className='param-required'>
        <Controller
          render={({ field })=> {
            const readonly = readonlyKeys?.includes('required');
            return (
              <Checkbox
                className={cs({
                  'cursor-not-allowed': readonly,
                })}
                {...field}
                checked={required}
                disabled={readonly}
                onChange={(ev)=> handleChangeField(getFieldName('required'), ev.target.checked)}
              />
            );
          }}
          name={getFieldName('required')}
          control={control}
          shouldUnregister
        />
      </td>
      <td className='param-desc relative'>
        <Controller
          render={({ field })=> (
            <input
              type="text"
              className='input'
              placeholder='建议输入中文, 最多32字符'
              maxLength={32}
              {...field}
              value={description}
              onChange={(ev)=> handleChangeField(getFieldName('description'), ev.target.value)}
            />
          )}
          name={getFieldName('description')}
          control={control}
          shouldUnregister
        />
        <div className='param-actions absolute right-5 top-5'>
          {group !== 'path' && (
            <>
              {['array', 'object'].includes(type) && (
                <Icon
                  name='playlist_add'
                  onClick={()=> store.addSubParam(group, parentPath || '', idx, type === 'array')}
                  className='cursor-pointer mr-8'
                  color='gray'
                  clickable
                />
              )}
              <Icon
                name='delete'
                onClick={()=> store.removeParam(group, parentPath || '', idx)}
                className='cursor-pointer'
                color='gray'
                clickable
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default ParamRow;
