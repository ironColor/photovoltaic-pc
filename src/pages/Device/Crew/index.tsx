import { Button, Divider, Form, Input, message, Modal, Popconfirm, Select, Space, Table } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { delGroup, detailInfo, page, robotPage, saveInfo, update } from '@/pages/Device/Crew/service';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';

export default function Crew() {
  const [form] = Form.useForm();
  const [ list, setList] = useState<any[]>([
  ]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // 是否还有更多数据
  const [open, setOpen] = useState(false);
  const tableFormRef = useRef<any>();
  const [updateId, setUpdateId] = useState<null | number>();

  const columns: ProColumns[] = [
    {
      title: '机组名',
      dataIndex: 'name',
      width: 270,
      ellipsis: true
    },
    {
      title: '无人机编号',
      dataIndex: 'uavCode',
      ellipsis: true
    },
    {
      title: '机器人列表',
      search: false,
      ellipsis: true,
      render: (_: any, data) => {
        return (
          <>
            {data.robots?.map(item => item.robotCode).join(',')}
          </>
        )
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      search: false
    },
    {
      title: '操作',
      width: 170,
      search: false,
      render: (text: any) => {
        return (
          <>
            <a
              onClick={async () => {
                const { data, code, msg } = await detailInfo(text.id);
                setOpen(true);
                if (code === 0) {
                  form.setFieldsValue({
                    name: data.name,
                    uavCode: data.uavCode,
                    robotIds: data.robots.map(item => item.robotId)
                  })
                  setUpdateId(data.id)
                } else {
                  message.error(msg || '加载失败');
                }
              }}
            >
              编辑
            </a>
            <Divider type='vertical' />
            <Popconfirm
              title='确认删除?'
              okText='确认'
              cancelText='取消'
              onConfirm={async () => {
                const { code, msg } = await delGroup([text.id]);
                if (code === 0) {
                  message.success('删除成功');
                  tableFormRef.current?.reload();
                } else {
                  message.error(msg || '删除失败');
                }
              }}
            >
              <span style={{ color: '#1677ff', cursor: 'pointer' }}>删除</span>
            </Popconfirm>
          </>
        );
      }
    }
  ];

  const loadData = async (pages: any) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const info = await robotPage({current: pages, pageSize: 10});
      const {
        data: { records, total },
      } = info;

      const format = records.map((record: any) => ({
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
  const handlePopupScroll = (e: any) => {
    const { target } = e;
    // 判断是否滚动到底部（允许一点误差）
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10) {
      if (hasMore && !loading) {
        loadData(currentPage + 1);
      }
    }
  };

  const onFinish = async (value: any) => {
    const api = updateId ? update : saveInfo

    const info = await api({ ...value, id: updateId });
    if (info.code === 0) {
      setOpen(false);
      message.success('提交成功');
      tableFormRef.current?.reload();
      setUpdateId(null)
    } else {
      message.error(info.msg || '提交失败');
    }
  }

  useEffect(() => {
    // form.setFieldsValue({ robotList: list });
    loadData(1)
  }, []);

  return (
    <div>
      <ProTable
        columns={columns}
        actionRef={tableFormRef}
        headerTitle={<b>机组列表</b>}
        style={{ position: 'absolute' }}
        cardBordered={true}
        request={async params => {
          const {
            data: { records, total },
            code
          } = await page({
            pageNumber: params.current,
            pageSize: params.pageSize,
            name: params.name || '',
            uavCode: params.uavCode || ''
          });
          return { data: records, success: !code, total: total };
        }}
        rowKey='id'
        search={{ labelWidth: 'auto' }}
        dateFormatter='string'
        pagination={{
          showQuickJumper: true,
          defaultPageSize: 10
        }}
        toolBarRender={() => [
          <Button
            key='button'
            icon={<PlusOutlined />}
            onClick={() => {
              setOpen(true);
            }}
            type='primary'
          >
            新增
          </Button>
        ]}
        rowSelection={{
          // https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT]
        }}
        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => {
          return (
            <Space size={24}>
              <span>
                已选 {selectedRowKeys.length} 项
                <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
                  取消选择
                </a>
              </span>
            </Space>
          );
        }}
        tableAlertOptionRender={({ selectedRows }) => {
          return (
            <Space size={16}>
              <Popconfirm
                title='确认删除?'
                okText='确认'
                cancelText='取消'
                onConfirm={async () => {
                  const { code, msg } = await delGroup(selectedRows.map((item: any) => item.id));
                  if (code === 0) {
                    message.success('删除成功');
                    tableFormRef.current?.reload();
                  } else {
                    message.error(msg || '删除失败');
                  }
                }}
              >
                <span style={{ color: '#1677ff' }}>批量删除</span>
              </Popconfirm>
            </Space>
          );
        }}
      />

      <Modal
        title='新增机组'
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          onFinish={onFinish}
          form={form}
          clearOnDestroy
        >
          <Form.Item
            label='机组名称'
            rules={[{ required: true, message: '请输入机组名称' }]}
            name='name'
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='无人机编号'
            rules={[{ required: true, message: '请输入无人机编号' }]}
            name='uavCode'
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='机器人列表'
            name='robotIds'
            rules={[
              {
                validator: (_, value) => {
                  if (!value || value.length === 0) {
                    return Promise.reject(new Error('请至少添加一个机器人'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Select
              mode='multiple'
              options={list}
              onPopupScroll={handlePopupScroll}
              loading={loading}
              showSearch={false}
              placeholder='请选择机器人'
            />
          </Form.Item>
          <Form.Item label={null}>
            <Button type='primary' htmlType='submit'>
              确定
            </Button>
            <Button
              htmlType='button'
              style={{ marginLeft: 8 }}
              onClick={() => {
                setOpen(false)
                form.resetFields();
              }}
            >
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
