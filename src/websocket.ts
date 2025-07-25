import { Server } from 'socket.io';
import http from 'http';
import { app } from './app';
import mongoConnect from './config/mongo-connector';
import config from './config/config';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('WebSocket client connected:', socket.id);

  socket.on('joinAuction', (auctionId: string) => {
    socket.join(`auction_${auctionId}`);
  });

  socket.on('leaveAuction', (auctionId: string) => {
    socket.leave(`auction_${auctionId}`);
  });
});

mongoConnect().then(() => {
  server.listen(config.port, () => {
    console.log(`Server (HTTP + WebSocket) running on port ${config.port}`);
  });
});

export { io, server };
