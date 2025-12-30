import {
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  message,
  Modal,
  Radio,
  Row,
  Space, Statistic, Timeline,
  Tooltip
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from '@@/exports';
import Map from '@/pages/components/Map';
import { Panel } from 'rc-collapse';
import { commandApi, workOrderExcute, workOrderImmediate } from '@/pages/Task/WorkOrder/service';
import { useWebSocket } from 'ahooks';
import { config } from '../../../../public/scripts/config';
import { getCurrentUser } from '@/utils/authority';
import { execute } from '@/pages/Task/Monitor/service';
import { ExclamationCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { dotType, level, taskType } from '@/pages/components/Common';
import styles from '@/pages/Task/Monitor/Execute.less';
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
import Display from '@/pages/Task/Monitor/components/Display';
import { useEmotionCss } from '@ant-design/use-emotion-css';

export default function ExecuteWork() {
  let mapRef = React.createRef<{ execute?: (position: any[], air?: [number, number]) => void }>();
  const [complete, setComplete] = useState(false);
  const [dataArr, setDataArr] = useState<any[]>([]);
  const [colKey, setColKey] = useState<any[]>([201]);
  const [select, setSelect] = useState<string>();
  const [subTaskId, setSubTaskId] = useState<string>();
  const [searchParams] = useSearchParams();
  const [orderLogId, setOrderLogId] = useState();
  const [text, setText] = useState<string>();
  // 设备信息
  const [info, setInfo] = useState<any>({});
  const [timeLine, setTimeline] = useState<any>();
  const lineItemStyle = useEmotionCss(() => ({
    '.ant-timeline-item-last': {
      'padding-bottom': '0',
      'margin-bottom': '-24px'
    }
  }));

  const call = useCallback(() => {
    if (orderLogId) {
      workOrderImmediate({ id: orderLogId }).then(res => {
        const { code, msg, data } = res;
        if (code !== 0) {
          message.error(msg || '获取失败');
          return;
        }
        const formatData = data?.landInfos?.map((item: any) => {
          return {
            ...item,
            execStatus: item.subTasks[0]?.execStatus
          }
        })
        setDataArr(formatData)
      })
    } else {
      message.error('不存在orderLogId，无法刷新列表')
    }
  }, [orderLogId])


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


  const command = useCallback(async (c: number) => {
    const orderId = searchParams.get('id');
    const { code, msg } = await commandApi({ commandCode: c, workOrderId: Number(orderId), subTaskId: subTaskId });
    if (code !== 0) {
      message.error(msg || '执行失败');
      return null;
    }
    // 刷新列表
    call();
    message.success('消息已发出');
  }, [subTaskId]);


  const speak = (text: any) => {
    // 创建语音实例
    const utterance = new SpeechSynthesisUtterance(text);

    // 可选：设置语音参数
    utterance.lang = 'zh-CN';        // 语言
    utterance.rate = 1;              // 语速 (0.1 ~ 10，默认 1)
    utterance.pitch = 1;             // 音调 (0 ~ 2，默认 1)
    utterance.volume = 1;            // 音量 (0 ~ 1)

    // 播报
    window.speechSynthesis.speak(utterance);
  };

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


  useEffect(() => {
    if (dataArr.length > 0) {
      setTimeline(dataArr.map((item: any) => {
        item.execStatus = item.subTasks[0]?.execStatus;

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
                {item.landName}
                ({` 机器人${item.robotCode}`})
                <div className={styles.closeIcon} onClick={() => stop(item.robotCode)}>
                  ×
                </div>
              </div>
              {
                item.subTasks?.length > 0 && <Collapse size="small" defaultActiveKey={colKey} onChange={(key) => setColKey([...colKey, ...key])}>
                  {
                    item.subTasks.map((task: any, index: number) =>  <Panel
                      key={task.subtaskId}
                      header={<Radio checked={subTaskId ===  task.subtaskId} onChange={() => {
                        setText(`执行任务${task.taskName}，机器人${item?.robotCode}${taskType[task.taskType]}至${item.landName}`.replace(/(\d+)-(\d+)-(\d+)/g, '$1杠$2杠$3'))
                        setSubTaskId(task.subtaskId)
                        setSelect(`${task.taskName}-${index}`)
                        setColKey([...colKey, task.subtaskId])
                      }} >
                        {`${task.taskName}`}
                        {
                          task.error &&
                          <Tooltip
                            title={"错误码说明"}
                          >
                            {task.error}
                          </Tooltip>
                        }
                      </Radio>}>
                      {task.commandTasks?.length > 0 && (
                        <Timeline
                          style={{ marginTop: '18px' }}
                          className={lineItemStyle}
                          items={task.commandTasks.map((item: any, index: number) => {
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
                    </Panel>)
                  }
                </Collapse>
              }
            </>
          ),
          color: execStatus(item.execStatus),
          dot: item.execStatus === '执行中' ? <LoadingOutlined /> : undefined
        }
      }));
    }
  }, [dataArr, subTaskId]);

  useEffect(() => {
    const orderId = searchParams.get('id');
    workOrderExcute({ orderId }).then(res => {
      const { code, msg, data } = res;
      if (code !== 0) {
        message.error(msg || '获取失败');
        return;
      }
      setDataArr(data.landInfos);


      (window as any).mapRef(data?.landInfos?.map((item: any) => {
        return {
          ...item,
          execStatus: item.subTasks[0]?.execStatus
        }
      }));
      setOrderLogId(data.orderLogId)
    })
  }, [searchParams])

  // 页面初始化
  useEffect(() => {
    // todo 存在mapRef.current值被清空的问题，故使用window转存变量
    (window as any).mapRef = mapRef.current?.execute;

    if (complete) {
      // 建立Websocket连接
      if (execWS?.connect) {
        execWS?.connect()
      }
      // execWS?.connect && execWS?.connect();
      // 执行地图数据初始化
      mapRef.current?.execute?.(dataArr);
    }

    return () => {
      // 断开Websocket连接
      if (execWS?.disconnect) {
        execWS?.disconnect()
      }
      // execWS?.disconnect && execWS?.disconnect();
      console.log('Websocket断开连接~');
    };
  }, [complete]);

  const onStart = async () => {
    if (subTaskId) {
      speak(text)
      Modal.confirm({
        title: text,
        onOk() {
          command(21);
        }
      });
    } else {
      message.error('请选择子任务')
    }

  }

  /**
   * 结束机器人任务
   */
  const stop = async (c: string) => {
    const orderId = searchParams.get('id');
    const { code, msg } = await commandApi({ commandCode: 124, robotCode: c, workOrderId: Number(orderId), subTaskId: subTaskId });
    if (code !== 0) {
      message.error(msg || '工作结束失败');
      return;
    }
    // 刷新列表
    call();
    message.success('已结束工作');
  };

  return (
    <Card
      bordered={false}
      title='执行工单'
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
          <Button type={'primary'} onClick={onStart}>
            启动
          </Button>
          <Button type='primary' danger onClick={() => command(22)}  >
            急停
          </Button>
          <Button type='primary' danger onClick={cancel}>
            取消
          </Button>
          <Button onClick={() => history.back()}>返回</Button>
        </Space>
      }
      >
        <Row gutter={16}>
          <Col flex='450px'>
            <div
              style={{ height: '72vh', overflowY: 'auto' }}
            >
              {/*{*/}
              {/*  dataArr?.map((item, index) => <div style={{ width: '90%'}} key={index}>*/}
              {/*    <div>*/}
              {/*      {item.landName}*/}
              {/*      ({` 机器人${item.robotCode}`})*/}
              {/*    </div>*/}
              {/*    <Collapse size="small" defaultActiveKey={colKey} onChange={(key) => setColKey([...colKey, ...key])}>*/}
              {/*      {*/}
              {/*        item.subTasks.map((task: any, index: number) =>  <Panel*/}
              {/*          key={`${item.name}-${index}`}*/}
              {/*          header={<Radio checked={select === `${task.taskName}-${index}`} onChange={() => {*/}
              {/*            setText(`执行任务${task.taskName}，机器人${item?.robotCode}${taskType[task.taskType]}至${item.landName}`.replace(/(\d+)-(\d+)-(\d+)/g, '$1杠$2杠$3'))*/}
              {/*            setSubTaskId(task.subtaskId)*/}
              {/*            setSelect(`${task.taskName}-${index}`)*/}
              {/*            setColKey([...colKey, `${item.name}-${index}`])*/}
              {/*          }} >*/}
              {/*            {`${task.taskName}`}*/}
              {/*            {*/}
              {/*              task.error &&*/}
              {/*              <Tooltip*/}
              {/*                title={"错误码说明"}*/}
              {/*              >*/}
              {/*                {task.error}*/}
              {/*              </Tooltip>*/}
              {/*            }*/}
              {/*        </Radio>}>*/}
              {/*          <div style={{ marginLeft: 10 }}>*/}
              {/*            {task.commandTasks.map((item: any, index: number) =>  {*/}
              {/*              let status*/}
              {/*              if (item.execStatus === '已完成') {*/}
              {/*                status = 'success'*/}
              {/*              } else if (item.execStatus === '中断') {*/}
              {/*                status = 'error'*/}
              {/*              } else  {*/}
              {/*                status = 'default'*/}
              {/*              }*/}

              {/*              return <>*/}
              {/*                <Badge key={item.serial} status={status as any} text={item.execStatus} />*/}
              {/*                {*/}
              {/*                  index !== task.commandTasks.length - 1 && '->'*/}
              {/*                }*/}
              {/*              </>*/}
              {/*            })}*/}
              {/*          </div>*/}
              {/*        </Panel>)*/}
              {/*      }*/}
              {/*    </Collapse>*/}
              {/*  </div>)*/}
              {/*}*/}

              <Timeline
                style={{ padding: '24px 0', width: '380px', height: '72vh', overflowY: 'auto' }}
                items={timeLine}
              />
            </div>
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
                {/*<OperationButton label='连续执行' icon={p8} onClick={continues} />*/}
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
            </div>
          </Col>
        </Row>
    </Card>
  )
}