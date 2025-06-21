

import fetch from 'node-fetch';

async function textRobot(content) {
  try {
    const wikipediaContent = await fetchContentFromWikipedia(content);
    const cleanedContent = cleanWikipediaText(wikipediaContent);
    content.sourceContentOriginal = cleanedContent;

    console.log('\n📝 Conteúdo extraído da Wikipedia (limpo):\n');
  } catch (error) {
    console.error('❌ Erro ao buscar conteúdo da Wikipedia:', error.message);
  }
}

async function fetchContentFromWikipedia(content) {
  const endpoint = `https://pt.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&format=json&titles=${encodeURIComponent(content.searchTerm)}&origin=*`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Erro na resposta da Wikipedia: ${response.statusText}`);
  }

  const data = await response.json();
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  const page = pages[pageId];

  if (page.extract) {
    return page.extract;
  } else {
    throw new Error('Nenhum conteúdo encontrado para o termo pesquisado.');
  }
}

function cleanWikipediaText(text) {
  // Remove seções como "== Referências =="
  text = text.replace(/==+.*?==+/g, '');

  // Remove quebras de linha múltiplas e linhas em branco
  text = text.replace(/\n+/g, ' ');

  // Remove espaços duplicados
  text = text.replace(/\s{2,}/g, ' ').trim();

  text = text.replace(/\([^()]*\)/g, '');

  return text;
}

export default textRobot;
