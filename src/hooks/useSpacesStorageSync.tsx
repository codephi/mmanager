import { useEffect } from "react";
import { useSpacesStore } from "../store/spacesStore";

export function useSpacesStorageSync() {
  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === "spaces-storage") {
        const newValue = event.newValue;
        if (newValue) {
          try {
            const parsed = JSON.parse(newValue).state;
            useSpacesStore.setState(parsed);
          } catch (err) {
            console.error("Failed to parse spaces-storage", err);
          }
        }
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
}
