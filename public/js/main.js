//Cliente del Websocket
const socket = io("http://localhost:8080");

socket.emit("message", "Hola desde el cliente");