import React, { useState, useEffect, useRef } from 'react';
import { Table, Message } from '@QCFE/lego-ui';
import { observer } from 'mobx-react';
import msgMgmt from '@portal/stores/msg-mgmt';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { MsgSendStatus, MsgType } from '@portal/modules/system-mgmt/constants';
import Status from './status';
import Loading from '@c/loading';
import Error from '@c/error';
import MoreMenu from '@c/more-menu';
import SvgIcon from '@c/icon';
import Pagination from '@c/pagination';
import Modal from '@c/modal';
import Button from '@c/button';
import { createMsg, deleteMsgById } from '@portal/modules/system-mgmt/api';
import PreviewModal, { ModalContent } from './preview-modal';
import { getMsgById } from '@portal/modules/system-mgmt/api';
import cs from 'classnames';
import { useQueryClient } from 'react-query';
import EmptyData from '@c/empty-tips';
import Select from '@c/select';

import { Content as SendMessage } from '../send-message/index';

import Authorized from '@c/authorized';
import styles from './index.module.scss';

enum MessageAction {
  delete,
  send,
  modify
}

interface Props {
  className?: string;
  refresh: ()=>void;
}

const EnumStatusLabel: any = {
  [MsgSendStatus.all]: '全部',
  [MsgSendStatus.success]: '已发送',
  [MsgSendStatus.sending]: '发送中',
  [MsgSendStatus.draft]: '草稿',
};

const EnumMessageLabel = {
  [MsgType.all]: '全部',
  [MsgType.system]: '系统消息',
  [MsgType.notify]: '通知公告',
};

const getOptions = (labels: any, keyname?: string )=>{
  const keys = Object.keys(labels);

  return keys.map((key)=>({
    label: labels[key],
    [keyname || 'key']: key,
  }));
};

const MessageStatus = [
  {
    value: MsgSendStatus.all,
    label: '全部',
  },
  {
    value: MsgSendStatus.success,
    label: '已发送',
  }, {
    value: MsgSendStatus.sending,
    label: '发送中',
  },
  {
    value: MsgSendStatus.draft,
    label: '草稿',
  },
];

const EnumMessage = [
  {
    label: '全部',
    value: MsgType.all,
  },
  {
    label: '系统消息',
    value: MsgType.system,
  }, {
    label: '通知公告',
    value: MsgType.notify,
  },
];

