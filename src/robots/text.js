import fetch from 'node-fetch';
import sentenceBoundaryDetection from 'sbd';
import keyword_extractor from 'keyword-extractor';

async function textRobot(content) {
  try {
    const wikipediaContent = await fetchContentFromWikipedia(content.searchTerm);
    const cleanedContent = cleanWikipediaText(wikipediaContent);
    const sentences = breakContentIntoSentences(cleanedContent);
    const limitedSentences = sentences.slice(0, content.maximumSentences);

    content.sentences = await Promise.all(
      limitedSentences.map(async (sentence) => {
        const keywords = extractKeywords(sentence);
        return {
          text: sentence,
          keywords: keywords,
          images: [],
        };
      })
    );

    content.sourceContentOriginal = cleanedContent;

  } catch (error) {
    console.error('❌ Erro ao processar conteúdo:', error.message);
  }
}

async function fetchContentFromWikipedia(searchTerm) {
  const endpoint = `https://pt.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&format=json&titles=${encodeURIComponent(searchTerm)}&origin=*`;
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
  return text
    .replace(/==+.*?==+/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\([^()]*\)/g, '')
    .trim();
}

function breakContentIntoSentences(text) {
  return sentenceBoundaryDetection.sentences(text);
}

function extractKeywords(sentence) {
  const keywords = keyword_extractor.extract(sentence, {
    language: 'portuguese',
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true
  });

  return keywords;
}

export default textRobot;
