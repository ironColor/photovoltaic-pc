import { Col, Row } from 'antd';
import React from 'react';
import RegionTable from './LandTable';
import NewHomeTree from '@/pages/Base/Area/newHomeTree';

const Region: React.FC = () => {
  let childRef = React.createRef<any>();
  const onSelect = (node: any) => {
    const [type, id, secondId, thirdId, fourId] = node.key.split('-');
    let params: any = {};
    if (type === 'plotId') {
      params.areaId = secondId;
    } else if (type === 'arrayId') {
      params.areaId = thirdId;
      params.plotId = secondId;
    } else if (type === 'strId') {
      params.areaId = fourId;
      params.plotId = thirdId;
      params.arrayId = secondId;
    }

    childRef.current?.setArgs({ [type]: id, ...params });
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
