import { useState, useEffect } from "react";
import styled from "styled-components";
import { downloadManager, useDownloadStore } from "../store/downloadStore";
import { Download, Stop } from "../icons";
import { useMobile } from "../hooks/useMobile";
const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const Dropdown = styled.div<{ $isMobile: boolean }>`
  position: ${({ $isMobile }) => $isMobile ? 'fixed' : 'absolute'};
  ${({ $isMobile }) => $isMobile ? `
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  ` : `
    bottom: calc(100% + 1rem);
    right: 0;
  `}
  background:  var(--primary-color-alpha);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #fff;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  min-width: ${({ $isMobile }) => $isMobile ? '90vw' : '350px'};
  max-width: ${({ $isMobile }) => $isMobile ? '90vw' : '500px'};
  max-height: ${({ $isMobile }) => $isMobile ? '80vh' : '600px'};
  overflow-y: auto;
  border-radius: 12px;
  z-index: ${({ $isMobile }) => $isMobile ? '99999' : '999'};
  
  @media (max-width: 768px) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 90vw;
    max-width: 90vw;
    max-height: 80vh;
    z-index: 99999;
  }
`;

const DownloadItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
  text-align: center;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;

  div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const TimeText = styled.span`
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 8px;
`;

const SizeText = styled.span`
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 8px;
`;

const StopButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 59, 48, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: rgba(255, 59, 48, 0.9);
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
  
  &:hover {
    background: rgba(255, 59, 48, 0.2);
    border-color: rgba(255, 59, 48, 0.5);
    color: rgba(255, 59, 48, 1);
    box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
  }
  
`;

const QualityButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
`;

const QualityButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  min-width: 60px;
  min-height: 50px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8em;
  font-weight: 500;
  
  background: ${({ $active }) => $active ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ $active }) => $active ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
  
  &:hover {
    background: ${({ $active }) => $active ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.2)'};
    border-color: ${({ $active }) => $active ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const QualityText = styled.div`
  font-weight: bold;
  line-height: 1;
`;

const BitrateText = styled.div`
  font-size: 0.75em;
  opacity: 0.8;
  margin-top: 2px;
  line-height: 1;
`;

const MainButton = styled.button`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99998;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

export const DownloadMonitor: React.FC = () => {
  const { isMobile } = useMobile();
  const downloads = useDownloadStore((s) => s.downloads);
  const refresh = useDownloadStore((s) => s.refresh);
  const [open, setOpen] = useState(false);
  const stop = useDownloadStore((s) => s.stop); // <-- este é o correto agora!
  const [, setTick] = useState(0);
  const [currentLevels, setCurrentLevels] = useState<Record<string, number>>({});
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      // Só atualiza se há downloads ativos
      if (downloads.length > 0) {
        refresh();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [refresh, downloads.length]);

  const formatDuration = (start?: number) => {
    if (!start) return "--:--:--";
    const diff = Math.floor((Date.now() - start) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getCurrentLevel = (downloadId: string) => {
    return currentLevels[downloadId] ?? 0;
  };

  return (
    <Container>
      {open && isMobile && <Overlay onClick={() => setOpen(false)} />}
      {open && (
        <Dropdown $isMobile={isMobile} style={{ display: open ? "block" : "none" }}>
          {downloads.length > 0 ? (
            downloads.map((d) => {
              const levels = downloadManager.getLevels(d.id);
              return (
                <DownloadItem key={d.id}>
                  <HeaderRow>
                    <div>{d.room}</div>
                    <div>
                      <TimeText>{formatDuration(d.startTime)}</TimeText>
                      <SizeText>{formatSize(d.totalBytes)}</SizeText>
                      <StopButton onClick={() => stop(d.id)} title="Stop Download">
                        <Stop size={14} />
                      </StopButton>
                    </div>
                  </HeaderRow>

                  <QualityButtonContainer>
                    {levels.slice(0, 4).map((level, index) => {
                      const currentIndex = getCurrentLevel(d.id);
                      const isActive = currentIndex === index;
                      
                      return (
                        <QualityButton
                          key={index}
                          $active={isActive}
                          onClick={() => {
                            setCurrentLevels(prev => ({ ...prev, [d.id]: index }));
                            downloadManager.setLevel(d.id, index);
                          }}
                          title={`${level.height}p - ${Math.round(level.bitrate / 1000)} kbps`}
                        >
                          <QualityText>{level.height}p</QualityText>
                          <BitrateText>{Math.round(level.bitrate / 1000)}k</BitrateText>
                        </QualityButton>
                      );
                    })}
                  </QualityButtonContainer>
                </DownloadItem>
              );
            })
          ) : (
            <EmptyState>
              No active downloads
            </EmptyState>
          )}
        </Dropdown>
      )}
      <MainButton onClick={() => setOpen(!open)}>
        <Download size={18} style={{ marginRight: downloads.length > 0 ? "6px" : "0" }} />
        {downloads.length > 0 && `(${downloads.length})`}
      </MainButton>
    </Container>
  );
};
