import { useState } from "react";
import styled from "styled-components";
import { useDiscoveryStore } from "../store/discoveryStore";
import { useSpacesStore } from "../store/spacesStore";
import { Pagination } from "./Pagination";
import SpaceButtons from "./SpaceButtons";
import { DownloadMonitor } from "./DownloadMonitor";
import { Button } from "./SpaceButton";
import { rearrangeWindows } from "../utils/rearrangeWindows";

// Styled Components
const ToolbarContainer = styled.div`
  padding: 10px;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  z-index: 1000000;
`;

const DiscoveryControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const LeftOptions = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  flex-direction: row;
  justify-content: flex-start;
  gap: 0.5rem;
`;

const RightOptions = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: flex-end;
  flex: 1;
  gap: 0.5rem;
`;

const CenterOptions = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  flex-direction: row;
  justify-content: center;
  gap: 0.5rem;
`;

function Toolbar() {
  // Spaces agora vindo do spacesStore
  const spaces = useSpacesStore((s) => s.getSpaces());
  const activeSpaceId = useSpacesStore((s) => s.activeSpaceId);
  const addSpace = useSpacesStore((s) => s.addSpace);
  // Windows e Discovery seguem igual
  const setFilterMode = useSpacesStore((s) => s.setFilterMode);
  const filterMode = useSpacesStore((s) => s.filterMode);
  const setGlobalMuted = useSpacesStore((s) => s.setGlobalMuted);
  const discoveryLimit = useDiscoveryStore((s) => s.discoveryLimit);
  const setDiscoveryLimit = useDiscoveryStore((s) => s.setDiscoveryLimit);
  const goToDiscoveryPage = useDiscoveryStore((s) => s.goToDiscoveryPage);
  const currentPage = useDiscoveryStore((s) => s.currentPage);
  const totalPages = useDiscoveryStore((s) => s.totalPages);
  const discovery = spaces.find((s) => s.id === "discovery");
  const pinnedCount = discovery?.windows.filter((w) => w.pinned).length ?? 0;
  const [newSpaceName, setNewSpaceName] = useState("");
  const isDiscovery = activeSpaceId === "discovery";
  const switchSpace = useSpacesStore((s) => s.setActiveSpace);

  const handlerGlobalMuted = () => {
    setGlobalMuted(true);
  };

  return (
    <ToolbarContainer>
      <LeftOptions>
        <Button
          key={"discovery"}
          onClick={() => switchSpace("discovery")}
          $active={isDiscovery}
        >
          Discovery
        </Button>
        <button onClick={handlerGlobalMuted}>{"🔇 Mute All"}</button>

        <select
          value={filterMode}
          onChange={(e) =>
            setFilterMode(e.target.value as "all" | "online" | "offline")
          }
        >
          <option value="online">Online rooms</option>
          <option value="offline">Offline rooms</option>
          <option value="all">All rooms</option>
        </select>

        <button onClick={() => rearrangeWindows(true)}>Arrange</button>
      </LeftOptions>

      <CenterOptions>
        {activeSpaceId === "discovery" ? (
          <DiscoveryControls>
            <select
              value={discoveryLimit}
              onChange={(e) => setDiscoveryLimit(Number(e.target.value))}
            >
              {[6, 12, 24]
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
        ) : null}
      </CenterOptions>

      <RightOptions>
        <SpaceButtons />

        <button
          onClick={() => {
            addSpace(newSpaceName);
            setNewSpaceName("");
          }}
        >
          + Add Space
        </button>

        <DownloadMonitor />
      </RightOptions>
    </ToolbarContainer>
  );
}

export default Toolbar;
