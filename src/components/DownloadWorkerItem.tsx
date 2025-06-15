import { useRef } from "react";
import styled from "styled-components";

interface DownloadWorkerItemProps {
  room: string;
  stopFn: () => void;
  startTime?: number;
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid #eee;
`;

const MiniPlayer = styled.video`
  width: 150px;
  height: 90px;
  border-radius: 4px;
  background: black;
  margin-right: 10px;
`;

const StopButton = styled.button`
  background: red;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 3px 8px;
  cursor: pointer;
  margin-left: 10px;
`;

const TimeText = styled.span`
  font-size: 0.8em;
  color: gray;
`;

export const DownloadWorkerItem: React.FC<DownloadWorkerItemProps> = ({
  room,
  stopFn,
  startTime,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatDuration = () => {
    if (!startTime) return "--:--:--";
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Container>
      <MiniPlayer ref={videoRef} muted autoPlay playsInline />

      <div style={{ flex: 1 }}>
        <div>{room}</div>
        <TimeText>{formatDuration()}</TimeText>
      </div>

      <StopButton onClick={stopFn}>⏹</StopButton>
    </Container>
  );
};
