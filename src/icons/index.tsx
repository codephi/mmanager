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
