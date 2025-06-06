import React from "react";
import { useSpacesStore } from "../store/spacesStore";
import { WindowContainer } from "./WindowContainer";
import { Pinneds } from "./Pinneds";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useWindowsStore } from "../store/windowsStore";

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

  const columnWidth = viewportWidth / cols;
  const rowHeight = availableHeight / rows;

  const layout: Layout[] = windows.map((win, index) => {
    const x = index % cols;
    const y = Math.floor(index / cols);
    return { i: win.id, x, y, w: 1, h: 1 };
  });

  const onLayoutChange = (newLayout: Layout[]) => {
    newLayout.forEach(({ i, x, y, w, h }) => {
      updateWindow(i, {
        x,
        y,
        width: w * columnWidth,
        height: h * rowHeight,
      });
    });
  };

  return (
    <>
      <Pinneds />

      <div style={{ marginTop: paddingTop }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          cols={{ lg: cols }}
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
      </div>
    </>
  );
};
