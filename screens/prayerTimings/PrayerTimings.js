import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  ToastAndroid,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper';
import theme from '../../constants/theme';
import { useMutation, useQuery } from 'react-query';
import Icon from 'react-native-vector-icons/AntDesign';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import dayjs from 'dayjs';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { authentication, database } from '../../database/firebaseDB';
import CustomPrayerTimeModal from '../../components/CustomPrayerTimeModal';
import CustomMessageModal from '../../components/CustomMessageModal';

const mutationFn = payload => {
  if (
    !(
      payload.prayerTimes.fajar &&
      payload.prayerTimes.duhar &&
      payload.prayerTimes.asar &&
      payload.prayerTimes.maghrib &&
      payload.prayerTimes.isha
    )
  ) {
    throw new Error('Please update all prayer times!');
  } else {
    const currentTime = dayjs();
    const fajar = dayjs(payload.prayerTimes.fajar)
      .set('date', parseInt(dayjs(currentTime).format('D'), 10))
      .set('month', parseInt(dayjs(currentTime).format('M') - 1, 10))
      .set('year', parseInt(dayjs(currentTime).format('YYYY'), 10));
    const duhar = dayjs(payload.prayerTimes.duhar)
      .set('date', parseInt(dayjs(currentTime).format('D'), 10))
      .set('month', parseInt(dayjs(currentTime).format('M') - 1, 10))
      .set('year', parseInt(dayjs(currentTime).format('YYYY'), 10));
    const asar = dayjs(payload.prayerTimes.asar)
      .set('date', parseInt(dayjs(currentTime).format('D'), 10))
      .set('month', parseInt(dayjs(currentTime).format('M') - 1, 10))
      .set('year', parseInt(dayjs(currentTime).format('YYYY'), 10));
    const maghrib = dayjs(payload.prayerTimes.maghrib)
      .set('date', parseInt(dayjs(currentTime).format('D'), 10))
      .set('month', parseInt(dayjs(currentTime).format('M') - 1, 10))
      .set('year', parseInt(dayjs(currentTime).format('YYYY'), 10));
    const isha = dayjs(payload.prayerTimes.isha)
      .set('date', parseInt(dayjs(currentTime).format('D'), 10))
      .set('month', parseInt(dayjs(currentTime).format('M') - 1, 10))
      .set('year', parseInt(dayjs(currentTime).format('YYYY'), 10));

    const fajarCondition =
      fajar.isBefore(duhar) &&
      fajar.isBefore(asar) &&
      fajar.isBefore(maghrib) &&
      fajar.isBefore(isha);

    const duharCondition =
      duhar.isAfter(fajar) &&
      duhar.isBefore(asar) &&
      duhar.isBefore(maghrib) &&
      duhar.isBefore(isha);

    const asarCondition =
      asar.isAfter(fajar) && asar.isAfter(duhar) && asar.isBefore(maghrib) && asar.isBefore(isha);

    const maghribCondition =
      maghrib.isAfter(fajar) &&
      maghrib.isAfter(duhar) &&
      maghrib.isAfter(asar) &&
      maghrib.isBefore(isha);

    const ishaCondition =
      isha.isAfter(fajar) && isha.isAfter(duhar) && isha.isAfter(asar) && isha.isAfter(maghrib);

    if (!(fajarCondition && duharCondition && asarCondition && maghribCondition && ishaCondition)) {
      throw new Error('Timings not matched!');
    } else {
      return new Promise((resolve, reject) => {
        getDoc(doc(database, 'users', authentication.currentUser.uid))
          .then(res => {
            updateDoc(doc(database, 'masjids', res.data().masjid), {
              prayerTimes: { ...payload.prayerTimes, customPrayers: payload.customPrayers },
              customMessage: payload.customMessage,
            })
              .then(() => {
                resolve();
              })
              .catch(err => reject(err));
          })
          .catch(err => reject(err));
      });
    }
  }
};

