import { useCallback, useRef, useState } from "react";
import streamSaver from "streamsaver";

export function useControlledDownload() {
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(
    null
  );
  const [isDownloading, setIsDownloading] = useState(false);

  const start = useCallback(
    (filename: string) => {
      if (isDownloading) {
        console.warn("Download já em andamento");
        return;
      }

      const fileStream = streamSaver.createWriteStream(filename);
      writerRef.current = fileStream.getWriter();
      setIsDownloading(true);
    },
    [isDownloading]
  );

  const write = useCallback(async (data: string | Uint8Array) => {
    const writer = writerRef.current;
    if (!writer) {
      console.error("Download não iniciado");
      return;
    }

    let chunk: Uint8Array;
    if (typeof data === "string") {
      chunk = new TextEncoder().encode(data);
    } else {
      chunk = data;
    }

    await writer.write(chunk);
  }, []);

  const stop = useCallback(async () => {
    const writer = writerRef.current;
    if (!writer) {
      console.warn("Download não iniciado ou já finalizado");
      return;
    }

    await writer.close();
    writerRef.current = null;
    setIsDownloading(false);
  }, []);

  return { start, write, stop, isDownloading };
}
