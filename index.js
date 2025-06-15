export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const pathname = url.pathname;

        if (pathname.startsWith("/api/chaturbate")) {
            const targetUrl = `https://chaturbate.com/api/ts/roomlist/room-list/${url.search}`;

            try {
                const response = await fetch(targetUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0", // simula browser real
                    },
                });

                const contentType = response.headers.get("Content-Type") || "application/json";

                return new Response(await response.text(), {
                    status: response.status,
                    headers: {
                        "Content-Type": contentType,
                        "Access-Control-Allow-Origin": "*", // ou seu domínio exato aqui
                    },
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: "Failed to fetch Chaturbate API", details: err.message }), {
                    status: 502,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                });
            }
        }

        // fallback para arquivos do seu PWA
        return env.ASSETS.fetch(request);
    },
};