const queryFn = () => {
  return new Promise((resolve, reject) => {
    getDoc(doc(database, 'users', authentication.currentUser.uid))
      .then(res =>
        getDoc(doc(database, 'masjids', res.data().masjid))
          .then(doc => {
            resolve(doc.data());
          })
          .catch(err => reject(err)),
      )
      .catch(err => reject(err));
  });
};
const PrayerTimings = () => {
  const [isFajarDatePickerVisible, setIsFajarDatePickerVisible] = useState(false);
  const [isDuharDatePickerVisible, setIsDuharDatePickerVisible] = useState(false);
  const [isAsarDatePickerVisible, setIsAsarDatePickerVisible] = useState(false);
  const [isMaghribDatePickerVisible, setIsMaghribDatePickerVisible] = useState(false);
  const [isIshaDatePickerVisible, setIsIshaDatePickerVisible] = useState(false);
  const [isCustomPrayerTimeModalVisible, setIsCustomPrayerTimeModalVisible] = useState(false);
  const [isCustomMessageModalVisible, setIsCustomMessageModalVisible] = useState(false);
  const [fajar, setFajar] = useState(null);
  const [duhar, setDuhar] = useState(null);
  const [asar, setAsar] = useState(null);
  const [maghrib, setMaghrib] = useState(null);
  const [isha, setIsha] = useState(null);
  const [customPrayers, setCustomPrayers] = useState([]);
  const [customMessage, setCustomMessage] = useState('custom message');

  const query = useQuery(['getPrayerTimes'], queryFn, {
    onSuccess: res => {
      if (res.prayerTimes) {
        const { fajar, duhar, asar, maghrib, isha } = res.prayerTimes;
        setFajar(fajar?.toDate() || null);
        setDuhar(duhar?.toDate() || null);
        setAsar(asar?.toDate() || null);
        setMaghrib(maghrib?.toDate() || null);
        setIsha(isha?.toDate() || null);
        if (res.prayerTimes.customPrayers) {
          const queriedCustomPrayerTimes = res.prayerTimes.customPrayers.map($customPrayer => {
            return {
              ...$customPrayer,
              prayerTime: $customPrayer.prayerTime.toDate(),
            };
          });
          setCustomPrayers(queriedCustomPrayerTimes);
        }
      }
      if (res.customMessage) setCustomMessage(res.customMessage);
    },
    onError: err => {
      ToastAndroid.show(err.message || 'error', ToastAndroid.LONG);
    },
  });

  const mutation = useMutation(
    mutationFn,
    {
      onSuccess: res => {
        Alert.alert('Updated', 'Prayer times successfully updated');
      },
      onError: err => {
        ToastAndroid.show(err.message || 'error', ToastAndroid.LONG);
      },
    },
    { retry: false },
  );

  const handleUpdateButton = () => {
    mutation.mutate({
      prayerTimes: { fajar, duhar, asar, maghrib, isha },
      customPrayers,
      customMessage,
    });
  };

  return (
    <>
      <ScreenWrapper>
        {query.isLoading ? (
          <View style={styles.spinnerView}>
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          <>
            <View style={styles.container}>
              {/* Title */}
              <View style={styles.title1View}>
                <Text style={styles.title1}>Prayer Times</Text>
              </View>
              <ScrollView style={styles.scrollView}>
                {/* Fajar */}
                <TouchableWithoutFeedback onPress={() => setIsFajarDatePickerVisible(true)}>
                  <View style={styles.inputView}>
                    <View>
                      <Text style={styles.times}>
                        Fajar: {fajar ? dayjs(fajar).format('hh:mm A') : `?`}
                      </Text>
                    </View>
                    <View>
                      <Icon name="edit" size={32} color="white" />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <DateTimePickerModal
                  isVisible={isFajarDatePickerVisible}
                  mode="time"
                  date={fajar ? fajar : new Date()}
                  onConfirm={date => {
                    setFajar(date);
                    setIsFajarDatePickerVisible(false);
                  }}
                  onCancel={() => setIsFajarDatePickerVisible(false)}
                />
                {/* DUHAR */}
                <TouchableWithoutFeedback onPress={() => setIsDuharDatePickerVisible(true)}>
                  <View style={styles.inputView}>
                    <View>
                      <Text style={styles.times}>
                        DUHAR: {duhar ? dayjs(duhar).format('hh:mm A') : `?`}
                      </Text>
                    </View>
                    <View>
                      <Icon name="edit" size={32} color="white" />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <DateTimePickerModal
                  isVisible={isDuharDatePickerVisible}
                  mode="time"
                  date={duhar ? duhar : new Date()}
                  onConfirm={date => {
                    setDuhar(date);
                    setIsDuharDatePickerVisible(false);
                  }}
                  onCancel={() => setIsDuharDatePickerVisible(false)}
                />
                {/* ASAR */}
                <TouchableWithoutFeedback onPress={() => setIsAsarDatePickerVisible(true)}>
                  <View style={styles.inputView}>
                    <View>
                      <Text style={styles.times}>
                        ASAR: {asar ? dayjs(asar).format('hh:mm A') : `?`}
                      </Text>
                    </View>
                    <View>
                      <Icon name="edit" size={32} color="white" />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <DateTimePickerModal
                  isVisible={isAsarDatePickerVisible}
                  mode="time"
                  date={asar ? asar : new Date()}
                  onConfirm={date => {
                    setAsar(date);
                    setIsAsarDatePickerVisible(false);
                  }}
                  onCancel={() => setIsAsarDatePickerVisible(false)}
                />
                {/* MAGRIB */}
                <TouchableWithoutFeedback onPress={() => setIsMaghribDatePickerVisible(true)}>
                  <View style={styles.inputView}>
                    <View>
                      <Text style={styles.times}>
                        MAGRIB: {maghrib ? dayjs(maghrib).format('hh:mm A') : `?`}
                      </Text>
                    </View>
                    <View>
                      <Icon name="edit" size={32} color="white" />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <DateTimePickerModal
                  isVisible={isMaghribDatePickerVisible}
                  mode="time"
                  date={maghrib ? maghrib : new Date()}
                  onConfirm={date => {
                    setMaghrib(date);
                    setIsMaghribDatePickerVisible(false);
                  }}
                  onCancel={() => setIsMaghribDatePickerVisible(false)}
                />
                {/* ISHA */}
                <TouchableWithoutFeedback onPress={() => setIsIshaDatePickerVisible(true)}>
                  <View style={styles.inputView}>
                    <View>
                      <Text style={styles.times}>
                        ISHA: {isha ? dayjs(isha).format('hh:mm A') : `?`}
                      </Text>
                    </View>
                    <View>
                      <Icon name="edit" size={32} color="white" />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <DateTimePickerModal
                  isVisible={isIshaDatePickerVisible}
                  mode="time"
                  date={isha ? isha : new Date()}
                  onConfirm={date => {
                    setIsha(date);
                    setIsIshaDatePickerVisible(false);
                  }}
                  onCancel={() => setIsIshaDatePickerVisible(false)}
                />

                {/* Custom Prayer Button */}
                <TouchableWithoutFeedback onPress={() => setIsCustomPrayerTimeModalVisible(true)}>
                  <View style={styles.inputView}>
                    <View>
                      <Text style={styles.times}>custom prayer time</Text>
                    </View>
                    <View>
                      <Icon name="right" size={32} color="white" />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <CustomPrayerTimeModal
                  mode="edit"
                  isCustomPrayerTimeModalVisible={isCustomPrayerTimeModalVisible}
                  setIsCustomPrayerTimeModalVisible={setIsCustomPrayerTimeModalVisible}
                  customPrayers={customPrayers}
                  setCustomPrayers={setCustomPrayers}
                />
                {/* Custom Message Button */}
                <TouchableWithoutFeedback onPress={() => setIsCustomMessageModalVisible(true)}>
                  <View style={styles.inputView}>
                    <View>
                      <Text style={styles.times}>custom message</Text>
                    </View>
                    <View>
                      <Icon name="right" size={32} color="white" />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <CustomMessageModal
                  isCustomMessageModalVisible={isCustomMessageModalVisible}
                  setIsCustomMessageModalVisible={setIsCustomMessageModalVisible}
                  customMessage={customMessage}
                  setCustomMessage={setCustomMessage}
                />
              </ScrollView>
            </View>
            {/* Update Button */}
            <TouchableWithoutFeedback onPress={handleUpdateButton}>
              <View style={styles.updateButtonView}>
                {mutation.isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.buttonText}>Update Time</Text>
                )}
              </View>
            </TouchableWithoutFeedback>
          </>
        )}
      </ScreenWrapper>
    </>
  );
};
const styles = StyleSheet.create({
  spinnerView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height:'100%',
    width:'80%',
    //backgroundColor: 'aqua',
  },
  inputView: {
    //backgroundColor: theme.background,
    height: 56,
    maxHeight: 56,
    width: '100%',
    maxWidth: Dimensions.get('screen').width - 60,
    marginBottom: 20,
    borderRadius: theme.borderRadius,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  scrollView: {
    backgroundColor: theme.scrollViewBackground,
    maxHeight: Dimensions.get('screen').height - 300,
    contentContainer: {
      paddingVertical: 20,
    },
    width: '95%',
  },
  times: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
    //margin:'2%',
    color: 'white',
    textTransform: 'uppercase',
  },
  setTimingsView: {
    maxHeight: 40,
    height: 40,
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius,
  },
  textInput: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 16,
    color: theme.inputText,
    width: '100%',

    height: '100%',
  },
  passwordIconView: {
    position: 'absolute',
    right: 0,
    height: '100%',
    width: 60,
    display: 'flex',
    justifyContent: 'center',
  },
  passwordIcon: { position: 'absolute', right: 15 },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height:'100%',

    minHeight: Dimensions.get('screen').height - 170,
    paddingTop: 15,
    // backgroundColor: 'white',
  },
  title1View: {
    // backgroundColor: 'orange',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 40,
    marginBottom: 20,
  },
  title1: {
    fontSize: 23,
    fontWeight: '700',
    color: theme.title,
    textTransform: 'uppercase',
  },
  title2: {
    fontSize: 16,
    fontWeight: '300',
    color: theme.title,
    textTransform: 'uppercase',
  },
  updateButtonView: {
    maxHeight: 40,
    height: 40,
    width: '100%',
    backgroundColor: theme.button,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius,
    position: 'absolute',
    bottom: 3,
    borderRadius:80,
  },
  selectMasjidButtonView: {
    maxHeight: 40,
    width: '100%',
    backgroundColor: theme.button,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius,
    marginBottom: 20,
  },
  buttonText: {
    textTransform: 'uppercase',
    color: theme.buttonText,
  },
});

export default PrayerTimings;
