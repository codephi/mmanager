import { useEffect, useState, useRef, useCallback } from "react";
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
      color: #fff;
      background-color: #fff;

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
  
  // Para prevenir loops de atualização
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLayoutRef = useRef<Layout[]>([]);

  useEffect(() => {
    try {
      const activeSpace = spaces.find((t) => t.id === activeSpaceId);
      if (!activeSpace) {
        // Se não encontrar o space, limpa tudo
        setWindows([]);
        setLayout([]);
        setRowHeight(100);
        setColsValue(1);
        return;
      }

      // Proteção adicional
      if (!activeSpace.windows || !Array.isArray(activeSpace.windows)) {
        setWindows([]);
        setLayout([]);
        setRowHeight(100);
        setColsValue(1);
        return;
      }

      const localWindows = activeSpace.windows.filter((w) => {
        return w && w.id && w.isOnline !== false;
      });

      // Se não há janelas, define valores padrão seguros
      if (localWindows.length === 0) {
        setWindows([]);
        setLayout([]);
        setRowHeight(100);
        setColsValue(1);
        return;
      }

      const { rows, cols } = calculateGridSize(localWindows.length);
      const safeRows = Math.max(1, rows);
      const safeCols = Math.max(1, cols);

      const availableHeight = Math.max(100, window.innerHeight - 110);
      const rowHeight = Math.max(50, availableHeight / safeRows);

      // Para o space "favorites", sempre organizamos as janelas automaticamente
      // porque elas vêm de diferentes spaces com posições que podem não fazer sentido juntas
      const layout: Layout[] = localWindows.map((win, index) => {
        if (activeSpaceId === "favorite") {
          // Para favoritos, sempre organiza em grid limpo
          return {
            i: win.id,
            x: index % safeCols,
            y: Math.floor(index / safeCols),
            w: 1, // Tamanho padrão para favoritos
            h: 1,
          };
        } else {
          // Para outros spaces, usa posições salvas ou calcula
          return {
            i: win.id,
            x: win.x ?? index % safeCols,
            y: win.y ?? Math.floor(index / safeCols),
            w: Math.max(1, win.w ?? 1),
            h: Math.max(1, win.h ?? 1),
          };
        }
      });

      setLayout(layout);
      setRowHeight(rowHeight);
      setColsValue(safeCols);
      setWindows(localWindows);
    } catch (error) {
      console.error("[WindowsGrid] Error in useEffect:", error);
      // Em caso de erro, define valores seguros
      setWindows([]);
      setLayout([]);
      setRowHeight(100);
      setColsValue(1);
    }
  }, [spaces, pinnedWindows, activeSpaceId, filterMode]);

  // Função para comparar se o layout realmente mudou
  const layoutsAreEqual = useCallback((layout1: Layout[], layout2: Layout[]) => {
    if (layout1.length !== layout2.length) return false;
    
    return layout1.every((item1) => {
      const item2 = layout2.find(item => item.i === item1.i);
      if (!item2) return false;
      
      return (
        item1.x === item2.x &&
        item1.y === item2.y &&
        item1.w === item2.w &&
        item1.h === item2.h
      );
    });
  }, []);

  const onLayoutChange = useCallback((newLayout: Layout[]) => {
    try {
      // Se não há windows ou o layout está vazio, não faz nada
      if (!windows.length || !newLayout.length) {
        return;
      }

      // Verifica se o layout realmente mudou para evitar loops
      if (layoutsAreEqual(newLayout, lastLayoutRef.current)) {
        return;
      }

      // Atualiza a referência do último layout
      lastLayoutRef.current = newLayout;

      // Limpa timeout anterior se existir
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Debounce de 100ms para evitar muitas atualizações seguidas
      updateTimeoutRef.current = setTimeout(() => {
        // Se estamos no space "favorite", não atualizamos o store
        // porque pode causar loops já que o space favorite não tem os windows localmente
        if (activeSpaceId === "favorite") {
          return;
        }

        // Atualiza o store apenas se não for o space favorites
        newLayout.forEach(({ i, x, y, w, h }) => {
          updateWindow(i, { x, y, w, h });
        });
        
        // Chama rearrangeWindowsFromLayout
        rearrangeWindowsFromLayout(newLayout);
      }, 100);
      
    } catch (error) {
      console.error("[WindowsGrid] Error in onLayoutChange:", error);
    }
  }, [activeSpaceId, windows.length, layoutsAreEqual, updateWindow]);

  // Cleanup do timeout quando componente desmonta
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

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
        isResizable={activeSpaceId !== "favorite"}
        isDraggable={activeSpaceId !== "favorite"}
        onLayoutChange={onLayoutChange}
        compactType={null}
        resizeHandles={["s", "e", "se"]}
        draggableCancel=".no-drag"
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
