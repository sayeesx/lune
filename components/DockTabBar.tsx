import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';

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

  // ensure array length matches routes
  if (animRef.current.length !== state.routes.length) {
    animRef.current = state.routes.map(() => new Animated.Value(0));
  }

  useEffect(() => {
    // animate each label: focused -> 1, others -> 0
    state.routes.forEach((_, idx) => {
      const toValue = state.index === idx ? 1 : 0;
      Animated.timing(animRef.current[idx], {
        toValue,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
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

          const iconName = (() => {
            switch (route.name) {
              case 'index':
                return isFocused ? 'home' : 'home-outline';
              case 'chat':
                return isFocused ? 'chatbubbles' : 'chatbubbles-outline';
              case 'reports':
                return isFocused ? 'document-text' : 'document-text-outline';
              case 'profile':
                return isFocused ? 'person' : 'person-outline';
              default:
                return 'ellipse-outline';
            }
          })();

          // animated styles for expanding container and label inside it
          const anim = animRef.current[index] || new Animated.Value(0);
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
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        shadowColor: "#2652F9",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.4,
                        shadowRadius: 6,
                        elevation: 12
                      }
                    ]}
                  />
                )}
                <View style={styles.iconWrap}>
                  <Ionicons 
                    name={iconName as any} 
                    size={22} 
                    color={isFocused ? dockColors.white : dockColors.iconInactive}
                    style={{ marginLeft: isFocused ? -2 : 0 }}
                  />
                </View>

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
  // label that appears to the left of the icon
  labelContainer: {
    position: 'absolute',
    left: -110,
    width: 96,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 8,
  },
  sideLabel: {
    color: dockColors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapActive: {
    backgroundColor: dockColors.bluePrimary,
    transform: [{ scale: 1.08 }],
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    color: dockColors.lightGray,
  },
  labelActive: {
    color: dockColors.white,
    fontWeight: '600',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  innerLabel: {
    marginLeft: 8,
    color: dockColors.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
