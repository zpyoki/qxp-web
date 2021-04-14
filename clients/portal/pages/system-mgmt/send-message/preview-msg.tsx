import React from 'react';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import classNames from 'classnames';
import FileList from './filelist';
import { MsgType } from '@portal/const/message';

interface Props {
  className?: string;
  prevData: Qxp.DraftData | null;
}

const PreviewMsg = ({ prevData }: Props) => {
  if (!prevData) {
    return (
      <div>暂无预览数据</div>
    );
  }

  const { title, content, receivers, type }=prevData;

  let txt = '';
  if (type === MsgType.notify) {
    txt = '通知公告';
  }
  if (type === MsgType.system) {
    txt = '系统消息';
  }

  return (
    <div className={styles.previewMsg}>
      <div className={styles.previewMsgContent}>
        <div className={styles.title}>{title}</div>
        <div className={styles.info}>{dayjs().format('YYYY-MM-DD HH:mm:ss')} {txt}</div>

        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      <div>
        <FileList candownload files={ (prevData.mes_attachment || [])}/>
      </div>

      <div className={styles.pre_receivers}>
        <div className={styles.pre_receivers_title}>该消息将发送至:</div>
        {receivers&&receivers.map(({ id, type, name })=> (<span
          className={classNames(styles.person, {
            [styles.isDep]: type === 2,
            [styles.isPerson]: type === 1,
          })}
          key={id}
        >
          <span>{name}</span>
        </span>))}
      </div>
    </div>
  );
};

export default PreviewMsg;
