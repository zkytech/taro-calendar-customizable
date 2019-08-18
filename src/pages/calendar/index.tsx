import { Picker, View, Swiper, SwiperItem } from '@tarojs/components';
import Taro, { Component, FunctionComponent } from '@tarojs/taro';
import './index.less';
import { formatDate } from './utils';
import Days, {
  CalendarDateInfo,
  CustomStyles,
  StyleGeneratorParams
} from './days/index';
import { CSSProperties } from 'react';

export type CalendarMark = {
  /** 要标记的日期 */
  value: string;
  /** 标记颜色 */
  color?: string;
  /** 标记的大小，css中的width、length */
  markSize?: string;
};

export type IProps = {
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
  /** 是否显示农历 */
  mode?: 'normal' | 'lunar';
  /** 是否显示分割线 */
  showDivider?: boolean;
  /** 是否范围选择模式 */
  isMultiSelect?: boolean;
  /** 月份改变回调 */
  onMonthChange?: (value: string) => any;
  onClickPreMonth?: () => any;
  onClickNextMonth?: () => any;
  onSelectDate?: (value: { start: string; end: string }) => any;
  /** 自定义样式生成器 */
  customStyleGenerator?: (dateInfo: StyleGeneratorParams) => CustomStyles;
  /** 头部整体样式 */
  headStyle?: CSSProperties;
  /** 头部单元格样式 */
  headCellStyle?: CSSProperties;
  /** body整体样式 */
  bodyStyle?: CSSProperties;
  /** 左箭头样式 */
  leftArrowStyle?: CSSProperties;
  /** 右箭头样式 */
  rightArrowStyle?: CSSProperties;
  /** 日期选择器样式 */
  datePickerStyle?: CSSProperties;
  /** 日期选择器&左右箭头 所在容器样式 */
  pickerRowStyle?: CSSProperties;
  CustomHeader?: React.ComponentClass<any>;
};

type IState = {
  /** 当前年月YYYY-MM */
  current: string;
  /** 当前选中日期 YYYY-MM-DD*/
  selectedDate: string;
  /** 当前显示的轮播图index */
  currentCarouselIndex: number;
  /** 范围选择 */
  selectedRange: { start: string; end: string };
};

export default class Calendar extends Component<IProps, IState> {
  config = {
    navigationBarTitleText: ''
  };

  state: IState = {
    current: formatDate(new Date(), 'month'),
    selectedDate: Calendar.defaultProps.currentDate as string,
    currentCarouselIndex: 1,
    selectedRange: { start: '', end: '' }
  };

  public static defaultProps: Partial<IProps> = {
    isVertical: false,
    marks: [],
    currentDate: formatDate(new Date(), 'day'),
    selectedDateColor: '#90b1ef',
    hideArrow: false,
    isSwiper: true,
    minDate: '1970-01-01',
    mode: 'normal',
    maxDate: '2100-12-31',
    showDivider: false,
    isMultiSelect: false
  };
  componentWillReceiveProps(nextProps: Readonly<IProps>): void {
    if (
      nextProps.currentDate &&
      nextProps.currentDate !== this.props.currentDate
    ) {
      this.setState({ selectedDate: nextProps.currentDate });
    }
  }

  onClickDate = (value: CalendarDateInfo) => {
    const { onDayClick, onSelectDate } = this.props;
    let { current, currentCarouselIndex, selectedRange } = this.state;
    if (!selectedRange.start || selectedRange.end) {
      selectedRange = { start: value.fullDateStr, end: '' };
    } else {
      if (new Date(selectedRange.start) > new Date(value.fullDateStr)) {
        selectedRange = {
          start: value.fullDateStr,
          end: selectedRange.start
        };
      } else {
        selectedRange.end = value.fullDateStr;
      }
    }

    if (!value.currentMonth) {
      // 点到非本月的日期就跳转到相应月份
      let dateObj = new Date(value.fullDateStr);
      if (dateObj.getMonth() > new Date(current).getMonth()) {
        currentCarouselIndex = (currentCarouselIndex + 1) % 3;
      } else {
        currentCarouselIndex = (currentCarouselIndex + 2) % 3;
      }

      current = formatDate(dateObj, 'month');
    }
    this.setState({
      selectedDate: value.fullDateStr,
      selectedRange,
      currentCarouselIndex,
      current
    });
    if (onDayClick) {
      onDayClick({ value: value.fullDateStr });
    }
    if (onSelectDate) {
      onSelectDate(selectedRange);
    }
  };

  goNextMonth = () => {
    let dateObj = new Date(this.state.current);
    dateObj.setMonth(dateObj.getMonth() + 1);
    const nextMonth = formatDate(dateObj, 'month');
    this.setState({ current: nextMonth });
    const { onClickNextMonth, onMonthChange } = this.props;
    if (onClickNextMonth) onClickNextMonth();
    if (onMonthChange) onMonthChange(nextMonth);
  };

