// Traduções do site (português e inglês).
// No HTML: data-i18n troca o texto, data-i18n-html troca o HTML,
// data-i18n-placeholder troca o placeholder e data-i18n-alt troca o alt.
// No JavaScript: t('chave') ou t('chave', { nome: 'Ana' }).

const TEXTOS = {
    pt: {
        // ----- Geral -----
        'geral.erroServidor': 'Erro ao conectar com o servidor.',
        'geral.sessaoExpirou': 'Sua sessão expirou. Faça login novamente.',
        'geral.ola': 'Olá, {nome}!',
        'geral.sair': 'Sair',
        'geral.perfil': 'Perfil',
        'geral.tarefas': 'Tarefas',
        'geral.nome': 'Nome',
        'geral.email': 'E-mail',
        'geral.senha': 'Senha',
        'geral.idioma': 'Idioma',
        'geral.senhasNaoCoincidem': 'As senhas não coincidem.',
        'geral.redirecionando': 'Redirecionando...',
        'geral.salvarAlteracoes': 'Salvar alterações',
        'geral.alterarSenha': 'Alterar senha',
        'geral.senhaAtual': 'Senha atual',
        'geral.novaSenha': 'Nova senha',
        'geral.excluir': 'Excluir',
        'geral.adicionar': 'Adicionar',

        // ----- Login -----
        'login.titulo': 'Login',
        'login.usuario': 'Usuário',
        'login.lembrar': 'Lembrar senha',
        'login.esqueci': 'Esqueci a senha',
        'login.botao': 'Login',
        'login.semConta': 'Não tem uma conta?',
        'login.cadastreSe': 'Cadastre-se',
        'login.preencha': 'Preencha e-mail e senha.',
        'login.bemVindo': 'Bem-vindo, {nome}!',
        'login.digiteEmail': 'Digite seu e-mail cadastrado:',

        // ----- Cadastro -----
        'cadastro.titulo': 'Cadastro',
        'cadastro.confirmarSenha': 'Confirmar senha',
        'cadastro.botao': 'Cadastrar',
        'cadastro.jaTemConta': 'Já tem uma conta?',
        'cadastro.facaLogin': 'Faça login',
        'cadastro.preencha': 'Preencha todos os campos.',
        'cadastro.sucesso': 'Cadastro realizado! Redirecionando...',

        // ----- Redefinir senha -----
        'redefinir.titulo': 'Nova Senha',
        'redefinir.confirmar': 'Confirmar nova senha',
        'redefinir.botao': 'Salvar nova senha',
        'redefinir.voltar': 'Voltar para o login',
        'redefinir.preencha': 'Preencha os dois campos.',
        'redefinir.linkInvalido': 'Link inválido ou incompleto.',

        // ----- Tarefas -----
        'tarefas.titulo': 'Minhas tarefas',
        'tarefas.nova': 'Nova tarefa',
        'tarefas.descricao': 'Descrição (opcional)',
        'tarefas.vazio': 'Nenhuma tarefa ainda. Adicione a primeira!',
        'tarefas.contador': '{pendentes} pendente(s) de {total}',
        'tarefas.informeTitulo': 'Informe o título da tarefa.',
        'tarefas.confirmarExcluir': 'Excluir esta tarefa?',

        // ----- Perfil -----
        'perfil.titulo': 'Meu perfil',
        'perfil.subtitulo': 'Seus dados de acesso.',
        'perfil.preenchaNomeEmail': 'Preencha nome e e-mail.',
        'perfil.informeSenhas': 'Informe a senha atual e a nova senha.',
        'perfil.foto': 'Foto de perfil',
        'perfil.fotoDesc': 'Aparece só se você colocar uma. Sem foto, fica o ícone padrão.',
        'perfil.fotoAlt': 'Foto de perfil',
        'perfil.escolherFoto': 'Escolher foto',
        'perfil.remover': 'Remover',
        'perfil.dados': 'Dados pessoais',
        'perfil.dadosDesc': 'Alterar nome ou e-mail da conta.',
        'perfil.senhaDesc': 'A senha atual é exigida mesmo com você já logado.',
        'perfil.idiomaDesc': 'Idioma em que o site aparece para você.',

        // ----- App: menu -----
        'app.menuTitulo': 'Treinos',
        'app.menuPerfil': 'Meu perfil',
        'app.menuTreinos': 'Meus treinos',
        'app.menuNovo': 'Novo treino',
        'app.menuEvolucao': 'Evolução',
        'app.menuAgua': 'Água',
        'app.menuInfo': 'Mais informações',
        'app.sairConta': 'Sair da conta',

        // ----- App: treinos -----
        'treinos.titulo': 'Meus treinos',
        'treinos.subtitulo': 'As fichas que você já gerou.',
        'treinos.vazio': 'Nenhuma ficha ainda. Vá em <strong>Novo treino</strong> para gerar a primeira.',
        'treinos.resumo': '{nivel} · {sessoes} sessões · criado em {data}',
        'treinos.abrir': 'Abrir',
        'treinos.confirmarExcluir': 'Excluir esta ficha?',
        'treinos.qtdExercicios': '{quantidade} exercícios',
        'treinos.musculosSessao': 'Músculos trabalhados nesta sessão',
        'treinos.exercicio': 'Exercício',
        'treinos.series': 'Séries',
        'treinos.reps': 'Reps',
        'treinos.observacao': 'Observação',
        'treinos.registrar': 'Registrar',
        'treinos.salvarSerie': 'Salvar série',
        'treinos.serie': 'Série {numero}',
        'treinos.carga': 'Carga (kg)',
        'treinos.preenchaSerie': 'Preencha ao menos uma série.',

        // ----- App: novo treino -----
        'novo.titulo': 'Novo treino',
        'novo.subtitulo': 'Responda três perguntas e a ficha é montada na hora.',
        'novo.nivel': 'Nível',
        'novo.nivelDesc': 'Define o volume de séries e a faixa de repetições.',
        'novo.genero': 'Gênero',
        'novo.generoDesc': 'Filtra quais exercícios entram na seleção.',
        'novo.dias': 'Dias por semana',
        'novo.diasDesc': 'Define a divisão. De 4 dias em diante cada músculo é treinado duas vezes por semana.',
        'novo.dias3': '3 dias',
        'novo.dias4': '4 dias',
        'novo.dias5': '5 dias',
        'novo.dias6': '6 dias',
        'novo.gerar': 'Gerar ficha',
        'novo.montando': 'Montando a ficha...',
        'nivel.iniciante': 'Iniciante',
        'nivel.intermediario': 'Intermediário',
        'nivel.avancado': 'Avançado',
        'genero.masculino': 'Masculino',
        'genero.feminino': 'Feminino',

        // ----- App: evolução -----
        'evolucao.titulo': 'Evolução',
        'evolucao.subtitulo': 'Acompanhamento de carga ao longo do tempo.',
        'evolucao.sessao': 'Sessão',
        'evolucao.sessaoDesc': 'Escolha uma sessão para ver a evolução de carga de todos os exercícios dela.',
        'evolucao.semRegistros': 'Sem registros ainda.',
        'evolucao.carga': 'Carga (kg)',
        'evolucao.repeticoes': 'Repetições',

        // ----- App: água -----
        'agua.titulo': 'Água',
        'agua.subtitulo': 'Acompanhamento de ingestão diária.',
        'agua.meta': 'Meta de hoje',
        'agua.metaDesc': 'Calculada em 35ml por kg de peso corporal.',
        'agua.peso': 'Seu peso (kg)',
        'agua.salvarPeso': 'Salvar peso',
        'agua.registrar': 'Registrar consumo',
        'agua.registrarDesc': 'Toque numa garrafinha cadastrada ou informe a quantidade.',
        'agua.garrafinhas': 'Minhas garrafinhas',
        'agua.garrafinhasDesc': 'Cadastre os tamanhos que você mais usa.',
        'agua.exemploNome': 'Ex: Squeeze',
        'agua.cadastrar': 'Cadastrar',
        'agua.lembrete': 'Lembrete de beber água',
        'agua.lembreteDesc': 'Manda uma notificação enquanto a meta do dia não é batida.',
        'agua.intervalo': 'A cada quantos minutos',
        'agua.horas1': '1 hora',
        'agua.horas2': '2 horas',
        'agua.horas3': '3 horas',
        'agua.ativarLembretes': 'Ativar lembretes',
        'agua.desativarLembretes': 'Desativar lembretes',
        'agua.ultimosDias': 'Últimos dias',
        'agua.garrafinhasHoje': '≈ {quantidade} garrafinhas de {nome} hoje',
        'agua.semGarrafinhas': 'Nenhuma garrafinha cadastrada ainda.',
        'agua.cadastrePrimeira': 'Cadastre sua primeira garrafinha abaixo.',
        'agua.semRegistrosHoje': 'Nenhum registro hoje ainda.',
        'agua.pesoInvalido': 'Informe um peso válido.',
        'agua.semHistorico': 'Ainda não há histórico de dias anteriores.',
        'agua.registrosDia': '{total}ml · {quantidade} registro(s)',
        'agua.lembretesDesativados': 'Lembretes desativados.',
        'agua.semSuporte': 'Seu navegador não suporta notificações.',
        'agua.permissaoNegada': 'Permissão de notificação negada.',
        'agua.naoConfigurado': 'Notificações não configuradas no servidor.',
        'agua.lembretesAtivados': 'Lembretes ativados!',
        'agua.erroAtivar': 'Não deu para ativar as notificações.',

        // ----- App: mais informações -----
        'info.titulo': 'Mais informações',
        'info.subtitulo': 'Conceitos usados na ficha, explicados.',
        'info.cafeinaAlt': 'Xícara de café',
        'info.cafeinaTitulo': 'Cafeína pré-treino',
        'info.cafeinaTexto': 'Tomada de 30 a 45 minutos antes de treinar, a cafeína melhora foco e reduz a percepção de esforço, o que ajuda a levar as séries até a faixa de RIR prescrita. Uma dose de referência fica em torno de 3 a 6mg por kg de peso corporal. Evite tomar muito tarde no dia — o efeito estimulante pode atrapalhar o sono, e sono ruim prejudica a recuperação mais do que a cafeína ajuda no treino.',
        'info.aguaAlt': 'Copo de água',
        'info.aguaTitulo': 'Água',
        'info.aguaTexto': 'A hidratação afeta força, resistência e recuperação — não é só sobre beber água durante o treino, e sim ao longo do dia inteiro. Desidratação leve já é suficiente para reduzir o desempenho nas últimas séries de uma sessão.',
        'info.deficitAlt': 'Marmitas com comida saudável',
        'info.deficitTitulo': 'Déficit calórico',
        'info.deficitTexto': 'Perder gordura depende de gastar mais calorias do que se consome — o déficit calórico. Um déficit moderado, em torno de 15% a 20% abaixo da manutenção, costuma preservar mais massa muscular do que cortes agressivos. Treino de força no déficit é o que sinaliza pro corpo manter o músculo mesmo perdendo peso; sem estímulo, parte do peso perdido vem de músculo, não só de gordura. Déficit grande demais também prejudica a recuperação entre as sessões.',
        'info.rirAlt': 'Levantamento de peso pesado',
        'info.rirTitulo': 'RIR — Reps In Reserve',
        'info.rirTexto': 'RIR é quantas repetições você ainda conseguiria fazer antes de falhar. A ficha usa a faixa <strong>1/0</strong>: terminar a série com 1 repetição de reserva ou levar até a falha técnica. É perto da falha, mas não é sempre a falha total — isso mantém a intensidade alta sem acumular fadiga demais para se recuperar a tempo da próxima sessão.',
        'info.papAlt': 'Movimento explosivo com kettlebell',
        'info.papTitulo': 'Séries PAP',
        'info.papTexto': 'PAP (Potenciação Pós-Ativação) é o princípio por trás de fazer uma série bem intensa — perto da falha, com carga alta ou baixa velocidade — pouco antes de outra série do mesmo padrão de movimento. A ativação nervosa da primeira série deixa o músculo temporariamente mais forte na série seguinte, permitindo mais carga ou mais repetições do que sozinha.',
        'info.creditos': 'Malha 3D do boneco de músculos: projeto <a href="https://www.z-anatomy.com/" target="_blank" rel="noopener">Z-Anatomy</a>, baseado no dataset <a href="https://bodyparts3d.dbcls.jp/" target="_blank" rel="noopener">BodyParts3D</a> (DBCLS), licença <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>.',
    },

    en: {
        // ----- Geral -----
        'geral.erroServidor': 'Could not connect to the server.',
        'geral.sessaoExpirou': 'Your session has expired. Please log in again.',
        'geral.ola': 'Hi, {nome}!',
        'geral.sair': 'Log out',
        'geral.perfil': 'Profile',
        'geral.tarefas': 'Tasks',
        'geral.nome': 'Name',
        'geral.email': 'Email',
        'geral.senha': 'Password',
        'geral.idioma': 'Language',
        'geral.senhasNaoCoincidem': 'Passwords do not match.',
        'geral.redirecionando': 'Redirecting...',
        'geral.salvarAlteracoes': 'Save changes',
        'geral.alterarSenha': 'Change password',
        'geral.senhaAtual': 'Current password',
        'geral.novaSenha': 'New password',
        'geral.excluir': 'Delete',
        'geral.adicionar': 'Add',

        // ----- Login -----
        'login.titulo': 'Log in',
        'login.usuario': 'Email',
        'login.lembrar': 'Remember me',
        'login.esqueci': 'Forgot password?',
        'login.botao': 'Log in',
        'login.semConta': "Don't have an account?",
        'login.cadastreSe': 'Sign up',
        'login.preencha': 'Fill in email and password.',
        'login.bemVindo': 'Welcome, {nome}!',
        'login.digiteEmail': 'Enter your account email:',

        // ----- Cadastro -----
        'cadastro.titulo': 'Sign up',
        'cadastro.confirmarSenha': 'Confirm password',
        'cadastro.botao': 'Sign up',
        'cadastro.jaTemConta': 'Already have an account?',
        'cadastro.facaLogin': 'Log in',
        'cadastro.preencha': 'Fill in all fields.',
        'cadastro.sucesso': 'Account created! Redirecting...',

        // ----- Redefinir senha -----
        'redefinir.titulo': 'New Password',
        'redefinir.confirmar': 'Confirm new password',
        'redefinir.botao': 'Save new password',
        'redefinir.voltar': 'Back to login',
        'redefinir.preencha': 'Fill in both fields.',
        'redefinir.linkInvalido': 'Invalid or incomplete link.',

        // ----- Tarefas -----
        'tarefas.titulo': 'My tasks',
        'tarefas.nova': 'New task',
        'tarefas.descricao': 'Description (optional)',
        'tarefas.vazio': 'No tasks yet. Add your first one!',
        'tarefas.contador': '{pendentes} pending of {total}',
        'tarefas.informeTitulo': 'Enter the task title.',
        'tarefas.confirmarExcluir': 'Delete this task?',

        // ----- Perfil -----
        'perfil.titulo': 'My profile',
        'perfil.subtitulo': 'Your account details.',
        'perfil.preenchaNomeEmail': 'Fill in name and email.',
        'perfil.informeSenhas': 'Enter your current and new password.',
        'perfil.foto': 'Profile photo',
        'perfil.fotoDesc': 'Only shows if you add one. Without a photo, the default icon is used.',
        'perfil.fotoAlt': 'Profile photo',
        'perfil.escolherFoto': 'Choose photo',
        'perfil.remover': 'Remove',
        'perfil.dados': 'Personal details',
        'perfil.dadosDesc': 'Change your account name or email.',
        'perfil.senhaDesc': 'Your current password is required even while logged in.',
        'perfil.idiomaDesc': 'The language the site is shown in.',

        // ----- App: menu -----
        'app.menuTitulo': 'Workouts',
        'app.menuPerfil': 'My profile',
        'app.menuTreinos': 'My workouts',
        'app.menuNovo': 'New workout',
        'app.menuEvolucao': 'Progress',
        'app.menuAgua': 'Water',
        'app.menuInfo': 'More information',
        'app.sairConta': 'Log out',

        // ----- App: treinos -----
        'treinos.titulo': 'My workouts',
        'treinos.subtitulo': "The plans you've generated.",
        'treinos.vazio': 'No plans yet. Go to <strong>New workout</strong> to generate your first one.',
        'treinos.resumo': '{nivel} · {sessoes} sessions · created on {data}',
        'treinos.abrir': 'Open',
        'treinos.confirmarExcluir': 'Delete this plan?',
        'treinos.qtdExercicios': '{quantidade} exercises',
        'treinos.musculosSessao': 'Muscles worked in this session',
        'treinos.exercicio': 'Exercise',
        'treinos.series': 'Sets',
        'treinos.reps': 'Reps',
        'treinos.observacao': 'Notes',
        'treinos.registrar': 'Log',
        'treinos.salvarSerie': 'Save set',
        'treinos.serie': 'Set {numero}',
        'treinos.carga': 'Load (kg)',
        'treinos.preenchaSerie': 'Fill in at least one set.',

        // ----- App: novo treino -----
        'novo.titulo': 'New workout',
        'novo.subtitulo': 'Answer three questions and your plan is built right away.',
        'novo.nivel': 'Level',
        'novo.nivelDesc': 'Sets the number of sets and the rep range.',
        'novo.genero': 'Gender',
        'novo.generoDesc': 'Filters which exercises are picked.',
        'novo.dias': 'Days per week',
        'novo.diasDesc': 'Sets the split. From 4 days on, each muscle is trained twice a week.',
        'novo.dias3': '3 days',
        'novo.dias4': '4 days',
        'novo.dias5': '5 days',
        'novo.dias6': '6 days',
        'novo.gerar': 'Generate plan',
        'novo.montando': 'Building your plan...',
        'nivel.iniciante': 'Beginner',
        'nivel.intermediario': 'Intermediate',
        'nivel.avancado': 'Advanced',
        'genero.masculino': 'Male',
        'genero.feminino': 'Female',

        // ----- App: evolução -----
        'evolucao.titulo': 'Progress',
        'evolucao.subtitulo': 'Load tracking over time.',
        'evolucao.sessao': 'Session',
        'evolucao.sessaoDesc': 'Pick a session to see the load progress of all its exercises.',
        'evolucao.semRegistros': 'No logs yet.',
        'evolucao.carga': 'Load (kg)',
        'evolucao.repeticoes': 'Reps',

        // ----- App: água -----
        'agua.titulo': 'Water',
        'agua.subtitulo': 'Daily intake tracking.',
        'agua.meta': "Today's goal",
        'agua.metaDesc': 'Calculated as 35ml per kg of body weight.',
        'agua.peso': 'Your weight (kg)',
        'agua.salvarPeso': 'Save weight',
        'agua.registrar': 'Log intake',
        'agua.registrarDesc': 'Tap a saved bottle or enter the amount.',
        'agua.garrafinhas': 'My bottles',
        'agua.garrafinhasDesc': 'Save the sizes you use the most.',
        'agua.exemploNome': 'E.g. Squeeze',
        'agua.cadastrar': 'Save',
        'agua.lembrete': 'Water reminder',
        'agua.lembreteDesc': "Sends a notification while today's goal hasn't been reached.",
        'agua.intervalo': 'How often',
        'agua.horas1': 'Every hour',
        'agua.horas2': 'Every 2 hours',
        'agua.horas3': 'Every 3 hours',
        'agua.ativarLembretes': 'Turn on reminders',
        'agua.desativarLembretes': 'Turn off reminders',
        'agua.ultimosDias': 'Last few days',
        'agua.garrafinhasHoje': '≈ {quantidade} {nome} bottles today',
        'agua.semGarrafinhas': 'No bottles saved yet.',
        'agua.cadastrePrimeira': 'Save your first bottle below.',
        'agua.semRegistrosHoje': 'No logs today yet.',
        'agua.pesoInvalido': 'Enter a valid weight.',
        'agua.semHistorico': 'No history from previous days yet.',
        'agua.registrosDia': '{total}ml · {quantidade} log(s)',
        'agua.lembretesDesativados': 'Reminders turned off.',
        'agua.semSuporte': "Your browser doesn't support notifications.",
        'agua.permissaoNegada': 'Notification permission denied.',
        'agua.naoConfigurado': 'Notifications are not set up on the server.',
        'agua.lembretesAtivados': 'Reminders turned on!',
        'agua.erroAtivar': "Couldn't turn on notifications.",

        // ----- App: mais informações -----
        'info.titulo': 'More information',
        'info.subtitulo': 'The concepts used in your plan, explained.',
        'info.cafeinaAlt': 'Cup of coffee',
        'info.cafeinaTitulo': 'Pre-workout caffeine',
        'info.cafeinaTexto': 'Taken 30 to 45 minutes before training, caffeine improves focus and lowers perceived effort, which helps you push your sets into the prescribed RIR range. A reference dose is around 3 to 6mg per kg of body weight. Avoid taking it too late in the day — the stimulant effect can disrupt your sleep, and poor sleep hurts recovery more than caffeine helps your training.',
        'info.aguaAlt': 'Glass of water',
        'info.aguaTitulo': 'Water',
        'info.aguaTexto': "Hydration affects strength, endurance and recovery — it's not just about drinking water during your workout, but throughout the whole day. Even mild dehydration is enough to lower performance in the last sets of a session.",
        'info.deficitAlt': 'Meal prep containers with healthy food',
        'info.deficitTitulo': 'Calorie deficit',
        'info.deficitTexto': 'Losing fat depends on burning more calories than you eat — a calorie deficit. A moderate deficit, around 15% to 20% below maintenance, usually preserves more muscle than aggressive cuts. Strength training during a deficit is what tells your body to keep muscle while losing weight; without that stimulus, part of the weight lost is muscle, not just fat. Too large a deficit also hurts recovery between sessions.',
        'info.rirAlt': 'Heavy weightlifting',
        'info.rirTitulo': 'RIR — Reps In Reserve',
        'info.rirTexto': "RIR is how many more reps you could still do before failing. Your plan uses the <strong>1/0</strong> range: finish the set with 1 rep in reserve or take it to technical failure. It's close to failure, but not always all-out failure — that keeps intensity high without piling up too much fatigue to recover in time for the next session.",
        'info.papAlt': 'Explosive kettlebell movement',
        'info.papTitulo': 'PAP sets',
        'info.papTexto': "PAP (Post-Activation Potentiation) is the principle behind doing a very intense set — close to failure, with heavy load or slow tempo — shortly before another set of the same movement pattern. The neural activation from the first set makes the muscle temporarily stronger on the next one, allowing more load or more reps than it would on its own.",
        'info.creditos': '3D muscle model mesh: <a href="https://www.z-anatomy.com/" target="_blank" rel="noopener">Z-Anatomy</a> project, based on the <a href="https://bodyparts3d.dbcls.jp/" target="_blank" rel="noopener">BodyParts3D</a> dataset (DBCLS), licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>.',
    },
};

