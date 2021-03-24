import React from 'react';
import useCss from 'react-use/lib/useCss';
import { Tree as LegoTree, TreeNode, TreeProps, TreeData } from '@QCFE/lego-ui';
import { twCascade } from '@mariusmarais/tailwind-cascade';

interface ITree extends TreeProps {
  treeData: TreeData[];
  getKey?: (key: string) => void;
}

export const Tree = ({ ...props }: ITree) => {
  const renderTreeNodes = (data: TreeData[]) => {
    return data.map((item: TreeData) => {
      const { children } = item;
      if (children) {
        return (
          <TreeNode
            title={
              <div className="w-full flex items-center justify-between">
                <div className="text-1-dot-4">{item.title}</div>
              </div>
            }
            key={item.key}
            dataRef={item}
          >
            {renderTreeNodes(children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          title={
            <div className="w-full flex items-center justify-between">
              <div className="text-1-dot-4">{item.title}</div>
            </div>
          }
          key={item.key}
          dataRef={item}
        />
      );
    });
  };
  const handleSelect = (key: string) => {
    typeof props.getKey !== 'undefined' ? props.getKey(key[0]) : null;
  };
  return (
    <div className="w-auto h-full">
      <LegoTree
        defaultExpandAll
        className={twCascade(
          useCss({
            '.tree-title': {
              width: '100%',
            },
            '.tree-node-wrap': {
              height: '2.7rem',
              padding: '0 1rem',
            },
            '&': {
              'li.tree-node .tree-node-wrap:hover:before': {
                height: '2.7rem',
                'background-color': 'var(--blue-100)',
                opacity: '0.5',
              },
              'li.tree-node .tree-node-wrap.tree-node-wrap-selected:before': {
                height: '2.7rem',
                'background-color': 'var(--blue-100)',
                opacity: '1',
              },
              'li.tree-node .tree-node-wrap.tree-node-wrap-selected .tree-title': {
                '> div > .text-1-dot-4': {
                  color: '#375FF3',
                },
                '.text-1-dot-4': {
                  'font-weight': 'normal',
                },
              },
              'li.tree-node span.tree-switcher:hover': {
                background: 'none',
              },
              'li.tree-node .tree-node-content-wrapper': {
                width: '100%',
              },
            },
          }),
          props.className,
        )}
        onSelect={handleSelect}
      >
        {renderTreeNodes(props.treeData)}
      </LegoTree>
    </div>
  );
};
