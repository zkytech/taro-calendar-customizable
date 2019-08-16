import { ComponentClass } from 'react';

export declare type CalendarMark = {
  /** 要标记的日期 */
  value: string;
  /** 标记颜色 */
  color?: string;
  /** 标记的大小，css中的width、length */
  markSize?: string;
};

type IProps = {
  /** 要标记的日期列表 YYYY-MM-DD */
  marks?: CalendarMark[];
  /** 点击回调 */
  onDayClick?: (item: { value: string }) => any;
  /** 长按回调（触发长按事件时不会触发点击事件） */
  onDayLongPress?: (item: { value: string }) => any;
  /** 当前时间 YYYY-MM-DD*/
  currentDate?: string;
  /** 隐藏箭头 */
  hideArrow?: boolean;
  /** 是否可以滑动 */
  isSwiper?: boolean;
  /** 滑动方向 */
  isVertical?: boolean;
  /** 最小的可选时间 */
  minDate?: string;
  /** 最大的可选时间 */
  maxDate?: string;
  /** 选中日期的背景色 */
  selectedDateColor?: string;
  /** 月份改变回调 */
  onMonthChange?: (value: string) => any;
  onClickPreMonth?: () => any;
  onClickNextMonth?: () => any;
};

declare const Calendar: ComponentClass<IProps>;

export default Calendar;
