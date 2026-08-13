const MUSCULOS = {
  peito: ['peitoral_maior_clavicular', 'peitoral_maior_esternocostal', 'peitoral_maior_abdominal'],
  costas: ['latissimo_dorso', 'upperback', 'trapezio', 'eretores_espinha'],
  ombro: ['deltoide_lateral', 'deltoide_posterior'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  quadriceps: ['quadriceps'],
  posterior_coxa: ['posterior_coxa'],
  gluteo: ['gluteo'],
  adutores: ['adutores'],
  panturrilha: ['panturrilha'],
  core: ['reto_abdominal', 'obliquos'],
  antebraco: ['flexores_punho', 'extensores_punho'],
};

const PUSH = { peito: 3, ombro: 2, triceps: 2 };
const PULL = { costas: 4, biceps: 2, antebraco: 2 };
const LEGS = { quadriceps: 2, posterior_coxa: 2, gluteo: 1, adutores: 1, panturrilha: 1, core: 2 };
const UPPER = { peito: 2, costas: 2, ombro: 2, biceps: 1, triceps: 1 };
const LOWER = { quadriceps: 2, posterior_coxa: 1, gluteo: 1, adutores: 1, panturrilha: 1, core: 1, antebraco: 1 };

const DIVISOES = {
  3: {
    slug: 'ppl3',
    nome: 'Push / Pull / Legs',
    sessoes: [
      { nome: 'Push', volume: PUSH },
      { nome: 'Pull', volume: PULL },
      { nome: 'Legs', volume: LEGS },
    ],
  },
  4: {
    slug: 'ul4',
    nome: 'Upper / Lower',
    sessoes: [
      { nome: 'Upper', volume: UPPER },
      { nome: 'Lower', volume: LOWER },
      { nome: 'Upper', volume: UPPER },
      { nome: 'Lower', volume: LOWER },
    ],
  },
  5: {
    slug: 'pplul5',
    nome: 'PPLUL',
    sessoes: [
      { nome: 'Push', volume: PUSH },
      { nome: 'Pull', volume: PULL },
      { nome: 'Legs', volume: LEGS },
      { nome: 'Upper', volume: UPPER },
      { nome: 'Lower', volume: LOWER },
    ],
  },
  6: {
    slug: 'ppl6',
    nome: 'Push / Pull / Legs x2',
    sessoes: [
      { nome: 'Push', volume: PUSH },
      { nome: 'Pull', volume: PULL },
      { nome: 'Legs', volume: LEGS },
      { nome: 'Push', volume: PUSH },
      { nome: 'Pull', volume: PULL },
      { nome: 'Legs', volume: LEGS },
    ],
  },
};

const NIVEIS = {
  iniciante: { series: 3, reps: { alto: '6-8', baixo: '8-10' } },
  intermediario: { series: 2, reps: { alto: '5-9', baixo: '5-9' } },
  avancado: { series: 2, reps: { alto: '5-9', baixo: '5-9' } },
};

const RIR = '1/0';

const NIVEIS_VALIDOS = Object.keys(NIVEIS);
const GENEROS_VALIDOS = ['feminino', 'masculino'];
const DIAS_VALIDOS = Object.keys(DIVISOES).map(Number);

function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function distribuir(agrupamentos, slots) {
  const blocos = [];
  let i = 0;

  for (const quantidade of slots) {
    const bloco = [];
    for (let k = 0; k < quantidade; k++) {
      bloco.push(agrupamentos[i % agrupamentos.length]);
      i++;
    }
    blocos.push(bloco);
  }

  return blocos;
}

function ordenarZigZag(exercicios) {
  const filas = new Map();
  for (const e of exercicios) {
    if (!filas.has(e.agrupamento)) filas.set(e.agrupamento, []);
    filas.get(e.agrupamento).push(e);
  }

  const ordenados = [];
  let anterior = null;

  while (ordenados.length < exercicios.length) {
    let escolhido = null;

    for (const [agrupamento, fila] of filas) {
      if (fila.length === 0) continue;
      if (agrupamento === anterior && filas.size > 1) {
        const outros = [...filas].some(([a, f]) => a !== anterior && f.length > 0);
        if (outros) continue;
      }
      if (!escolhido || fila.length > filas.get(escolhido).length) escolhido = agrupamento;
    }

    if (!escolhido) break;

    ordenados.push(filas.get(escolhido).shift());
    anterior = escolhido;
  }

  return ordenados;
}

function gerarTreino({ nivel, genero, dias }, catalogo) {
  if (!NIVEIS_VALIDOS.includes(nivel)) {
    throw new Error(`Nível inválido. Use: ${NIVEIS_VALIDOS.join(', ')}.`);
  }

  if (!GENEROS_VALIDOS.includes(genero)) {
    throw new Error(`Gênero inválido. Use: ${GENEROS_VALIDOS.join(', ')}.`);
  }

  if (!DIVISOES[dias]) {
    throw new Error(`Dias por semana inválido. Use: ${DIAS_VALIDOS.join(', ')}.`);
  }

  const divisao = DIVISOES[dias];
  const config = NIVEIS[nivel];

  const danoPorAgrupamento = {};
  for (const a of catalogo.agrupamentos) danoPorAgrupamento[a.slug] = a.dano;

  const porAgrupamento = {};
  for (const e of catalogo.exercicios) {
    if (e.genero !== 'ambos' && e.genero !== genero) continue;
    if (!porAgrupamento[e.agrupamento]) porAgrupamento[e.agrupamento] = [];
    porAgrupamento[e.agrupamento].push(e);
  }
  for (const slug of Object.keys(porAgrupamento)) {
    porAgrupamento[slug] = embaralhar(porAgrupamento[slug]);
  }

  const ocorrencias = {};
  divisao.sessoes.forEach((sessao, indice) => {
    for (const [musculo, quantidade] of Object.entries(sessao.volume)) {
      if (!ocorrencias[musculo]) ocorrencias[musculo] = [];
      ocorrencias[musculo].push({ indice, quantidade });
    }
  });

  const planoPorSessao = divisao.sessoes.map(() => []);

  for (const [nome, aparicoes] of Object.entries(ocorrencias)) {
    const agrupamentos = MUSCULOS[nome];
    if (!agrupamentos) throw new Error(`Músculo desconhecido na divisão: ${nome}.`);

    const blocos = distribuir(agrupamentos, aparicoes.map((a) => a.quantidade));

    aparicoes.forEach((aparicao, i) => {
      for (const slug of blocos[i]) planoPorSessao[aparicao.indice].push(slug);
    });
  }

  const usados = new Set();
  const enfasesUsadas = {};

  const sessoes = divisao.sessoes.map((sessao, indice) => {
    const escolhidos = [];
    const usadosNaSessao = new Set();

    for (const slug of planoPorSessao[indice]) {
      const opcoes = porAgrupamento[slug] || [];
      if (opcoes.length === 0) continue;

      const livres = opcoes.filter((e) => !usadosNaSessao.has(e.id));
      if (livres.length === 0) continue;

      const enfases = enfasesUsadas[slug] || new Set();

      const escolhido =
        livres.find((e) => !usados.has(e.id) && (!e.enfase || !enfases.has(e.enfase))) ||
        livres.find((e) => !usados.has(e.id)) ||
        livres.find((e) => !e.enfase || !enfases.has(e.enfase)) ||
        livres[0];

      usados.add(escolhido.id);
      usadosNaSessao.add(escolhido.id);

      if (escolhido.enfase) {
        if (!enfasesUsadas[slug]) enfasesUsadas[slug] = new Set();
        enfasesUsadas[slug].add(escolhido.enfase);
      }

      escolhidos.push({
        exercicio_id: escolhido.id,
        nome: escolhido.nome,
        agrupamento: slug,
        equipamento: escolhido.equipamento,
        enfase: escolhido.enfase || null,
        observacao: escolhido.observacao || null,
        series: config.series,
        reps: config.reps[danoPorAgrupamento[slug] || 'baixo'],
        rir: RIR,
      });
    }

    const repeteNome = divisao.sessoes.filter((s) => s.nome === sessao.nome).length > 1;
    const numero = repeteNome
      ? ` ${divisao.sessoes.slice(0, indice + 1).filter((s) => s.nome === sessao.nome).length}`
      : '';

    return {
      nome: `${sessao.nome}${numero}`,
      ordem: indice,
      exercicios: ordenarZigZag(escolhidos).map((e, i) => ({ ...e, ordem: i })),
    };
  });

  return { divisao: divisao.slug, nomeDivisao: divisao.nome, sessoes };
}

module.exports = { gerarTreino, DIVISOES, MUSCULOS, NIVEIS_VALIDOS, GENEROS_VALIDOS, DIAS_VALIDOS };
