/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/',
    redirect: '/base'
  },
  {
    name: '登录',
    path: '/login',
    layout: false,
    component: './Login'
  },
  {
    path: '/account',
    routes: [
      {
        path: '/account',
        redirect: '/account/settings'
      },
      {
        name: '个人设置',
        path: '/account/settings',
        component: './Account/Settings'
      }
    ]
  },
  {
    path: '/base',
    name: '基础信息',
    icon: 'home',
    routes: [
      {
        path: '/base',
        redirect: '/base/area'
      },
      {
        name: 'GIS展示',
        path: '/base/area',
        component: './Base/Area'
      },
      {
        name: '地块管理',
        path: '/base/land',
        component: './Base/Land'
      }
    ]
  },
  {
    path: '/task',
    name: '任务管理',
    icon: 'fileText',
    routes: [
      {
        path: '/task',
        redirect: '/task/monitor'
      },
      {
        name: '实时监控',
        path: '/task/monitor',
        routes: [
          {
            path: '/task/monitor',
            redirect: '/task/monitor/list'
          },
          {
            path: '/task/monitor/list',
            component: './Task/Monitor'
          },
          {
            path: '/task/monitor/execute/:id',
            component: './Task/Monitor/Execute'
          }
        ]
      },
      {
        name: '任务设计',
        path: '/task/design',
        routes: [
          {
            path: '/task/design',
            redirect: '/task/design/list'
          },
          {
            path: '/task/design/list',
            component: './Task/Design'
          },
          {
            path: '/task/design/add',
            component: './Task/Design/DesignAdd'
          }
        ]
      },
      {
        name: '任务日志',
        path: '/task/log',
        component: './Task/Log'
      },
      {
        name: '工单日志',
        path: '/task/orderLog',
        routes: [
          {
            path: '/task/orderLog',
            redirect: '/task/orderLog/list'
          },
          {
            path: '/task/orderLog/list',
            component: './Task/OrderLog',
          },
          {
            path: '/task/orderLog/subLog',
            component: './Task/OrderLog/SubLog',
          }
        ]
      },
      {
        name: '子任务',
        path: '/task/subtask',
        component: './Task/Subtask'
      },
      {
        name: '工单监控',
        path: '/task/workMonitor',
        routes: [
          {
            path: '/task/workMonitor',
            redirect: '/task/workMonitor/list'
          },
          {
            path: '/task/workMonitor/list',
            component: './Task/WorkMonitor'
          },
        ]
      },
      {
        name: '工单管理',
        path: '/task/workOrder',
        routes: [
          {
            path: '/task/workOrder',
            redirect: '/task/workOrder/list'
          },
          {
            path: '/task/workOrder/list',
            component: './Task/WorkOrder'
          },
          {
            path: '/task/workOrder/add',
            component: './Task/WorkOrder/AddWorkOrder'
          },
          {
            path: '/task/workOrder/execute',
            component: './Task/WorkOrder/ExecuteWork'
          },
          {
            path: '/task/workOrder/subTask',
            component: './Task/WorkOrder/workTaskList'
          }
        ]
      },
      {
        name: '轨迹点',
        path: '/task/trackPoint',
        component: './Device/TrackPoint'
      },
    ]
  },
  {
    path: '/device',
    name: '设备管理',
    icon: 'ungroup',
    routes: [
      {
        path: '/device',
        redirect: '/device/machine'
      },
      {
        name: '机器管理',
        path: '/device/machine',
        component: './Device/Machine'
      },
      {
        name: 'RTK管理',
        path: '/device/rtk',
        component: './Device/RTK'
      },
      {
        name: '参数管理',
        path: '/device/params',
        component: './Device/Params'
      },
      {
        name: '机组配置',
        path: '/device/group',
        component: './Device/Crew'
      }
    ]
  },
  {
    path: '*',
    layout: false,
    component: './404'
  }
];
