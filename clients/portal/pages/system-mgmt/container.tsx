import React from 'react';
// import {Breadcrumb} from '@QCFE/lego-ui';
import classNames from 'classnames';
import { NavLink, useHistory } from 'react-router-dom';
import Icon from '@c/icon';
import InfoCard from './info-card';

import styles from './styles.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
  hideInfoCard?: boolean;
  asModalPage?: boolean; // 类似modal的页面
}

const Container = ({
  className,
  children,
  hideInfoCard,
  asModalPage,
}: Props) => {
  const history=useHistory();
  const goBack=()=> {
    history.goBack();
  };

  const renderBreadcrumb=()=> {
    // todo
    return (
      <div className={classNames('flex align-center', styles.breadcrumb)}>
        <Icon name='reply' size={20} onClick={goBack}/>
        <NavLink to='/system'>系统管理</NavLink>
        <span className={styles.divider}>/</span>
        <NavLink to='/system/message'>消息管理</NavLink>
        <span className={styles.divider}>/</span>
        <span className={styles.current}>发送消息</span>
      </div>
    );
  };

  return (
    <div className={classNames('py-20 px-58 flex justify-center items-start flex-grow overflow-hidden', className)}>
      {!hideInfoCard && <InfoCard/>}
      {
        asModalPage ? (
          <>
            {renderBreadcrumb()}
            {children}
          </>
        ) : (
          <div className="h-full flex-grow bg-white rounded-12 overflow-hidden">
            {children}
          </div>
        )
      }
    </div>
  );
};

export default Container;
