
import {View, StyleSheet, ToastAndroid, Alert,} from 'react-native';
import React, { useState, useEffect } from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import {
    Avatar,
    Drawer,
} from 'react-native-paper';

import Icon from 'react-native-vector-icons/FontAwesome';
import backgroundImage from'../../assets/icon.png';
import { useMutation } from 'react-query';
import { signOut } from 'firebase/auth';
import { authentication } from '../../database/firebaseDB';

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









export function DrawerContentuser(props) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = authentication.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);


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






  
    return(
        <View style={{flex:1}}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <View style={styles.userInfoSection}>
                        <View>
                            <Avatar.Image
                            source={backgroundImage}
                            ></Avatar.Image>
                        </View>

                    </View>
                    <Drawer.Section style={styles.drawerSection}>
                    <DrawerItem 
                            icon={({color, size}) => (
                                <Icon 
                                name="home" 
                                color={color}
                                size={size}
                                />
                            )}
                            label="Home"
                            onPress={() => {props.navigation.navigate('Home')}}
                        />
                        <DrawerItem 
                            icon={({color, size}) => (
                                <Icon 
                                name="map-signs" 
                                color={color}
                                size={size}
                                />
                            )}
                            label="Maps"
                            onPress={() => {props.navigation.navigate('Maps')}}
                        />
                         <DrawerItem 
                            icon={({color, size}) => (
                                <Icon 
                                name="file" 
                                color={color}
                                size={size}
                                />
                            )}
                            label="Prayer Times"
                            onPress={() => {props.navigation.navigate('Prayer Time')}}
                        />
                        <DrawerItem 
                            icon={({color, size}) => (
                                <Icon 
                                name="sign-out" 
                                color={color}
                                size={size}
                                />
                            )}
                            label="Logout"
                            onPress={handleSignOut}
                        />
                        
                    </Drawer.Section>
                    
                    
                </View>


            </DrawerContentScrollView>
            




          
          
          
          
          
          
          
          
          
            {/* <DrawerItem 
                    icon={({color, size}) => (
                        <Icon 
                        name="exit-to-app" 
                        color={color}
                        size={size}
                        />
                    )}
                    label="Sign Out"
                    
                />         */}
           
        </View>
    );
}


const styles = StyleSheet.create({
    drawerContent: {
      flex: 1,
    },
    userInfoSection: {
      paddingLeft: 20,
    },
    title: {
      fontSize: 16,
      marginTop: 3,
      fontWeight: 'bold',
    },
    caption: {
      fontSize: 14,
      lineHeight: 14,
    },
    row: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    section: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 15,
    },
    paragraph: {
      fontWeight: 'bold',
      marginRight: 3,
    },
    drawerSection: {
      marginTop: 15,
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: '#f4f4f4',
        borderTopWidth: 1
    },
    preference: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  });

