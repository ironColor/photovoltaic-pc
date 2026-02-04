import React, { useRef, useState } from 'react';
import { Badge, Col, Row, Space, Table } from 'antd';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { history } from '@@/core/history';
import { page } from './service';
import TreeCard from '@/pages/components/Tree';

const WorkOrder: React.FC = () => {
  const formRef = useRef<any>();
  const [areaId, setAreaId] = useState<number>();

  const columns: ProColumns<Land.Item>[] = [
    {
      title: '工单名称',
      dataIndex: 'orderName',
      width: 100,
      ellipsis: true
    },
    {
      title: '工单类型',
      dataIndex: 'orderType',
      width: 100,
      ellipsis: true,
      search: false,
      render: (text, record: any) => {
        return record.orderType === 1 ? '干洗' : '水洗'
      }
    },
    {
      title: '场地名称',
      dataIndex: 'areaName',
      width: 100,
      ellipsis: true,
      search: false
    },
    {
      title: '机组名称',
      dataIndex: 'uavConfigName',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record: any) => {
        return `${record.uavConfigName} (${record.uavCode})`
      }
    },
    {
      title: '执行状态',
      dataIndex: 'execStatus',
      ellipsis: true,
      width: 100,
      search: false,
      render: (text, record: any) => <Badge status={record.execStatus === '执行中' ? 'success' : 'default'} text={text} />
    },
    {
      title: '起飞点',
      dataIndex: 'takeoffPointName',
      ellipsis: true,
      width: 100,
      search: false
    },
    {
      title: "挂载点",
      dataIndex: 'mountPointName',
      ellipsis: true,
      width: 100,
      search: false
    },
    {
      title: '卸载点',
      dataIndex: 'uploadPointName',
      ellipsis: true,
      width: 100,
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
      width: 210,
      search: false,
      render: (text: any) => {
        return (
          <>
            <a
              onClick={() => {
                history.push({
                  pathname: `/task/workOrder/execute`,
                  search: `?id=${encodeURIComponent(text?.orderId)}`
                });
              }}
            >
              执行
            </a>
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
          headerTitle={<b>工单监控</b>}
          cardBordered={true}
          rowKey='orderId'
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
          rowSelection={{
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
        />
      </Col>
    </Row>
  )
}

export default WorkOrder;