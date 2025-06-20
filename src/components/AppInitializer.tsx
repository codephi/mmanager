// AppInitializer.tsx
import { useEffect } from "react";
import { useSpacesStore } from "../store/spacesStore";
import { useDiscoveryStore } from "../store/discoveryStore";

export const AppInitializer = () => {
  const activeSpaceId = useSpacesStore((s) => s.activeSpaceId);

  useEffect(() => {
    if (activeSpaceId === "discovery") {
      useDiscoveryStore.getState().loadDiscovery();
      console.log("Discovery space is active, loading discovery data...");
    }
  }, [activeSpaceId]);

  return null; // Esse componente só serve para rodar o hook
};
