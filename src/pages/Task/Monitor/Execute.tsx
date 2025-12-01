import {
  Col,
  Row,
  Card,
  Space,
  Button,
  Statistic,
  Divider,
  Timeline,
  message,
  Modal,
  Badge,
  Tooltip,
  Select
} from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Map from '@/pages/components/Map';
import { useParams, useSearchParams } from '@umijs/max';
import { useWebSocket } from 'ahooks';
import { getCurrentUser } from '@/utils/authority';
import { execute, executeLog, getRobotList } from './service';
import { ExclamationCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { config } from '@/../public/scripts/config';
import Display from '@/pages/Task/Monitor/components/Display';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { dotType, level } from '@/pages/components/Common';
import styles from './Execute.less';
import OperationButton from '@/pages/Task/Monitor/components/Operation/Operation';
import p1 from '/public/picture/01.png';
import p2 from '/public/picture/02.png';
import p3 from '/public/picture/03.png';
import p4 from '/public/picture/04.png';
import p5 from '/public/picture/05.png';
import p6 from '/public/picture/06.png';
import p7 from '/public/picture/07.png';
import p8 from '/public/picture/08.png';
import Block from '@/pages/Task/Monitor/components/Block';

const Execute: React.FC = () => {
  let mapRef = React.createRef<{ execute?: (position: any[], air?: [number, number]) => void }>();
  const [complete, setComplete] = useState(false);
  const [dataArr, setDataArr] = useState<any[]>([]);
  const { id } = useParams();
  const [params] = useSearchParams();
  const [timeLine, setTimeline] = useState<any>();
  // 设备信息
  const [info, setInfo] = useState<any>({});
  // 选择机器人弹窗Modal
  const [open, setOpen] = useState(false);
  // 任务进度索引
  const [index, setIndex] = useState({
    finished: 0,
    total: 0,
    flag: false,
    first: true,
    placementSize: 0,
    auto: false
  });
  // 设备列表
  const [robotList, setRobotList] = useState([]);
  // 所选设备
  const [value, setValue] = useState(undefined);
  // 机器人电压
  const [robotVoltages, setRobotVoltages] = useState<{ [key: string]: number[] }>({});
  const ids = useRef<any>();
  // 连续执行
  const [continuity, setContinuity] = useState(false);

  const lineItemStyle = useEmotionCss(() => ({
    '.ant-timeline-item-last': {
      'padding-bottom': '0',
      'margin-bottom': '-24px'
    }
  }));

  // 页面初始化
  useEffect(() => {
    // todo 存在mapRef.current值被清空的问题，故使用window转存变量
    (window as any).mapRef = mapRef.current?.execute;

    call();
    if (complete) {
      // 建立Websocket连接
      execWS?.connect && execWS?.connect();

      // 执行地图数据初始化
      mapRef.current?.execute?.(dataArr);
    }

    return () => {
      // 断开Websocket连接
      execWS?.disconnect && execWS?.disconnect();
      console.log('Websocket断开连接~');
    };
  }, [complete]);

  /**
   * 任务websocket
   */
  const execWS = useWebSocket(`${config.ws}/pc/${getCurrentUser().username}`, {
    onOpen: event => {
      console.log('通讯WebSocket连接成功：', event);
    },
    onClose: event => {
      console.warn('通讯WebSocket连接关闭：', event);
    },
    onMessage: messages => {
      const mess = messages?.data;
      if (!mess) {
        return;
      }
      // websocket数据
      const data = JSON.parse(mess);
      console.log('WebSocket通讯收到消息：', data);

      if (data.commandCode === 30) {
        // 飞机实时位置
        (window as any).mapRef(dataArr, [data.lon, data.lat]);
        // 更新卫星数、RTK状态、电压等
        setInfo(data);
      } else if (data.commandCode === 31) {
        // 自检成功，获取镜头角度参数
        execute({ commandCode: 25 });
        message.success('自检成功');
      } else if (data.commandCode === 32) {
        // 自检失败
        message.error('自检失败');
      } else if (data.commandCode === 33) {
        // 任务成功
        call();
        message.success('任务完成');
      } else if (data.commandCode === 34) {
        // 任务失败
        call();
        message.error('任务失败');
      } else if (data.commandCode === 35) {
        // ⻜机因缺⽔、缺电等，主动发起暂停执⾏
        call();
        message.error(`暂停任务：${data.reason === 1 ? '电量过低' : '缺水'}`);
      } else if (data.commandCode === 36) {
        // 巡检报警
        call();
        message.warning('发现异常');
      } else if (data.commandCode === 99) {
        message.error('Websocket连接失败，请检查数传IP');
      } else if (data.commandCode === 100) {
        message.error('串口开启失败，请检查串口配置');
      } else if (data.commandCode === 102) {
        message.success('锁闩缩回');
      } else if (data.commandCode === 105) {
        message.success('飞机准备返回');
      } else if (data.commandCode === 110) {
        message.error('吸盘执行失败，准备回收机器人');
      } else if (data.commandCode === 113) {
        message.success(`${data.robotCode}号机器人已结束工作`);
        call();
      } else if (data.commandCode === 117) {
        message.success('释放吸盘成功');
      } else if (data.commandCode === 120) {
        message.error('释放吸盘失败');
      } else if (data.commandCode === 123) {
        setRobotVoltages(prev => ({
          ...prev,
          [data.robotCode]: [data.voltage1, data.voltage2] // 更新或新增机器人电压
        }));
        call();
      } else if (data.commandCode === 127) {
        message.error('机器人工作结束失败');
      } else if (data.commandCode === 0) {
        message.success('执行成功');
      } else if (data.commandCode === 1) {
        message.error('执行失败');
      } else if (data.commandCode === 23) {
        message.success('下一喷洒任务已启动');
      }
    },
    onError: event => {
      console.warn('通讯WebSocket连接错误：', event);
    }
  });

  /**
   * 结束机器人任务
   */
  const stop = async (c: string) => {
    const { code, msg } = await execute({ commandCode: 124, robotCode: c });
    if (code !== 0) {
      message.error(msg || '工作结束失败');
      return;
    }
    message.success('已结束工作');
  };

  /**
   * 实时渲染回调函数
   */
  const call = useCallback(() => {
    executeLog({ parentTaskId: id, id: ids.current?.parentLogId }).then(res => {
      const data = res.data.respChildTaskLogs;
      setIndex({
        finished: res.data?.finishedTaskCount,
        total: res.data?.totalTaskCount,
        flag: data[res.data?.finishedTaskCount]?.taskType === 2,
        first: data[0]?.execStatus === '待执行',
        placementSize: data.filter((item: any) => item.taskType === 2).length,
        auto: res.data.auto
      });

      ids.current = {
        parentLogId: data[0]?.parentLogId,
        childLogId: data[0]?.childLogId
      };

      setTimeline(
        data.map((item: any, index: number) => {
          // 为了实现投放（2）、转移任务（4）执行“清扫任务”单独实现需求
          if (
            (data[index]?.taskType === 2 || data[index]?.taskType === 4) &&
            data[index]?.countDownTime > Date.now()
          ) {
            data[index].execStatus = '执行中';
          }

          return {
            children: (
              <>
                <b>
                  <Tooltip
                    placement='top'
                    title={item.execStatus === '可执行' ? '可执行当前任务' : ''}
                  >
                    {item.execStatus === '可执行' && (
                      <Badge status='processing' style={{ marginRight: '8px' }} />
                    )}
                  </Tooltip>
                  {item.taskName}
                </b>
                <div
                  className={styles.code}
                  style={{ display: item.robotCode ? 'inline-block' : 'none' }}
                >
                  {item.robotCode && `机器人：${item.robotCode} `}
                  {robotVoltages[item.robotCode] &&
                    ` 🔋${level[robotVoltages[item.robotCode][0]]}🔋${
                      level[robotVoltages[item.robotCode][1]]
                    }`}
                  <div className={styles.closeIcon} onClick={() => stop(item.robotCode)}>
                    ×
                  </div>
                </div>
                {item.commandTaskLogs?.length > 0 && (
                  <Timeline
                    style={{ marginTop: '18px' }}
                    className={lineItemStyle}
                    items={item.commandTaskLogs.map((item: any, index: number) => {
                      return {
                        children: (
                          <>
                            <span style={{ marginRight: '12px' }}>{index + 1}</span>
                            {dotType[item.type]}
                          </>
                        ),
                        color: execStatus(item.execStatus),
                        dot: item.execStatus === '执行中' ? <LoadingOutlined /> : undefined
                      };
                    })}
                  />
                )}
                {data[index]?.countDownTime > Date.now() && (
                  <div>
                    等待清扫：
                    <Statistic.Countdown
                      style={{ display: 'inline' }}
                      valueStyle={{ display: 'inline', fontSize: 16 }}
                      value={data[index]?.countDownTime || 0}
                      onFinish={() => {
                        // 倒计时结束状态改为"已完成"
                        data[
                          data.findIndex((task: any) => task.execStatus === '执行中')
                        ].execStatus = '已完成';
                        (window as any).mapRef(data);
                      }}
                    />
                  </div>
                )}
              </>
            ),
            color: execStatus(item.execStatus),
            dot: item.execStatus === '执行中' ? <LoadingOutlined /> : undefined
          };
        })
      );
      setDataArr(data);
      // todo 存在mapRef.current值被清空的问题
      (window as any).mapRef(data);
      // mapRef.current?.execute?.(data);
    });
  }, [robotVoltages]);

  /**
   * 状态颜色
   */
  const execStatus = useCallback((status: string) => {
    const statusColors: Record<string, string> = {
      待执行: 'gray',
      可执行: 'gray',
      执行中: '#1677ff',
      已完成: '#1677ff',
      失败: 'red',
      中断: 'red',
      取消: 'red'
    };
    // 默认返回一个颜色，防止未知状态
    return statusColors[status] || 'red';
  }, []);

  /**
   * 启动、下一步
   */
  const start = useCallback(async () => {
    if (index.flag && !index.auto) {
      await isOpen();
      return;
    }
    // 非投放任务
    await isSend();
  }, [index]);

  /**
   * 设备列表弹窗
   */
  const isOpen = useCallback(async () => {
    setOpen(true);

    const { code, data, msg } = await getRobotList();
    if (code !== 0) {
      message.error(msg || '获取机器人列表失败');
      return null;
    }
    setRobotList(data);
  }, [index]);

  /**
   * 选择机器人
   */
  const isSend = useCallback(
    async () => {
      let v: any = value;
      if (value && typeof value === 'string') {
        v = [value];
      }

      const { code, msg } = await execute({
        commandCode: continuity ? 45 : index.first ? 21 : 23,
        parentTaskId: id,
        robotCodes: v
      });

      if (code !== 0) {
        message.error(msg || '执行失败');
        return;
      }
      setOpen(false);
      setContinuity(false);
      setValue(undefined);
      call();
    },
    [value, index, continuity]
  );

  /**
   * 取消任务
   */
  const cancel = useCallback(async () => {
    Modal.confirm({
      title: '确定要取消当前任务吗？',
      icon: <ExclamationCircleFilled />,
      onOk() {
        command(24);
        history.go(0);
      }
    });
  }, []);

  /**
   * command通用接口
   */
  const command = useCallback(async (c: number) => {
    const { code, msg } = await execute({ commandCode: c, parentTaskId: id });
    if (code !== 0) {
      message.error(msg || '执行失败');
      return null;
    }
    // 刷新列表
    call();
    message.success('消息已发出');
  }, []);

  /**
   * 连续执行
   */
  const continues = useCallback(async () => {
    setContinuity(true);
    // 连续执行仅任务开始使用，且存在投放任务
    if (index.first && index.placementSize > 0) {
      await isOpen();
    } else if (index.first && index.placementSize === 0) {
      const { code, msg } = await execute({
        commandCode: 45,
        parentTaskId: id,
      });

      if (code !== 0) {
        message.error(msg || '执行失败');
        return;
      }
      setContinuity(false);
      call();
    } else {
      message.warning('当前任务已开始执行');
    }
  }, [index]);

  return (
    <Card
      bordered={false}
      title='执行任务'
      className={styles.head}
      extra={
        <Space>
          <Display count={info.rtkCount} status={info.rtkStatus} voltage={info.voltage} />
          <Button
            type={'primary'}
            style={{ backgroundColor: '#13c2c2' }}
            onClick={() => command(20)}
          >
            自检
          </Button>
          <Button type={'primary'} onClick={start}>
            {index.first ? '启动' : '下一步'}
          </Button>
          <Button type='primary' danger onClick={() => command(22)}>
            悬停
          </Button>
          <Button type='primary' danger onClick={cancel}>
            任务取消
          </Button>
          <Button onClick={() => history.back()}>返回</Button>
        </Space>
      }
    >
      <Row gutter={16}>
        <Col flex='400px'>
          <Statistic
            title={params.get('areaName') || '获取失败'}
            value={params.get('taskName') || '获取失败'}
            style={{ margin: '0' }}
          />
          <Divider style={{ width: '200px', minWidth: '150px', margin: '6px 12px 2px 0' }} />
          <Timeline
            style={{ padding: '24px 0', width: '380px', height: '72vh', overflowY: 'auto' }}
            items={timeLine}
          />
        </Col>
        <Col flex='auto'>
          <div>
            <Space className={styles.operation}>
              <OperationButton label='校准缓降器' icon={p3} onClick={() => command(27)} />
              <OperationButton label='收绳' icon={p1} onClick={() => command(28)} />
              <OperationButton label='放绳' icon={p2} onClick={() => command(29)} />
              <OperationButton label='弹出锁闩' icon={p5} onClick={() => command(42)} />
              <OperationButton label='缩回锁闩' icon={p4} onClick={() => command(41)} />
              <OperationButton label='投球算法校准' icon={p6} onClick={() => command(43)} />
              <OperationButton label='投球算法验证' icon={p7} onClick={() => command(44)} />
              <OperationButton label='连续执行' icon={p8} onClick={continues} />
            </Space>
            <div className={styles.sign}>
              <Block type='none' color='#62c400' title='已清扫' />
              <Block type='none' color='#f3ac00' title='清扫中' />
              <Block type='none' color='#bfbfbf' title='未清扫' />
              <Block type='2px #62c400 dashed' color='' title='已喷洒' />
              <Block type='2px #f3ac00 dashed' color='' title='喷洒中' />
              <Block type='2px #bfbfbf dashed' color='' title='未喷洒' />
              <Block type='none' color='#1677ff' title='已完成' />
              <Block type='none' color='#bfbfbf' title='未完成' />
            </div>
            <Map styles={{ height: 'calc(100vh - 190px)' }} complete={setComplete} ref={mapRef} />
            <Modal
              title='请选择投放的机器人'
              open={open}
              onOk={() => {
                isSend();
              }}
              onCancel={() => {
                setOpen(false);
                setContinuity(false);
                setValue(undefined);
              }}
              destroyOnClose
            >
              <Select
                showSearch
                optionFilterProp='label'
                style={{ width: '100%' }}
                placeholder={'请选择要投放的机器人'}
                onChange={value => setValue(value)}
                options={robotList.map((i: any) => ({ label: i.robotCode, value: i.robotCode }))}
                mode={continuity ? 'multiple' : undefined}
                maxCount={continuity ? index.placementSize : undefined}
              />
            </Modal>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default Execute;
