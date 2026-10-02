import { io } from 'socket.io-client'
import { getToken } from './api'
let socket = null
export function connectSocket() {
  if (socket) return socket
  socket = io('/', { auth: (cb) => cb({ token: getToken() }), transports: ['websocket', 'polling'] })
  return socket
}
export function disconnectSocket() { socket?.disconnect(); socket = null }
export const getSocket = () => socket
