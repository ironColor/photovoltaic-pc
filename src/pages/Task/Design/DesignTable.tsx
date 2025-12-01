import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { del, page } from './service';
import { Button, Divider, message, Popconfirm, Space, Table, Tag } from 'antd';
import { history } from '@umijs/max';
import React, {useImperativeHandle, useRef, useState} from 'react';
import { PlusOutlined } from '@ant-design/icons';

const DesignTable: React.ForwardRefRenderFunction<{
    setAreaId: React.Dispatch<React.SetStateAction<number | undefined>>;
}> = (_, ref) => {
  const formRef = useRef<any>();
  const [areaId, setAreaId] = useState<number>();

  useImperativeHandle(ref, () => ({
      setAreaId
  }))

    const columns: ProColumns<Land.Item>[] = [
      {
        title: '任务名称',
        dataIndex: 'parentTaskName',
        width: 270,
        ellipsis: true
      },
      {
        title: '归属场地',
        dataIndex: 'areaName',
        width: 270,
        ellipsis: true,
        search: false
      },
      {
        title: '任务ID',
        dataIndex: 'taskId',
        ellipsis: true,
        search: false
      },
      {
        title: '任务类型',
        dataIndex: 'parentTaskType',
        width: 170,
        valueEnum: {
          清洗: { text: '清洗任务' },
          巡检: { text: '巡检任务' },
          割草: { text: '割草任务' },
          喷淋: { text: '喷淋任务' }
        },
        render: text => <Tag color={'processing'}>{text}</Tag>
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 170,
        search: false
      },
      {
        title: '操作',
        width: 170,
        search: false,
        render: (text: any) => {
          return (
            <>
              <a
                onClick={() => {
                  history.push({
                    pathname: `/task/design/add`,
                    search: `?id=${encodeURIComponent(text?.parentTaskId)}`
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
                  const { code, msg } = await del([text.parentTaskId]);
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
            </>
          );
        }
      }
    ];
    return (
      <ProTable<Land.Item>
        columns={columns}
        actionRef={formRef}
        headerTitle={<b>任务设计</b>}
        params={{ areaId: areaId }}
        style={{ position: 'absolute' }}
        cardBordered={true}
        request={async params => {
          const {
            data: { records, total },
            code
          } = await page(params);

          return { data: records, success: !code, total: total };
        }}
        rowKey='parentTaskId'
        search={{
          labelWidth: 'auto'
        }}
        pagination={{
          showSizeChanger: false,
          showQuickJumper: true,
          defaultPageSize: 10
        }}
        dateFormatter='string'
        toolBarRender={() => [
          <Button
            key='button'
            icon={<PlusOutlined />}
            onClick={() => history.push('/task/design/add')}
            type='primary'
          >
            新增
          </Button>
        ]}
        rowSelection={{
          // https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
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
                    selectedRows.map((item: any) => item.parentTaskId)
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
    );
};

export default React.forwardRef(DesignTable);
