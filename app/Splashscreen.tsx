import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
 
const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.55;
 
export default function SplashScreen() {
  const logoY = useRef(new Animated.Value(-width)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
 
  useEffect(() => {
    let sound: Audio.Sound | null = null;
 
    async function playSound() {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound: s } = await Audio.Sound.createAsync(
          require('../src/sounds/freesound_community-dishes-88148.mp3')
        );
        sound = s;
        await sound.playAsync();
      } catch (e) {
        console.log('Erro ao tocar som:', e);
      }
    }
 
    function startAnimations() {

      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(logoY, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
 

        Animated.sequence([
          Animated.timing(logoY, {
            toValue: -60,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(logoY, {
            toValue: 0,
            duration: 280,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
 

          Animated.timing(logoY, {
            toValue: -28,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(logoY, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(() => {

          Animated.parallel([
            Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(textY, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
          ]).start();
 

          setTimeout(() => {
            Animated.timing(screenOpacity, {
              toValue: 0,
              duration: 500,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }).start(() => {
              router.replace('/login');
            });
          }, 2000);
        });
      });
    }
 
    playSound();
    startAnimations();
 
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);
 
  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar hidden />
 
      <Animated.View style={{
        opacity: logoOpacity,
        transform: [{ translateY: logoY }],
      }}>
        <Image
          source={require('../src/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
 
      <Animated.View style={{
        opacity: textOpacity,
        transform: [{ translateY: textY }],
        alignItems: 'center',
      }}>
        <Text style={styles.appName}>
          Nutri<Text style={styles.plus}>+</Text>
        </Text>
        <Text style={styles.tagline}>Sua nutrição inteligente</Text>
      </Animated.View>
 
    </Animated.View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  appName: {
    fontSize: 44,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: -1,
  },
  plus: {
    color: '#6BBF3E',
  },
  tagline: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});