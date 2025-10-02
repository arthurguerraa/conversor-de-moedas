// modo.js
import { botaoModo, MODO_KEY } from './domElements.js';

export function aplicarModo(ativado) {
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

export function initModo() {
  const pref = localStorage.getItem(MODO_KEY);
  const ativo = pref === 'true';
  aplicarModo(ativo);

  botaoModo.addEventListener('click', () => {
    const ativo = document.body.classList.toggle('dark-mode');
    aplicarModo(ativo);
    localStorage.setItem(MODO_KEY, ativo ? 'true' : 'false');
  });
}
