import { Server } from 'socket.io';

let io: Server | null = null;

export function initWebSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('WebSocket connected:', socket.id);
    // Listen for bid events, etc.
  });
}

export function emitBidUpdate(auctionId: string, data: any) {
  if (io) {
    io.to(auctionId).emit('BID_PLACED', data);
  }
}

export function joinAuctionRoom(socket: any, auctionId: string) {
  socket.join(auctionId);
}
