import { useControlledDownload } from "./useControllerDownload";

export function useHlsStreamRecorder() {
  const { start, write, stop, isDownloading } = useControlledDownload();

  return { start, stop, isDownloading, write };
}
