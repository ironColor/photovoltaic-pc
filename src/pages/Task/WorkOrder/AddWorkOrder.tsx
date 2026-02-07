import { Badge, Button, Col, Form, Input, message, Modal, Row, Select, Space, Table, Tag } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Map from '@/pages/components/Map';
import moment from 'moment';
import { PlusOutlined } from '@ant-design/icons';
import { DragSortTable, ProTable } from '@ant-design/pro-components';
import { land } from '@/pages/Base/service';
import { landType } from '@/pages/components/Common';
import { useSearchParams } from '@@/exports';
import {
  detailInfo,
  getGroupList, getLandListAll, getParameter,
  getPointOptions,
  getTime,
  saveInfo,
  tree,
  updateInfo
} from '@/pages/Task/WorkOrder/service';

function isArray(value: any) {
  return Array.isArray(value);
}


function formatTime(minutes: number) {
  const totalSeconds = minutes * 60;

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function AddWorkOrder( ) {
  const mapRef = useRef<any>();
  const [, setComplete] = useState(false);
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
  const [, setRobotsId] = useState<any[]>([]);
  const [k, setK] = useState();
  const useWatch = Form.useWatch;
  const orderType = useWatch('orderType', form);
  const [landName, setLandName] = useState('');
  const [selectedRecordsMap, setSelectedRecordsMap] = useState<Record<string, Land.Item>>({});
  const [page, setPage] = useState(1);
  const [all, setAll] = useState<any[]>([]);
  // 用于储存当前选中的
  const [select, setSelect] = useState<any[]>([])

  const handleColumns = useCallback((simple: boolean) => {
    if (simple) {
      return [
        // {
        //   title: '排序',
        //   dataIndex: 'sort',
        //   width: 60
        // },
        {
          title: '组串名称',
          dataIndex: 'landName',
          width: 200,
          ellipsis: true
        },
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
                const newMap = {};
                  landData
                    .filter(item => item.landId !== record.landId).forEach(row => {
                    newMap[row.landId] = row;
                  });
                mapRef.current.resetLand(record.landId.toString())
                setSelectedRecordsMap(newMap)
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
        title: '组串名称',
        dataIndex: 'landName',
        search: false,
        width: 200,
        ellipsis: true
      },
      {
        title: '类型',
        dataIndex: 'landType',
        search: false,
        width: 90,
        renderText: (text: number) => <Tag color={'processing'}>{landType[+text]}</Tag>,
        valueEnum: landType
      },
      {
        title: '地块', // 搜索区域会显示这个标题
        dataIndex: 'plotId', // 请求参数的 key
        key: 'plotId',
        search: true,  // 启用搜索
        table: false,  // 不在表格中显示
      },
      {
        title: '矩阵', // 搜索区域会显示这个标题
        dataIndex: 'arrayId', // 请求参数的 key
        key: 'arrayId',
        search: true,  // 启用搜索
        table: false,  // 不在表格中显示
      },
      {
        title: '组串',
        dataIndex: 'strId',
        key: 'strId',
        search: true,
        table: false,
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
  }, [landData, mapRef])

  const isSlopeTooLarge = (record: any) => {
    return Math.abs(record.k) > Number(k);
  };

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

  const getAllLand = async (id) => {
    getLandListAll(id).then(res => {
      const { code, msg, data } = res;
      if (code !== 0) {
        message.error(msg || '获取全部地块数据失败');
        return;
      }
      setAll(data)
    })
  }

  useEffect(() => {
    if (all.length > 0 && k) {
      mapRef.current.initLand(all.map(item => ({
        ...item,
        isSlopeTooLarge: isSlopeTooLarge(item)
      })));
    }
  }, [all, k]);

  const handleLandClick = (land: any) => {
    console.log('用户点击了地块:', land.landName, land.landId);
    // 可以打开抽屉、设置表单、高亮列表等
  };


  const handleLandNameChange = useCallback((value: any, option: any) => {
    setLandId(option.areaId);
    setLandName(option.label);
    // 切换场地
    // 清空地块
    setLandData([])
    form.setFieldsValue({ estimatedWorkTime: undefined });

    getAllLand(option.areaId)
  }, [k]);


  const handleGroupChange = useCallback((value: any, option: any) => {
    setRobotOptions(option.robots.map((item: any) => ({
      ...item,
      label: item.robotCode,
      value: item.robotId
    })))
    // 选择机组后默认全部机器人
    form.setFieldsValue({ robotIds: option.robots.map(item => item.robotId) })
  }, []);

  const onFinish = async (value: any) => {
    const orderId = searchParams.get('orderId');

    if(orderId) {
      updateInfo({...value, landIds: value.landIds.map((item: any) => item.landId), orderId }).then(res => {
        const { code, msg } = res;
        if (code !== 0) {
          message.error(msg || '创建失败');
          return;
        } else {
          message.success('提交成功');
          form.resetFields();
          history.go(-1)
        }
      })
    } else {
      saveInfo({ ...value, robotIds: form.getFieldValue('robotIds'), landIds: value.landIds.map((item: any) => item.landId) }).then(res => {
        const { code, msg } = res;
        if (code !== 0) {
          message.error(msg || '创建失败');
          return;
        } else {
          message.success('提交成功');
          form.resetFields();
          history.go(-1)
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
        getAllLand(detailData.areaId)
        // // 同步选中
        const newMap = {};
        detailData.landList?.forEach(row => {
          newMap[row.landId] = row;
        });
        setSelectedRecordsMap(newMap);

      } catch (err) {
        console.error('数据加载异常:', err);
        message.error('数据加载出错，请稍后重试');
      }
    };

    fetchData();

    getParameter({
      current: 1,
      pageSize: 10,
      parameterCode: 'slope'
    }).then(res => {
      const { code, msg, data } = res;
      if (code !== 0) {
        message.error(msg || '获取斜率失败');
        return;
      } else {
        const { records } = data
        setK(records[0].parameterValue)
      }
    })


  }, []);
  // 高亮地图上的地块
  useEffect(() => {
    // 斜率只能通过接口获取
    if (landData.length > 0 && all.length > 0 && k) {
      requestAnimationFrame(() => {
        mapRef.current?.highlightLandsByIds(landData.map(item => item.landId?.toString()));
      })
    }
    form.setFieldsValue({
      landIds: landData
    })
    }, [landData, all, k]);
  // 选择地块之后，请求接口，获取对应下拉数据
  useEffect(() => {
      if (landId) {
        getPointOptions({ areaId: landId, type: 10}).then((res: any) => {
          if (isArray(res)) {
            const options = res.map((item: any) => ({
              label: item.pointName,
              value: item.pointId,
              ...item
            }))
            setStart(options)
          } else {
            message.error('下拉框数据获取失败');
          }
        })
        getPointOptions({ areaId: landId, type: 7}).then((res: any) => {
          if (isArray(res)) {
            const options = res.map((item: any) => ({
              label: item.pointName,
              value: item.pointId,
              ...item
            }))
            setPull(options)
          } else {
            message.error('下拉框数据获取失败');
          }
        })
        getPointOptions({ areaId: landId, type: 8}).then((res: any) => {
          if (isArray(res)) {
            const options = res.map((item: any) => ({
              label: item.pointName,
              value: item.pointId,
              ...item
            }))
            setUnPull(options)
          } else {
            message.error('下拉框数据获取失败');
          }
        })
        getGroupList({ name: '', uavCode: '' }).then((res: any) => {
          const { code, msg, data } = res;
          if (code !== 0) {
            message.error(msg || '机组数据获取失败');
            return;
          }
          const options = data.map((item: any) => ({
            label: item.name,
            value: item.id,
            ...item
          }))

          const robotList = options.filter((item: any) => item.id === form.getFieldValue('uavConfigId'))[0]?.robots.map((item: any) => ({
            ...item,
            label: item.robotCode,
            value: item.robotId
          }))
          setRobotOptions(robotList)
          setGroupOptions(options)
        })
      }
    }, [landId]);


  const isSpray = orderType === 2;

  useEffect(() => {
    if (isSpray) {
      form.setFieldsValue({
        robotIds: undefined,
        mountPointId: undefined,
        uploadPointId: undefined,
      });
    }
  }, [isSpray, form]);

  const robotIds = useWatch('robotIds', form);
  // 自动化 清洗时间
  useEffect(() => {
    const landIds = landData.map(item => item.landId);
    const hasLand = landIds.length > 0;
    const hasOrderType = orderType !== null;
    const hasRobot = isSpray || (robotIds && robotIds.length > 0);

    if (hasLand && hasOrderType && hasRobot) {
      getTime({ landIds, robotIds, orderType }).then(res => {
        if (res.code === 0) {
          form.setFieldsValue({ estimatedWorkTime: res.data });
        } else {
          form.setFieldsValue({ estimatedWorkTime: undefined });
        }
      });
    } else {
      form.setFieldsValue({ estimatedWorkTime: undefined });
    }
  }, [
    landData,
    robotIds,
    orderType,
    isSpray
  ]);

  // 自动化工单名称
  useEffect(() => {
    if (landName && orderType && landData.length > 0) {
      const today = moment().format('YYYY-MM-DD');
      form.setFieldsValue({ orderName: `${today}-${landName}-${orderType === 1 ? '干洗' : '水洗'}-${landData[0].landName}` });
    }

  }, [landName, orderType, landData]);

  useEffect(() => {
    setSelect(landData)
  }, [open])

  return (
    <Row gutter={32} style={{ background: '#fff'}}>
      <Col flex='650px'>
        <Map complete={setComplete} ref={mapRef} onLandClick={handleLandClick} />
      </Col>
      <Col flex='auto'>
        <div style={{ padding: '24px'}}>
          <h1>{!!searchParams.get('orderId') ? '修改工单' : '新增工单'}</h1>
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            form={form}
            onFinish={onFinish}
          >
            <Form.Item label='场地名称' rules={[{ required: true, message: '请选择场地名称' }]} name="areaId">
              <Select
                options={landOptions}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择场地名称"
                onChange={handleLandNameChange}
              />
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
            <Form.Item label='工单名称' rules={[{ required: true, message: '请输入工单名称' }]} name="orderName">
              <Input placeholder="请输入工单名称" />
            </Form.Item>

            <Form.Item
              label="组串"
              name="landIds"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value || value.length === 0) {
                      return Promise.reject(new Error('请至少添加一个组串'));
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
                onClick={() => {
                  // if (!landId) {
                  //   message.error('请先选择场地');
                  //   return;
                  // }
                  setOpen(true)
                }}
              >
                添加组串
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
            {
              !isSpray &&  <Form.Item label="机器人"  rules={[{ required: true, message: '请选择机器人' }]} name="robotIds">
                <Select
                  mode="multiple"
                  options={robotOptions}
                  showSearch={false} // 如果不需要搜索可关闭
                  placeholder="请选择机器人"
                />
              </Form.Item>
            }
            <Form.Item
              label="清洗时长"
              name="estimatedWorkTime"
              rules={[{ required: true, message: '请获取清洗时长' }]}
              getValueProps={(value) => ({
                value: value ? formatTime(value) : ''
              })}
            >
              <Input
                disabled
              />
            </Form.Item>
            <Form.Item label="起飞点" rules={[{ required: true, message: '请选起飞点' }]} name="takeoffPointId">
              <Select
                options={start}
                showSearch={false} // 如果不需要搜索可关闭
                placeholder="请选择起飞点"
              />
            </Form.Item>
            {
              !isSpray &&    <Form.Item label="挂载点" rules={[{ required: true, message: '请选挂载点' }]} name="mountPointId">
                <Select
                  options={pull}
                  showSearch={false} // 如果不需要搜索可关闭
                  placeholder="请选择挂载点"
                />
              </Form.Item>
            }

            {
              !isSpray && <Form.Item label="卸载点" rules={[{ required: true, message: '请选卸载点' }]} name="uploadPointId">
                <Select
                  options={unPull}
                  showSearch={false} // 如果不需要搜索可关闭
                  placeholder="请选择卸载点"
                />
              </Form.Item>
            }
            <Form.Item label={null}>
              <Button type="primary" htmlType="submit"  style={{ marginLeft: 8 }}>
                确定
              </Button>
              <Button htmlType="button" style={{ marginLeft: 8 }} onClick={() => history.go(-1)}>
                取消
              </Button>
            </Form.Item>
          </Form>

          <Modal
            title={'选择组串'}
            open={open}
            onCancel={() => {
              setOpen(false);
            }}
            footer={null}
            width={'90%'}
            destroyOnHidden
          >
            <ProTable<Land.Item>
              columns={handleColumns(false)}
              headerTitle={<b>组串列表</b>}
              params={{}}
              cardBordered={true}
              rowClassName={(record) =>
                isSlopeTooLarge(record) ? 'row-slope-too-large' : ''
              }
              request={async params => {
                if (params.current !== page) {
                  setPage(params.current)
                }

                const {
                  data: { records, total },
                  code
                } = await land({...params, areaId: landId });
                return { data: records, success: !code, total: total };
              }}
              rowKey='landId'
              pagination={{
                showSizeChanger: false,
                showQuickJumper: true,
                defaultPageSize: 10
              }}
              dateFormatter='string'
              rowSelection={{
                selectedRowKeys: select.map(item => item.landId),
                onChange: (keys, rows) => {
                  const newMap = { ...selectedRecordsMap };

                  // 只做一件事：补充当前页选中的 row
                  rows.forEach(row => {
                    row.page = page
                    newMap[row.landId] = row;
                  });
                  setSelectedRecordsMap(newMap);
                  // 同步 landData（按 selectedRowKeys 顺序）
                  const newData = Object.values(newMap)
                    .map((item, i) => {
                      if (item.page !== page) {
                        return { ...item, sort: i  }
                      } else {
                        // 是当前页的 则要通过keys来判断
                        if (keys.includes(item.landId)) {
                          return { ...item, sort: i  }
                        }
                      }
                    }).filter(item => item !== undefined);
                  setSelect(newData);
                  // setLandData(newData);
                },
                selections: [Table.SELECTION_INVERT], // 移除全选，避免误导
                getCheckboxProps: (record) => ({
                  disabled: isSlopeTooLarge(record)
                })
              }}
              tableAlertRender={({ selectedRowKeys, onCleanSelected }) => {
                return (
                  <Space size={24}>
                <span>
                  已选 {selectedRowKeys.length} 项

                  <Button type="primary" style={{ marginInlineStart: 8 }} onClick={() => {
                    setLandData(select);
                    setOpen(false);
                  }}>
                    确认
                  </Button>
                  <Button style={{ marginInlineStart: 8 }} onClick={() => {
                    // setLandData([])
                    setSelect([])
                    onCleanSelected()
                  }}>
                    取消选择
                  </Button>
                </span>
                  </Space>
                );
              }}
              tableAlertOptionRender={false}
            />
          </Modal>
        </div>
      </Col>
    </Row>
  )
}