// Nomes que vêm do banco (catálogo de exercícios), traduzidos pelo nome em português.
const EXERCICIOS_EN = {
    'Supino inclinado com barra': 'Incline barbell bench press',
    'Supino inclinado com halteres': 'Incline dumbbell press',
    'Supino inclinado no smith': 'Incline Smith machine press',
    'Crucifixo inclinado com halteres': 'Incline dumbbell fly',
    'Supino reto com barra': 'Barbell bench press',
    'Supino reto no smith': 'Smith machine bench press',
    'Crucifixo reto no cabo': 'Cable fly',
    'Voador': 'Pec deck',
    'Paralela': 'Dips',
    'Supino declinado na máquina': 'Decline machine press',
    'Crucifixo polia alta': 'High-to-low cable fly',
    'Barra fixa': 'Pull-up',
    'Puxada frontal': 'Lat pulldown',
    'Pulldown': 'Straight-arm pulldown',
    'Puxada alta unilateral na máquina': 'Single-arm machine pulldown',
    'Remada TBar': 'T-bar row',
    'Remada articulada pegada aberta': 'Wide-grip machine row',
    'Kelso shrug': 'Kelso shrug',
    'Encolhimento com halteres': 'Dumbbell shrug',
    'Banco romano': 'Back extension',
    'Elevação lateral com halteres': 'Dumbbell lateral raise',
    'Elevação lateral no cabo': 'Cable lateral raise',
    'Desenvolvimento na máquina': 'Machine shoulder press',
    'Desenvolvimento com halteres': 'Dumbbell shoulder press',
    'Crucifixo inverso na máquina': 'Reverse pec deck',
    'Agachamento livre': 'Barbell back squat',
    'Agachamento no smith': 'Smith machine squat',
    'Hack machine': 'Hack squat',
    'Leg press': 'Leg press',
    'Cadeira extensora': 'Leg extension',
    'Afundo no smith': 'Smith machine lunge',
    'Stiff com barra': 'Barbell stiff-leg deadlift',
    'Mesa flexora': 'Lying leg curl',
    'Cadeira flexora': 'Seated leg curl',
    'Elevação pélvica': 'Hip thrust',
    'Cadeira adutora': 'Hip adduction machine',
    'Adução no cabo': 'Cable hip adduction',
    'Panturrilha no smith': 'Smith machine calf raise',
    'Panturrilha na máquina': 'Machine calf raise',
    'Rosca direta': 'Barbell curl',
    'Rosca scott': 'Preacher curl',
    'Rosca inclinada com halteres': 'Incline dumbbell curl',
    'Tríceps francês': 'Overhead dumbbell triceps extension',
    'Tríceps corda': 'Rope pushdown',
    'JM press': 'JM press',
    'Abdominal supra no cabo': 'Cable crunch',
    'Abdominal infra': 'Leg raise',
    'Rotação no cabo': 'Cable rotation',
    'Prancha lateral': 'Side plank',
    'Flexão de punho no cabo': 'Cable wrist curl',
    'Extensão de punho no cabo': 'Cable wrist extension',
};

