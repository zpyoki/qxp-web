import React, { MouseEvent } from 'react';

import { twCascade } from '@mariusmarais/tailwind-cascade';

export interface IItemWithTitleDesc {
  title?: string;
  desc?: string;
  itemRender: JSX.Element;
  titleClassName?: string;
  descClassName?: string;
  textDirection?: 'row' | 'col';
  className?: string;
  textClassName?: string;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

export const ItemWithTitleDesc = ({
  title,
  desc,
  itemRender,
  textClassName,
  titleClassName,
  descClassName,
  textDirection,
  className,
  onClick = () => {},
}: IItemWithTitleDesc) => {
  return (
    <div
      className={
        twCascade('flex justify-start items-center md:flex-col md:items-start', className)
      }
      onClick={onClick}
    >
      {itemRender}
      <div
        className={twCascade(
          'justify-between ml-dot4 flex flex-1 transition duration-300 md:ml-0 md:mt-1',
          {
            'flex-row': textDirection == 'row',
            'flex-col': textDirection != 'row',
          },
          textClassName,
        )}
      >
        {title && <div className={twCascade('text-base', titleClassName)}>{title}</div>}
        {desc && (
          <span className={twCascade('flex items-center text-dot-6', descClassName)}>{desc}</span>
        )}
      </div>
    </div>
  );
};
