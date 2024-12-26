// Importações necessárias
import express from 'express';
import cors from 'cors';
import { ApifyClient } from 'apify-client';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS para aceitar apenas do seu site
const corsOptions = {
    origin: 'https://viraldemais.pro', // Restrito para seu site específico
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

// Middleware para parsing de JSON
app.use(express.json());

// Configurar a API Apify
const apifyClient = new ApifyClient({
    token: 'apify_api_6nkTvgd9prUHIs8oNylnIfqa46dML4114t7S', // Substitua pelo seu token real
});

// Endpoint de raspagem
app.post('/raspar', async (req, res) => {
    const { codigo, url, quantidade, postagens } = req.body;

    if (!codigo || !url || !quantidade || !postagens) {
        return res.status(400).json({ error: 'Parâmetros inválidos. Certifique-se de enviar codigo, url, quantidade e postagens.' });
    }

    try {
        console.log(`Executando o ator para o perfil: ${url}`);

        // Configurar entrada para o ator
        const input = {
            directUrls: [url],
            resultsType: 'posts',
            resultsLimit: postagens,
            searchType: 'profile',
            addParentData: false,
        };

        // Executar o ator
        const run = await apifyClient.actor('shu8hvrXbJbY3Eb9W').call(input);
        console.log('🚀 Ator concluído com sucesso:', run);

        // Obter resultados do dataset
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
        console.log('💾 Dados obtidos:', items);

        // Formatar resposta
        const formattedResults = items.map((item) => ({
            codigo,
            url: item.url,
            quantidade,
        }));

        return res.json(formattedResults);
    } catch (error) {
        console.error('Erro no endpoint /raspar:', error.message);
        return res.status(500).json({ error: 'Erro ao processar a raspagem.' });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

