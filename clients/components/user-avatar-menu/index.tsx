import React, { useRef, useState } from 'react';
import cs from 'classnames';

import ResetPasswordModal from '@portal/global-header/reset-password-modal';
import Avatar from '@c/avatar';
import Icon from '@c/icon';
import Popper from '@c/popper';

import './index.scss';

interface Props {
  className?: string;
}

export default function UserAvatarMenu({ className }: Props): JSX.Element {
  const [openResetPasswordModal, setOpenResetPasswordModal] = useState<boolean>(false);
  const reference = useRef<HTMLDivElement>(null);
  const popperRef = useRef<Popper>(null);
  const [show, setShow] = useState(popperRef.current?.state.popVisible);

  function handleEditPasswordClick(): void {
    setOpenResetPasswordModal(true);
    popperRef.current?.close();
  }

  function handleLogOutClick(): void {
    window.location.href = '/logout';
  }

  return (
    <div>
      {openResetPasswordModal && (
        <ResetPasswordModal
          visible={openResetPasswordModal}
          onCancel={() => setOpenResetPasswordModal(false)}
        />)}
      <div
        className={cs('cursor-pointer flex items-center h-36 transition', className)}
        ref={reference}
      >
        <Avatar
          username={window.USER?.userName || ''}
        />
        <Icon name={show ? 'arrow_drop_up' : 'arrow_drop_down'} className='text-current' size={20} />
      </div>
      <Popper
        reference={reference}
        ref={popperRef}
        className='corner-12-2-12-12'
        onVisibilityChange={(visible)=> setShow(visible)}
        placement='bottom-start'
        trigger='hover'
      >
        <div className='user-avatar-menu corner-12-2-12-12'>
          <div className='user-avatar-menu-bg flex py-20'>
            <div className='pl-20'>
              <Avatar
                username={window.USER?.userName || ''}
                size={48}
              />
            </div>
            <div className='flex flex-col ml-8'>
              <span className='text-20 font-medium text-gray-900'>
                {window.USER.userName}
              </span>
              <span className='pr-20 text-12 text-gray-600'>
                {window.SIDE === 'portal' ?
                  `角色: ${window.USER_ADMIN_ROLES[0]?.name || '-'}` : (window.USER.email || window.USER.phone)}
              </span>
            </div>
          </div>
          <div className='text-gray-600 flex flex-col mx-16 cursor-pointer'>
            <div
              className='user-avatar-menu-password'
              onClick={handleEditPasswordClick}
            >
              <Icon name='password' />
              <span className='ml-4'>修改密码</span>
            </div>
            <div className='user-avatar-menu-logout' onClick={handleLogOutClick}>
              <Icon name='logout' />
              <span className='ml-4'>退出登录</span>
            </div>
          </div>
        </div>
      </Popper>
    </div>
  );
}