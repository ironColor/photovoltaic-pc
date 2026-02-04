import { request } from '@umijs/max';

export const tree = async () => {
  return request<API.R<[]>>('/ppc/ppcArea/tree', {
    method: 'GET'
  });
};

export const list = async () => {
  return request<API.R<[]>>('/ppc/ppcArea/list', {
    method: 'GET'
  });
};

export const land = async (params: object) => {
  return request<API.R<{ records: Land.Item[]; total: number }>>('/ppc/ppcLand/page', {
    params,
    method: 'GET'
  });
};

export const detail = async (params: number) => {
  return request<API.R<any>>(`/ppc/ppcLand/${params}`, {
    method: 'GET'
  });
};


export const newTree = async () => {
  return request<API.R<[]>>('/basicInfo/area', {
    method: 'GET'
  });
};

export const specialTree = async () => {
  return request<API.R<[]>>('/basicInfo/land', {
    method: 'GET'
  });
};