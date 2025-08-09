import { useEffect, useState, useRef, useCallback } from "react";
import { useSpacesStore } from "../store/windowsMainStore";
import { WindowContainer } from "./WindowContainer";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import styled from "styled-components";
import { rearrangeWindowsFromLayout } from "../utils/rearrangeWindows";
import { calculateGridSize } from "../utils/gridUtils";
import type { WindowConfig } from "../store/types";
import { useMobile } from "../hooks/useMobile";

const ResponsiveGridLayout = WidthProvider(Responsive);

const Window = styled.div`
  width: 100%;
  height: 100%;
`;

const Wrapper = styled.div<{ $isMobile: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;

  .react-resizable-handle {
    display: none;
  }

  /* Só mostra handles de resize no desktop */
  ${({ $isMobile }) => !$isMobile && `
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
  `}

  /* No mobile, garante que handles nunca aparecem */
  ${({ $isMobile }) => $isMobile && `
    .react-resizable-handle {
      display: none !important;
    }
  `}
`;

export const WindowsGrid: React.FC = () => {
  const storeWindows = useSpacesStore((s) => s.windows);
  const filterMode = useSpacesStore((s) => s.filterMode);
  const updateWindow = useSpacesStore((s) => s.updateWindow);
  const { isMobile } = useMobile();
  const [displayWindows, setDisplayWindows] = useState<WindowConfig[]>([]);
  const [rowHeight, setRowHeight] = useState(1);
  const [colsValue, setColsValue] = useState(1);
  const [layout, setLayout] = useState<Layout[]>([]);
  const [originalSizes, setOriginalSizes] = useState<Map<string, Layout>>(
    new Map()
  );
  
  // Para prevenir loops de atualização
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLayoutRef = useRef<Layout[]>([]);
  // Ref para o wrapper que tem scroll
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Filtra as janelas baseado no filterMode
      let filteredWindows = storeWindows.filter((w) => {
        return w && w.id && w.isOnline !== false;
      });

      // Aplica filtro se necessário
      if (filterMode === "online") {
        filteredWindows = filteredWindows.filter((w) => w.isOnline === true);
      } else if (filterMode === "offline") {
        filteredWindows = filteredWindows.filter((w) => w.isOnline === false);
      }

      // Se não há janelas, define valores padrão seguros
      if (filteredWindows.length === 0) {
        setDisplayWindows([]);
        setLayout([]);
        setRowHeight(100);
        setColsValue(1);
        return;
      }

      const { rows, cols } = calculateGridSize(filteredWindows.length);
      const safeRows = Math.max(1, rows);
      const safeCols = Math.max(1, cols);

      const availableHeight = Math.max(100, window.innerHeight - 110);
      const rowHeight = Math.max(50, availableHeight / safeRows);

      // Usa posições salvas ou calcula automaticamente
      const layout: Layout[] = filteredWindows.map((win, index) => {
        return {
          i: win.id,
          x: win.x ?? index % safeCols,
          y: win.y ?? Math.floor(index / safeCols),
          w: Math.max(1, win.w ?? 1),
          h: Math.max(1, win.h ?? 1),
        };
      });

      setLayout(layout);
      setRowHeight(rowHeight);
      setColsValue(safeCols);
      setDisplayWindows(filteredWindows);
    } catch (error) {
      console.error("[WindowsGrid] Error in useEffect:", error);
      // Em caso de erro, define valores seguros
      setDisplayWindows([]);
      setLayout([]);
      setRowHeight(100);
      setColsValue(1);
    }
  }, [storeWindows, filterMode]);

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
      if (!displayWindows.length || !newLayout.length) {
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
        // Atualiza o store
        newLayout.forEach(({ i, x, y, w, h }) => {
          updateWindow(i, { x, y, w, h });
        });
        
        // Chama rearrangeWindowsFromLayout
        rearrangeWindowsFromLayout(newLayout);
      }, 100);
      
    } catch (error) {
      console.error("[WindowsGrid] Error in onLayoutChange:", error);
    }
  }, [displayWindows.length, layoutsAreEqual, updateWindow]);

  // Cleanup do timeout quando componente desmonta
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const handleMaximize = (id: string) => {
    const totalWindows = displayWindows.filter(
      (w) => w.isOnline !== false
    ).length;
    const { rows, cols } = calculateGridSize(totalWindows);

    const win = displayWindows.find((w) => w.id === id);
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

    // Scroll automático para a janela maximizada
    setTimeout(() => {
      // Encontra a janela maximizada
      const maximizedWindow = document.querySelector(`[data-window-id="${id}"]`);
      
      if (maximizedWindow) {
        // Scroll para a janela específica
        maximizedWindow.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      } else {
        // Fallback: scroll para o topo
        if (wrapperRef.current) {
          wrapperRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }, 200); // Aguardar animações do grid layout terminarem
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
    <Wrapper ref={wrapperRef} $isMobile={isMobile}>
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
        isResizable={!isMobile}
        isDraggable={!isMobile}
        onLayoutChange={onLayoutChange}
        compactType={null}
        resizeHandles={["s", "e", "se"]}
        draggableCancel=".no-drag"
      >
        {displayWindows.map((win) => (
          <Window key={win.id} className="window-header" data-window-id={win.id}>
            <WindowContainer
              id={win.id}
              room={win.room}
              onMaximize={() => handleMaximize(win.id)}
              onMinimize={() => handleMinimize(win.id)}
              isMobile={isMobile}
              scrollElementRef={wrapperRef}
            />
          </Window>
        ))}
      </ResponsiveGridLayout>
    </Wrapper>
  );
};
