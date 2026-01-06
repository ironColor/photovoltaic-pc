import React, { useRef, useState } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { page } from './service';
import Map from '@/pages/components/Map';
import { Col, Modal, Row, Table, Tag } from 'antd';
import { taskType } from '@/pages/components/Common';
import { history } from '@@/core/history';

const Log: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>({});
  const mapRef = useRef<any>();
  const [complete, setComplete] = useState(false);


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
      valueEnum: {
        1: {
          text: '干洗'
        },
        2: {
          text: '水洗'
        }
      }
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
            history.push({
              pathname: `/task/orderLog/subLog`,
              search: `?id=${encodeURIComponent(row?.id)}`
            });
          }}
        >
          查看
        </a>
      )
    }
  ];

  const columnsModal = [
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
      render: (text: number) => <Tag color='blue'>{text} 秒</Tag>
    },
    {
      title: '状态',
      dataIndex: 'execStatus'
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
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>地块名称：{data.landName}</span>
              <span>任务名称：{data.taskName}</span>
              <span>执行状态：{data.execStatus}</span>
            </div>
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

export default Log;
