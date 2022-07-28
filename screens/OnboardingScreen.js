import { StyleSheet, Text, View,Image } from 'react-native'
import React from 'react'
import Onboarding from 'react-native-onboarding-swiper'
import images from '../constants/images'
import Prayer from './home/Prayer'


const OnboardingScreen = ({navigation}) => {
  return (
    <Onboarding
   
  pages={[
    {
      backgroundColor: 'lightgreen',
      image: <Image source={images.bell} style={{height:170,width:170}}/>,
      title: 'Azan Alarm ',
      subtitle: 'Alow Notifications To Recieve the Prayers Time notices ',
    },
    {
        backgroundColor: '#fdeb93',
        image: <Image source={images.mapsicon} style={{height:170,width:170}}/>,
        title: 'Nearest Mosques',
        subtitle: 'Shows The Nearest Mosque in 5km radius from you.',
      },
      {
        backgroundColor: 'lightgreen',
        image: <Image source={images.masjid} style={{height:170,width:170}}/>,
        title: 'Masjid',
        subtitle: 'Never Miss Jammat With Actual timings of Every Mosque ',
      },
  ]}
/>
  )
}

export default OnboardingScreen

const styles = StyleSheet.create({})