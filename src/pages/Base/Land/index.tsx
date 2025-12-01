import { Col, Row } from 'antd';
import React from 'react';
import RegionTable from './LandTable';
import HomeTree from '@/pages/Base/Area/HomeTree';

const Region: React.FC = () => {
  let childRef = React.createRef<any>();
  const onSelect = (node: any) => {
    const [type, id] = node.key.split('-');
    childRef.current?.setArgs({ [type]: id });
  };

  return (
    <Row gutter={16}>
      <Col flex='350px'>
        <HomeTree onSelected={onSelect} />
      </Col>
      <Col flex='auto'>
        <RegionTable ref={childRef} />
      </Col>
    </Row>
  );
};
export default Region;
