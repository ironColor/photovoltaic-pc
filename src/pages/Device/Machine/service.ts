import { request } from '@umijs/max';

export const page = async (params: object) => {
  return request<API.R<any>>('/ppc/ppcRobot/page', {
    params,
    method: 'GET'
  });
};

export async function add(body: any) {
  return request<API.R<any>>('/ppc/ppcRobot/save', {
    method: 'POST',
    data: body,
  });
}

export async function detail(id: number) {
  return request<API.R<any>>(`/ppc/ppcRobot/${id}`, {
    method: 'GET'
  });
}

export async function update(body: any) {
  return request<API.R<any>>('/ppc/ppcRobot/update', {
    method: 'PUT',
    data: body,
  });
}

export async function del(body: any) {
  return request<API.R<any>>('/ppc/ppcRobot/delete', {
    method: 'DELETE',
    data: body,
  });
}
