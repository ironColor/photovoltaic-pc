import { request } from '@umijs/max';

export const page = async (params: object) => {
  return request<API.R<any>>('/parameter/page', {
    params,
    method: 'GET'
  });
};

export async function add(body: any) {
  return request<API.R<any>>('/parameter/save', {
    method: 'POST',
    data: body,
  });
}

export async function detail(id: number) {
  return request<API.R<any>>(`/parameter/${id}`, {
    method: 'GET'
  });
}

export async function update(body: any) {
  return request<API.R<any>>('/parameter/update', {
    method: 'PUT',
    data: body,
  });
}

export async function del(body: any) {
  return request<API.R<any>>('/parameter/delete', {
    method: 'DELETE',
    data: body,
  });
}
