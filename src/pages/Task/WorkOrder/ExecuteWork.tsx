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
  Space,
  Tooltip
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from '@@/exports';
import Map from '@/pages/components/Map';
import { Panel } from 'rc-collapse';
import { commandApi, workOrderExcute, workOrderImmediate } from '@/pages/Task/WorkOrder/service';
import { useWebSocket } from 'ahooks';
import { config } from '../../../../public/scripts/config';
import { getCurrentUser } from '@/utils/authority';
import { execute } from '@/pages/Task/Monitor/service';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { taskType } from '@/pages/components/Common';

export default function ExecuteWork() {
  let mapRef = React.createRef<{ execute?: (position: any[], air?: [number, number]) => void }>();
  const [complete, setComplete] = useState(false);
  const [dataArr, setDataArr] = useState<any[]>([]);
  const [colKey, setColKey] = useState<any[]>([]);
  const [select, setSelect] = useState<string>();
  const [subTaskId, setSubTaskId] = useState<string>();
  const [searchParams] = useSearchParams();
  const [orderLogId, setOrderLogId] = useState();

  const call = useCallback(() => {
    if (orderLogId) {
      workOrderImmediate({ id: orderLogId }).then(res => {
        const { code, msg, data } = res;
        if (code !== 0) {
          message.error(msg || '获取失败');
          return;
        }
        const formatData = data?.landInfos?.map(item => {
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

  useEffect(() => {
    const orderId = searchParams.get('id');
    workOrderExcute({ orderId }).then(res => {
      const { code, msg, data } = res;
      if (code !== 0) {
        message.error(msg || '获取失败');
        return;
      }
      setDataArr(data.landInfos);

      (window as any).mapRef(data?.landInfos?.map(item => {
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
      execWS?.connect && execWS?.connect();
      console.log(11111);
      // 执行地图数据初始化
      mapRef.current?.execute?.(dataArr);
    }

    return () => {
      // 断开Websocket连接
      execWS?.disconnect && execWS?.disconnect();
      console.log('Websocket断开连接~');
    };
  }, [complete]);

  const onStart = async () => {
    if (subTaskId) {
      Modal.confirm({
        title: '确定要启动当前任务吗？',
        onOk() {
          command(21);
        }
      });
    } else {
      message.error('请选择子任务')
    }

  }

  return (
    <Card
      bordered={false}
      title='执行工单'
      extra={
        <Space>
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
              {
                dataArr?.map((item, index) => <div style={{ width: '90%'}} key={index}>
                  <div>
                    {item.landName}
                    ({` 机器人${item.robotCode}`})
                  </div>
                  <Collapse size="small" defaultActiveKey={colKey} onChange={(key) => setColKey([...colKey, ...key])}>
                    {
                      item.subTasks.map((task, index) =>  <Panel
                        key={`${item.name}-${index}`}
                        header={<Radio checked={select === `${task.taskName}-${index}`} onChange={() => {
                          speak(`执行任务${task.taskName}，机器人${item?.robotCode}${taskType[task.taskType]}至${item.landName}`.replace(/(\d+)-(\d+)-(\d+)/g, '$1杠$2杠$3'))
                          setSubTaskId(task.subtaskId)
                          setSelect(`${task.taskName}-${index}`)
                          setColKey([...colKey, `${item.name}-${index}`])
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
                        <div style={{ marginLeft: 10 }}>
                          {task.commandTasks.map((item: any, index: number) =>  {
                            let status
                            if (item.execStatus === '已完成') {
                              status = 'success'
                            } else if (item.execStatus === '中断') {
                              status = 'error'
                            } else  {
                              status = 'default'
                            }

                            return <>
                              <Badge key={item.serial} status={status} text={item.execStatus} />
                              {
                                index !== task.commandTasks.length - 1 && '->'
                              }
                            </>
                          })}
                        </div>
                      </Panel>)
                    }
                  </Collapse>
                </div>)
              }
            </div>
          </Col>
          <Col flex='auto'>
            <Map styles={{ height: 'calc(100vh - 190px)' }} complete={setComplete} ref={mapRef} />
          </Col>
        </Row>
    </Card>
  )
}