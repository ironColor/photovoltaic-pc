import React, { useEffect, useRef, useState } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { page, cruise } from './service';
import Map from '@/pages/components/Map';
import { Col, message, Modal, Row, Statistic, Table, Tag } from 'antd';
import { taskType } from '@/pages/components/Common';
import { useSearchParams } from '@@/exports';

const Log: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [names, setNames] = useState<any>([]);
  const mapRef = useRef<any>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const id = searchParams.get('id');
    id && cruise(id).then(res => setData(res.data));
  }, []);

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
      render: (_, row) => <Tag color='blue'>{row.waitingTime} 秒</Tag>
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
        headerTitle={<b>子任务日志</b>}
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
    </>
  );
};

export default Log;
