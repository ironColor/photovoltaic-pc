import { request } from '@umijs/max';

export const page = async (params: object) => {
  return request<API.R<any>>('/ppc/ppcParentTaskLog/page', {
    method: 'GET',
    params
  });
};

export const cruise = async (id: number) => {
  return request<API.R<any>>(`/ppc/ppcParentTaskLog/${id}`, {
    method: 'GET'
  });
};
