import { useState } from "react";
import styled from "styled-components";
import type { SpaceConfig } from "../store/types";

const SpaceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Label = styled.label`
  color: white;
  font-size: 12px;
`;

const RenameInput = styled.input`
  font-size: 14px;
`;

interface SpaceOptionProps {
  space?: SpaceConfig;
  renameValue: string;
  setRenameValue: (value: string) => void;
  renameSpace: (id: string, name: string) => void;
  toggleAutoArrange: (id: string) => void;
  removeSpace: (id: string) => void;
}

export function SpaceOption({
  space,
  renameValue,
  setRenameValue,
  renameSpace,
  toggleAutoArrange,
  removeSpace,
}: SpaceOptionProps) {
  const [renamingSpaceId, setRenamingSpaceId] = useState<string | null>(null);

  if (!space) return null;

  return (
    <SpaceContainer>
      <button onClick={() => removeSpace(space.id)}>Remove space</button>

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
        space.name
      )}
      <Label>
        <input
          type="checkbox"
          checked={space.autoArrange}
          onChange={() => toggleAutoArrange(space.id)}
        />
        Auto Grid
      </Label>
    </SpaceContainer>
  );
}
