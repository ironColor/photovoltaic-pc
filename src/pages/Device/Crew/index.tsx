import { Button, Form, Input, Select } from 'antd';
import { useEffect, useState } from 'react';
import s from './index.module.less'
import { page } from '@/pages/Device/Crew/service';

export default function Crew() {
  const [form] = Form.useForm();
  const [name, setName] = useState<string>();
  const [id, setId] = useState<string>();
  const [ value, setValue] = useState<any[]>([
  ]);
  const [ list, setList] = useState<any[]>([
  ]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // 是否还有更多数据

  const loadData = async (pages) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const info = await page({page: pages, pageSize: 10});
      const {
        data: { records, total },
      } = info;

      const format = records.map((record) => ({
        ...record,
        label: record.robotCode,
        value: record.robotId,
      }));

      setList((pre) => [...pre, ...format]);
      setCurrentPage(pages);

      // 判断是否还有更多数据
      if (pages * 10 >= total) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 监听下拉滚动
  const handlePopupScroll = (e) => {
    const { target } = e;
    // 判断是否滚动到底部（允许一点误差）
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10) {
      if (hasMore && !loading) {
        loadData(currentPage + 1);
      }
    }
  };

  const onFinish = (value) => {
    console.log(value);
  }

  const onFinishFailed = (errorInfo) => {
    console.log(errorInfo);
  };

  useEffect(() => {
    // form.setFieldsValue({ robotList: list });
    loadData(1)
  }, []);

  useEffect(() => {
    form.setFieldsValue({ robotList: value });
    // loadData()
  }, [value, form]);

  return (
    <div className={s.content}>
      <h1>机组配置</h1>
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
          <Select
            value={value}
            mode="multiple"
            options={list}
            onChange={(value) => setValue(value)}
            onPopupScroll={handlePopupScroll}
            loading={loading}
            showSearch={false} // 如果不需要搜索可关闭
            placeholder="请选择机器人..."
          />
        </Form.Item>
        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            确定
          </Button>
          <Button htmlType="button" style={{ marginLeft: 8 }}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
