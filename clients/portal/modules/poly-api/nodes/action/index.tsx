import React, { CSSProperties, useRef, forwardRef, ForwardedRef } from 'react';
import { useClickAway } from 'react-use';

import Icon from '@c/icon';
import { mergeRefs } from '@polyApi/utils';

interface Props {
  position: 'right' | 'bottom';
  onHide: (e: Event) => void;
}

function NodeAction({ position, onHide }: Props, ref: ForwardedRef<HTMLElement | null>): JSX.Element {
  const actionRef = useRef<HTMLElement | null>(null);
  useClickAway(actionRef, onHide);

  const style: CSSProperties = {
    boxShadow: '0px 8px 24px 4px rgba(148, 163, 184, 0.25)',
    cursor: 'default',
  };

  if (position === 'right') {
    Object.assign(style, {
      left: '-20px',
      top: '50%',
      transform: 'translateY(-50%) scale(0.5)',
    });
  }

  if (position === 'bottom') {
    Object.assign(style, {
      top: '-14px',
      left: '50%',
      transform: 'translateX(-50%) scale(0.5)',
    });
  }

  return (
    <section
      onClick={(e) => e.stopPropagation()}
      ref={mergeRefs<HTMLElement>(actionRef, ref)}
      className="bg-white py-8 rounded-12 absolute node-actions opacity-0 pointer-events-none"
      style={style}
    >
      <ul className="list-none">
        <li
          className="hover:bg-blue-100 transition duration-300 py-7 px-16 flex items-center cursor-pointer"
        >
          <Icon className="mr-8" name="add-request-node-action" />
          <span className="text-button whitespace-nowrap">请求节点</span>
        </li>
        <li
          className="hover:bg-blue-100 transition duration-300 py-7 px-16 flex items-center cursor-pointer"
        >
          <Icon className="mr-8" name="call_split" />
          <span className="text-button whitespace-nowrap">判断条件</span>
        </li>
      </ul>
    </section>
  );
}

export default forwardRef<HTMLElement, Props>(NodeAction);
