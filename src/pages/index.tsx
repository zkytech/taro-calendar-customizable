import Taro, { FunctionComponent } from '@tarojs/taro';
import Calendar from './calendar/index';
import { View } from '@tarojs/components';
// TODO:1.单行模式（仅显示本周的7天） 2.周月年视图切换

const Index: FunctionComponent = () => {
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
        mode="lunar"
        isMultiSelect
        selectedDateColor="#346fc2"
        onDayClick={item => console.log(item)}
        onDayLongPress={item => console.log(item)}
      />
    </View>
  );
};

export default Index;
