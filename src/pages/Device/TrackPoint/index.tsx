import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Col, message, Popconfirm, Row, Space, Table } from 'antd';
import React, { useRef, useState } from 'react';
import { getList, del } from '@/pages/Device/TrackPoint/service';
import TreeCard from '@/pages/components/Tree';

const Option = {
  // 0: "普通点",
  // 2: "喷洒",
  // 3: "投放",
  // 4: "回收",
  // 5: "割草",
  // 6: "巡检",
  7: "挂载点",
  8: "卸载点",
  // 9: "作业点",
  10: "起飞点",
}


const TrackPoint = () => {
  const formRef = useRef<any>();
  const [areaId, setAreaId] = useState<number>();

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
      render: (_: any, entity: any) => {
        return Option[entity.pointType];
      },
      valueEnum: Object.fromEntries(
        Object.entries(Option).map(([key, label]) => [key, { text: label }])
      )
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
          headerTitle={<b>轨迹点</b>}
          cardBordered={true}
          rowKey='pointId'
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
          rowSelection={{
            // https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
            selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT]
          }}
        />
      </Col>
    </Row>
  )
}

export default TrackPoint;