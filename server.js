const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

let clientsMap = [{ID: null}]

io.on('connection', socket => {
  io.clients((error, clients) => {
    clientsMap = clients.map((ID, index) => {
      const indexClientsMap = clientsMap.findIndex(client => client.ID === ID)

      if (indexClientsMap !== -1)
        return clientsMap[indexClientsMap]
      else
        return {ID, pseudo: `pseudo_${index}`}
    })

    io.emit('clients', clientsMap)
  })

  socket.on('disconnect', () =>
    io.clients((error, clients) => {
      let newClientsMap = []

      clients.map(ID =>
        newClientsMap.push(clientsMap.filter(client => client.ID === ID)[0])
      )

      io.emit('clients', newClientsMap)
    })
  )

  socket.on('changePseudo', ({socketID, pseudo}) => {
    const index = clientsMap.findIndex(client => client.ID === socketID)

    clientsMap[index] = {...clientsMap[index], pseudo}

    io.emit('clients', clientsMap)
  })

  socket.on('message', message => {
    if(message.receiver !== 'all') {
      socket.broadcast.to(message.receiver).emit('message', message)
    } else {
      socket.broadcast.emit('message', message)
    }
  })
})

http.listen(9000, () => console.log('server running port 9000'))