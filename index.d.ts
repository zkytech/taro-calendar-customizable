import { ComponentClass } from 'react';
import { IProps } from './src/pages/calendar/index';
import { LunarInfo } from './src/pages/calendar/utils';

export declare type CalendarMark = {
  /** 要标记的日期 */
  value: string;
  /** 标记颜色 */
  color?: string;
  /** 标记的大小，css中的width、length */
  markSize?: string;
};

export declare namespace CalendarTools {
  /** 公历转农历
   * @param date 日期字符串 YYYY-MM-DD
   */
  export function solar2lunar(date: string): LunarInfo;
  /** 农历转公历
   * @param y 年
   * @param m 月
   * @param d 日
   * @param isLeapMonth 是否是闰月
   */
  export function lunar2solar(
    y: number,
    m: number,
    d: number,
    isLeapMonth: boolean
  ): LunarInfo;
}

declare const Calendar: ComponentClass<IProps>;

export default Calendar;
