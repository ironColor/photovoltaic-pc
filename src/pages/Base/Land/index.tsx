import { Col, Row } from 'antd';
import React from 'react';
import RegionTable from './LandTable';
import HomeTree from '@/pages/Base/Area/HomeTree';
import NewHomeTree from '@/pages/Base/Area/newHomeTree';

const Region: React.FC = () => {
  let childRef = React.createRef<any>();
  const onSelect = (node: any) => {
    const [type, id] = node.key.split('-');
    console.log(type, id);
    childRef.current?.setArgs({ [type]: id });
  };

  return (
    <Row gutter={16}>
      <Col flex='350px'>
        <NewHomeTree onSelected={onSelect} showSpecial={true} />
      </Col>
      <Col flex='auto'>
        <RegionTable ref={childRef} />
      </Col>
    </Row>
  );
};
export default Region;
