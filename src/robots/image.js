import fetch from 'node-fetch';
import state from './state.js';

const IMAGE_SOURCES = {
  wikimedia: async (query) => {
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=images&prop=imageinfo&iiprop=url&titles=${encodeURIComponent(query)}&format=json&origin=*`;
      const response = await fetch(url);
      const data = await response.json();
      return Object.values(data.query?.pages || {}).map(page => page.imageinfo?.[0]?.url).filter(Boolean);
    } catch (error) {
      console.error('Erro na Wikimedia API:', error.message);
      return [];
    }
  },
  
  placeholder: async (query) => {
    return [
      `https://via.placeholder.com/300/CCCCCC/000000?text=${encodeURIComponent(query.split(' ')[0])}`,
      `https://via.placeholder.com/300/EEEEEE/000000?text=${encodeURIComponent(query.split(' ')[1] || '')}`
    ];
  }
};

async function robot() {
  console.log('🖼️ Iniciando robô de imagens...');
  const content = state.load();

  // Verificação robusta do conteúdo
  if (!content || typeof content !== 'object') {
    throw new Error('Conteúdo inválido: objeto não encontrado');
  }

  if (!Array.isArray(content.sentences)) {
    console.error('Conteúdo recebido:', content);
    throw new Error('Formato inválido: sentences deve ser um array');
  }

  try {
    // Processa cada sentença em paralelo
    const processedSentences = await Promise.all(
      content.sentences.map(async (sentence) => {
        try {
          const query = `${content.searchTerm} ${sentence.keywords?.[0] || ''}`.trim();
          
          // Tenta primeiro a Wikimedia, depois fallback
          const images = (await IMAGE_SOURCES.wikimedia(query)) || 
                        (await IMAGE_SOURCES.placeholder(content.searchTerm));
          
          return {
            ...sentence,
            images: images.slice(0, 2) // Garante no máximo 2 imagens
          };
        } catch (error) {
          console.error(`Erro processando sentença: "${sentence.text?.substring(0, 20)}..."`, error);
          return {
            ...sentence,
            images: await IMAGE_SOURCES.placeholder(content.searchTerm)
          };
        }
      })
    );

    // Cria um NOVO objeto content sem modificar o original
    const newContent = {
      ...content,
      sentences: processedSentences,
      imagesProcessedAt: new Date().toISOString()
    };

    state.save(newContent);
    console.log('✅ Imagens processadas com sucesso!');
    return newContent;
  } catch (error) {
    console.error('❌ Erro crítico no robô de imagens:', error);
    throw error;
  }
}

export default robot;