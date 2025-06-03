import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useWindowsStore } from "../store/windowsStore";
import { useDiscoveryStore } from "../store/discoveryStore";
import { useSpacesStore } from "../store/spacesStore";
import { SpaceOption } from "./SpaceOption";
import { Pagination } from "./Pagination";

// Styled Components
const ToolbarContainer = styled.div`
  padding: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const DiscoveryControls = styled.div`
  display: flex;
  gap: 10px;
`;

const LeftOptions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const RightOptions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-left: auto;
`;

function Toolbar() {
  // Spaces agora vindo do spacesStore
  const spaces = useSpacesStore((s) => s.getSpaces());
  const activeSpaceId = useSpacesStore((s) => s.activeSpaceId);
  const addSpace = useSpacesStore((s) => s.addSpace);
  const removeSpace = useSpacesStore((s) => s.removeSpace);
  const renameSpace = useSpacesStore((s) => s.renameSpace);
  const switchSpace = useSpacesStore((s) => s.setActiveSpace);
  const toggleAutoArrange = useSpacesStore((s) => s.toggleAutoArrange);

  // Windows e Discovery seguem igual
  const addWindow = useWindowsStore((s) => s.addWindow);
  const arrangeWindows = useSpacesStore((s) => s.arrangeWindows);
  const arrangeFilteredWindows = useSpacesStore(
    (s) => s.arrangeFilteredWindows
  );
  const setFilterMode = useSpacesStore((s) => s.setFilterMode);
  const filterMode = useSpacesStore((s) => s.filterMode);
  const setGlobalMuted = useSpacesStore((s) => s.setGlobalMuted);
  const isLoadingDiscovery = useDiscoveryStore((s) => s.isLoadingDiscovery);
  const loadDiscovery = useDiscoveryStore((s) => s.loadDiscovery);
  const discoveryLimit = useDiscoveryStore((s) => s.discoveryLimit);
  const setDiscoveryLimit = useDiscoveryStore((s) => s.setDiscoveryLimit);
  const goToDiscoveryPage = useDiscoveryStore((s) => s.goToDiscoveryPage);
  const currentPage = useDiscoveryStore((s) => s.currentPage);
  const totalPages = useDiscoveryStore((s) => s.totalPages);

  const discovery = spaces.find((s) => s.id === "discovery");
  const pinnedCount = discovery?.windows.filter((w) => w.pinned).length ?? 0;

  const [newSpaceName, setNewSpaceName] = useState("");
  const [renamingSpaceId, setRenamingSpaceId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    const handleResize = () => {
      const active = spaces.find((t) => t.id === activeSpaceId);
      if (active?.autoArrange) {
        if (filterMode === "all") {
          arrangeWindows();
        } else {
          arrangeFilteredWindows();
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    spaces,
    activeSpaceId,
    arrangeWindows,
    arrangeFilteredWindows,
    filterMode,
  ]);

  useEffect(() => {
    if (discovery && discovery.windows.length === 0 && !isLoadingDiscovery) {
      loadDiscovery();
    }
  }, [discovery?.windows.length, isLoadingDiscovery]);

  const selectedSpace = spaces.find((s) => s.id === activeSpaceId);

  const handlerGlobalMuted = () => {
    setGlobalMuted(true);
  };

  return (
    <ToolbarContainer>
      <LeftOptions>
        <select
          value={activeSpaceId}
          onChange={(e) => switchSpace(e.target.value)}
        >
          {spaces.map((space) => (
            <option key={space.id} value={space.id}>
              {space.name} ({space.windows.length})
            </option>
          ))}
        </select>

        <button onClick={handlerGlobalMuted}>{"🔇 Mute All"}</button>

        <select
          value={filterMode}
          onChange={(e) =>
            setFilterMode(e.target.value as "all" | "online" | "offline")
          }
        >
          <option value="all">Todas as salas</option>
          <option value="online">Somente online</option>
          <option value="offline">Somente offline</option>
        </select>

        <button onClick={arrangeFilteredWindows}>Grid</button>

        <button
          onClick={() => {
            addSpace(newSpaceName);
            setNewSpaceName("");
          }}
        >
          Adicionar Space
        </button>
      </LeftOptions>

      <RightOptions>
        {activeSpaceId === "discovery" ? (
          <DiscoveryControls>
            <select
              value={discoveryLimit}
              onChange={(e) => setDiscoveryLimit(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1)
                .filter((value) => value >= Math.max(1, pinnedCount))
                .map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
            </select>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => goToDiscoveryPage(page)}
            />
          </DiscoveryControls>
        ) : (
          <SpaceOption
            space={selectedSpace}
            renamingSpaceId={renamingSpaceId}
            setRenamingSpaceId={setRenamingSpaceId}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            renameSpace={renameSpace}
            toggleAutoArrange={toggleAutoArrange}
            removeSpace={removeSpace}
            addStream={(room: string) => {
              addWindow(room.trim());
            }}
          />
        )}
      </RightOptions>
    </ToolbarContainer>
  );
}

export default Toolbar;
