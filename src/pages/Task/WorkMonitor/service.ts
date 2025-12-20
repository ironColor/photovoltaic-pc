import { request } from '@@/exports';

export const page = async (params: object) => {
  return request<API.R<{ records: Land.Item[]; total: number }>>('/ppc/workOrder/monitor/page', {
    params: {
      ...params
    },
    method: 'GET'
  });
};