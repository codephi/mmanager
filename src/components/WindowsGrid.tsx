import React from "react";
import { useSpacesStore } from "../store/spacesStore";
import { WindowContainer, WindowContainerWrapper } from "./WindowContainer";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useWindowsStore } from "../store/windowsStore";
import styled from "styled-components";
import { rearrangeWindowsFromLayout } from "../utils/rearrangeWindows";
import { calculateGridSize } from "../utils/gridUtils";

const ResponsiveGridLayout = WidthProvider(Responsive);

const Window = styled.div`
  width: 100%;
  height: 100%;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  flex: 1;

  ${Window}:hover {
    .react-resizable-handle {
      color: var(--primary-color);
      background-color: var(--primary-color);

      border-radius: 50%;
      width: 8px;
      height: 8px;
      background-image: none;
      &:hover {
        background-color: var(--primary-color-hover);
      }
    }
  }
`;

export const WindowsGrid: React.FC = () => {
  const spaces = useSpacesStore((s) => s.spaces);
  const activeSpaceId = useSpacesStore((s) => s.activeSpaceId);
  const filterMode = useSpacesStore((s) => s.filterMode);
  const pinnedWindows = useSpacesStore((s) => s.pinnedWindows);
  const updateWindow = useWindowsStore((s) => s.updateWindow);

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

  const pinnedIds = pinnedWindows.map((w) => w.id);
  windows = windows.filter((w) => !pinnedIds.includes(w.id));

  const windowCount = windows.length;

  const { rows, cols } = calculateGridSize(windowCount);

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const paddingTop = 100;
  const paddingBottom = 200;
  const availableHeight = viewportHeight - paddingTop - paddingBottom;

  const rowHeight = availableHeight / rows;

  const layout: Layout[] = windows.map((win, index) => ({
    i: win.id,
    x: win.x ?? index % cols,
    y: win.y ?? Math.floor(index / cols),
    w: win.w ?? 1,
    h: win.h ?? 1,
  }));

  const onLayoutChange = (newLayout: Layout[]) => {
    // Sempre atualiza store com o novo layout primeiro:
    newLayout.forEach(({ i, x, y, w, h }) => {
      updateWindow(i, { x, y, w, h });
    });

    // Imediatamente já faz o rearrange usando o layout atualizado:
    rearrangeWindowsFromLayout(newLayout);
  };

  const colsValue = cols > 0 ? cols : 1;

  return (
    <Wrapper>
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        cols={{
          lg: colsValue,
          md: colsValue,
          sm: colsValue,
          xs: colsValue,
          xxs: colsValue,
        }}
        rowHeight={rowHeight}
        width={viewportWidth}
        isResizable
        isDraggable
        onLayoutChange={onLayoutChange}
        draggableHandle=".window-header"
        compactType={null}
        resizeHandles={["n", "s", "e", "w", "ne", "nw", "se", "sw"]} // <--- aqui o segredo
      >
        {windows.map((win) => (
          <Window key={win.id} className="window-header">
            <WindowContainer
              id={win.id}
              room={win.room}
              pinned={win.pinned}
              onMaximize={() => {}}
            />
          </Window>
        ))}
      </ResponsiveGridLayout>
    </Wrapper>
  );
};
