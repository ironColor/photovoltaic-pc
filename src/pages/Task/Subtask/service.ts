import { request } from '@umijs/max';

export const page = async (params: any) => {
  return request<API.R<any>>('/ppc/ppcTask/page', {
    params: {
      ...params,
      size: params.pageSize
    },
    method: 'GET'
  });
};

export async function detail(id: number) {
  return request<API.R<any>>(`/ppc/ppcTask/${id}`, {
    method: 'GET'
  });
}

// ---- 同步小程序任务 ----
export async function sync(id: string) {
  return request<API.R<any>>(`/sync/resource/${id}`, {
    method: 'POST'
  });
}

// 获取场地列表
export async function getAreaList(username: string) {
  return request<API.R<any>>(`/sync/areas/${username}`, {
    method: 'GET'
  });
}
