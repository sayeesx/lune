import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 3;

interface AgeOption {
  id: string;
  value: number;
  label: string;
}

interface AgePickerProps {
  value?: number;
  onChange?: (value: number) => void;
}

const AGE_OPTIONS: AgeOption[] = Array.from({ length: 100 }, (_, i) => ({
  id: (i + 1).toString(),
  value: i + 1,
  label: (i + 1).toString(),
}));

export default function AgePicker({ value = 18, onChange }: AgePickerProps) {
  const flatListRef = useRef<FlatList<AgeOption>>(null);
  const [highlightedValue, setHighlightedValue] = useState<number>(value);

  // Scroll to initial position
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: (value - 1) * ITEM_HEIGHT,
        animated: false,
      });
    }, 50);
  }, [value]);

  // Handle scroll stop and set the correct number
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const newValue = AGE_OPTIONS[index]?.value;

    if (newValue !== undefined && newValue !== highlightedValue) {
      setHighlightedValue(newValue);
      onChange?.(newValue);
    }
  };

  // Optimize item layout calculation - FIXED TYPE
  const getItemLayout = (_: ArrayLike<AgeOption> | null | undefined, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  // Render each item
  const renderItem = ({ item }: { item: AgeOption }) => {
    const isHighlighted = item.value === highlightedValue;

    return (
      <TouchableOpacity
        style={styles.ageItem}
        onPress={() => {
          flatListRef.current?.scrollToOffset({
            offset: (item.value - 1) * ITEM_HEIGHT,
            animated: true,
          });
        }}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.ageText,
            isHighlighted && styles.highlightedText,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={AGE_OPTIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        bounces={false}
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={8}
        ListHeaderComponent={<View style={{ height: ITEM_HEIGHT }} />}
        ListFooterComponent={<View style={{ height: ITEM_HEIGHT }} />}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={20}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    overflow: 'hidden',
  },
  ageItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageText: {
    textAlign: 'center',
    fontSize: 24,
    color: '#9199B1',
  },
  highlightedText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2652F9',
  },
});
