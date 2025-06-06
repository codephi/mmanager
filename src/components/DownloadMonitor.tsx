import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDownloadStore } from "../store/downloadStore";

const Container = styled.div`
  position: relative;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  color: black;
  border: 1px solid #ccc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 250px;
  max-height: 400px;
  overflow-y: auto;
`;

const DownloadItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid #eee;
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
  const stopDownload = useDownloadStore((s) => s.stopDownload);
  const [, setTick] = useState(0); // forçar re-render a cada segundo

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (start: number) => {
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
      <button onClick={() => setOpen(!open)}>
        📥 {downloads.length > 0 && `(${downloads.length})`}
      </button>
      {open && (
        <Dropdown>
          {downloads.length === 0 ? (
            <div style={{ padding: "10px" }}>Nenhum download</div>
          ) : (
            downloads.map((d) => (
              <DownloadItem key={d.id}>
                <div>
                  <div>{d.room}</div>
                  <TimeText>{formatDuration(d.startTime)}</TimeText>
                </div>
                <StopButton
                  onClick={() => {
                    d.stop();
                    stopDownload(d.id);
                  }}
                >
                  ⏹ Parar
                </StopButton>
              </DownloadItem>
            ))
          )}
        </Dropdown>
      )}
    </Container>
  );
};
