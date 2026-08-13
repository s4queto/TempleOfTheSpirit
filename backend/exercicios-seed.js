// Catálogo de exercícios, revisado e aprovado pelo Miguel, um agrupamento por vez.
//
// agrupamento: slug de agrupamentos-seed.js
// equipamento: barra | halter | smith | maquina | cabo | peso_corporal
// enfase:      qual porção do agrupamento o exercício enfatiza. Só faz sentido
//              nos agrupamentos unificados (tríceps, bíceps, glúteo, quadríceps,
//              trapézio, panturrilha, posterior de coxa). O gerador usa para não
//              escolher dois exercícios que batam na mesma porção.
// genero:      ambos (padrão) | feminino | masculino
// observacao:  texto de execução, escrito pelo Miguel. Segunda passada, depois
//              que os agrupamentos estiverem todos fechados.

const EXERCICIOS = [
  // ----- Peitoral maior — porção clavicular -----
  { nome: 'Supino inclinado com barra', agrupamento: 'peitoral_maior_clavicular', equipamento: 'barra' },
  { nome: 'Supino inclinado com halteres', agrupamento: 'peitoral_maior_clavicular', equipamento: 'halter' },
  { nome: 'Supino inclinado no smith', agrupamento: 'peitoral_maior_clavicular', equipamento: 'smith' },
  { nome: 'Crucifixo inclinado com halteres', agrupamento: 'peitoral_maior_clavicular', equipamento: 'halter' },

  // ----- Peitoral maior — porção esternocostal -----
  { nome: 'Supino reto com barra', agrupamento: 'peitoral_maior_esternocostal', equipamento: 'barra' },
  { nome: 'Supino reto no smith', agrupamento: 'peitoral_maior_esternocostal', equipamento: 'smith' },
  { nome: 'Crucifixo reto no cabo', agrupamento: 'peitoral_maior_esternocostal', equipamento: 'cabo' },
  { nome: 'Voador', agrupamento: 'peitoral_maior_esternocostal', equipamento: 'maquina' },

  // ----- Peitoral maior — porção abdominal -----
  { nome: 'Paralela', agrupamento: 'peitoral_maior_abdominal', equipamento: 'peso_corporal' },
  { nome: 'Supino declinado na máquina', agrupamento: 'peitoral_maior_abdominal', equipamento: 'maquina' },
  { nome: 'Crucifixo polia alta', agrupamento: 'peitoral_maior_abdominal', equipamento: 'cabo' },

  // ----- Latíssimo do dorso -----
  { nome: 'Barra fixa', agrupamento: 'latissimo_dorso', equipamento: 'peso_corporal' },
  { nome: 'Puxada frontal', agrupamento: 'latissimo_dorso', equipamento: 'maquina' },
  { nome: 'Pulldown', agrupamento: 'latissimo_dorso', equipamento: 'cabo' },
  { nome: 'Puxada alta unilateral na máquina', agrupamento: 'latissimo_dorso', equipamento: 'maquina' },

  // ----- Upper back -----
  { nome: 'Remada TBar', agrupamento: 'upperback', equipamento: 'maquina' },
  { nome: 'Remada articulada pegada aberta', agrupamento: 'upperback', equipamento: 'maquina' },

  // ----- Trapézio -----
  { nome: 'Kelso shrug', agrupamento: 'trapezio', equipamento: 'maquina' },
  { nome: 'Encolhimento com halteres', agrupamento: 'trapezio', equipamento: 'halter' },

  // ----- Eretores da espinha -----
  // Observação a escrever: instrução sobre como segurar o peso.
  { nome: 'Banco romano', agrupamento: 'eretores_espinha', equipamento: 'peso_corporal' },

  // ----- Deltoide lateral -----
  { nome: 'Elevação lateral com halteres', agrupamento: 'deltoide_lateral', equipamento: 'halter' },
  { nome: 'Elevação lateral no cabo', agrupamento: 'deltoide_lateral', equipamento: 'cabo' },
  { nome: 'Desenvolvimento na máquina', agrupamento: 'deltoide_lateral', equipamento: 'maquina' },
  { nome: 'Desenvolvimento com halteres', agrupamento: 'deltoide_lateral', equipamento: 'halter' },

  // ----- Deltoide posterior -----
  { nome: 'Crucifixo inverso na máquina', agrupamento: 'deltoide_posterior', equipamento: 'maquina' },

  // ----- Quadríceps -----
  // A posição entre parênteses é o que diferencia as ênfases: como quase tudo
  // é vasto, é ela que impede o gerador de escolher dois exercícios iguais.
  { nome: 'Agachamento livre', agrupamento: 'quadriceps', equipamento: 'barra', enfase: 'vastos (alongado)' },
  { nome: 'Agachamento no smith', agrupamento: 'quadriceps', equipamento: 'smith', enfase: 'vastos (alongado)' },
  { nome: 'Hack machine', agrupamento: 'quadriceps', equipamento: 'maquina', enfase: 'vastos (alongado)' },
  { nome: 'Leg press', agrupamento: 'quadriceps', equipamento: 'maquina', enfase: 'vastos (meio)' },
  { nome: 'Cadeira extensora', agrupamento: 'quadriceps', equipamento: 'maquina', enfase: 'reto femoral (encurtado)' },
  { nome: 'Afundo no smith', agrupamento: 'quadriceps', equipamento: 'smith', enfase: 'vastos (alongado)' },

  // ----- Posterior de coxa -----
  { nome: 'Stiff com barra', agrupamento: 'posterior_coxa', equipamento: 'barra' },
  { nome: 'Mesa flexora', agrupamento: 'posterior_coxa', equipamento: 'maquina' },
  { nome: 'Cadeira flexora', agrupamento: 'posterior_coxa', equipamento: 'maquina' },

  // ----- Glúteo -----
  { nome: 'Elevação pélvica', agrupamento: 'gluteo', equipamento: 'barra' },

  // ----- Adutores -----
  { nome: 'Cadeira adutora', agrupamento: 'adutores', equipamento: 'maquina' },
  { nome: 'Adução no cabo', agrupamento: 'adutores', equipamento: 'cabo' },

  // ----- Panturrilha -----
  { nome: 'Panturrilha no smith', agrupamento: 'panturrilha', equipamento: 'smith' },
  { nome: 'Panturrilha na máquina', agrupamento: 'panturrilha', equipamento: 'maquina' },

  // ----- Bíceps -----
  { nome: 'Rosca direta', agrupamento: 'biceps', equipamento: 'barra' },
  { nome: 'Rosca scott', agrupamento: 'biceps', equipamento: 'maquina' },
  { nome: 'Rosca inclinada com halteres', agrupamento: 'biceps', equipamento: 'halter' },

  // ----- Tríceps -----
  { nome: 'Tríceps francês', agrupamento: 'triceps', equipamento: 'halter', enfase: 'cabeca_longa' },
  { nome: 'Tríceps corda', agrupamento: 'triceps', equipamento: 'cabo', enfase: 'lateral_medial' },
  { nome: 'JM press', agrupamento: 'triceps', equipamento: 'smith', enfase: 'cabeca_longa' },

  // ----- Reto abdominal -----
  { nome: 'Abdominal supra no cabo', agrupamento: 'reto_abdominal', equipamento: 'cabo' },
  { nome: 'Abdominal infra', agrupamento: 'reto_abdominal', equipamento: 'peso_corporal' },

  // ----- Oblíquos -----
  { nome: 'Rotação no cabo', agrupamento: 'obliquos', equipamento: 'cabo' },
  { nome: 'Prancha lateral', agrupamento: 'obliquos', equipamento: 'peso_corporal' },

  // ----- Flexores de punho -----
  { nome: 'Flexão de punho no cabo', agrupamento: 'flexores_punho', equipamento: 'cabo' },

  // ----- Extensores de punho -----
  { nome: 'Extensão de punho no cabo', agrupamento: 'extensores_punho', equipamento: 'cabo' },
];

module.exports = { EXERCICIOS };
