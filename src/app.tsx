import Footer from '@/components/Footer';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { requestConfig } from './requestConfig';
import { currentUser as queryCurrentUser } from './pages/Login/service';
import React, { useState } from 'react';
import { AvatarDropdown, AvatarName } from './components/RightContent/AvatarDropdown';
import userIco from '../public/picture/user.png';
import { getToken, setCurrentUser } from '@/utils/authority';
import logo from '../public/logo/logo.png';
import { message, Modal, Select, Tooltip } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { getAreaList, sync } from '@/pages/Task/Subtask/service';
// const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/login';

/**
 * 会在整个应用最开始执行，返回值作为全局共享数据
 * 通过useModel('@@initialState')获取返回值
 *
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: Login.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<Login.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const { data } = await queryCurrentUser();
      setCurrentUser(data);
      return data;
    } catch (error) {
      console.error('获取用户信息失败!!!');
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    // todo
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>
  };
}

/**
 * 项目布局
 * 在构建时无法使用dom，所有有些配置可能需要运行时来配置
 *
 * @param initialState
 * @param setInitialState
 * @see ProLayout支持的api https://procomponents.ant.design/components/layout
 */
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const [lock, setLock] = useState(false);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [area, setArea] = useState('');

  return {
    actionsRender: () => [
      <Tooltip title='同步子任务' key={'sync'}>
        <SyncOutlined
          onClick={async () => {
            if (!lock) {
              const { code, msg, data } = await getAreaList(
                initialState?.currentUser?.bindName || 'undefined'
              );
              if (code !== 0) {
                message.error('获取场地失败，请确保已绑定用户');
                return;
              }
              setData(data);
              setOpen(true);
              setTimeout(() => {
                setLock(false);
              }, 5 * 60 * 1000);
            } else {
              message.warning('请勿频繁点击，五分钟后再试');
            }
          }}
        />
        <Modal
          title='选择同步场地'
          open={open}
          onOk={async () => {
            if (!area) {
              message.error('请选择场地');
              return;
            }
            const { code, msg } = await sync(area);
            if (code === 0) {
              setOpen(false);
              message.success(msg || '同步成功');
              history.go(0);
            } else {
              message.error(msg || '同步失败');
              return;
            }
            setLock(true);
          }}
          onCancel={() => setOpen(false)}
        >
          <Select
            showSearch
            placeholder='请选择场地'
            optionFilterProp='label'
            onChange={e => setArea(e)}
            style={{ width: '100%' }}
            options={data.map((i: any) => ({
              value: i.areaId,
              label: i.areaName
            }))}
          />
        </Modal>
      </Tooltip>
    ],
    avatarProps: {
      src: initialState?.currentUser?.icon || userIco,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      }
    },
    // footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser || (!getToken() && location.pathname !== loginPath)) {
        history.push(loginPath);
      }
    },
    logo: logo,
    menuHeaderRender: undefined,
    // 自定义 403 页面
    unAccessible: <div>未授权</div>,
    childrenRender: children => {
      // 增加一个 loading 的状态
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {/*<SettingDrawer*/}
          {/*  disableUrlParams*/}
          {/*  enableDarkTheme*/}
          {/*  settings={initialState?.settings}*/}
          {/*  onSettingChange={settings => {*/}
          {/*    setInitialState(preInitialState => ({*/}
          {/*      ...preInitialState,*/}
          {/*      settings*/}
          {/*    }));*/}
          {/*  }}*/}
          {/*/>*/}
        </>
      );
    },
    ...initialState?.settings
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...requestConfig
};
