import { request } from '@umijs/max';

export const page = async (params: object) => {
  return request<API.R<{ records: Land.Item[]; total: number }>>('/ppc/ppcParentTask/page', {
    params: {
      ...params
    },
    method: 'GET'
  });
};

export async function add(body: any) {
  return request<API.R<any>>('/ppc/ppcParentTask/save', {
    method: 'POST',
    data: body,
  });
}

export async function areaList() {
  return request<API.R<any>>('/ppc/ppcArea/list', {
    method: 'GET',
  });
}

export async function detail(id: number) {
  return request<API.R<any>>(`/ppc/ppcParentTask/${id}`, {
    method: 'GET'
  });
}

export async function update(body: any) {
  return request<API.R<any>>('/ppc/ppcParentTask/update', {
    method: 'PUT',
    data: body,
  });
}

export async function del(body: any) {
  return request<API.R<any>>('/ppc/ppcParentTask/disable', {
    method: 'PUT',
    data: body,
  });
}

export async function getParams(params: {}) {
  return request<API.R<any>>(`/parameter/parameterCode/`, {
    params,
    method: 'GET'
  });
}
