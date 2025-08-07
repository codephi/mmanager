import React from "react";
import CopySVG from "./copy.svg?react";
import AudioMuteSVG from "./audio-mute.svg?react";
import AudioUnmuteSVG from "./audio-unmute.svg?react";
import PinSVG from "./pin.svg?react";
import UnpinSVG from "./unpin.svg?react";
import CloseSVG from "./close.svg?react";
import MaximizeSVG from "./maximize.svg?react";
import MinimizeSVG from "./minimize.svg?react";
import RecordSVG from "./record.svg?react";
import StarSVG from "./star.svg?react";
import StarOutlineSVG from "./star-outline.svg?react";
import ChevronLeftSVG from "./chevron-left.svg?react";
import ChevronRightSVG from "./chevron-right.svg?react";
import DownloadSVG from "./download.svg?react";

export interface IconProps {
  size?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

export const Copy = ({ size = 18, ...props }: IconProps) => (
  <CopySVG {...props} width={size} height={size} />
);

export const AudioMute = ({ size = 25, ...props }: IconProps) => (
  <AudioMuteSVG {...props} width={size} height={size} />
);

export const AudioUnmute = ({ size = 25, ...props }: IconProps) => (
  <AudioUnmuteSVG {...props} width={size} height={size} />
);

export const Pin = ({ size = 22, ...props }: IconProps) => (
  <PinSVG {...props} width={size} height={size} />
);

export const Unpin = ({ size = 22, ...props }: IconProps) => (
  <UnpinSVG {...props} width={size} height={size} />
);

export const Close = ({ size = 22, ...props }: IconProps) => (
  <CloseSVG {...props} width={size} height={size} />
);

export const Maximize = ({ size = 22, ...props }: IconProps) => (
  <MaximizeSVG {...props} width={size} height={size} />
);
export const Minimize = ({ size = 22, ...props }: IconProps) => (
  <MinimizeSVG {...props} width={size} height={size} />
);
export const Record = ({ size = 22, ...props }: IconProps) => (
  <RecordSVG {...props} width={size} height={size} />
);

export const Star = ({ size = 22, ...props }: IconProps) => (
  <StarSVG {...props} width={size} height={size} />
);

export const StarOutline = ({ size = 22, ...props }: IconProps) => (
  <StarOutlineSVG {...props} width={size} height={size} />
);

export const ChevronLeft = ({ size = 18, ...props }: IconProps) => (
  <ChevronLeftSVG {...props} width={size} height={size} />
);

export const ChevronRight = ({ size = 18, ...props }: IconProps) => (
  <ChevronRightSVG {...props} width={size} height={size} />
);

export const Download = ({ size = 20, ...props }: IconProps) => (
  <DownloadSVG {...props} width={size} height={size} />
);

export const Stop = ({ size = 18, ...props }: IconProps) => (
  <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect 
      x="6" 
      y="6" 
      width="12" 
      height="12" 
      rx="2" 
      fill="currentColor"
    />
  </svg>
);

export const Search = ({ size = 18, ...props }: IconProps) => (
  <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle 
      cx="11" 
      cy="11" 
      r="8" 
      stroke="currentColor" 
      strokeWidth="2"
      fill="none"
    />
    <path 
      d="M21 21l-4.35-4.35" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
);
