import { useState } from "react";
import styled from "styled-components";
import { useSpacesStore, type FilterMode } from "../store/spacesStore";
import type { SpaceConfig } from "../store/types";

const SpaceContainer = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  ${({ $active }) =>
    $active
      ? `
    input,
    button {
      color: var(--text-color);
      background-color: var(--primary-color-hover);}

  `
      : ""}
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

interface SpaceButtonProps {
  space: SpaceConfig;
  active: boolean;
  filterMode: FilterMode;
}

export function SpaceButton({ space, active, filterMode }: SpaceButtonProps) {
  const [renameValue, setRenameValue] = useState("");
  const [renamingSpaceId, setRenamingSpaceId] = useState<string | null>(null);
  const renameSpace = useSpacesStore((s) => s.renameSpace);
  const switchSpace = useSpacesStore((s) => s.setActiveSpace);
  const removeSpace = useSpacesStore((s) => s.removeSpace);

  if (!space) return null;

  const selectWindows = space.windows.filter((window) => {
    if (filterMode === "online") return window.isOnline;
    if (filterMode === "offline") return !window.isOnline;
    return true;
  });

  return (
    <SpaceContainer $active={active}>
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
          {space.name} ({selectWindows.length})
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
        </>
      )}
    </SpaceContainer>
  );
}