// Agrupamentos musculares, traduzidos pelo slug.
const AGRUPAMENTOS_EN = {
    peitoral_maior_clavicular: 'Pectoralis major — clavicular head',
    peitoral_maior_esternocostal: 'Pectoralis major — sternocostal head',
    peitoral_maior_abdominal: 'Pectoralis major — abdominal head',
    latissimo_dorso: 'Latissimus dorsi',
    upperback: 'Upper back',
    trapezio: 'Trapezius',
    eretores_espinha: 'Spinal erectors',
    deltoide_lateral: 'Lateral deltoid',
    deltoide_posterior: 'Rear deltoid',
    quadriceps: 'Quadriceps',
    posterior_coxa: 'Hamstrings',
    gluteo: 'Glutes',
    adutores: 'Adductors',
    panturrilha: 'Calves',
    biceps: 'Biceps',
    triceps: 'Triceps',
    reto_abdominal: 'Rectus abdominis',
    obliquos: 'Obliques',
    flexores_punho: 'Wrist flexors',
    extensores_punho: 'Wrist extensors',
};

function idiomaAtual() {
    try {
        const salvo = localStorage.getItem('idioma');
        if (salvo === 'pt' || salvo === 'en') return salvo;
    } catch (erro) {
        // sem localStorage: cai na detecção pelo navegador
    }
    return (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

function t(chave, variaveis = {}) {
    const texto = TEXTOS[idiomaAtual()][chave] ?? TEXTOS.pt[chave] ?? chave;
    return texto.replace(/\{(\w+)\}/g, (trecho, nome) => variaveis[nome] ?? trecho);
}

function nomeExercicio(nome) {
    return idiomaAtual() === 'en' ? (EXERCICIOS_EN[nome] || nome) : nome;
}

function nomeAgrupamento(slug, nomeOriginal) {
    return idiomaAtual() === 'en' ? (AGRUPAMENTOS_EN[slug] || nomeOriginal) : nomeOriginal;
}

// O nome padrão da ficha é salvo em português ("Upper / Lower — 4 dias").
function nomeTreino(nome) {
    return idiomaAtual() === 'en' ? String(nome).replace(/ — (\d+) dias$/, ' — $1 days') : nome;
}

function aplicarTraducoes(raiz = document) {
    document.documentElement.lang = idiomaAtual() === 'en' ? 'en' : 'pt-br';

    raiz.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    raiz.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    raiz.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    raiz.querySelectorAll('[data-i18n-alt]').forEach((el) => { el.alt = t(el.dataset.i18nAlt); });
}

function definirIdioma(idioma) {
    try {
        localStorage.setItem('idioma', idioma);
    } catch (erro) {
        // sem localStorage: vale só para esta página
    }
    aplicarTraducoes();
}

document.addEventListener('DOMContentLoaded', () => aplicarTraducoes());
