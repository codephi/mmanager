import React from "react";
import CopySVG from "./copy.svg?react";
import AudioMuteSVG from "./audio-mute.svg?react";
import AudioUnmuteSVG from "./audio-unmute.svg?react";
import PinSVG from "./pin.svg?react";
import UnpinSVG from "./unpin.svg?react";

export interface IconProps {
  size?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

export const Copy = ({ size = 16, ...props }: IconProps) => (
  <CopySVG {...props} width={size} height={size} />
);

export const AudioMute = ({ size = 25, ...props }: IconProps) => (
  <AudioMuteSVG {...props} width={size} height={size} />
);

export const AudioUnmute = ({ size = 25, ...props }: IconProps) => (
  <AudioUnmuteSVG {...props} width={size} height={size} />
);

export const Pin = ({ size = 25, ...props }: IconProps) => (
  <PinSVG {...props} width={size} height={size} />
);

export const Unpin = ({ size = 25, ...props }: IconProps) => (
  <UnpinSVG {...props} width={size} height={size} />
);
