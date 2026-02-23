🎮 Real-Time Multiplayer Tic-Tac-Toe
A real-time multiplayer Tic-Tac-Toe game built with React, Node.js, and Socket.IO. Players can create or join game rooms using a unique code and play against each other in real-time.

✨ Features
Real-time Gameplay: Instant move synchronization using WebSockets

Room System: Create and join games with 6-character room codes

Player Management: Custom player names with visual indicators

Turn Management: Automatic turn alternation with visual feedback

Game Logic: Complete win/draw detection with validation

Responsive Design: Works on desktop and mobile devices

Disconnect Handling: Graceful handling of player disconnections

Restart Option: Play multiple rounds in the same room

🛠️ Technologies Used
Frontend
React 18 - UI library with hooks and component architecture

Socket.IO Client - Real-time bidirectional communication

CSS-in-JS - Inline styling with dynamic animations

Backend
Node.js - JavaScript runtime environment

Express - Web framework for HTTP server

Socket.IO - WebSocket library for real-time events

CORS - Cross-origin resource sharing middleware

📋 Prerequisites
Node.js (v16 or higher)

npm or yarn package manager

Modern web browser (Chrome, Firefox, Safari, Edge)

🚀 Installation
1. Clone the repository
bash
git clone <repository-url>
cd tic-tac-toe-multiplayer
2. Install server dependencies
bash
cd server
npm install
3. Install client dependencies
bash
cd ../client
npm install
🎯 Running the Application
Start the Server
bash
cd server
npm run dev
# Server runs on http://localhost:5000
Start the Client
bash
cd client
npm start
# Client runs on http://localhost:3000
🎮 How to Play
Open the app in two different browser windows/tabs

Player 1: Click "Create New Game" and enter your name

Share the code: Copy the 6-character room code displayed

Player 2: Click "Join Existing Game", enter your name and the room code

Start playing: Players take turns clicking on empty cells

Win or Draw: Game announces winner or draw automatically

Play again: Click "Play Again" to restart the game

🏗️ System Architecture
The application follows a client-server architecture with real-time WebSocket communication:

Client (React): Manages UI, user interactions, and local game state

Server (Node.js/Express): Handles room management, game logic, and state synchronization

Socket.IO: Enables bidirectional real-time communication between clients and server

In-Memory Storage: Game rooms and states stored in server memory using Maps

📁 Project Structure
text
tic-tac-toe-multiplayer/
├── client/                    # React frontend
│   ├── public/                # Static files
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── GameBoard.jsx  # Tic-tac-toe board
│   │   │   ├── GameRoom.jsx   # Main game room UI
│   │   │   ├── JoinGame.jsx   # Create/join screen
│   │   │   └── PlayerInfo.jsx # Player display
│   │   ├── App.jsx            # Main app component
│   │   ├── index.js           # Entry point
│   │   ├── index.css          # Global styles
│   │   └── socket.js          # Socket.IO configuration
│   └── package.json
│
├── server/                    # Node.js backend
│   ├── index.js               # Main server file
│   └── package.json
│
└── README.md
🔄 API Events
Client to Server Events
Event	Payload	Description
create-room	{ playerName }	Create a new game room
join-room	{ roomCode, playerName }	Join an existing room
make-move	{ roomCode, playerId, position }	Make a move
restart-game	{ roomCode, playerId }	Restart the game
Server to Client Events
Event	Payload	Description
room-created	{ roomCode, player, gameState }	Room creation confirmation
room-joined	{ roomCode, player, gameState, players }	Join confirmation
player-joined	{ player, gameState, players }	Notify existing player
game-updated	{ gameState, lastMove }	Game state update
game-restarted	{ gameState, players }	Game restart notification
player-disconnected	{ message }	Player disconnect notification
error	{ message }	Error message
🎯 Game Logic
Win Conditions: Rows, columns, and diagonals

Draw Condition: Board full with no winner

Turn Management: Alternates between X and O

Move Validation: Prevents invalid moves and out-of-turn plays

🔒 Security Features
Input Validation: Server-side validation for all moves

Room Access: Code-based room access control

CORS Protection: Restricted to allowed origins

Session Management: Socket ID-based player identification

⚡ Performance Optimizations
In-Memory Storage: Fast room state access

Efficient Broadcasting: Room-specific updates only

Minimal Payload: Send only necessary game data

Connection Pooling: Socket.IO connection management
