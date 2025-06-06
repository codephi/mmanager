import React from "react";
import { useSpacesStore } from "../store/spacesStore";
import { WindowContainer } from "./WindowContainer";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useWindowsStore } from "../store/windowsStore";
import styled from "styled-components";
import { rearrangeWindows } from "../utils/rearrangeWindows";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const ResponsiveGridLayout = WidthProvider(Responsive);

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

  const maxPerRow = 6;
  const windowCount = windows.length;

  const cols =
    windowCount <= 6 ? windowCount : windowCount <= 12 ? 4 : maxPerRow;
  const rows = Math.ceil(windowCount / cols);

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

  let rearrangeTimeout: ReturnType<typeof setTimeout> | null = null;

  const onLayoutChange = (newLayout: Layout[]) => {
    newLayout.forEach(({ i, x, y, w, h }) => {
      updateWindow(i, { x, y, w, h });
    });

    if (rearrangeTimeout) clearTimeout(rearrangeTimeout);
    rearrangeTimeout = setTimeout(() => {
      rearrangeWindows();
    }, 300);
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
      >
        {windows.map((win) => (
          <div
            key={win.id}
            className="window-header"
            style={{ width: "100%", height: "100%" }}
          >
            <WindowContainer
              id={win.id}
              room={win.room}
              pinned={win.pinned}
              onMaximize={() => {}}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </Wrapper>
  );
};
