const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const date = require('date-and-time')

io.on('connection', (socket) => {
  let userJoined = false

  socket.on('join', ({ username, room }) => {
    if (userJoined) return
    socket.join(room)
    socket.typing = false
    socket.username = username
    socket.room = room
    userJoined = true
    socket.to(socket.room).emit('user joined', {
      username: socket.username,
      time: date.format(new Date(), 'hh:mm A'),
    })
  })
  socket.on('message', (message) => {
    console.log(socket.room, message, socket.username)
    socket.to(socket.room).emit('message', {
      username: socket.username,
      text: message,
      time: date.format(new Date(), 'hh:mm A'),
    })
  })
  socket.on('typing', () => {
    if (!socket.typing) {
      socket.typing = true
      socket.to(socket.room).emit('typing', socket.username)
    }
  })
  socket.on('stoptyping', () => {
    if (socket.typing) {
      socket.typing = false
      socket.to(socket.room).emit('stoptyping')
    }
  })
  socket.on('disconnect', () => {
    socket.to(socket.room).emit('user left', socket.username)
  })
})

server.listen(5000, () => {
  console.log('listening on *:5000')
})
