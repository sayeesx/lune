import { Stack } from 'expo-router';

export default function ChatHistoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
      initialRouteName="index"
    >
      <Stack.Screen
        name="index"
        options={{
          presentation: 'modal'
        }}
      />
    </Stack>
  );
}