type TreeNode<T> = Readonly<{
  // data is the information node holds
  data: T;

  name: string;
  id: string;
  parentId: string | null;
  path: string;

  isLeaf: boolean;
  expanded: boolean;
  order: number;
  level: number;
  visible: boolean;
  positionY?: number;
  childrenStatus: 'resolved' | 'unknown' | 'loading';

  children?: TreeNode<T>[];
}>;
