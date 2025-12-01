import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { add, update } from './service';

export default ({
  open,
  setOpen,
  data
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: any;
}) => {
  const [form] = Form.useForm();
  return (
    <ModalForm<any>
      title='创建'
      open={open}
      form={form}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => setOpen(false)
      }}
      onFinish={async () => {
        form.validateFields().then(async value => {
          let result;
          if (Object.keys(data).length === 0) {
            result = await add(value);
          } else {
            result = await update({ ...value, id: data.id });
          }
          if (result.code === 0) {
            setOpen(false);
            message.success('提交成功');
          } else {
            message.error(result.msg || '提交失败');
          }
        });
        return true;
      }}
    >
      <ProForm.Group>
        <ProFormText
          label='参数名称'
          name='parameterName'
          tooltip='参数名称'
          width='md'
          rules={[{ required: true, message: '请输入参数名称' }]}
          initialValue={data.parameterName}
          fieldProps={{ maxLength: 16 }}
        />
        <ProFormText
          label='参数编码'
          name='parameterCode'
          tooltip='参数编码'
          width='md'
          rules={[{ required: true, message: '请输入参数编码' }]}
          initialValue={data.parameterCode}
          fieldProps={{ maxLength: 16 }}
          disabled={data.parameterCode}
        />
        <ProFormText
          label='参数值'
          name='parameterValue'
          tooltip='参数值'
          width='md'
          rules={[{ required: true, message: '请输入参数值' }]}
          initialValue={data.parameterValue}
          fieldProps={{ maxLength: 16 }}
        />
      </ProForm.Group>
    </ModalForm>
  );
};
