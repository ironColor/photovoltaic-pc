import { Badge, Button, Col, Form, Input, message, Modal, Row, Select, Space, Table, Tag } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Map from '@/pages/components/Map';
import { PlusOutlined } from '@ant-design/icons';
import { DragSortTable, ProTable } from '@ant-design/pro-components';
import { land } from '@/pages/Base/service';
import { landType } from '@/pages/components/Common';
import { useSearchParams } from '@@/exports';
import { detailMock } from '@/pages/Task/WorkOrder/service';

export default function AddWorkOrder( ) {
  const mapRef = useRef<any>();
  const [complete, setComplete] = useState(false);
  const [form] = Form.useForm();
  const [open, setOpen] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [searchParams] = useSearchParams();


  const handleColumns = useCallback((simple: boolean) => {
    if (simple) {
      return [
        {
          title: '排序',
          dataIndex: 'sort',
          width: 60
        },
        {
          title: '地块名称',
          dataIndex: 'landName',
          width: 200,
          ellipsis: true
        },
        // {
        //   title: '类型',
        //   dataIndex: 'landType',
        //   width: 90,
        //   renderText: (text: number) => <Tag color={'processing'}>{landType[+text]}</Tag>,
        //   valueEnum: landType
        // },
        {
          title: '操作',
          width: 50,
          render: (_: any, record: any) => (
            <a
              key='delete'
              onClick={() => {
                // 删除（过滤），并重新排序
                setData(
                  data
                    .filter(item => item.landId !== record.landId)
                    .map((item, index) => ({
                      ...item,
                      sort: index
                    }))
                );
              }}
            >
              删除
            </a>
          )
        }
      ];
    }
    return  [
      {
        title: '地块名称',
        dataIndex: 'landName',
        width: 200,
        ellipsis: true
      },
      {
        title: '类型',
        dataIndex: 'landType',
        width: 90,
        renderText: (text: number) => <Tag color={'processing'}>{landType[+text]}</Tag>,
        valueEnum: landType
      },
      {
        title: '边界点A',
        dataIndex: 'landPoints1',
        search: false,
        render: (_: any, record: any) => {
          const { landPoints } = record;
          return (
            landPoints?.length > 0 && (
              <>
                <Badge color='cyan' text={`经度：${landPoints[0]?.lon}`} />
                <br />
                <Badge color='purple' text={`纬度：${landPoints[0]?.lat}`} />
                <br />
                <Badge color='geekblue' text={`高度：${landPoints[0]?.alt}`} />
              </>
            )
          );
        }
      },
      {
        title: '边界点B',
        dataIndex: 'landPoints2',
        search: false,
        render: (_: any, record: any) => {
          const { landPoints } = record;
          return (
            landPoints?.length > 1 && (
              <>
                <Badge color='cyan' text={`经度：${landPoints[1]?.lon}`} />
                <br />
                <Badge color='purple' text={`纬度：${landPoints[1]?.lat}`} />
                <br />
                <Badge color='geekblue' text={`高度：${landPoints[1]?.alt}`} />
              </>
            )
          );
        }
      },
      {
        title: '边界点C',
        dataIndex: 'landPoints3',
        search: false,
        render: (_: any, record: any) => {
          const { landPoints } = record;
          return (
            landPoints?.length > 2 && (
              <>
                <Badge color='cyan' text={`经度：${landPoints[2]?.lon}`} />
                <br />
                <Badge color='purple' text={`纬度：${landPoints[2]?.lat}`} />
                <br />
                <Badge color='geekblue' text={`高度：${landPoints[2]?.alt}`} />
              </>
            )
          );
        }
      },
      {
        title: '边界点D',
        dataIndex: 'landPoints4',
        search: false,
        render: (_: any, record: any) => {
          const { landPoints } = record;
          return (
            landPoints?.length > 3 && (
              <>
                <Badge color='cyan' text={`经度：${landPoints[3]?.lon}`} />
                <br />
                <Badge color='purple' text={`纬度：${landPoints[3]?.lat}`} />
                <br />
                <Badge color='geekblue' text={`高度：${landPoints[3]?.alt}`} />
              </>
            )
          );
        }
      },
      {
        title: '高度',
        dataIndex: 'landHeight',
        width: 150,
        search: false,
        renderText: (text: string) => `${text}米`
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 150,
        search: false
      }
    ];
  }, [])

  const isSlopeTooLarge = (record: any) => {
    return record.landHeight > 33; // 根据你的业务逻辑调整
  };

  const addLand = (newItems: any[]) => {
    const existingIds = new Set(data.map(item => item.landId));
    const uniqueNewItems = newItems.filter(item => !existingIds.has(item.landId)).map((item ,index) => ({
      ...item,
      sort: index + data.length,
    }));
    setData(prev => [...prev, ...uniqueNewItems]);
  }

  const handleDragSortEnd = (_: number, __: number, newDataSource: any) => {
    setData(
      newDataSource.map((item: any, index: number) => {
        return {
          ...item,
          sort: index,
        };
      })
    );
    message.success('修改列表排序成功');
  };


  useEffect(() => {
    // Mock 工单修改
    const id = searchParams.get('id');
    if (!id) return;
    detailMock(+id).then(res => {
      const { code, msg, data } = res;
      if (code !== 0) {
        message.error(msg || '数据获取失败');
        return;
      }
      form.setFieldsValue({
        name: data.landName,
        type: '干洗'
      })
      // 地块单独处理
      setData([data])
    });
  }, []);

  useEffect(() => {
    mapRef.current.home(data)
    form.setFieldsValue({
      dataList: data
    })
  }, [data]);

  return (
    <Row gutter={32} style={{ background: '#fff'}}>
      <Col flex='750px'>
        <Map complete={setComplete} ref={mapRef} />
      </Col>
      <Col flex='auto'>
        <div style={{ padding: '24px'}}>
          <h1>新增工单</h1>
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            form={form}
          >
            <Form.Item label='工单名称' rules={[{ required: true, message: '请输入机组名称' }]} name="name">
              <Input />
            </Form.Item>
            <Form.Item label='工单类型' rules={[{ required: true, message: '请选择工单类型' }]} name="type">
              <Select
                options={[
                  {
                    label: '干洗',
                    value: '干洗'
                  },
                  {
                    label: '水洗',
                    value: '水洗'
                  }
                ]}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择工单类型"
              />
            </Form.Item>
            <Form.Item
              label="地块"
              name="dataList"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value || value.length === 0) {
                      return Promise.reject(new Error('请至少添加一个地块'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DragSortTable
                headerTitle={null}
                columns={handleColumns(true)}
                dataSource={data}
                toolBarRender={false}
                search={false}
                rowKey='sort'
                dragSortKey='sort'
                onDragSortEnd={handleDragSortEnd}
                style={{ width: '90%' }}
                pagination={false}
                scroll={{ y: 400 }}
              />
              <Button
                style={{ width: '90%', marginTop: '12px' }}
                type='dashed'
                icon={<PlusOutlined />}
                onClick={() => setOpen(true)}
              >
                添加地块
              </Button>
            </Form.Item>
            <Form.Item label="机组"  rules={[{ required: true, message: '请选择机组' }]} name="group">
              <Select
                options={[
                  {
                    label: '干洗',
                    value: '干洗'
                  },
                  {
                    label: '水洗',
                    value: '水洗'
                  }
                ]}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择工单类型"
              />
            </Form.Item>
            <Form.Item label="清洗时间">
              <Input disabled={true} />
            </Form.Item>
            <Form.Item label="起飞点">
              <Select
                options={[
                  {
                    label: '干洗',
                    value: '干洗'
                  },
                  {
                    label: '水洗',
                    value: '水洗'
                  }
                ]}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择工单类型"
              />
            </Form.Item>
            <Form.Item label="挂载点">
              <Select
                options={[
                  {
                    label: '干洗',
                    value: '干洗'
                  },
                  {
                    label: '水洗',
                    value: '水洗'
                  }
                ]}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择工单类型"
              />
            </Form.Item>
            <Form.Item label="卸载点">
              <Select
                options={[
                  {
                    label: '干洗',
                    value: '干洗'
                  },
                  {
                    label: '水洗',
                    value: '水洗'
                  }
                ]}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择工单类型"
              />
            </Form.Item>
            <Form.Item label={null}>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button htmlType="button" style={{ marginLeft: 8 }} onClick={() => form.resetFields()}>
                取消
              </Button>
            </Form.Item>
          </Form>

          <Modal
            title={'选择地块'}
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
            width={'90%'}
            destroyOnHidden
          >
            <ProTable<Land.Item>
              columns={handleColumns(false)}
              headerTitle={<b>地块列表</b>}
              params={{}}
              cardBordered={true}
              rowClassName={(record) =>
                isSlopeTooLarge(record) ? 'row-slope-too-large' : ''
              }
              request={async params => {
                const {
                  data: { records, total },
                  code
                } = await land(params);

                return { data: records, success: !code, total: total };
              }}
              rowKey='landId'
              search={{
                labelWidth: 'auto'
              }}
              pagination={{
                showSizeChanger: false,
                showQuickJumper: true,
                defaultPageSize: 10
              }}
              dateFormatter='string'
              rowSelection={{
                selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                getCheckboxProps: (record: Land.Item) => ({
                  disabled: isSlopeTooLarge(record),
                })
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
                    <a onClick={() => {
                      setOpen(false)
                      addLand(selectedRows)
                    }}>
                      添加
                    </a>
                  </Space>
                );
              }}
            />
          </Modal>
        </div>
      </Col>
    </Row>
  )
}