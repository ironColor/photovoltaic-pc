import { request } from '@@/exports';

export const getList = async (params: any) => {
  return request<API.R<any>>(`/ppc/point/page`, {
    params,
    method: 'GET'
  });
}