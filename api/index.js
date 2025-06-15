import { Router } from 'itty-router';

const router = Router();

/**
 * GET /api/chaturbate?limit=10&offset=0&...   →   proxy
 */
router.get('/api/chaturbate', async (request) => {
    const { search } = new URL(request.url);          // inclui o '?'
    const target = `https://chaturbate.com/api/ts/roomlist/room-list/${search}`;

    // Faz a requisição “lá fora”
    const upstream = await fetch(target, {
        // opcional: envie alguns cabeçalhos do cliente original
        headers: {
            'User-Agent': request.headers.get('User-Agent') || '',
            'Accept': request.headers.get('Accept') || '*/*',
        },
    });

    // devolve tudo idêntico ao cliente
    return new Response(await upstream.body?.getReader().read().then(() => upstream.clone().body), {
        status: upstream.status,
        headers: {
            'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
            'Access-Control-Allow-Origin': '*',          // CORS aberto
        },
    });
});

/**
 * Qualquer outra rota → arquivo estático do PWA (./dist)
 */
router.all('*', (request, env /*, ctx */) => {
    return env.ASSETS.fetch(request);
});

export default {
    /**
     * @param {Request} request
     * @param {*}       env   – bindings (ASSETS, KV, etc.)
     * @param {*}       ctx   – ExecutionContext
     */
    fetch: (request, env, ctx) => router.handle(request, env, ctx),
};
