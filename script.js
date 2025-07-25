document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('relatorio-form');
  const empresaSelect = document.getElementById('empresa');
  const fornecedorSelect = document.getElementById('fornecedor');
  const produtoSelect = document.getElementById('produto');
  const tipoEstoqueSelect = document.getElementById('tipo-estoque');
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
    fornecedoresPorEmpresa[empresa]?.forEach(fornecedor => {
      const opt = document.createElement('option');
      opt.value = fornecedor;
      opt.textContent = fornecedor;
      fornecedorSelect.appendChild(opt);
    });
  }

  function atualizarProdutos() {
    const fornecedor = fornecedorSelect.value;
    produtoSelect.innerHTML = '<option disabled selected>Escolha o produto</option>';
    produtosPorFornecedor[fornecedor]?.forEach(produto => {
      const opt = document.createElement('option');
      opt.value = produto;
      opt.textContent = produto;
      produtoSelect.appendChild(opt);
    });
  }

  function formatarData(dataStr) {
    const data = new Date(dataStr);
    if (isNaN(data)) return '';
    return data.toLocaleDateString('pt-BR');
  }

  function formatarPreco(valor) {
    const numero = parseFloat(valor.replace(',', '.'));
    if (isNaN(numero)) return '';
    return numero.toFixed(2).replace('.', ',');
  }

  function renderizarTabelas() {
    tabelasContainer.innerHTML = '';
    const dados = carregarStorage();

    for (const empresa in dados) {
      for (const fornecedor in dados[empresa]) {
        const lista = dados[empresa][fornecedor];

        const wrapper = document.createElement('div');
        wrapper.classList.add('empresa-tabela', 'active');

        const logosDiv = document.createElement('div');
        logosDiv.className = 'top-logos';
        logosDiv.innerHTML = `
          <img src="mineirao.png" alt="Mineirão Atacarejo" />
          <img src="Captura.png" alt="Apoiar Serviços" />
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
            <td>${item.produto}</td>
            <td>${item.estoque} ${item.tipoEstoque}</td>
            <td>${formatarData(item.validade)}</td>
            <td>${formatarPreco(item.preco)}</td>
            <td><button class="editar" data-index="${index}" data-empresa="${empresa}" data-fornecedor="${fornecedor}">✏️</button>
                <button class="excluir" data-index="${index}" data-empresa="${empresa}" data-fornecedor="${fornecedor}">🗑️</button></td>
          `;
          tbody.appendChild(tr);
        });

        tabela.appendChild(thead);
        tabela.appendChild(tbody);
        wrapper.appendChild(tabela);
        tabelasContainer.appendChild(wrapper);
      }
    }

    document.querySelectorAll('.excluir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        const empresa = e.target.dataset.empresa;
        const fornecedor = e.target.dataset.fornecedor;

        const dados = carregarStorage();
        dados[empresa][fornecedor].splice(index, 1);
        salvarStorage(dados);
        renderizarTabelas();
      });
    });

    document.querySelectorAll('.editar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        const empresa = e.target.dataset.empresa;
        const fornecedor = e.target.dataset.fornecedor;
        const dados = carregarStorage();
        const item = dados[empresa][fornecedor][index];

        produtoSelect.value = item.produto;
        document.getElementById('estoque').value = item.estoque;
        tipoEstoqueSelect.value = item.tipoEstoque;
        document.getElementById('validade').value = item.validade;
        document.getElementById('preco').value = item.preco;

        dados[empresa][fornecedor].splice(index, 1);
        salvarStorage(dados);
        renderizarTabelas();
      });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

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
    dados[empresa][fornecedor].push({ produto, estoque, tipoEstoque, validade, preco });
    salvarStorage(dados);
    renderizarTabelas();
    form.reset();
    atualizarFornecedores();
    atualizarProdutos();
  });

  empresaSelect.addEventListener('change', atualizarFornecedores);
  fornecedorSelect.addEventListener('change', atualizarProdutos);

  atualizarFornecedores();
  renderizarTabelas();
});