  goPreMonth = () => {
    let dateObj = new Date(this.state.current);
    dateObj.setMonth(dateObj.getMonth() - 1);
    const preMonth = formatDate(dateObj, 'month');
    this.setState({ current: preMonth });
    const { onClickPreMonth, onMonthChange } = this.props;
    if (onClickPreMonth) onClickPreMonth();
    if (onMonthChange) onMonthChange(preMonth);
  };

  render() {
    const {
      current,
      selectedDate,
      currentCarouselIndex,
      selectedRange
    } = this.state;
    const {
      marks,
      isVertical,
      selectedDateColor,
      hideArrow,
      isSwiper,
      minDate,
      maxDate,
      onDayLongPress,
      mode,
      showDivider,
      isMultiSelect,
      customStyleGenerator,
      headStyle,
      headCellStyle,
      bodyStyle,
      leftArrowStyle,
      rightArrowStyle,
      datePickerStyle,
      pickerRowStyle,
      CustomHeader
    } = this.props;

    // 配合Swiper组件实现无限滚动
    // 原理：永远保持当前屏幕显示月份的左边是前一个月，右边是后一个月
    // current即当前月份，currentCarouselIndex即当前显示页面的index。一共3个页面，index分别为0 1 2 。
    // Swiper的无限循环就是类似0 1 2 0 1 2 这样。如果currentCarouselIndex是2 那么我只要保证 1显示的是前面一个月，0显示的是后面一个月 就完成了循环。
    const currentMonth = new Date(current);
    const preMonth = new Date(current);
    preMonth.setMonth(currentMonth.getMonth() - 1);
    const nextMonth = new Date(current);
    nextMonth.setMonth(currentMonth.getMonth() + 1);
    const preIndex = (currentCarouselIndex + 2) % 3;
    const nextIndex = (currentCarouselIndex + 1) % 3;
    let monthObj: Date[] = [];
    monthObj[currentCarouselIndex] = currentMonth;
    monthObj[preIndex] = preMonth;
    monthObj[nextIndex] = nextMonth;
    // 所有Days组件的公共Props
    const publicDaysProp = {
      marks: marks ? marks : [],
      onClick: this.onClickDate,
      selectedDate,
      minDate: minDate as string,
      maxDate,
      selectedDateColor,
      onDayLongPress,
      mode: mode as 'normal' | 'lunar',
      showDivider: showDivider as boolean,
      isMultiSelect: isMultiSelect as boolean,
      selectedRange: selectedRange,
      customStyleGenerator
    };

    return (
      <View>
        <View className="calendar-picker" style={pickerRowStyle}>
          {hideArrow ? (
            ''
          ) : (
            <View
              style={leftArrowStyle}
              className="calendar-arrow-left"
              onClick={() => {
                this.setState({
                  currentCarouselIndex: (currentCarouselIndex + 2) % 3
                });
                this.goPreMonth();
              }}
            />
          )}
          <Picker
            style={{
              display: 'inline-block',
              lineHeight: '25px',
              ...datePickerStyle
            }}
            mode="date"
            onChange={e => this.setState({ current: e.detail.value })}
            value={current}
            fields="month"
            start={minDate}
            end={maxDate}
          >
            {current.replace('-', '年').concat('月')}
          </Picker>
          {hideArrow ? (
            ''
          ) : (
            <View
              style={rightArrowStyle}
              className="calendar-arrow-right"
              onClick={() => {
                this.setState({
                  currentCarouselIndex: (currentCarouselIndex + 1) % 3
                });
                this.goNextMonth();
              }}
            />
          )}
        </View>

        <View className="calendar-head" style={headStyle}>
          {['日', '一', '二', '三', '四', '五', '六'].map(value => (
            <View style={headCellStyle} key={value}>
              {value}
            </View>
          ))}
        </View>
        {isSwiper ? (
          <Swiper
            style={bodyStyle}
            vertical={isVertical}
            circular
            current={currentCarouselIndex}
            onChange={e => {
              if (e.detail.source === 'touch') {
                const currentIndex = e.detail.current;
                if ((currentCarouselIndex + 1) % 3 === currentIndex) {
                  // 当前月份+1
                  this.goNextMonth();
                } else {
                  // 当前月份-1
                  this.goPreMonth();
                }
                this.setState({ currentCarouselIndex: e.detail.current });
              }
            }}
            className={'calendar-swiper'}
          >
            <SwiperItem>
              <Days date={monthObj[0]} {...publicDaysProp} />
            </SwiperItem>
            <SwiperItem>
              <Days date={monthObj[1]} {...publicDaysProp} />
            </SwiperItem>

            <SwiperItem>
              <Days date={monthObj[2]} {...publicDaysProp} />
            </SwiperItem>
          </Swiper>
        ) : (
          <Days bodyStyle={bodyStyle} date={currentMonth} {...publicDaysProp} />
        )}
      </View>
    );
  }
}
