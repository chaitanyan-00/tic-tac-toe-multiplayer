import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store game rooms
const rooms = new Map();

// Game logic
const checkWinner = (board) => {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every(cell => cell !== null)) {
    return 'draw';
  }

  return null;
};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  console.log('Total connected clients:', io.engine.clientsCount);

  // Create a new room
  socket.on('create-room', ({ playerName }) => {
    try {
      console.log(`\n=== CREATE ROOM REQUEST ===`);
      console.log(`Player Name: ${playerName}`);
      console.log(`Socket ID: ${socket.id}`);
      
      // Generate room code
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create player object
      const player = {
        id: socket.id,
        name: playerName,
        symbol: 'X',
        isHost: true
      };

      // Create room object
      const room = {
        id: roomCode,
        players: [player],
        gameState: {
          board: Array(9).fill(null),
          currentTurn: 'X',
          winner: null,
          isGameOver: false
        },
        createdAt: Date.now()
      };

      // Store room in map
      rooms.set(roomCode, room);
      
      // Join socket to room
      socket.join(roomCode);
      
      console.log(`✅ Room created: ${roomCode} by ${playerName}`);
      console.log(`Room ${roomCode} players:`, room.players.map(p => ({ name: p.name, id: p.id, symbol: p.symbol })));
      console.log(`Socket ${socket.id} joined room ${roomCode}`);
      console.log(`=== CREATE ROOM COMPLETE ===\n`);
      
      // Send response to client
      socket.emit('room-created', {
        roomCode,
        player,
        gameState: room.gameState
      });
      
    } catch (error) {
      console.error('❌ Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // Join an existing room - FIXED WITH ROOMCODE IN RESPONSE
  socket.on('join-room', ({ roomCode, playerName }) => {
    try {
      console.log(`\n=== JOIN ROOM REQUEST ===`);
      console.log(`Room Code: ${roomCode}`);
      console.log(`Player Name: ${playerName}`);
      console.log(`Socket ID: ${socket.id}`);
      
      // Check if room exists
      const room = rooms.get(roomCode);
      if (!room) {
        console.log(`❌ Room ${roomCode} not found`);
        console.log(`Available rooms:`, Array.from(rooms.keys()));
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      console.log(`✅ Room ${roomCode} found`);
      console.log(`Current players in room:`, room.players.map(p => ({ name: p.name, id: p.id, symbol: p.symbol })));
      
      // Check if room is full
      if (room.players.length >= 2) {
        console.log(`❌ Room ${roomCode} is full`);
        socket.emit('error', { message: 'Room is full' });
        return;
      }

      // Create player object for joining player
      const player = {
        id: socket.id,
        name: playerName,
        symbol: 'O', // Second player gets O
        isHost: false
      };

      // Add player to room
      room.players.push(player);
      
      // Join socket to room
      socket.join(roomCode);
      
      console.log(`✅ ${playerName} joined room ${roomCode}`);
      console.log(`Updated room ${roomCode} players:`);
      room.players.forEach(p => {
        console.log(`  - ${p.name}: ID=${p.id}, Symbol=${p.symbol}, isHost=${p.isHost}`);
      });
      
      // Get all sockets in this room (for verification)
      const roomSockets = io.sockets.adapter.rooms.get(roomCode);
      console.log(`Sockets in room ${roomCode}:`, roomSockets ? Array.from(roomSockets) : []);
      
      // Send confirmation to the player who just joined - INCLUDING ROOMCODE
      socket.emit('room-joined', {
        roomCode: roomCode, // SEND ROOMCODE TO CLIENT
        player,
        gameState: room.gameState,
        players: room.players
      });

      // Notify the existing player (host) that someone joined
      socket.to(roomCode).emit('player-joined', {
        player: player,
        gameState: room.gameState,
        players: room.players
      });

      console.log(`=== JOIN ROOM COMPLETE ===\n`);

    } catch (error) {
      console.error('❌ Error joining room:', error);
      socket.emit('error', { message: error.message });
    }
  });

  // Make a move
  socket.on('make-move', ({ roomCode, playerId, position }) => {
    try {
      console.log(`\n=== MOVE ATTEMPT ===`);
      console.log(`Room: ${roomCode}`);
      console.log(`Player ID from client: ${playerId}`);
      console.log(`Socket ID making request: ${socket.id}`);
      console.log(`Position: ${position}`);
      
      const room = rooms.get(roomCode);
      if (!room) {
        console.log(`❌ Room ${roomCode} not found`);
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      console.log(`Room ${roomCode} players:`);
      room.players.forEach(p => {
        console.log(`  - ${p.name}: ID=${p.id}, Symbol=${p.symbol}`);
      });

      // Find player by ID (should match socket.id)
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        console.log(`❌ Player with ID ${playerId} not found in room`);
        console.log(`Available player IDs:`, room.players.map(p => p.id));
        socket.emit('error', { message: 'Player not found' });
        return;
      }

      console.log(`✅ Found player: ${player.name} (${player.id}) with symbol ${player.symbol}`);

      // Check if it's player's turn
      if (room.gameState.currentTurn !== player.symbol) {
        console.log(`❌ Not ${player.name}'s turn. Current turn: ${room.gameState.currentTurn}`);
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      // Check if game is over
      if (room.gameState.isGameOver) {
        console.log(`❌ Game is already over`);
        socket.emit('error', { message: 'Game is already over' });
        return;
      }

      // Check if position is valid
      if (position < 0 || position > 8 || room.gameState.board[position] !== null) {
        console.log(`❌ Invalid move at position ${position}`);
        socket.emit('error', { message: 'Invalid move' });
        return;
      }

      // Make the move
      console.log(`✅ Valid move! Updating board...`);
      room.gameState.board[position] = player.symbol;
      console.log(`New board:`, room.gameState.board);
      
      // Check for winner or draw
      const winner = checkWinner(room.gameState.board);
      if (winner) {
        room.gameState.winner = winner;
        room.gameState.isGameOver = true;
        console.log(`🏆 Game over! Winner: ${winner}`);
      } else {
        // Switch turns
        room.gameState.currentTurn = player.symbol === 'X' ? 'O' : 'X';
        console.log(`🔄 Turn switched to: ${room.gameState.currentTurn}`);
      }

      console.log(`Broadcasting update to room ${roomCode}`);
      
      // Broadcast updated game state to all players in the room
      io.to(roomCode).emit('game-updated', {
        gameState: room.gameState,
        lastMove: {
          player: player.name,
          position,
          symbol: player.symbol
        }
      });
      
      console.log(`=== MOVE COMPLETE ===\n`);

    } catch (error) {
      console.error('Error making move:', error);
      socket.emit('error', { message: 'Failed to make move' });
    }
  });

  // Restart game
  socket.on('restart-game', ({ roomCode, playerId }) => {
    try {
      console.log(`\n=== RESTART GAME ===`);
      console.log(`Room: ${roomCode}`);
      console.log(`Player ID: ${playerId}`);
      
      const room = rooms.get(roomCode);
      if (!room) {
        console.log(`❌ Room ${roomCode} not found`);
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        console.log(`❌ Player not found`);
        socket.emit('error', { message: 'Player not found' });
        return;
      }

      // Reset game state
      room.gameState = {
        board: Array(9).fill(null),
        currentTurn: 'X', // X always starts
        winner: null,
        isGameOver: false
      };

      console.log(`✅ Game restarted in room ${roomCode} by ${player.name}`);
      
      // Notify all players in the room
      io.to(roomCode).emit('game-restarted', {
        gameState: room.gameState,
        players: room.players
      });
      
      console.log(`=== RESTART COMPLETE ===\n`);

    } catch (error) {
      console.error('Error restarting game:', error);
      socket.emit('error', { message: 'Failed to restart game' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('\n=== PLAYER DISCONNECTED ===');
    console.log('Socket ID:', socket.id);
    console.log('Remaining connected clients:', io.engine.clientsCount);
    
    // Find and notify rooms
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        console.log(`Player ${player.name} disconnected from room ${roomCode}`);
        
        // Notify other players in the room
        socket.to(roomCode).emit('player-disconnected', {
          message: `${player.name} has disconnected`
        });
        
        // Remove player from room
        room.players.splice(playerIndex, 1);
        console.log(`Player removed from room ${roomCode}. Remaining players:`, room.players.length);
        
        // Delete room if empty
        if (room.players.length === 0) {
          rooms.delete(roomCode);
          console.log(`Room ${roomCode} deleted (empty)`);
        }
      }
    });
    console.log('=== DISCONNECT COMPLETE ===\n');
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`📍 Allowed origin: http://localhost:3000\n`);
});