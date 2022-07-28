import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import theme from '../../constants/theme';
import Prayer from '../../screens/home/Prayer';
import Maps from '../../screens/maps/Maps';
import Signup from '../../screens/auth/Signup';
import Signin from '../../screens/auth/Signin';
import { DrawerContent } from './Drawercontent';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../../screens/OnboardingScreen'

const Stack = createNativeStackNavigator();
const HomeStackNavigator = () => {
  return <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen
          name='Home'
          component={Prayer} />
  </Stack.Navigator>
}

const Drawer = createDrawerNavigator();

const WithoutUserNavigation = () => {
  return (
    <>
      <NavigationContainer>
        <Drawer.Navigator drawerContent={props=> <DrawerContent {...props}/>}>
          <Drawer.Screen name="Home" component={HomeStackNavigator} />
          <Drawer.Screen name="Maps" component={Maps} />
          <Drawer.Screen name="Sign Up" component={Signup} options={{}} />
          <Drawer.Screen name="Sign In" component={Signin} options={{}} />
        </Drawer.Navigator>
        </NavigationContainer>
    
    </>
  );
};

export default WithoutUserNavigation;
