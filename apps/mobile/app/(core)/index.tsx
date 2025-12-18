import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to the (tabs) route as the main entry point
  return <Redirect href="/(core)/(tabs)/feed" />;
}
