import { Button, Card, Col, Row, Space } from 'antd';
import React, { useState } from 'react';
import { useParams, useSearchParams } from '@@/exports';
import Display from '@/pages/Task/Monitor/components/Display';
import Map from '@/pages/components/Map';

export default function ExecuteWork() {
  let mapRef = React.createRef<{ execute?: (position: any[], air?: [number, number]) => void }>();
  const [complete, setComplete] = useState(false);
  const [dataArr, setDataArr] = useState<any[]>([]);
  const { id } = useParams();
  const [params] = useSearchParams();


  return (
    <Card
      bordered={false}
      title='执行工单'
      extra={
        <Space>
          <Button
            type={'primary'}
            style={{ backgroundColor: '#13c2c2' }}
          >
            自检
          </Button>
          <Button type={'primary'}>
            启动
          </Button>
          <Button type='primary' danger >
            中断
          </Button>
          <Button type='primary' danger >
            任务取消
          </Button>
          <Button onClick={() => history.back()}>返回</Button>
        </Space>
      }
      >
        <Row gutter={16}>
          <Col flex='450px'> </Col>
          <Col flex='auto'>
            <Map styles={{ height: 'calc(100vh - 190px)' }} complete={setComplete} ref={mapRef} />
          </Col>
        </Row>
    </Card>
  )
}