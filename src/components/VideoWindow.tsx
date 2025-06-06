import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { useWindowsStore } from "../store/windowsStore";
import { useSpacesStore } from "../store/spacesStore";
import { WindowContainer } from "./WindowContainer";

interface Props {
  id: string;
  room: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pinned?: boolean;
}

export const VideoWindow: React.FC<Props> = ({
  id,
  room,
  x,
  y,
  width,
  height,
  pinned,
}) => {
  const updateWindow = useWindowsStore((s) => s.updateWindow);
  const bringToFront = useSpacesStore((s) => s.bringToFront);
  const spaces = useSpacesStore((s) => s.spaces);
  const activeSpaceId = useSpacesStore((s) => s.activeSpaceId);
  const activeSpace = spaces.find((t) => t.id === activeSpaceId);
  const zIndex = activeSpace?.zIndexes[id] ?? 10;
  const [maximized, setMaximized] = useState(false);
  const isPinned = pinned ?? false;

  return (
    <Rnd
      size={
        maximized
          ? { width: window.innerWidth, height: window.innerHeight - 50 }
          : { width, height }
      }
      position={maximized ? { x: 0, y: 0 } : { x, y }}
      onDragStart={() => bringToFront(id)}
      onResizeStart={() => bringToFront(id)}
      onDragStop={(e, d) => {
        if (isPinned) {
          useSpacesStore.getState().updatePinnedWindow(id, { x: d.x, y: d.y });
        } else {
          updateWindow(id, { x: d.x, y: d.y });
        }
      }}
      onResizeStop={(e, direction, ref, delta, pos) => {
        if (isPinned) {
          useSpacesStore.getState().updatePinnedWindow(id, {
            x: pos.x,
            y: pos.y,
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          });
        } else {
          updateWindow(id, {
            width: ref.offsetWidth,
            height: ref.offsetHeight,
            x: pos.x,
            y: pos.y,
          });
        }
      }}
      bounds="parent"
      dragHandleClassName="window-header"
      cancel=".no-drag"
      minWidth={180}
      minHeight={80}
      disableDragging={maximized}
      enableResizing={!maximized}
      style={{ zIndex }}
    >
      <WindowContainer
        id={id}
        room={room}
        pinned={isPinned}
        onMaximize={() => setMaximized(true)}
        onMinimize={() => setMaximized(false)}
      />
    </Rnd>
  );
};
