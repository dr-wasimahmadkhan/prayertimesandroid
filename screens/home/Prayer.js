import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  ActivityIndicator,
  TouchableWithoutFeedback,
  ToastAndroid,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { getPrayerTimings } from './function';
import { useMutation } from 'react-query';
import backgroundImage from '../../assets/images/masjid.jpg';

import { signOut } from 'firebase/auth';
import { authentication } from '../../database/firebaseDB';
import theme from '../../constants/theme';
import NearbyMasjidsModal from './NearbyMasjidsModal';
import images from '../../constants/images';
const signOutMutationFn = payload => {
  return new Promise((resolve, reject) => {
    signOut(authentication)
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
};

export default function Prayer({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [displayCurrentAddress, setDisplayCurrentAddress] = useState(
    'Wait, we are fetching you location...',
  );
  const [prayerTimes, setPrayerTimes] = React.useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isNearbyMasjidsModalVisible, setIsNearbyMasjidsModalVisible] = useState(false);

  useEffect(() => {
    async function gettingCoords() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      if (coords) {
        const { latitude, longitude } = coords;
        const response = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        for (const item of response) {
          const address = ` ${item.city}`;
          setDisplayCurrentAddress(address);
        }
      }
    }
    gettingCoords();
  }, []);
  useEffect(() => {
    const unsubscribe = authentication.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  async function setTimings(date) {
    setIsLoading(true);
    const prayerTimes = await getPrayerTimings(date, location);
    setPrayerTimes(prayerTimes);
    setIsLoading(false);

    // console.log(prayertimes);
  }

  const handleNearbyMasjidsClick = async () => {
    setIsNearbyMasjidsModalVisible(true);
  };

  const signOutMutation = useMutation(
    signOutMutationFn,
    {
      onSuccess: () => {
        ToastAndroid.show('Successfully signed out!', ToastAndroid.SHORT);
      },
      onError: err => {
        console.log('error');
        ToastAndroid.show(err.message, ToastAndroid.SHORT);
      },
    },
    { retry: false },
  );
  const handleSignOut = () => {
    if (signOutMutation.isLoading) {
      return;
    }
    Alert.alert('Sign Out', 'Are you sure you want to be signed out?', [
      {
        text: 'No',
        style: 'cancel',
        onPress: () => {},
      },
      {
        text: 'Yes',
        onPress: () => {
          signOutMutation.mutate();
        },
      },
    ]);
  };

  return (
    <>
      <View style={styles.container}>
      <ImageBackground source={backgroundImage} style={styles.image} />
        <View style={styles.Titles}>
          <Text style={styles.title}>PRAYERS TIMINGS</Text>

          <Text style={styles.big}> {displayCurrentAddress} </Text>
        </View>

        <View style={styles.times1}>
          {prayerTimes != null && (
            <View style={styles.prayerTimesContainer}>
              <View style={styles.timesView}>
                <Text style={styles.times}> FAJAR </Text>
                <Text style={styles.times}> {prayerTimes.timings.Fajr}</Text>
              </View>
              <View style={styles.timesView}>
                <Text style={styles.times}> Surise </Text>
                <Text style={styles.times}> {prayerTimes.timings.Sunrise}</Text>
              </View>
              <View style={styles.timesView}>
                <Text style={styles.times}> DUHAR </Text>
                <Text style={styles.times}> {prayerTimes.timings.Dhuhr}</Text>
              </View>
              <View style={styles.timesView}>
                <Text style={styles.times}> ASAR </Text>
                <Text style={styles.times}> {prayerTimes.timings.Asr}</Text>
              </View>
              <View style={styles.timesView}>
                <Text style={styles.times}> MAGRIB </Text>
                <Text style={styles.times}> {prayerTimes.timings.Maghrib}</Text>
              </View>
              <View style={styles.timesView}>
                <Text style={styles.times}> ISHA </Text>
                <Text style={styles.times}> {prayerTimes.timings.Isha}</Text>
              </View>
            </View>
          )}
        </View>
        <View style={styles.spinnerView}>
          {(isLoading || signOutMutation.isLoading) && (
            <ActivityIndicator size="large" color="white" />
          )}
        </View>

        <TouchableWithoutFeedback
          onPress={() => {
            setTimings(new Date());
          }}>
          <View style={styles.button1}>
            <View style={styles.button2TextView}>
              <Text style={styles.button2Text}>Get Prayers Times</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={handleNearbyMasjidsClick}>
          <View style={[styles.button2, {}]}>
            <View style={styles.button2TextView}>
              <Text style={styles.button2Text}>Nearby Masjids</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <NearbyMasjidsModal
          isNearbyMasjidsModalVisible={isNearbyMasjidsModalVisible}
          setIsNearbyMasjidsModalVisible={setIsNearbyMasjidsModalVisible}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  spinnerView: {},
  container: {
    flex: 1,
    backgroundColor:'#A8E49080'
  },
  Titles: {
    marginTop:'15%',
    alignItems: 'center',
    justifyContent:'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color:'white',
  },
  times1: {
    paddingHorizontal:11,
    marginTop:'7%',
    width: '100%',
    height: '30%',
    // backgroundColor: '#00bfff',
  },
  prayerTimesContainer: {
    width: '100%',
    height: '185%',
    padding: 15,
    borderRadius:36,
    opacity:0.75,
    backgroundColor:'#d8bfd8'
  },
  big: {
    fontSize: 20,
    fontWeight: 'bold',
    color:'white'
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },

  button1: {
    height: 40,
    width: '60%',
    position: 'absolute',
    bottom: '15%',
    left: '5%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal:60,
    borderRadius:80,
    opacity:0.75,
    backgroundColor:'#d8bfd8'
  },
  button2: {
    height: 40,
    width: '60%',
    position: 'absolute',
    bottom: '5%',
    left: '5%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal:60,
    borderRadius:80,
    backgroundColor:'#d8bfd8',
    opacity:0.75
  },
  button2Text: {
    textTransform: 'uppercase',
    color: 'black',
    fontWeight:"bold",
    fontSize:19,
  },
  button2TextView: {},
  timesView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  times: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    color: 'black',
  },
});
