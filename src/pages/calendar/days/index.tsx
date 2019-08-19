import { View } from '@tarojs/components';
import Taro, { FunctionComponent } from '@tarojs/taro';
import './index.less';
import { CSSProperties } from 'react';
import { formatDate, indexOf, CalendarTools, LunarInfo } from '../utils';
import { CalendarMark, ExtraInfo } from '../index';

export type CalendarDateInfo = {
  /** 当前月的第几天1 ~ 31 */
  date: number;
  /** 是否是当前月份的日期 */
  currentMonth: boolean;
  /** 完整的时间表示 YYYY-MM-DD */
  fullDateStr: string;
};

/**
 * 计算current增加add天后是周几
 * @param current 当前是第几天
 * @param add 要加多少天
 */
const calcWeekDay = (current: number, add: number) => {
  return (current + add) % 7;
};

/**
 * 获取当月的date列表
 * @param date 属于目标月份的Date对象
 * @param startDay 一行的起点  比如以周一为起点 此时startDay = 1，以周日为起点，此时startDay = 0
 */
const getDateListByMonth = (date: Date, startDay: number) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  /** 一周的最后一天 */
  const weekEndDay = calcWeekDay(startDay, 6);
  let result: CalendarDateInfo[] = [];
  /** 先获取该月份的起点 */
  date.setDate(1);
  // @ts-ignore
  let dateObj = new Date(date);
  dateObj.setDate(1);

  /** 前面一部分非当前月的日期 */
  for (let day = startDay; day != date.getDay(); day = calcWeekDay(day, 1)) {
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
  for (let day = date.getDay(); day != weekEndDay; day = calcWeekDay(day, 1)) {
    result.push({
      date: date.getDate(),
      currentMonth: false,
      fullDateStr: formatDate(date, 'day')
    });
    date.setDate(date.getDate() + 1);
  }
  result.push({
    date: date.getDate(),
    currentMonth: false,
    fullDateStr: formatDate(date, 'day')
  });
  if (result.length === 35) {
    date.setDate(date.getDate() + 1);
    for (
      let day = date.getDay();
      day != weekEndDay;
      day = calcWeekDay(day, 1)
    ) {
      result.push({
        date: date.getDate(),
        currentMonth: false,
        fullDateStr: formatDate(date, 'day')
      });
      date.setDate(date.getDate() + 1);
    }
    result.push({
      date: date.getDate(),
      currentMonth: false,
      fullDateStr: formatDate(date, 'day')
    });
  }
  return result;
};

/** 获取指定日期所在周的所有天
 * @param date 属于目标星期的Date对象
 * @param startDay 一行的起点  比如以周一为起点 此时startDay = 1，以周日为起点，此时startDay = 0
 */
const getDateListByWeek = (date: Date, startDay: number) => {
  date.setDate(date.getDate() - ((date.getDay() - startDay + 7) % 7));
  /** 一周的最后一天 */
  const weekEndDay = calcWeekDay(startDay, 6);
  let result: CalendarDateInfo[] = [];
  while (date.getDay() !== weekEndDay) {
    result.push({
      date: date.getDate(),
      currentMonth: true,
      fullDateStr: formatDate(date, 'day')
    });
    date.setDate(date.getDate() + 1);
  }
  result.push({
    date: date.getDate(),
    currentMonth: true,
    fullDateStr: formatDate(date, 'day')
  });
  return result;
};

export type StyleGeneratorParams = {
  /** 当前月的第几天1 ~ 31 */
  date: number;
  /** 是否是当前月份的日期 */
  currentMonth: boolean;
  /** 完整的时间表示 YYYY-MM-DD */
  fullDateStr: string;
  /** 是否被选中 */
  selected: boolean;
  /** 是否标记 */
  marked: boolean;
  /** 多选模式选项 */
  multiSelect: {
    /** 是否在选择范围内 */
    multiSelected: boolean;
    /** 是否是选择起点 */
    multiSelectedStar: boolean;
    /** 是否是选择终点 */
    multiSelectedEnd: boolean;
  };
  /** 农历信息 */
  lunar: LunarInfo | null;
};

