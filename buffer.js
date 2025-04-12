const BUFFER_MAX = 50;

const buffer = [];
const priority = {
  premium: 1,
  normal: 2,
  free: 3,
};

function addToBuffer(chunk, userType) {
  if (buffer.length >= BUFFER_MAX) {
    // Aplicar QoS: expulsar al primer usuario gratis si es necesario
    const index = buffer.findIndex(p => p.userType === 'free');
    if (index !== -1) {
      console.log(`¡Chunk de usuario Free descartado por saturación!`);
      buffer.splice(index, 1);
    } else {
      return false; // No se puede insertar
    }
  }

  buffer.push({ chunk, userType, priority: priority[userType] });
  return true;
}

function getNextChunk() {
  if (buffer.length === 0) return null;

  // Ordenar por prioridad antes de enviar
  buffer.sort((a, b) => a.priority - b.priority);
  return buffer.shift();
}

module.exports = { addToBuffer, getNextChunk };
