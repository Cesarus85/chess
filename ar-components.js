// AR Components for Simple AR.js Chess Game

// Simple AR Chess Game Controller
class ARChessController {
    constructor() {
        this.gameStarted = false;
        this.gameContainer = null;
        this.chessGame = null;
        
        this.init();
    }

    init() {
        // Wait for A-Frame to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.setupARScene();
            this.bindEvents();
        });
    }

    setupARScene() {
        this.gameContainer = document.querySelector('#game-container');
        
        // Setup start button click
        const startButton = document.querySelector('#start-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.startGame();
            });
        }

        console.log('AR Scene setup complete');
    }

    bindEvents() {
        // Hide instructions when marker is found
        const marker = document.querySelector('#marker');
        if (marker) {
            marker.addEventListener('markerFound', () => {
                console.log('Marker found!');
                const instructions = document.querySelector('#instructions');
                if (instructions) {
                    instructions.style.display = 'none';
                }
            });

            marker.addEventListener('markerLost', () => {
                console.log('Marker lost!');
                const instructions = document.querySelector('#instructions');
                if (instructions) {
                    instructions.style.display = 'block';
                }
            });
        }
    }

    startGame() {
        if (this.gameStarted) return;
        
        console.log('Starting AR Chess Game!');
        this.gameStarted = true;

        // Hide start button
        const startButton = document.querySelector('#start-button');
        if (startButton) {
            startButton.setAttribute('visible', false);
        }

        // Show game container
        if (this.gameContainer) {
            this.gameContainer.setAttribute('visible', true);
            this.createChessBoard();
        }

        // Initialize chess game
        setTimeout(() => {
            if (window.chessGame) {
                window.chessGame.initializeGame();
            }
        }, 500);
    }

    createChessBoard() {
        // Clear existing board
        const existingBoard = this.gameContainer.querySelector('#chess-board');
        if (existingBoard) {
            existingBoard.remove();
        }

        // Create new chess board
        const board = document.createElement('a-entity');
        board.setAttribute('id', 'chess-board');
        board.setAttribute('position', '0 0 0');
        
        // Create board base
        const boardBase = document.createElement('a-box');
        boardBase.setAttribute('width', '1.6');
        boardBase.setAttribute('height', '0.05');
        boardBase.setAttribute('depth', '1.6');
        boardBase.setAttribute('material', 'color: #8B4513; roughness: 0.8');
        boardBase.setAttribute('position', '0 -0.025 0');
        board.appendChild(boardBase);
        
        // Create chess squares
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('a-box');
                const isLight = (row + col) % 2 === 0;
                const color = isLight ? '#F0D9B5' : '#B58863';
                
                square.setAttribute('width', '0.18');
                square.setAttribute('height', '0.01');
                square.setAttribute('depth', '0.18');
                square.setAttribute('material', `color: ${color}; roughness: 0.6`);
                
                const x = (col - 3.5) * 0.2;
                const z = (row - 3.5) * 0.2;
                square.setAttribute('position', `${x} 0.005 ${z}`);
                square.setAttribute('class', 'chess-square clickable');
                square.setAttribute('data-row', row);
                square.setAttribute('data-col', col);
                
                board.appendChild(square);
            }
        }
        
        // Add game UI
        const gameUI = document.createElement('a-entity');
        gameUI.setAttribute('id', 'game-ui');
        gameUI.setAttribute('position', '0 1.2 0');
        
        const statusText = document.createElement('a-text');
        statusText.setAttribute('id', 'game-status');
        statusText.setAttribute('value', 'Schach gestartet!');
        statusText.setAttribute('position', '0 0.3 0');
        statusText.setAttribute('align', 'center');
        statusText.setAttribute('color', '#FFF');
        statusText.setAttribute('scale', '1.5 1.5 1.5');
        gameUI.appendChild(statusText);
        
        const turnIndicator = document.createElement('a-text');
        turnIndicator.setAttribute('id', 'turn-indicator');
        turnIndicator.setAttribute('value', 'Weiß am Zug');
        turnIndicator.setAttribute('position', '0 0.1 0');
        turnIndicator.setAttribute('align', 'center');
        turnIndicator.setAttribute('color', '#00FF00');
        turnIndicator.setAttribute('scale', '1 1 1');
        gameUI.appendChild(turnIndicator);
        
        const resetButton = document.createElement('a-box');
        resetButton.setAttribute('id', 'reset-button');
        resetButton.setAttribute('width', '0.6');
        resetButton.setAttribute('height', '0.15');
        resetButton.setAttribute('depth', '0.05');
        resetButton.setAttribute('material', 'color: #FF4444');
        resetButton.setAttribute('position', '0 -0.15 0');
        resetButton.setAttribute('class', 'clickable');
        resetButton.setAttribute('visible', false);
        
        const resetText = document.createElement('a-text');
        resetText.setAttribute('value', 'Neues Spiel');
        resetText.setAttribute('position', '0 0 0.026');
        resetText.setAttribute('align', 'center');
        resetText.setAttribute('color', 'white');
        resetText.setAttribute('scale', '0.8 0.8 0.8');
        resetButton.appendChild(resetText);
        
        resetButton.addEventListener('click', () => {
            if (window.chessGame) {
                window.chessGame.resetGame();
            }
        });
        
        gameUI.appendChild(resetButton);
        
        this.gameContainer.appendChild(board);
        this.gameContainer.appendChild(gameUI);
        
        console.log('Chess board created in AR');
    }
}

// Chess piece interaction component
AFRAME.registerComponent('chess-piece', {
    schema: {
        type: { type: 'string' },
        color: { type: 'string' },
        row: { type: 'number' },
        col: { type: 'number' },
        selected: { type: 'boolean', default: false }
    },

    init: function () {
        this.el.classList.add('clickable');
        this.el.addEventListener('click', this.onPieceClick.bind(this));
    },

    onPieceClick: function () {
        if (window.chessGame) {
            window.chessGame.onPieceClick(this.el, this.data.row, this.data.col);
        }
    },

    update: function (oldData) {
        if (this.data.selected !== oldData.selected) {
            if (this.data.selected) {
                this.el.setAttribute('material', 'emissive: #00FF00; emissiveIntensity: 0.3');
                this.el.setAttribute('animation__select', 'property: position; to: 0 0.05 0; dur: 200; relative: true');
            } else {
                this.el.setAttribute('material', 'emissive: #000000; emissiveIntensity: 0');
                this.el.setAttribute('animation__deselect', 'property: position; to: 0 -0.05 0; dur: 200; relative: true');
            }
        }
    }
});

// Initialize AR Chess Controller
window.arChessController = new ARChessController();

console.log('AR Chess Components loaded');