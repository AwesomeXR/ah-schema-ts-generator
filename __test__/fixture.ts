import { SchemaObject } from 'ah-api-type';

export const IGetDetailReq: SchemaObject = {
  type: 'object',
  description: 'xxx',
  properties: {
    totalCheckInCnt: { type: 'number' },
    readUVCnt: { type: 'integer' },
    persons: {
      description: 'persons_desc',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          cnName: { type: 'string' },
          receiveFlowerTotalCount: { type: 'integer' },
          receiveFlowerUserCount: { type: 'integer' },
          pavilionCategoryId: { type: 'integer' },
          cover: { type: 'string' },
          deedDesc: { type: 'string' },
          isDead: { type: 'boolean' },
        },
        required: ['id'],
      },
    },
  },
};
