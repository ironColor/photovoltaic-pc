import React, { useEffect, useRef, useState } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { page, cruise } from './service';
import Map from '@/pages/components/Map';
import { Col, message, Modal, Row, Statistic, Table, Tag } from 'antd';
import { taskType } from '@/pages/components/Common';

const Log: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(0);
  const [data, setData] = useState();
  const [names, setNames] = useState<any>([]);
  const mapRef = useRef<any>();
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    id && cruise(id).then(res => setData(res.data));
    console.log(data);
    complete && mapRef.current?.log(data?.[0]?.planInfos);
  }, [id, complete]);

  const columns: ProColumns<any>[] = [
    {
      title: '场地名称',
      dataIndex: 'areaName',
      width: 270,
      ellipsis: true
    },
    {
      title: '工单名称',
      dataIndex: 'orderName',
      width: 270,
      ellipsis: true
    },
    {
      title: '工单类型',
      dataIndex: 'orderType',
      width: 90,
      search: false,
      render: text => <Tag color={'processing'}>{text}</Tag>
    },
    {
      title: '开始时间',
      dataIndex: 'execStartTime',
      search: false
    },
    {
      title: '结束时间',
      dataIndex: 'execEndTime',
      search: false
    },
    {
      title: '状态',
      dataIndex: 'execStatus',
      width: 170,
      valueEnum: {
        执行中: {
          text: '执行中'
        },
        已完成: {
          text: '已完成'
        },
        中断: {
          text: '中断'
        }
      }
    },
    {
      title: '详情',
      width: 170,
      search: false,
      render: (_, row) => (
        <a
          onClick={() => {
            setOpen(true);
            setId(row.subtaskId);
            setNames({
              areaName: row.areaName,
              parentTaskName: row.parentTaskName,
              execStartTime: row.execStartTime,
              execStatus: row.execStatus
            });
          }}
        >
          查看
        </a>
      )
    }
  ];

  return (
    <>
      <ProTable
        columns={columns}
        headerTitle={<b>工单日志</b>}
        cardBordered={true}
        request={async params => {
          const {
            data: { records, total },
            code
          } = await page(params);

          return { data: records, success: !code, total: total };
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
        title={'子任务日志列表'}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={'65%'}
        destroyOnClose
        afterClose={() => setComplete(false)}
      >
        <Row gutter={16}>
          <Col flex='550px'>
            <Statistic
              title={names.areaName || '获取失败'}
              value={names.parentTaskName || '获取失败'}
              style={{ margin: '0' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>地块名称：{data.landName}</span>
              <span>任务名称：{data.taskName}</span>
              <span>执行状态：{data.execStatus}</span>
            </div>
          </Col>
          <Col flex='auto'>
            <Map styles={{ height: '600px' }} complete={setComplete} ref={mapRef} />
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default Log;
