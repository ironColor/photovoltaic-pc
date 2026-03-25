import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import '@amap/amap-jsapi-types';
import gcoord from 'gcoord';
import robot from '/public/picture/robot2.png';


(window as any)._AMapSecurityConfig = {
  securityJsCode: '54e31215732849cfe60cf61458293212'
};

type MapProps = {
  styles?: React.CSSProperties;
  complete?: () => void;
  onLandClick?: (land: any) => void;
}

const POINT_TYPE_TAKEOFF = 10; // 起飞点
const POINT_TYPE_MOUNT = 7;    // 挂载点
const POINT_TYPE_UNLOAD = 8;   // 卸载点

const legendItems = [
  { color: 'grey', label: '未清洗' },
  { color: 'green', label: '已清洗' },
  { color: 'red', label: '坡度过大' }, // 如果有其他颜色也需要在这里定义
];

function isWithinLastMonth(timeStr) {
  if (!timeStr) return false;

  const time = new Date(timeStr.replace(' ', 'T'));
  if (isNaN(time.getTime())) return false;

  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);

  return time >= oneMonthAgo && time <= now;
}


const Map: React.ForwardRefRenderFunction<
  {
    execute?: (position: [], air?: [number, number]) => void;
    log?: (lineArr: Array<[number, number]>) => void;
    home?: (regionArr: any, regionId: number) => void;
    initRobot?: (info: any) =>  void;
  },
  MapProps
