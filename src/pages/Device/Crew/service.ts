import { request } from '@umijs/max';

export const page = async (params: object) => {
  return request<API.R<any>>('/ppc/ppcRobot/page', {
    params,
    method: 'GET'
  });
};