import React, { useEffect, useState } from "react";
import { useSpacesStore } from "../store/spacesStore";
import { WindowContainer } from "./WindowContainer";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useWindowsStore } from "../store/windowsStore";
import styled from "styled-components";
import { rearrangeWindowsFromLayout } from "../utils/rearrangeWindows";
import { calculateGridSize } from "../utils/gridUtils";
import type { WindowConfig } from "../store/types";

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

  .react-resizable-handle {
    display: none;
  }

  ${Window}:hover {
    .react-resizable-handle {
      display: block;
      color: var(--primary-color);
      background-color: var(--primary-color);

      border-radius: 50%;
      width: 10px;
      height: 10px;
      background-image: none !important;

      &::after {
        border-right: none !important;
        border-bottom: none !important;
      }

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
  const [windows, setWindows] = useState<WindowConfig[]>([]);
  const [rowHeight, setRowHeight] = useState(1);
  const [colsValue, setColsValue] = useState(1);
  const [layout, setLayout] = useState<Layout[]>([]);

  useEffect(() => {
    const activeSpace = spaces.find((t) => t.id === activeSpaceId);
    if (!activeSpace) return;

    const localWindows = structuredClone(activeSpace.windows).filter((w) => {
      return w.isOnline !== false;
    });

    const { rows, cols } = calculateGridSize(localWindows.length);

    const paddingTop = 100;
    const paddingBottom = 200;
    const availableHeight = window.innerHeight - paddingTop - paddingBottom;

    const rowHeight = availableHeight / rows;

    const layout: Layout[] = localWindows.map((win, index) => ({
      i: win.id,
      x: win.x ?? index % cols,
      y: win.y ?? Math.floor(index / cols),
      w: win.w ?? 1,
      h: win.h ?? 1,
    }));

    const colsValue = cols > 0 ? cols : 1;

    setLayout(layout);
    setRowHeight(rowHeight);
    setColsValue(colsValue);
    setWindows(localWindows);
  }, [spaces, pinnedWindows, activeSpaceId, filterMode]);

  const onLayoutChange = (newLayout: Layout[]) => {
    // Sempre atualiza store com o novo layout primeiro:
    newLayout.forEach(({ i, x, y, w, h }) => {
      updateWindow(i, { x, y, w, h });
    });

    // Imediatamente já faz o rearrange usando o layout atualizado:
    rearrangeWindowsFromLayout(newLayout);
  };

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
        width={window.innerWidth}
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
