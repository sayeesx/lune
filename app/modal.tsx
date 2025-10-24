import { Stack, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';

export default function ModalScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, padding: 24, gap: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen options={{ title: 'Modal' }} />
      <Text style={{ fontSize: 20, fontWeight: '600' }}>This is a modal screen</Text>
      <Pressable
        onPress={() => router.back()}
        style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#111827', borderRadius: 8 }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Close</Text>
      </Pressable>
    </View>
  );
}
