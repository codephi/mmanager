const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());  // permite chamadas de qualquer origem (para facilitar o seu frontend local)


app.get('/proxy/:room', async (req, res) => {
    const { room } = req.params;
    const originalUrl = `https://chaturbate.com/fullvideo/?campaign=XW3KB&signup_notice=1&tour=dU9X&track=default&disable_sound=0&b=${room}`;

    try {
        const response = await axios.get(originalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',  // importante para o servidor do chaturbate não bloquear
            },
        });

        const $ = cheerio.load(response.data);

        // 🔥 Aqui você pode ser bem agressivo para limpar o chat:
        $('#chat-container').remove();
        $('#chat-close-btn').remove();
        $('.chat').remove();

        // Se precisar remover outras partes específicas:
        // $('#outro-id').remove();

        res.send($.html());
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar conteúdo');
    }
});

// Middleware para proxy genérico, ignora se o path já foi registrado
app.use(async (req, res, next) => {
    // Se já foi tratado por alguma rota acima, não faz nada
    if (req.route) return next();

    const targetUrl = `https://chaturbate.com${req.originalUrl}`;
    try {
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
            },
            responseType: 'arraybuffer',
        });

        Object.entries(response.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        res.status(response.status).send(response.data);
    } catch (err) {
        res.status(500).send('Erro ao buscar conteúdo');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy rodando em http://localhost:${PORT}`);
});
