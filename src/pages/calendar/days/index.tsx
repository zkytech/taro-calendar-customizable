import { View } from '@tarojs/components';
import './index.less';
import React, {CSSProperties, FunctionComponent, useCallback, useEffect, useRef, useState} from 'react';
import { formatDate, indexOf, LunarInfo } from '../utils';
import { CalendarMark, ExtraInfo } from '../index';
import Day from '../day';

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
  /** 是否含有额外信息 */
  hasExtraInfo: boolean;
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
  /** 额外信息样式 */
  extraInfoStyle?: CSSProperties;
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
  const [days, setDays] = useState<Array<CalendarDateInfo>>([]);
  const prevDateRef = useRef<Date>(null);
  const prevViewRef = useRef<String>(null);
  const _onDayClick = useCallback((value)=>{
    onClick&&onClick(value);
  }, [onClick]);

  const _onDayLongPress = useCallback(args => {
    onDayLongPress&&onDayLongPress(args);
  }, [onDayLongPress]);

  useEffect(()=>{
    //view和startDay基本不会变，就date会经常变化
    //由于传递的是date对象，需要判断date对象的值是否变化，防止因为days变化导致的重复刷新
    if(!prevDateRef.current || formatDate(prevDateRef.current) !==  formatDate(date) || prevViewRef.current !== view) {
      // @ts-ignore
      const dateObj = date ? new Date(date) : new Date();
      let tempDays: CalendarDateInfo[] = [];
      if (view === 'month') {
        tempDays = getDateListByMonth(dateObj, startDay);
      }
      if (view === 'week') {
        tempDays = getDateListByWeek(dateObj, startDay);
      }
      setDays(tempDays);
    }
    //@ts-ignore
    prevDateRef.current = date;
    //@ts-ignore
    prevViewRef.current = view;
  }, [view, date, startDay ]);


  // @ts-ignore
  const maxDateObj = new Date(maxDate ? maxDate : new Date());
  const markDateList = marks ? marks.map(value => value.value) : [];
  const extraInfoDateList = extraInfo
    ? extraInfo.map(value => value.value)
    : [];
  let endDateStr =  selectedRange ? selectedRange.end : '';
  const startDateObj = new Date(selectedRange ? selectedRange.start : '');
  const endDateObj = new Date(endDateStr);
  const minDateObj = new Date(minDate);
  return (
    <View className="calendar-body" style={bodyStyle}>
      {days.map(value => {
        const markIndex = indexOf(markDateList, value.fullDateStr);
        const extraInfoIndex = indexOf(extraInfoDateList, value.fullDateStr);
        let isInRange = false;
        let rangeStart = false;
        let rangeEnd = false;
        if (isMultiSelect && endDateStr) {
          // 范围选择模式
          const valueDateTimestamp = new Date(value.fullDateStr).getTime();
          if (
            valueDateTimestamp >= startDateObj.getTime() &&
            valueDateTimestamp <= endDateObj.getTime()
          ) {
            // 被选择（范围选择）
            isInRange = true;
            if (valueDateTimestamp === startDateObj.getTime()) {
              // 范围起点
              rangeStart = true;
            }
            if (valueDateTimestamp === endDateObj.getTime()) {
              // 范围终点
              rangeEnd = true;
            }
          }
        }
        let disable = new Date(value.fullDateStr).getTime() < minDateObj.getTime() ||
          (maxDate &&
            new Date(value.fullDateStr).getTime() > maxDateObj.getTime() || false);
        return (
          <Day
            key={value.fullDateStr}
            onDayLongPress={_onDayLongPress}
            selected={selectedDate === value.fullDateStr}
            isMultiSelectAndFinish={isMultiSelect && (selectedRange.end || '') != ''}
            markIndex={markIndex}
            extraInfoIndex={extraInfoIndex}
            mode={mode}
            showDivider={showDivider}
            minDate={minDate}
            value={value}
            onClick={_onDayClick}
            selectedDateColor={selectedDateColor}
            markColor={markIndex === -1 ? '' : marks[markIndex].color}
            markSize={markIndex === -1 ? '' : marks[markIndex].markSize}
            extraInfoColor={extraInfoIndex === -1 ? "" : extraInfo[extraInfoIndex].color}
            extraInfoSize={extraInfoIndex === -1 ? "" : extraInfo[extraInfoIndex].fontSize}
            extraInfoText={extraInfoIndex === -1 ? "" : extraInfo[extraInfoIndex].text}
            customStyleGenerator={customStyleGenerator}
            isInRange={isInRange}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            disable={disable}
          />
        );
      })}
    </View>
  );
};

export default React.memo(Days);
