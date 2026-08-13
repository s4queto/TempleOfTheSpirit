const AGRUPAMENTOS = [
  // ----- Peito -----
  { slug: 'peitoral_maior_clavicular', nome: 'Peitoral maior — porção clavicular', grupo: 'peito', dano: 'alto' },
  { slug: 'peitoral_maior_esternocostal', nome: 'Peitoral maior — porção esternocostal', grupo: 'peito', dano: 'alto' },
  { slug: 'peitoral_maior_abdominal', nome: 'Peitoral maior — porção abdominal', grupo: 'peito', dano: 'alto' },

  // ----- Costas -----
  { slug: 'latissimo_dorso', nome: 'Latíssimo do dorso', grupo: 'costas', dano: 'alto' },
  { slug: 'upperback', nome: 'Upper back', grupo: 'costas', dano: 'baixo' },
  { slug: 'trapezio', nome: 'Trapézio', grupo: 'costas', dano: 'baixo' },
  { slug: 'eretores_espinha', nome: 'Eretores da espinha', grupo: 'costas', dano: 'alto' },

  // ----- Ombro -----
  { slug: 'deltoide_lateral', nome: 'Deltoide lateral', grupo: 'ombro', dano: 'baixo' },
  { slug: 'deltoide_posterior', nome: 'Deltoide posterior', grupo: 'ombro', dano: 'baixo' },

  // ----- Perna -----
  { slug: 'quadriceps', nome: 'Quadríceps', grupo: 'perna', dano: 'alto' },
  { slug: 'posterior_coxa', nome: 'Posterior de coxa', grupo: 'perna', dano: 'alto' },
  { slug: 'gluteo', nome: 'Glúteo', grupo: 'perna', dano: 'alto' },
  { slug: 'adutores', nome: 'Adutores', grupo: 'perna', dano: 'alto' },
  { slug: 'panturrilha', nome: 'Panturrilha', grupo: 'perna', dano: 'baixo' },

  // ----- Braço -----
  { slug: 'biceps', nome: 'Bíceps', grupo: 'braco', dano: 'baixo' },
  { slug: 'triceps', nome: 'Tríceps', grupo: 'braco', dano: 'baixo' },

  // ----- Core -----
  { slug: 'reto_abdominal', nome: 'Reto abdominal', grupo: 'core', dano: 'baixo' },
  { slug: 'obliquos', nome: 'Oblíquos', grupo: 'core', dano: 'baixo' },

  // ----- Antebraço -----
  { slug: 'flexores_punho', nome: 'Flexores de punho', grupo: 'antebraco', dano: 'baixo' },
  { slug: 'extensores_punho', nome: 'Extensores de punho', grupo: 'antebraco', dano: 'baixo' },
];

module.exports = { AGRUPAMENTOS };
