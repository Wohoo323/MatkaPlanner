import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

function TabBarButton(props: BottomTabBarButtonProps) {
  const selected = props.accessibilityState?.selected;

  return (
    <PlatformPressable
      {...props}
      android_ripple={{ color: 'transparent' }}
      style={[
        props.style,
        styles.tabButton,
        selected && styles.activeTabButton,
      ]}
    />
  );
}

type TabIconProps = {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
};

function TabIcon({ icon, activeIcon, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabContent}>
      <View style={[styles.iconBubble, focused && styles.activeIconBubble]}>
        <Ionicons
          name={focused ? activeIcon : icon}
          size={focused ? 29 : 28}
          color={focused ? '#6C4DFF' : '#506070'}
        />
      </View>

      <Text style={[styles.tabText, focused && styles.activeTabText]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarButton: TabBarButton,

        tabBarActiveTintColor: '#6C4DFF',
        tabBarInactiveTintColor: '#9CA3AF',

        tabBarShowLabel: false,

        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          position: 'absolute',

          left: 0,
          right: 0,
          bottom: 0,

          backgroundColor: '#FFFFFF',

          borderTopWidth: 1,
          borderTopColor: '#E8ECF3',

          elevation: 10,

          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: {
            width: 0,
            height: -4,
          },

          height: Platform.OS === 'android' ? 90 : 96,

          paddingHorizontal: 6,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'android' ? 22 : 28,

          borderRadius: 0,
        },

        tabBarItemStyle: {
          backgroundColor: 'transparent',
          height: 62,
          marginBottom: Platform.OS === 'android' ? 10 : 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="home-outline"
              activeIcon="home"
              label="Koti"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="compass-outline"
              activeIcon="compass"
              label="Inspiroidu"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="my-trips"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="bookmark-outline"
              activeIcon="bookmark"
              label="Matkat"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    borderRadius: 0,
  },

  activeTabButton: {
    backgroundColor: '#FFFFFF',
  },

  tabContent: {
    height: 60,
    minWidth: 68,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  iconBubble: {
    width: 36,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeIconBubble: {
    transform: [{ translateY: -1 }],
  },

  tabText: {
    color: '#506070',
    fontSize: 12,
    fontWeight: '800',
  },

  activeTabText: {
    color: '#5B3DF5',
    fontWeight: '900',
  },
});
