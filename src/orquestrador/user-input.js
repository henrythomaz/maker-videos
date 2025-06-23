import readline from 'readline-sync';

export default function userInput(content = {}) {
    console.log('\n🤖 Robô de entrada rodando...');
    
    content.searchTerm = content.searchTerm || askAndReturnSearchTerm();
    content.prefix = content.prefix || askAndReturnPrefix();
    
    return content;

    function askAndReturnSearchTerm() {
        return readline.question('Digite um termo de pesquisa da Wikipedia: ');
    }

    function askAndReturnPrefix() {
        const prefixes = ['Quem é', 'O que é', 'A história de', ''];
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Escolha uma opção:');
        return prefixes[selectedPrefixIndex];
    }
}