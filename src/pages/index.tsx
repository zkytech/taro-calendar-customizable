import Taro, { FunctionComponent } from '@tarojs/taro';
import Calendar from './calendar/index';

const Index: FunctionComponent = () => {
  return (
    <Calendar
      marks={[
        { value: '2019-08-16', color: 'pink', markSize: '3px' },
        { value: '2019-08-17', color: 'green', markSize: '6px' },
        { value: '2019-08-18', color: 'red', markSize: '9px' }
      ]}
      selectedDateColor="#346fc2"
      onDayClick={item => console.log(item)}
      onDayLongPress={item => console.log(item)}
    />
  );
};

export default Index;
