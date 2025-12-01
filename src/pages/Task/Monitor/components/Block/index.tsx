import React from 'react';
import styles from './index.less';

interface BlockProps {
  type: string;
  color: string;
  title: string;
}

const Block: React.FC<BlockProps> = React.memo(({ type, color, title }) => {
  return (
    <div className={styles.tipsBlock} style={{ backgroundColor: color, border: type }}>
      <span style={{ paddingLeft: '72px', position: 'fixed' }}>{title}</span>
    </div>
  );
});

export default Block;
