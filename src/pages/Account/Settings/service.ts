import { request } from '@umijs/max';

export async function updateUser(values: any) {
  return request<API.R<any>>(`/admin/update/${values.username}`, {
    data: { bindName: values.bindName },
    method: 'POST'
  });
}
