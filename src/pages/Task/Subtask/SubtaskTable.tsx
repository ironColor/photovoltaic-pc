import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { page, detail } from './service';
import { Badge, Empty, message, Modal, Space, Statistic, Table } from 'antd';
import React, { useImperativeHandle, useState, forwardRef } from 'react';
import { dotType, taskType } from '@/pages/components/Common';

const SubtaskTable: React.ForwardRefRenderFunction<
  {
    setAreaId?: React.Dispatch<React.SetStateAction<number | undefined>>;
  },
  {
    flag?: boolean;
    setDataSource?: (data: any[]) => void;
    setOpenParent?: React.Dispatch<React.SetStateAction<boolean>>;
    area?: { areaId: number | null | undefined; areaName: string | null | undefined };
  }
> = ({ flag = false, setDataSource, setOpenParent, area }, ref) => {
  const [areaId, setAreaId] = useState<number>();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>({});

  const columns: ProColumns[] = [
    {
      title: '场地名称',
      hideInTable: true,
      dataIndex: 'areaName',
      renderFormItem: () => {
        if (area?.areaId) {
          return <b>{area.areaName}</b>;
        }
      }
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      ellipsis: true,
      renderText: (text, record) => (
        <a
          onClick={async () => {
            setOpen(true);
            const { data, code, msg } = await detail(record.taskId);
            if (code === 0) {
              setData(data);
            } else {
              message.error(msg || '加载失败');
            }
          }}
        >
          {text}
        </a>
      )
    },
    {
      title: '地块名称',
      dataIndex: 'landName',
      ellipsis: true
    },
    {
      title: '投放点',
      dataIndex: 'placementPoint',
      ellipsis: true,
      search: false,
      renderText: text =>
        text && (
          <>
            <Badge color='cyan' text={`经度：${text?.lon}`} />
            <br />
            <Badge color='purple' text={`纬度：${text?.lat}`} />
            <br />
            <Badge color='geekblue' text={`高度：${text?.alt}`} />
          </>
        )
    },
    {
      title: '回收点',
      dataIndex: 'recyclingPoint',
      search: false,
      ellipsis: true,
      renderText: text =>
        text && (
          <>
            <Badge color='cyan' text={`经度：${text[0]?.lon}`} />
            <br />
            <Badge color='purple' text={`纬度：${text[0]?.lat}`} />
            <br />
            <Badge color='geekblue' text={`高度：${text[0]?.alt}`} />
          </>
        )
    },
    {
      title: '所属主任务',
      dataIndex: 'parentTaskNames',
      renderText: text => <>{text?.join('、')}</>,
      search: false,
      ellipsis: true
    },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      valueEnum: taskType
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      search: false
    }
  ];

  useImperativeHandle(ref, () => ({
    setAreaId
  }));

    return (
      <>
        <ProTable
          columns={columns}
          headerTitle={<b>子任务列表</b>}
          params={{ areaId: flag ? area?.areaId : areaId }}
          style={{ position: flag ? 'relative' : 'absolute' }}
          cardBordered={true}
          request={async params => {
            const { data, code, msg } = await page(params);
            return { data: data.records, success: code, total: data.total };
          }}
          rowKey='taskId'
          search={{
            labelWidth: 'auto'
          }}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            defaultPageSize: flag ? 5 : 10
          }}
          dateFormatter='string'
          rowSelection={
            flag
              ? {
                  // https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                  selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT]
                }
              : false
          }
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
                <a
                  onClick={() => {
                    if (setOpenParent) setOpenParent(false);
                    if (setDataSource) setDataSource(selectedRows || []);
                  }}
                >
                  添加
                </a>
              </Space>
            );
          }}
        />
        <Modal
          title={'子任务详情'}
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
          width={'900px'}
          destroyOnClose
        >
          {data.taskId ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  marginRight: '150px',
                  marginLeft: '24px'
                }}
              >
                <Statistic title='子任务名称' value={data.taskName || '暂无数据'} />
                <Statistic title='场地名称' value={data.areaName || '暂无数据'} />
              </div>
              <Statistic
                title='所属主任务'
                style={{ marginLeft: '24px' }}
                value={data.parentTaskNames?.join('、') || '暂无数据'}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'start',
                  justifyContent: 'space-around'
                }}
              >
                <Table
                  style={{ width: '100%' }}
                  columns={[
                    {
                      title: '序号',
                      dataIndex: 'childTaskName',
                      width: 70,
                      render: (_: any, __: any, index) => `${index + 1}`
                    },
                    {
                      title: '点类型',
                      dataIndex: 'type',
                      width: 120,
                      render: (text: number) => dotType[text] || '-'
                    },
                    {
                      title: '经度',
                      dataIndex: 'lon',
                      width: 270
                    },
                    {
                      title: '纬度',
                      dataIndex: 'lat',
                      width: 270
                    },
                    {
                      title: '高度',
                      dataIndex: 'alt',
                      render: (text: number) => text + '米'
                    }
                  ]}
                  dataSource={data.planInfo}
                  pagination={{
                    defaultPageSize: 5
                  }}
                />
              </div>
            </>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Modal>
      </>
    );
};

export default forwardRef(SubtaskTable);
