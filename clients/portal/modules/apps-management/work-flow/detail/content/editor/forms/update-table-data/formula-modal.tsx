import React, { useContext, useRef } from 'react';
import { useQuery } from 'react-query';

import Modal from '@c/modal';
import { getSchemaFields } from '@flowEditor/forms/utils';
import { collectionOperators } from '@c/formula-editor/operator';
import FormulaEditor, { CustomRule, RefProps } from '@c/formula-editor';
import FlowTableContext from '@flowEditor/forms/flow-source-table';
import FlowContext from '@flow/detail/flow-context';
import { getFormFieldSchema } from '@flowEditor/forms/api';

interface Props {
  onClose: () => void;
  onSave: (rule: string) => void;
  defaultValue?: string;
}

function FormulaModal(props: Props) {
  const formulaRef = useRef<RefProps>();
  const { appID } = useContext(FlowContext);
  const { tableID, tableSchema: sourceSchema } = useContext(FlowTableContext);
  const { data: targetSchema, isLoading, isError } = useQuery(['GET_TARGET_TABLE_SCHEMA', tableID, appID], getFormFieldSchema, {
    enabled: !!appID && !!tableID,
  });

  if (isLoading) {
    return null;
  }

  if (isError) {
    return (<div>Load target table schema failed</div>);
  }

  const targetFields = getSchemaFields(targetSchema);
  const sourceFields = getSchemaFields(sourceSchema);
  const formulaCustomRules: CustomRule[] = targetFields.concat(sourceFields).map(({ label, value }) => ({
    key: value,
    name: label,
    type: 'field',
  }));

  function addText(text: string, hasSpacing = true, backNumber = 0): void {
    formulaRef.current?.insertText(text, hasSpacing, backNumber);
  }

  function addField(entityData: { name: string, key: string }): void {
    formulaRef.current?.insertEntity(entityData);
  }

  return (
    <Modal
      title="设置过滤条件"
      footerBtns={[
        {
          key: 'cancel',
          text: '取消',
          onClick: props.onClose,
        },
        {
          key: 'confirm',
          text: '确认',
          onClick: () => {
            const formula = formulaRef.current?.getFormulaValue().trim() || '';
            props.onSave(formula);
          },
          modifier: 'primary',
        },
      ]}
    >
      <div className="flex flex-col mb-20">
        <div>目标表单字段</div>
        <div className="target-table-fields">
          {targetFields.map(({ label, value }) => {
            return (
              <span
                key={value}
                onClick={() => addField({ key: value, name: label })}
                className="inline-block mb-8 p-2 bg-gray-100 mr-4 border border-gray-300 cursor-pointer"
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col mb-20">
        <div>集合操作符</div>
        <div className="mb-16">
          {[
            {
              tips: '',
              content: '==',
            },
            {
              tips: '',
              content: '!=',
            },
            {
              tips: '',
              content: '||',
            },
            {
              tips: '',
              content: '&&',
            },
          ].concat(collectionOperators).map(({ content }) => (
            <span
              key={content}
              onClick={() => addText(content)}
              className="inline-block mb-8 p-2 bg-gray-100 mr-4 border border-gray-300 cursor-pointer"
            >
              {content}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col mb-20">
        <div>当前表单字段</div>
        <div className="source-table-fields">
          {sourceFields.map(({ label, value }) => {
            return (
              <span
                key={value}
                onClick={() => addField({ key: value, name: label })}
                className="inline-block mb-8 p-2 bg-gray-100 mr-4 border border-gray-300 cursor-pointer"
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
      <div>
        <div>过滤公式</div>
        <FormulaEditor
          ref={formulaRef}
          className="block border border-gray-600 w-full mb-16"
          customRules={formulaCustomRules}
          defaultValue={props.defaultValue || ''}
        />
      </div>
    </Modal>
  );
}

export default FormulaModal;