export type CustomStyles = {
  /** 农历样式 */
  lunarStyle?: CSSProperties;
  /** 日期样式 */
  dateStyle?: CSSProperties;
  /** 标记样式 */
  markStyle?: CSSProperties;
  /** 容器单元格样式 */
  containerStyle?: CSSProperties;
};

export type DaysProps = {
  /** 日期 用于确定年月 */
  date: Date;
  /** 点击事件回调 */
  onClick: (info: CalendarDateInfo) => any;
  /** 长按回调（触发长按事件时不会触发点击事件） */
  onDayLongPress?: (item: { value: string }) => any;
  /** 额外信息 */
  extraInfo: ExtraInfo[];
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
  /** 显示模式 普通/农历 */
  mode: 'normal' | 'lunar';
  /** 是否显示分割线 */
  showDivider: boolean;
  /** 是否范围选择模式 */
  isMultiSelect: boolean;
  /** 范围选择结果 */
  selectedRange: { start: string; end: string };
  /** 自定义样式生成器 */
  customStyleGenerator?: (dateInfo: StyleGeneratorParams) => CustomStyles;
  /** 自定义Calendar Body样式 */
  bodyStyle?: CSSProperties;
  /** 视图模式 */
  view: 'month' | 'week';
  /** 一行的开始 0代表周日*/
  startDay: number;
};

