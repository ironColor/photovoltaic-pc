import { Badge, Button, Col, Form, Input, message, Modal, Row, Select, Space, Table, Tag } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Map from '@/pages/components/Map';
import { PlusOutlined } from '@ant-design/icons';
import { DragSortTable, ProTable } from '@ant-design/pro-components';
import { land } from '@/pages/Base/service';
import { landType } from '@/pages/components/Common';
import { useSearchParams } from '@@/exports';
import {
  detailInfo,
  getGroupList,
  getPointOptions,
  getTime,
  saveInfo,
  tree, updateInfo
} from '@/pages/Task/WorkOrder/service';

function isArray(value) {
  return Array.isArray(value);
}

export default function AddWorkOrder( ) {
  const mapRef = useRef<any>();
  const [complete, setComplete] = useState(false);
  const [form] = Form.useForm();
  const [open, setOpen] = useState<boolean>(false);
  // landData 选中的地块数据
  const [landData, setLandData] = useState<any[]>([]);
  const [landOptions, setLandOptions] = useState<any[]>([])
  const [searchParams] = useSearchParams();
  const [landId, setLandId] = useState<string>();
  const [start, setStart] = useState<any[]>([]);
  const [pull, setPull] = useState<any[]>([]);
  const [unPull, setUnPull] = useState<any[]>([]);
  const [groupOptions, setGroupOptions] = useState<any[]>([]);
  const [robotOptions, setRobotOptions] = useState<any[]>([]);
  const [robotsId, setRobotsId] = useState<any[]>([]);
  const [updateLandsId, setUpdateLandsId] = useState<any[]>([]);

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
                setLandData(
                  landData
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
    return Math.abs(record.k) > 20;
  };

  const addLand = (newItems: any[]) => {
    const existingIds = new Set(landData.map(item => item.landId));
    const uniqueNewItems = newItems.filter(item => !existingIds.has(item.landId)).map((item ,index) => ({
      ...item,
      sort: index + landData.length,
    }));
    const isUpdate = !!searchParams.get('orderId')

      if (isUpdate) {
          setUpdateLandsId([...updateLandsId, ...uniqueNewItems.map(item => item.landId)])
      } else {
          setLandData(prev => [...prev, ...uniqueNewItems]);
      }

  }

  const handleDragSortEnd = (_: number, __: number, newDataSource: any) => {
    setLandData(
      newDataSource.map((item: any, index: number) => {
        return {
          ...item,
          sort: index,
        };
      })
    );
    message.success('修改列表排序成功');
  };

  const handleLandNameChange = useCallback((value, option) => {
    setLandId(option.areaId)
  }, []);

  const handleGroupChange = useCallback((value, option) => {
    setRobotOptions(option.robots.map(item => ({
      ...item,
      label: item.robotCode,
      value: item.robotId
    })))

  }, []);

  const getTimeClick = () => {
    getTime({ landIds: landData.map(item => item.landId), robotIds: form.getFieldValue('robotIds'), }).then(res => {
      const { code, msg, data } = res;
      if (code !== 0) {
        message.error(msg || '获取失败');
        return;
      } else {
        message.success('获取成功');
        form.setFieldsValue({
          estimatedWorkTime: data
        })
        return;
      }
    });
  }


  const onFinish = async (value: any) => {
    const orderId = searchParams.get('orderId');

    if(orderId) {
      updateInfo({...value, robotIds: robotsId, landIds: updateLandsId, orderId }).then(res => {
        const { code, msg, data } = res;
        if (code !== 0) {
          message.error(msg || '创建失败');
          return;
        } else {
          message.success('提交成功');
          form.resetFields();
        }
      })
    } else {
      saveInfo({ ...value, robotIds: form.getFieldValue('robotIds'), landIds: value.landIds.map(item => item.landId) }).then(res => {
        const { code, msg, data } = res;
        if (code !== 0) {
          message.error(msg || '创建失败');
          return;
        } else {
          message.success('提交成功');
          form.resetFields();
        }
      });
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 第一步：获取场地树（tree）
        const treeRes = await tree();
        const { code, msg, data } = treeRes;

        if (code !== 0) {
          message.error(msg || '地块数据获取失败');
          return;
        }

        const options = data.map((item: any) => ({
          label: item.areaName,
          value: item.areaId,
          ...item,
        }));
        setLandOptions(options);

        // 第二步：如果有 orderId，再获取工单详情
        const orderId = searchParams.get('orderId');
        if (!orderId) return;

        const detailRes = await detailInfo(+orderId);
        const { code: detailCode, msg: detailMsg, data: detailData } = detailRes;

        if (detailCode !== 0) {
          message.error(detailMsg || '工单详情获取失败');
          return;
        }

        // 回填表单字段（确保 name 与 Form.Item 一致）
        form.setFieldsValue({
          areaId: detailData.areaId,
          orderName: detailData.orderName,
          orderType: detailData.orderType,
          landIds: detailData.landIds || [],
          takeoffPointId: detailData.takeoffPointId,
          mountPointId: detailData.mountPointId,
          uploadPointId: detailData.uploadPointId,
          uavConfigId: detailData.uavConfigId,
          estimatedWorkTime: detailData.estimatedWorkTime,
          robotIds: detailData.robotIds
        });
        // 设置areaID 用于添加地块时，接口获取对应场地下的地块信息
        setLandId(detailData.areaId);

        setRobotsId(detailData.robotIds);
        setLandData(detailData.landList);

      } catch (err) {
        console.error('数据加载异常:', err);
        message.error('数据加载出错，请稍后重试');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
      mapRef.current.home(landData)
      form.setFieldsValue({
        landIds: landData
      })
    }, [landData]);

  useEffect(() => {
      if (landId) {
        getPointOptions({ areaId: landId, type: 10}).then(res => {
          if (isArray(res)) {
            const options = res.map(item => ({
              label: item.pointName,
              value: item.pointId,
              ...item
            }))
            setStart(options)
          } else {
            message.error('下拉框数据获取失败');
          }
        })
        getPointOptions({ areaId: landId, type: 7}).then(res => {
          if (isArray(res)) {
            const options = res.map(item => ({
              label: item.pointName,
              value: item.pointId,
              ...item
            }))
            setPull(options)
          } else {
            message.error('下拉框数据获取失败');
          }
        })
        getPointOptions({ areaId: landId, type: 8}).then(res => {
          if (isArray(res)) {
            const options = res.map(item => ({
              label: item.pointName,
              value: item.pointId,
              ...item
            }))
            setUnPull(options)
          } else {
            message.error('下拉框数据获取失败');
          }
        })
        getGroupList({ name: '', uavCode: '' }).then(res => {
          const { code, msg, data } = res;
          if (code !== 0) {
            message.error(msg || '机组数据获取失败');
            return;
          }
          const options = data.map(item => ({
            label: item.name,
            value: item.id,
            ...item
          }))

          const robotList = options.filter(item => item.id === form.getFieldValue('uavConfigId'))[0]?.robots.map(item => ({
            ...item,
            label: item.robotCode,
            value: item.robotId
          }))
          setRobotOptions(robotList)
          setGroupOptions(options)
        })
      }
    }, [landId]);

  const isUpdate = !!searchParams.get('orderId')

  return (
    <Row gutter={32} style={{ background: '#fff'}}>
      <Col flex='650px'>
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
            onFinish={onFinish}
            // onValuesChange={(changedValues, allValues) => {
            //   const { orderType, landIds, uavConfigId } = allValues;
            //
            //   // 判断三个字段是否都有值
            //   if (
            //     orderType !== undefined &&
            //     orderType !== null &&
            //     landIds &&
            //     landIds.length > 0 &&
            //     uavConfigId !== undefined &&
            //     uavConfigId !== null
            //   ) {
            //     // 触发你的计算逻辑
            //     handleCalculate(orderType, landIds, uavConfigId);
            //   }
            // }}
          >
            <Form.Item label='场地名称' rules={[{ required: true, message: '请选择场地名称' }]} name="areaId">
              <Select
                options={landOptions}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择场地名称"
                onChange={handleLandNameChange}
              />
            </Form.Item>
            <Form.Item label='工单名称' rules={[{ required: true, message: '请输入机组名称' }]} name="orderName">
              <Input />
            </Form.Item>
            <Form.Item label='工单类型' rules={[{ required: true, message: '请选择工单类型' }]} name="orderType">
              <Select
                options={[
                  {
                    label: '干洗',
                    value: 1
                  },
                  {
                    label: '水洗',
                    value: 2
                  }
                ]}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择工单类型"
              />
            </Form.Item>
            <Form.Item
              label="地块"
              name="landIds"
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
                dataSource={landData}
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
            <Form.Item label="机组"  rules={[{ required: true, message: '请选择机组' }]} name="uavConfigId">
              <Select
                options={groupOptions}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择机组类型"
                onChange={handleGroupChange}
              />
            </Form.Item>
            <Form.Item label="机器人"  rules={[{ required: true, message: '请选择机器人' }]} name="robotIds">
              <Select
                mode="multiple"
                options={robotOptions}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择机器人"
                // onChange={handleGroupChange}
              />
            </Form.Item>
            <Form.Item label="清洗时间" name="estimatedWorkTime">
              <Input disabled={true} />
            </Form.Item>
            <Form.Item label="起飞点" rules={[{ required: true, message: '请选起飞点' }]} name="takeoffPointId">
              <Select
                options={start}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择工单类型"
              />
            </Form.Item>
            <Form.Item label="挂载点" rules={[{ required: true, message: '请选挂载点' }]} name="mountPointId">
              <Select
                options={pull}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择工单类型"
              />
            </Form.Item>
            <Form.Item label="卸载点" rules={[{ required: true, message: '请选卸载点' }]} name="uploadPointId">
              <Select
                options={unPull}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择工单类型"
              />
            </Form.Item>
            <Form.Item label={null}>
              <Button type="primary"  onClick={getTimeClick}>获取清洗时间</Button>
              <Button type="primary" htmlType="submit"  style={{ marginLeft: 8 }}>
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
                } = await land({...params, areaId: landId });

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