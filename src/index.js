const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const { addRoom, removeRoom, getRooms } = require('./utils/rooms')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.emit('roomsInUse', getRooms())

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        io.emit('roomsInUse', addRoom(user.room))
    
        callback()
    })

    socket.on('sendMessage', (textMessage, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(textMessage)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, textMessage))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, coords.latitude, coords.longitude))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            if (getUsersInRoom(user.room).length === 0) {
                removeRoom(user.room)
                io.emit('roomsInUse', getRooms())
            }    
        }

    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})
