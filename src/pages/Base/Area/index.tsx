import { Col, Row } from 'antd';
import React from 'react';
import Map from '@/pages/components/Map';
import HomeTree from '@/pages/Base/Area/HomeTree';
import NewHomeTree from "@/pages/Base/Area/newHomeTree";

const Home: React.FC = () => {
  let childRef = React.createRef<any>();

  return (
    <Row gutter={16}>
      <Col flex='350px'>
        <NewHomeTree mapRef={childRef} />
      </Col>
      <Col flex='auto'>
        <Map ref={childRef} />
      </Col>
    </Row>
  );
};
export default Home;
