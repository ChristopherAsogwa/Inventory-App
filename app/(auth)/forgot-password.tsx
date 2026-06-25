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

type ForgotView = 'email' | 'reset';

const ForgotPassword = () => {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const posthog = usePostHog();

  // ── View state ───────────────────────────────────────────────────────────────
  const [view, setView] = useState<ForgotView>('email');

  // ── Field state ──────────────────────────────────────────────────────────────
  const [emailAddress, setEmailAddress] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── Touched state (errors only shown after interaction) ──────────────────────
  const [emailTouched, setEmailTouched] = useState(false);
  const [codeTouched, setCodeTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // ── Inline field errors ──────────────────────────────────────────────────────
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ── Derived validation ───────────────────────────────────────────────────────
  const emailFormatValid =
    emailAddress.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  const emailReady = emailAddress.length > 0 && emailFormatValid;
  const codeReady = code.length === 6;
  const passwordLengthValid = password.length === 0 || password.length >= 8;
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;
  const resetReady =
    codeReady &&
    password.length >= 8 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  // ── Step 1: identify user + send reset code ──────────────────────────────────
  // Uses the v3 @clerk/expo API:
  //   signIn.create({ identifier }) — initialises the sign-in with the user's email
  //   signIn.resetPasswordEmailCode.sendCode() — emails the 6-digit reset code
  const handleRequestCode = async () => {
    if (!emailReady || !signIn) return;
    setEmailError('');

    const { error: createError } = await signIn.create({ identifier: emailAddress });
    if (createError) {
      setEmailError(createError.message);
      return;
    }

    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) {
      setEmailError(sendError.message);
      return;
    }

    posthog.capture('password_reset_requested');
    setView('reset');
  };

  // ── Step 2: verify code then submit new password ─────────────────────────────
  // Uses the v3 @clerk/expo API:
  //   signIn.resetPasswordEmailCode.verifyCode({ code }) — checks the 6-digit code,
  //     moves status to 'needs_new_password'
  //   signIn.resetPasswordEmailCode.submitPassword({ password }) — sets the new
  //     password, moves status to 'complete'
  //   signIn.finalize({ navigate }) — creates the session and navigates
  const handleReset = async () => {
    if (!resetReady || !signIn) return;
    setCodeError('');
    setPasswordError('');

    const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (verifyError) {
      setCodeError(verifyError.message);
      return;
    }

    const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({ password });
    if (submitError) {
      setPasswordError(submitError.message);
      return;
    }

    posthog.capture('password_reset_complete');

    await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl('/(tabs)');
        if (url.startsWith('http')) {
          router.replace('/(tabs)' as Href);
        } else {
          router.replace(url as Href);
        }
      },
    });
  };

  // ── VIEW 1: Email entry ──────────────────────────────────────────────────────
  if (view === 'email') {
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
                    <Text className="auth-wordmark">Inventory</Text>
                    <Text className="auth-wordmark-sub">STOCK MANAGER</Text>
                  </View>
                </View>
                <Text className="auth-title">Forgot password?</Text>
                <Text className="auth-subtitle">
                  Enter your email and we'll send you a reset code
                </Text>
              </View>

              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Email Address</Text>
                    <TextInput
                      className={`auth-input ${(emailTouched && !emailFormatValid) || emailError ? 'auth-input-error' : ''}`}
                      autoCapitalize="none"
                      value={emailAddress}
                      placeholder="name@example.com"
                      placeholderTextColor="rgba(15, 23, 42, 0.35)"
                      onChangeText={(t) => {
                        setEmailAddress(t);
                        setEmailError('');
                      }}
                      onBlur={() => setEmailTouched(true)}
                      keyboardType="email-address"
                      autoComplete="email"
                    />
                    {emailTouched && !emailFormatValid && !emailError && (
                      <Text className="auth-error">Please enter a valid email address</Text>
                    )}
                    {emailError ? <Text className="auth-error">{emailError}</Text> : null}
                  </View>

                  <Pressable
                    className={`auth-button ${(!emailReady || fetchStatus === 'fetching') ? 'auth-button-disabled' : ''}`}
                    onPress={handleRequestCode}
                    disabled={!emailReady || fetchStatus === 'fetching'}
                  >
                    <Text className="auth-button-text">
                      {fetchStatus === 'fetching' ? 'Sending…' : 'Send Reset Code'}
                    </Text>
                  </Pressable>

                  <View className="auth-link-row">
                    <Text className="auth-link-copy">Remember your password?</Text>
                    <Link href={"/(auth)/sign-in" as Href} asChild>
                      <Pressable disabled={fetchStatus === 'fetching'}>
                        <Text className="auth-link">Sign In</Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── VIEW 2: Code + new password ──────────────────────────────────────────────
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
                  <Text className="auth-wordmark">Inventory</Text>
                  <Text className="auth-wordmark-sub">STOCK MANAGER</Text>
                </View>
              </View>
              <Text className="auth-title">Reset your password</Text>
              <Text className="auth-subtitle">
                Check {emailAddress} for the 6-digit code
              </Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                {/* Reset code */}
                <View className="auth-field">
                  <Text className="auth-label">Reset Code</Text>
                  <TextInput
                    className={`auth-input ${(codeTouched && !codeReady) || codeError ? 'auth-input-error' : ''}`}
                    value={code}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="rgba(15, 23, 42, 0.35)"
                    onChangeText={(t) => {
                      setCode(t);
                      setCodeError('');
                    }}
                    onBlur={() => setCodeTouched(true)}
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    maxLength={6}
                  />
                  {codeTouched && !codeReady && !codeError && (
                    <Text className="auth-error">Enter the 6-digit code from your email</Text>
                  )}
                  {codeError ? <Text className="auth-error">{codeError}</Text> : null}
                </View>

                {/* New password */}
                <View className="auth-field">
                  <Text className="auth-label">New Password</Text>
                  <TextInput
                    className={`auth-input ${(passwordTouched && !passwordLengthValid) || passwordError ? 'auth-input-error' : ''}`}
                    value={password}
                    placeholder="Create a strong password"
                    placeholderTextColor="rgba(15, 23, 42, 0.35)"
                    secureTextEntry
                    onChangeText={(t) => {
                      setPassword(t);
                      setPasswordError('');
                    }}
                    onBlur={() => setPasswordTouched(true)}
                    autoComplete="password-new"
                  />
                  {passwordTouched && !passwordLengthValid && (
                    <Text className="auth-error">Password must be at least 8 characters</Text>
                  )}
                  {passwordError ? <Text className="auth-error">{passwordError}</Text> : null}
                  {!passwordTouched && (
                    <Text className="auth-helper">Minimum 8 characters required</Text>
                  )}
                </View>

                {/* Confirm password */}
                <View className="auth-field">
                  <Text className="auth-label">Confirm Password</Text>
                  <TextInput
                    className={`auth-input ${confirmPasswordTouched && !passwordsMatch ? 'auth-input-error' : ''}`}
                    value={confirmPassword}
                    placeholder="Repeat your new password"
                    placeholderTextColor="rgba(15, 23, 42, 0.35)"
                    secureTextEntry
                    onChangeText={setConfirmPassword}
                    onBlur={() => setConfirmPasswordTouched(true)}
                    autoComplete="password-new"
                  />
                  {confirmPasswordTouched && !passwordsMatch && (
                    <Text className="auth-error">Passwords do not match</Text>
                  )}
                </View>

                <Pressable
                  className={`auth-button ${(!resetReady || fetchStatus === 'fetching') ? 'auth-button-disabled' : ''}`}
                  onPress={handleReset}
                  disabled={!resetReady || fetchStatus === 'fetching'}
                >
                  <Text className="auth-button-text">
                    {fetchStatus === 'fetching' ? 'Resetting…' : 'Reset Password'}
                  </Text>
                </Pressable>

                {/* Resend — goes back to view 1 so user can request a fresh code */}
                <Pressable
                  className="auth-secondary-button"
                  onPress={() => {
                    setView('email');
                    setCode('');
                    setCodeError('');
                    setCodeTouched(false);
                  }}
                  disabled={fetchStatus === 'fetching'}
                >
                  <Text className="auth-secondary-button-text">Resend Code</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
