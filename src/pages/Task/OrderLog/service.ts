import { request } from '@umijs/max';

export const page = async (params: object) => {
  return request<API.R<any>>('/ppc/workOrder/log/page', {
    method: 'GET',
    params
  });
};

export const cruise = async (id: any) => {
  return request<API.R<any>>(`/ppc/workOrder/log/subTaskLog/${id}`, {
    method: 'GET'
  });
};


export const commandTaskLog = async (id: any) => {
  return request<API.R<any>>(`/ppc/workOrder/log/commandTaskLog/${id}`, {
    method: 'GET'
  });
}



