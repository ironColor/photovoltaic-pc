import type { Key } from 'react';

export const canSelectFailureType = (record: any) => {
  return (
    record.execStatus === '执行中' ||
    (record.execStatus === '已完成' && Boolean(record.countDownTime)) ||
    (record.execStatus === '中断' && !record.errorCode)
  );
};

export const getCancelableSubTaskIds = (records: any[], selectedRowKeys: Key[]) => {
  return records
    .filter((record: any) => selectedRowKeys.includes(record._id))
    .filter((record: any) => record.taskType === 2 && ['待执行', '中断'].includes(record.execStatus))
    .map((record: any) => record.subtaskId);
};
