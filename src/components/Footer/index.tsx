import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';
const Footer: React.FC = () => {
  const defaultMessage = '济南巽达智能科技有限公司';
  const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      style={{
        background: 'none'
      }}
      copyright={`${currentYear} ${defaultMessage}`}
    />
  );
};
export default Footer;
