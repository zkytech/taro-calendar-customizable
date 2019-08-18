import Taro, { FunctionComponent, useState } from '@tarojs/taro';
import Calendar from './calendar/index';
import { View, Button, Text, Switch } from '@tarojs/components';

// TODO:自定义周几是起点

const Index: FunctionComponent = () => {
  const [calendarObj, setCalendarObj] = useState<Calendar>();
  const [currentView, setCurrentView] = useState('2019-08-18');
  const [selected, setSelected] = useState('2019-08-18');
  const [isWeekView, setIsWeekView] = useState(false);
  const [hideController, setHideController] = useState(false);
  return (
    <View>
      <Calendar
        view={isWeekView ? 'week' : 'month'}
        bindRef={ref => {
          setCalendarObj(ref);
        }}
        startDay={2}
        hideController={hideController}
        currentView={currentView}
        onCurrentViewChange={setCurrentView}
        selectedDate={selected}
        onDayClick={item => setSelected(item.value)}
      />
      <Text style={{ display: 'block', width: '100vw', textAlign: 'center' }}>
        {currentView.slice(0, 7)}
      </Text>
      <Button
        onClick={() => {
          calendarObj ? calendarObj.goPre() : '';
        }}
        style={{ width: '50%', display: 'inline-block' }}
      >
        上一页
      </Button>
      <Button
        onClick={() => {
          calendarObj ? calendarObj.goNext() : '';
        }}
        style={{ width: '50%', display: 'inline-block' }}
      >
        下一页
      </Button>
      <Button onClick={() => setCurrentView('2019-08')}>
        设置view为2019-08
      </Button>
      <Button onClick={() => setSelected('2019-08-08')}>选中2019-08-08</Button>
      <Switch
        checked={isWeekView}
        onChange={e => {
          // @ts-ignore
          setIsWeekView(e.target.value);
        }}
      >
        周视图
      </Switch>
      <Switch
        checked={hideController}
        onChange={e => {
          // @ts-ignore
          setHideController(e.target.value);
        }}
      >
        隐藏控制器
      </Switch>
    </View>
  );
};

export default Index;
