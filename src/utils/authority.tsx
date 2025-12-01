/**
 * 存储Token到localStorage
 *
 * @param token token字符串
 */
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * 获取Token
 */
export const getToken = (): string => {
  return localStorage.getItem('token') || '';
};

/**
 * 存储refreshToken到localStorage
 *
 * @param refreshToken 角色ID的数组
 */
export const setAuthority = (refreshToken: string): void => {
  return localStorage.setItem('refreshToken', refreshToken);
};

/**
 * 获取refreshToken
 */
export const getRefreshToken = (): string => {
  return localStorage.getItem('refreshToken') || '';
};

/**
 * 存储当前用户信息
 *
 * @param account 用户信息
 */
export const setCurrentUser = (account: { [key: string]: any }) => {
  localStorage.setItem('userInfo', JSON.stringify(account));
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = (): { [key: string]: any } => {
  return JSON.parse(localStorage.getItem('userInfo') || '{}');
};

/**
 * 删除所有用户信息
 */
export const removeAll = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
};
