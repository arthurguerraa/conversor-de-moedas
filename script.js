// Elementos do DOM
        const campoValor = document.getElementById('campo-valor');
        const seletorOrigem = document.getElementById('seletor-origem');
        const seletorDestino = document.getElementById('seletor-destino');
        const botaoConverter = document.getElementById('botao-converter');
        const spinner = document.getElementById('spinner');
        const exibicaoResultado = document.getElementById('resultado');
        const listaHistorico = document.getElementById('lista-historico');

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
                li.textContent = `${item.valor.toFixed(2)} ${item.origim} ➔ ${item.resultado.toFixed(2)} ${item.destino}`;
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
            const origim = seletorOrigem.value;
            const destino = seletorDestino.value;
            if (isNaN(valor) || valor <= 0) {
                alert('Digite um valor maior que zero.');
                return;
            }

            iniciarCarregamento();
            try {
                // Busca taxas da API pública
                const resposta = await fetch(`https://api.exchangerate-api.com/v4/latest/${origim}`);
                const dados = await resposta.json();
                const taxa = dados.rates[destino];
                const resultado = valor * taxa;

                exibicaoResultado.textContent = `${valor.toFixed(2)} ${origim} = ${resultado.toFixed(2)} ${destino}`;

                // Atualiza histórico
                historicoConversoes.push({ valor, origim, destino, resultado });
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