import { request } from '@umijs/max';

export const page = async (params: object) => {
  return request<API.R<{ records: Land.Item[]; total: number }>>('/ppc/workOrder/page', {
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
  return request<API.R<any>>('/ppc/workOrder/delete', {
    method: 'DELETE',
    data: body,
  });
}

export async function getParams(params: {}) {
  return request<API.R<any>>(`/parameter/parameterCode/`, {
    params,
    method: 'GET'
  });
}


export const page2 = async (params: object) => {
  return request<API.R<any>>('/ppc/ppcRobot/page', {
    params,
    method: 'GET'
  });
};

export const detailMock = async (params: number) => {
  return request<API.R<any>>(`/ppc/ppcLand/${params}`, {
    method: 'GET'
  });
};

export const tree = async () => {
  return request<API.R<[]>>('/ppc/ppcArea/tree', {
    method: 'GET'
  });
};

export const getPointOptions = async (params: any) => {
  return request<API.R<any>>(`/ppc/point/list/${params.areaId}/${params.type}`, {
    method: 'GET'
  });
};

export const getGroupList = async (params: any) => {
  return request<API.R<any>>('/ppc/uav/list', {
    params,
    method: 'GET'
  });
};

export const getTime = async (body: any) => {
  return request<API.R<any>>('/ppc/workOrder/getEstimatedWorkTime', {
    data: body,
    method: 'POST'
  })
}

export const saveInfo = async (body: any) => {
  return request<API.R<any>>('/ppc/workOrder/save', {
    method: 'POST',
    data: body,
  });
}


export const detailInfo = async (orderId: number) => {
  return request<API.R<any>>(`/ppc/workOrder/detail/${orderId}`, {
    method: 'GET'
  });
}

export const updateInfo = async (body: any) => {
  return request<API.R<any>>('/ppc/workOrder/update', {
    method: 'PUT',
    data: body,
  });
}

export const workOrderExcuteQuery = async (params: any) => {
  return request<API.R<any>>('/ppc/workOrder/monitor/page', {
    method: 'GET',
    data: params,
  });
}

export const workOrderExcute = async (params: any) => {
  return request<API.R<any>>('/ppc/workOrder/monitor/execute', {
    method: 'GET',
    params: params,
  });
}

export const workOrderImmediate = async (params: any) => {
  return request<API.R<any>>(`/ppc/workOrder/monitor/inner/${params.id}`, {
    method: 'GET'
  });
}

export const getWorkList = async (params: any) => {
  return request<API.R<any>>(`/ppc/workOrder/subtask/${params.id}`, {
    method: 'GET'
  });
}

export const commandApi = async (body: any) => {
  return request<API.R<any>>('/ppc/workOrder/monitor/command', {
    method: 'POST',
    data: body
  })
}

export const getParameter = async (params: any) => {
  return request<API.R<any>>('/parameter/page', {
    params,
    method: 'GET'
  });
}

export const getLandListAll = async (id: any) => {
  return request<API.R<any>>(`/ppc/ppcLand/list/${id}`, {
    method: 'GET'
  });
}