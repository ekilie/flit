import { AudioReel } from "@/app/(core)/scroll/infinite";

export const getTypeColor = (reel: AudioReel) => {
  switch (reel.type) {
    case "music":
      return "#FF6B6B";
    case "podcast":
      return "#4ECDC4";
    case "audiobook":
        return "#6C5CE7";
      case "voicenote":
        return "#FFA726";
      default:
        return reel.color;
    }
  };