import React from 'react'

import { RoleManagement } from './RoleManagement'
import { MailList } from './MailList'

export interface IContent {
  menuType: string
}

export const Content = ({ menuType }: IContent) => {
  return (
    <>
      {menuType === 'corporateDirectory' && <MailList />}
      {menuType === 'RoleManagement' && <RoleManagement />}
    </>
  )
}
