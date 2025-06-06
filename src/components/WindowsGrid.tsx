import React from "react";
import { VideoWindow } from "./VideoWindow";
import { useSpacesStore } from "../store/spacesStore";
import { Pinneds } from "./Pinneds";
import styled from "styled-components";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  padding: 10px;
  overflow-y: auto;
  height: 100%;
  width: 100%;
  position: relative;
`;

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
    <Wrapper>
      {windows.map((win) => (
        <VideoWindow key={`${activeSpace?.id}-${win.id}`} {...win} />
      ))}
      <Pinneds />;
    </Wrapper>
  );
};
