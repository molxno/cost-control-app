import { Stack, router } from "expo-router";
import { useSession } from "@/context/auth";
import { useEffect } from "react";

export const unstable_settings = {
  initialRouteName: "(root)",
};

export default function AppLayout() {
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/sign-in");
    }
  }, [session, isLoading]);

  if (isLoading) return null; // Evita parpadeos al cargar la sesión

  return (
    <Stack>
      <Stack.Screen name="(root)" options={{ headerShown: false }} />
      <Stack.Screen
        name="sign-in"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
