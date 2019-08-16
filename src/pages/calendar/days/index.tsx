import { View } from '@tarojs/components';
import Taro, { FunctionComponent } from '@tarojs/taro';
import './index.less';
import { formatDate, indexOf } from '../utils';
import { CalendarMark } from '../index';

type CalendarDateInfo = {
  /** 当前月的第几天1 ~ 31 */
  date: number;
  /** 是否是当前月份的日期 */
  currentMonth: boolean;
  /** 完整的时间表示 YYYY-MM-DD */
  fullDateStr: string;
};

/**
 * 获取当月的date列表
 * @param month 从1开始计数的月份
 */
const getDateListByMonth = (date: Date) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  let result: CalendarDateInfo[] = [];
  /** 先获取该月份的起点 */
  date.setDate(1);
  // @ts-ignore
  let dateObj = new Date(date);
  dateObj.setDate(1);

  /** 前面一部分非当前月的日期 */
  for (let day = 0; day < date.getDay(); day++) {
    dateObj.setFullYear(year);
    dateObj.setMonth(month);
    dateObj.setDate(date.getDate() - (date.getDay() - day));
    result.push({
      date: dateObj.getDate(),
      currentMonth: false,
      fullDateStr: formatDate(dateObj, 'day')
    });
  }
  /** 当前月的日期 */
  while (date.getMonth() === month) {
    result.push({
      date: date.getDate(),
      currentMonth: true,
      fullDateStr: formatDate(date, 'day')
    });
    date.setDate(date.getDate() + 1);
  }
  /** 后面一部分非当前月的日期 */
  for (let day = date.getDay(); day <= 6; day++) {
    result.push({
      date: date.getDate(),
      currentMonth: false,
      fullDateStr: formatDate(date, 'day')
    });
    date.setDate(date.getDate() + 1);
  }
  if (result.length === 35) {
    for (let day = date.getDay(); day <= 6; day++) {
      result.push({
        date: date.getDate(),
        currentMonth: false,
        fullDateStr: formatDate(date, 'day')
      });
      date.setDate(date.getDate() + 1);
    }
  }
  return result;
};

type DaysProps = {
  /** 日期 用于确定年月 */
  date: Date;
  /** 点击事件回调 */
  onClick: (info: CalendarDateInfo) => any;
  /** 长按回调（触发长按事件时不会触发点击事件） */
  onDayLongPress?: (item: { value: string }) => any;
  /** 要标记的日期 */
  marks: CalendarMark[];
  /** 选定的日期 */
  selectedDate: string;
  /** 选定时的背景色 */
  selectedDateColor?: string;
  /** 最小的可选时间 */
  minDate: string;
  /** 最大的可选时间 */
  maxDate?: string | undefined;
};

const Days: FunctionComponent<DaysProps> = ({
  date,
  onClick,
  marks,
  selectedDate,
  selectedDateColor,
  minDate,
  maxDate,
  onDayLongPress
}) => {
  // @ts-ignore
  const dateObj = date ? new Date(date) : new Date();
  const minDateObj = new Date(minDate);
  // @ts-ignore
  const maxDateObj = new Date(maxDate ? maxDate : new Date());
  const days = getDateListByMonth(dateObj);
  const today = formatDate(new Date(), 'day');
  const markDateList = marks ? marks.map(value => value.value) : [];
  return (
    <View className="calendar-body">
      {days.map(value => {
        const markIndex = indexOf(markDateList, value.fullDateStr);
        let disable = false;
        let className: string[] = [];
        if (!value.currentMonth) {
          className.push('not-this-month');
        }
        if (selectedDate === value.fullDateStr) {
          className.push('calendar-selected');
        }
        if (markIndex !== -1) {
          className.push('calendar-marked');
        }
        if (value.fullDateStr === today) {
          className.push('calendar-today');
        }
        if (
          new Date(value.fullDateStr).getTime() < minDateObj.getTime() ||
          (maxDate &&
            new Date(value.fullDateStr).getTime() > maxDateObj.getTime())
        ) {
          className.push('not-this-month');
          disable = true;
        }
        return (
          <View
            onLongPress={
              onDayLongPress
                ? () => onDayLongPress({ value: value.fullDateStr })
                : undefined
            }
            key={value.fullDateStr}
            className={className.join(' ')}
            onClick={() => {
              if (!disable) {
                onClick(value);
              }
            }}
            style={{
              backgroundColor:
                selectedDate === value.fullDateStr ? selectedDateColor : ''
            }}
          >
            {value.date}
            <View
              style={{
                backgroundColor: markIndex === -1 ? '' : marks[markIndex].color,
                height: markIndex === -1 ? '' : marks[markIndex].markSize,
                width: markIndex === -1 ? '' : marks[markIndex].markSize
              }}
            />
          </View>
        );
      })}
    </View>
  );
};

export default Days;
