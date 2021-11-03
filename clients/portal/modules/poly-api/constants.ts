import { ArrowHeadType, ConnectionLineType } from 'react-flow-renderer';

import nodes from './nodes';

export const POLY_DESIGN_CONFIG = {
  EDGE_COLOR: '#CBD5E1',
  BACKGROUND_COLOR: '#E6ECF9',
  ARROW_HEAD_TYPE: ArrowHeadType.ArrowClosed,
  EDGE_TYPE: ConnectionLineType.SmoothStep,
  NODE_TYPES: nodes,
};
