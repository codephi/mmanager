import { useEffect } from "react";
import { useDiscoveryStore } from "../store/discoveryStore";
import { WindowsGrid } from "../components/WindowsGrid";

export const Discovery = () => {
  useEffect(() => {
    // Initialize and load discovery when entering the page
    // The store will handle query params synchronization
    useDiscoveryStore.getState().loadDiscovery();
  }, []);

  return (
    <>
      <WindowsGrid />
    </>
  );
};
