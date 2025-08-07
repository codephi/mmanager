// AppInitializer.tsx
import { useEffect, useRef } from "react";
import { useSpacesStore } from "../store/spacesStore";
import { useDiscoveryStore } from "../store/discoveryStore";

export const AppInitializer = () => {
  const activeSpaceId = useSpacesStore((s) => s.activeSpaceId);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    // Carrega o discovery na primeira vez que o app abre
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      if (activeSpaceId === "discovery") {
        console.log("App initialized, loading discovery data...");
        useDiscoveryStore.getState().loadDiscovery();
      }
    }
  }, []);

  useEffect(() => {
    // Carrega quando muda para discovery space
    if (activeSpaceId === "discovery" && initialLoadRef.current) {
      console.log("Discovery space activated, loading discovery data...");
      useDiscoveryStore.getState().loadDiscovery();
    }
  }, [activeSpaceId]);

  return null; // Esse componente só serve para rodar o hook
};
