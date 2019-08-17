import  Taro,{ FunctionComponent } from '@tarojs/taro';
import Calendar from './calendar/index';

const Index: FunctionComponent = () => {
  return (
    <Calendar
      marks={[

        { value: '2019-08-11', color: 'red', markSize: '9px' },
        { value: '2019-08-12', color: 'pink', markSize: '9px' },
        { value: '2019-08-13', color: 'gray', markSize: '9px' },
        { value: '2019-08-14', color: 'yellow', markSize: '9px' },
        { value: '2019-08-15', color: 'darkblue', markSize: '9px' },
        { value: '2019-08-16', color: 'pink', markSize: '9px' },
        { value: '2019-08-17', color: 'green', markSize: '9px' },
      ]}
      mode='normal'
      isMultiSelect
      selectedDateColor='#346fc2'
      onDayClick={item => console.log(item)}
      onDayLongPress={item => console.log(item)}
      headStyle={{backgroundColor:"RGBA(12,36,157,0.5)",borderTopLeftRadius:'10px',borderTopRightRadius:'10px',boxShadow:'0 0 5px RGBA(0,0,0,0.3)',width:'90vw',marginLeft:'5vw',zIndex:2}}
      bodyStyle={{backgroundColor:"lightblue",borderBottomLeftRadius:'10px',borderBottomRightRadius:'10px',boxShadow:'0 0 5px RGBA(0,0,0,0.3)',borderTop:"none",width:'90vw',marginLeft:'5vw'}}
    />
  );
};

export default Index;
