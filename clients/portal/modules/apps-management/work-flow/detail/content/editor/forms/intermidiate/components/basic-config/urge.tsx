import React, { MouseEvent, useState, ChangeEvent } from 'react';
import cs from 'classnames';

import More from '@c/more';
import Icon from '@c/icon';
import Checkbox from '@c/checkbox';
import ToolTip from '@c/tooltip';
import type { Urge, UrgeItem } from '@flow/detail/content/editor/type';
import ActionButtonGroup from '@flow/detail/content/editor/components/_common/action-button-group';

import TimerSelector from './timer-selector';

interface Props {
  onSave: (urge: Urge) => void;
  defaultValue?: Urge;
}

const initialUrge = {
  day: 0,
  hours: 0,
  minutes: 0,
  repeat: {
    day: 0,
    hours: 0,
    minutes: 0,
  },
};

export default function Urge({ onSave, defaultValue }: Props) {
  const [openRepeatSetting, setOpenRepeatSetting] = useState(false);
  const [isUrgeOpen, setIsUrgeOpen] = useState(false);
  const [validating, setValidating] = useState(false);
  const [urge, setUrge] = useState<Urge>(defaultValue || initialUrge);

  function onClearUrge(e: MouseEvent) {
    e.stopPropagation();
    setUrge(initialUrge);
    onSave(initialUrge);
    setOpenRepeatSetting(false);
  }

  function onSetUrge(key: string) {
    return (value: string) => {
      setUrge((s) => ({
        ...s,
        [key]: value,
      }));
    };
  }

  function onSetUrgeRepeat(key: string) {
    return (value: string) => {
      setUrge((s) => ({
        ...s,
        repeat: {
          ...s.repeat,
          [key]: value,
        },
      }));
    };
  }

  function onSetRepeat(e: ChangeEvent<HTMLInputElement>) {
    const isChecked = e.target.checked;
    if (isChecked) {
      setOpenRepeatSetting(true);
    } else {
      setUrge((s) => ({ ...s, repeat: { day: 0, hours: 0, minutes: 0 } }));
      setOpenRepeatSetting(false);
    }
  }

  function onSubmit(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (openRepeatSetting && !+urge?.day && !+urge?.hours && !+urge?.minutes) {
      setValidating(true);
      return;
    }
    onSave(urge);
    onCancel();
  }

  function onCancel() {
    setValidating(false);
    setIsUrgeOpen(false);
  }

  function getTimeText(urge: UrgeItem) {
    let text = '';
    if (urge.day) {
      text += `${urge.day}天`;
    }
    if (urge.hours) {
      text += `${urge.hours}小时`;
    }
    if (urge.minutes) {
      text += `${urge.minutes}分钟`;
    }
    return text;
  }

  function hasTime(arg: Urge): boolean {
    return ['day', 'hours', 'minutes'].some((key: string) => {
      // @ts-ignore
      return arg[key] && arg[key] !== '0';
    });
  }

  const hasUrge = hasTime(urge);
  const hasRepeat = hasTime(urge.repeat as Urge);

  return (
    <div>
      <More<JSX.Element>
        open={isUrgeOpen}
        contentClassName="left-0 right-auto w-full work-flow-urge p-0"
        items={[
          <div className="px-16 pt-16" key="urgeSettings" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center">
              <span className="mr-5">设置催办</span>
              <ToolTip
                position="top"
                label="超时后将不再进行催办"
                labelClassName="whitespace-nowrap"
                inline
              >
                <Icon name="info" />
              </ToolTip>
            </div>
            <TimerSelector
              onDayChange={onSetUrge('day')}
              onHoursChange={onSetUrge('hours')}
              onMinutesChange={onSetUrge('minutes')}
              defaultDay={urge.day}
              defaultHours={urge.hours}
              defaultMinutes={urge.minutes}
              style={{ borderBottom: 'none' }}
              validating={validating}
            />
            <div className="bg-blue-100 py-5 px-16 mb-16 text-blue-600">
              提前 <span>
                {urge.day ? `${urge.day}天` : ''}
                {urge.hours ? `${urge.hours}小时` : ''}
                {urge.minutes ? `${urge.minutes}分钟` : ''}
              </span> 催办负责人
            </div>
          </div>,
          <div className="px-16 pb-16" key="urgeRepeat" onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={openRepeatSetting} label="重复催办" onChange={onSetRepeat} />
            {openRepeatSetting && (
              <>
                <TimerSelector
                  onDayChange={onSetUrgeRepeat('day')}
                  onHoursChange={onSetUrgeRepeat('hours')}
                  onMinutesChange={onSetUrgeRepeat('minutes')}
                  defaultDay={urge.repeat.day}
                  defaultHours={urge.repeat.hours}
                  defaultMinutes={urge.repeat.minutes}
                  style={{ borderBottom: 'none' }}
                />
                <div className="bg-blue-100 py-5 px-16 mb-16 text-blue-600">
                每隔 <span>{getTimeText(urge.repeat)}</span> 催办一次
                </div>
              </>
            )}
          </div>,
          <ActionButtonGroup key="urgeAction" onCancel={onCancel} onSubmit={onSubmit} />,
        ]}
      >
        <div
          className="corner-2-8-8-8 mt-16 bg-gray-100 px-16 py-5 flex items-center
           cursor-pointer justify-between"
          onClick={() => setIsUrgeOpen(true)}
        >
          <div className="item items-center flex">
            <Icon name="timer" className={cs('mr-8', { 'text-blue-600': hasUrge || hasRepeat })} />
            {(hasUrge || hasRepeat) && (
              <div className="flex flex-col">
                {hasUrge && (
                  <span className="text-body2-no-color text-blue-600">
                    提前 {getTimeText(urge)} 催办
                  </span>
                )}
                {hasRepeat && (
                  <span className="text-body2-no-color text-blue-600">
                    每隔 {getTimeText(urge.repeat)} 重复
                  </span>
                )}
              </div>
            )}
            {!hasUrge && !hasRepeat && (
              <span>设置催办</span>
            )}
          </div>
          {(hasUrge || hasRepeat) && (
            <Icon name="close" className="cursor-pointer" onClick={onClearUrge} />
          )}
        </div>
      </More>
    </div>
  );
}