import { Button, Card, Col, Collapse, Radio, Row, Space, Tooltip } from 'antd';
import React, { useState } from 'react';
import { useParams, useSearchParams } from '@@/exports';
import Map from '@/pages/components/Map';
import { Panel } from 'rc-collapse';

const DemoData = [
  {
    id: 1,
    name: '地块1',
    robot: 1,
    taskList: [
      {
        name: '投放',
        error: 'E0',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      },
      {
        name: '回收',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: '地块2',
    robot: 2,
    taskList: [
      {
        name: '投放',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      },
      {
        name: '回收',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: '地块3',
    robot: 3,
    taskList: [
      {
        name: '投放',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      },
      {
        name: '回收',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      }
    ]
  },
  {
    id: 4,
    name: '地块4',
    robot: 4,
    taskList: [
      {
        name: '投放',
        error: 'E0',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      },
      {
        name: '回收',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      }
    ]
  },
  {
    id: 5,
    name: '地块5',
    robot: 5,
    taskList: [
      {
        name: '投放',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      },
      {
        name: '回收',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      }
    ]
  },
  {
    id: 6,
    name: '地块6',
    robot: 6,
    taskList: [
      {
        name: '投放',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      },
      {
        name: '回收',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      }
    ]
  },
  {
    id: 7,
    name: '地块7',
    robot: 7,
    taskList: [
      {
        name: '投放',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      },
      {
        name: '回收',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      }
    ]
  },
  {
    id: 8,
    name: '地块8',
    robot: 8,
    taskList: [
      {
        name: '投放',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      },
      {
        name: '回收',
        error: '',
        pathList: [
          {
            name: '起飞点'
          },
          {
            name: '投放点'
          }
        ]
      }
    ]
  },
]

export default function ExecuteWork() {
  let mapRef = React.createRef<{ execute?: (position: any[], air?: [number, number]) => void }>();
  const [complete, setComplete] = useState(false);
  const [dataArr, setDataArr] = useState<any[]>([]);
  const [colKey, setColKey] = useState<any[]>([]);
  const [select, setSelect] = useState<string>();
  const { id } = useParams();
  const [params] = useSearchParams();


  const speak = (text: string) => {
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

  const onStart = () => {
    speak(select)
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
          >
            自检
          </Button>
          <Button type={'primary'} onClick={onStart}>
            启动
          </Button>
          <Button type='primary' danger >
            中断
          </Button>
          <Button type='primary' danger >
            任务取消
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
                DemoData.map((item, index) => <div style={{ width: '90%'}} key={index}>
                  <div>
                    {item.name}
                    {` 机器人${item.robot}`}
                  </div>
                  <Collapse size="small" defaultActiveKey={colKey} onChange={(key) => setColKey([...colKey, ...key])}>
                    {
                      item.taskList.map((task, index) =>  <Panel
                        key={`${item.name}-${index}`}
                        header={<Radio checked={select === `${task.name}机器人${item?.robot}号`} onChange={() => setSelect(`${task.name}机器人${item?.robot}号`)} >
                          {`${task.name}`}
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
                          {task.pathList.map(item => item.name).join(' -> ')}
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