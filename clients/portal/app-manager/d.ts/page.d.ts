type PageInfo = {
  id: string;
  appID?: string;
  name?: string;
  icon?: string;
  describe?: string;
  groupID?: string;
  child?: PageInfo[];
  menuType?: number;
  sort?: number;

}

type GroupInfo = {
  id?: string;
  appID?: string;
  name?: string;
  groupID?: string;
}