const Days: FunctionComponent<DaysProps> = ({
  date,
  onClick,
  marks,
  selectedDate,
  selectedDateColor,
  minDate,
  maxDate,
  onDayLongPress,
  mode,
  showDivider,
  isMultiSelect,
  selectedRange,
  customStyleGenerator,
  bodyStyle,
  view,
  startDay,
  extraInfo
}) => {
  // @ts-ignore
  const dateObj = date ? new Date(date) : new Date();
  const minDateObj = new Date(minDate);
  // @ts-ignore
  const maxDateObj = new Date(maxDate ? maxDate : new Date());
  let days: CalendarDateInfo[] = [];
  if (view === 'month') {
    days = getDateListByMonth(dateObj, startDay);
  }
  if (view === 'week') {
    days = getDateListByWeek(dateObj, startDay);
  }
  const today = formatDate(new Date(), 'day');
  const markDateList = marks ? marks.map(value => value.value) : [];
  const extraInfoDateList = extraInfo
    ? extraInfo.map(value => value.value)
    : [];
  const startDateObj = new Date(selectedRange ? selectedRange.start : '');
  const endDateObj = new Date(selectedRange ? selectedRange.end : '');
  return (
    <View className="calendar-body" style={bodyStyle}>
      {days.map(value => {
        const markIndex = indexOf(markDateList, value.fullDateStr);
        const extraInfoIndex = indexOf(extraInfoDateList, value.fullDateStr);
        let disable = false;
        let className: string[] = [];

        if (!value.currentMonth) {
          // 非本月
          className.push('not-this-month');
        }
        if (
          selectedDate === value.fullDateStr &&
          !(isMultiSelect && selectedRange.end)
        ) {
          // 选中
          // 范围选择模式显示已选范围时，不显示selected
          className.push('calendar-selected');
        }
        if (markIndex !== -1) {
          // 标记
          className.push('calendar-marked');
        }
        if (extraInfoIndex !== -1) {
          // 额外信息
          className.push('calendar-extra-info');
        }
        if (value.fullDateStr === today) {
          // 当天
          className.push('calendar-today');
        }
        if (showDivider) {
          // 分割线
          className.push('calendar-line-divider');
        }
        let isInRange = false;
        let rangeStart = false;
        let rangeEnd = false;
        if (isMultiSelect && selectedRange.end) {
          // 范围选择模式
          const valueDateTimestamp = new Date(value.fullDateStr).getTime();
          if (
            valueDateTimestamp >= startDateObj.getTime() &&
            valueDateTimestamp <= endDateObj.getTime()
          ) {
            // 被选择（范围选择）
            className.push('calendar-range');
            isInRange = true;
            if (valueDateTimestamp === startDateObj.getTime()) {
              // 范围起点
              rangeStart = true;
              className.push('calendar-range-start');
            }
            if (valueDateTimestamp === endDateObj.getTime()) {
              // 范围终点
              rangeEnd = true;
              className.push('calendar-range-end');
            }
          }
        }
        if (
          new Date(value.fullDateStr).getTime() < minDateObj.getTime() ||
          (maxDate &&
            new Date(value.fullDateStr).getTime() > maxDateObj.getTime())
        ) {
          className.push('not-this-month');
          disable = true;
        }
        let lunarDayInfo =
          mode === 'lunar'
            ? CalendarTools.solar2lunar(value.fullDateStr)
            : null;
        let lunarClassName = ['lunar-day'];
        if (lunarDayInfo) {
          if (lunarDayInfo.IDayCn === '初一') {
            lunarClassName.push('lunar-month');
          }
        }
        let customStyles: CustomStyles = {};
        if (customStyleGenerator) {
          // 用户定制样式
          const generatorParams: StyleGeneratorParams = {
            ...value,
            lunar: lunarDayInfo,
            selected: selectedDate === value.fullDateStr,
            multiSelect: {
              multiSelected: isInRange,
              multiSelectedStar: rangeStart,
              multiSelectedEnd: rangeEnd
            },
            marked: markIndex !== -1
          };
          customStyles = customStyleGenerator(generatorParams);
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
            style={customStyles.containerStyle}
          >
            <View
              className="calendar-date"
              style={
                customStyles.dateStyle || customStyles.dateStyle === {}
                  ? customStyles.dateStyle
                  : {
                      backgroundColor:
                        selectedDate === value.fullDateStr || isInRange
                          ? selectedDateColor
                          : ''
                    }
              }
            >
              {/* 日期 */}
              {value.date}
            </View>
            {mode === 'normal' ? (
              ''
            ) : (
              <View
                className={lunarClassName.join(' ')}
                style={customStyles.lunarStyle}
              >
                {/* 农历 */}
                {(() => {
                  if (!lunarDayInfo) {
                    return;
                  }
                  lunarDayInfo = lunarDayInfo as LunarInfo;
                  let dateStr: string;
                  if (lunarDayInfo.IDayCn === '初一') {
                    dateStr = lunarDayInfo.IMonthCn;
                  } else {
                    //@ts-ignore
                    dateStr = lunarDayInfo.isTerm
                      ? lunarDayInfo.Term
                      : lunarDayInfo.IDayCn;
                  }
                  return dateStr;
                })()}
              </View>
            )}
            {/* 标记 */}
            <View
              className="calendar-mark"
              style={{
                backgroundColor: markIndex === -1 ? '' : marks[markIndex].color,
                height: markIndex === -1 ? '' : marks[markIndex].markSize,
                width: markIndex === -1 ? '' : marks[markIndex].markSize,
                top: mode === 'lunar' ? '2.0rem' : '1.5rem',
                ...customStyles.markStyle
              }}
            />
            {extraInfoIndex === -1 ? (
              ''
            ) : (
              <View
                className="calendar-extra-info"
                style={{
                  color:
                    extraInfoIndex === -1
                      ? ''
                      : extraInfo[extraInfoIndex].color,
                  fontSize:
                    extraInfoIndex === -1
                      ? ''
                      : extraInfo[extraInfoIndex].fontSize
                }}
              >
                {/* 额外信息 */}
                {extraInfo[extraInfoIndex].text}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default Days;
