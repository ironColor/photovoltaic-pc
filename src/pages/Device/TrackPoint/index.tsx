import { ProColumns, ProTable } from '@ant-design/pro-components';
import { history } from '@@/core/history';
import { Button, Divider, message, Popconfirm, Space, Table } from 'antd';
import React, { useRef } from 'react';
import { getList, del } from '@/pages/Device/TrackPoint/service';

const Option = {
  0: "普通点",
  2: "喷洒",
  3: "投放",
  4: "回收",
  5: "割草",
  6: "巡检",
  7: "挂载点",
  8: "卸载点",
  9: "作业点",
  10: "起飞点",
}


const TrackPoint = () => {
  const formRef = useRef<any>();

  const columns: ProColumns<Land.Item>[] = [
    {
      title: '名称',
      dataIndex: 'pointName',
      width: 270,
      ellipsis: true
    },
    {
      title: '类型',
      dataIndex: 'pointType',
      width: 270,
      ellipsis: true,
      search: false,
      render: (_: any, entity: any) => {
        return Option[entity.pointType];
      }
    },
    {
      title: '经度',
      dataIndex: 'lon',
      ellipsis: true,
      search: false
    },
    {
      title: "纬度",
      dataIndex: 'lat',
      ellipsis: true,
      search: false
    },
    {
      title: '高度',
      dataIndex: 'alt',
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
            <Popconfirm
              title='确认删除?'
              okText='确认'
              cancelText='取消'
              onConfirm={async () => {
                const { code, msg } = await del([text.pointId]);
                if (code === 0) {
                  message.success('删除成功');
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


  return <div>
    <ProTable<Land.Item>
      columns={columns}
      actionRef={formRef}
      headerTitle={<b>轨迹点</b>}
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
        } = await getList(params);

        return { data: records, success: !code, total: total };
      }}
      dateFormatter='string'
      // toolBarRender={() => [
      //   <Button
      //     key='button'
      //     icon={<PlusOutlined />}
      //     onClick={() => history.push('/task/workOrder/add')}
      //     type='primary'
      //   >
      //     新增
      //   </Button>
      // ]}
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
  </div>
}

export default TrackPoint;