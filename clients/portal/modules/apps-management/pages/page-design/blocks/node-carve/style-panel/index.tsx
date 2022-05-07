import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import cs from 'classnames';
import Editor from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

import { Modal, Icon, Button, toast } from '@one-for-all/ui';

import LayoutConfig from './layout-config';
import PositionConfig from './position-config';
import DisplayConfig from './display-config';
import BackgroundConfig from './background-config';
import FontConfig from './font-config';
import BorderConfig from './border-config';
import ShadowConfig from './shadow-config';
import Section from '../../../utils/section';
import { parseStyleToForm, formatStyles } from '../../../utils/config';

import styles from './index.m.scss';
import { useConfigContext } from '../context';
import { updateNodeProperty } from '../utils';
import { get } from 'lodash';
interface Props {
  className?: string;
}

function StylePanel({ className }: Props): JSX.Element {
  const { register, getValues, setValue, reset } = useForm();
  const [values, setValues] = useState<any>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editorVal, setEditorVal] = useState<any>({});

  const { artery, activeNode, onArteryChange } = useConfigContext() ?? {};

  useEffect(() => {
    if (activeNode) {
      setValues(getCurStyle());
      reset(getCurStyle());
    }
  }, [activeNode?.id]);

  function getEditorValues(values: any): string {
    let _values = values;
    if (!checkStyles(_values)) {
      _values = {};
    }
    return JSON.stringify(values, null, 2);
  }

  function getCurStyle(): React.CSSProperties {
    if (activeNode) {
      const defaultStyles = get(activeNode, 'props.style.value', {});
      setEditorVal(getEditorValues(defaultStyles));
      const newStyles = parseStyleToForm(defaultStyles);
      return newStyles;
    }

    return {};
  }

  function checkStyles(vals: any): boolean {
    try {
      if (typeof vals === 'string') {
        JSON.parse(vals);
      }
      return true;
    } catch (err: any) {
      toast.error(`错误的 CSS值，请填写 JSX 格式的 JSON object: ${err.message}`);
      return false;
    }
  }

  function saveStyle(): void {
    // save editor values
    if (checkStyles(editorVal)) {
      setModalOpen(false);
      // setValues(JSON.parse(editorVal));
      const newValues = JSON.parse(editorVal);
      const _newValues = parseStyleToForm(newValues);
      setValues(_newValues);
      reset(_newValues);
      if (activeNode && artery) {
        const newArtery = updateNodeProperty(
          activeNode,
          'props.style',
          { type: 'constant_property', value: newValues },
          artery,
        );
        onArteryChange?.(newArtery);
      }
    }
  }

  if (!activeNode) {
    return (
      <div className='flex justify-center items-center flex-col h-full'>
        <p>当前层级没有内容</p>
        <p>请在左侧画布选中其他元素</p>
      </div>
    );
  }

  function handleFormChange(): void {
    const _values = getValues();
    setValues(_values);
    const newValues = formatStyles(_values);
    if (activeNode && artery) {
      const newArtery = updateNodeProperty(
        activeNode,
        'props.style',
        { type: 'constant_property', value: newValues },
        artery,
      );
      onArteryChange?.(newArtery);
    }
    setEditorVal(getEditorValues(newValues));
  }

  return (
    <div className={cs(styles.stylePanel, className)}>
      <div className='mt-8 ml-8 mb-8'>
        <Button className='flex items-center' onClick={() => setModalOpen(true)}>
          <Icon name='code' />源码编辑
        </Button>
      </div>
      <form onChange={handleFormChange}>
        <Section title='画布' defaultExpand>
          <LayoutConfig initValues={values} register={register} setValue={setValue} />
        </Section>
        <Section title='显示布局' defaultExpand>
          <DisplayConfig initValues={values} register={register} setValue={setValue} />
        </Section>
        <Section title='定位' defaultExpand>
          <PositionConfig initValues={values} register={register} setValue={setValue} />
        </Section>
        <Section title='字体' defaultExpand>
          <FontConfig
            initValues={values}
            register={register}
            setValue={setValue}
            onFormChange={handleFormChange}
          />
        </Section>
        <Section title='背景' defaultExpand>
          <BackgroundConfig
            initValues={values}
            register={register}
            setValue={setValue}
            onFormChange={handleFormChange}
          />
        </Section>
        <Section title='边框' defaultExpand>
          <BorderConfig
            initValues={values}
            register={register}
            setValue={setValue}
            onFormChange={handleFormChange}
          />
        </Section>
        <Section title='阴影' defaultExpand>
          <ShadowConfig
            initValues={values}
            register={register}
            setValue={setValue}
            onFormChange={handleFormChange}
          />
        </Section>
      </form>

      {modalOpen && (
        <Modal
          title='编辑样式'
          onClose={() => setModalOpen(false)}
          footerBtns={[
            {
              key: 'close',
              iconName: 'close',
              onClick: () => setModalOpen(false),
              text: '取消',
            },
            {
              key: 'check',
              iconName: 'check',
              modifier: 'primary',
              onClick: saveStyle,
              text: '确认',
            },
          ]}
        >
          <Editor
            value={editorVal}
            height="480px"
            theme='light'
            extensions={[javascript()]}
            onChange={(val) => setEditorVal(val)}
          />
        </Modal>
      )}
    </div>
  );
}

export default StylePanel;
