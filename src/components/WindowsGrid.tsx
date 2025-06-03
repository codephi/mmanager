import React from "react";
import { VideoWindow } from "./VideoWindow";
import { useSpacesStore } from "../store/spacesStore";
import { Pinneds } from "./Pinneds";

export const WindowsGrid: React.FC = () => {
  const spaces = useSpacesStore((s) => s.spaces);
  const activeSpaceId = useSpacesStore((s) => s.activeSpaceId);
  const filterMode = useSpacesStore((s) => s.filterMode);
  const pinnedWindows = useSpacesStore((s) => s.pinnedWindows);

  const activeSpace = spaces.find((t) => t.id === activeSpaceId);

  if (!activeSpace) return null;

  let windows = activeSpace?.windows ?? [];

  if (activeSpaceId !== "discovery") {
    if (filterMode === "online") {
      windows = windows.filter((w) => w.isOnline === true);
    } else if (filterMode === "offline") {
      windows = windows.filter((w) => w.isOnline === false);
    }
  }

  // Remover windows que já estão pinados
  const pinnedIds = pinnedWindows.map((w) => w.id);
  windows = windows.filter((w) => !pinnedIds.includes(w.id));

  return (
    <>
      {windows.map((win) => (
        <VideoWindow key={`${activeSpace?.id}-${win.id}`} {...win} />
      ))}
      <Pinneds />;
    </>
  );
};
