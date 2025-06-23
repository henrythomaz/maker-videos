import { execSync } from 'child_process';
import userInput from './user-input.js';
import textRobot from '../robots/text.js';
import state from '../robots/state.js';

// Verificação de encoding (Windows)
if (process.platform === 'win32') {
    const codePage = execSync('chcp').toString();
    if (!codePage.includes('65001')) {
        console.warn('\n⚠️ Seu terminal não está usando UTF-8.\nExecute "chcp 65001" antes de rodar o programa.\n');
    }
}

async function start() {
    try {
        // Carrega estado existente ou cria novo
        let content = state.load() || { maximumSentences: 7 };
        
        // Coleta inputs do usuário
        content = await userInput(content);
        
        // Processa o texto
        content = await textRobot(content);
        
        // Salva e exibe resultados
        state.save(content);
        showResults(content);
        
    } catch (error) {
        console.error('❌ Erro no processo:', error);
    }
}

function showResults(content) {
    console.log('\n✅ Processo concluído! Resultado final:');
    console.dir(content, {depth: null});
    // console.log(JSON.stringify({
    //     searchTerm: content.searchTerm,
    //     prefix: content.prefix,
    //     sentences: content.sentences
    // }, null, 2));
}

start();