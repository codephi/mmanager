import { useState, useEffect } from "react";
import styled from "styled-components";
import { downloadManager, useDownloadStore } from "../store/downloadStore";
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
  background: rgba(0, 0, 0, 0.8);
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const TimeText = styled.span`
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 8px;
`;

const StopButton = styled.button`
  background: rgba(255, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: white;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const SelectQuality = styled.select`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: #fff;
  border-radius: 6px;
  padding: 6px 10px;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  option {
    background: rgba(0, 0, 0, 0.9);
    color: #fff;
  }
`;

const MainButton = styled.button`
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
  const [open, setOpen] = useState(false);
  const stop = useDownloadStore((s) => s.stop); // <-- este é o correto agora!
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

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
                    <StopButton onClick={() => stop(d.id)}>⏹</StopButton>
                  </div>
                </HeaderRow>

                <div>
                  <SelectQuality
                    onChange={(e) => {
                      const index = parseInt(e.target.value, 10);
                      downloadManager.setLevel(d.id, index);
                    }}
                  >
                    {levels.map((level, index) => (
                      <option key={index} value={index}>
                        {level.height}p ({Math.round(level.bitrate / 1000)}{" "}
                        kbps)
                      </option>
                    ))}
                  </SelectQuality>
                </div>
              </DownloadItem>
            );
          })}
        </Dropdown>
      )}
      <MainButton onClick={() => setOpen(!open)}>
        📥 {downloads.length > 0 && `(${downloads.length})`}
      </MainButton>
    </Container>
  );
};
