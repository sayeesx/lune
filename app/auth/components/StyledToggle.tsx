import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/fonts';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue,
    withSpring
} from 'react-native-reanimated';

interface StyledToggleProps {
  leftOption: string;
  rightOption: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

const { width } = Dimensions.get('window');
const TOGGLE_WIDTH = width * 0.8;
const TOGGLE_HEIGHT = 50;
const KNOB_SIZE = TOGGLE_HEIGHT - 8;

export const StyledToggle: React.FC<StyledToggleProps> = ({
  leftOption,
  rightOption,
  value,
  onToggle
}) => {
  const progress = useDerivedValue(() => withSpring(value ? 1 : 0));

  const knobStyle = useAnimatedStyle(() => {
    const translateX = withSpring(value ? TOGGLE_WIDTH / 2 - 4 : 4, {
      mass: 1,
      damping: 15,
      stiffness: 120,
    });

    return {
      transform: [{ translateX }],
    };
  });

  const leftTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 1],
      [colors.primary, 'rgba(255, 255, 255, 0.7)']
    );
    return { color };
  });

  const rightTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(255, 255, 255, 0.7)', colors.primary]
    );
    return { color };
  });

  return (
    <View style={styles.container}>
      <View style={styles.toggle}>
        <Animated.View style={[styles.knob, knobStyle]} />
        <TouchableOpacity 
          style={styles.option}
          onPress={() => onToggle(false)}
          activeOpacity={0.7}
        >
          <Animated.Text style={[styles.text, leftTextStyle]}>
            {leftOption}
          </Animated.Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.option}
          onPress={() => onToggle(true)}
          activeOpacity={0.7}
        >
          <Animated.Text style={[styles.text, rightTextStyle]}>
            {rightOption}
          </Animated.Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  toggle: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    backgroundColor: colors.primary,
    borderRadius: TOGGLE_HEIGHT / 2,
    flexDirection: 'row',
    position: 'relative',
  },
  knob: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    backgroundColor: 'white',
    borderRadius: KNOB_SIZE / 2,
    top: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
  },
});