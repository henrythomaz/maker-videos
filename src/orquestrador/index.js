import { execSync } from 'child_process';
import state from '../robots/state.js';
import userInput from './user-input.js';
import textRobot from '../robots/text.js';
import imageRobot from '../robots/image.js';

// Configuração inicial
console.log('🚀 Iniciando Robot Maker...');

// Verificação do ambiente
if (process.platform === 'win32') {
  try {
    const codePage = execSync('chcp').toString();
    if (!codePage.includes('65001')) {
      console.warn('⚠️  Execute "chcp 65001" para configurar o terminal como UTF-8');
    }
  } catch (error) {
    console.warn('⚠️  Não foi possível verificar a codificação do terminal');
  }
}

async function runPipeline() {
  try {
    // 1. Fase de Inicialização
    console.log('\n=== FASE 1: INICIALIZAÇÃO ===');
    let content = state.load() || { maximumSentences: 7 };
    console.log('Estado inicial:', content);

    // 2. Fase de Entrada do Usuário
    console.log('\n=== FASE 2: ENTRADA DO USUÁRIO ===');
    content = await userInput(content);
    state.save(content); // Salva após entrada do usuário

    // 3. Fase de Processamento de Texto
    console.log('\n=== FASE 3: PROCESSAMENTO DE TEXTO ===');
    content = await textRobot(content);
    console.log('Texto processado. Sentenças:', content.sentences?.length);
    state.save(content); // Salva após processamento de texto

    // 4. Fase de Busca de Imagens
    console.log('\n=== FASE 4: BUSCA DE IMAGENS ===');
    content = await imageRobot(content);
    state.save(content); // Salva após busca de imagens

    // 5. Fase de Saída
    console.log('\n=== FASE 5: RESULTADOS FINAIS ===');
    console.log('✅ Processo concluído com sucesso!');
    console.log('📊 Estatísticas:');
    console.log(`- Termo buscado: ${content.searchTerm}`);
    console.log(`- Sentenças geradas: ${content.sentences?.length}`);
    console.log(`- Total de imagens: ${content.sentences?.reduce((acc, curr) => acc + (curr.images?.length || 0), 0)}`);

    return content;
  } catch (error) {
    console.error('\n💥 ERRO NO FLUXO PRINCIPAL:', error);
    console.error('Conteúdo no momento do erro:', state.load());
    throw error;
  }
}

// Execução controlada com tratamento de erros
runPipeline()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));