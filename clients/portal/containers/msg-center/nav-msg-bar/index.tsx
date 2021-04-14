import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import Icon from '@c/icon';
// import { io } from 'socket.io-client';

import UnreadMsgBox from '../unread-msg-box';
import ModalMsgCenter from '../modal-msg-center';
import BtnBadge from '../btn-badge';
import { getQuery } from '@clients/utils';

import styles from './index.module.scss';

const NavMsgBar = ({ msgCenter }: Pick<MobxStores, any>): JSX.Element => {
  const toggleRef = useRef(null);
  const msgBoxRef = useRef(null);

  const { openUnreadMsgBox, unReadCount, msgBoxOpen, openMsgCenter } = msgCenter;

  const handleClickOuter = (ev: MouseEvent) => {
    const { target } = ev;
    if (!toggleRef.current || !msgBoxRef.current) {
      return;
    }
    // @ts-ignore
    if (!(toggleRef.current.contains(target) || msgBoxRef.current.contains(target))) {
      openUnreadMsgBox(false);
    }
  };

  useEffect(() => {
    document.body.addEventListener('click', handleClickOuter);

    // check params from url
    const queryOpenMsg = getQuery('msg_center');
    // fixme
    if (['true', '1'].includes(queryOpenMsg + '')) {
      openMsgCenter(true);
    }

    return () => {
      document.body.removeEventListener('click', handleClickOuter);
    };
  }, []);

  const renderUnreadMsgBox = () => {
    if (!msgBoxOpen) {
      return null;
    }
    return (
      <UnreadMsgBox ref={msgBoxRef}/>
    );
  };

  // useEffect(() => {
  //   const socket = io('/api/v1/message/ws', {
  //     path: '/socket',
  //     extraHeaders: {
  //       'X-Proxy': "WS",
  //       'Upgrade': 'websocket',
  //       'Connection': 'Upgrade'
  //     }
  //   });
  //   console.log('>>>')
  //   socket.on(socket.id, (...emit) => {
  //     console.log('io', emit)
  //   })
  //
  //   return () => {
  //     socket.close();
  //   }
  // }, []);

  return (
    <>
      <div className={styles.wrap}>
        <div
          className={classNames('relative flex justify-center items-center cursor-pointer', styles.navItem)}
          onClick={() => openUnreadMsgBox(true)}
          ref={toggleRef}
        >
          <Icon
            name="notifications_active"
            size={20}
          />
          <BtnBadge className={styles.count_btn} count={unReadCount.announcement+unReadCount.systemMessage}/>
        </div>
        {renderUnreadMsgBox()}
      </div>
      <ModalMsgCenter/>
    </>
  );
};

export default inject('msgCenter')(observer(NavMsgBar));
