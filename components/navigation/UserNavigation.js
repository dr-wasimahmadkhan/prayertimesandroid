import React from 'react';
import { createDrawerNavigator} from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import theme from '../../constants/theme';
import Prayer from '../../screens/home/Prayer';
import Maps from '../../screens/maps/Maps';
import PrayerTimings from '../../screens/prayerTimings/PrayerTimings';
import { DrawerContentuser } from './DrawerContentuser';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const HomeStackNavigator = () => {
  return <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen
          name='Home'
          component={Prayer} />
  </Stack.Navigator>
}

const Drawer = createDrawerNavigator();

const UserNavigation = () => {
  return (
    <>
      <NavigationContainer>
        <Drawer.Navigator drawerContent={props=> <DrawerContentuser {...props}/>}>
        <Drawer.Screen name="Home" component={HomeStackNavigator} />
        <Drawer.Screen name="Prayer Time" component={PrayerTimings} options={{}} />
         
          <Drawer.Screen name="Maps" component={Maps} />
          
        </Drawer.Navigator>
      </NavigationContainer>
    </>
  );
};

export default UserNavigation;
