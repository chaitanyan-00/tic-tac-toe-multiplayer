import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import JoinGame from './components/JoinGame';
import GameRoom from './components/GameRoom';

function App() {
  const [gameState, setGameState] = useState({
    inRoom: false,
    roomCode: null,
    player: null,
    players: [],
    gameData: null
  });
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const styles = {
    errorToast: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease'
    },
    connectionStatus: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.9rem',
      backgroundColor: isConnected ? '#10b981' : '#ef4444',
      color: 'white',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }
  };

  // Add animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    // Connect socket when component mounts
    console.log('Attempting to connect to server...');
    socket.connect();

    // Socket event listeners
    socket.on('connect', () => {
      console.log('✅ Connected to server with ID:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Failed to connect to server. Please check if server is running.');
      setIsConnected(false);
    });

    socket.on('error', ({ message }) => {
      console.error('Socket error:', message);
      setError(message);
      setTimeout(() => setError(null), 3000);
    });

    socket.on('room-created', ({ roomCode, player, gameState: gameData }) => {
      console.log('✅ Room created successfully:', roomCode);
      console.log('Player info:', player);
      console.log('Game state:', gameData);
      
      setGameState({
        inRoom: true,
        roomCode,
        player,
        players: [player],
        gameData
      });
    });

    // FIXED: room-joined handler
    socket.on('room-joined', ({ player, gameState, players }) => {
      console.log('✅ Successfully joined room!');
      console.log('My player info:', player);
      console.log('All players in room:', players);
      console.log('Game state:', gameState);
      
      // IMPORTANT: We need to get the roomCode from somewhere
      // Since the server doesn't send roomCode in this event, we need to store it
      // Option 1: Extract from gameState if it has roomCode
      // Option 2: Use the roomCode from the join attempt
      
      // For now, let's use the roomCode from the current state (from the join attempt)
      // This assumes that when join-room was emitted, we had the roomCode
      
      setGameState(prevState => {
        console.log('Previous state roomCode:', prevState.roomCode);
        
        return {
          ...prevState,
          inRoom: true,
          player,
          players,
          gameData: gameState,
          // Keep the existing roomCode (from when we called join-room)
          roomCode: prevState.roomCode
        };
      });
    });

    socket.on('player-joined', ({ player, gameState, players }) => {
      console.log('✅ Another player joined the room:', player);
      console.log('Updated players list:', players);
      console.log('Updated game state:', gameState);
      
      setGameState(prev => {
        const newState = {
          ...prev,
          players,
          gameData: gameState
        };
        console.log('Updated game state:', newState);
        return newState;
      });
    });

    socket.on('game-updated', ({ gameState, lastMove }) => {
      console.log('🔄 Game state updated:', gameState);
      console.log('Last move by:', lastMove);
      
      setGameState(prev => ({
        ...prev,
        gameData: gameState
      }));
    });

    socket.on('game-restarted', ({ gameState, players }) => {
      console.log('🔄 Game restarted');
      console.log('New game state:', gameState);
      
      setGameState(prev => ({
        ...prev,
        gameData: gameState,
        players
      }));
    });

    socket.on('player-disconnected', ({ message }) => {
      console.log('⚠️ Player disconnected:', message);
      setError(message);
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket listeners...');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('error');
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('player-joined');
      socket.off('game-updated');
      socket.off('game-restarted');
      socket.off('player-disconnected');
      socket.disconnect();
    };
  }, []);

  const handleCreateRoom = (playerName) => {
    setError(null);
    if (!isConnected) {
      setError('Not connected to server. Please wait...');
      return;
    }
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    console.log('🎮 Creating room for player:', playerName);
    socket.emit('create-room', { playerName });
  };

  const handleJoinRoom = (roomCode, playerName) => {
    setError(null);
    if (!isConnected) {
      setError('Not connected to server. Please wait...');
      return;
    }
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    const formattedRoomCode = roomCode.toUpperCase().trim();
    console.log('🎮 Joining room:', formattedRoomCode, 'as:', playerName);
    console.log('Current socket ID:', socket.id);
    
    // Store the roomCode in state BEFORE emitting the join event
    setGameState(prevState => ({
      ...prevState,
      roomCode: formattedRoomCode
    }));
    
    // Then emit the join event
    socket.emit('join-room', { 
      roomCode: formattedRoomCode, 
      playerName 
    });
  };

  const handleMakeMove = (position) => {
    if (!gameState.gameData?.isGameOver && 
        gameState.gameData?.board[position] === null &&
        gameState.gameData?.currentTurn === gameState.player?.symbol) {
      
      console.log('🎯 Making move:', {
        roomCode: gameState.roomCode,
        playerId: gameState.player.id,
        socketId: socket.id,
        position
      });
      
      // Verify player ID matches socket ID
      if (gameState.player.id !== socket.id) {
        console.error('❌ Player ID mismatch!', {
          playerId: gameState.player.id,
          socketId: socket.id
        });
        setError('Session error. Please reconnect.');
        return;
      }
      
      socket.emit('make-move', {
        roomCode: gameState.roomCode,
        playerId: gameState.player.id,
        position
      });
    }
  };

  const handleRestartGame = () => {
    console.log('🔄 Restarting game');
    socket.emit('restart-game', {
      roomCode: gameState.roomCode,
      playerId: gameState.player.id
    });
  };

  const handleLeaveRoom = () => {
    console.log('👋 Leaving room');
    setGameState({
      inRoom: false,
      roomCode: null,
      player: null,
      players: [],
      gameData: null
    });
  };

  return (
    <div>
      {error && (
        <div style={styles.errorToast}>
          {error}
        </div>
      )}
      
      <div style={styles.connectionStatus}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      {!gameState.inRoom ? (
        <JoinGame
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          isConnected={isConnected}
        />
      ) : (
        <GameRoom
          gameState={gameState}
          onMakeMove={handleMakeMove}
          onRestartGame={handleRestartGame}
          onLeaveRoom={handleLeaveRoom}
          socketId={socket.id}
        />
      )}
    </div>
  );
}

export default App;
