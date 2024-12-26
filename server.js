import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ApifyClient } from "apify-client";

const app = express();
const PORT = 10000;

// Configuração do Apify Client
const client = new ApifyClient({ token: "apify_api_6nkTvgd9prUHIs8oNylnIfqa46dML4114t7S" });

// Middleware para processar JSON e configurar CORS
app.use(bodyParser.json());
app.use(cors({
    origin: "https://viraldemais.pro", // Restrito ao seu domínio
    methods: ["POST"]
}));

// Endpoint para raspagem
app.post("/raspar", async (req, res) => {
    try {
        const { codigo, url, quantidade, postagens } = req.body;

        // Validação dos parâmetros
        if (!codigo || !url || !quantidade || !postagens) {
            return res.status(400).json({ error: "Parâmetros inválidos." });
        }

        console.log(`Executando o ator para o perfil: ${url}`);

        const runInput = {
            directUrls: [url],
            resultsType: "posts",
            resultsLimit: postagens,
            searchType: "user" // Define que o tipo de busca é por usuário
        };

        // Executar o ator
        const run = await client.actor("shu8hvrXbJbY3Eb9W").call(runInput);

        console.log("Ator executado com sucesso:", run);

        // Obter os dados do dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        if (!items || items.length === 0) {
            console.error("Nenhum dado retornado pelo ator.");
            return res.status(404).json({ error: "Nenhum resultado encontrado." });
        }

        // Formatar resultados
        const formattedResults = items.map(item => ({
            codigo,
            url: item.url,
            quantidade,
        }));

        res.json(formattedResults);
    } catch (error) {
        console.error("Erro no endpoint /raspar:", error.message);
        res.status(500).json({ error: "Erro ao processar a raspagem." });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
