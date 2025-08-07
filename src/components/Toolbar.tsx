import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { useDiscoveryStore } from "../store/discoveryStore";
import { useSpacesStore } from "../store/windowsMainStore";
import { Pagination } from "./Pagination";
import { DownloadMonitor } from "./DownloadMonitor";
import { rearrangeWindows } from "../utils/rearrangeWindows";
import { AudioMute, Search, Arrange } from "../icons";
import { useMobile } from "../hooks/useMobile";
import { useAgeGate } from "../hooks/useAgeGate";
import { LimitSelector } from "./LimitSelector";

// Styled Components
const ToolbarContainer = styled.div<{ $isMobile: boolean }>`
  padding: ${({ $isMobile }) => $isMobile ? '8px' : '10px'};
  display: flex;
  gap: ${({ $isMobile }) => $isMobile ? '0.25rem' : '0.5rem'};
  flex-wrap: wrap;
  flex-direction: ${({ $isMobile }) => $isMobile ? 'column' : 'row'};
  align-items: center;
  justify-content: ${({ $isMobile }) => $isMobile ? 'stretch' : 'space-between'};
  z-index: 1000;
  
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

const Button = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $active }) =>
    $active ? "var(--primary-color-hover)" : "rgba(255, 255, 255, 0.1)"};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const MobileButton = styled(Button)`
  min-width: 32px;
  min-height: 32px;
  padding: 8px;
`;

function Toolbar() {
  // Mobile detection
  const { isMobile } = useMobile();
  
  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // Discovery store
  const setGlobalMuted = useSpacesStore((s) => s.setGlobalMuted);
  const discoveryLimit = useDiscoveryStore((s) => s.discoveryLimit);
  const setDiscoveryLimit = useDiscoveryStore((s) => s.setDiscoveryLimit);
  const goToDiscoveryPage = useDiscoveryStore((s) => s.goToDiscoveryPage);
  const currentPage = useDiscoveryStore((s) => s.currentPage);
  const totalPages = useDiscoveryStore((s) => s.totalPages);

  
  // Determina se estamos na rota discovery
  const isDiscovery = location.pathname === "/";
  
  const handlerGlobalMuted = () => {
    setGlobalMuted(true);
  };

  if (isMobile) {
    return (
      <ToolbarContainer $isMobile={isMobile}>
        {isDiscovery && (
          <CenterOptions $isMobile={isMobile}>
            <DiscoveryControls>            
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
          <MobileButton onClick={handlerGlobalMuted} title="Mute All">
            <AudioMute size={16} />
          </MobileButton>
          <MobileButton onClick={() => rearrangeWindows(true)} title="Arrange">
            <Arrange size={16} />
          </MobileButton>
            <LimitSelector
              value={discoveryLimit}
              onChange={setDiscoveryLimit}
              options={[2, 4, 6]}
            />

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
        <button onClick={handlerGlobalMuted}><AudioMuteIcon size={16}/>Mute All</button>
        <button onClick={() => rearrangeWindows(true)}><Arrange size={16} style={{ marginRight: "6px" }} />Arrange</button>
      </LeftOptions>

      <CenterOptions $isMobile={isMobile}>
        {isDiscovery ? (
          <DiscoveryControls>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => goToDiscoveryPage(page)}
            />
          </DiscoveryControls>
        ) : null}
      </CenterOptions>

      <RightOptions $isMobile={isMobile}>
        <LimitSelector
          value={discoveryLimit}
          onChange={setDiscoveryLimit}
          options={[6, 12, 24]}
        />
        <DownloadMonitor />
      </RightOptions>
    </ToolbarContainer>
  );
}

export default Toolbar;
