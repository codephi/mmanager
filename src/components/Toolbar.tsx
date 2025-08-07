import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useDiscoveryStore } from "../store/discoveryStore";
import { useSpacesStore } from "../store/spacesStore";
import { Pagination } from "./Pagination";
import { DownloadMonitor } from "./DownloadMonitor";
import { Button } from "./SpaceButton";
import { rearrangeWindows } from "../utils/rearrangeWindows";
import { AudioMute, Star, Search, Arrange } from "../icons";
import { useMobile } from "../hooks/useMobile";

// Styled Components
const ToolbarContainer = styled.div<{ $isMobile: boolean }>`
  padding: ${({ $isMobile }) => $isMobile ? '8px' : '10px'};
  display: flex;
  gap: ${({ $isMobile }) => $isMobile ? '0.25rem' : '0.5rem'};
  flex-wrap: wrap;
  flex-direction: ${({ $isMobile }) => $isMobile ? 'column' : 'row'};
  align-items: center;
  justify-content: ${({ $isMobile }) => $isMobile ? 'stretch' : 'space-between'};
  z-index: 1000000;
  
  @media (max-width: 768px) {
    padding: 8px;
    gap: 0.25rem;
    flex-direction: column;
    justify-content: stretch;
  }
`;

const DiscoveryControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const LeftOptions = styled.div<{ $isMobile: boolean }>`
  display: flex;
  flex: ${({ $isMobile }) => $isMobile ? 'unset' : '1'};
  width: ${({ $isMobile }) => $isMobile ? '100%' : 'auto'};
  align-items: center;
  flex-direction: row;
  justify-content: ${({ $isMobile }) => $isMobile ? 'center' : 'flex-start'};
  gap: ${({ $isMobile }) => $isMobile ? '0.25rem' : '0.5rem'};
  
  @media (max-width: 768px) {
    flex: unset;
    width: 100%;
    justify-content: center;
    gap: 0.25rem;
  }
`;

const RightOptions = styled.div<{ $isMobile: boolean }>`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: ${({ $isMobile }) => $isMobile ? 'center' : 'flex-end'};
  flex: ${({ $isMobile }) => $isMobile ? 'unset' : '1'};
  width: ${({ $isMobile }) => $isMobile ? '100%' : 'auto'};
  gap: ${({ $isMobile }) => $isMobile ? '0.25rem' : '0.5rem'};
  
  @media (max-width: 768px) {
    flex: unset;
    width: 100%;
    justify-content: center;
    gap: 0.25rem;
  }
`;

const CenterOptions = styled.div<{ $isMobile: boolean }>`
  display: flex;
  align-items: center;
  flex: ${({ $isMobile }) => $isMobile ? 'unset' : '1'};
  width: ${({ $isMobile }) => $isMobile ? '100%' : 'auto'};
  flex-direction: row;
  justify-content: center;
  gap: ${({ $isMobile }) => $isMobile ? '0.25rem' : '0.5rem'};
  
  @media (max-width: 768px) {
    flex: unset;
    width: 100%;
    gap: 0.25rem;
  }
`;

const AudioMuteIcon = styled(AudioMute)`
  font-size: 16px;
  margin-right: 6px;
`;

const MobileButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  min-width: 32px;
  min-height: 32px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

function Toolbar() {
  // Mobile detection
  const { isMobile } = useMobile();
  
  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // Spaces agora vindo do spacesStore
  const spaces = useSpacesStore((s) => s.getSpaces());
  // Windows e Discovery seguem igual
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

  if (isMobile) {
    return (
      <ToolbarContainer $isMobile={isMobile}>
        {/* Linha 1: Paginação (apenas em Discovery) */}
        {isDiscovery && (
          <CenterOptions $isMobile={isMobile}>
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
                isMobile={isMobile}
              />
            </DiscoveryControls>
          </CenterOptions>
        )}
        
        {/* Linha 2: Todos os botões */}
        <LeftOptions $isMobile={isMobile}>
          <Button
            key={"discovery"}
            onClick={() => navigate("/")}
            $active={isDiscovery}
            title="Discovery"
          >
            <Search size={16} />
          </Button>
          <Button
            key={"favorites"}
            onClick={() => navigate("/favorites")}
            $active={isFavorites}
            title={`Favorites ${favoritesOnlineCount > 0 ? `(${favoritesOnlineCount})` : ""}`}
          >
            <Star size={16} style={{ color: "#ffd700" }} />
          </Button>
          <MobileButton onClick={handlerGlobalMuted} title="Mute All">
            <AudioMute size={16} />
          </MobileButton>
          <MobileButton onClick={() => rearrangeWindows(true)} title="Arrange">
            <Arrange size={16} />
          </MobileButton>
          <DownloadMonitor />
        </LeftOptions>
      </ToolbarContainer>
    );
  }

  // Layout Desktop
  return (
    <ToolbarContainer $isMobile={isMobile}>
      <LeftOptions $isMobile={isMobile}>
        <Button
          key={"discovery"}
          onClick={() => navigate("/")}
          $active={isDiscovery}
        >
          <Search size={16} style={{ marginRight: "6px" }} />
          Discovery
        </Button>
        <Button
          key={"favorites"}
          onClick={() => navigate("/favorites")}
          $active={isFavorites}
        >
          <Star size={16} style={{ color: "#ffd700", marginRight: "6px" }} />
          {`Favorites ${favoritesOnlineCount > 0 ? `(${favoritesOnlineCount})` : ""}`}
        </Button>
        <button onClick={handlerGlobalMuted}><AudioMuteIcon size={16}/>Mute All</button>
        <button onClick={() => rearrangeWindows(true)}><Arrange size={16} style={{ marginRight: "6px" }} />Arrange</button>
      </LeftOptions>

      <CenterOptions $isMobile={isMobile}>
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

      <RightOptions $isMobile={isMobile}>
        <DownloadMonitor />
      </RightOptions>
    </ToolbarContainer>
  );
}

export default Toolbar;
