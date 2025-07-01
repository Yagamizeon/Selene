delete process.env.DEBUG_URL;

// 1) Carrega somente o .env desta pasta — evita puxar DEBUG_URL global
require('dotenv').config({ path: __dirname + '/.env' });


const express = require('express');
const mysql   = require('mysql2/promise');
const path    = require('path');

const app = express();

// 2) Middlewares
app.use(express.json());
// Serve arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// 3) Configura o pool MySQL
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT || xxxx
});

// 4) Rota POST /consulta
app.post('/consulta', async (req, res) => {
  const { cpf } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM cadastrados WHERE cliente_cpf = ?',
      [cpf]
    );
    if (!rows.length) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    return res.json(rows);
  } catch (err) {
    console.error('Erro no banco:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Qualquer rota que não seja API retorna o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


// 6) Inicia o servidor
const PORT = process.env.PORT || xxxx;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
