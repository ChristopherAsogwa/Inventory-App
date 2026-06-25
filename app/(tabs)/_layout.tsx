import { Tabs, Redirect } from 'expo-router';
import { View, Image, Text, Platform } from 'react-native';
import { useAuth } from '@clerk/expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import clsx from 'clsx';
import { tabs } from '@/constants/data';
import { colors, components, shadow } from '@/constants/theme';
import { useStoreStore } from '../../src/store/useStoreStore';

const tabBar = components.tabBar;

const TabIcon = ({ focused, icon, iconChar, title }: TabIconProps) => (
  <View style={{ alignItems: 'center', flexDirection: 'column', gap: 2 }}>
    <View className={clsx('tabs-pill', focused && 'tabs-active')}>
      {icon ? (
        <Image source={icon} resizeMode="contain" className="tabs-glyph" />
      ) : (
        <Text style={{ fontSize: 17, color: focused ? '#ffffff' : 'rgba(255,255,255,0.55)' }}>
          {iconChar ?? ''}
        </Text>
      )}
    </View>
    <Text
      style={{
        fontSize: 10,
        fontFamily: 'sans-medium',
        color: focused ? '#ffffff' : 'rgba(255,255,255,0.55)',
      }}
      numberOfLines={1}
    >
      {title}
    </Text>
  </View>
);

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isOnboarded, isLoaded: storeLoaded } = useStoreStore();
  const insets = useSafeAreaInsets();

  if (!isLoaded || !storeLoaded) return null;

  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  if (!isOnboarded) return <Redirect href="/onboarding" />;

  // On Android with gesture nav the system inset can be 0 — ensure minimum clearance
  const tabBarBottom = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? 8 : 0,
    tabBar.horizontalInset,
  );

  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: tabBarBottom,
            height: tabBar.height,
            marginHorizontal: tabBar.horizontalInset,
            borderRadius: tabBar.radius,
            backgroundColor: colors.primary,
            borderTopWidth: 0,
            elevation: 0,
            ...shadow.lg,
          },
          tabBarItemStyle: {
            paddingVertical: 10,
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarIconStyle: {
            width: 32,
            height: 32,
            alignItems: 'center',
          },
        }}
      >
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={tab.icon} iconChar={tab.iconChar} title={tab.title} />,
            }}
          />
        ))}
      </Tabs>
    </>
  );
}
