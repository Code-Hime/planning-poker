import { Server } from 'socket.io'
import { setupSocketHandlers } from '~/server/utils/socket'

let io: Server | null = null

export default defineEventHandler((event) => {
  const req = event.node.req
  
  // Initialize Socket.IO if not already done
  if (!io) {
    // Access the server through the request's socket
    // @ts-ignore
    const server = req.socket?.server || req.connection?.server
    
    if (server) {
      // Create Socket.IO server
      io = new Server(server, {
        path: '/socket.io',
        cors: {
          origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : true,
          methods: ['GET', 'POST'],
          credentials: true
        },
        transports: ['websocket', 'polling']
      })

      // Set up Socket.IO event handlers
      setupSocketHandlers(io)
      console.log('Socket.IO server initialized and attached to Nitro server')
    }
  }
  
  // Socket.IO attaches its own listeners to the server, so it will handle these requests
  if (req.url?.startsWith('/socket.io/')) {
    // The request will be handled by Socket.IO's attached listeners
    return
  }
})

