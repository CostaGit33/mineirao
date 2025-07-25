document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('relatorio-form');
  const empresaSelect = document.getElementById('empresa');
  const fornecedorSelect = document.getElementById('fornecedor');
  const produtoSelect = document.getElementById('produto');
  const tipoEstoqueSelect = document.getElementById('tipoEstoque'); // Corrigido: era 'tipo-estoque'
  const tabelasContainer = document.getElementById('tabelas-container');

  const fornecedoresPorEmpresa = {
    'Mineirão': ['Gameleira']
  };

  const produtosPorFornecedor = {
    'Gameleira': [
      'Fuba 500G',
      'Milho de pipoca 500G',
      'Canjica amarela 500G',
      'Alpiste paqueta 500G',
      'Flocão de milho 400G',
      'Creme de milho 500G',
      'Canjica braca 500G',
      'Bisc. coquinho 750 G',
      'Bisc. coquinho 2 KL',
      'Bisc. coquinho 400G',
      'Bisc. coquinho 200G',
      'Bisc. coquinho 1 KL',
      'Bisc. doce creme 200G',
      'Bisc. doce creme 2KL',
      'Bisc. doce creme 400G',
      'Bisc. doce creme 750G',
      'Bisc. doce creme 1 KL',
      'Bisc. rosquinha milho 300G',
      'Bisc. rosquinha coco 300G',
      'Bisc. rosquinha nata 300G',
      'Bisc. rosquinha Choc. 300G',
      'Bisc. rosquinha gameleira 300G',
      'Mac. Esp. Semola 400G',
      'Mac. Esp. Comum 400G'
    ]
  };

  const storageKey = 'relatoriosEmpresas';

  function carregarStorage() {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  }

  function salvarStorage(dados) {
    localStorage.setItem(storageKey, JSON.stringify(dados));
  }

  function atualizarFornecedores() {
    const empresa = empresaSelect.value;
    fornecedorSelect.innerHTML = '<option disabled selected>Escolha o fornecedor</option>';
    
    if (fornecedoresPorEmpresa[empresa]) {
      fornecedoresPorEmpresa[empresa].forEach(fornecedor => {
        const opt = document.createElement('option');
        opt.value = fornecedor;
        opt.textContent = fornecedor;
        fornecedorSelect.appendChild(opt);
      });
    }
    
    // Limpar produtos quando fornecedor muda
    produtoSelect.innerHTML = '<option disabled selected>Escolha o produto</option>';
  }

  function atualizarProdutos() {
    const fornecedor = fornecedorSelect.value;
    produtoSelect.innerHTML = '<option disabled selected>Escolha o produto</option>';
    
    if (produtosPorFornecedor[fornecedor]) {
      produtosPorFornecedor[fornecedor].forEach(produto => {
        const opt = document.createElement('option');
        opt.value = produto;
        opt.textContent = produto;
        produtoSelect.appendChild(opt);
      });
    }
  }

  function formatarData(dataStr) {
    if (!dataStr) return '';
    const data = new Date(dataStr);
    if (isNaN(data)) return '';
    return data.toLocaleDateString('pt-BR');
  }

  function formatarPreco(valor) {
    if (!valor) return '';
    const numero = parseFloat(valor.replace(',', '.'));
    if (isNaN(numero)) return '';
    return numero.toFixed(2).replace('.', ',');
  }

  function validarFormulario() {
    const empresa = empresaSelect.value;
    const fornecedor = fornecedorSelect.value;
    const produto = produtoSelect.value;
    const estoque = document.getElementById('estoque').value;
    const validade = document.getElementById('validade').value;
    const preco = document.getElementById('preco').value;

    if (!empresa || !fornecedor || !produto || !estoque || !validade || !preco) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return false;
    }

    if (parseFloat(estoque) < 0) {
      alert('O estoque não pode ser negativo.');
      return false;
    }

    const precoRegex = /^\d+(,\d{1,2})?$/;
    if (!precoRegex.test(preco)) {
      alert('Por favor, insira um preço válido (ex: 2,99).');
      return false;
    }

    return true;
  }

  function renderizarTabelas() {
    tabelasContainer.innerHTML = '';
    const dados = carregarStorage();

    for (const empresa in dados) {
      for (const fornecedor in dados[empresa]) {
        const lista = dados[empresa][fornecedor];

        if (lista.length === 0) continue; // Não renderizar tabelas vazias

        const wrapper = document.createElement('div');
        wrapper.classList.add('empresa-tabela', 'active');

        const logosDiv = document.createElement('div');
        logosDiv.className = 'top-logos';
        logosDiv.innerHTML = `
          <img src="img/mineirao.png" alt="Mineirão Atacarejo" onerror="this.style.display='none'" />
          <img src="img/Captura.png" alt="Apoiar Serviços" onerror="this.style.display='none'" />
        `;
        wrapper.appendChild(logosDiv);

        const titulo = document.createElement('h2');
        titulo.className = 'empresa-titulo';
        titulo.textContent = `${empresa} - ${fornecedor}`;
        wrapper.appendChild(titulo);

        const tabela = document.createElement('table');
        const thead = document.createElement('thead');
        thead.innerHTML = `
          <tr>
            <th>Produto</th>
            <th>Estq</th>
            <th>Val</th>
            <th>Preço</th>
            <th>Ações</th>
          </tr>
        `;

        const tbody = document.createElement('tbody');
        lista.forEach((item, index) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td title="${item.produto}">${item.produto}</td>
            <td>${item.estoque} ${item.tipoEstoque}</td>
            <td>${formatarData(item.validade)}</td>
            <td>${formatarPreco(item.preco)}</td>
            <td>
              <button class="editar" data-index="${index}" data-empresa="${empresa}" data-fornecedor="${fornecedor}" title="Editar">✏️</button>
              <button class="excluir" data-index="${index}" data-empresa="${empresa}" data-fornecedor="${fornecedor}" title="Excluir">🗑️</button>
            </td>
          `;
          tbody.appendChild(tr);
        });

        tabela.appendChild(thead);
        tabela.appendChild(tbody);
        wrapper.appendChild(tabela);
        tabelasContainer.appendChild(wrapper);
      }
    }

    // Event listeners para botões de ação
    document.querySelectorAll('.excluir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (confirm('Tem certeza que deseja excluir este item?')) {
          const index = parseInt(e.target.dataset.index);
          const empresa = e.target.dataset.empresa;
          const fornecedor = e.target.dataset.fornecedor;

          const dados = carregarStorage();
          dados[empresa][fornecedor].splice(index, 1);
          
          // Remover fornecedor se não tiver mais produtos
          if (dados[empresa][fornecedor].length === 0) {
            delete dados[empresa][fornecedor];
          }
          
          // Remover empresa se não tiver mais fornecedores
          if (Object.keys(dados[empresa]).length === 0) {
            delete dados[empresa];
          }
          
          salvarStorage(dados);
          renderizarTabelas();
        }
      });
    });

    document.querySelectorAll('.editar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        const empresa = e.target.dataset.empresa;
        const fornecedor = e.target.dataset.fornecedor;
        const dados = carregarStorage();
        const item = dados[empresa][fornecedor][index];

        // Preencher formulário com dados do item
        empresaSelect.value = empresa;
        atualizarFornecedores();
        
        setTimeout(() => {
          fornecedorSelect.value = fornecedor;
          atualizarProdutos();
          
          setTimeout(() => {
            produtoSelect.value = item.produto;
            document.getElementById('estoque').value = item.estoque;
            tipoEstoqueSelect.value = item.tipoEstoque;
            document.getElementById('validade').value = item.validade;
            document.getElementById('preco').value = item.preco;
          }, 100);
        }, 100);

        // Remover item da lista (será readicionado ao submeter)
        dados[empresa][fornecedor].splice(index, 1);
        salvarStorage(dados);
        renderizarTabelas();
        
        // Scroll para o formulário
        form.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const empresa = empresaSelect.value;
    const fornecedor = fornecedorSelect.value;
    const produto = produtoSelect.value;
    const estoque = document.getElementById('estoque').value;
    const tipoEstoque = tipoEstoqueSelect.value;
    const validade = document.getElementById('validade').value;
    const preco = document.getElementById('preco').value;

    const dados = carregarStorage();
    if (!dados[empresa]) dados[empresa] = {};
    if (!dados[empresa][fornecedor]) dados[empresa][fornecedor] = [];
    
    dados[empresa][fornecedor].push({ 
      produto, 
      estoque: parseInt(estoque), 
      tipoEstoque, 
      validade, 
      preco 
    });
    
    salvarStorage(dados);
    renderizarTabelas();
    form.reset();
    
    // Resetar selects
    atualizarFornecedores();
    atualizarProdutos();
    
    // Feedback visual
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adicionado!';
    submitBtn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.style.background = 'linear-gradient(135deg, #000000, #fdd835, #000000)';
    }, 1500);
  });

  // Event listeners
  empresaSelect.addEventListener('change', atualizarFornecedores);
  fornecedorSelect.addEventListener('change', atualizarProdutos);

  // Inicialização
  atualizarFornecedores();
  renderizarTabelas();
});
