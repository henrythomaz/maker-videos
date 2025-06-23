import fetch from 'node-fetch';
import sentenceBoundaryDetection from 'sbd';
import nlp from 'compromise';
import stopword from 'stopword';

const ptStopwords = stopword['pt'] || [];
const customStopwords = ['que', 'foi', 'um', 'uma', 'como', 'para', 'com', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas'];

function cleanText(text) {
    return text
        .replace(/[.,\/#!?$%\^&\*;:{}=\_`~()]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function extractRelevantKeywords(sentence, maxKeywords = 5) {
    // Limpeza inicial do texto
    const cleanedSentence = cleanText(sentence);
    const doc = nlp(cleanedSentence);

    // 1. Extrair entidades nomeadas (prioridade máxima)
    const people = doc.people().out('array');
    const places = doc.places().out('array');
    const orgs = doc.organizations().out('array');
    const entities = [...people, ...places, ...orgs].map(cleanText);

    // 2. Extrair substantivos e adjetivos importantes
    const nouns = doc.nouns().out('array');
    const adjectives = doc.adjectives().out('array');
    const topics = [...nouns, ...adjectives].map(cleanText);

    // 3. Combinar todos os candidatos
    const allCandidates = [...entities, ...topics];

    // 4. Processamento e filtragem
    const processedKeywords = allCandidates
        .filter(keyword => {
            // Remover vazios e muito curtos
            if (!keyword || keyword.length < 3) return false;
            
            // Verificar se contém stopwords
            const words = keyword.toLowerCase().split(/\s+/);
            const hasStopword = words.some(w => 
                ptStopwords.includes(w) || 
                customStopwords.includes(w)
            );
            
            return !hasStopword;
        });

    // 5. Eliminar duplicatas (case insensitive)
    const uniqueKeywords = [];
    const seenKeywords = new Set();

    for (const keyword of processedKeywords) {
        const lowerKeyword = keyword.toLowerCase();
        if (!seenKeywords.has(lowerKeyword)) {
            seenKeywords.add(lowerKeyword);
            uniqueKeywords.push(keyword);
        }
    }

    // 6. Ordenar por importância (entidades primeiro, depois por comprimento)
    uniqueKeywords.sort((a, b) => {
        const isEntityA = entities.includes(a);
        const isEntityB = entities.includes(b);
        
        if (isEntityA !== isEntityB) return isEntityB - isEntityA;
        return b.split(' ').length - a.split(' ').length || b.length - a.length;
    });

    // 7. Retornar apenas o número solicitado de keywords
    return uniqueKeywords.slice(0, maxKeywords);
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
        .replace(/<[^>]+>/g, '')
        .trim();
}

function breakContentIntoSentences(text) {
    return sentenceBoundaryDetection.sentences(text);
}


async function textRobot(content) {
    try {
        // Validação de entrada
        if (!content.searchTerm) {
            throw new Error('Termo de pesquisa não definido');
        }
        
        if (!content.maximumSentences) {
            content.maximumSentences = 7; // Valor padrão
        }

        console.log('🔍 Buscando conteúdo na Wikipedia...');
        const wikipediaContent = await fetchContentFromWikipedia(content.searchTerm);
        
        console.log('🧹 Limpando conteúdo...');
        const cleanedContent = cleanWikipediaText(wikipediaContent);
        
        console.log('✂️ Dividindo em sentenças...');
        const sentences = breakContentIntoSentences(cleanedContent);
        const limitedSentences = sentences.slice(0, content.maximumSentences);

        console.log('🔑 Extraindo keywords...');
        content.sentences = limitedSentences.map(sentence => {
            const keywords = extractRelevantKeywords(sentence, content.maxKeywordsPerSentence || 5);
            return {
                text: sentence,
                keywords: keywords.length ? keywords : ['Sem keywords relevantes'],
                images: []
            };
        });

        content.sourceContentOriginal = cleanedContent;
        console.log('✅ Texto processado com sucesso!');
        
        return content; // Retorna o conteúdo modificado

    } catch (err) {
        console.error('❌ Erro no textRobot:', err.message);
        throw err; // Propaga o erro para quem chamou
    }
}

export default textRobot;