import { Col, Row } from 'antd';
import React from 'react';
import TreeCard from '@/pages/components/Tree';
import SubtaskTable from './SubtaskTable';

const Subtask: React.FC = () => {
  let childRef = React.createRef<{
    setAreaId: React.Dispatch<React.SetStateAction<number | undefined>>;
  }>();
  const onSelect = (node: any) => {
    childRef.current?.setAreaId(+node?.key);
  };

  return (
    <>
      <Row gutter={16}>
        <Col flex='350px'>
          <TreeCard onSelected={onSelect} />
        </Col>
        <Col flex='auto'>
          <SubtaskTable ref={childRef} />
        </Col>
      </Row>
    </>
  );
};
export default Subtask;
