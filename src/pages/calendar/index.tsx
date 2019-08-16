import { Picker, View, Swiper, SwiperItem } from '@tarojs/components';
import Taro, { Component } from '@tarojs/taro';
import './index.less';
import { formatDate } from './utils';
import Days from './days/index';

export type CalendarMark = {
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
type IState = {
  /** 当前年月YYYY-MM */
  current: string;
  /** 当前选中日期 YYYY-MM-DD*/
  selectedDate: string;
  /** 当前显示的轮播图index */
  currentCarouselIndex: number;
};

export default class Calendar extends Component<IProps, IState> {
  config = {
    navigationBarTitleText: ''
  };

  state: IState = {
    current: formatDate(new Date(), 'month'),
    selectedDate: Calendar.defaultProps.currentDate as string,
    currentCarouselIndex: 1
  };

  public static defaultProps: Partial<IProps> = {
    isVertical: false,
    marks: [],
    currentDate: formatDate(new Date(), 'day'),
    selectedDateColor: '#90b1ef',
    hideArrow: false,
    isSwiper: true,
    minDate: '1970-01-01'
  };
  componentWillReceiveProps(nextProps: Readonly<IProps>): void {
    if (
      nextProps.currentDate &&
      nextProps.currentDate !== this.props.currentDate
    ) {
      this.setState({ selectedDate: nextProps.currentDate });
    }
  }

  onClickDate = value => {
    const { onDayClick } = this.props;
    let { current, currentCarouselIndex } = this.state;
    if (!value.currentMonth) {
      // 点到非本月的日期就跳转到相应月份
      let dateObj = new Date(value.fullDateStr);
      if (dateObj.getMonth() > new Date(current).getMonth()) {
        currentCarouselIndex = (currentCarouselIndex + 1) % 3;
      } else {
        currentCarouselIndex = (currentCarouselIndex + 2) % 3;
      }
      this.setState({
        selectedDate: value.fullDateStr,
        currentCarouselIndex,
        current: formatDate(dateObj, 'month')
      });
    } else {
      this.setState({ selectedDate: value.fullDateStr });
    }
    if (onDayClick) {
      onDayClick({ value: value.fullDateStr });
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
    const { current, selectedDate, currentCarouselIndex } = this.state;
    const {
      marks,
      isVertical,
      selectedDateColor,
      hideArrow,
      isSwiper,
      minDate,
      maxDate,
      onDayLongPress
    } = this.props;
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
    const publicDaysProp = {
      marks: marks ? marks : [],
      onClick: this.onClickDate,
      selectedDate,
      minDate: minDate as string,
      maxDate,
      selectedDateColor,
      onDayLongPress
    };

    return (
      <View>
        <View className="calendar-picker">
          {hideArrow ? (
            ''
          ) : (
            <View
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
            style={{ display: 'inline-block', lineHeight: '25px' }}
            mode="date"
            onChange={e => this.setState({ current: e.detail.value })}
            value={current}
            fields="month"
          >
            {current.replace('-', '年').concat('月')}
          </Picker>
          {hideArrow ? (
            ''
          ) : (
            <View
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

        <View className="calendar-head">
          {['日', '一', '二', '三', '四', '五', '六'].map(value => (
            <View key={value}>{value}</View>
          ))}
        </View>
        {isSwiper ? (
          <Swiper
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
            style={{ height: '245px' }}
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
          <Days date={currentMonth} {...publicDaysProp} />
        )}
      </View>
    );
  }
}