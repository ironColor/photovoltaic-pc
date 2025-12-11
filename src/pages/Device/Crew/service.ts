import { request } from '@umijs/max';

export const page = async (params: object) => {
  return request<API.R<any>>('/ppc/uav/page', {
    params,
    method: 'GET'
  });
};

export const saveInfo = async (params: object) => {
  return request<API.R<any>>('/ppc/uav/save', {
    method: 'POST',
    data: params
  });
};


export const robotPage = async (params: object) => {
  return request<API.R<any>>('/ppc/ppcRobot/page', {
    params,
    method: 'GET'
  });
};

export const delGroup = async (params: object) => {
  return request<API.R<any>>('/ppc/uav/delete', {
    method: 'DELETE',
    data: params
  });
};

export const detailInfo = async (id: number) => {
  return request<API.R<any>>(`/ppc/uav/${id}`, {
    method: 'GET'
  });
};

export const update = async (params: object) => {
  return request<API.R<any>>('/ppc/uav/update', {
    method: 'PUT',
    data: params
  });
};