import { request } from '@umijs/max';
import { removeAll, setToken } from '@/utils/authority';
import { message } from 'antd';
import { stringify } from 'querystring';
import { history } from '@@/core/history';

export const login = async (body: Login.LoginParams) => {
  removeAll();

  const { code, data, msg } = await request<API.R<Login.LoginResult>>('/admin/login', {
    method: 'POST',
    data: body
  });

  if (code === 0) {
    message.success('登录成功');
    const urlParams = new URL(window.location.href).searchParams;
    window.location.href = urlParams.get('redirect') || '/';

    setToken(data.tokenHead + data.token);
  } else {
    message.error(msg || '登录失败，请重试');
  }
  return code;
};

export async function currentUser() {
  return request<API.R<Login.CurrentUser>>('/admin/info', { method: 'GET' });
}

export async function outLogin() {
  const { code } = await request<API.R<string>>('/admin/logout', {
    method: 'POST'
  });

  if (code === 0) {
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    // 此方法会跳转到 redirect 参数所在的位置
    const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/login' && !redirect) {
      history.replace({
        pathname: '/login',
        search: stringify({
          redirect: pathname + search
        })
      });
    }
    message.success('退出成功');
    removeAll();
  } else {
    message.error('退出失败，请重试');
  }
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.R<Login.LoginResult>>('/api/notices', {
    method: 'GET',
    ...(options || {})
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.R<Login.LoginResult>>('/api/rule', {
    method: 'GET',
    params: {
      ...params
    },
    ...(options || {})
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.R<Login.LoginResult>>('/api/rule', {
    method: 'PUT',
    ...(options || {})
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.R<Login.LoginResult>>('/api/rule', {
    method: 'POST',
    ...(options || {})
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<API.R<Login.LoginResult>>('/api/rule', {
    method: 'DELETE',
    ...(options || {})
  });
}
