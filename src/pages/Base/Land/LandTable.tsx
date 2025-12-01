import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { detail, land } from '@/pages/Base/service';
import { Badge, message, Modal, Table, Tag } from 'antd';
import React, { useImperativeHandle, useState } from 'react';
import { landType } from '@/pages/components/Common';

const LandTable: React.ForwardRefRenderFunction<{
  setArgs: React.Dispatch<React.SetStateAction<{}>>;
}> = (_, ref) => {
  const [args, setArgs] = useState<{}>();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>([]);

  const columns: ProColumns<Land.Item>[] = [
    {
      title: '地块名称',
      dataIndex: 'landName',
      width: 200,
      ellipsis: true,
      renderText: (text, row) => (
        <a
          onClick={async () => {
            const { code, data, msg } = await detail(row.landId);
            setOpen(true);
            if (code !== 0) {
              message.error(msg || '数据获取失败');
              return;
            }
            setData(data);
          }}
        >
          {text}
        </a>
      )
    },
    {
      title: '类型',
      dataIndex: 'landType',
      width: 90,
      renderText: (text: number) => <Tag color={'processing'}>{landType[+text]}</Tag>,
      valueEnum: landType
    },
    {
      title: '边界点A',
      dataIndex: 'landPoints1',
      search: false,
      render: (_, record: any) => {
        const { landPoints } = record;
        return (
          landPoints?.length > 0 && (
            <>
              <Badge color='cyan' text={`经度：${landPoints[0]?.lon}`} />
              <br />
              <Badge color='purple' text={`纬度：${landPoints[0]?.lat}`} />
              <br />
              <Badge color='geekblue' text={`高度：${landPoints[0]?.alt}`} />
            </>
          )
        );
      }
    },
    {
      title: '边界点B',
      dataIndex: 'landPoints2',
      search: false,
      render: (_, record: any) => {
        const { landPoints } = record;
        return (
          landPoints?.length > 1 && (
            <>
              <Badge color='cyan' text={`经度：${landPoints[1]?.lon}`} />
              <br />
              <Badge color='purple' text={`纬度：${landPoints[1]?.lat}`} />
              <br />
              <Badge color='geekblue' text={`高度：${landPoints[1]?.alt}`} />
            </>
          )
        );
      }
    },
    {
      title: '边界点C',
      dataIndex: 'landPoints3',
      search: false,
      render: (_, record: any) => {
        const { landPoints } = record;
        return (
          landPoints?.length > 2 && (
            <>
              <Badge color='cyan' text={`经度：${landPoints[2]?.lon}`} />
              <br />
              <Badge color='purple' text={`纬度：${landPoints[2]?.lat}`} />
              <br />
              <Badge color='geekblue' text={`高度：${landPoints[2]?.alt}`} />
            </>
          )
        );
      }
    },
    {
      title: '边界点D',
      dataIndex: 'landPoints4',
      search: false,
      render: (_, record: any) => {
        const { landPoints } = record;
        return (
          landPoints?.length > 3 && (
            <>
              <Badge color='cyan' text={`经度：${landPoints[3]?.lon}`} />
              <br />
              <Badge color='purple' text={`纬度：${landPoints[3]?.lat}`} />
              <br />
              <Badge color='geekblue' text={`高度：${landPoints[3]?.alt}`} />
            </>
          )
        );
      }
    },
    {
      title: '高度',
      dataIndex: 'landHeight',
      width: 150,
      search: false,
      renderText: text => `${text}米`
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 150,
      search: false
    }
  ];

  useImperativeHandle(ref, () => ({
    setArgs
  }));

  return (
    <>
      <ProTable<Land.Item>
        columns={columns}
        headerTitle={<b>地块管理</b>}
        params={args}
        style={{ position: 'absolute' }}
        cardBordered={true}
        request={async params => {
          const {
            data: { records, total },
            code
          } = await land(params);

          return { data: records, success: !code, total: total };
        }}
        rowKey='landId'
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
          <b>地块名称：{data.landName}</b>
          <b>地块类型：{landType[data.landType]}</b>
        </div>
        <Table
          key={'lat'}
          columns={[
            {
              title: '序号',
              dataIndex: 'childTaskName',
              width: 70,
              render: (_: any, __: any, index) => `${index + 1}`
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
          dataSource={data.landPoints}
          pagination={{ defaultPageSize: 5 }}
        />
      </Modal>
    </>
  );
};

export default React.forwardRef(LandTable);
