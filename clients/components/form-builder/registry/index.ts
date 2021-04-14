import { DatePicker } from '@formily/antd-components';
import { Dictionary, groupBy, orderBy } from 'lodash';
import elements, { Elements } from './elements';

type RemoteFuncs = {
  [key: string]: {
    title: string;
    func: (params: any) => Promise<any>;
  };
}

const AVAILABLE_CATEGORIES: Array<{ title: string; key: ElementCategory }> = [
  { title: '基础字段', key: 'basic' },
  // { title: '高级字段', key: 'advance' },
  // { title: '布局字段', key: 'layout' },
];

class Registry {
  elements: Elements;
  components: { [key: string]: React.JSXElementConstructor<any>; } = {};
  categories: Array<{ title: string; key: ElementCategory }>;
  categorizedElements: Dictionary<SourceElement<any>[]>;
  // todo remove this
  remoteFuncs: RemoteFuncs;
  // todo remove this
  wrapperElements: string[];

  constructor() {
    this.elements = elements;
    this.categories = AVAILABLE_CATEGORIES;
    const orderFormItems = orderBy(this.elements, ['displayOrder']);
    this.categorizedElements = groupBy(orderFormItems, (item) => {
      return item.category;
    });
    this.getComponents();

    // todo remove this
    this.remoteFuncs = {};
    // todo remove this
    this.wrapperElements = [];
  }

  // register external forms
  merge(formData: typeof elements) {
    Object.assign(this.elements, formData);
  }

  registerRemoteFuncs(remoteFuncs: RemoteFuncs) {
    Object.assign(this.remoteFuncs, remoteFuncs);
  }

  getRemoteFunc(name: string) {
    return this.remoteFuncs[name];
  }

  getComponents() {
    Object.keys(this.elements).forEach((key: string) => {
      const { component } = this.elements[key];
      this.components[key] = component;
    });

    // todo fix this
    this.components.YearPicker = DatePicker.YearPicker;
    this.components.MonthPicker = DatePicker.MonthPicker;
  }

  getFormComponent(type: string) {
    return this.elements[type]?.component;
  }
}

export { Registry };

export default new Registry();
