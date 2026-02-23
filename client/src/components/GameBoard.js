import React from 'react';

const GameBoard = ({ board, onMove, disabled }) => {
  const styles = {
    board: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10px',
      justifyContent: 'center',
      maxWidth: '400px',
      margin: '0 auto'
    },
    cell: {
      width: '100px',
      height: '100px',
      border: '2px solid #ccc',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      backgroundColor: 'white',
      transition: 'background-color 0.2s'
    },
    cellHover: {
      backgroundColor: '#f0f0f0'
    },
    cellX: {
      color: '#3b82f6'
    },
    cellO: {
      color: '#ef4444'
    },
    cellDisabled: {
      cursor: 'not-allowed',
      opacity: '0.8'
    }
  };

  const renderCell = (index) => {
    const value = board[index];
    const cellStyle = {
      ...styles.cell,
      ...(value === 'X' ? styles.cellX : {}),
      ...(value === 'O' ? styles.cellO : {}),
      ...(disabled || value !== null ? styles.cellDisabled : {})
    };

    return (
      <button
        key={index}
        onClick={() => !disabled && !value && onMove(index)}
        disabled={disabled || value !== null}
        style={cellStyle}
        onMouseEnter={(e) => {
          if (!disabled && !value) {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
        }}
      >
        {value === 'X' && '❌'}
        {value === 'O' && '⭕'}
      </button>
    );
  };

  return (
    <div style={styles.board}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => renderCell(index))}
    </div>
  );
};

export default GameBoard;
