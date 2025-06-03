import React from 'react';
import styled from 'styled-components';

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

export function SpaceOption({
    space,
    renamingSpaceId,
    setRenamingSpaceId,
    renameValue,
    setRenameValue,
    renameSpace,
    toggleAutoArrange,
}: any) {
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
                        if (e.key === 'Enter') {
                            renameSpace(space.id, renameValue);
                            setRenamingSpaceId(null);
                        }
                    }}
                    autoFocus
                />
            ) : space.name}
            <RenameButton onClick={() => {
                setRenamingSpaceId(space.id);
                setRenameValue(space.name);
            }}>
                ✏️
            </RenameButton>
            <Label>
                <input type="checkbox" checked={space.autoArrange} onChange={() => toggleAutoArrange(space.id)} />
                Auto Grid
            </Label>
        </SpaceContainer>
    );
}
