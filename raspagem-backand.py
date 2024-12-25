const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simulação de raspagem de postagens do Instagram
async function scrapeInstagramPosts(profileUrl, postCount) {
    try {
        const response = await axios.get(profileUrl);
        const $ = cheerio.load(response.data);

        // Seleciona os links das postagens (exemplo de seletor baseado no Instagram)
        const postLinks = [];
        $('a').each((index, element) => {
            const href = $(element).attr('href');
            if (href && href.includes('/p/')) {
                postLinks.push(`https://www.instagram.com${href}`);
            }
        });

        // Retorna os links limitados pela quantidade solicitada
        return postLinks.slice(0, postCount);
    } catch (error) {
        console.error('Erro ao raspar o Instagram:', error.message);
        throw new Error('Erro ao acessar o perfil do Instagram. Verifique o URL e tente novamente.');
    }
}

// Rota principal para raspagem
app.post('/raspar', async (req, res) => {
    const { codigo, url, quantidade, postagens } = req.body;

    if (!codigo || !url || !quantidade || !postagens) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        const posts = await scrapeInstagramPosts(url, parseInt(postagens, 10));

        // Formata os resultados
        const formattedPosts = posts.map((post) => ({
            codigo,
            url: post,
            quantidade,
        }));

        res.json(formattedPosts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
