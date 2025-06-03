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
`;

const RenameButton = styled.button`
  font-size: 12px;
`;

export const Button = styled.button<{ $active?: boolean }>`
  background-color: ${({ $active }) =>
    $active ? "var(--primary-color-hover)" : "var(--primary-color)"};
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
      <RenameButton
        onClick={() => {
          setRenamingSpaceId(space.id);
          setRenameValue(space.name);
        }}
      >
        ✏️
      </RenameButton>
    </SpaceContainer>
  );
}
