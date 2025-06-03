import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Copy } from "../icons";
import type { SpaceConfig } from "../store/types";
import { WindowHeaderButton } from "./VideoWindow";

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownItem = styled.div`
  padding: 10px;
  cursor: pointer;
  color: var(--text-color);

  &:hover {
    background-color: var(--primary-color-hover);
    color: var(--text-color);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 100px;
  text-align: center;
  background-color: var(--primary-color);
  border-radius: 5px;
  z-index: 999;
  box-shadow: var(--box-shadow);
  margin-top: 5px;

  ${DropdownItem} {
    &:first-child {
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
    }
    &:last-child {
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
    }
  }
`;

interface Props {
  spaces: SpaceConfig[];
  windowId: string;
  onCopy: (windowId: string, targetSpaceId: string) => void;
  className?: string;
}

export const CopyToSpaceDropdown: React.FC<Props> = ({
  spaces,
  windowId,
  onCopy,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = (spaceId: string) => {
    onCopy(windowId, spaceId);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const delayedClose = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 300);
  };

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  return (
    <DropdownContainer
      ref={containerRef}
      className={className}
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={() => delayedClose()}
    >
      <WindowHeaderButton>
        <Copy />
      </WindowHeaderButton>
      {open && (
        <DropdownMenu>
          {spaces
            .filter((space) => space.id !== "discovery")
            .map((space) => (
              <DropdownItem
                key={space.id}
                onClick={() => handleSelect(space.id)}
              >
                {space.name}
              </DropdownItem>
            ))}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};
