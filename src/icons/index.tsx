import React from "react";
import CopySVG from "./copy.svg?react";

export interface IconProps {
  size?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

export const Copy = ({ size = 18, ...props }: IconProps) => (
  <CopySVG {...props} width={size} height={size} />
);
