import React, { useState } from "react";
import styled from "styled-components";

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

const RenameButton = styled.button`
  font-size: 12px;
`;

interface SpaceOptionProps {
  space: {
    id: string;
    name: string;
    autoArrange: boolean;
  };
  renamingSpaceId: string | null;
  setRenamingSpaceId: (id: string | null) => void;
  renameValue: string;
  setRenameValue: (value: string) => void;
  renameSpace: (id: string, name: string) => void;
  toggleAutoArrange: (id: string) => void;
  removeSpace: (id: string) => void;
  addStream: () => void;
}

export function SpaceOption({
  space,
  renamingSpaceId,
  setRenamingSpaceId,
  renameValue,
  setRenameValue,
  renameSpace,
  toggleAutoArrange,
  removeSpace,
  addStream,
}: SpaceOptionProps) {
  const [room, setRoom] = useState("");

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
        space.name
      )}
      <RenameButton
        onClick={() => {
          setRenamingSpaceId(space.id);
          setRenameValue(space.name);
        }}
      >
        ✏️
      </RenameButton>
      <Label>
        <input
          type="checkbox"
          checked={space.autoArrange}
          onChange={() => toggleAutoArrange(space.id)}
        />
        Auto Grid
      </Label>
      <Label>
        <button onClick={() => removeSpace(space.id)}>Remover Space</button>
      </Label>
      <Label>
        <input
          type="text"
          placeholder="Nome da Sala"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={addStream}>Adicionar Stream</button>
      </Label>
    </SpaceContainer>
  );
}
