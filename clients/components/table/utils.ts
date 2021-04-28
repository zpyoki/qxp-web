import { useEffect, useRef } from 'react';
import { FixedColumn, IdType, UnionColumns } from 'react-table';

export const getDefaultSelectMap = (keys: string[] | undefined): Record<IdType<any>, boolean> => {
  if (!keys) {
    return {};
  }

  const keyMap: any = {};
  keys.forEach((key) => {
    keyMap[key] = true;
  });
  return keyMap;
};

export function useComputeColumnsPosition<T extends object = {}>(
  columns: FixedColumn<T>[]
): Array<React.CSSProperties> {
  let marginLeft = 0;
  const leftMargins: Array<number | undefined> = columns.map(({ fixed, width }) => {
    if (!fixed || typeof width !== 'number') {
      return undefined;
    }
    const _marginLeft = marginLeft;
    marginLeft = marginLeft + width;

    return _marginLeft;
  });

  let marginRight = 0;
  const rightMargins: Array<number | undefined> = columns
    .slice().reverse().map(({ fixed, width }) => {
      if (!fixed || typeof width !== 'number') {
        return undefined;
      }

      const _marginRight = marginRight;
      marginRight = marginRight + width;
      return _marginRight;
    }).reverse();

  return leftMargins.map((left, index) => {
    return {
      left: left !== undefined ? `${left}px` : undefined,
      right: rightMargins[index] !== undefined ? `${rightMargins[index]}px` : undefined,
    };
  });
}

type GetFixedStyle = (index: number) => React.CSSProperties;
export function useFixedStyle<T extends {}>(columns: UnionColumns<T>[]): GetFixedStyle {
  const fn = useRef<GetFixedStyle>(() => ({}));
  useEffect(() => {
    const columnsFixedStyle = useComputeColumnsPosition(columns as FixedColumn<T>[]);
    fn.current = (index: number) => {
      if ((columns as FixedColumn<T>[])[index].fixed) {
        return columnsFixedStyle[index];
      }
      return {};
    };
  }, [columns]);

  return fn.current;
}
