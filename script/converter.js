// converter.js
import { campoValor, seletorOrigem, seletorDestino } from './domElements.js';
import { iniciarCarregamento, fimCarregamento, mostrarToast, atualizarHistorico } from './ui.js';

let historicoConversoes = [];

export function carregarHistorico() {
  const dado = localStorage.getItem('historicoConversoes');
  historicoConversoes = dado ? JSON.parse(dado) : [];
  atualizarHistorico(historicoConversoes);
}

export function salvarHistorico() {
  localStorage.setItem('historicoConversoes', JSON.stringify(historicoConversoes));
}

export async function converter() {
  const valor = parseFloat(campoValor.value);
  const origem = seletorOrigem.value;
  const destino = seletorDestino.value;
  if (isNaN(valor) || valor <= 0) { mostrarToast('Digite um valor maior que zero.'); return; }
  if (origem === destino) { mostrarToast('Escolha moedas diferentes para converter.'); return; }

  iniciarCarregamento();
  try {
    const resposta = await fetch(`https://api.exchangerate-api.com/v4/latest/${origem}`);
    if (!resposta.ok) throw new Error(`Erro na API: ${resposta.status}`);
    const dados = await resposta.json();
    const taxa = dados.rates[destino];
    if (typeof taxa !== 'number') { mostrarToast('Taxa de câmbio não encontrada para esse par.'); return; }

    const resultado = valor * taxa;
    const formatadorOrigem = new Intl.NumberFormat('pt-BR',{style:'currency', currency:origem});
    const formatadorDestino = new Intl.NumberFormat('pt-BR',{style:'currency', currency:destino});
    document.getElementById('resultado-text').textContent = `${formatadorOrigem.format(valor)} = ${formatadorDestino.format(resultado)}`;

    historicoConversoes.push({valor, origem, destino, resultado});
    salvarHistorico();
    atualizarHistorico(historicoConversoes);
  } catch (e) {
    mostrarToast('Erro ao buscar taxas. Tente novamente mais tarde.');
    console.error(e);
  } finally {
    fimCarregamento();
  }
}

export { historicoConversoes };
