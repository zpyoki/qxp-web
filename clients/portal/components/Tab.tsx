import React, { useState } from 'react'
import { twCascade } from '@mariusmarais/tailwind-cascade'

export interface ITab {
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export const Tab = ({ className, headerClassName, contentClassName }: ITab) => {
  const items = [
    {
      id: 'func',
      name: '功能权限',
      content: <div>hello</div>,
    },
    {
      id: 'department',
      name: '关联员工与部门',
      content: <div>world</div>,
    },
  ]
  const [key, setKey] = useState<string>(items[0].id)

  return (
    <div className={twCascade('transition duration-300', className)}>
      <header className={twCascade('flex flex-row overflow-x-scroll w-full', headerClassName)}>
        {items.map((item) => {
          const active = item.id == key
          return (
            <div
              key={item.id}
              className={twCascade(
                'rounded-dot4 rounded-br-none rounded-bl-none py-1 px-dot-8 cursor-pointer text-dot-7 hover:bg-blue-light hover:text-blue-primary transition duration-300',
                {
                  'bg-blue-light': active,
                  'text-blue-primary': active,
                  'font-bold': active,
                },
                contentClassName,
              )}
              onClick={() => setKey(item.id)}
            >
              {item.name}
            </div>
          )
        })}
      </header>
      <div className="full-w bg-blue-light px-4 py-dot-8">
        {items.find(({ id }) => id === key)?.content}
      </div>
    </div>
  )
}
