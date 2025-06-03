import React, { useState } from "react";
import styled from "styled-components";
import { useSpacesStore } from "../store/spacesStore";
import type { SpaceConfig } from "../store/types";

const SpaceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const RenameInput = styled.input`
  font-size: 14px;
  text-align: center;
`;

const RenameButton = styled.button`
  font-size: 12px;
`;

export const Button = styled.button<{ $active?: boolean }>`
  background-color: ${({ $active }) =>
    $active ? "var(--primary-color-hover)" : "var(--primary-color)"};
`;

const AutoArrange = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  white-space: nowrap;
  background-color: var(--primary-color);
  border-radius: var(--border-radius);
`;

interface SpaceButtonProps {
  space: SpaceConfig;
  active: boolean;
}

export function SpaceButton({ space, active }: SpaceButtonProps) {
  const [renameValue, setRenameValue] = useState("");
  const [renamingSpaceId, setRenamingSpaceId] = useState<string | null>(null);
  const renameSpace = useSpacesStore((s) => s.renameSpace);
  const switchSpace = useSpacesStore((s) => s.setActiveSpace);
  const removeSpace = useSpacesStore((s) => s.removeSpace);
  const toggleAutoArrange = useSpacesStore((s) => s.toggleAutoArrange);

  if (!space) return null;

  return (
    <SpaceContainer>
      {renamingSpaceId === space.id ? (
        <RenameInput
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={() => {
            renameSpace(space.id, renameValue);
            setRenamingSpaceId(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              renameSpace(space.id, renameValue);
              setRenamingSpaceId(null);
            }
          }}
          autoFocus
        />
      ) : (
        <Button
          key={space.id}
          onClick={() => switchSpace(space.id)}
          $active={active}
        >
          {space.name} ({space.windows.length})
        </Button>
      )}
      {active && (
        <>
          <RenameButton
            onClick={() => {
              setRenamingSpaceId(space.id);
              setRenameValue(space.name);
            }}
          >
            ✏️
          </RenameButton>
          <button onClick={() => removeSpace(space.id)} title="Remover espaço">
            ❌
          </button>
          <AutoArrange
            className="button"
            onClick={() => toggleAutoArrange(space.id)}
          >
            <input
              type="checkbox"
              checked={space.autoArrange}
              onChange={() => toggleAutoArrange(space.id)}
            />
            Auto Arrange
          </AutoArrange>
        </>
      )}
    </SpaceContainer>
  );
}
