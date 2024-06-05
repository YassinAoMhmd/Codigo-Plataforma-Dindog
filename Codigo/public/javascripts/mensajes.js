
const form = document.getElementById('messageForm');
const messageArea = document.getElementById('messageArea');

form.addEventListener('submit', function(event) {
    event.preventDefault();
    const messageText = document.getElementById('messageText').value;
    sendMessage(messageText);
    document.getElementById('messageText').value = '';
});

function sendMessage(text) {
    console.log('Enviar mensaje:', text);
    receiveMessage(text, 'sent');
}

function receiveMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-box ${className} animate__animated animate__fadeInUp`;
    messageDiv.innerText = text;
    messageArea.appendChild(messageDiv);
    messageArea.scrollTop = messageArea.scrollHeight;
}

setTimeout(() => receiveMessage('Hola, ¿cómo estás?', 'received'), 1000);
