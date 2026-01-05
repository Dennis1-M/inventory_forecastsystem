import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'

export function useSocket(onProductUpdate?: (p:any)=>void, onAlert?: (a:any)=>void) {
  useEffect(()=>{
    socket = io(SOCKET_URL, { transports: ['websocket'] })

    socket.on('connect', ()=> console.log('Socket connected', socket?.id))
    socket.on('product:update', (payload) => {
      console.log('product:update', payload)
      if (onProductUpdate) onProductUpdate(payload)
    })

    socket.on('alert:new', (payload) => {
      console.log('alert:new', payload)
      if (onAlert) onAlert(payload)
    })

    return ()=>{
      if (socket) {
        socket.disconnect()
        socket = null
      }
    }
  }, [])

  return socket
}
