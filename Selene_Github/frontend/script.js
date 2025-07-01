// Utilitário para IDs seguros
function slug(str) {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^\w-]/g, '')
    .toLowerCase();
}

document.addEventListener('DOMContentLoaded', () => {
  const form   = document.getElementById('formCpf');
  const caixa  = document.getElementById('caixaResultados');
  let resultadosPorProduto = {};
  let indicesAtuais        = {};

  // Exibe os resultados agrupando por tipo de produto
  function exibirResultados(dados) {
    resultadosPorProduto = {};
    indicesAtuais = {};
    dados.forEach(item => {
      const tipo = item.produto_nome || 'Outro';
      if (!resultadosPorProduto[tipo]) resultadosPorProduto[tipo] = [];
      resultadosPorProduto[tipo].push(item);
    });

    caixa.innerHTML = '';
    caixa.classList.remove('oculto');

    Object.entries(resultadosPorProduto).forEach(([tipo, lista]) => {
      indicesAtuais[tipo] = 0;
      const idBox = `box_${slug(tipo)}`;
      const box = document.createElement('div');
      box.className = 'box-resultado';
      box.id = idBox;
      box.innerHTML = `<h3>${tipo}</h3><div class="conteudo"></div>`;

      // Navegação caso tenha mais de um item do mesmo produto
      if (lista.length > 1) {
        const nav = document.createElement('div');
        nav.className = 'nav-buttons';
        const btnAnt = document.createElement('button');
        btnAnt.textContent = 'Anterior';
        btnAnt.onclick = () => mudarIndice(tipo, -1);
        const btnProx = document.createElement('button');
        btnProx.textContent = 'Próximo';
        btnProx.onclick = () => mudarIndice(tipo, 1);
        nav.append(btnAnt, btnProx);
        box.append(nav);
      }

      caixa.append(box);
      atualizarCaixa(tipo);
    });
  }

  // Atualiza o conteúdo da caixa de cada produto
  function atualizarCaixa(tipo) {
    const lista = resultadosPorProduto[tipo];
    const idx   = indicesAtuais[tipo];
    const dados = lista[idx];
    const cont  = document.querySelector(`#box_${slug(tipo)} .conteudo`);
    cont.innerHTML = `
      <p><strong>Nome:</strong> ${dados.cliente_nome || '-'}</p>
      <p><strong>Valor:</strong> ${dados.valor_referencia || '-'}</p>
      <p><strong>Parcela:</strong> ${dados.valor_parcela || '-'}</p>
      <p><strong>Status:</strong> ${dados.status_nome || '-'}</p>
      <p><strong>ID Proposta:</strong> ${dados.id_proposta_banco || '-'}</p>
    `;
  }

  // Navegação dos cards de mesmo produto
  function mudarIndice(tipo, direcao) {
    const total = resultadosPorProduto[tipo].length;
    indicesAtuais[tipo] = (indicesAtuais[tipo] + direcao + total) % total;
    atualizarCaixa(tipo);
  }

  // Submissão do formulário
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const cpf = document.getElementById('cpfCliente').value.replace(/\D/g, '');
    try {
      const res = await fetch('/consulta', {
        method:  'POST',
        headers: {'Content-Type':'application/json'},
        body:    JSON.stringify({ cpf })
      });
      if (!res.ok) throw new Error('Cliente não encontrado');
      const dados = await res.json();
      exibirResultados(dados);
    } catch (err) {
      caixa.innerHTML = '';
      caixa.classList.add('oculto');
      alert('❌ Erro: ' + err.message);
    }
  });
});
