import { useState, useEffect } from "react";
import styled from "styled-components";
import { downloadManager, useDownloadStore } from "../store/downloadStore";
import { Download, Stop } from "../icons";
const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const Dropdown = styled.div`
  position: absolute;
  bottom: calc(100% + 1rem);
  right: 0;
  background:  var(--primary-color-alpha);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #fff;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  min-width: 350px;
  max-height: 600px;
  overflow-y: auto;
  border-radius: 12px;
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

const QualitySliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const QualityLabel = styled.div`
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
`;

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 4px;
  cursor: pointer;
`;

const SliderTrack = styled.div<{ progress: number }>`
  height: 100%;
  width: ${({ progress }) => progress}%;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1);
  border-radius: 4px;
  transition: all 0.2s ease;
`;

const SliderThumb = styled.div<{ position: number }>`
  position: absolute;
  top: 50%;
  left: ${({ position }) => position}%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.2);
    background: rgba(255, 255, 255, 1);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
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

export const DownloadMonitor: React.FC = () => {
  const downloads = useDownloadStore((s) => s.downloads);
  const refresh = useDownloadStore((s) => s.refresh);
  const [open, setOpen] = useState(false);
  const stop = useDownloadStore((s) => s.stop); // <-- este é o correto agora!
  const [, setTick] = useState(0);
  const [currentLevels, setCurrentLevels] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState<string | null>(null);

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

  const handleSliderChange = (downloadId: string, levels: any[], clientX: number, sliderElement: HTMLElement) => {
    const rect = sliderElement.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const levelIndex = Math.round((percentage / 100) * (levels.length - 1));
    
    setCurrentLevels(prev => ({ ...prev, [downloadId]: levelIndex }));
    downloadManager.setLevel(downloadId, levelIndex);
  };

  const getCurrentLevel = (downloadId: string) => {
    return currentLevels[downloadId] ?? 0;
  };

  const handleMouseDown = (downloadId: string) => {
    setIsDragging(downloadId);
  };

  const handleMouseMove = (e: React.MouseEvent, downloadId: string, levels: any[]) => {
    if (isDragging === downloadId) {
      const sliderElement = e.currentTarget as HTMLElement;
      handleSliderChange(downloadId, levels, e.clientX, sliderElement);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleWheel = (e: React.WheelEvent, downloadId: string, levels: any[]) => {
    e.preventDefault();
    const currentIndex = getCurrentLevel(downloadId);
    const delta = e.deltaY > 0 ? -1 : 1; // Scroll para baixo diminui, para cima aumenta
    const newIndex = Math.max(0, Math.min(levels.length - 1, currentIndex + delta));
    
    if (newIndex !== currentIndex) {
      setCurrentLevels(prev => ({ ...prev, [downloadId]: newIndex }));
      downloadManager.setLevel(downloadId, newIndex);
    }
  };

  // Adicionar event listeners globais para mouseup
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(null);
    
    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mouseleave', handleGlobalMouseUp);
    }
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <Container>
      {open && (
        <Dropdown style={{ display: open ? "block" : "none" }}>
          {downloads.map((d) => {
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

                <QualitySliderContainer>
                  {(() => {
                    const currentIndex = getCurrentLevel(d.id);
                    const currentLevel = levels[currentIndex];
                    const progress = levels.length > 1 ? (currentIndex / (levels.length - 1)) * 100 : 0;
                    
                    return (
                      <>
                        <QualityLabel>
                          {currentLevel ? `${currentLevel.height}p (${Math.round(currentLevel.bitrate / 1000)} kbps)` : 'Loading...'}
                        </QualityLabel>
                        <SliderContainer
                          onClick={(e) => handleSliderChange(d.id, levels, e.clientX, e.currentTarget)}
                          onMouseMove={(e) => handleMouseMove(e, d.id, levels)}
                          onMouseUp={handleMouseUp}
                          onWheel={(e) => handleWheel(e, d.id, levels)}
                        >
                          <SliderTrack progress={progress} />
                          <SliderThumb 
                            position={progress} 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleMouseDown(d.id);
                            }}
                          />
                        </SliderContainer>
                      </>
                    );
                  })()} 
                </QualitySliderContainer>
              </DownloadItem>
            );
          })}
        </Dropdown>
      )}
      <MainButton onClick={() => setOpen(!open)}>
        <Download size={18} style={{ marginRight: downloads.length > 0 ? "6px" : "0" }} />
        {downloads.length > 0 && `(${downloads.length})`}
      </MainButton>
    </Container>
  );
};
