import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  colorPrimary: '#1890ff',
  layout: 'top',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: '中广核贵州分公司光伏电站智能运维管理系统',
  pwa: true,
  iconfontUrl: '',
  token: {
    // 参见ts声明，demo 见文档，通过token 修改样式
    //https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
    bgLayout: '#f2f3f5',
    header: {
      colorBgMenuItemSelected: 'rgba(0,0,0,0.08)'
    },
    pageContainer: {
      paddingBlockPageContainerContent: 16,
      paddingInlinePageContainerContent: 24
    }
  }
};

export default Settings;
