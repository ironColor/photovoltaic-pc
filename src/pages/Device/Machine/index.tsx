import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { del, detail, page } from './service';
import { Button, Divider, message, Popconfirm, Space, Table, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import DataModal from './DataModal';

const Index = () => {
  const [data, setData] = useState({});
  const [open, setOpen] = useState(false);
  const formRef = useRef<any>();

  useEffect(() => {
    !open && setData({});
    !open && formRef.current?.reload();
  }, [open]);

  const columns: ProColumns[] = [
    {
      title: '编号',
      dataIndex: 'robotCode',
      width: 270,
      ellipsis: true
    },
    {
      title: 'RTK',
      dataIndex: 'rtkCode',
      ellipsis: true
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      search: false,
      ellipsis: true
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
                const { data, code, msg } = await detail(text.robotId);
                setOpen(true);
                if (code === 0) {
                  setData(data);
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
                const { code, msg } = await del([text.robotId]);
                if (code === 0) {
                  message.success('删除成功');
                  formRef.current?.reload();
                } else {
                  message.error(msg || '删除失败');
                }
              }}
            >
              <span style={{ color: '#1677ff' }}>删除</span>
            </Popconfirm>
          </>
        );
      }
    }
  ];
  return (
    <>
      <ProTable
        columns={columns}
        actionRef={formRef}
        headerTitle={<b>机器人列表</b>}
        style={{ position: 'absolute' }}
        cardBordered={true}
        request={async params => {
            console.log('ssss',params)
          const {
            data: { records, total },
            code
          } = await page(params);
            console.log(records, total);
          return { data: records, success: !code, total: total };
        }}
        rowKey='robotId'
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
                  const { code, msg } = await del(selectedRows.map((item: any) => item.robotId));
                  if (code === 0) {
                    message.success('删除成功');
                    formRef.current?.reload();
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
      <DataModal open={open} setOpen={setOpen} data={data} />
    </>
  );
};

export default Index;
