import { useEffect, useRef } from 'react';
import { StyleSheet, Text, Dimensions, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppLogo from './AppLogo';

const { width, height } = Dimensions.get('screen');

interface AnimatedSplashProps {
  onFinish: () => void;
}

/**
 * Full-screen animated splash overlay using React Native's built-in Animated API.
 * Works in Expo Go, EAS builds, and custom dev clients without needing Reanimated worklets.
 *
 * Sequence (~1 900 ms total):
 *  0 ms     — logo + name invisible (opacity 0, scale 0.55)
 *  0→450    — logo scales in + fades in
 *  500→780  — app name fades in
 *  780→1350 — hold at full opacity
 *  1350→1750 — whole overlay fades out
 *  1750 ms  — onFinish() fires
 */
export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.55)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Phase 1: logo appears
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      // Phase 2: app name fades in
      Animated.timing(nameOpacity, {
        toValue: 1,
        duration: 280,
        delay: 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Phase 3: hold
      Animated.delay(570),
      // Phase 4: whole screen fades out
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <StatusBar style="light" />

      {/* Logo mark */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <AppLogo size={108} color="#ffffff" />
      </Animated.View>

      {/* App name */}
      <Animated.View style={[styles.nameWrap, { opacity: nameOpacity }]}>
        <Text style={styles.wordmark}>Intellica Inventory</Text>
        <Text style={styles.tagline}>INVENTORY</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  nameWrap: {
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: 'sans-extrabold',
    fontSize: 28,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontFamily: 'sans-semibold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 3,
    marginTop: 4,
  },
});
