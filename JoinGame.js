import React, { useState } from 'react';

const JoinGame = ({ onCreateRoom, onJoinRoom, isConnected }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState(null);

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '400px',
      width: '100%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '0.5rem',
      textAlign: 'center'
    },
    subtitle: {
      color: '#666',
      marginBottom: '2rem',
      textAlign: 'center'
    },
    button: {
      width: '100%',
      padding: '1rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginBottom: '1rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      marginBottom: '1rem'
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.5rem'
    },
    connectionWarning: {
      backgroundColor: '#fee2e2',
      color: '#ef4444',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      textAlign: 'center',
      fontSize: '0.9rem'
    }
  };

  if (!isConnected) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Tic Tac Toe</h1>
          <div style={styles.connectionWarning}>
            ⚠️ Connecting to server...
          </div>
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Tic Tac Toe</h1>
          <p style={styles.subtitle}>Play with friends in real-time</p>
          
          <button
            onClick={() => setMode('create')}
            style={{...styles.button, backgroundColor: '#4f46e5', color: 'white'}}
          >
            Create New Game
          </button>
          
          <button
            onClick={() => setMode('join')}
            style={{...styles.button, backgroundColor: '#10b981', color: 'white'}}
          >
            Join Existing Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          {mode === 'create' ? 'Create New Game' : 'Join Game'}
        </h2>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          if (mode === 'create') {
            onCreateRoom(playerName);
          } else {
            onJoinRoom(roomCode, playerName);
          }
        }}>
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={styles.input}
            required
          />
          
          {mode === 'join' && (
            <input
              type="text"
              placeholder="Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              style={styles.input}
              maxLength="6"
              required
            />
          )}
          
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => setMode(null)}
              style={{...styles.button, backgroundColor: '#9ca3af', color: 'white', marginBottom: 0}}
            >
              Back
            </button>
            
            <button
              type="submit"
              style={{...styles.button, backgroundColor: '#4f46e5', color: 'white', marginBottom: 0}}
            >
              {mode === 'create' ? 'Create Room' : 'Join Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGame;