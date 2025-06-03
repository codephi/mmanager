import React, { useState, useRef, useEffect } from "react";
import { WindowHeaderButton } from "./VideoWindow";
import styled from "styled-components";
import { AudioMute, AudioUnmute } from "../icons";

const SliderContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  width: 30px;
  height: 120px;
  background: var(--primary-color);
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  z-index: 9999;
  transform: translate(-50%, 5px);
`;

const Slider = styled.input.attrs({ type: "range" })<{ value: number }>`
  -webkit-appearance: none;
  appearance: none;
  writing-mode: vertical-rl;
  width: 10px;
  height: 100px;
  margin: 0;
  padding: 0;
  transform: rotate(180deg);
  background: linear-gradient(
    to top,
    #ddd 0%,
    #ddd ${({ value }) => 100 - value * 100}%,
    var(--primary-color-hover) ${({ value }) => 100 - value * 100}%,
    var(--primary-color-hover) 100%
  );

  border-radius: 5px;
  border: none;

  /* Thumb */
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-color-hover);
    border: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    transition: background 0.3s ease;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-color-hover);
    border: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    transition: background 0.3s ease;
  }
`;

interface VolumeControlProps {
  muted: boolean;
  volume: number; // 0 ~ 1
  onMuteToggle: () => void;
  onVolumeChange: (value: number) => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  muted,
  volume,
  onMuteToggle,
  onVolumeChange,
}) => {
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !dragging &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setHover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dragging]);

  const delayedClose = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHover(false);
    }, 300); // delay de 300ms
  };

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        cancelClose();
        setHover(true);
      }}
      onMouseLeave={() => {
        if (!dragging) delayedClose();
      }}
      style={{ position: "relative" }}
      className="no-drag"
    >
      <WindowHeaderButton onClick={onMuteToggle}>
        {muted || volume === 0 ? <AudioMute /> : <AudioUnmute />}
      </WindowHeaderButton>

      {hover && (
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onMouseDown={() => setDragging(true)}
            onMouseUp={() => setDragging(false)}
            onTouchStart={() => setDragging(true)}
            onTouchEnd={() => setDragging(false)}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          />
        </SliderContainer>
      )}
    </div>
  );
};
