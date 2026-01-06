import React, { useEffect, useRef, useState } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { cruise, commandTaskLog } from './service';
import Map from '@/pages/components/Map';
import { Col, Modal, Row, Table, Tag } from 'antd';
import { dotType, taskType } from '@/pages/components/Common';
import { useSearchParams } from '@@/exports';
import { formatTime } from '@/utils/utils';

const SubLog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const mapRef = useRef<any>();
  const [searchParams] = useSearchParams();
  const [complete, setComplete] = useState(false);
  const [subtaskLogId, setSubtaskLogId] = useState(0);
  const [planInfo, setPlanInfo] = useState<any>({});

  useEffect(() => {
    if (subtaskLogId) {
      commandTaskLog(subtaskLogId).then(res => setData(res.data))
    }
  }, [subtaskLogId]);

  useEffect(() => {
    if (complete && planInfo) {
      mapRef.current?.log(JSON.parse(planInfo))
    }
  }, [complete, planInfo]);

  const columns: ProColumns<any>[] = [
    {
      title: '子任务名称',
      dataIndex: 'taskName'
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
      render: (_, row) => <Tag color='blue'>{formatTime(row.waitingTime)}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'execStatus'
    },
    {
      title: '详情',
      width: 170,
      search: false,
      render: (_, row) => (
        <a
          onClick={() => {
            setOpen(true);
            setSubtaskLogId(row.subtaskLogId);
            setPlanInfo(row.planInfo)
          }}
        >
          查看
        </a>
      )
    }
  ];


  const columnsModal = [
    {
      title: '状态',
      dataIndex: 'execStatus'
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (text: number) => {
        return dotType[text] || '-';
      }
    },
    {
      title: '指令执行顺序号',
      dataIndex: 'serial'
    }
  ];

  return (
    <>
      <ProTable
        columns={columns}
        headerTitle={<b>子任务日志</b>}
        params={{ id: searchParams.get('id') }}
        cardBordered={true}
        request={async params => {
          const {
            data,
            code
          } = await cruise(params.id);

          return { data, success: !code };
        }}
        rowKey='id'
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
        title={'轨迹点日志列表'}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={'65%'}
        destroyOnClose
        afterClose={() => setComplete(false)}
      >
        <Row gutter={16}>
          <Col flex='550px'>
            <Table
              key={'id'}
              columns={columnsModal}
              dataSource={data}
              pagination={false}
            />
          </Col>
          <Col flex='auto'>
            <Map styles={{ height: '600px' }} complete={setComplete} ref={mapRef} />
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default SubLog;
