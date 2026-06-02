// Simple socket.io-client tester
const { io } = require('socket.io-client');

const socket = io('http://localhost:5000', {
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  timeout: 20000,
});

socket.on('connect', () => {
  console.log('connected', socket.id);
  socket.emit('join-logs');
  socket.emit('join-alerts');
});

socket.on('liveLog', (data) => {
  console.log('liveLog', Array.isArray(data) ? `array(${data.length})` : data.id || data._id || data.id);
});

socket.on('newAlert', (data) => {
  console.log('newAlert', Array.isArray(data) ? `array(${data.length})` : data.id || data._id || data.id);
});

socket.on('simulated-log', (log) => {
  console.log('simulated-log ack', log && (log.id || log._id));
});

socket.on('unreadCount', (c) => console.log('unreadCount', c));

socket.on('disconnect', () => console.log('disconnected'));

setTimeout(() => {
  console.log('closing tester after 20s');
  socket.close();
  process.exit(0);
}, 20000);
