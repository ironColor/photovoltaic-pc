import { Button, Form, Input, Tag } from 'antd';
import { useEffect, useState } from 'react';
import s from './index.module.less'

export default function Crew() {
  const [form] = Form.useForm();
  const [name, setName] = useState<string>();
  const [id, setId] = useState<string>();
  const [ list, setList] = useState([
    {
      name: 'Crew',
      id: 1
    },
    {
      name: 'Crew2',
      id: 2
    },
    {
      name: 'Crew3',
      id: 3
    }
  ]);

  useEffect(() => {
    form.setFieldsValue({ robotList: list });
  }, [list, form]);

  const onFinish = (value) => {
    console.log(value);
  }

  const onFinishFailed = (errorInfo) => {
    console.log(errorInfo);
  };


  return (
    <div className={s.content}>
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        form={form}
      >
        <Form.Item label='机组名称' rules={[{ required: true, message: '请输入机组名称' }]} name="name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Item>
        <Form.Item label='无人机编号' rules={[{ required: true, message: '请输入无人机编号' }]} name="id">
          <Input value={id} onChange={(e) => setId(e.target.value)} />
        </Form.Item>
        <Form.Item
          name="robotList"
          noStyle
          rules={[
            {
              validator: (_, value) => {
                if (!value || value.length === 0) {
                  return Promise.reject(new Error('请至少添加一个机器人'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          {/* 不渲染任何 UI，仅用于校验 */}
          <input type="hidden" />
        </Form.Item>
        <Form.Item
          label="机器人列表"
          name="list"
          rules={[
            {
              validator: (_, value) => {
                console.log(222, value);
                if (!value || value.length === 0) {
                  return Promise.reject(new Error('请至少添加一个机器人'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <div className={s.wrap}>
            {
              list.map((item) => <p key={item.id}>{item.name}
                <Tag color="red">删除</Tag>
              </p>)
            }
          </div>
        </Form.Item>
        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            确定
          </Button>
          <Button htmlType="button">
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
