import { useEffect } from 'react';
import { useSpacesStore } from '../store/spacesStore';
import { useDiscoveryStore } from '../store/discoveryStore';
import { useFavoriteStore } from '../store/favoriteStore';

export const useDiscoverySpacesSync = () => {
  const updateSpace = useSpacesStore((s) => s.updateSpace);
  const activeSpaceId = useSpacesStore((s) => s.activeSpaceId);
  const discoveryWindows = useDiscoveryStore((s) => s.discoveryWindows);
  const setOnWindowsUpdated = useDiscoveryStore((s) => s.setOnWindowsUpdated);
  const favoriteWindows = useFavoriteStore((s) => s.favoriteWindows);

  useEffect(() => {
    // Set up callback to update spaces store when discovery windows change
    const handleWindowsUpdated = (windows: any[]) => {
      console.log('Discovery windows updated:', windows.length);
      
      updateSpace('discovery', {
        id: 'discovery',
        name: 'Discovery',
        windows: windows,
        zIndexes: Object.fromEntries(windows.map((w, idx) => [w.id, idx + 1])),
        autoArrange: true,
      });
    };

    // Set up callback for favorite space sync
    const handleFavoriteSpaceSync = () => {
      updateSpace('favorite', {
        id: 'favorite',
        name: 'Favorites',
        windows: favoriteWindows,
        zIndexes: Object.fromEntries(favoriteWindows.map((w, idx) => [w.id, idx + 1])),
        autoArrange: true,
      });
    };

    setOnWindowsUpdated(handleWindowsUpdated);

    // Force sync discovery windows whenever they change
    if (discoveryWindows.length > 0) {
      handleWindowsUpdated(discoveryWindows);
    }

    // Force sync favorite windows whenever they change
    handleFavoriteSpaceSync();

    return () => {
      // Cleanup if needed
    };
  }, [updateSpace, activeSpaceId, discoveryWindows, favoriteWindows, setOnWindowsUpdated]);
};
