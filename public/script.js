function startStreaming() {
    const tipoUsuario = document.getElementById('tipoUsuario').value;
  
    fetch('/request-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userType: tipoUsuario }),
    });
  
    const output = document.getElementById('videoOutput');
    output.textContent = '';
  
    const eventSource = new EventSource('/stream');
    eventSource.onmessage = (e) => {
      output.textContent += e.data + '\n';
    };
  
    eventSource.onerror = () => {
      console.log('Transmisión finalizada');
      eventSource.close();
    };
  }
  