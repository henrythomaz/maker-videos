import readline from 'readline-sync';
import state from '../robots/state.js';
import textRobot from './state.js';

async function robot() {
    const content = {
        maximumSentences: 7
    };
    
    content.searchTerm = askAndReturnSearchTerm();
    content.prefix = askAndReturnPrefix();
    state.save(content);
    
    // Processa o texto
    await textRobot(content);
    
    // Atualiza o estado com os resultados
    state.save(content);
    
    // Exibe o resultado final
    console.log('\nResultado final:');
    console.log(JSON.stringify({
        searchTerm: content.searchTerm,
        prefix: content.prefix,
        sentences: content.sentences
    }, null, 2));

    function askAndReturnSearchTerm() {
        return readline.question('Digite um termo de pesquisa da Wikipedia: ');
    }

    function askAndReturnPrefix() {
        const prefixes = ['Quem é', 'O que é', 'A história de'];
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Escolha uma opção:');
        return prefixes[selectedPrefixIndex];
    }
}

export default robot;