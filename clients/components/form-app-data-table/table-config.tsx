import React, { useContext, useMemo } from 'react';
import cs from 'classnames';
import { observer } from 'mobx-react';
import { UnionColumns } from 'react-table';

import Icon from '@c/icon';
import Popover from '@c/popover';
import Checkbox from '@c/checkbox';

import { StoreContext } from './context';

function TableConfig(): JSX.Element {
  const store = useContext(StoreContext);
  const { tableColumns } = store;

  const [selected, noSelected] = useMemo(() => {
    const _selected = store.columnConfig.map(({ id, fixed }) => {
      return { ...store.tableColumns.find((col) => col.id === id), fixed } as UnionColumns<FormData>;
    });

    const _noSelected = store.tableColumns.filter((col) => {
      return store.columnConfig.findIndex((_col) => col.id === _col.id) === -1 && col.id !== 'action';
    }) as UnionColumns<FormData>[];

    return [_selected, _noSelected];
  }, [store.columnConfig, store.tableColumns]);

  const columnsItemRenderer = (column: UnionColumns<FormData>, checked: boolean): JSX.Element => {
    return (
      <div key={column.id} className='px-18 py-8 hover:bg-blue-100 flex justify-between items-center'>
        <Checkbox
          checked={checked}
          onChange={(e) => store.setColumnConfig(e.target.checked, column.id)}
          label={column.Header?.toString()}
        />
        {checked && (
          <Icon
            clickable
            changeable
            className={cs({ 'form-table-fixed-active': column.fixed })}
            onClick={() => store.setColFixed(column.id || '', !column.fixed)}
            name='push_pin'
            size={20}
          />
        )}
      </div>
    );
  };

  return (
    <Popover content={(
      <div className='form-table-column-config'>
        <div className='flex justify-between px-18 py-10 border-gray-100 border-solid border-b-1' >
          <Checkbox
            indeterminate={selected.length !== 0 && selected.length !== tableColumns.length - 1}
            onChange={(e) => store.selectAllColumn(e.target.checked, noSelected)}
            checked={noSelected.length === 0}
            label='列展示'
          />
          <span onClick={store.resetColumnConfig} className='text-btn'>重置</span>
        </div>
        {selected.map((col) => columnsItemRenderer(col, true))}
        <div className='border-gray-100 border-solid border-b-1 border-t-1 px-18 py-8'>隐藏</div>
        {noSelected.map((col) => columnsItemRenderer(col, false))}
      </div>
    )}>
      <Icon clickable changeable size={25} name='settings' />
    </Popover>
  );
}

export default observer(TableConfig);
