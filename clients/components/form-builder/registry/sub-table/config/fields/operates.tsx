import React, { useContext } from 'react';
import classnames from 'classnames';

import { ItemActionsContext } from '../context';
import Icon from '@c/icon';
import Button from '@c/button';

export function deleteOperate(idx: number): JSX.Element {
  const actions = useContext(ItemActionsContext);

  const mutator = actions.createMutators('availableOptions');

  return (
    <>
      <div className="delete-container">
        <Icon
          className={classnames('operate-icon', 'delete-icon')}
          name="delete"
          size={24}
          onClick={() => mutator.remove(idx)}
        />
      </div>
    </>
  );
}

export function extraOperations(idx: number): JSX.Element {
  const actions = useContext(ItemActionsContext);

  const mutator = actions.createMutators('availableOptions');

  return (
    <>
      <div className="ml-24">
        <Icon
          className="operate-icon"
          name="keyboard_arrow_up"
          onClick={() => mutator.moveUp(idx)}
        />
        <Icon
          className="operate-icon"
          name="keyboard_arrow_down"
          onClick={() => mutator.moveDown(idx)}
        />
      </div>
    </>
  );
}

export function addOperate(): JSX.Element {
  const actions = useContext(ItemActionsContext);

  const mutator = actions.createMutators('availableOptions');

  const options = actions.getFieldValue('availableOptions');
  return (<Button onClick={() => {
    let hasNullOption = false;
    options.forEach((element: any) => {
      if (element.label === '' || element.label === undefined) {
        hasNullOption = true;
        return;
      }
    });

    if (hasNullOption === false) {
      mutator.push({ label: '', value: '', title: '' });
    }
  }}>添加选项</Button>);
}
