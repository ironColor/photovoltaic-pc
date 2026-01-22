import React, { useEffect } from 'react';
import { Badge } from 'antd';
import { getParams } from '@/pages/Task/Monitor/service';

interface DisplayProps {
  count: number;
  status: number;
  voltage: number;
}

const Index: React.FC<DisplayProps> = ({ count, status, voltage }) => {
  const [params, setParams] = React.useState<string>();

  useEffect(() => {
    getParams({ parameterCode: 'com' }).then(res => setParams(res?.data?.parameterValue));
  }, []);

    return (
      <div
        style={{
          display: 'inline-flex',
          columnGap: '24px',
          marginRight: '48px',
          fontWeight: '600',
          border: '1px solid black'
        }}
      >
        <div>串口参数：{params ? params : '暂无数据'}</div>
        <div>卫星数量：{count ? count + '个' : '暂无数据'}</div>
        <div>
          RTK状态：
          {status !== undefined ? (
            status === 1 ? (
              <Badge status='success' text='正常' />
            ) : (
              <Badge status='error' style={{ color: '#ff5858' }} text='异常' />
            )
          ) : (
            '暂无数据'
          )}
        </div>
        <div style={voltage && voltage < 89 ? { color: '#ff5858' } : undefined}>
          当前电压：{voltage ? voltage + 'V' : '暂无数据'}
        </div>
      </div>
    );
};

export default React.memo(Index);