> = (props, ref) => {
  const AMap = useRef<any>(null);
  const map = useRef<any>(null);
  const polygonMap = useRef<Record<string, any>>({}); // 缓存所有 polygon 实例，用于高亮控制
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const robotMarkersRef = useRef<Record<string, AMap.Marker>>({});
  const infoWindowRef = useRef<any>(null); // 用于复用 InfoWindow

  const layersRef = useRef<{
    vector?: any;
    satellite?: any;
    roadNet?: any;
  }>({});


  const init = async () => {
    try {
      const aMap = await AMapLoader.load({
        key: 'e486dd7ef2fbc6329ec2c04f1287787e',
        version: '2.0'
      });

      AMap.current = aMap;

      layersRef.current.vector = new aMap.TileLayer({
        zIndex: 1
      });

      layersRef.current.satellite = new aMap.TileLayer.Satellite({
        zIndex: 1
      });

      layersRef.current.roadNet = new aMap.TileLayer.RoadNet({
        zIndex: 2
      });

      map.current = new aMap.Map('container', {
        viewMode: '3D',
        zoom: 14,
        center: [116.397428, 39.90923],
        layers: [layersRef.current.vector]
      });

      map.current.on('complete', () => {
        console.log('地图资源加载完成～');
        props.complete?.(true);
      });
    } catch (err) {
      console.error('MAP ERROR~~～', err);
    }
  };

  const updateMapLayers = (isSatellite: boolean) => {
    if (!map.current) return;

    if (isSatellite) {
      map.current.setLayers([
        layersRef.current.satellite,
        // layersRef.current.roadNet
      ]);
    } else {
      map.current.setLayers([
        layersRef.current.vector
      ]);
    }
  };

  const toggleMapView = () => {
    setIsSatelliteView(prev => {
      const next = !prev;
      updateMapLayers(next);
      return next;
    });
  };

  const initLand = (regionArr: any, pointArray: any) => {
    if (map.current) {
      map.current.clearMap();
      polygonMap.current = {};
      polygonMap.current = {};

      if (!regionArr?.length) return;

      let totalLng = 0;
      let totalLat = 0;
      let validCount = 0;

      // 辅助函数：计算单个地块的中心（取 points 平均值）
      const getPolygonCenter = (points: any[]) => {
        if (!points || points.length === 0) return null;
        let sumLng = 0, sumLat = 0;
        for (const p of points) {
          sumLng += p.lon;
          sumLat += p.lat;
        }
        return [sumLng / points.length, sumLat / points.length];
      };

      // 遍历所有地块，累加中心
      const centers: number[][] = [];
      for (const item of regionArr) {
        const center = getPolygonCenter(item.landPoints);
        if (center) {
          centers.push(center);
          totalLng += center[0];
          totalLat += center[1];
          validCount++;
        }
      }


      regionArr?.map((item: any) => {
        const polygonPath = item?.landPoints?.map((point: any) => {
          const result = gcoord.transform([point.lon, point.lat], gcoord.WGS84, gcoord.GCJ02);
          return new AMap.current.LngLat(result[0], result[1]);
        });

        const polygon = new AMap.current.Polygon({
          path: polygonPath,
          strokeOpacity: 0,
          fillColor: item.isSlopeTooLarge ? 'red' : isWithinLastMonth(item.lastCleanTime) ? 'green' : 'grey',
          cursor: item.isSlopeTooLarge ? '' : 'pointer',
          clickable: true,
        });

        map.current.add(polygon);
        polygonMap.current[item.landId] = polygon;

        const center = polygon.getBounds().getCenter();

        const text = new AMap.current.Text({
          text: item.landName || '未命名',
          position: center,
          anchor: 'center',
          style: {
            color: 'black',
            fontSize: '10px',
            fontWeight: 'bold',
            background: 'transparent',
            border: 'none',
            textAlign: 'center',
          },
          zIndex: 200,
          clickable: true
        });

        map.current.add(text);
      });

      if (pointArray && Array.isArray(pointArray)) {
        for (const point of pointArray) {
          // 检查是否为需要渲染的点类型
          if (![POINT_TYPE_TAKEOFF, POINT_TYPE_MOUNT, POINT_TYPE_UNLOAD].includes(point.pointType)) {
            continue; // 跳过不需要渲染的点
          }

          // 坐标转换
          const transformedCoords = gcoord.transform([point.lon, point.lat], gcoord.WGS84, gcoord.GCJ02);
          const lngLat = new AMap.current.LngLat(transformedCoords[0], transformedCoords[1]);

          switch (point.pointType) {
            case POINT_TYPE_TAKEOFF: {
              // 创建起飞点：带虚线的椭圆
              const ellipse = new AMap.current.Ellipse({
                center: lngLat,
                radius: [2, 1],
                strokeColor: "#3366FF",
                strokeWeight: 2,
                strokeStyle: "dashed",
                strokeOpacity: 1,
                fillColor: "",
                fillOpacity: 0,
                zIndex: 100,
              });
              map.current.add(ellipse);
              break;
            }
            case POINT_TYPE_MOUNT: {
              // 创建挂载点：实心圆
              const solidCircle = new AMap.current.Circle({
                center: lngLat,
                radius: 1,
                strokeColor: "#FF3333",
                strokeWeight: 2,
                fillColor: "#FF3333",
                fillOpacity: 0.6,
                zIndex: 100,
              });
              map.current.add(solidCircle);
              break;
            }
            case POINT_TYPE_UNLOAD: {
              // 创建卸载点：空心圆
              const hollowCircle = new AMap.current.Circle({
                center: lngLat,
                radius: 1,
                strokeColor: "#333333",
                strokeWeight: 2,
                fillColor: "",
                fillOpacity: 0,
                zIndex: 100,
              });
              map.current.add(hollowCircle);
              break;
            }
          }
        }
      }


      if (validCount > 0) {
        const avgCenterWGS84: [number, number] = [
          totalLng / validCount,
          totalLat / validCount,
        ];

        // 坐标转换：WGS84 → GCJ02（高德坐标系）
        const [gcjLng, gcjLat] = gcoord.transform(avgCenterWGS84, gcoord.WGS84, gcoord.GCJ02);

        // 设置中心点和缩放级别（建议 13～15，根据你的数据密度调整）
        const targetZoom = 19; // 👈 可按需调整
        map.current.setZoomAndCenter(targetZoom, new AMap.current.LngLat(gcjLng, gcjLat));
      }
      setShowLegend(true)
    }
  };

  const initRobot = (pointInfo: any) => {
    if (map.current) {
      const { robotCode, longitude, latitude } = pointInfo;

      const [lng, latGCJ] = gcoord.transform(
        [longitude, latitude],
        gcoord.WGS84,
        gcoord.GCJ02
      );

      if (!infoWindowRef.current) {
        infoWindowRef.current = new AMap.current.InfoWindow({
          isCustom: true,
          autoMove: true,
          offset: new AMap.current.Pixel(7, -2),
        });
      }

      let marker = robotMarkersRef.current[robotCode];

      const position = new AMap.current.LngLat(lng, latGCJ);

      if (marker) {
        // 更新已有 marker 位置
        marker.setPosition(position);
      } else {
        marker = new AMap.current.Marker({
          position,
          label: { // 添加 label 配置
            content: `机器人 ${robotCode}`, // 标签内容
            direction: 'right' // 标签相对于标记点的方向
          },
          // 可自定义图标，例如：
          icon: robot,
          // 或使用默认图标
          zIndex: 1000,
        });

        marker.on('mouseover', () => {
          // 构造显示内容：可显示原始 WGS84 或 GCJ02
          const content = `
        <div style="padding: 2px; font-size: 10px; line-height: 1;">
          <div><b>经度:</b> ${lon.toFixed(6)}</div>
          <div><b>纬度:</b> ${lat.toFixed(6)}</div>
          <!-- 如需显示高德坐标，可用 lng/latGCJ -->
        </div>
      `;
          infoWindowRef.current?.setContent(content);
          infoWindowRef.current?.open(map.current, marker.getPosition());
        });

        marker.on('mouseout', () => {
          infoWindowRef.current?.close();
        });
      }
      map.current.add(marker);
      robotMarkersRef.current[robotCode] = marker;
      map.current.setFitView(null, false, [150, 60, 100, 60], 21);
    }
  }

  const highlightLandsByIds = (landIds: any) => {
    if (!map.current) return;

    landIds.forEach(id => {
      const targetPoly = polygonMap.current[id];
      if (targetPoly) {
        targetPoly.setOptions({
          fillColor: 'yellow',
          fillOpacity: 0.6,
          strokeWeight: 2,
          extData: {
            preColor: targetPoly.getOptions().fillColor
          }
        });
      }
    })
  }

  const resetLand = id => {
    const targetPoly = polygonMap.current[id];

    if (targetPoly) {
      targetPoly.setOptions({
        fillColor: targetPoly.getExtData().preColor,
        fillOpacity: 0.6,
        strokeWeight: 2,
      });
    }
  }


  const home = (regionArr: any, landName?: number) => {
    if (map.current) {

      map.current.clearMap();
      regionArr?.map((item: any) => {
        const polygonPath = item?.landPoints?.map((point: any) => {
          const result = gcoord.transform([point.lon, point.lat], gcoord.WGS84, gcoord.GCJ02);
          return new AMap.current.LngLat(result[0], result[1]);
        });

        const polygon = new AMap.current.Polygon({
          path: polygonPath,
          strokeOpacity: 0,
          fillColor:
            landName === undefined ? '#00B2D5' : item.landName === landName ? '#00B2D5' : '#aaaaaa'
        });

        map.current.add(polygon);

        const center = polygon.getBounds().getCenter();

        const text = new AMap.current.Text({
          text: item.landName || '未命名',
          position: center,
          anchor: 'center',
          style: {
            color: 'black',
            fontSize: '14px',
            fontWeight: 'bold',
            background: 'transparent',
            border: 'none',
            textAlign: 'center',
          },
          zIndex: 200,
        });

        map.current.on('zoomchange', () => {
          const zoom = map.current.getZoom();
          text.setStyle({
            fontSize: zoom >= 15 ? '14px' : '8px',
          });
        });

        map.current.add(text);
      });



      // 自自适应所有覆盖物
      map.current.setFitView(null, false, [60, 60, 100, 60], 19);
    }
  };

  /**
   * 实时监控页面
   * @param position 坐标信息
   * @param air 飞机位置
   */
  const execute = (position: [] = [], air?: [number, number]) => {
    map.current?.clearMap();
    console.log('execute~~~', position);
    // 判断，初次为初始化对象时，直接返回
    if (!AMap.current?.LngLat) return;

    position.map((item: any) => {
      const path = item?.landPoints?.map((point: any) => {
        const result = gcoord.transform([point.lon, point.lat], gcoord.WGS84, gcoord.GCJ02);
        return new AMap.current.LngLat(result[0], result[1]);
      });

      const overlay = new AMap.current.Polygon({
        path: path,
        fillColor: color(item.execStatus, 0),
        fillOpacity: item.taskType === 0 ? 0 : 0.8,
        strokeStyle: item.taskType === 0 ? 'dashed' : 'solid',
        strokeColor: color(item.execStatus, 0),
        strokeWeight: item.taskType === 0 ? 3 : 0
      });
      map.current.add(overlay);
    });

    const lines: any = position?.filter(
      (item: { execStatus: string }) => item.execStatus === '执行中'
    );
    lines.length > 0 && execLines(lines);
    // 飞机的实时位置
    if (air && air?.length > 0) {
      const marker = new AMap.current.Marker({
        position: gcoord.transform(air, gcoord.WGS84, gcoord.GCJ02)
      });
      map.current.add(marker);
    }

    map.current.setFitView(null, false, [150, 60, 100, 60], 21);
  };

  const execLines = (lines: any[] = []) => {
    lines.map(line => {
      const points = line.commandTaskLogs || line.subTasks.filter(item => item.execStatus === '执行中')[0].commandTasks;
      if (!points) {
        return;
      }
      console.log('points', points);
      // 判断第一个坐标和最后一个坐标是否相同，如果相同最后一个坐标圆点将不渲染
      const isLoop =
        points[0]?.coordinate?.lon === points[points?.length - 1]?.coordinate?.lon &&
        points[0]?.coordinate?.lat === points[points?.length - 1]?.coordinate?.lat;

      points?.map((item: any, index: number) => {
        if (isLoop && index === points.length - 1) {
          return;
        }

        const markerContent = `
        <div style="
          position: absolute; 
          top: -9px; right: -10px; 
          width: 20px; height: 19px; 
          font-size: 12px; 
          background: ${color(item.execStatus, 1)}; 
          border-radius: 50%; 
          color: #fff; 
          text-align: center; 
          line-height: 15px; 
          border: 2px #ffffff solid;
        ">${index + 1}</div>`;

        const marker = new AMap.current.Marker({
          position: gcoord.transform(
            [item.coordinate.lon, item.coordinate.lat],
            gcoord.WGS84,
            gcoord.GCJ02
          ),
          content: markerContent
        });

        // 将 markers 添加到地图
        map.current.add(marker);
      });

      points.map((item: any, index: number) => {
        if (index === points.length - 1) {
          return;
        }
        const path = [item, points[index + 1]];

        const polyline = new AMap.current.Polyline({
          path: path.map((item: any) =>
            gcoord.transform([item.coordinate.lon, item.coordinate.lat], gcoord.WGS84, gcoord.GCJ02)
          ),
          // 是否显示描边，默认false
          isOutline: true,
          // 线条描边颜色，默认：#00B2D5
          outlineColor: '#fff',
          // 描边线宽度，默认为1
          borderWeight: 1,
          // 轮廓线颜色，默认值为 #00D3FC
          strokeColor: `${color(points[index + 1].execStatus, 1)}`,
          // 轮廓线透明度，取值范围 [0,1]，默认为0.9
          strokeOpacity: 1,
          // 轮廓线宽度
          strokeWeight: 3,
          strokeStyle: 'solid',
          lineJoin: 'round',
          lineCap: 'round',
          zIndex: 50
        });
        map.current.add(polyline);
      });
    });
  };

  const log = (points: any[]) => {
    map.current.clearMap();
    logLines(points || []);
    map.current.setFitView(null, false, [150, 60, 100, 60], 21);
  };

  const logLines = (points: any[] = []) => {
    // 判断第一个坐标和最后一个坐标是否相同，如果相同最后一个坐标圆点将不渲染
    const isLoop =
      points[0]?.lon === points[points.length - 1]?.lon &&
      points[0]?.lat === points[points.length - 1]?.lat;

    points?.map((item, index) => {
      if (isLoop && index === points.length - 1) {
        return;
      }

      const markerContent = `
        <div style="
          position: absolute; 
          top: -9px; right: -10px; 
          width: 20px; height: 19px; 
          font-size: 12px; 
          background: ${color(item.execStatus, 1)}; 
          border-radius: 50%; 
          color: #fff; 
          text-align: center; 
          line-height: 15px; 
          border: 2px #ffffff solid;
        ">${index + 1}</div>`;

      const marker = new AMap.current.Marker({
        position: gcoord.transform([item.lon, item.lat], gcoord.WGS84, gcoord.GCJ02),
        content: markerContent
      });

      // 将 markers 添加到地图
      map.current.add(marker);
    });

    points.map((item, index) => {
      if (index === points.length - 1) {
        return;
      }
      const path = [item, points[index + 1]];

      const polyline = new AMap.current.Polyline({
        path: path.map((item: { lon: number; lat: number }) =>
          gcoord.transform([item.lon, item.lat], gcoord.WGS84, gcoord.GCJ02)
        ),
        // 是否显示描边，默认false
        isOutline: true,
        // 线条描边颜色，默认：#00B2D5
        outlineColor: '#fff',
        // 描边线宽度，默认为1
        borderWeight: 1,
        // 轮廓线颜色，默认值为 #00D3FC
        strokeColor: `${color(points[index + 1].execStatus, 1)}`,
        // 轮廓线透明度，取值范围 [0,1]，默认为0.9
        strokeOpacity: 1,
        // 轮廓线宽度
        strokeWeight: 3,
        strokeStyle: 'solid',
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 50
      });
      map.current.add(polyline);
    });
  };

  const color = (execStatus: string, type: number) => {
    if (execStatus === '待执行') {
      return '#BFBFBF';
    } else if (execStatus === '已完成') {
      return type === 0 ? '#62c400' : '#1677ff';
    } else if (execStatus === '执行中') {
      return '#f3ac00';
    } else if (execStatus === '失败' || execStatus === '中断' || execStatus === '取消') {
      return 'rgb(255,102,102)';
    } else {
      return '#BFBFBF';
    }
  };

  useEffect(() => {
    init();

    return () => {
      map.current?.clearMap();
      map.current?.destroy();
      map.current = null;
      AMap.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    execute: (position: [], air?: [number, number]) => execute(position, air),
    log: (lineArr: Array<[number, number]>) => log(lineArr),
    home: (regionArr: any, regionId: number) => home(regionArr, regionId),
    initLand: (regionArr: any, pointArray: any) => initLand(regionArr, pointArray),
    highlightLandsByIds: (landIds: any) => highlightLandsByIds(landIds),
    resetLand: id => resetLand(id),
    initRobot: info => initRobot(info)
  }));

  return (
    <div>
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000, padding: '10px', borderRadius: '5px', display: showLegend ? 'unset': 'none' }}>
        <h4>图例</h4>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {legendItems.map((item, index) => (
            <li key={index} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
            <span style={{
              width: '10px',
              height: '10px',
              backgroundColor: item.color,
              marginRight: '5px',
              display: 'inline-block'
            }}></span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div
        id='container'
        style={{
          height: 'calc(100vh - 88px)',
          minHeight: '500px',
          padding: 0,
          margin: 0,
          width: '100%',
          borderRadius: '4px',
          boxShadow: '0 2px 10px 0 rgba(14,33,39,.2)',
          ...props.styles
        }}
      />
      <button onClick={toggleMapView} style={{ position: 'absolute', top: '10px', left: '10px' }}>
        切换到 {isSatelliteView ? '矢量图' : '卫星图'}
      </button>
    </div>
  );
};

export default React.forwardRef(Map);
