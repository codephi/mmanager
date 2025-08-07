import { useState } from "react";
import { Star, StarOutline } from "../icons";
import { WindowHeaderButton } from "./WindowContainer";
import { useSpacesStore } from "../store/spacesStore";

interface Props {
  windowId: string;
  className?: string;
}

export const FavoriteButton: React.FC<Props> = ({ windowId, className }) => {
  const spaces = useSpacesStore((s) => s.spaces);
  const copyWindowToSpace = useSpacesStore((s) => s.copyWindowToSpace);
  const [showMessage, setShowMessage] = useState(false);

  // Verifica se o window já está nos favoritos
  const favoriteSpace = spaces.find((s) => s.id === "favorite");
  const isInFavorites = favoriteSpace?.windows.some((w) => w.id === windowId) ?? false;

  const toggleFavorite = () => {
    if (isInFavorites) {
      // Remove dos favoritos
      // Como não temos uma função de remover, vamos criar uma lógica simples
      if (favoriteSpace) {
        const updatedWindows = favoriteSpace.windows.filter((w) => w.id !== windowId);
        useSpacesStore.getState().updateSpace("favorite", {
          ...favoriteSpace,
          windows: updatedWindows,
        });
        
        // Não mostra mensagem para remoção por enquanto
        // setShowMessage(true);
        // setTimeout(() => setShowMessage(false), 2000);
      }
    } else {
      // Adiciona aos favoritos
      copyWindowToSpace(windowId, "favorite");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    }
  };

  return (
    <>
      <WindowHeaderButton className={className} onClick={toggleFavorite}>
        {isInFavorites ? (
          <Star style={{ color: "#ffd700" }} />
        ) : (
          <StarOutline />
        )}
      </WindowHeaderButton>
      
      {showMessage && (
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "10px",
            backgroundColor: "var(--dark-color)",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            zIndex: 9999,
            whiteSpace: "nowrap",
          }}
        >
          Added to Favorites
        </div>
      )}
    </>
  );
};
