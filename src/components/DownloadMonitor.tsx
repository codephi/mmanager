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
  background: white;
  color: black;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  min-width: 350px;
  max-height: 600px;
  overflow-y: auto;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  background-color: var(--primary-color);
  color: var(--text-color);
`;

const DownloadItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TimeText = styled.span`
  font-size: 0.9em;
  color: gray;
`;

const StopButton = styled.button`
  background: red;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 3px 8px;
  cursor: pointer;
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
                  <select
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
                  </select>
                </div>
              </DownloadItem>
            );
          })}
        </Dropdown>
      )}
      <button onClick={() => setOpen(!open)}>
        📥 {downloads.length > 0 && `(${downloads.length})`}
      </button>
    </Container>
  );
};
