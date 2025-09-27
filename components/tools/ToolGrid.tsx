// components/tools/ToolGrid.tsx
import React from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { ToolButton } from './ToolButton';

export type Tool = { key: string; icon: string; label: string; onPress?: () => void };

export function ToolGrid({ tools }: { tools: Tool[] }) {
  const renderItem: ListRenderItem<Tool> = ({ item }) => (
    <View style={styles.col}>
      <ToolButton icon={item.icon} label={item.label} onPress={item.onPress} />
    </View>
  );
  return (
    <FlatList
      data={tools}
      keyExtractor={(t) => t.key}
      renderItem={renderItem}
      numColumns={3}
      columnWrapperStyle={styles.row}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  row: { gap: 12 },
  col: { flex: 1 },
});
