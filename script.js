// Elementos do DOM
const campoValor = document.getElementById('campo-valor');
const seletorOrigem = document.getElementById('seletor-origem');
const seletorDestino = document.getElementById('seletor-destino');
const botaoConverter = document.getElementById('botao-converter');
const spinner = document.getElementById('spinner');
const exibicaoResultado = document.getElementById('resultado');
const listaHistorico = document.getElementById('lista-historico');
const botaoModo = document.getElementById('botao-modo');
const MODO_KEY = 'conversor_modo_escuro';

function aplicarModo(ativado) {
  if (ativado) {
    document.body.classList.add('dark-mode');
    botaoModo.textContent = '☀️'; // mostra sol quando modo escuro ativo (para indicar "voltar")
    botaoModo.setAttribute('aria-pressed', 'true');
    botaoModo.title = 'Desativar modo escuro';
  } else {
    document.body.classList.remove('dark-mode');
    botaoModo.textContent = '🌙'; // lua quando modo claro
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
  botaoConverter.disabled = false;
}

// Função principal de conversão
async function converter() {
  const valor = parseFloat(campoValor.value);
  const origem = seletorOrigem.value;
  const destino = seletorDestino.value;
  if (isNaN(valor) || valor <= 0) {
    alert('Digite um valor maior que zero.');
    return;
  }

  iniciarCarregamento();
  try {
    // Busca taxas da API pública
    const resposta = await fetch(`https://api.exchangerate-api.com/v4/latest/${origem}`);
    const dados = await resposta.json();
    const taxa = dados.rates[destino];
    const resultado = valor * taxa;

    exibicaoResultado.textContent = `${valor.toFixed(2)} ${origem} = ${resultado.toFixed(2)} ${destino}`;

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

// Eventos
botaoConverter.addEventListener('click', converter);
// Inicialização
carregarHistorico();
atualizarHistorico();
