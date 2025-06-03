import React from "react";
import { useSpacesStore } from "../store/spacesStore";
import { Button, SpaceButton } from "./SpaceButton";

function SpaceButtons() {
  const spaces = useSpacesStore((s) => s.getSpaces());
  const activeSpaceId = useSpacesStore((s) => s.activeSpaceId);
  const switchSpace = useSpacesStore((s) => s.setActiveSpace);
  const isDiscovery = activeSpaceId === "discovery";

  return (
    <>
      <Button
        key={"discovery"}
        onClick={() => switchSpace("discovery")}
        $active={isDiscovery}
      >
        Discovery
      </Button>
      {spaces
        .filter((space) => space.id !== "discovery")
        .map((space) => (
          <SpaceButton
            key={space.id}
            active={space.id === activeSpaceId}
            space={space}
          />
        ))}
    </>
  );
}

export default SpaceButtons;
