import {
  Button,
  Card,
  Col,
  message,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Select
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from '@@/exports';
import MapComponent from '@/pages/components/Map';
import { history } from '@umijs/max';
import {
  commandApi,
  getOptions,
  saveOptions,
  workOrderExcute,
  workOrderImmediate
} from '@/pages/Task/WorkOrder/service';
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
import reset from '/public/picture/reset.png';
import close from '/public/picture/close.png'
import Block from '@/pages/Task/Monitor/components/Block';
import Display from '@/pages/Task/Monitor/components/Display';
import style from './excute.less';


function mergeData(data) {
  const { landInfos = [], formLists = [] } = data;

  // 1. 按 landId 分组
  const formMap = new Map();

  formLists.forEach(item => {
    const { landId } = item;
    if (!formMap.has(landId)) {
      formMap.set(landId, []);
    }
    formMap.get(landId).push(item);
  });

  // 2. 挂载到 landInfos
  const result = landInfos.map(land => {
    return {
      ...land,
      subTasks: formMap.get(land.landId) || []
    };
  });

  return result;
}

function addUniqueId(data: any[]) {
  return data.map((item, index) => {
    if (item.subTasks && Array.isArray(item.subTasks)) {
      return {
        ...item,
        subTasks: item.subTasks.map((subTask: any, subIndex: number) => ({
          ...subTask,
          _id: subTask.subtaskLogId || `temp_${index}_${subIndex}_${Date.now()}`
        }))
      };
    }
    return {
      ...item,
      _id: item.subtaskLogId || `temp_${index}_${Date.now()}`
    };
  });
}

export default function ExecuteWork() {
  let mapRef = React.createRef<{ execute?: (position: any[], air?: [number, number]) => void }>();
  const [complete, setComplete] = useState(false);
  const [dataArr, setDataArr] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const [orderLogId, setOrderLogId] = useState();
  // 设备信息
  const [info, setInfo] = useState<any>({});
  const [voltage, setVlotage] = useState<number>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [landInfos, setLandInfos] = useState<any[]>();
  const [options, setOptions] = useState<any[]>([]);


  const optionsChange = (value: string, subTaskLogId: string) => {
    saveOptions({ errorCode: value, subTaskLogId }).then(res => {
      const { code, msg, data } = res;
      if (code !== 0) {
        message.error(msg || '获取失败');
        return;
      }
      call();
    })
  }


  const columns = [
    {
      title: '地块名称',
      dataIndex: 'landName',
      key: 'landName',
      align: 'center',
      width: 100
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      align: 'center',
      width: 120
    },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      key: 'taskType',
      render: (task: number) => taskType[task] || '-',
      align: 'center',
      width: 100
    },
    {
      title: '执行无人机',
      dataIndex: 'uavCode',
      key: 'uavCode',
      align: 'center',
      width: 100
    },
    {
      title: '执行机器人',
      dataIndex: 'robotCode',
      key: 'robotCode',
      align: 'center',
      width: 120,
      render: (robotCode: string, record: any) => {
        if (!robotCode) return '-';
        return (
          <div className={styles.code} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>机器人({robotCode}）</span>
            <div className={styles.closeIcon} onClick={() => stop(robotCode)} style={{ cursor: 'pointer', color: '#ff4d4f' }}>
              ×
            </div>
          </div>
        );
      },
    },
    {
      title: '机器人电量',
      dataIndex: 'robotCode',
      key: 'robotVoltage',
      align: 'center',
      width: 120,
      render: (_: string, record: any) => {
        if (!record.robotVoltage1 || !record.robotVoltage2) return '-';
        return (
          <span>
            🔋{level[record.robotVoltage1]}🔋{level[record.robotVoltage2]}
          </span>
        );
      },
    },
    {
      title: '执行步骤',
      dataIndex: 'commandTasks',
      key: 'commandTasks',
      align: 'center',
      width: 220,
      render: (commandTasks: any[]) => {
        if (!commandTasks || commandTasks.length === 0) return '-';
        return (
          <div style={{ display: 'flex', gap: '10',  justifyContent: 'center' }}>
            {commandTasks.map((cmd: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', paddingBottom: '16px', marginRight: '10px' }}>
                {/* 文字 */}
                <span style={{ fontSize: '12px', marginBottom: '4px' }}>
                  {cmd.execStatus === '执行中' && <LoadingOutlined style={{ marginRight: 4, fontSize: '12px' }} />}
                  {idx + 1} {dotType[cmd.type] || '未知'}
                </span>
                {/* 圆点 */}
                <div 
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '2px solid ' + execStatusFc(cmd.execStatus, cmd.cleanEndTime),
                    backgroundColor: '#fff',
                    flexShrink: 0,
                    zIndex: 2
                  }}
                />
                {/* 连接线（除了最后一个） */}
                {idx < commandTasks.length - 1 && (
                  <div 
                    style={{
                      position: 'absolute',
                      left: '110%',
                      top: '-1px',
                      transform: 'rotate(90deg)',
                      width: '2px',
                      height: 'calc(100% + 10px)',
                      backgroundColor: '#d9d9d9'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: '执行状态',
      dataIndex: 'execStatus',
      key: 'execStatus',
      align: 'center',
      width: 120,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          '待执行': 'default',
          '执行中': 'processing',
          '已完成': 'success',
          '失败': 'error',
          '中断': 'warning',
          '取消': 'default',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: '机器人状态',
      dataIndex: 'robotWorkStatus',
      key: 'robotWorkStatus',
      align: 'center',
      width: 120,
      render: robotWorkStatus => {
        return robotWorkStatus || '-'
      }
    },
    {
      title: '清扫倒计时',
      dataIndex: 'countDownTime',
      key: 'countDownTime',
      align: 'center',
      width: 200,
      render: (countDownTime) => {
        if (!countDownTime) return '-';

        if (countDownTime > Date.now()) {
          return <div>
            <Statistic.Countdown
              style={{ display: 'inline' }}
              valueStyle={{ display: 'inline', fontSize: 16 }}
              value={countDownTime || 0}
              onFinish={() => {
                // 倒计时结束状态改为"已完成"
                dataArr[
                  dataArr.findIndex((task: any) => task.execStatus === '执行中')
                  ].execStatus = '已完成';
                (window as any).mapRef(landInfos);
              }}
            />
          </div>
        }

      },
    },
    {
      title: '结果',
      dataIndex: 'errorCode',
      key: 'errorCode',
      align: 'center',
      render: (_, record) => {
        if (record.execStatus === '执行中' ||( record.execStatus === '已完成' && record.countDownTime)) {
          return (
            <Select
              style={{ width: '200px' }}
              options={options}
              onChange={value => optionsChange(value, record.subtaskLogId)}
              placeholder="请选择失效类型"
            >
            </Select>
          )
        }

        if (!record.errorCode) return '-';


        return record.errorCode !== '成功' ? `${record.errorCode}:${record.errorDetail}` : record.errorCode;
      }
    },
  ];

  const call = useCallback((updateMap = true) => {
    const orderId = searchParams.get('id');

    if (orderLogId) {
      workOrderImmediate({ id: orderLogId }).then(res => {
        const { code, msg, data } = res;
        if (code !== 0) {
          message.error(msg || '获取失败');
          return;
        }
        const dataWithId = addUniqueId(data.formLists);
        setDataArr(dataWithId);
        const land = mergeData(data);
        setLandInfos(land);
        
        const allSelectable = dataWithId.filter((record: any) => {
          const taskType = record.taskType;
          const execStatus = record.execStatus;
          const isExecutable = taskType === 2 && (execStatus === '待执行' || execStatus === '中断' || execStatus === '执行中');
          const isTransferRecycle = (taskType === 3 || taskType === 4) && (execStatus === '可执行' || execStatus === '中断' || execStatus === '执行中');
          return isExecutable || isTransferRecycle;
        });
        setSelectedRowKeys(allSelectable.map((item: any) => item._id));
        
        updateMap && (window as any).mapRef(land);
      })
    } else {
      workOrderExcute({ orderId }).then(res => {
        const { code, msg, data } = res;
        if (code !== 0) {
          message.error(msg || '获取失败');
          return;
        }

        const land = mergeData(data);
        setLandInfos(land);
        const dataWithId = addUniqueId(data.formLists);
        setDataArr(dataWithId);
        
        const allSelectable = dataWithId.filter((record: any) => {
          const taskType = record.taskType;
          const execStatus = record.execStatus;
          const isExecutable = taskType === 2 && (execStatus === '待执行' || execStatus === '中断' || execStatus === '执行中');
          const isTransferRecycle = (taskType === 3 || taskType === 4) && (execStatus === '可执行' || execStatus === '中断' || execStatus === '执行中');
          return isExecutable || isTransferRecycle;
        });
        setSelectedRowKeys(allSelectable.map((item: any) => item._id));
        
        updateMap && (window as any).mapRef(land);
      })
    }
  }, [orderLogId]);


  const username = getCurrentUser()?.username;
  /**
   * 任务websocket
   */
  const execWS = useWebSocket(username ? `${config.ws}/pc/${username}` : null, {
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
        // 接口调整后 用landInfos而不是dataArr
        // 飞机实时位置
        (window as any).mapRef(landInfos, [data.lon, data.lat]);
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
        // setRobotVoltages(prev => ({
        //   ...prev,
        //   [data.robotCode]: [data.voltage1, data.voltage2] // 更新或新增机器人电压
        // }));
        call(false);
      } else if (data.commandCode === 127) {
        message.error('机器人工作结束失败');
      } else if (data.commandCode === 0) {
        message.success('执行成功');
      } else if (data.commandCode === 1) {
        message.error('执行失败');
      } else if (data.commandCode === 23) {
        message.success('下一喷洒任务已启动');
      } else if (data.commandCode === 132) {
        // setVlotage(data.voltage);
        //刷新页面
        call()
      } else if (data.commandCode === 133) {
        const value = +data.voltage - 9 > 0 ? +data.voltage - 9 : 0
        setVlotage(`${Math.floor(value / 3.8 * 100)} %`);
      } else if (data.commandCode === 135) {
        mapRef.current?.initRobot(data)
      } else if (data.commandCode === 10) {
        message.info(data.commandDesc);
      }
    },
    onError: event => {
      console.warn('通讯WebSocket连接错误：', event);
    }
  });

  const command = useCallback(async (c: number) => {
    const orderId = searchParams.get('id');

    if (selectedRowKeys.length === 0) {
      message.error('请选择执行工单');
      return null;
    }

    const subTaskIds = dataArr
      .filter((record: any) => selectedRowKeys.includes(record._id))
      .map((record: any) => record.subtaskId);

    const { code, msg } = await commandApi({ commandCode: c, workOrderId: Number(orderId), subTaskIds: subTaskIds.join(',') || '' });
    if (code !== 0) {
      message.error(msg || '执行失败');
      return null;
    }
    call();
    message.success('消息已发出');
  }, [mapRef.current, selectedRowKeys, dataArr]);


  const commandStop = useCallback(async (c: number) => {
    const orderId = searchParams.get('id');

    if (selectedRowKeys.length === 0) {
      message.error('请选择执行工单');
      return null;
    }

    if (selectedRowKeys.length > 1) {
      message.error('急停只允许选择一个工单');
      return null;
    }

    const item = dataArr
      .filter((record: any) => record._id === selectedRowKeys[0]);

    if (item[0].execStatus !== '执行中') {
      message.error('工单状态必须是执行中');
      return null;
    }

    const subTaskIds = dataArr
      .filter((record: any) => selectedRowKeys.includes(record._id))
      .map((record: any) => record.subtaskId);

    const { code, msg } = await commandApi({ commandCode: c, workOrderId: Number(orderId), subTaskId: subTaskIds[0] });
    if (code !== 0) {
      message.error(msg || '执行失败');
      return null;
    }
    call();
    message.success('消息已发出');
  }, [mapRef.current, selectedRowKeys, dataArr]);


  const commandCancel = useCallback(async (c: number) => {
    const orderId = searchParams.get('id');

    const subTaskIds = dataArr
      .filter((record: any) => selectedRowKeys.includes(record._id))
      .map((record: any) => record.subtaskId);
    const { code, msg } = await commandApi({ commandCode: c, workOrderId: Number(orderId), subTaskId: subTaskIds[0] });
    if (code !== 0) {
      message.error(msg || '执行失败');
      return null;
    }
    // call();
    workOrderExcute({ orderId }).then(res => {
      const { code, msg, data } = res;
      if (code !== 0) {
        message.error(msg || '获取失败');
        return;
      }

      const land = mergeData(data);
      setLandInfos(land);
      const dataWithId = addUniqueId(data.formLists);
      setDataArr(dataWithId);

      const allSelectable = dataWithId.filter((record: any) => {
        const taskType = record.taskType;
        const execStatus = record.execStatus;
        const isExecutable = taskType === 2 && (execStatus === '待执行' || execStatus === '中断' || execStatus === '执行中');
        const isTransferRecycle = (taskType === 3 || taskType === 4) && (execStatus === '可执行' || execStatus === '中断' || execStatus === '执行中');
        return isExecutable || isTransferRecycle;
      });
      setSelectedRowKeys(allSelectable.map((item: any) => item._id));

      (window as any).mapRef(land);
    })
    message.success('消息已发出');
  }, [mapRef.current, selectedRowKeys, dataArr]);



  const speak = (text: any) => {
    const utterance = new SpeechSynthesisUtterance(text.replace(/(\d+)-(\d+)-(\d+)/g, '$1杠$2杠$3'));
    utterance.lang = 'zh-CN';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
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
        commandCancel(24);
        // history.go(0);
      }
    });
  }, [commandCancel]);

  const execStatusFc = useCallback((status: string, cleanEndTime?: string) => {
    const statusColors: Record<string, string> = {
      待执行: 'gray',
      可执行: 'gray',
      执行中: '#1677ff',
      已完成: '#1677ff',
      失败: 'red',
      中断: 'red',
      取消: 'red'
    };

    if (cleanEndTime && status === '已完成') {
      return '#62c400'
    }

    // 默认返回一个颜色，防止未知状态
    return statusColors[status] || 'red';
  }, []);

  useEffect(() => {
    const orderId = searchParams.get('id');
    getOptions().then(res => {
      const { code, msg, data } = res;

      if (code !== 0) {
        message.error(msg || '获取失败');
        return;
      }
      const format = data.map(item => ({
        ...item,
        label: `${item.dictValue}:${item.dictLabel}`,
        value: item.dictValue,
      }));
      console.log('xxxx', format);
      setOptions(format);
    })
    workOrderExcute({ orderId }).then(res => {
      const { code, msg, data } = res;

      if (code !== 0) {
        message.error(msg || '获取失败');
        return;
      }
      const dataWithId = addUniqueId(data.formLists);
      setDataArr(dataWithId);
      const land = mergeData(data);
      setLandInfos(land);
      setOrderLogId(data.formLists[0].orderLogId);
      
      // 默认选择所有可勾选的工单
      const allSelectable = dataWithId.filter((record: any) => {
        const taskType = record.taskType;
        const execStatus = record.execStatus;
        const isExecutable = taskType === 2 && (execStatus === '待执行' || execStatus === '中断' || execStatus === '执行中');
        const isTransferRecycle = (taskType === 3 || taskType === 4) && (execStatus === '可执行' || execStatus === '中断' || execStatus === '执行中');
        return isExecutable || isTransferRecycle;
      });
      
      setSelectedRowKeys(allSelectable.map((item: any) => item._id));
      // (window as any).mapRef(data?.landInfos);
    })
  }, [searchParams]);

  // 页面初始化
  useEffect(() => {
    // todo 存在mapRef.current值被清空的问题，故使用window转存变量
    (window as any).mapRef = mapRef.current?.execute;
    (window as any).initRobot = mapRef.current?.initRobot;

    if (complete) {
      // 建立Websocket连接
      if (execWS?.connect) {
        execWS?.connect()
      }
      // execWS?.connect && execWS?.connect();
      // 执行地图数据初始化 地块展示时，状态要用landRenderingStatus
      mapRef.current?.execute?.(landInfos);
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
    if (selectedRowKeys.length === 0) {
      message.error('请选择子任务');
      return;
    }

    if (selectedRowKeys.length === 1) {
      const record = dataArr.find((record: any) => record._id === selectedRowKeys[0]);
      const text = `执行任务${record.taskName}，机器人${record.robotCode}${taskType[record.taskType]}至${record.landName}`
      speak(text);
      Modal.confirm({
        title: text,
        onOk() {
          command(21);
        }
      });
    } else if (selectedRowKeys.length > 1) {
      const selectedRecords = dataArr.filter((record: any) => selectedRowKeys.includes(record._id));
      const taskNames = selectedRecords.map((record: any) => record.taskName).join('、');
      const text = `确认执行以下任务：${taskNames}`;
      const record = dataArr.find((record: any) => record._id === selectedRowKeys[0]);
      const textSpek = `执行任务${record.taskName}，机器人${record.robotCode}${taskType[record.taskType]}至${record.landName}`
      speak(textSpek);
      Modal.confirm({
        title: text,
        content: (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {selectedRecords.map((record: any, idx: number) => (
              <div key={idx} style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {record.taskName}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  机器人：{record.robotCode} | {taskType[record.taskType]} | {record.landName}
                </div>
              </div>
            ))}
          </div>
        ),
        onOk() {
          command(21);
        }
      });
    }
  }

  /**
   * 结束机器人任务
   */
  const stop = async (c: string) => {
    const orderId = searchParams.get('id');

    const { code, msg } = await commandApi({ commandCode: 124, robotCode: c, workOrderId: Number(orderId) });
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
      className={style.head}
      title={"执行工单"}
      bordered={false}
      extra={
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginInlineStart: 0,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#fff',
          padding: '12px 0'
        }}>
          <Display count={info.rtkCount} status={info.rtkStatus} voltage={info.voltage} voltage133={voltage} />
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
            <Button type='primary' danger onClick={() => commandStop(22)}  >
              急停
            </Button>
            <Button type='primary' danger onClick={cancel}>
              取消
            </Button>
            <Button onClick={() => history.push({ pathname: '/task/workMonitor/list'})}>返回</Button>
          </Space>
        </div>
      }
    >
      <Row gutter={16} style={{ flexDirection: 'column' }}>
        <Col style={{ width: '100%' }}>
          {/*<div style={{ marginBottom: '16px' }}>*/}
          {/*  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>执行工单</h2>*/}
          {/*</div>*/}
          <Table
            columns={columns}
            dataSource={dataArr}
            rowKey="_id"
            tableLayout="auto"
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
              getCheckboxProps: (record: any) => {
                const taskType = record.taskType;
                const execStatus = record.execStatus;
                
                // 任务类型为投放（taskType为2）执行状态为待执行、中断
                const isExecutable = taskType === 2 && (execStatus === '待执行' || execStatus === '中断' || execStatus === '执行中');
                
                // 任务类型为转移、回收（taskType为3、4）执行状态为可执行、中断
                const isTransferRecycle = (taskType === 3 || taskType === 4) && (execStatus === '可执行' || execStatus === '中断' || execStatus === '执行中');
                return {
                  disabled: !isExecutable && !isTransferRecycle,
                };
              },
            }}
            pagination={false}
            scroll={{ y: 300 }}
            size="small"
            bordered
          />
        </Col>
        <Col style={{ width: '100%', marginTop: '16px' }}>
          <div>
            <Space className={styles.operation}>
              <OperationButton label='校准缓降器' icon={p3} onClick={() => command(27)} />
              <OperationButton label='收绳' icon={p1} onClick={() => command(28)} />
              <OperationButton label='放绳' icon={p2} onClick={() => command(29)} />
              <OperationButton label='弹出锁闩' icon={p5} onClick={() => command(42)} />
              <OperationButton label='缩回锁闩' icon={p4} onClick={() => command(41)} />
              <OperationButton label='投球算法校准' icon={p6} onClick={() => command(43)} />
              <OperationButton label='投球算法验证' icon={p7} onClick={() => command(44)} />
              <OperationButton label='关机' icon={close} onClick={() => command(46)} />
              <OperationButton label='重启' icon={reset} onClick={() => command(47)} />
              {/*<OperationButton label='连续执行' icon={p8} onClick={() => {}} />*/}
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
            <MapComponent styles={{ height: 'calc(100vh - 550px)', minHeight: '400px' }} complete={setComplete} ref={mapRef} />
          </div>
        </Col>
      </Row>
    </Card>
  )
}