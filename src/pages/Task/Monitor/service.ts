import { request } from '@umijs/max';

export const page = async (params: object) => {
  return request<API.R<any>>('/ppc/ppcParentTask/monitorPage', {
    params,
    method: 'GET'
  });
};

export async function execute(body: any) {
  return request<API.R<any>>('/ppc/ppcParentTaskLog/command', {
    method: 'POST',
    data: body
  });
}

export async function detail(params: number) {
  return request<API.R<any>>(`/ppc/ppcParentTask/${params}`, {
    method: 'GET'
  });
}

export const executeLog = async (params: object) => {
  return request<API.R<any>>('/ppc/ppcParentTaskLog/execute', {
    method: 'GET',
    params
  });
};

export const getParams = async (params: object) => {
  return request<API.R<any>>('/parameter/parameterCode', {
    method: 'GET',
    params
  });
};

export async function updateParams(body: any) {
  return request<API.R<any>>('/parameter/update', {
    method: 'PUT',
    data: body
  });
}

export const getRobotList = async () => {
  return request<API.R<any>>('/ppc/ppcRobot/list', {
    method: 'GET'
  });
};
