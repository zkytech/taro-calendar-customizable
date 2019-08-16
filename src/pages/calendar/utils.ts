/**
 * 默认将日期格式化为 YYYY-MM-DD
 * @param date Date类型的时间
 * @param field 时间显示粒度
 */
export const formatDate = (
  date: Date,
  field: 'year' | 'month' | 'day' = 'day'
) => {
  const yearStr = date.getFullYear();
  const month = date.getMonth() + 1;
  const monthStr = (Array(2).join('0') + month).slice(-2);
  const day = date.getDate();
  const dayStr = (Array(2).join('0') + day).slice(-2);
  switch (field) {
    case 'year':
      return `${yearStr}`;
    case 'month':
      return `${yearStr}-${monthStr}`;
    case 'day':
      return `${yearStr}-${monthStr}-${dayStr}`;
  }
};

/** 小程序中Array.indexOf的实现 */
export const indexOf = (array: any[], target: any) => {
  let resultIndex = -1;
  if (!array) {
    return resultIndex;
  }
  array.every((value, index) => {
    if (value === target) {
      resultIndex = index;
      return false;
    }
    return true;
  });
  return resultIndex;
};
