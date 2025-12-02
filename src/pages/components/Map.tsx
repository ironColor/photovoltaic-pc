import React, { useEffect, useImperativeHandle, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import '@amap/amap-jsapi-types';
import gcoord from 'gcoord';

(window as any)._AMapSecurityConfig = {
  securityJsCode: '54e31215732849cfe60cf61458293212'
};

const Map: React.ForwardRefRenderFunction<
  {
    execute?: (position: [], air?: [number, number]) => void;
    log?: (lineArr: Array<[number, number]>) => void;
    home?: (regionArr: any, regionId: number) => void;
  },
  { styles?: React.CSSProperties; complete?: any }
> = (props, ref) => {
  const AMap = useRef<any>(null);
  const map = useRef<any>(null);

  const init = async () => {
    AMapLoader.load({
      key: 'e486dd7ef2fbc6329ec2c04f1287787e',
      version: '2.0'
    })
      .then(aMap => {
        AMap.current = aMap;
        map.current = new aMap.Map('container', {
          viewMode: '3D',
          zoom: 14,
          center: [116.397428, 39.90923]
        });
        map.current.on('complete', () => {
          console.log('地图资源加载完成~');
          props.complete && props.complete(true);
        });
      })
      .catch(err => {
        console.error('MAP ERROR~~~', err);
      });
  };

  const home = (regionArr: any, landName?: number) => {
    map.current.clearMap();
    console.log('xxxx', regionArr, landName);
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
    });

    // 自自适应所有覆盖物
    map.current.setFitView(null, false, [60, 60, 100, 60], 19);
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
      const points = line.commandTaskLogs;
      if (!points) {
        return;
      }
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
    }
  };

  useEffect(() => {
    init();

    return () => {
      map.current?.clearMap();
      map.current?.destroy();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    execute: (position: [], air?: [number, number]) => execute(position, air),
    log: (lineArr: Array<[number, number]>) => log(lineArr),
    home: (regionArr: any, regionId: number) => home(regionArr, regionId)
  }));

  return (
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
  );
};

export default React.forwardRef(Map);
