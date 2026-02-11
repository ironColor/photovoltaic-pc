import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Divider, message, Modal, Popconfirm, Row, Space, Table } from 'antd';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { history } from '@@/core/history';
import { del, getWorkList, page } from './service';
import { PlusOutlined } from '@ant-design/icons';
import TreeCard from '@/pages/components/Tree';
import { useSearchParams } from '@umijs/max';

const taskTypeMap = {
  0: '喷洒',
  2: '投放',
  3: '回收',
  4: '转移',
  5: '割草',
  6: '巡检'
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}


const WorkOrder: React.FC = () => {
  const formRef = useRef<any>();
  const [areaId, setAreaId] = useState<number>();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState();
  const [id, setID] = useState();

  const [searchParams] = useSearchParams();

  const urlId = searchParams.get('id');


  useEffect(() => {
    if (id) {
      getWorkList({id}).then((res: any) => {
        setData(res.data);
      })
    }
  }, [id]);

  const columns: ProColumns<Land.Item>[] = [
    {
      title: '工单名称',
      dataIndex: 'orderName',
      width: 100,
      ellipsis: true,
      search: {
        transform: (value) => {
          return { workOrderName: value };
        }
      }
    },
    {
      title: '工单类型',
      dataIndex: 'orderType',
      width: 100,
      ellipsis: true,
      search: false,
      valueEnum: {
        1: {
          text: '干洗'
        },
        2: {
          text: '水洗'
        }
      }
    },
    {
      title: '场地名称',
      dataIndex: 'areaName',
      width: 100,
      ellipsis: true,
      search: false
    },
    {
      title: '机组名称',
      dataIndex: 'uavConfigName',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record: any) => {
        return `${record.uavConfigName} (${record.uavCode})`
      }
    },
    {
      title: '预计作业时间',
      dataIndex: 'estimatedWorkTime',
      ellipsis: true,
      search: false,
      render: (_: any, record: any) => {
        return formatTime(record.estimatedWorkTime)
  }
    },
    {
      title: '起飞点',
      dataIndex: 'takeoffPointName',
      ellipsis: true,
      search: false
    },
    {
      title: "挂载点",
      dataIndex: 'mountPointName',
      ellipsis: true,
      search: false
    },
    {
      title: '卸载点',
      dataIndex: 'uploadPointName',
      ellipsis: true,
      search: false
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 170,
      search: false
    },
    {
      title: '操作',
      width: 210,
      search: false,
      render: (text: any) => {
        return (
          <>
            <a
              onClick={() => {
                history.push({
                  pathname: `/task/workOrder/add`,
                  search: `?orderId=${encodeURIComponent(text?.orderId)}`
                });
              }}
            >
              编辑
            </a>
            <Divider type='vertical' />
            <Popconfirm
              title='确认删除?'
              okText='确认'
              cancelText='取消'
              onConfirm={async () => {
                const { code, msg } = await del([text.orderId]);
                if (code === 0) {
                  message.success('删除成功');
                  formRef.current?.reload();
                } else {
                  message.error(msg || '删除失败');
                }
              }}
            >
              <span style={{ color: '#1677ff' }}>删除</span>
            </Popconfirm>
            <Divider type='vertical' />
            <a
              onClick={() => {
                setOpen(true);
                setID(text?.orderId);
              }}
            >
              任务列表
            </a>
          </>
        );
      }
    }
  ];

  const columnsModal = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      width: 200,
      ellipsis: true,
      search: false
    },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      ellipsis: true,
      search: false,
      render: (_: any, entity: any) => {
        //@ts-ignore
        return taskTypeMap[entity.taskType];
      }
    },
    {
      title: '机器人编码',
      dataIndex: 'robotCode',
      width: 150,
      ellipsis: true,
      search: false
    },
    {
      title: '地块名称',
      dataIndex: 'landName',
      width: 200,
      ellipsis: true,
      search: false
    },
    {
      title: "上一地块",
      dataIndex: 'oldLandName',
      ellipsis: true,
      search: false
    },
    {
      title: '等待时间',
      dataIndex: 'waitingTime',
      width: 200,
      ellipsis: true,
      search: false,
      render: (text: number) => {
        return formatTime(text)
      }
    },
    {
      title: "生成时间",
      dataIndex: 'generateTime',
      ellipsis: true,
      search: false
    }
  ];

  const onSelect = (node: any) => {
    history.push({
      pathname: `/task/workOrder/list?id=${ +node?.key}`
    });
    setAreaId(+node?.key);
  };

  return (
    <Row gutter={16}>
      <Col flex='350px'>
        <TreeCard onSelected={onSelect} selectedKeys={[+urlId]} />
      </Col>
      <Col flex='auto'>
        <ProTable<Land.Item>
          columns={columns}
          actionRef={formRef}
          params={{ areaId: areaId || urlId }}
          style={{ position: 'absolute' }}
          headerTitle={<b>工单管理</b>}
          cardBordered={true}
          rowKey='orderId'
          search={{
            labelWidth: 'auto'
          }}
          pagination={{
            showSizeChanger: false,
            showQuickJumper: true,
            defaultPageSize: 10
          }}
          request={async params => {
            const {
              data: { records, total },
              code
            } = await page(params);

            return { data: records, success: !code, total: total };
          }}
          dateFormatter='string'
          toolBarRender={() => [
            <Button
              key='button'
              icon={<PlusOutlined />}
              onClick={() => history.push(`/task/workOrder/add`)}
              type='primary'
            >
              新增
            </Button>
          ]}
          rowSelection={{
            selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT]
          }}
          tableAlertRender={({ selectedRowKeys, onCleanSelected }) => {
            return (
              <Space size={24}>
              <span>
                已选 {selectedRowKeys.length} 项
                <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
                  取消选择
                </a>
              </span>
              </Space>
            );
          }}
          tableAlertOptionRender={({ selectedRows }) => {
            return (
              <Space size={16}>
                <Popconfirm
                  title='确认删除?'
                  okText='确认'
                  cancelText='取消'
                  onConfirm={async () => {
                    const { code, msg } = await del(
                      selectedRows.map((item: any) => item.orderId)
                    );
                    if (code === 0) {
                      message.success('删除成功');
                      formRef.current?.reload();
                    } else {
                      message.error(msg || '删除失败');
                    }
                  }}
                >
                  <span style={{ color: '#1677ff' }}>批量删除</span>
                </Popconfirm>
              </Space>
            );
          }}
        />

        <Modal
          title={'任务列表'}
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
          width={'90%'}
          destroyOnHidden
        >
          <Table
            key={'id'}
            columns={columnsModal}
            dataSource={data}
            pagination={false}
          />
        </Modal>

      </Col>
    </Row>
  )
}

export default WorkOrder;