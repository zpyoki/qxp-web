import React, { useState } from 'react';
import cs from 'classnames';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import PageSchemaRender from '@c/page-schema-render';

import Icon from '@c/icon';
import Card from '@c/card';
import Modal from '@c/modal';
import Button from '@c/button';
import toast from '@lib/toast';
import EmptyTips from '@c/empty-tips';
import PageLoading from '@c/page-loading';
import Tab from '@c/tab';

import CustomPageUpload from './custom-page-upload';
import appPagesStore from '../../store';
import PageBuildNav from './page-build-nav';
import { MenuType, Resp } from '../../type';
import { createCustomPage, updateCustomPage } from '../../api';
import { formatFileSize } from '../../utils';
import { getSchemaKey, getVersionKey, getRenderRepository } from '../../../page-design/api';

import './index.scss';

type Props = {
  pageID: string
}

function PageDetails({ pageID }: Props): JSX.Element {
  const history = useHistory();
  const [modalType, setModalType] = useState('');
  const [files, setFiles] = useState<QXPUploadFileTask[]>([]);
  const {
    activeMenu,
    curPageCardList,
    appID,
    fetchSchemeLoading,
    pageDescriptions,
    setActiveMenu,
    setCurPageMenuType,
    patchNode,
  } = appPagesStore;

  function goFormBuild(): void {
    if (appPagesStore.hasSchema) {
      history.push(`/apps/formDesign/formBuild/${activeMenu.id}/${appID}?pageName=${activeMenu.name}`);
    }
  }

  function goPageDesign(): void {
    history.push(`/apps/page-design/${activeMenu.id}/${appID}?pageName=${activeMenu.name}`);
  }

  function handleCreateCustomPage(): void {
    if (!files[0]?.uploadUrl) {
      toast.error('请上传正确的文件');
      return;
    }

    const fileSizeStr = formatFileSize(Number(files[0].size));

    if (modalType === 'create') {
      createCustomPage(appID, {
        menuId: pageID, fileSize: fileSizeStr, fileUrl: files[0]?.uploadUrl || '',
      }).then((res) => {
        patchNode(pageID, { menuType: 2 });
        setActiveMenu({ ...activeMenu, menuType: 2 });
        setCurPageMenuType(2, res);
        toast.success('新建成功');
        setModalType('');
      }).catch((err) => {
        toast.error(err.message);
      });
      return;
    }

    updateCustomPage(appID, {
      id: pageID, fileSize: fileSizeStr, fileUrl: files[0]?.uploadUrl || '',
    },
    ).then((res) => {
      patchNode(pageID, { menuType: 2 });
      setActiveMenu({ ...activeMenu, menuType: 2 });
      setCurPageMenuType(2, res);
      toast.success('修改成功');
      setModalType('');
    }).catch((err) => {
      toast.error(err.message);
    });
  }

  function onSuccess({ code, data, msg }: Resp): void {
    if (code === 0 && data?.url) {
      setFiles((prevFiles) => [{
        ...prevFiles[0],
        uploadUrl: data.url,
        state: 'success',
      }]);
    } else {
      toast.error(msg || '上传失败');
    }
  }

  function onProgress(file: QXPUploadFileTask, progress: number ): void {
    setFiles((prevFiles) => [{
      ...prevFiles[0],
      progress: progress,
    }]);
  }

  function onStart(file: File): void {
    setFiles([{
      uid: file.name,
      name: file.name,
      type: file.type,
      size: file.size,
    }]);
  }

  function goLink(cardID: string): void {
    if (cardID === 'linkedFlows') {
      history.push(`/apps/details/${appID}/setting_flow`);
      return;
    }

    history.push(`/apps/details/${appID}/app_control`);
  }

  function renderPageDetails(): JSX.Element {
    if (activeMenu.menuType === MenuType.schemaForm && !appPagesStore.hasSchema) {
      return (
        <PageBuildNav
          appID={appID}
          pageId={activeMenu.id}
          pageName={activeMenu.name}
          setOpenModal={setModalType}
        />
      );
    }

    if ((activeMenu.menuType === MenuType.schemaPage && appPagesStore.designPageSchema)) {
      return (
        <div className='relative flex-1 overflow-hidden p-16'>
          <div className='px-16 py-8 rounded-8 border-1 flex items-center'>
            <div className="page-details-icon">
              <Icon
                size={24}
                type="dark"
                name='view'
              />
            </div>
            <div className='flex-1 grid grid-cols-6 mr-48'>
              {[{ title: '页面类型', value: '自定义页面' }].map(({ title, value }) => {
                return (
                  <div key={title}>
                    <p className={!value ? 'text-gray-400' : ''}>{value ? value : '-'}</p>
                    <p className='page-details-text'>{title}</p>
                  </div>
                );
              })}
            </div>
            <Button
              iconName="edit"
              modifier="primary"
              textClassName='app-content--op_btn'
              onClick={goPageDesign}
            >
                设计页面
            </Button>
          </div>
          <Tab items={[
            {
              id: 'page-preview',
              name: '视图预览',
              content: (
                <PageSchemaRender
                  schemaKey={getSchemaKey(appID, pageID, false)}
                  version={getVersionKey()}
                  repository={getRenderRepository()}
                  maxHeight="calc(100vh - 250px)"
                />
              ),
            },
            {
              id: 'relate-info',
              name: '关联信息',
              content: (<div>暂无数据</div>),
            },
          ]}/>
        </div>
      );
    }

    return (
      <>
        <div className='relative flex-1 overflow-hidden p-16'>
          <div className='px-16 py-8 rounded-8 border-1 flex items-center'>
            <div className="page-details-icon">
              <Icon
                size={24}
                type="dark"
                name={activeMenu.menuType === MenuType.schemaForm ? 'schema-form' : 'custom-page'}
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
            {activeMenu.menuType === MenuType.customPage ? (<>
              <Button
                iconName='edit'
                className="mr-18"
                modifier='primary'
                textClassName='app-content--op_btn'
                onClick={() => setModalType('edit')}
              >
                修改页面
              </Button>
              <Button
                iconName="preview"
                textClassName='app-content--op_btn'
                onClick={() => history.push(`/apps/preview/customPage/${appID}/${pageID}`)}
              >
                预览
              </Button>
            </>
            ) : (
              <Button
                iconName="edit"
                modifier="primary"
                textClassName='app-content--op_btn'
                onClick={goFormBuild}
              >
                设计表单
              </Button>
            )}
          </div>
          <div className='rounded-12 flex select-none py-16'>
            {curPageCardList.map(({ title, list, id: cardID }) => {
              if (activeMenu.menuType === MenuType.customPage && cardID === 'linkedFlows') {
                return;
              }
              return (
                <Card
                  key={title}
                  className="border-1 card-box mr-16"
                  headerClassName="p-16"
                  title={(
                    <div className="flex items-center text-h6">
                      <Icon name="link" size={20} />
                      <span className="mx-8">{title}</span>
                      <span className="text-gray-400">{`(${list.length})`}</span>
                    </div>
                  )}
                  action={(<Icon
                    name="arrow_forward"
                    size={20}
                    className="anchor-focus"
                    onClick={() => goLink(cardID)}
                  />)}
                  itemTitleClassName="text-h5"
                  contentClassName="p-0 flex-col"
                  content={(
                    <div className="mb-24 h-80 overflow-auto">
                      {list.length ? list.map(({ name, id, status }) => {
                        const statusColor = status === 'ENABLE' ? 'green' : 'yellow';

                        return (
                          <div
                            key={name}
                            className={cs('px-4 py-8 link-focus truncate flex items-center', {
                              'px-44': !status,
                            })}
                            onClick={() => {
                              if (cardID === 'linkedFlows') {
                                history.push(`/apps/flow/${appID}/${id}`);
                                return;
                              }

                              history.push(`/apps/details/${appID}/app_permission?id=${id}`);
                            }}
                          >
                            {status && (
                              <div
                                style={{
                                  '--status-color': `var(--${statusColor}-600)`,
                                  '--status-shadow-color': `var(--${statusColor}-400)`,
                                  boxShadow: `0 0 12px var(--${statusColor}-400)`,
                                } as React.CSSProperties}
                                className="relative w-8 h-8 rounded-full ml-40"
                              >
                                <div className="status-dot"></div>
                              </div>
                            )}
                            <div className="truncate flex-1">
                              <span className={status && 'ml-10'}>{name}</span>
                              <span className="ml-4 text-gray-400">
                                {status && (status === 'ENABLE' ? '(已发布)' : '(草稿)')}
                              </span>
                            </div>
                          </div>
                        );
                      }) : <div className="px-44 py-8 text-gray-400">！暂无数据</div>}
                    </div>
                  )}
                />
              );
            })}
          </div>
        </div>
      </>
    );
  }

  function renderModal(modalType: string) {
    return (
      <Modal
        title={modalType === 'create' ? '新建自定义页面' : '修改自定义页面'}
        onClose={() => setModalType('')}
        footerBtns={[
          {
            key: 'close',
            text: '取消',
            onClick: () => setModalType(''),
          },
          {
            key: 'sure',
            text: '确定',
            modifier: 'primary',
            onClick: handleCreateCustomPage,
          },
        ]}
      >
        <div className="p-40">
          <CustomPageUpload files={files} onSuccess={onSuccess} onProgress={onProgress} onStart={onStart} appID={appID} />
          <p className="mt-8 select-none">1. 支持上传静态的页面代码，包含 html、javascript、css、图片等。</p>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <div className='app-page-content'>
        {!activeMenu?.id && <EmptyTips className="empty" text='暂无页面数据,请先新建页面' />}
        {activeMenu?.id && (
          <>
            <div className='h-44 page-details-nav header-background-image border-b-1 px-16 flex items-center bg-gray-50'>
              <span className='text-12 mr-8 font-semibold'>{activeMenu.name}</span>
              <span className='text-caption align-top'>{activeMenu.describe}</span>
            </div>
            {fetchSchemeLoading && <PageLoading />}
            {!fetchSchemeLoading && renderPageDetails()}
          </>
        )}
      </div>
      {modalType && renderModal(modalType)}
    </>
  );
}

export default observer(PageDetails);
