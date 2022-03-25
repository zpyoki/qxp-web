import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Tab from '@c/tab';
import Icon from '@c/icon';
import Button from '@c/button';

import { View, ViewType } from '../types.d';
import PageSchemaRender from '@c/page-schema-render';
import { getVersionKey } from '../../../page-design/api';

type Props = {
  view: View;
}

type View_Map = {
  icon: string;
  viewType: string;
  operator: string;
}

const VIEW_MAP: Record<string, View_Map> = {
  table_schema_view: {
    icon: 'schema-form',
    viewType: '表单页面',
    operator: '设计表单',
  },
  static_view: {
    icon: 'custom-page',
    viewType: '静态页面',
    operator: '修改页面',
  },
  schema_view: {
    icon: 'view',
    viewType: '自定义页面',
    operator: '设计页面',
  },
};

function ViewInfo({ view }: Props): JSX.Element {
  const { type } = view;
  const history = useHistory();
  const { appID } = useParams<{ appID: string }>();
  const pageDescriptions = [{ id: 'type', title: '页面类型', value: VIEW_MAP[type].viewType }];

  function goPageDesign(): void {
    history.push(`/apps/page-design/${view.id}/${appID}?pageName=${view.name}`);
  }

  function goFormBuild(): void {
    history.push(`/apps/formDesign/formBuild/${view.id}/${appID}?pageName=${view.name}`);
  }

  function handleBtnClick(): void {
    if (type === ViewType.StaticView) {
      return console.log('修改静态页面');
    }

    if (type === ViewType.SchemaView) {
      return goPageDesign();
    }

    goFormBuild();
  }

  function Preview(): JSX.Element | null {
    if (type === ViewType.StaticView) {
      return (
        <iframe
          className="w-full h-full"
          src={view.fileUrl}
          style={{ border: 'none' }}
        />
      );
    }

    if (type === ViewType.SchemaView) {
      return (
        <PageSchemaRender
          schemaKey={view.schemaID}
          version={getVersionKey()}
        />
      );
    }

    return null;
  }

  return (
    <div className='relative flex-1 overflow-hidden p-16'>
      <div className='px-16 py-8 rounded-8 border-1 flex items-center'>
        <div className="page-details-icon">
          <Icon
            size={24}
            type="dark"
            name={VIEW_MAP[type].icon}
          />
        </div>
        <div className='flex-1 grid grid-cols-6 mr-48'>
          {pageDescriptions.map(({ title, value }) => {
            return (
              <div key={title}>
                <p className={!value ? 'text-gray-400' : ''}>{value ? value : '-'}</p>
                <p className='page-details-text'>{title}</p>
              </div>
            );
          })}
        </div>
        <Button
          iconName='edit'
          className="mr-18"
          modifier='primary'
          textClassName='app-content--op_btn'
          onClick={handleBtnClick}
        >
          {VIEW_MAP[type].operator}
        </Button>
      </div>
      {[ViewType.SchemaView, ViewType.StaticView].includes(type) && (
        <Tab
          items={[
            {
              id: 'page-preview',
              name: '页面预览',
              content: <Preview />,
            },
          ]}
        />
      )}
    </div>
  );
}

export default ViewInfo;
