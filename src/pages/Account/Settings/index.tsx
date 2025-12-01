import { ProForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useRef } from 'react';
import { currentUser } from '@/pages/Login/service';
import { updateUser } from '@/pages/Account/Settings/service';

export default () => {
  const formRef = useRef<any>();

  return (
    <ProForm
      layout={'horizontal'}
      formRef={formRef}
      style={{ margin: '0 auto', padding: '60px', borderRadius: '14px', backgroundColor: '#fff' }}
      submitter={{
        render: (props, doms) => doms[1]
      }}
      onFinish={async () => {
        const value = await formRef.current?.validateFieldsReturnFormatValue?.();

        const { code, msg } = await updateUser(value);
        if (code !== 0) {
          message.error(msg || '绑定失败');
          return;
        }
        message.success('绑定成功');
        history.back();
      }}
      request={async () => {
        const { code, msg, data } = await currentUser();

        if (code !== 0) {
          message.error(msg || '获取用户信息失败');
          return;
        }

        return {
          bindName: data?.bindName,
          username: data?.username
        };
      }}
    >
      <ProFormText
        width='md'
        name='username'
        disabled
        label='用户名称'
        fieldProps={{ maxLength: 18 }}
        placeholder='请输入用户名称'
        rules={[{ required: true, message: '用户名称不能为空' }]}
      />
      <ProFormText
        name='bindName'
        rules={[{ required: true, message: '绑定用户不能为空' }]}
        width='md'
        label='绑定用户'
        fieldProps={{ maxLength: 18 }}
        placeholder='请输入绑定的用户'
      />
    </ProForm>
  );
};
