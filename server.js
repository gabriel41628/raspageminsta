const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware para parsing do JSON
app.use(bodyParser.json());

// Função para raspagem com Puppeteer
async function scrapeInstagram(url, numPostagens) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log(`Acessando URL: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('Página carregada, extraindo links...');
        const postLinks = await page.evaluate((numPostagens) => {
            return Array.from(document.querySelectorAll('a[href*="/p/"]'))
                .slice(0, numPostagens)
                .map((link) => link.href);
        }, numPostagens);

        console.log(`Links encontrados: ${postLinks.length}`);
        await browser.close();
        return postLinks;
    } catch (error) {
        console.error('Erro na função scrapeInstagram:', error.message);
        await browser.close();
        throw error;
    }
}

// Endpoint de raspagem
app.post('/raspar', async (req, res) => {
    const { codigo, url, quantidade, postagens } = req.body;

    if (!codigo || !url || !quantidade || !postagens) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
    }

    try {
        console.log(`Iniciando raspagem para o código: ${codigo}`);
        const links = await scrapeInstagram(url, postagens);
        const result = links.map((link) => ({
            codigo,
            url: link,
            quantidade,
        }));

        console.log('Raspagem concluída com sucesso!');
        res.status(200).json(result);
    } catch (error) {
        console.error('Erro no endpoint /raspar:', error.message);
        res.status(500).json({ error: 'Erro ao processar a raspagem. Verifique a URL ou tente novamente mais tarde.' });
    }
});

// Endpoint para exportação
app.post('/exportar', (req, res) => {
    const { codigo, resultados } = req.body;

    if (!codigo || !resultados || !Array.isArray(resultados)) {
        return res.status(400).json({ error: 'Os dados para exportação estão incompletos.' });
    }

    try {
        const content = resultados
            .map(({ url, quantidade }) => `${codigo} | ${url} | ${quantidade}`)
            .join('\n');

        const filePath = `export_${codigo}.txt`;
        fs.writeFileSync(filePath, content);

        res.status(200).json({ message: 'Arquivo exportado com sucesso!', filePath });
    } catch (error) {
        console.error('Erro ao exportar arquivo:', error.message);
        res.status(500).json({ error: 'Erro ao exportar arquivo.' });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
