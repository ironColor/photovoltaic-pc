import { Card, Tree, Empty } from 'antd';
import React, { useEffect, useState } from 'react';
import type { TreeProps } from 'antd';
import { newTree, specialTree } from '@/pages/Base/service';
import { useLocation } from '@@/exports';

const TreeCard: React.FC<any> = ({ mapRef, onSelected, showSpecial }) => {
  const [data, setData] = useState<[]>([]);
  const location = useLocation();

  useEffect(() => {
    if (showSpecial) {
      specialTree().then(res => {
        setData(res.data)
      })
    } else {
    newTree().then(res => {
        setData(res.data)
    });
    }

  }, []);

  const loop = () =>
    data.map((item: any) => (
      <Tree.TreeNode
        title={item.areaName}
        key={`areaId-${item.areaId}`}
        data={item.lands.map(record => ({ ...record, isSlopeTooLarge:  Math.abs(record.k) > Number(item.slope) }))}
        __pointData={item.points}
      >
      </Tree.TreeNode>
    ));

    console.log(11111, data)
  const specialLoop = () => data.map((item: any) => (
    <Tree.TreeNode
      title={item.areaName}
      key={`areaId-${item.areaId}`}
      data={item.plotInfoList}
      switcherIcon={null}
    >
      {item.plotInfoList?.map((i: any) => (
        <Tree.TreeNode title={i.plotId} key={`plotId-${i.plotId}`} switcherIcon={null}>
          {
            i.arrayInfoList?.map(aa => (
              <Tree.TreeNode title={aa.arrayId} key={`arrayId-${aa.arrayId}-${i.plotId}`} switcherIcon={null}>
                  {aa.strIdList?.map(st => <Tree.TreeNode title={st} key={`strId-${st}-${i.plotId}-${aa.arrayId}`} switcherIcon={null} />)}
              </Tree.TreeNode>
            ))
          }
        </Tree.TreeNode>
      ))}
    </Tree.TreeNode>
  ));


  const onSelect: TreeProps['onSelect'] = async (_, { node }: any) => {
    const { data, __pointData } = node;

    if (location.pathname.indexOf('/base/area') !== -1) {
      // mapRef.current?.home(data, node.key.startsWith('land') ? node.title : undefined);
        if (showSpecial) {
            mapRef.current?.initLand(data, __pointData);
        } else {
            mapRef.current?.initLand(data);
        }

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
        <Tree showLine onSelect={onSelect}>
          { showSpecial ?  specialLoop() : loop()}
        </Tree>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
};
export default TreeCard;
