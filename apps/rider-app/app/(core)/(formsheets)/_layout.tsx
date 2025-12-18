import { Stack } from "expo-router";

export default function FormSheetsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "formSheet",
      }}
    />
  );
}
