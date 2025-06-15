import { useSpacesStore } from "../store/spacesStore";
import { SpaceButton } from "./SpaceButton";

function SpaceButtons() {
  const spaces = useSpacesStore((s) => s.getSpaces());
  const activeSpaceId = useSpacesStore((s) => s.activeSpaceId);
  const filterMode = useSpacesStore((s) => s.filterMode);

  return (
    <>
      {spaces
        .filter((space) => space.id !== "discovery")
        .map((space) => (
          <SpaceButton
            key={space.id}
            active={space.id === activeSpaceId}
            space={space}
            filterMode={filterMode}
          />
        ))}
    </>
  );
}

export default SpaceButtons;
