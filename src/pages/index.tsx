import Taro, { FunctionComponent, useState } from '@tarojs/taro';
import Calendar from './calendar/index';
import { View, Button, Text, Switch } from '@tarojs/components';

// TODO:整理一份api，用于快速创建日历，api为纯typescript项目，无任何依赖。

const Index: FunctionComponent = () => {
  const [calendarObj, setCalendarObj] = useState<Calendar>();
  const [currentView, setCurrentView] = useState('2019-08-18');
  const [selected, setSelected] = useState('2019-08-18');
  const [isWeekView, setIsWeekView] = useState(false);
  const [hideController, setHideController] = useState(false);
  const [isLunar, setIsLunar] = useState(true);
  return (
    <View>
      <Calendar
        marks={[
          { value: '2019-08-11', color: 'red', markSize: '9px' },
          { value: '2019-08-12', color: 'pink', markSize: '9px' },
          { value: '2019-08-13', color: 'gray', markSize: '9px' },
          { value: '2019-08-14', color: 'yellow', markSize: '9px' },
          { value: '2019-08-15', color: 'darkblue', markSize: '9px' },
          { value: '2019-08-16', color: 'pink', markSize: '9px' },
          { value: '2019-08-17', color: 'green', markSize: '9px' }
        ]}
        extraInfo={[
          { value: '2019-08-21', text: '生日', color: 'red' },
          { value: '2019-08-22', text: '休假', color: 'darkblue' },
          { value: '2019-08-23', text: '会议', color: 'gray' }
        ]}
        view={isWeekView ? 'week' : 'month'}
        mode={isLunar ? 'lunar' : 'normal'}
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
      <Switch
        checked={isLunar}
        onChange={e => {
          // @ts-ignore
          setIsLunar(e.target.value);
        }}
      >
        农历
      </Switch>
    </View>
  );
};

export default Index;
