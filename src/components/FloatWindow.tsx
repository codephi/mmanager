import React, { useState } from "react";
import { Rnd } from "react-rnd";
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

export const FloatWindow: React.FC<Props> = ({
  id,
  room,
  x,
  y,
  width,
  height,
  pinned,
}) => {
  const bringToFront = useSpacesStore((s) => s.bringToFront);
  const spaces = useSpacesStore((s) => s.spaces);
  const activeSpaceId = useSpacesStore((s) => s.activeSpaceId);
  const activeSpace = spaces.find((t) => t.id === activeSpaceId);
  const zIndex = activeSpace?.zIndexes[id] ?? 10;
  const [maximized, setMaximized] = useState(false);
  const isPinned = pinned ?? false;
  console.log({ x, y });
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
        useSpacesStore
          .getState()
          .updatePinnedWindow(id, { pinnedX: d.x, pinnedY: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, pos) => {
        console.log({ pos });
        useSpacesStore.getState().updatePinnedWindow(id, {
          pinnedX: pos.x ?? x,
          pinnedY: pos.y ?? y,
          pinnedWidth: ref.offsetWidth,
          pinnedHeight: ref.offsetHeight,
        });
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
        isFloating={true}
        onMaximize={() => setMaximized(true)}
        onMinimize={() => setMaximized(false)}
      />
    </Rnd>
  );
};
