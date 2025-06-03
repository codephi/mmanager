import React from "react";
import styled from "styled-components";
import { useSpacesStore } from "../store/spacesStore";
import { VideoWindow } from "./VideoWindow";

const PinnedContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Não use pointer-events: none */
`;

export const Pinneds: React.FC = () => {
  const pinnedWindows = useSpacesStore((s) => s.pinnedWindows);

  return (
    <PinnedContainer>
      {pinnedWindows.map((window) => (
        <VideoWindow
          key={window.id}
          id={window.id}
          room={window.room}
          x={window.x}
          y={window.y}
          width={window.width}
          height={window.height}
          pinned={true}
        />
      ))}
    </PinnedContainer>
  );
};
