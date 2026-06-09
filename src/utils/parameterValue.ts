export const getParameterValue = (data: any, parameterCode: string) => {
  const records = Array.isArray(data?.records) ? data.records : [];
  const matchedRecord = records.find(record => record?.parameterCode === parameterCode);
  const value = matchedRecord?.parameterValue;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};
