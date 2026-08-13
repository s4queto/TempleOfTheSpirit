# Gerador de treinos — modelo e regras

Documento vivo. Registra as decisões antes de virarem código.
Itens marcados com **?** ainda não foram decididos.

## O que este projeto não é

Não é um sorteador de exercícios. A seleção segue regras de quem entende de
treino — cobertura muscular, ordem, volume por nível e dicas de execução
próprias. Um gerador genérico devolve "3 exercícios de peito"; este devolve
um exercício para cada porção do peitoral que precisa ser estimulada.

## Fluxo

```
1. Formulário  → nível, gênero, dias por semana        ← o usuário responde
2. Divisão     → quais músculos em cada dia            ← o usuário escolhe
--------------------------------------------------------------------------
3. Seleção     → um exercício por agrupamento do dia   ← REGRA NOSSA
4. Ordem       → sequência dos exercícios no dia       ← REGRA NOSSA
5. Prescrição  → séries, faixa de repetições e RIR     ← REGRA NOSSA
--------------------------------------------------------------------------
6. Ficha       → boneco com os músculos do dia + observações de execução
7. Registro    → o aluno anota carga e repetições a cada sessão
```

**A linha divisória importa.** O usuário informa a situação dele (nível, objetivo,
disponibilidade) e escolhe a divisão. Tudo abaixo da linha — quais exercícios, em
que ordem, com quanto volume — é decisão nossa. O usuário não escolhe exercício.
É isso que separa este projeto de um gerador genérico.

## Regras decididas

### Agrupamento muscular

Cada exercício aponta para o agrupamento que ele ataca, não só para o músculo
grande. É esse campo que:

- faz o gerador cobrir todas as porções do músculo em vez de sortear;
- acende o músculo certo no boneco da ficha;
- define a faixa de repetições, através do dano muscular.

O agrupamento não é só um rótulo: carrega propriedades de treino. Hoje uma
(`dano`: alto ou baixo), possivelmente mais no futuro.

**Regra para separar ou juntar agrupamentos:** se o exercício atinge os dois
apenas parcialmente, ficam separados. Se recruta os dois de verdade, viram um
alvo só.

### Volume por nível

São três níveis: iniciante, intermediário e avançado.

| nível | séries válidas | faixa de reps | RIR |
| ----- | -------------- | ------------- | --- |
| Iniciante | 3 | 6-8 / 8-10 | 1/0 |
| Intermediário | 2 | 5-9 | 1/0 |
| Avançado | 2 | 5-9 | 1/0 |

O RIR é o mesmo para todos os níveis: faixa **1/0 RIR**. O que varia entre níveis
é o volume (séries) e a faixa de repetições, não a proximidade da falha.

As duas faixas do iniciante são escolhidas pelo **dano muscular do agrupamento**,
não pelo tipo de exercício:

| dano do agrupamento | faixa do iniciante |
| ------------------- | ------------------ |
| Alto | 6-8 |
| Baixo | 8-10 |

Alto dano = menos repetições, mais recuperação. Baixo dano = aguenta mais volume.

> Confirmar o sentido: inverter essa tabela inverteria a prescrição inteira.

O avançado usa a mesma faixa do intermediário, mas com **técnicas de intensidade
diferentes** — a detalhar mais para frente.

Contraintuitivo de propósito: o avançado leva cada série mais perto da falha,
então precisa de menos séries válidas.

### Ordem dos exercícios

Definida por regra nossa, não pelo usuário.

**Zig-zag:** nunca dois exercícios do mesmo músculo em sequência, por causa da
fadiga local. Exemplo real de um dia de Pull:

```
upperback → deltoide posterior → bíceps → latíssimo → trapézio
```

Note que latíssimo e trapézio ficam adjacentes, e ambos são costas. A regra não
alterna por grupo (peito/costas/ombro) e sim por **músculo específico**: dois
exercícios de latíssimo não podem se seguir, mas latíssimo depois de upperback
está correto.

### Intensidade

Prescrição por **RIR** (Reps In Reserve), não só por número de repetições.
Campo próprio na ficha, separado da faixa de repetições.

### Observações

Texto de execução escrito pelo Miguel. É o diferencial do produto, não um
campo secundário: duas fichas podem ter os mesmos exercícios e o que as separa
é a dica.

**A observação é fixa do exercício.** Mora na tabela `exercicios`, escrita uma
vez e reaproveitada em toda ficha onde aquele exercício aparecer. Na prática o
catálogo vira o acervo de conhecimento do projeto: cada exercício cadastrado
carrega junto a orientação de execução.

## Agrupamentos

A coluna **dano** abaixo é proposta minha, para o Miguel corrigir.

### Peito

| agrupamento | slug | dano | exercício típico |
| ----------- | ---- | :--: | ---------------- |
| Peitoral maior — porção clavicular | `peitoral_maior_clavicular` | alto | inclinado |
| Peitoral maior — porção esternocostal | `peitoral_maior_esternocostal` | alto | reto |
| Peitoral maior — porção abdominal | `peitoral_maior_abdominal` | alto | declinado / mergulho |

