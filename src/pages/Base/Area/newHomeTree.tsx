import { Card, Tree, Empty } from 'antd';
import React, { useEffect, useState } from 'react';
import type { TreeProps } from 'antd';
import { newTree, parameterPage, specialTree } from '@/pages/Base/service';
import { useLocation } from '@@/exports';

const getParameterValue = (data: any) => {
  const value = data?.records?.[0]?.parameterValue;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const isOutOfRange = (value: any, limit?: number) => {
  if (limit === undefined) return false;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && Math.abs(numericValue) > Math.abs(limit);
};

const TreeCard: React.FC<any> = ({ mapRef, onSelected, showSpecial }) => {
  const [data, setData] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => {
    const params = {
      current: 1,
      pageSize: 10
    };

    if (showSpecial) {
      specialTree().then(res => {
        setData(res.data)
      })
    } else {
      Promise.all([
        newTree(),
        parameterPage({ ...params, parameterCode: 'upperLeftSlope' }).catch(() => undefined),
        parameterPage({ ...params, parameterCode: 'upperRightSlope' }).catch(() => undefined)
      ]).then(([treeRes, upperLeftSlopeRes, upperRightSlopeRes]) => {
        const upperLeftSlope = getParameterValue(upperLeftSlopeRes?.data);
        const upperRightSlope = getParameterValue(upperRightSlopeRes?.data);
        const treeData = treeRes.data?.map((area: any) => ({
          ...area,
          lands: area.lands?.map((land: any) => ({
            ...land,
            isAdjacentGradientTooLarge:
              isOutOfRange(land.upperLeftEdgeDegrees, upperLeftSlope) ||
              isOutOfRange(land.upperRightEdgeDegrees, upperRightSlope)
          }))
        }));

        setData(treeData);
      });
    }

  }, [showSpecial]);

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

  const specialLoop = () => data.map((item: any) => (
    <Tree.TreeNode
      title={item.areaName}
      key={`areaId-${item.areaId}`}
      data={item.plotInfoList}
      switcherIcon={null}
    >
      {item.plotInfoList?.map((i: any) => (
        <Tree.TreeNode title={i.plotId} key={`plotId-${i.plotId}-${item.areaId}`} switcherIcon={null}>
          {
            i.arrayInfoList?.map(aa => (
              <Tree.TreeNode title={aa.arrayId} key={`arrayId-${aa.arrayId}-${i.plotId}-${item.areaId}`} switcherIcon={null}>
                  {aa.strIdList?.map(st => <Tree.TreeNode title={st} key={`strId-${st}-${aa.arrayId}-${i.plotId}-${item.areaId}`} switcherIcon={null} />)}
              </Tree.TreeNode>
            ))
          }
        </Tree.TreeNode>
      ))}
    </Tree.TreeNode>
  ));


  const onSelect: TreeProps['onSelect'] = async (_, { node }: any) => {
    const { data, __pointData } = node;
      console.log(11111, __pointData, showSpecial)
    if (location.pathname.indexOf('/base/area') !== -1) {
      // mapRef.current?.home(data, node.key.startsWith('land') ? node.title : undefined);
        if (!showSpecial) {
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
