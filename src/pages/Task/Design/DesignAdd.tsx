import {
  DragSortTable,
  ProColumns,
  ProForm,
  ProFormSelect,
  ProFormText
} from '@ant-design/pro-components';
import '@amap/amap-jsapi-loader';
import { Card, Space, message, Button, Modal, Switch, InputNumber } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { PlusOutlined } from '@ant-design/icons';
import { add, detail, update, areaList, getParams } from '@/pages/Task/Design/service';
import type { ProFormInstance } from '@ant-design/pro-components';
import SubtaskTable from '@/pages/Task/Subtask/SubtaskTable';
import { useSearchParams } from '@umijs/max';
import AMapLoader from '@amap/amap-jsapi-loader';
import { taskType } from '@/pages/components/Common';

const DesignAdd: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const formRef = useRef<ProFormInstance>();
  const [searchParams] = useSearchParams();
  const efficiency = useRef(0);
  const [land, setLand] = useState<{
    areaId: number | null | undefined;
    areaName: string | null | undefined;
  }>();
  const AMap = useRef(
    AMapLoader.load({
      key: 'e486dd7ef2fbc6329ec2c04f1287787e',
      version: '2.0'
    })
  );

  useEffect(() => {
    // 获取机器人清扫效率的参数
    getParams({ parameterCode: 'efficiency' }).then(res => {
      if (res.code !== 0 || !res.data) {
        message.error(res.msg || '获取”清扫效率”参数失败');
        return;
      }
      efficiency.current = Number(res.data.parameterValue);
    });

    const id = searchParams.get('id');
    if (!id) {
      return;
    }
    detail(+id).then(res => {
      const { code, msg, data } = res;
      if (code !== 0) {
        message.error(msg || '数据获取失败');
        return;
      }

      formRef.current?.setFieldsValue({
        parentTaskName: data.parentTaskName,
        areaId: data.areaId,
        parentTaskType: data.parentTaskType
      });
      setData(data.parentChildTaskRelations);
      setLand({ areaId: data.areaId, areaName: data.areaName });
    });
  }, []);

  const onChange = (type: boolean, value: any, sort: any) => {
    type && (data[sort].waitingTime = value);
    !type && (data[sort].execution = value ? 0 : 1);
  };

  const columns: ProColumns[] = [
    {
      title: '排序',
      dataIndex: 'sort',
      width: 60
    },
    {
      title: '子任务名称',
      dataIndex: 'childTaskName'
    },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      renderText: (text: number) => taskType[+text] || '-'
    },
    {
      title: '地块名称',
      dataIndex: 'landName'
    },
    {
      title: '等待时间',
      dataIndex: 'waitingTime',
      fieldProps: { editable: false },
      render: (_, entity) => (
        <InputNumber
          defaultValue={entity.waitingTime}
          onChange={value => onChange(true, value, entity.sort)}
          addonAfter={'秒'}
          min={0}
          disabled={entity.taskType === 3 || entity.taskType === 0}
        />
      )
    },
    {
      title: '状态',
      dataIndex: 'execution',
      render: (_, entity) => (
        <Switch
          defaultChecked={+entity.execution === 0}
          onChange={checked => onChange(false, checked, entity.sort)}
        />
      )
    },
    {
      title: '操作',
      render: (_, record) => (
        <a
          key='delete'
          onClick={() => {
            // 删除（过滤），并重新排序
            setData(
              data
                .filter(item => item.sort !== record.sort)
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

  const setDataSource = async (d: any[]) => {
    const aMap = await AMap.current;
    const newData = d.map((item, index) => {
      const area = Number(
        aMap.GeometryUtil.ringArea(item.landPoints?.map((i: any) => [i.lon, i.lat])).toFixed(2)
      );
      return {
        childTaskId: item.taskId,
        // Key字段，避免新增时出现重复key
        sort: index + data.length,
        taskType: item.taskType,
        landName: item.landName,
        // 回收类型没有等待时间
        waitingTime:
            (item.taskType === 3 || item.taskType === 0)
            ? 0
            : efficiency.current
            ? Number(((area / efficiency.current) * 60).toFixed(2))
            : 0,
        execution: 0,
        childTaskName: item.taskName
      };
    });
    console.log(data, newData);
    setData([...data, ...newData]);
  };

  const handleDragSortEnd = (_: number, __: number, newDataSource: any) => {
    setData(
      newDataSource.map((item: any, index: number) => {
        return {
          childTaskId: item.childTaskId,
          sort: index,
          taskType: item.taskType,
          landName: item.landName,
          waitingTime: item.waitingTime,
          execution: item.execution,
          childTaskName: item.childTaskName
        };
      })
    );
    message.success('修改列表排序成功');
  };

  return (
    <Card
      bordered={false}
      title='新增任务'
      style={{
        minHeight: 'calc(100vh - 88px)',
        borderRadius: '3px',
        boxShadow: '0 2px 10px 0 rgba(96 139 153,0.2)',
        padding: '0 24px'
      }}
      extra={
        <Space>
          <Button onClick={() => history.back()}>返回</Button>
          <Button
            type={'primary'}
            onClick={async () => {
              await formRef.current?.validateFields();

              if (data.length === 0) {
                message.warning('请添加子任务');
                return;
              }
              const id = searchParams.get('id');
              let result: API.R<any>;

              if (id) {
                result = await update({
                  ...formRef?.current?.getFieldsFormatValue?.(),
                  parentChildTaskRelations: data,
                  parentTaskId: id
                });
              } else {
                result = await add({
                  ...formRef?.current?.getFieldsFormatValue?.(),
                  parentChildTaskRelations: data
                });
              }

              if (result.code === 0) {
                history.back();
                message.success('提交成功');
              } else {
                message.error(result.msg || '提交失败');
              }
            }}
          >
            提交
          </Button>
        </Space>
      }
      className={useEmotionCss(() => {
        return {
          '.ant-card-body': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }
        };
      })}
    >
      <ProForm
        formRef={formRef}
        layout={'inline'}
        submitter={false}
        style={{ width: '90%', display: 'flex', justifyContent: 'space-between' }}
      >
        <ProFormText
          width={'md'}
          name='parentTaskName'
          label='任务名称'
          rules={[{ required: true, message: '请输入主任务名称' }]}
        />
        <ProFormSelect
          width={'md'}
          name='areaId'
          label='场地名称'
          showSearch
          onChange={(_, option) => {
            setLand({ areaName: option?.label, areaId: option?.value });
          }}
          request={async () => {
            const { code, msg, data } = await areaList();
            if (code === 0) {
              return data?.map((v: any) => ({
                label: v.areaName,
                value: v.areaId
              }));
            } else {
              message.error(msg || '场地获取失败');
              return [];
            }
          }}
          rules={[{ required: true, message: '请选择所属场地' }]}
        />
        <ProFormSelect
          width={'md'}
          name={'parentTaskType'}
          label='任务类型'
          valueEnum={{
            清洗任务: '清洗任务',
            巡检任务: '巡检任务',
            割草任务: '割草任务'
          }}
          rules={[{ required: true, message: '请选择任务类型' }]}
        />
      </ProForm>
      <DragSortTable
        toolBarRender={false}
        search={false}
        columns={columns}
        rowKey='sort'
        pagination={false}
        dataSource={data}
        dragSortKey='sort'
        onDragSortEnd={handleDragSortEnd}
        style={{ width: '90%' }}
        tableStyle={{ marginTop: '26px' }}
      />
      <Button
        style={{ width: '90%', marginTop: '12px' }}
        type='dashed'
        icon={<PlusOutlined />}
        onClick={() => setOpen(true)}
      >
        添加子任务
      </Button>
      <Modal
        title={'选择子任务'}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={'90%'}
        destroyOnClose
      >
        <SubtaskTable
          flag={true}
          setDataSource={setDataSource}
          setOpenParent={setOpen}
          area={{ areaId: land?.areaId, areaName: land?.areaName }}
        />
      </Modal>
    </Card>
  );
};
export default DesignAdd;
