import { Router } from 'itty-router';

const router = Router();

router.get('/api/chaturbate', async (request) => {
    const { search } = new URL(request.url);
    const res = await fetch(`https://chaturbate.com/api/ts/roomlist/room-list/${search}`);
    return new Response(await res.text(), {
        status: res.status,
        headers: {
            'Content-Type': res.headers.get('Content-Type') || 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
});

router.all('*', (request, env) => {
    return env.ASSETS.fetch(request);
});

export default {
    fetch(request, env, ctx) {
        return router.handle(request, env, ctx);
    }
};
