// Elementos do DOM
const campoValor = document.getElementById('campo-valor');
const seletorOrigem = document.getElementById('seletor-origem');
const seletorDestino = document.getElementById('seletor-destino');
const botaoConverter = document.getElementById('botao-converter');
const spinner = document.getElementById('spinner');
const exibicaoResultadoText = document.getElementById('resultado-text'); // NOTA: span interno
const listaHistorico = document.getElementById('lista-historico');
const botaoModo = document.getElementById('botao-modo');
const MODO_KEY = 'conversor_modo_escuro';

const swapBtn = document.getElementById('swap-btn');
const copyBtn = document.getElementById('copy-btn');

// Função de aplicar modo (dark/light)
function aplicarModo(ativado) {
  if (ativado) {
    document.body.classList.add('dark-mode');
    botaoModo.textContent = '☀️';
    botaoModo.setAttribute('aria-pressed', 'true');
    botaoModo.title = 'Desativar modo escuro';
  } else {
    document.body.classList.remove('dark-mode');
    botaoModo.textContent = '🌙';
    botaoModo.setAttribute('aria-pressed', 'false');
    botaoModo.title = 'Ativar modo escuro';
  }
}

botaoModo.addEventListener('click', () => {
  const ativo = document.body.classList.toggle('dark-mode');
  aplicarModo(ativo);
  localStorage.setItem(MODO_KEY, ativo ? 'true' : 'false');
});

// Aplica preferencia salva ao carregar a página
(function initModo() {
  const pref = localStorage.getItem(MODO_KEY);
  const ativo = pref === 'true';
  aplicarModo(ativo);
})();

// Estado
let historicoConversoes = [];

// Carrega histórico do localStorage
function carregarHistorico() {
  const dado = localStorage.getItem('historicoConversoes');
  historicoConversoes = dado ? JSON.parse(dado) : [];
}
// Salva histórico no localStorage
function salvarHistorico() {
  localStorage.setItem('historicoConversoes', JSON.stringify(historicoConversoes));
}

// Atualiza lista de histórico na interface
function atualizarHistorico() {
  listaHistorico.innerHTML = '';
  historicoConversoes.slice(-5).reverse().forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.valor.toFixed(2)} ${item.origem} ➔ ${item.resultado.toFixed(2)} ${item.destino}`;
    listaHistorico.appendChild(li);
  });
}

// Exibe spinner/deixa botão desabilitado
function iniciarCarregamento() {
  botaoConverter.disabled = true;
  spinner.style.display = 'block';
}
// Esconde spinner/habilita botão
function fimCarregamento() {
  spinner.style.display = 'none';
  // só habilita se não estivermos no estado "origem === destino"
  atualizarEstadoBotoes();
}

// Função que atualiza o estado dos botões (converter + copiar)
function atualizarEstadoBotoes() {
  const mesmoPar = seletorOrigem.value === seletorDestino.value;
  // se spinner visível assumimos que estamos carregando (logo manter disabled)
  const carregando = spinner.style.display === 'block';
  if (!carregando) {
    botaoConverter.disabled = mesmoPar;
  }
  // copy btn só habilita se houver texto de resultado
  const temResultado = exibicaoResultadoText.textContent && exibicaoResultadoText.textContent.trim().length > 0;
  copyBtn.disabled = !temResultado;
}

function mostrarToast(mensagem) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensagem;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// Função principal de conversão
async function converter() {
  const valor = parseFloat(campoValor.value);
  const origem = seletorOrigem.value;
  const destino = seletorDestino.value;
  if (isNaN(valor) || valor <= 0) {
    mostrarToast('Digite um valor maior que zero.');
    return;
  }
  if (origem === destino) {
    // medida extra de segurança
    mostrarToast('Escolha moedas diferentes para converter.');
    return;
  }

  iniciarCarregamento();
  try {
    // Busca taxas da API pública
    const resposta = await fetch(`https://api.exchangerate-api.com/v4/latest/${origem}`);
    if (!resposta.ok) throw new Error(`Erro na API: ${resposta.status}`);
    const dados = await resposta.json();
    const taxa = dados.rates[destino];

    if (typeof taxa !== 'number') {
      alert('Taxa de câmbio não encontrada para esse par.');
      return;
    }

    const resultado = valor * taxa;

    exibicaoResultadoText.textContent = `${valor.toFixed(2)} ${origem} = ${resultado.toFixed(2)} ${destino}`;

    // Atualiza histórico
    historicoConversoes.push({ valor, origem, destino, resultado });
    salvarHistorico();
    atualizarHistorico();
  } catch (erro) {
    alert('Erro ao buscar taxas. Tente novamente mais tarde.');
    console.error(erro);
  } finally {
    fimCarregamento();
  }
}

// --- Novas features: Enter-to-convert, swap, copy, desabilitar botão quando par igual ---

// 1) Enter para converter (no input de valor)
campoValor.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    // tenta disparar o botão (respeita estado disabled)
    if (!botaoConverter.disabled) botaoConverter.click();
  }
});

// 2) Desabilitar automaticamente quando origem === destino
seletorOrigem.addEventListener('change', atualizarEstadoBotoes);
seletorDestino.addEventListener('change', atualizarEstadoBotoes);

// 3) Swap button (trocar origem/destino)
swapBtn.addEventListener('click', () => {
  const a = seletorOrigem.value;
  seletorOrigem.value = seletorDestino.value;
  seletorDestino.value = a;
  atualizarEstadoBotoes();
});

// 4) Botão copiar resultado
copyBtn.addEventListener('click', async () => {
  const texto = exibicaoResultadoText.textContent.trim();
  if (!texto) return;
  try {
    await navigator.clipboard.writeText(texto);
    const original = copyBtn.textContent;
    copyBtn.textContent = '✔'; // feedback rápido
    setTimeout(() => { copyBtn.textContent = original; }, 1200);
  } catch (err) {
    // fallback simples: selecionar texto (não é ideal em todos os casos)
    alert('Não foi possível copiar automaticamente. Selecione e copie manualmente.');
    console.error(err);
  }
});

// Eventos
botaoConverter.addEventListener('click', converter);

// Inicialização
carregarHistorico();
atualizarHistorico();
atualizarEstadoBotoes();
