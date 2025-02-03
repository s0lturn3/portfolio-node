const express = require("express");
const app = express();
const cors = require('cors');

require("dotenv").config();

const PORT = process.env.PORT || 5000;


// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Habilita o CORS
app.use(cors({
  origin: 'http://solturne.dev', // URLs permitidas
  methods: [ 'OPTIONS', 'GET', 'POST' ],
  allowedHeaders: [ 'Accept', 'Content-Type' ]
}));


const { initializeReturnModel } = require('../src/middlewares');
app.use(initializeReturnModel);


app.get("/", (req, res) => {
  const users = [
    { id: 1, nome: "Erick" },
    { id: 2, nome: "Solturne" },
    { id: 3, nome: '🦄🌈✨👋🌎🌍🌏✨🌈🦄' }
  ];
  
  res.json(users);
});


const contatoRoutes = require('../src/controllers/contato.controller');
app.use('/api/contato', contatoRoutes);



// Inicializando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;