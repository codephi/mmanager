import { useEffect, useState } from "react";
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
  overflow-y: auto;
  overflow-x: hidden;
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
  const [originalSizes, setOriginalSizes] = useState<Map<string, Layout>>(
    new Map()
  );

  useEffect(() => {
    const activeSpace = spaces.find((t) => t.id === activeSpaceId);
    if (!activeSpace) return;

    const localWindows = structuredClone(activeSpace.windows).filter((w) => {
      return w.isOnline !== false;
    });

    const { rows, cols } = calculateGridSize(localWindows.length);

    const availableHeight = window.innerHeight - 110;

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
    // Depois, atualiza o state local:
    setTimeout(() => {
      rearrangeWindowsFromLayout(newLayout);
    }, 300);
  };

  const handleMaximize = (id: string) => {
    const space = spaces.find((t) => t.id === activeSpaceId);
    if (!space) return;

    const totalWindows = space.windows.filter(
      (w) => w.isOnline !== false
    ).length;
    const { rows, cols } = calculateGridSize(totalWindows);

    const win = space.windows.find((w) => w.id === id);
    if (!win) return;

    // Salvar tamanho atual no state auxiliar
    setOriginalSizes((prev) => {
      const copy = new Map(prev);
      copy.set(id, {
        i: id,
        x: win.x ?? 0,
        y: win.y ?? 0,
        w: win.w ?? 1,
        h: win.h ?? 1,
      });
      return copy;
    });

    updateWindow(id, {
      x: 0,
      y: 0,
      w: cols,
      h: rows,
    });
  };

  const handleMinimize = (id: string) => {
    const original = originalSizes.get(id);
    if (!original) return; // Não temos backup, não faz nada.

    updateWindow(id, {
      x: original.x,
      y: original.y,
      w: original.w,
      h: original.h,
    });

    setOriginalSizes((prev) => {
      const copy = new Map(prev);
      copy.delete(id);
      return copy;
    });
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
        autoSize={true}
        rowHeight={rowHeight}
        width={window.innerWidth}
        isResizable
        isDraggable
        onLayoutChange={onLayoutChange}
        compactType={null}
        resizeHandles={["s", "e", "se"]} // <--- aqui o segredo
      >
        {windows.map((win) => (
          <Window key={win.id} className="window-header">
            <WindowContainer
              id={win.id}
              room={win.room}
              pinned={win.pinned}
              onMaximize={() => handleMaximize(win.id)}
              onMinimize={() => handleMinimize(win.id)}
            />
          </Window>
        ))}
      </ResponsiveGridLayout>
    </Wrapper>
  );
};
