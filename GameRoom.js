import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import PlayerInfo from './PlayerInfo';

const GameRoom = ({ gameState, onMakeMove, onRestartGame, onLeaveRoom, socketId }) => {
  const [copied, setCopied] = useState(false);
  const { roomCode, player, players, gameData } = gameState;
  const opponent = players?.find(p => p.id !== player?.id);

  // Add animation style
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      @keyframes slideIn {
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      animation: 'slideIn 0.5s ease'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '600px',
      width: '100%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '2px solid #f3f4f6'
    },
    roomInfo: {
      display: 'flex',
      flexDirection: 'column'
    },
    roomTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    roomCodeContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '4px'
    },
    code: {
      fontFamily: 'monospace',
      fontWeight: 'bold',
      color: '#4f46e5',
      fontSize: '1.1rem',
      backgroundColor: '#f3f4f6',
      padding: '4px 8px',
      borderRadius: '4px'
    },
    copyButton: {
      padding: '4px 8px',
      backgroundColor: copied ? '#10b981' : '#e5e7eb',
      color: copied ? 'white' : '#374151',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      transition: 'all 0.2s'
    },
    leaveButton: {
      padding: '8px 16px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'background-color 0.2s'
    },
    playersContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '12px'
    },
    vs: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#9ca3af'
    },
    status: {
      textAlign: 'center',
      marginTop: '24px',
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#374151',
      padding: '12px',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px'
    },
    waitingContainer: {
      textAlign: 'center',
      padding: '48px 0'
    },
    waitingTitle: {
      fontSize: '1.5rem',
      color: '#6b7280',
      marginBottom: '16px'
    },
    dots: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginBottom: '24px'
    },
    dot: {
      width: '12px',
      height: '12px',
      backgroundColor: '#9ca3af',
      borderRadius: '50%',
      animation: 'pulse 1.5s infinite'
    },
    roomCodeDisplay: {
      color: '#6b7280',
      marginTop: '16px',
      fontSize: '1rem'
    },
    roomCodeStrong: {
      color: '#4f46e5',
      fontWeight: 'bold',
      fontSize: '1.2rem'
    },
    restartButton: {
      marginTop: '16px',
      padding: '12px 24px',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      margin: '16px auto 0',
      transition: 'background-color 0.2s'
    },
    debug: {
      marginTop: '16px',
      padding: '8px',
      backgroundColor: '#f3f4f6',
      borderRadius: '4px',
      fontSize: '0.8rem',
      color: '#6b7280',
      textAlign: 'left',
      fontFamily: 'monospace'
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGameStatus = () => {
    if (!gameData) return 'Loading...';
    
    if (gameData.winner) {
      if (gameData.winner === 'draw') {
        return "It's a draw! 🤝";
      }
      const winner = players?.find(p => p.symbol === gameData.winner);
      return winner ? `${winner.name} wins! 🎉` : `${gameData.winner} wins! 🎉`;
    }
    
    if (!players || players.length < 2) {
      return '⏳ Waiting for opponent...';
    }
    
    if (gameData.currentTurn === player?.symbol) {
      return '✨ Your turn';
    } else {
      return `⏰ ${opponent?.name || 'Opponent'}'s turn`;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.roomInfo}>
            <h2 style={styles.roomTitle}>Game Room</h2>
            <div style={styles.roomCodeContainer}>
              <span style={styles.code}>{roomCode}</span>
              <button 
                onClick={copyRoomCode}
                style={styles.copyButton}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <button 
            onClick={onLeaveRoom}
            style={styles.leaveButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            <span>🚪</span> Leave
          </button>
        </div>

        {/* Players */}
        <div style={styles.playersContainer}>
          <PlayerInfo
            player={player}
            isCurrentPlayer={true}
            isActive={gameData?.currentTurn === player?.symbol && !gameData?.isGameOver}
          />
          <div style={styles.vs}>VS</div>
          <PlayerInfo
            player={opponent}
            isCurrentPlayer={false}
            isActive={gameData?.currentTurn === opponent?.symbol && !gameData?.isGameOver}
          />
        </div>

        {/* Game Board or Waiting Screen */}
        {players && players.length === 2 ? (
          <>
            <GameBoard
              board={gameData?.board || Array(9).fill(null)}
              onMove={onMakeMove}
              disabled={gameData?.isGameOver || gameData?.currentTurn !== player?.symbol}
            />

            {/* Game Status */}
            <div style={styles.status}>
              {getGameStatus()}
            </div>

            {/* Restart Button */}
            {gameData?.isGameOver && (
              <button
                onClick={onRestartGame}
                style={styles.restartButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
              >
                <span>🔄</span> Play Again
              </button>
            )}
          </>
        ) : (
          <div style={styles.waitingContainer}>
            <div style={styles.waitingTitle}>Waiting for opponent...</div>
            <div style={styles.dots}>
              <div style={{...styles.dot, animationDelay: '0s'}}></div>
              <div style={{...styles.dot, animationDelay: '0.2s'}}></div>
              <div style={{...styles.dot, animationDelay: '0.4s'}}></div>
            </div>
            <div style={styles.roomCodeDisplay}>
              Share this code with your friend: <span style={styles.roomCodeStrong}>{roomCode}</span>
            </div>
          </div>
        )}

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div style={styles.debug}>
            <div>Socket ID: {socketId}</div>
            <div>Player ID: {player?.id}</div>
            <div>Players in room: {players?.length || 0}/2</div>
            <div>Game Active: {gameData?.isGameOver ? 'No' : 'Yes'}</div>
            <div>Current Turn: {gameData?.currentTurn}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoom;