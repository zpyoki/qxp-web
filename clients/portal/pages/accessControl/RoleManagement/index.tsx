import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'

import { Card } from '@portal/components/Card'
import { RoleList } from './RoleList'
import { RoleDetail } from './RoleDetail'
import { getRolesList } from './api'
import Role from './role'
import { Loading } from '@QCFE/lego-ui'

export const RoleManagement = () => {
  const { data = [], isLoading } = useQuery('getRolesList', getRolesList, {
    refetchOnWindowFocus: false,
  })
  const [roleId, setRoleId] = useState<string | number>('')
  useEffect(() => {
    if (data.length) {
      setRoleId(data[0].id)
    }
  }, [data])

  const roleList = data.map(({ tag, name, id }) => new Role(name, id, tag))

  if (isLoading) {
    return <Loading />
  }

  return (
    <Card
      className="ml-0 mt-0 mr-0 mb-0 px-4 pt-dot-8 pb-0"
      headerClassName="bg-F1F5F9-dot-5 -mx-4 -mt-dot-8 px-4 py-dot-8 header-background-image"
      title="角色管理"
      desc="平台默认的角色，默认具有企业所有功能权限和全部数据可见范围。"
      action={
        <a className="transition-all duration-300 ease-linear text-dot-7 underline text-324558">
          📌 如何管理角色？
        </a>
      }
    >
      <div className="flex flex-row items-stretch">
        <div className="flex-1 pt-4 pb-4">
          <RoleList items={roleList} onChange={setRoleId} />
        </div>
        <div className="vertical-line flex-grow-0"></div>
        <div className="flex-2-dot-8 p-4">
          <RoleDetail id={roleId} role={roleList.find(({ id }) => id == roleId)} />
        </div>
      </div>
    </Card>
  )
}
