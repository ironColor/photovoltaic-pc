import {
  ModalForm,
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect
} from '@ant-design/pro-components';
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
            result = await update({ ...value, rtkId: data.rtkId });
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
          label='RTK编号'
          name='rtkCode'
          tooltip='RTK编号'
          width='md'
          rules={[{ required: true, message: '请输入RTK编号' }]}
          initialValue={data.rtkCode}
          fieldProps={{ maxLength: 16 }}
        />
        <ProFormTreeSelect
          width='md'
          name='rtkType'
          label='类型'
          rules={[{ required: true, message: '请选择类型' }]}
          initialValue={data.rtkType}
          request={async () => {
            return [
              {
                title: '维特',
                value: '维特'
              },
              {
                title: '飞机',
                value: '飞机'
              },
              {
                title: '锤子',
                value: '锤子'
              }
            ];
          }}
        />
        <ProFormText
          label='卡号'
          name='networkCard'
          tooltip='流量卡号码'
          width='md'
          rules={[{ required: true, message: '请输入流量卡号' }]}
          initialValue={data.networkCard}
          fieldProps={{ maxLength: 32 }}
        />
        <ProFormText
          label='流量查询'
          name='networkQueryAddress'
          tooltip='流量卡查询地址'
          width='md'
          initialValue={data.networkQueryAddress}
          fieldProps={{ maxLength: 127 }}
        />
        <ProFormTextArea
          label='备注'
          name='remarks'
          width={680}
          allowClear
          initialValue={data.remarks}
          fieldProps={{ maxLength: 256 }}
        />
      </ProForm.Group>
    </ModalForm>
  );
};
