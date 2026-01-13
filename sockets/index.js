import { Server } from 'socket.io'

let io = null

export const initSockets = (server, corsOptions = { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }) => {
  io = new Server(server, { cors: corsOptions })

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  return io
}

export const emitProductUpdate = (payload) => {
  if (!io) return
  io.emit('product:update', payload)
}

export const emitAlert = (payload) => {
  if (!io) return
  io.emit('alert:new', payload)
}
