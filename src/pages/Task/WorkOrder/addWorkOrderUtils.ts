export const DRY_CLEAN_ORDER_TYPE = 1;

export const getOrderTypeOptions = () => {
  const dryCleanOption = {
    label: '干洗',
    value: DRY_CLEAN_ORDER_TYPE
  };

  return [dryCleanOption];
};

export const isOrderTypeSelectDisabled = () => true;
