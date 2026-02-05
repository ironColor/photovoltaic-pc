import {
  ModalForm,
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { list } from '@/pages/Device/RTK/service';
import { add, update } from '@/pages/Device/Machine/service';

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
            result = await update({ ...value, robotId: data.robotId });
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
          label='编号'
          name='robotCode'
          tooltip='机器人编号'
          width='md'
          placeholder='请输入1-255数字'
          rules={[{ required: true, message: '请输入机器人编号' }]}
          initialValue={data.robotCode}
          fieldProps={{ maxLength: 16 }}
        />
        <ProFormTreeSelect
          width='md'
          name='rtkCode'
          label='RTK'
          initialValue={data.rtkCode}
          request={async () => {
            const { code, data, msg } = await list();
            return data.map((item: any) => ({
              title: item.rtkCode,
              value: item.rtkCode
            }));
          }}
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
