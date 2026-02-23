import React from 'react';

const PlayerInfo = ({ player, isCurrentPlayer, isActive }) => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px',
      borderRadius: '8px',
      minWidth: '120px',
      backgroundColor: isActive ? '#d1fae5' : '#f3f4f6',
      border: isActive ? '2px solid #10b981' : 'none',
      boxShadow: isCurrentPlayer ? '0 0 0 2px #4f46e5' : 'none',
      position: 'relative'
    },
    avatar: {
      width: '48px',
      height: '48px',
      backgroundColor: '#4f46e5',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '8px',
      color: 'white',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      position: 'relative'
    },
    crown: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      fontSize: '1.2rem'
    },
    name: {
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '4px'
    },
    symbol: {
      fontSize: '0.9rem',
      color: '#6b7280'
    },
    turnIndicator: {
      fontSize: '0.75rem',
      color: '#10b981',
      fontWeight: '600',
      marginTop: '4px'
    },
    waiting: {
      color: '#9ca3af',
      fontSize: '0.9rem'
    }
  };

  if (!player) {
    return (
      <div style={styles.container}>
        <div style={styles.avatar}>?</div>
        <div style={styles.waiting}>Waiting...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.avatar}>
        {player.name.charAt(0).toUpperCase()}
        {player.isHost && <span style={styles.crown}>👑</span>}
      </div>
      <div style={styles.name}>{player.name}</div>
      <div style={styles.symbol}>
        {player.symbol === 'X' ? '❌' : '⭕'}
      </div>
      {isActive && (
        <div style={styles.turnIndicator}>Your turn</div>
      )}
    </div>
  );
};

export default PlayerInfo;