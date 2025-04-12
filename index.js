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
    // Configurar los headers para SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Para enviar los headers inmediatamente
  
    const interval = setInterval(() => {
      if (chunkIndex > 1000) {
        clearInterval(interval);
        res.end();
        return;
      }
  
      // Generar y agregar el chunk al buffer
      const chunkString = `chunk_${String(chunkIndex).padStart(4, '0')}`;
      const success = addToBuffer(chunkString, currentUserType);
      if (success) {
        console.log(`Agregado ${chunkString} al buffer (${currentUserType})`);
        chunkIndex++;
      }
  
      // Obtener el siguiente chunk del buffer
      const nextChunk = getNextChunk();
      if (nextChunk) {
        // Simulación de red: latencia aleatoria y probabilidad de pérdida según el tipo de usuario
        const latencia = Math.random() * 3000;
        
        let lossProbability;
        if (nextChunk.userType === 'premium') {
          lossProbability = 0.1;
        } else if (nextChunk.userType === 'normal') {
          lossProbability = 0.2;
        } else if (nextChunk.userType === 'free') {
          lossProbability = 0.5;
        } else {
          lossProbability = 0.2;
        }
        
        const sePierde = Math.random() < lossProbability;
        
        setTimeout(() => {
          if (sePierde) {
            console.log(`Paquete PERDIDO del usuario ${nextChunk.userType}: ${nextChunk.chunk}`);
          } else {
            console.log(`Transmitido a usuario ${nextChunk.userType}: ${nextChunk.chunk}`);
            // Enviar el chunk vía SSE
            res.write(`data: ${nextChunk.chunk}\n\n`);
          }
        }, latencia);
      }
    }, 100);
  
    req.on('close', () => {
      clearInterval(interval);
      res.end();
      console.log('Conexión SSE cerrada');
    });
});
  
  
  

app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor corriendo en puerto 3000');
});