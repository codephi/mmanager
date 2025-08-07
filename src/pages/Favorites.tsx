import { useEffect } from "react";
import { useSpacesStore } from "../store/spacesStore";
import { WindowsGrid } from "../components/WindowsGrid";
import { Pinneds } from "../components/Pinneds";

export const Favorites = () => {
  const setActiveSpace = useSpacesStore((s) => s.setActiveSpace);

  useEffect(() => {
    // Garante que estamos no space favorites
    setActiveSpace("favorite");
  }, [setActiveSpace]);

  return (
    <>
      <Pinneds />
      <WindowsGrid />
    </>
  );
};
