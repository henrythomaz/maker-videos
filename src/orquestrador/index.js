import readline from 'readline-sync';
import { execSync } from 'child_process';

if (process.platform === 'win32') {

  const codePage = execSync('chcp').toString();
  if (!codePage.includes('65001')) {
    console.warn(
      '\n⚠️  Seu terminal não está usando UTF-8.\nExecute "chcp 65001" antes de rodar o programa para evitar problemas com acentuação.\n'
    );
  }
}

function start() {
  const content = {};

  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();

  function askAndReturnSearchTerm() {
    return readline.question('Digite um termo de pesquisa da Wikipedia:');
  }

  function askAndReturnPrefix() {
    const prefixes = ['Quem é', 'O que é', 'A história de'];
    const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Escolha uma opção:');
    const selectedPrefixText = prefixes[selectedPrefixIndex];

    return selectedPrefixText;
  }

  console.log(content);
}

start();
