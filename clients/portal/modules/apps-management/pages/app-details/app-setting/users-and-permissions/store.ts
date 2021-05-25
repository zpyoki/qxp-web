import { action, observable } from 'mobx';

import toast from '@lib/toast';

import { fetchPageList } from '../../api';
import {
  fetchRights,
  movePerGroup,
  updatePerGroup,
  createPerGroup,
  deleteRights,
  fetchPerGroupForm,
  deleteFormPer,
} from './api';

class UserAndPerStore {
  @observable rightsLoading = true;
  @observable perFormLoading = true;
  @observable perFormList: PageInfo[] = [];
  @observable rightsList: Rights[] = [];
  @observable appID = '';

  @action
  addRightsGroup = (rights: RightsCreate) => {
    return createPerGroup(this.appID, rights).then((res) => {
      this.rightsList = [...this.rightsList, { ...rights, ...res.data }];
    });
  }

  @action
  deleteRight = (id: string) => {
    const delAfter = this.rightsList.filter((rights) => id !== rights.id);
    deleteRights(this.appID, {
      id, moveArr: delAfter.map((AFrights, sequence) => {
        return { id: AFrights.id, sequence };
      }),
    }).then(() => {
      toast.success('删除成功!');
      this.rightsList = delAfter;
    });
  }

  @action
  fetchRights = () => {
    this.rightsLoading = true;
    fetchRights(this.appID).then((res) => {
      this.rightsList = res.data.list;
      this.rightsLoading = false;
    }).catch(() => {
      this.rightsLoading = false;
    });
  }

  @action
  updatePerGroup = (rights: Rights) => {
    return updatePerGroup(this.appID, rights).then(() => {
      this.rightsList = this.rightsList.map((_rights) => {
        if (rights.id === _rights.id) {
          return { ..._rights, ...rights };
        }
        return _rights;
      });
      toast.success('修改成功！');
      return true;
    });
  }

  @action
  rightsGroupSort = (rightsIdList: string[]) => {
    const newRightsList: Rights[] = [];
    movePerGroup(this.appID, {
      moveArr: rightsIdList.map((id, index) => {
        const rights = this.rightsList.find((_rights) => _rights.id === id);
        if (rights) {
          newRightsList.push({
            ...rights,
            sequence: index,
          });
        }
        return {
          id,
          sequence: index,
        };
      }),
    });
    this.rightsList = newRightsList;
  }

  @action
  fetchPerGroupForm = () => {
    this.perFormLoading = true;
    Promise.all([fetchPageList(this.appID), fetchPerGroupForm(this.appID)]).then(([allPageRes, perPage])=>{
      console.log('allPageRes, perPage: ', allPageRes, perPage);
      let allPages: PageInfo[] = [];
      allPageRes.data.menu.forEach((menu: PageInfo) => {
        if (menu.menuType === 1 && menu.child?.length) {
          allPages = allPages.concat(menu.child.map((cMenu)=>{
            return { ...cMenu, name: `${menu.name}/${cMenu.name}` };
          }));
          return;
        }

        allPages.push(menu);
      });
      this.perFormList = allPages;
      this.perFormLoading = false;
      console.log(allPages, 'allPages');
    }).catch(()=>{
      this.perFormLoading = false;
    });
  }

  @action
  deleteFormPer = (formID: string, perGroupID:string)=>{
    deleteFormPer(this.appID, { formID, perGroupID }).then(()=>{
      toast.success('清除成功');
    });
  }
}

export default new UserAndPerStore();
