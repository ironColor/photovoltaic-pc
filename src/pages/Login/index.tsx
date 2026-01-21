import Footer from '@/components/Footer';
import { login } from './service';
import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { useModel, Helmet } from '@umijs/max';
import { message, Tabs } from 'antd';
import Settings from '../../../config/defaultSettings';
import React from 'react';
import { flushSync } from 'react-dom';
import background from '@/../public/picture/background.png';


const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage: `url(${background})`,
      backgroundSize: '100% 100%',
    };
  });

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState(s => ({
          ...s,
          currentUser: userInfo
        }));
      });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const code = await login({ ...values });
      if (code === 0) {
        await fetchUserInfo();
        return;
      }
    } catch (error) {
      console.log(error);
      message.error('登录失败，请重试！');
    }
  };


  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {'登录'} - {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '0 0 32px 0'
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw'
          }}
          logo={<img alt='logo' src='/logo/logo2.png' style={{ marginBottom: '-6px' }} />}
          // title='中广核贵州分公司光伏电站智能运维管理系统'
          subTitle={' '}
          initialValues={{
            autoLogin: true
          }}
          onFinish={async values => {
            await handleSubmit(values as any);
          }}
        >
          <Tabs
            centered
            items={[
              {
                key: 'account',
                label: '账户密码登录'
              }
            ]}
          />
          {
            <>
              <ProFormText
                name='username'
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />
                }}
                placeholder={'请输入账号'}
                rules={[
                  {
                    required: true,
                    message: '用户名是必填项！'
                  }
                ]}
              />
              <ProFormText.Password
                name='password'
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />
                }}
                placeholder={'请输入密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！'
                  }
                ]}
              />
            </>
          }
          <div
            style={{
              marginBottom: 24,
              visibility: 'hidden'
            }}
          >
            <ProFormCheckbox noStyle name='autoLogin'>
              记住密码
            </ProFormCheckbox>
            <a
              style={{
                float: 'right'
              }}
              onClick={() => {}}
            >
              忘记密码 ?
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};
export default Login;
