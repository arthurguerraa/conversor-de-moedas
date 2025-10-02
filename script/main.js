// main.js
import { initModo } from './modo.js';
import { carregarHistorico, converter } from './converter.js';
import { atualizarEstadoBotoes } from './ui.js';
import { campoValor, botaoConverter, seletorOrigem, seletorDestino, swapBtn, copyBtn } from './domElements.js';

// Inicialização
initModo();
carregarHistorico();
atualizarEstadoBotoes();

// Eventos
campoValor.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !botaoConverter.disabled) botaoConverter.click(); });
seletorOrigem.addEventListener('change', atualizarEstadoBotoes);
seletorDestino.addEventListener('change', atualizarEstadoBotoes);

swapBtn.addEventListener('click', () => {
  const a = seletorOrigem.value;
  seletorOrigem.value = seletorDestino.value;
  seletorDestino.value = a;
  atualizarEstadoBotoes();
});

copyBtn.addEventListener('click', async () => {
  const texto = document.getElementById('resultado-text').textContent.trim();
  if (!texto) return;
  try { await navigator.clipboard.writeText(texto); const original = copyBtn.textContent; copyBtn.textContent = '✔'; setTimeout(()=>{ copyBtn.textContent = original; }, 1200); }
  catch (e) { alert('Não foi possível copiar automaticamente.'); console.error(e); }
});

botaoConverter.addEventListener('click', converter);
