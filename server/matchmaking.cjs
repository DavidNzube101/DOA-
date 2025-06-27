const { Server } = require('socket.io')
const http = require('http')

const server = http.createServer()
const io = new Server(server, {
  cors: { origin: '*' }
})

const queue = []
const pairs = new Map()

io.on('connection', (socket) => {
  console.log(`[SERVER] Connected: ${socket.id}`)

  socket.on('join_queue', (data) => {
    console.log(`[SERVER] ${socket.id} joined queue with character: ${data?.characterName}`)
    queue.push({ socket, characterName: data?.characterName })

    // Try to match if 2+ in queue
    if (queue.length >= 2) {
      const [p1, p2] = queue.splice(0, 2)
      pairs.set(p1.socket.id, p2.socket.id)
      pairs.set(p2.socket.id, p1.socket.id)

      p1.socket.emit('match_found', {
        opponentId: p2.socket.id,
        yourId: p1.socket.id,
        opponentCharacterName: p2.characterName,
      })
      p2.socket.emit('match_found', {
        opponentId: p1.socket.id,
        yourId: p2.socket.id,
        opponentCharacterName: p1.characterName,
      })

      console.log(`[SERVER] Matched ${p1.socket.id} <-> ${p2.socket.id}`)
    }
  })

  socket.on('player_state', (data) => {
    const opponentId = pairs.get(socket.id)
    console.log(`[SERVER] player_state from ${socket.id} to ${opponentId}:`, data)
    if (opponentId) io.to(opponentId).emit('opponent_state', data)
  })

  socket.on('deal_damage', ({ amount }) => {
    const opponentId = pairs.get(socket.id)
    console.log(`[SERVER] deal_damage from ${socket.id} to ${opponentId}: amount=${amount}`)
    if (opponentId) io.to(opponentId).emit('take_damage', amount)
  })

  socket.on('game_end', (result) => {
    const opponentId = pairs.get(socket.id)
    console.log(`[SERVER] game_end from ${socket.id} to ${opponentId}:`, result)
    if (opponentId) io.to(opponentId).emit('opponent_game_end', result)
  })

  socket.on('forfeit', () => {
    const opponentId = pairs.get(socket.id)
    console.log(`[SERVER] forfeit from ${socket.id} to ${opponentId}`)
    if (opponentId) {
      // Notify opponent: they win
      io.to(opponentId).emit('opponent_game_end', { won: true, message: 'Your opponent forfeited. You win!' })
      // Notify leaver: they lose
      io.to(socket.id).emit('opponent_game_end', { won: false, message: 'You forfeited the match and lost your stake.' })
      pairs.delete(opponentId)
      pairs.delete(socket.id)
    }
  })

  socket.on('disconnect', () => {
    // Remove from queue
    const idx = queue.findIndex(p => p.socket.id === socket.id)
    if (idx !== -1) queue.splice(idx, 1)

    // Notify opponent if paired
    const opponentId = pairs.get(socket.id)
    if (opponentId) {
      pairs.delete(opponentId)
      pairs.delete(socket.id)
      io.to(opponentId).emit('opponent_disconnected')
      console.log(`[SERVER] ${socket.id} disconnected, notified ${opponentId}`)
    } else {
      console.log(`[SERVER] Disconnected: ${socket.id}`)
    }
  })

  // Catch-all for debugging
  socket.onAny((event, ...args) => {
    if (!['player_state', 'deal_damage', 'game_end', 'join_queue', 'disconnect'].includes(event)) {
      console.log(`[SERVER] Event '${event}' from ${socket.id}:`, ...args)
    }
  })
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`[SERVER] Matchmaking server running on port ${PORT}`)
}) 