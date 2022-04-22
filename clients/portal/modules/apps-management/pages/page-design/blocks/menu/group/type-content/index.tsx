import React from 'react';
import { Panel } from '@one-for-all/ui';

import ComponentsSource from './components-source';
import PageTree from './page-tree';
import DataSource from './data-source';
import { GROUP_TITLE_MAP } from '../../constants';

import './components-source/store';

interface Props {
  current: string;
  pinned: boolean;
  onClose: () => void;
  togglePinned: () => void;
  onAddNode: () => void;
  width?: number;
}

const GroupTypeContent = (props: Props): JSX.Element => {
  const { current, onClose, pinned, togglePinned, onAddNode, width } = props;

  return (
    <Panel
      title={GROUP_TITLE_MAP[current]}
      style={{ transform: 'translateX(55px)' }}
      onClose={onClose}
      onPin={togglePinned}
      visible={!!current}
      pinned={pinned}
      width={width}
      closable
      pinnable
    >
      {current === 'comps' && (
        <ComponentsSource onAddNode={onAddNode} />
      )}
      {current === 'page_tree' && (
        <PageTree />
      )}
      {current === 'data_source' && (
        <DataSource />
      )}
    </Panel>
  );
};

export default GroupTypeContent;
