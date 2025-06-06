export async function getStreamUrlForRoom(
  room: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://chaturbate.com/api/chatvideocontext/${room}/`
    );
    const data = await res.json();
    return data.hls_source ?? null;
  } catch (err) {
    console.error("Erro ao buscar HLS source:", err);
    return null;
  }
}
