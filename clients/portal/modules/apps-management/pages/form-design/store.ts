import { action, observable, reaction, IReactionDisposer, computed } from 'mobx';
import { UnionColumns } from 'react-table';

import FormStore from '@c/form-builder/store';
import toast from '@lib/toast';
import AppPageDataStore from '@c/form-app-data-table/store';
import { PageTableShowRule, Scheme, setFixedParameters } from '@c/form-app-data-table/utils';

import {
  createFormScheme,
  fetchFormScheme,
  updateFormScheme,
  createPageScheme,
} from './api';
import { getAttribute } from './utils';

class FormDesignStore {
  destroyFetchScheme: IReactionDisposer;
  destroySetTableColumn: IReactionDisposer;
  destroySetTableConfig: IReactionDisposer;
  destroySetFilters: IReactionDisposer;
  destroySetAllFilter: IReactionDisposer;
  destroySetSchema: IReactionDisposer;
  @observable pageID = '';
  @observable appID = '';
  @observable saveSchemeLoading = false;
  @observable appPageStore = new AppPageDataStore({ schema: {} });
  @observable initScheme = {};
  @observable pageLoading = true;
  @observable formStore: FormStore | null = null;
  @observable hasSchema = false;
  @observable pageTableConfig: Record<string, any> = {};
  @observable pageTableShowRule: PageTableShowRule = {};
  @observable filterMaps: FilterMaps = {};

  @computed get fieldsMap(): Record<string, ISchema> {
    return this.formStore?.schema?.properties || {};
  }

  @computed get fieldList(): PageField[] {
    const fieldsMap: any = this.fieldsMap;
    return Object.keys(fieldsMap).filter((_key: string) => {
      return _key !== '_id';
    }).map((key: string) => {
      return {
        id: key,
        label: fieldsMap[key].title || '',
        type: fieldsMap[key].type,
        enum: fieldsMap[key].enum,
        isSystem: fieldsMap[key]['x-internal'].isSystem ? true : false,
        cProps: fieldsMap[key]['x-component-props'],
        ...getAttribute(this.pageTableConfig[key], fieldsMap[key]['x-index']),
      };
    });
  }

  constructor() {
    this.destroyFetchScheme = reaction(() => {
      return { pageID: this.pageID, appID: this.appID };
    }, this.fetchFormScheme);

    this.destroySetAllFilter = reaction(() => this.fieldList, () => {
      if (!this.formStore) {
        return;
      }

      const hasFilterMaps = { ...this.filterMaps };
      Object.keys(this.filterMaps).forEach((id) => {
        if (this.formStore?.schema?.properties && !(id in this.formStore?.schema?.properties)) {
          delete hasFilterMaps[id];
        }
      });
      this.filterMaps = hasFilterMaps;
    });

    this.destroySetSchema = reaction(() => this.formStore?.schema, this.appPageStore.setSchema);
    this.destroySetFilters = reaction(() => this.filterMaps, this.appPageStore.setFilters);

    this.destroySetTableColumn = reaction(() => {
      const column: UnionColumns<any>[] = [];
      [...this.fieldList].sort((a: PageField, b: PageField) => {
        return a.sort - b.sort;
      }).forEach((field) => {
        if (field.visible) {
          column.push({
            id: field.id,
            Header: field.label,
            accessor: field.id,
          });
        }
      });

      return setFixedParameters(this.pageTableShowRule.fixedRule, column);
    }, this.appPageStore.setTableColumns);

    this.destroySetTableConfig = reaction(() => {
      return this.pageTableShowRule;
    }, this.appPageStore.setTableConfig);
  }

  @action
  setFilterMaps = (filters: FilterMaps) => {
    this.filterMaps = filters;
  }

  @action
  setPageID = (pageID: string) => {
    this.pageID = pageID;
  }

  @action
  setAppID = (appID: string) => {
    this.appID = appID;
  }

  @action
  setAllPageTableConfig = (values: Scheme[]) => {
    values.forEach((value) => {
      this.pageTableConfig[value.id] = { ...this.pageTableConfig[value.id], ...value };
    });
  }

  @action
  setPageTableShowRule = (newRule: PageTableShowRule) => {
    this.pageTableShowRule = { ...this.pageTableShowRule, ...newRule };
  }

  @action
  setPageTableConfig = (key: string, newConfig: Scheme) => {
    const _config = { [key]: { ...this.pageTableConfig[key], ...newConfig } };
    this.pageTableConfig = { ...this.pageTableConfig, ..._config };
  }

  @action
  reSetFormScheme = () => {
    this.formStore = new FormStore({ schema: this.initScheme, appID: this.appID, pageID: this.pageID });
  }

  @action
  fetchFormScheme = ({ pageID, appID }: { pageID: string, appID: string}) => {
    if (!pageID || !appID) {
      return;
    }

    this.pageLoading = true;
    fetchFormScheme(appID, pageID).then((res: any) => {
      const { schema = {}, config } = res || {};
      this.hasSchema = res ? true : false;
      this.initScheme = schema;
      this.formStore = new FormStore({ schema, appID, pageID });
      if (config) {
        this.pageTableConfig = config.pageTableConfig || {};
        this.filterMaps = config.filter || {};
        this.pageTableShowRule = config.pageTableShowRule || {};
      }
      this.pageLoading = false;
    }).catch(() => {
      this.pageLoading = false;
    });
  }

  @action
  saveFormScheme = () => {
    this.saveSchemeLoading = true;
    return (this.hasSchema ? updateFormScheme : createFormScheme)(this.appID, {
      schema: this.formStore?.schema,
      tableID: this.pageID,
    }).then(() => {
      (this.formStore as FormStore).hasEdit = false;
      toast.success(this.hasSchema ? '保存成功!' : '创建成功!');
      this.saveSchemeLoading = false;
    }).catch(() => {
      this.saveSchemeLoading = false;
    });
  }

  @action
  clear = () => {
    this.pageID = '';
    this.formStore = null;
    this.pageTableConfig = {};
    this.pageTableShowRule = {};
    this.filterMaps = {};
    this.appPageStore.clear();
  }

  @action
  savePageConfig = () => {
    createPageScheme(this.appID, {
      tableID: this.pageID, config: {
        pageTableConfig: this.pageTableConfig,
        filter: this.filterMaps,
        pageTableShowRule: this.pageTableShowRule,
      },
    }).then(() => {
      toast.success('保存成功!');
    });
  }
}

export default new FormDesignStore();
