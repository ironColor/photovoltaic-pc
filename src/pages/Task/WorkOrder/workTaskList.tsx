import React, { useRef } from 'react';
import { Col, Row, Table } from 'antd';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { getWorkList } from './service';
import { useSearchParams } from '@@/exports';

const taskTypeMap = {
  0: '喷洒',
  2: '投放',
  3: '回收',
  4: '转移',
  5: '割草',
  6: '巡检'
};

const WorkTaskList: React.FC = () => {
  const formRef = useRef<any>();
  const [searchParams] = useSearchParams();

  const columns: ProColumns<Land.Item>[] = [
    {
      title: '工单名称',
      dataIndex: 'orderName',
      width: 200,
      ellipsis: true,
      search: false
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      width: 200,
      ellipsis: true,
      search: false
    },
    {
      title: '地块名称',
      dataIndex: 'landName',
      width: 200,
      ellipsis: true,
      search: false
    },
    {
      title: '机器人编码',
      dataIndex: 'robotCode',
      width: 100,
      ellipsis: true,
      search: false
    },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      ellipsis: true,
      search: false,
      render: (node, entity: any) => {
      return taskTypeMap[entity.taskType];
      }
    },
    {
      title: "旧所属地块",
      dataIndex: 'oldLandName',
      ellipsis: true,
      search: false
    },
    {
      title: "生成时间",
      dataIndex: 'generateTime',
      ellipsis: true,
      search: false
    }
  ];


  return (
    <Row gutter={16}>
      <Col flex='auto'>
        <ProTable<Land.Item>
          columns={columns}
          actionRef={formRef}
          params={{ id: searchParams.get('id') }}
          style={{ position: 'absolute' }}
          headerTitle={<b>任务列表</b>}
          cardBordered={true}
          rowKey='parentTaskId'
          search={false}
          pagination={{
            showSizeChanger: false,
            showQuickJumper: true,
            defaultPageSize: 10
          }}
          request={async params => {
            const {
              data,
              code
            } = await getWorkList(params);

            return { data, success: !code };
          }}
          dateFormatter='string'
          rowSelection={{
            selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT]
          }}
        />
      </Col>
    </Row>
  )
}

export default WorkTaskList;