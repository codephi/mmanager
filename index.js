export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const pathname = url.pathname;

        if (pathname.startsWith("/api/chaturbate")) {
            const targetUrl = `https://chaturbate.com/api/ts/roomlist/room-list/${url.search}`;

            const response = await fetch(targetUrl);

            return new Response(await response.text(), {
                status: response.status,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "winturbate.com", // CORS liberado
                },
            });
        }

        // fallback para qualquer outra rota → arquivos estáticos (dist/)
        return env.ASSETS.fetch(request);
    },
};
