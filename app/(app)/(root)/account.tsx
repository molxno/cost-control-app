import { ThemedText } from "@/components/ThemedText";
import { useSession } from "../../../context/auth";
import { ThemedView } from "@/components/ThemedView";

export default function AccountScreen() {
  const { signOut } = useSession();

  return (
    <ThemedView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <ThemedText>
        Account
      </ThemedText>
      <ThemedText onPress={signOut}>
        Sign Out
      </ThemedText>
    </ThemedView>
  );
}
