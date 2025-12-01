import { request } from '@umijs/max';

export const page = async (params: object) => {
  return request<API.R<any>>('/ppc/ppcRtk/page', {
    params,
    method: 'GET'
  });
};

export async function add(body: any) {
  return request<API.R<any>>('/ppc/ppcRtk/save', {
    method: 'POST',
    data: body,
  });
}

export const list = async () => {
  return request<API.R<any>>('/ppc/ppcRtk/list', {
    method: 'GET'
  });
};

export async function detail(id: number) {
  return request<API.R<any>>(`/ppc/ppcRtk/${id}`, {
    method: 'GET'
  });
}

export async function update(body: any) {
  return request<API.R<any>>('/ppc/ppcRtk/update', {
    method: 'PUT',
    data: body,
  });
}

export async function del(body: any) {
  return request<API.R<any>>('/ppc/ppcRtk/delete', {
    method: 'DELETE',
    data: body,
  });
}