**?** Peitoral menor e serrátil anterior entram como alvo próprio?

### Costas

| agrupamento | slug | dano | observação |
| ----------- | ---- | :--: | ---------- |
| Latíssimo do dorso + redondo maior | `latissimo_dorso` | alto | puxada vertical recruta os dois de verdade |
| Upper back | `upperback` | baixo | trapézio médio + romboides; remada com retração |
| Trapézio | `trapezio` | baixo | porção superior; encolhimento |
| Eretores da espinha | `eretores_espinha` | alto | terra, extensão lombar |

`upperback` e `trapezio` são alvos distintos: a remada com retração não pega o
trapézio inteiro, só as fibras médias e os romboides. O encolhimento é que
cobre a porção superior.

### Pernas

| agrupamento | slug | dano |
| ----------- | ---- | :--: |
| Quadríceps | `quadriceps` | alto |
| Posterior de coxa | `posterior_coxa` | alto |
| Glúteo | `gluteo` | alto |
| Adutores | `adutores` | alto |
| Panturrilha | `panturrilha` | baixo |

Panturrilha fica inteira, sem separar gastrocnêmio e sóleo.

Glúteo e quadríceps ficam inteiros, sem fatiar em porções. **Não** porque as
porções não existam, mas porque a explicação na ficha cobre isso: o aluno
entende que áreas diferentes estão sendo trabalhadas sem que o modelo precise
de um alvo para cada uma.

Vocabulário: usar **posterior de coxa**, não "isquiotibiais".

### Ombro

| agrupamento | slug | dano |
| ----------- | ---- | :--: |
| Deltoide lateral | `deltoide_lateral` | baixo |
| Deltoide posterior | `deltoide_posterior` | baixo |

O **deltoide anterior não é um agrupamento**. Ele já recebe estímulo suficiente
de todo movimento de supino e não leva exercício dedicado. Consequência: ele
nunca será aceso no boneco, já que nenhum exercício aponta para ele.

### Braço

| agrupamento | slug | dano | nota |
| ----------- | ---- | :--: | ---- |
| Bíceps | `biceps` | baixo | bíceps, braquial e braquiorradial num alvo só |
| Tríceps | `triceps` | baixo | as três cabeças num alvo só |

## Ênfase

Vários agrupamentos foram unificados por serem tratados como um músculo só —
tríceps, bíceps, glúteo, quadríceps, trapézio, panturrilha, posterior de coxa.
Mas o treino ainda precisa cobrir as porções internas: não adianta sortear três
exercícios de tríceps que batam todos na mesma cabeça.

Por isso cada exercício carrega o campo **`enfase`**: qual porção do agrupamento
ele enfatiza.

```
Tríceps francês   → cabeça longa
Tríceps corda     → lateral e medial
Agachamento livre → vastos (alongado)
Cadeira extensora → reto femoral (encurtado)
```

O formato é **porção (posição de trabalho)**. A posição entre parênteses não é
enfeite: no quadríceps quase tudo é vasto, e é ela que torna as ênfases
distintas o suficiente para a regra funcionar.

**Regra do gerador:** ao escolher 2 ou 3 exercícios do mesmo agrupamento,
preferir ênfases diferentes. A cobertura interna deixa de depender da curadoria
e passa a ser garantida pelo sistema.

Onde não há subdivisão relevante, o campo fica vazio.

### Core e antebraço

| agrupamento | slug | dano |
| ----------- | ---- | :--: |
| Reto abdominal | `reto_abdominal` | baixo |
| Oblíquos | `obliquos` | baixo |
| Flexores de punho | `flexores_punho` | baixo |
| Extensores de punho | `extensores_punho` | baixo |

## Resumo dos agrupamentos

21 alvos no total. Todo exercício do catálogo aponta para um deles.

| grupo | alvos |
| ----- | ----- |
| Peito | clavicular, esternocostal, abdominal |
| Costas | latíssimo, upperback, trapézio, eretores |
| Ombro | deltoide lateral, posterior |
| Perna | quadríceps, posterior de coxa, glúteo, adutores, panturrilha |
| Braço | bíceps, tríceps longa, tríceps lateral+medial |
| Core | reto abdominal, oblíquos |
| Antebraço | flexores, extensores de punho |

**Alto dano** (faixa 6-8 no iniciante): as três porções do peitoral, latíssimo,
eretores, quadríceps, posterior de coxa, glúteo, adutores.

**Baixo dano** (faixa 8-10 no iniciante): todo o resto.

## Equipamento

Não há restrição por categoria de equipamento. O critério é **o exercício certo
para o alvo**; o equipamento é consequência da escolha, não um filtro aplicado
antes dela.

A preocupação de não depender de um aparelho que a academia não tem é resolvida
pela tabela de substituições, não por banir máquina ou cabo do catálogo.

