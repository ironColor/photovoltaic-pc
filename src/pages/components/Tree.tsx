import { Card, Tree, Empty } from 'antd';
import React, { useEffect, useState } from 'react';
import type { TreeProps } from 'antd';
import { list } from '@/pages/Base/service';

const TreeCard: React.FC<{ onSelected: (node: any) => void, selectedKeys: any[] }> = ({ onSelected, selectedKeys }) => {
  const [data, setData] = useState<[]>([]);

  useEffect(() => {
    list().then(res => setData(res.data));
  }, []);

  const onSelect: TreeProps['onSelect'] = (_, { node }) => {
    onSelected(node);
  };

  return (
    <Card
      bordered={false}
      style={{
        height: 'calc(100vh - 88px)',
        minHeight: '500px',
        borderRadius: '4px',
        boxShadow: '0 2px 10px 0 rgba(14,33,39,.2)',
        overflowY: 'auto'
      }}
    >
      {data?.length > 0 ? (
        <Tree
          showLine
          defaultExpandAll
          selectedKeys={selectedKeys}
          onSelect={onSelect}
          treeData={data?.map((item: any) => ({
            title: item.areaName,
            key: item.areaId
          }))}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
};
export default TreeCard;
