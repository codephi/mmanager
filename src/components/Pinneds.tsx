import React from "react";
import styled from "styled-components";
import { useSpacesStore } from "../store/spacesStore";
import { FloatWindow } from "./FloatWindow";

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
        <FloatWindow
          key={window.id}
          id={window.id}
          room={window.room}
          x={window.pinnedX}
          y={window.pinnedY}
          width={window.pinnedWidth}
          height={window.pinnedHeight}
          pinned={true}
        />
      ))}
    </PinnedContainer>
  );
};
