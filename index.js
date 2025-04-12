const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { addToBuffer, getNextChunk } = require('./buffer');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

let chunkIndex = 1;
let currentUserType = 'free'; // se puede cambiar con cada solicitud

app.post('/request-video', (req, res) => {
  currentUserType = req.body.userType;
  res.json({ message: `Inicio transmisión para ${currentUserType}` });
});

app.get('/stream', (req, res) => {
  const interval = setInterval(() => {
    if (chunkIndex > 1000) return clearInterval(interval);

    const chunk = `chunk_${String(chunkIndex).padStart(4, '0')}`;
    const success = addToBuffer(chunk, currentUserType);

    if (success) {
      console.log(`Agregado ${chunk} al buffer (${currentUserType})`);
      chunkIndex++;
    }

    const nextChunk = getNextChunk();
    if (nextChunk) {
      res.write(`${nextChunk.chunk}\n`);
    }
  }, 100);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor corriendo en puerto 3000');
});