const MsgTable = ({ refresh }: Props) => {
  const {
    data,
    pageInfo,
    requestInfo,
    messageStatus: status,
    messageType,
    setPageInfo,
    setMessageType,
    setMessageStatus: setStatus,
  } = msgMgmt;

  const queryClient=useQueryClient();

  const [previewInfo, setPreviewInfo] = useState({
    visible: false, id: '', title: '', status: MsgSendStatus.all,
  });
  const [previewData, setPreviewData] = useState<any>(null);
  const [modifyModal, setModifyModal] = useState<any>({ visible: false, id: undefined });
  const [modifyData, setModifyData] = useState<any>(null);
  const [rowSelectionKyes, setRowSelectionKyes] = useState([]);
  const [modalInfo, setModalInfo] = useState({ visible: false, id: '' });
  const sendMessageRef = useRef<any>();

  const closeModal = () => setModalInfo({ visible: false, id: '' });

  const { isLoading, isError, isFetching } = requestInfo;

  const refreshMsg = () => {
    queryClient.invalidateQueries('msg-mgmt-msg-list');
    queryClient.invalidateQueries('count-unread-msg');
  };

  useEffect(()=>{
    if (!previewInfo.visible || !previewInfo.id) {
      setPreviewData(null);
      return;
    }

    getMsgById(previewInfo.id)
      .then((response: any) => {
        if (response.code == 0) {
          const { recivers } = response.data;
          setPreviewData(Object.assign({}, response.data, { receivers: recivers }));
        } else {
          Message.warning('异常查询');
        }
      });
  }, [previewInfo]);

  useEffect(()=>{
    if (!modifyModal.visible || !modifyModal.id) {
      setPreviewData(null);
      return;
    }

    getMsgById(modifyModal.id)
      .then((response: any) => {
        if (response.code == 0) {
          const { recivers } = response.data;
          setModifyData(Object.assign({}, response.data, { receivers: recivers }));
        } else {
          Message.warning('异常查询');
        }
      });
  }, [modifyModal]);

  const confirmSend = () => {
    const params = {
      template_id: 'quanliang',
      // @ts-ignore
      title: previewData.title || '',
      args: [{
        key: 'code',
        // @ts-ignore
        value: previewData.content || '',
      }],
      // @ts-ignore
      channel: previewData.channel||previewData.chanel, // letter: 站内信，email: 邮件
      // @ts-ignore
      type: previewData.type, // 1. verifycode 2、not verifycode
      // @ts-ignore
      sort: previewData.type,
      // @ts-ignore
      is_send: true, // false: 保存为草稿
      // @ts-ignore
      recivers: previewData.receivers,
      // @ts-ignore
      mes_attachment: previewData.mes_attachment||[],
      //     url: string
      // filename:
    };
    // @ts-ignore
    if (previewData.id) params.id = previewData.id;
    createMsg(params)
      .then((data)=>{
        if (data) {
          Message.success('操作成功');
          setPreviewInfo({ id: '', visible: false, title: '', status: MsgSendStatus.all });
          refresh();
          refreshMsg();
        } else {
          Message.error('操作失败');
        }
      });
  };

  const handleClose = () => setPreviewInfo(
    {
      visible: false, id: '', title: '', status: MsgSendStatus.all,
    });

  const pageChange = (page: number, pageSize: number) => setPageInfo(
    { ...pageInfo, current: page, pageSize }
  );

  if (isLoading ) {
    return <Loading/>;
  }

  if (isError) {
    return <Error desc='获取数据失败'/>;
  }

  const rowSelection = {
    selectedRowKeys: rowSelectionKyes,
    getCheckboxProps: (record: any) => ({
      disabled: record.useStatus === -2,
      name: record.id,
    }),
    onChange(e:any) {
      setRowSelectionKyes(e);
    },
  };

  const msgList = data?.data?.messages || [];

  const handleModifyModalClose = () => {
    setModifyModal({ visible: false, id: undefined });
    setModifyData(null);
    refresh();
  };

  const cols = [
    {
      title: (
        <Select
          value={status}
          defaultValue={status}
          options={MessageStatus}
          onChange={setStatus}
        >
          <div className={`flex content-center ${styles.text_blue} pointer`}>
            <div>{EnumStatusLabel[status]}</div>
            <SvgIcon
              name="filter_alt"
              className={cs(styles.text_blue, styles.status_icon)}
            />
          </div>
        </Select>
      ),
      dataIndex: 'status',
      width: 160,
      render: ( _ : any, { status, fail, success }: {
         status: MsgSendStatus,
         fail: number, success: number }) =>
        (<Status {...{ status, fail, success }
        }/>),
    },
    {
      title: (
        <Select
          value={messageType}
          defaultValue={messageType}
          options={EnumMessage}
          onChange={setMessageType}
        >
          <div className={`flex content-center ${styles.text_blue} pointer`}>
            <div>{EnumMessageLabel[messageType]}</div>
            <SvgIcon name="filter_alt" className={cs(styles.text_blue, styles.status_icon)}/>
          </div>
        </Select>
      ),
      dataIndex: 'title',
      width: 'auto',
      render: (_: any, { id, title, sort, status } : {
         status: MsgSendStatus, id: string, title: string, sort: MsgType
        })=>{
        const handleClick = () => {
          setPreviewInfo({ id, visible: true, title, status });
        };
        return (<PreviewModal handleClick={handleClick} title={(<div>
          {( sort != MsgType.all ) &&(<span
            className={
              cs(
                styles.msg_type_tip,
                {
                  [styles.msg_type_tip_notice]: sort == MsgType.notify,
                })
            }>{(EnumMessage.find((itm)=>itm.value==sort)||{}).label}</span>)}
          <span className={styles.msg_title} title={title}>{title}</span>
        </div>)} />);
      },
    },
    {
      title: '操作人',
      render: ({ handle_name }: Qxp.QueryMsgResult) => handle_name || <span>无</span>,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      width: 180,
      render: ( _: any, { updated_at } : Qxp.QueryMsgResult) => {
        return (
          <span>
            {dayjs(parseInt(String(updated_at * 1000)))
              .format('YYYY-MM-DD HH:mm:ss')}
          </span>
        );
      },
    },
    {
      title: '',
      render: (itm: Qxp.QueryMsgResult) => {
        const { status, id } = itm;
        const confirmSend = () => {
          setPreviewInfo({ id, visible: true, title: itm.title, status });
        };

        const confirmDelete = ()=> setModalInfo({ visible: true, id: itm.id });

        const handleModifyModal = () => setModifyModal({ visible: true, id: itm.id });

        if (status !== 1) return null;

        const menus = [
          {
            key: MessageAction.send,
            label: (
              <div className="flex items-center" onClick={confirmSend}>
                <SvgIcon name="send" size={16} className="mr-8" />
                <span className="font-normal">发送&emsp;&emsp;</span>
              </div>
            ),
          },
          {
            key: MessageAction.modify,
            label: (
              <div className="flex items-center" onClick={handleModifyModal}>
                <SvgIcon name="edit" size={16} className="mr-8" />
                <span className="font-normal">修改&emsp;&emsp;</span>
              </div>
            ),
          },
          {
            key: MessageAction.delete,
            label: (
              <div className="flex items-center" onClick={confirmDelete}>
                <SvgIcon name="restore_from_trash" size={16} className="mr-8" />
                <span className="font-normal">删除&emsp;&emsp;</span>
              </div>
            ),
          },
        ];
        return (
          <Authorized authority={['system/mangage']}>
            <MoreMenu
              onChange={console.log}
              placement="bottom-end"
              className="opacity-1"
              menus={menus}/>
          </Authorized>
        );
      },
    },
  ];

  const saveDraft = () => {
    const params=sendMessageRef?.current?.saveDraft({ toParams: true });
    params && createMsg(params)
      .then((data)=>{
        if (data) {
          Message.success('操作成功');
          setPreviewInfo({ id: '', visible: false, title: '', status: MsgSendStatus.all });
          refresh(); // fixme
          refreshMsg();
          handleModifyModalClose();
        } else {
          Message.error('操作失败');
        }
      }).catch((err: Error)=> Message.error(err.message));
  };

  return (
    <>
      <div className={cs('w-full', styles.tableWrap)}>
        <Table
          className='text-14 table-full'
          dataSource={msgList}
          columns={cols}
          rowKey="id"
          // rowSelection={rowSelection}
          emptyText={<EmptyData text='暂无消息数据' className="pt-40" />}
          loading={isLoading}
        />
      </div>
      {msgList.length > 0 && (<Pagination
        {...pageInfo}
        showSizeChanger
        onChange={pageChange}
        className={'pt-10'}
        renderTotalTip={() => (
          <div className="text-12 text-gray-600">
            共<span className="mx-4">{data?.data?.total || 0}</span>条消息
          </div>
        )}
      />)}

      {previewInfo.visible && (<ModalContent
        handleClose={handleClose}
        confirmSend={debounce(confirmSend, 1000)}
        data={previewData}
        status={previewInfo.status}
      />)}
      {modifyModal.visible &&
        (<Modal
          width={1324}
          title="修改草稿"
          onClose={handleModifyModalClose}
          footer={(
            <>
              <Button
                onClick={debounce(saveDraft, 1000, { leading: true })}
                iconName="book"
                className='mr-20'
              >
                存草稿
              </Button>
              <Button
                className="bg-gray-700 mr-20"
                modifier="primary"
                onClick={() => {
                  sendMessageRef?.current?.previewAndPublish &&
                  sendMessageRef?.current?.previewAndPublish();
                }}
                iconName="send"
              >
                预览并发送
              </Button>
            </>
          )}
        >
          {modifyData &&
          (<SendMessage
            donotShowHeader
            className={styles.draftModal}
            handleClose={handleModifyModalClose}
            modifyData={modifyData}
            ref={sendMessageRef}
            footer={() => null}
          />)}
        </Modal>)
      }
      {modalInfo.visible && (
        <Modal
          title="删除消息"
          onClose={closeModal}
          onConfirm={() => {
            deleteMsgById(modalInfo.id)
              .then((data) => {
                if (data && data.code == 0) {
                  Message.success('操作成功');
                  refresh();
                  refreshMsg();
                  closeModal();
                } else {
                  Message.error('操作失败');
                }
              });
          }}
        >
          <div className={styles.modal_card_content}>确定要删除该条消息吗？删除后不可恢复。</div>
        </Modal>
      )}
    </>
  );
};

export default observer(MsgTable);
