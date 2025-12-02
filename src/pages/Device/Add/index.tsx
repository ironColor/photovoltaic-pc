import { Col, Row } from 'antd';
import React, { useRef, useState } from 'react';
import Map from '@/pages/components/Map';

export default function AddOrder( ) {
  const mapRef = useRef<any>();
  const [complete, setComplete] = useState(false);

  return (
    <Row gutter={16}>
      <Col flex='550px'>
        <Map styles={{ height: '600px' }} complete={setComplete} ref={mapRef} />
      </Col>
      <Col flex='auto'>
        <h1>新增工单</h1>
      </Col>
    </Row>
  )
}