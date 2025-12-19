import React, { useRef, useState } from 'react';
import { Button, Col, Divider, message, Popconfirm, Row, Space, Table } from 'antd';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { history } from '@@/core/history';
import { del, page } from './service';
import { PlusOutlined } from '@ant-design/icons';
import TreeCard from '@/pages/components/Tree';
import { record } from '@umijs/utils/compiled/zod';

const WorkOrder: React.FC = () => {
  const formRef = useRef<any>();
  const [areaId, setAreaId] = useState<number>();

  const columns: ProColumns<Land.Item>[] = [
    {
      title: '工单名称',
      dataIndex: 'orderName',
      width: 270,
      ellipsis: true
    },
    {
      title: '工单类型',
      dataIndex: 'orderType',
      width: 270,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return record.orderType === 1 ? '干洗' : '水洗'
      }
    },
    {
      title: '场地名称',
      dataIndex: 'areaName',
      width: 270,
      ellipsis: true,
      search: false
    },
    {
      title: '机组名称',
      dataIndex: 'uavConfigName',
      width: 270,
      ellipsis: true,
      search: false
    },
    {
      title: '起飞点',
      dataIndex: 'takeoffPointName',
      ellipsis: true,
      search: false
    },
    {
      title: "挂载点",
      dataIndex: 'mountPointName',
      ellipsis: true,
      search: false
    },
    {
      title: '卸载点',
      dataIndex: 'uploadPointName',
      ellipsis: true,
      search: false
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 170,
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
              onClick={() => {
                history.push({
                  pathname: `/task/workOrder/add`,
                  search: `?orderId=${encodeURIComponent(text?.orderId)}`
                });
              }}
            >
              编辑
            </a>
            <Divider type='vertical' />
            <a
              onClick={() => {
                history.push({
                  pathname: `/task/workOrder/execute`,
                  search: `?id=${encodeURIComponent(text?.parentTaskId)}`
                });
              }}
            >
              执行
            </a>
            <Divider type='vertical' />
            <Popconfirm
              title='确认删除?'
              okText='确认'
              cancelText='取消'
              onConfirm={async () => {
                const { code, msg } = await del([text.orderId]);
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

  const onSelect = (node: any) => {
    setAreaId(+node?.key);
  };

  return (
    <Row gutter={16}>
      <Col flex='350px'>
        <TreeCard onSelected={onSelect} />
      </Col>
      <Col flex='auto'>
        <ProTable<Land.Item>
          columns={columns}
          actionRef={formRef}
          params={{ areaId: areaId }}
          style={{ position: 'absolute' }}
          headerTitle={<b>工单管理</b>}
          cardBordered={true}
          rowKey='parentTaskId'
          search={{
            labelWidth: 'auto'
          }}
          pagination={{
            showSizeChanger: false,
            showQuickJumper: true,
            defaultPageSize: 10
          }}
          request={async params => {
            const {
              data: { records, total },
              code
            } = await page(params);

            return { data: records, success: !code, total: total };
          }}
          dateFormatter='string'
          toolBarRender={() => [
            <Button
              key='button'
              icon={<PlusOutlined />}
              onClick={() => history.push('/task/workOrder/add')}
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
                    const { code, msg } = await del(
                      selectedRows.map((item: any) => item.orderId)
                    );
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
      </Col>
    </Row>
  )
}

export default WorkOrder;