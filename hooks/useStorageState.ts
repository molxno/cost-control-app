import * as SecureStore from "expo-secure-store";
import * as React from "react";
import { Platform } from "react-native";

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

const MAX_SIZE = 2048;

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null]
): [[boolean, T | null], (value: T | null) => void] {
  return React.useReducer(
    (
      state: [boolean, T | null],
      action: T | null = null
    ): [boolean, T | null] => [false, action],
    initialValue
  );
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === "web") {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error("Local storage is unavailable:", e);
    }
  } else {
    if (value == null) {
      // Eliminar valores previos en caso de estar fragmentados
      let index = 0;
      while (await SecureStore.getItemAsync(`${key}_part${index}`)) {
        await SecureStore.deleteItemAsync(`${key}_part${index}`);
        index++;
      }
    } else {
      // Si el valor es demasiado grande, dividirlo en partes
      const encoded = btoa(value); // Codificar en Base64
      const chunks = encoded.match(new RegExp(`.{1,${MAX_SIZE}}`, "g")) || [];

      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`${key}_part${i}`, chunks[i]);
      }

      // Guardamos la cantidad de partes para reconstrucción
      await SecureStore.setItemAsync(`${key}_count`, chunks.length.toString());
    }
  }
}

export function useStorageState(
  key: string
): [[boolean, string | null], (value: string | null) => void] {
  const [state, setState] = useAsyncState<string>();

  React.useEffect(() => {
    async function loadStorage() {
      if (Platform.OS === "web") {
        try {
          if (typeof localStorage !== "undefined") {
            setState(localStorage.getItem(key));
          }
        } catch (e) {
          console.error("Local storage is unavailable:", e);
        }
      } else {
        // Leer el número de fragmentos
        const countStr = await SecureStore.getItemAsync(`${key}_count`);
        if (!countStr) return setState(null);

        const count = parseInt(countStr, 10);
        let storedValue = "";

        for (let i = 0; i < count; i++) {
          const part = await SecureStore.getItemAsync(`${key}_part${i}`);
          if (part) storedValue += part;
        }

        setState(atob(storedValue)); // Decodificar Base64
      }
    }

    loadStorage();
  }, [key]);

  const setValue = React.useCallback(
    (value: string | null) => {
      setState(value);
      setStorageItemAsync(key, value);
    },
    [key]
  );

  return [state, setValue];
}
