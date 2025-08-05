// #region CONFIGS
const express = require('express');
const router = express.Router();

const FormData = require("form-data");
const Mailgun = require("mailgun.js");

const { validatePayload } = require('../middlewares');

require('dotenv').config();

// Inicialização do Mailgun
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

// Validação inicial das variáveis de ambiente necessárias
const requiredEnvVars = ['MAILGUN_API_KEY', 'MAILGUN_DOMAIN', 'FROM_EMAIL', 'TO_EMAIL', 'FROM_NAME', 'MAILGUN_TEMPLATE'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Variável de ambiente ${envVar} não definida`);
  }
});

// #endregion CONFIGS


// #region ENDPOINTS

// #region POST
router.post('/send', validatePayload, async (req, res) => {
  const returnModel = req.returnModel;
  const contatoFormModel = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Validação de campos
  if (!contatoFormModel.nome || !contatoFormModel.sobrenome || !contatoFormModel.email || !contatoFormModel.descricao) {
    returnModel.error = true;
    returnModel.errorMessage = 'Todos os campos são obrigatórios!';
    returnModel.code = 400;

    return res.status(400).json(returnModel);
  }

  if (!emailRegex.test(contatoFormModel.email)) {
    returnModel.error = true;
    returnModel.errorMessage = 'Email inválido!';
    returnModel.code = 400;
    return res.status(400).json(returnModel);
  }

  
  try {
    // Envia a mensagem
    await sendMessage(contatoFormModel);

    returnModel.error = false;
    returnModel.code = 200;
    
    return res.status(200).json(returnModel);
  }
  catch (err) {
    returnModel.error = true;
    returnModel.errorMessage = `Ocorreu um erro ao enviar o formulário: ${err}`;
    returnModel.code = 500;

    return res.status(500).json(returnModel);
  }
});
// #endregion POST

// #endregion ENDPOINTS

// #region METHODS
async function sendMessage(contatoModel) {
  try {
    const data = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: [ process.env.TO_EMAIL ],
      subject: "🚀 Novo contato recebido via formulário",
      template: process.env.MAILGUN_TEMPLATE,
      "h:X-Mailgun-Variables": JSON.stringify({
        first_sender_name: contatoModel.nome,
        last_sender_name: contatoModel.sobrenome,
        sender_email: contatoModel.email,
        reply_to: `mailto:${contatoModel.email}`,
        necessities: contatoModel.necessidades?.length > 0 ? contatoModel.necessidades.join(', ') : "Nenhum",
        contact_description: contatoModel.descricao,
      })
    });

    if (process.env.NODE_ENV !== 'production') console.log(data);
    return data;
  }
  catch (error) {
    console.error('Erro no Mailgun:', error);
    throw error;
  }
}
// #endregion METHODS


module.exports = router;
