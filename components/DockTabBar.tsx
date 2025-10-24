import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, TouchableOpacity, View } from 'react-native';


// Import tab bar icons
const tabIcons = {
  'index': require('../assets/home-icons/home.png'),
  'chat': require('../assets/home-icons/chat.png'),
  'reports': require('../assets/home-icons/reports.png'),
  'profile': require('../assets/home-icons/profile.png'),
};


// Theme colors provided by the user (mapped)
const dockColors = {
  white: '#FFFFFF',
  bluePrimary: '#2652F9',
  iconInactive: '#000000',
  lightGray: '#666666',
  midGray: '#4A4A4D',
  deepBlue: '#032EA6'
};


export default function DockTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Animated values per route to control label visibility/translation
  const animRef = useRef<Animated.Value[]>([]);
  const scaleAnimRef = useRef<Animated.Value[]>([]);


  // ensure array length matches routes
  if (animRef.current.length !== state.routes.length) {
    animRef.current = state.routes.map(() => new Animated.Value(0));
  }
  
  if (scaleAnimRef.current.length !== state.routes.length) {
    scaleAnimRef.current = state.routes.map(() => new Animated.Value(1));
  }


  useEffect(() => {
    // animate each label and icon scale: focused -> 1, others -> 0
    state.routes.forEach((_, idx) => {
      const isFocused = state.index === idx;
      const toValue = isFocused ? 1 : 0;
      const scaleValue = isFocused ? 1.1 : 1;
      
      // Label opacity animation
      Animated.timing(animRef.current[idx], {
        toValue,
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start();
      
      // Icon scale animation with spring
      Animated.spring(scaleAnimRef.current[idx], {
        toValue: scaleValue,
        useNativeDriver: true,
        tension: 80,
        friction: 7,
      }).start();
    });
  }, [state.index, state.routes]);


  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.dock}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? (options.tabBarLabel as string)
              : options.title !== undefined
              ? options.title
              : route.name;


          const isFocused = state.index === index;


          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };


          // animated styles for expanding container and label inside it
          const anim = animRef.current[index] || new Animated.Value(0);
          const scaleAnim = scaleAnimRef.current[index] || new Animated.Value(1);
          const opacity = anim;


          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel as any}
              testID={(options as any).tabBarTestID}
              onPress={onPress}
              style={styles.item}
              key={route.key}
              activeOpacity={0.9}
            >
              <View style={[styles.expandingContainer, isFocused && styles.expandingContainerActive]}>
                {isFocused && (
                  <LinearGradient
                    colors={['#2652F9', '#032EA6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Animated.View 
                  style={[
                    styles.iconWrap,
                    { transform: [{ scale: scaleAnim }] }
                  ]}
                >
                  <Image
                    source={tabIcons[route.name as keyof typeof tabIcons]}
                    style={[
                      styles.tabIcon,
                      { marginLeft: isFocused ? -2 : 0 }
                    ]}
                    resizeMode="contain"
                  />
                </Animated.View>


                {isFocused && (
                  <Animated.Text
                    numberOfLines={1}
                    style={[styles.innerLabel, { opacity: opacity }]}
                  >
                    {label}
                  </Animated.Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  tabIcon: {
    width: 22,
    height: 22,
  },
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EAEE',
    paddingVertical: 8,
  },
  dock: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    height: 48,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    color: dockColors.lightGray,
    fontFamily: 'Inter-Regular',
  },
  labelActive: {
    color: dockColors.white,
    fontFamily: 'Inter-SemiBold',
  },
  // expanding container holds icon + label when focused
  expandingContainer: {
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  expandingContainerActive: {
    width: 135,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 24,
    shadowColor: "#2652F9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  innerLabel: {
    marginLeft: 8,
    color: dockColors.white,
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});
