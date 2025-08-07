import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useDiscoveryStore } from "../store/discoveryStore";
import { useSpacesStore } from "../store/spacesStore";
import { Pagination } from "./Pagination";
import { DownloadMonitor } from "./DownloadMonitor";
import { Button } from "./SpaceButton";
import { rearrangeWindows } from "../utils/rearrangeWindows";
import { AudioMute, Star } from "../icons";

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

const AudioMuteIcon = styled(AudioMute)`
  font-size: 16px;
  margin-right: 6px;
`

function Toolbar() {
  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // Spaces agora vindo do spacesStore
  const spaces = useSpacesStore((s) => s.getSpaces());
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
  
  // Determina se estamos na rota discovery ou favorites
  const isDiscovery = location.pathname === "/";
  const isFavorites = location.pathname === "/favorites";
  
  // Conta favoritos online
  const favoriteSpace = spaces.find((s) => s.id === "favorite");
  const favoritesOnlineCount = favoriteSpace?.windows.filter((w) => w.isOnline === true).length ?? 0;

  const handlerGlobalMuted = () => {
    setGlobalMuted(true);
  };

  return (
    <ToolbarContainer>
      <LeftOptions>
        <Button
          key={"discovery"}
          onClick={() => navigate("/")}
          $active={isDiscovery}
        >
          Discovery
        </Button>
        <Button
          key={"favorites"}
          onClick={() => navigate("/favorites")}
          $active={isFavorites}
        >
          <Star size={16} style={{ color: "#ffd700", marginRight: "6px" }} />
          Favorites {favoritesOnlineCount > 0 && `(${favoritesOnlineCount})`}
        </Button>
        <button onClick={handlerGlobalMuted}><AudioMuteIcon size={16}/>Mute All</button>

        <button onClick={() => rearrangeWindows(true)}>Arrange</button>
      </LeftOptions>

      <CenterOptions>
        {isDiscovery ? (
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
        <DownloadMonitor />
      </RightOptions>
    </ToolbarContainer>
  );
}

export default Toolbar;
