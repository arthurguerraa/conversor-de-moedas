// ui.js
import { spinner, botaoConverter, exibicaoResultadoText, copyBtn, listaHistorico } from './domElements.js';

/**
 * Mostrar/ocultar spinner e ativar/desativar botões
 */
export function iniciarCarregamento() {
  botaoConverter.disabled = true;
  spinner.style.display = 'block';
}
export function fimCarregamento() {
  spinner.style.display = 'none';
  atualizarEstadoBotoes();
}

/**
 * Toasts simples
 */
export function mostrarToast(mensagem) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensagem;
  container.appendChild(toast);
  // remove após 3s
  setTimeout(() => toast.remove(), 3000);
}

/**
 * Atualiza estados dos botões (converter/copy)
 */
export function atualizarEstadoBotoes() {
  const mesmoPar = document.getElementById('seletor-origem').value === document.getElementById('seletor-destino').value;
  const carregando = spinner.style.display === 'block';
  botaoConverter.disabled = carregando || mesmoPar;

  const temResultado = exibicaoResultadoText.textContent && exibicaoResultadoText.textContent.trim().length > 0;
  copyBtn.disabled = !temResultado;
}

/**
 * Renderiza o histórico (5 últimos)
 */
export function atualizarHistorico(historicoConversoes) {
  listaHistorico.innerHTML = '';
  historicoConversoes.slice(-5).reverse().forEach(item => {
    const li = document.createElement('li');
    const fO = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: item.origem });
    const fD = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: item.destino });
    li.textContent = `${fO.format(item.valor)} ➔ ${fD.format(item.resultado)}`;
    listaHistorico.appendChild(li);
  });
}
