import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { detail, page } from './service';
import { Badge, message, Modal, Table, Tag } from 'antd';
import React, { useImperativeHandle, useState } from 'react';
import { history } from '@umijs/max';
import type { TableProps } from 'antd';
import {taskType} from "@/pages/components/Common";

interface ModalType {
  childTaskName: string;
  taskType: string;
  childRegionName: string;
  waitingTime: string;
  execution: number;
}

const MonitorTable: React.ForwardRefRenderFunction<{
  setAreaId: React.Dispatch<React.SetStateAction<number | undefined>>;
}> = (_, ref) => {
  const [areaId, setAreaId] = useState<number>();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>([]);

  useImperativeHandle(ref, () => ({
    setAreaId
  }));

  const columnsModal: TableProps<ModalType>['columns'] = [
    {
      title: '子任务名称',
      dataIndex: 'childTaskName'
    },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      render: (text: number) => {
        return taskType[text] || '-';
      }
    },
    {
      title: '地块名称',
      dataIndex: 'landName'
    },
    {
      title: '等待时间',
      dataIndex: 'waitingTime',
      render: (text: number) => <Tag color='blue'>{text} 秒</Tag>
    },
    {
      title: '状态',
      dataIndex: 'execution',
      render: (text: string) => (
        <Badge status={text === '0' ? 'success' : 'error'} text={text === '0' ? '启用' : '禁用'} />
      )
    }
  ];

  const columns: ProColumns[] = [
    {
      title: '任务名称',
      dataIndex: 'parentTaskName',
      ellipsis: true,
      renderText: (text: string, record) => {
        return (
          <a
            onClick={async () => {
              setOpen(true);
              const { code, data, msg } = await detail(record.parentTaskId);

              if (code === 0) {
                setData(data);
              } else {
                message.error(msg || '获取失败');
              }
            }}
          >
            {text}
          </a>
        );
      }
    },
    {
      title: '场地名称',
      dataIndex: 'areaName',
      ellipsis: true
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      search: false,
      render: text => <Badge status={text === '执行中' ? 'success' : 'default'} text={text} />
    },
    {
      title: '任务类型',
      dataIndex: 'parentTaskType',
      render: text => <Tag color={'processing'}>{text}</Tag>,
      valueEnum: {
        清洗: { text: '清洗任务' },
        巡检: { text: '巡检任务' },
        割草: { text: '割草任务' },
        喷淋: { text: '喷淋任务' }
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      search: false
    },
    {
      title: '操作',
      width: 120,
      search: false,
      render: (record: any) => (
        <a
          onClick={() =>
            history.push({
              pathname: `/task/monitor/execute/${record?.parentTaskId}`,
              search: `?areaName=${encodeURIComponent(
                record?.areaName
              )}&taskName=${encodeURIComponent(record?.parentTaskName)}`
            })
          }
        >
          执行
        </a>
      )
    }
  ];

  return (
    <>
      <ProTable
        columns={columns}
        headerTitle={<b>实时监控</b>}
        params={{ areaId: areaId }}
        style={{ position: 'absolute' }}
        cardBordered={true}
        request={async params => {
          const {
            data: { records, total },
            code
          } = await page(params);

          return { data: records, success: !code, total: total };
        }}
        rowKey='parentTaskId'
        search={{
          labelWidth: 'auto'
        }}
        pagination={{
          showSizeChanger: false,
          showQuickJumper: true,
          defaultPageSize: 10
        }}
        dateFormatter='string'
      />
      <Modal
        title={'任务详情'}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={'900px'}
        destroyOnClose
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            fontSize: 'large',
            margin: '24px'
          }}
        >
          <b>任务名称：{data.parentTaskName}</b>
          <b>场地名称：{data.areaName}</b>
        </div>
        <Table
          key={'id'}
          columns={columnsModal}
          dataSource={data.parentChildTaskRelations}
          pagination={false}
        />
      </Modal>
    </>
  );
};

export default React.forwardRef(MonitorTable);
