import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#000' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="painpoints" />
      <Stack.Screen name="potential" />
      <Stack.Screen name="motivation" />
      <Stack.Screen name="loading" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
