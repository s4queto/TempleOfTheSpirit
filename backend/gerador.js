const MUSCULOS = {
  peito: {
    agrupamentos: ['peitoral_maior_clavicular', 'peitoral_maior_esternocostal', 'peitoral_maior_abdominal'],
    min: 2,
    max: 3,
  },
  costas: {
    agrupamentos: ['latissimo_dorso', 'upperback', 'trapezio', 'eretores_espinha'],
    min: 2,
    max: 3,
  },
  ombro: {
    agrupamentos: ['deltoide_lateral', 'deltoide_posterior'],
    min: 2,
    max: 2,
  },
  biceps: { agrupamentos: ['biceps'], min: 2, max: 2 },
  triceps: { agrupamentos: ['triceps'], min: 2, max: 2 },
  quadriceps: { agrupamentos: ['quadriceps'], min: 2, max: 2 },
  posterior_coxa: { agrupamentos: ['posterior_coxa'], min: 2, max: 2 },
  gluteo: { agrupamentos: ['gluteo'], min: 1, max: 1 },
  adutores: { agrupamentos: ['adutores'], min: 1, max: 1 },
  panturrilha: { agrupamentos: ['panturrilha'], min: 1, max: 1 },
  core: { agrupamentos: ['reto_abdominal', 'obliquos'], min: 1, max: 1 },
  antebraco: { agrupamentos: ['flexores_punho', 'extensores_punho'], min: 1, max: 1 },
};

const PERNA = ['quadriceps', 'posterior_coxa', 'gluteo', 'adutores', 'panturrilha'];

const PUSH = ['peito', 'ombro', 'triceps'];
const PULL = ['costas', 'biceps', 'antebraco'];
const LEGS = [...PERNA, 'core'];
const UPPER = ['peito', 'costas', 'ombro', 'biceps', 'triceps', 'antebraco'];
const LOWER = [...PERNA, 'core'];

const DIVISOES = {
  3: {
    slug: 'ppl3',
    nome: 'Push / Pull / Legs',
    sessoes: [
      { nome: 'Push', musculos: PUSH },
      { nome: 'Pull', musculos: PULL },
      { nome: 'Legs', musculos: LEGS },
    ],
  },
  4: {
    slug: 'ul4',
    nome: 'Upper / Lower',
    sessoes: [
      { nome: 'Upper', musculos: UPPER },
      { nome: 'Lower', musculos: LOWER },
      { nome: 'Upper', musculos: UPPER },
      { nome: 'Lower', musculos: LOWER },
    ],
  },
  5: {
    slug: 'pplul5',
    nome: 'PPLUL',
    sessoes: [
      { nome: 'Push', musculos: PUSH },
      { nome: 'Pull', musculos: PULL },
      { nome: 'Legs', musculos: LEGS },
      { nome: 'Upper', musculos: UPPER },
      { nome: 'Lower', musculos: LOWER },
    ],
  },
  6: {
    slug: 'ppl6',
    nome: 'Push / Pull / Legs x2',
    sessoes: [
      { nome: 'Push', musculos: PUSH },
      { nome: 'Pull', musculos: PULL },
      { nome: 'Legs', musculos: LEGS },
      { nome: 'Push', musculos: PUSH },
      { nome: 'Pull', musculos: PULL },
      { nome: 'Legs', musculos: LEGS },
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

function distribuir(musculo, quantidadeDeSessoes) {
  const { agrupamentos, min, max } = musculo;

  if (quantidadeDeSessoes === 1) {
    const unica = [...agrupamentos];
    let i = 0;
    while (unica.length < min) {
      unica.push(agrupamentos[i % agrupamentos.length]);
      i++;
    }
    return [unica];
  }

  const porSessao = Math.min(max, Math.max(min, Math.ceil(agrupamentos.length / quantidadeDeSessoes)));
  const blocos = [];

  for (let i = 0; i < quantidadeDeSessoes; i++) {
    blocos.push(agrupamentos.slice(i * porSessao, (i + 1) * porSessao));
  }

  return blocos.map((bloco, indice) => {
    const completo = [...bloco];
    let i = indice;

    while (completo.length < min) {
      completo.push(agrupamentos[i % agrupamentos.length]);
      i++;
    }

    return completo;
  });
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
    for (const musculo of sessao.musculos) {
      if (!ocorrencias[musculo]) ocorrencias[musculo] = [];
      ocorrencias[musculo].push(indice);
    }
  });

  const planoPorSessao = divisao.sessoes.map(() => []);

  for (const [nome, indices] of Object.entries(ocorrencias)) {
    const musculo = MUSCULOS[nome];
    if (!musculo) throw new Error(`Músculo desconhecido na divisão: ${nome}.`);

    const blocos = distribuir(musculo, indices.length);

    indices.forEach((indiceDaSessao, i) => {
      for (const slug of blocos[i]) planoPorSessao[indiceDaSessao].push(slug);
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
