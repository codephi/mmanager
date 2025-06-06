import { useSpacesStore } from "../store/spacesStore";
import { useWindowsStore } from "../store/windowsStore";

export const useGlobalPause = () => {
  const pauseAllExcept = (excludedWindowId: string) => {
    const spacesState = useSpacesStore.getState();
    const currentSpace = spacesState.getCurrentSpace();
    if (!currentSpace) return;

    currentSpace.windows.forEach((window) => {
      if (window.id !== excludedWindowId) {
        useWindowsStore.getState().updateWindow(window.id, { isPaused: true });
      }
    });
  };

  const resumeAllExcept = (excludedWindowId: string) => {
    const spacesState = useSpacesStore.getState();
    const currentSpace = spacesState.getCurrentSpace();
    if (!currentSpace) return;

    currentSpace.windows.forEach((window) => {
      if (window.id !== excludedWindowId) {
        useWindowsStore.getState().updateWindow(window.id, { isPaused: false });
      }
    });
  };

  return { pauseAllExcept, resumeAllExcept };
};
