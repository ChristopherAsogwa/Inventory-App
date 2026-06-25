import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, useRouter, type Href } from 'expo-router';
import { useSignIn } from '@clerk/expo';
import { useState } from 'react';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
import AppLogo from '../../src/components/AppLogo';

const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailValid =
    emailAddress.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  const passwordValid = password.length > 0;
  const formValid = emailAddress.length > 0 && password.length > 0 && emailValid;

  const handleSubmit = async () => {
    if (!formValid) return;

    const { error } = await signIn.password({ emailAddress, password });

    if (error) {
      posthog.capture('user_sign_in_failed', { error_message: error.message });
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;

          posthog.identify(emailAddress, {
            $set: { email: emailAddress },
            $set_once: { first_sign_in_date: new Date().toISOString() },
          });
          posthog.capture('user_signed_in', { email: emailAddress });

          const url = decorateUrl('/(tabs)');
          if (url.startsWith('http')) {
            if (typeof window !== 'undefined' && window.location) {
              window.location.href = url;
            } else {
              router.replace('/(tabs)' as Href);
            }
          } else {
            router.replace(url as Href);
          }
        },
      });
    } else if (signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (f) => f.strategy === 'email_code',
      );
      if (emailCodeFactor) await signIn.mfa.sendEmailCode();
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;

          posthog.identify(emailAddress, {
            $set: { email: emailAddress },
            $set_once: { first_sign_in_date: new Date().toISOString() },
          });
          posthog.capture('user_signed_in', { email: emailAddress });

          const url = decorateUrl('/(tabs)');
          if (url.startsWith('http')) {
            if (typeof window !== 'undefined' && window.location) {
              window.location.href = url;
            } else {
              router.replace('/(tabs)' as Href);
            }
          } else {
            router.replace(url as Href);
          }
        },
      });
    }
  };

  // ── Client-trust verification screen ─────────────────────────────────────
  if (signIn.status === 'needs_client_trust') {
    return (
      <SafeAreaView className="auth-safe-area">
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="auth-screen"
        >
          <ScrollView
            className="auth-scroll"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-content">
              <View className="auth-brand-block">
                <View className="auth-logo-wrap">
                  <View className="auth-logo-mark">
                    <AppLogo size={36} color="#ffffff" />
                  </View>
                  <View>
                    <Text className="auth-wordmark">Intellica Inventory</Text>
                    <Text className="auth-wordmark-sub">INVENTORY</Text>
                  </View>
                </View>
                <Text className="auth-title">Verify your identity</Text>
                <Text className="auth-subtitle">
                  We sent a verification code to your email
                </Text>
              </View>

              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification Code</Text>
                    <TextInput
                      className="auth-input"
                      value={code}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(15, 23, 42, 0.35)"
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      autoComplete="one-time-code"
                      maxLength={6}
                    />
                    {errors.fields.code && (
                      <Text className="auth-error">{errors.fields.code.message}</Text>
                    )}
                  </View>

                  <Pressable
                    className={`auth-button ${(!code || fetchStatus === 'fetching') && 'auth-button-disabled'}`}
                    onPress={handleVerify}
                    disabled={!code || fetchStatus === 'fetching'}
                  >
                    <Text className="auth-button-text">
                      {fetchStatus === 'fetching' ? 'Verifying...' : 'Verify'}
                    </Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signIn.mfa.sendEmailCode()}
                    disabled={fetchStatus === 'fetching'}
                  >
                    <Text className="auth-secondary-button-text">Resend Code</Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signIn.reset()}
                    disabled={fetchStatus === 'fetching'}
                  >
                    <Text className="auth-secondary-button-text">Start Over</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Main sign-in form ─────────────────────────────────────────────────────
  return (
    <SafeAreaView className="auth-safe-area">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">I</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Inventory</Text>
                  <Text className="auth-wordmark-sub">STOCK MANAGER</Text>
                </View>
              </View>
              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to manage your stock and track sales
              </Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email Address</Text>
                  <TextInput
                    className={`auth-input ${emailTouched && !emailValid ? 'auth-input-error' : ''}`}
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="name@example.com"
                    placeholderTextColor="rgba(15, 23, 42, 0.35)"
                    onChangeText={setEmailAddress}
                    onBlur={() => setEmailTouched(true)}
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                  {emailTouched && !emailValid && (
                    <Text className="auth-error">Please enter a valid email address</Text>
                  )}
                  {errors.fields.identifier && (
                    <Text className="auth-error">{errors.fields.identifier.message}</Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input ${passwordTouched && !passwordValid ? 'auth-input-error' : ''}`}
                    value={password}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(15, 23, 42, 0.35)"
                    secureTextEntry
                    onChangeText={setPassword}
                    onBlur={() => setPasswordTouched(true)}
                    autoComplete="password"
                  />
                  {passwordTouched && !passwordValid && (
                    <Text className="auth-error">Password is required</Text>
                  )}
                  {errors.fields.password && (
                    <Text className="auth-error">{errors.fields.password.message}</Text>
                  )}
                </View>

                <Pressable
                  className={`auth-button ${(!formValid || fetchStatus === 'fetching') ? 'auth-button-disabled' : ''}`}
                  onPress={handleSubmit}
                  disabled={!formValid || fetchStatus === 'fetching'}
                >
                  <Text className="auth-button-text">
                    {fetchStatus === 'fetching' ? 'Signing In...' : 'Sign In'}
                  </Text>
                </Pressable>

                <View className="auth-link-row">
                  <Text className="auth-link-copy">Forgot your password?</Text>
                  <Link href={"/(auth)/forgot-password" as Href} asChild>
                    <Pressable>
                      <Text className="auth-link">Reset it</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Don't have an account?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text className="auth-link">Create Account</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
