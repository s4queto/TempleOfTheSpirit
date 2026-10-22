// Tradução das mensagens que o servidor devolve. O texto em português é a chave,
// então as rotas continuam escrevendo as mensagens normalmente.
const IDIOMAS = ['pt', 'en'];

const MENSAGENS_EN = {
  'Muitas tentativas. Aguarde alguns minutos e tente novamente.': 'Too many attempts. Wait a few minutes and try again.',
  'Token não enviado.': 'Token not sent.',
  'Token inválido ou expirado.': 'Invalid or expired token.',
  'Preencha todos os campos.': 'Fill in all fields.',
  'A senha deve ter no mínimo 8 caracteres.': 'Password must be at least 8 characters long.',
  'Usuário cadastrado com sucesso!': 'Account created successfully!',
  'E-mail já cadastrado.': 'Email already registered.',
  'Preencha e-mail e senha.': 'Fill in email and password.',
  'Usuário ou senha inválidos.': 'Invalid email or password.',
  'Login realizado com sucesso!': 'Logged in successfully!',
  'Usuário não encontrado.': 'User not found.',
  'Envie uma imagem válida.': 'Send a valid image.',
  'Foto atualizada!': 'Photo updated!',
  'Foto removida!': 'Photo removed!',
  'Preencha nome e e-mail.': 'Fill in name and email.',
  'Perfil atualizado com sucesso!': 'Profile updated successfully!',
  'Esse e-mail já está em uso.': 'This email is already in use.',
  'Idioma inválido.': 'Invalid language.',
  'Idioma atualizado!': 'Language updated!',
  'Informe a senha atual e a nova senha.': 'Enter your current and new password.',
  'A nova senha deve ter no mínimo 6 caracteres.': 'New password must be at least 6 characters long.',
  'Senha atual incorreta.': 'Current password is incorrect.',
  'Senha alterada com sucesso!': 'Password changed successfully!',
  'Informe o título da tarefa.': 'Enter the task title.',
  'Tarefa criada!': 'Task created!',
  'Tarefa não encontrada.': 'Task not found.',
  'Tarefa atualizada!': 'Task updated!',
  'Tarefa excluída!': 'Task deleted!',
  'Treino gerado!': 'Workout generated!',
  'Treino não encontrado.': 'Workout not found.',
  'Treino excluído!': 'Workout deleted!',
  'Informe ao menos uma série.': 'Enter at least one set.',
  'Exercício não encontrado.': 'Exercise not found.',
  'Cada série precisa de número, carga e repetições válidos.': 'Each set needs a valid number, load and reps.',
  'Registro salvo!': 'Log saved!',
  'Sessão não encontrada.': 'Session not found.',
  'Informe uma quantidade válida.': 'Enter a valid amount.',
  'Registrado!': 'Logged!',
  'Registro não encontrado.': 'Log not found.',
  'Removido!': 'Removed!',
  'Informe nome e quantidade válidos.': 'Enter a valid name and amount.',
  'Garrafinha cadastrada!': 'Bottle added!',
  'Garrafinha não encontrada.': 'Bottle not found.',
  'Removida!': 'Removed!',
  'Peso inválido.': 'Invalid weight.',
  'Intervalo do lembrete inválido.': 'Invalid reminder interval.',
  'Configuração salva!': 'Settings saved!',
  'Inscrição de notificação inválida.': 'Invalid notification subscription.',
  'Inscrito para notificações!': 'Subscribed to notifications!',
  'Inscrição removida.': 'Subscription removed.',
  'Não autorizado.': 'Unauthorized.',
  'Informe o e-mail.': 'Enter your email.',
  'Se esse e-mail existir, enviaremos as instruções.': 'If this email exists, we will send the instructions.',
  'Erro ao enviar e-mail. Tente novamente.': 'Error sending email. Try again.',
  'Token e nova senha são obrigatórios.': 'Token and new password are required.',
  'Token inválido.': 'Invalid token.',
  'Token expirado. Solicite novamente.': 'Token expired. Request a new one.',
  'Senha redefinida com sucesso!': 'Password reset successfully!',
  'Erro interno do servidor.': 'Internal server error.',
};

function idiomaValido(idioma) {
  return IDIOMAS.includes(idioma) ? idioma : 'pt';
}

function traduzir(texto, idioma) {
  if (idioma !== 'en' || typeof texto !== 'string') return texto;
  return MENSAGENS_EN[texto] || texto;
}

// Middleware: lê o idioma do cabeçalho X-Idioma e traduz "erro" e "mensagem" das respostas.
function traduzirRespostas(req, res, next) {
  req.idioma = idiomaValido(req.headers['x-idioma']);

  if (req.idioma !== 'pt') {
    const json = res.json.bind(res);
    res.json = (corpo) => {
      if (corpo && typeof corpo === 'object') {
        corpo = { ...corpo };
        if (corpo.erro) corpo.erro = traduzir(corpo.erro, req.idioma);
        if (corpo.mensagem) corpo.mensagem = traduzir(corpo.mensagem, req.idioma);
      }
      return json(corpo);
    };
  }

  next();
}

function textosLembreteAgua(idioma, totalHoje, faltam) {
  if (idioma === 'en') {
    return {
      titulo: 'Time to drink water 💧',
      corpo: `You've had ${totalHoje}ml today. ${faltam}ml left to reach your goal.`,
    };
  }
  return {
    titulo: 'Hora de beber água 💧',
    corpo: `Você já bebeu ${totalHoje}ml hoje. Faltam ${faltam}ml para a meta.`,
  };
}

function textosEmailRedefinicao(idioma, nomeSeguro, link) {
  if (idioma === 'en') {
    return {
      assunto: 'Password reset',
      html: `
        <p>Hi, ${nomeSeguro}!</p>
        <p>You asked to reset your password. Click the link below (valid for 30 minutes):</p>
        <a href="${link}">${link}</a>
        <p>If you didn't request this, just ignore this email.</p>
      `,
    };
  }
  return {
    assunto: 'Redefinição de senha',
    html: `
        <p>Olá, ${nomeSeguro}!</p>
        <p>Você solicitou a redefinição da sua senha. Clique no link abaixo (válido por 30 minutos):</p>
        <a href="${link}">${link}</a>
        <p>Se você não solicitou isso, apenas ignore este e-mail.</p>
      `,
  };
}

module.exports = { IDIOMAS, idiomaValido, traduzir, traduzirRespostas, textosLembreteAgua, textosEmailRedefinicao };