O campo `equipamento` existe para informar o aluno e para alimentar as
substituições — não para o gerador filtrar.

## Divisões

**Regra:** toda divisão precisa entregar frequência 2 (cada músculo treinado
duas vezes na semana). A única exceção é o PPL de 3 dias, que fica como opção
mínima para quem só tem três sessões disponíveis.

| dias | divisão | sequência | frequência |
| :--: | ------- | --------- | :--------: |
| 3 | Push / Pull / Legs | A, B, C | 1 (exceção) |
| 4 | Upper / Lower | A, B, A, B | 2 |
| 5 | PPLUL | Push, Pull, Legs, Upper, Lower | 2 |
| 6 | Push / Pull / Legs ×2 | A, B, C, A, B, C | 2 |

O PPLUL não é uma divisão arbitrária de cinco dias: Push + Upper cobrem o
tronco duas vezes, Legs + Lower cobrem as pernas duas vezes. É a forma de
chegar em frequência 2 com cinco sessões.

Upper/Lower de 2 dias foi descartado por entregar frequência 1.

### Gênero

O formulário pergunta o gênero, e ele filtra a seleção de exercícios. Alguns
exercícios são prescritos para um público e não para outro — coice na polia é
o exemplo típico.

Cada exercício do catálogo carrega um campo `genero`: `ambos` (padrão),
`feminino` ou `masculino`.

### Distribuição entre as sessões

Uma sessão **não** cobre todos os agrupamentos do músculo. O limite é de **2 a 3
exercícios por músculo, por sessão** — e o limite vale para cada músculo do dia,
não para o dia inteiro. Um Push pode ter até 3 de peito, 3 de ombro e 3 de
tríceps.

Como não dá para trabalhar o músculo inteiro de uma vez, os agrupamentos que
ficaram de fora entram na segunda sessão da semana, acompanhados de um
**complementar** — um exercício a mais para qualquer um dos agrupamentos daquele
músculo, inclusive um já treinado na primeira sessão.

```
Push 1:  clavicular + esternocostal
Push 2:  abdominal + complementar (clavicular ou esternocostal de novo)
```

Isso substitui a ideia de "um exercício para cada agrupamento em toda sessão".
A cobertura completa acontece **na semana**, não em cada treino.

Efeito colateral bom: resolve o problema dos agrupamentos com um único
exercício cadastrado, já que eles passam a aparecer uma vez por semana.

**Exceção do PPL de 3 dias:** ali cada músculo aparece uma única vez na semana,
então não existe "a outra sessão" para receber o resto. Nesse caso a sessão
cobre **todos** os agrupamentos do músculo, um exercício cada, e fica
propositalmente mais longa.

### Dias repetidos

Nas divisões de 4 e 6 dias, o segundo Push **não repete os mesmos exercícios**
do primeiro — mas cobre exatamente os mesmos agrupamentos.

```
Push 1:  esternocostal → deltoide lateral → tríceps ...
Push 2:  esternocostal → deltoide lateral → tríceps ...
         (mesmos alvos, exercícios diferentes)
```

Ou seja: **o dia define os agrupamentos, a ficha define os exercícios.** O alvo
é fixo, a ferramenta varia.

Consequência prática para o catálogo: cada agrupamento precisa de **no mínimo
dois exercícios** cadastrados, senão as divisões de 4 e 6 dias não conseguem
variar. Na hora de montar o catálogo isso vira critério de completude.

## Campos da ficha

| campo | origem |
| ----- | ------ |
| Nº de séries | regra de nível |
| Exercício | seleção por agrupamento |
| Faixa de repetições | regra de dano do agrupamento + nível |
| RIR | constante 1/0 |
| Observação | texto do Miguel, fixo no exercício — **como executar** |
| Explicação | texto do Miguel, no agrupamento — **o que está sendo trabalhado** |
| Substituições | equivalentes para quando falta o aparelho |

Não haverá link de vídeo de execução. A orientação é escrita, pelo texto de
observação.

São dois textos diferentes e não devem ser confundidos:

- **Observação** vive no exercício e ensina a execução ("incline o tronco à frente").
- **Explicação** vive no agrupamento e ensina a anatomia ("o glúteo tem porções
  diferentes; este movimento enfatiza a superior").

A explicação é o que permite manter alvos amplos como `gluteo` e `quadriceps`
sem perder o didatismo.

## Ideias registradas

- **Boneco anatômico:** SVG do corpo com um `id` por agrupamento. A ficha acende
  os músculos treinados no dia. Sai de graça do campo de agrupamento.
- **Substituição de exercício:** cada exercício tem equivalentes, para quando a
  academia não tem o aparelho. Tabela ligando exercício a exercício.
- **Aquecimento:** série de aquecimento apenas no primeiro exercício de cada
  músculo, não em todos. **?** Entra na ficha gerada ou fica como instrução geral?
