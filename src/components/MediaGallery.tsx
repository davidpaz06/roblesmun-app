import type { FC } from "react";
import { FaPlay } from "react-icons/fa";
import type { PressItem } from "../interfaces/PressItem";

interface MediaGalleryProps {
  items: PressItem[];
  onMediaClick: (item: PressItem) => void;
}

const MediaGallery: FC<MediaGalleryProps> = ({ items, onMediaClick }) => {
  if (items.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">
        No hay contenido disponible
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className="bg-glass rounded-lg overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform"
          onClick={() => onMediaClick(item)}
        >
          {item.type === "video" ? (
            <div className="relative">
              <video
                className="w-full h-48 object-cover pointer-events-none"
                src={item.url}
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <FaPlay className="text-white text-4xl opacity-70" />
              </div>
            </div>
          ) : (
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjNjY2Ii8+Cjwvc3ZnPgo=";
              }}
            />
          )}
          <div className="p-4">
            <h4 className="font-montserrat-bold text-sm line-clamp-2">
              {item.title}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGallery;
