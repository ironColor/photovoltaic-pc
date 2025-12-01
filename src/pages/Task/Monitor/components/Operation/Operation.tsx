import React from 'react';
import './index.less';
import { Tooltip } from 'antd';

interface ButtonProps {
  icon: React.ReactNode; // 图标
  label: string; // 标签
  onClick: () => void; // 点击事件
}

const OperationButton: React.FC<ButtonProps> = React.memo(({ icon, label, onClick }) => {
  return (
    <Tooltip title={label}>
      <div className='operationButton' onClick={onClick} style={{backgroundImage: `url(${icon})`}}/>
    </Tooltip>
  );
});

export default OperationButton;
