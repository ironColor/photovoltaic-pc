import { Card, Tree, Empty, message } from 'antd';
import React, { useEffect, useState } from 'react';
import type { TreeProps } from 'antd';
import { tree } from '@/pages/Base/service';
import { useLocation } from '@@/exports';

const TreeCard: React.FC<any> = ({ mapRef, onSelected }) => {
  const [data, setData] = useState<[]>([]);
  const location = useLocation();

  useEffect(() => {
    tree().then(res => setData(res.data));
  }, []);

  const loop = () =>
    data.map((item: any) => (
      <Tree.TreeNode title={item.areaName} key={`areaId-${item.areaId}`} data={item.lands}>
        {item.lands?.map((i: any) => (
          <Tree.TreeNode title={i.landName} key={`landId-${i.landId}`} data={item.lands} />
        ))}
      </Tree.TreeNode>
    ));

  const onSelect: TreeProps['onSelect'] = async (_, { node }: any) => {
    const { data } = node;
    if (location.pathname.indexOf('/base/area') !== -1) {
      mapRef.current?.home(data, node.key.startsWith('land') ? node.title : undefined);
    } else if (location.pathname.indexOf('/base/land') !== -1) {
      onSelected(node);
    }
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
        <Tree showLine defaultExpandAll onSelect={onSelect}>
          {loop()}
        </Tree>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
};
export default TreeCard;
