// Chess Game Logic and AI for WebXR

class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.gameOver = false;
        this.moveHistory = [];
        this.validMoves = [];
        
        this.pieceModels = {
            'pawn': this.createPawnModel,
            'rook': this.createRookModel,
            'knight': this.createKnightModel,
            'bishop': this.createBishopModel,
            'queen': this.createQueenModel,
            'king': this.createKingModel
        };
        
        this.gameContainer = null;
        this.statusText = document.querySelector('#game-status');
        this.turnIndicator = document.querySelector('#turn-indicator');
        this.resetButton = document.querySelector('#reset-button');
        
        this.bindEvents();
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Place pawns
        for (let col = 0; col < 8; col++) {
            board[1][col] = { type: 'pawn', color: 'black' };
            board[6][col] = { type: 'pawn', color: 'white' };
        }
        
        // Place other pieces
        const backRowPieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let col = 0; col < 8; col++) {
            board[0][col] = { type: backRowPieces[col], color: 'black' };
            board[7][col] = { type: backRowPieces[col], color: 'white' };
        }
        
        return board;
    }

    bindEvents() {
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => this.resetGame());
        }
    }

    initializeGame() {
        this.gameContainer = document.querySelector('#game-container');
        this.render3DBoard();
        this.updateUI();
        
        console.log('Chess game initialized');
    }

    render3DBoard() {
        // Clear existing pieces
        const existingPieces = this.gameContainer.querySelectorAll('.chess-piece-3d');
        existingPieces.forEach(piece => piece.remove());
        
        // Render all pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    this.create3DPiece(piece, row, col);
                }
            }
        }
    }

    create3DPiece(piece, row, col) {
        const pieceEl = document.createElement('a-entity');
        pieceEl.classList.add('chess-piece-3d', 'clickable');
        pieceEl.setAttribute('chess-piece', {
            type: piece.type,
            color: piece.color,
            row: row,
            col: col
        });
        
        const x = (col - 3.5) * 0.3;
        const z = (row - 3.5) * 0.3;
        pieceEl.setAttribute('position', `${x} 0.15 ${z}`);
        
        // Create the 3D model for the piece
        this.pieceModels[piece.type].call(this, pieceEl, piece.color);
        
        this.gameContainer.appendChild(pieceEl);
        return pieceEl;
    }

    createPawnModel(pieceEl, color) {
        const materialColor = color === 'white' ? '#F5F5DC' : '#2F2F2F';
        
        const cylinder = document.createElement('a-cylinder');
        cylinder.setAttribute('radius', '0.08');
        cylinder.setAttribute('height', '0.2');
        cylinder.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        cylinder.setAttribute('position', '0 0.1 0');
        
        const sphere = document.createElement('a-sphere');
        sphere.setAttribute('radius', '0.06');
        sphere.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        sphere.setAttribute('position', '0 0.16 0');
        
        pieceEl.appendChild(cylinder);
        pieceEl.appendChild(sphere);
    }

    createRookModel(pieceEl, color) {
        const materialColor = color === 'white' ? '#F5F5DC' : '#2F2F2F';
        
        const base = document.createElement('a-cylinder');
        base.setAttribute('radius', '0.1');
        base.setAttribute('height', '0.25');
        base.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        base.setAttribute('position', '0 0.125 0');
        
        const top = document.createElement('a-box');
        top.setAttribute('width', '0.22');
        top.setAttribute('height', '0.06');
        top.setAttribute('depth', '0.22');
        top.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        top.setAttribute('position', '0 0.22 0');
        
        pieceEl.appendChild(base);
        pieceEl.appendChild(top);
    }

    createKnightModel(pieceEl, color) {
        const materialColor = color === 'white' ? '#F5F5DC' : '#2F2F2F';
        
        const base = document.createElement('a-cylinder');
        base.setAttribute('radius', '0.09');
        base.setAttribute('height', '0.15');
        base.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        base.setAttribute('position', '0 0.075 0');
        
        const head = document.createElement('a-box');
        head.setAttribute('width', '0.12');
        head.setAttribute('height', '0.18');
        head.setAttribute('depth', '0.08');
        head.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        head.setAttribute('position', '0 0.18 0.02');
        head.setAttribute('rotation', '10 0 0');
        
        pieceEl.appendChild(base);
        pieceEl.appendChild(head);
    }

    createBishopModel(pieceEl, color) {
        const materialColor = color === 'white' ? '#F5F5DC' : '#2F2F2F';
        
        const base = document.createElement('a-cylinder');
        base.setAttribute('radius', '0.08');
        base.setAttribute('height', '0.2');
        base.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        base.setAttribute('position', '0 0.1 0');
        
        const top = document.createElement('a-cone');
        top.setAttribute('radius-bottom', '0.06');
        top.setAttribute('radius-top', '0.02');
        top.setAttribute('height', '0.12');
        top.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        top.setAttribute('position', '0 0.22 0');
        
        const point = document.createElement('a-sphere');
        point.setAttribute('radius', '0.025');
        point.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        point.setAttribute('position', '0 0.3 0');
        
        pieceEl.appendChild(base);
        pieceEl.appendChild(top);
        pieceEl.appendChild(point);
    }

    createQueenModel(pieceEl, color) {
        const materialColor = color === 'white' ? '#F5F5DC' : '#2F2F2F';
        
        const base = document.createElement('a-cylinder');
        base.setAttribute('radius', '0.1');
        base.setAttribute('height', '0.18');
        base.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        base.setAttribute('position', '0 0.09 0');
        
        const middle = document.createElement('a-cone');
        middle.setAttribute('radius-bottom', '0.08');
        middle.setAttribute('radius-top', '0.06');
        middle.setAttribute('height', '0.15');
        middle.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        middle.setAttribute('position', '0 0.225 0');
        
        const crown = document.createElement('a-cylinder');
        crown.setAttribute('radius', '0.07');
        crown.setAttribute('height', '0.08');
        crown.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        crown.setAttribute('position', '0 0.32 0');
        
        // Crown points
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 0.05;
            const z = Math.sin(angle) * 0.05;
            
            const point = document.createElement('a-box');
            point.setAttribute('width', '0.02');
            point.setAttribute('height', '0.06');
            point.setAttribute('depth', '0.02');
            point.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
            point.setAttribute('position', `${x} 0.35 ${z}`);
            
            pieceEl.appendChild(point);
        }
        
        pieceEl.appendChild(base);
        pieceEl.appendChild(middle);
        pieceEl.appendChild(crown);
    }

    createKingModel(pieceEl, color) {
        const materialColor = color === 'white' ? '#F5F5DC' : '#2F2F2F';
        
        const base = document.createElement('a-cylinder');
        base.setAttribute('radius', '0.11');
        base.setAttribute('height', '0.2');
        base.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        base.setAttribute('position', '0 0.1 0');
        
        const middle = document.createElement('a-cone');
        middle.setAttribute('radius-bottom', '0.09');
        middle.setAttribute('radius-top', '0.07');
        middle.setAttribute('height', '0.18');
        middle.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        middle.setAttribute('position', '0 0.24 0');
        
        const crown = document.createElement('a-cylinder');
        crown.setAttribute('radius', '0.08');
        crown.setAttribute('height', '0.1');
        crown.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        crown.setAttribute('position', '0 0.35 0');
        
        // Cross on top
        const crossV = document.createElement('a-box');
        crossV.setAttribute('width', '0.02');
        crossV.setAttribute('height', '0.08');
        crossV.setAttribute('depth', '0.02');
        crossV.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        crossV.setAttribute('position', '0 0.42 0');
        
        const crossH = document.createElement('a-box');
        crossH.setAttribute('width', '0.06');
        crossH.setAttribute('height', '0.02');
        crossH.setAttribute('depth', '0.02');
        crossH.setAttribute('material', `color: ${materialColor}; roughness: 0.8`);
        crossH.setAttribute('position', '0 0.42 0');
        
        pieceEl.appendChild(base);
        pieceEl.appendChild(middle);
        pieceEl.appendChild(crown);
        pieceEl.appendChild(crossV);
        pieceEl.appendChild(crossH);
    }

    onPieceClick(pieceEl, row, col) {
        if (this.gameOver || this.currentPlayer !== 'white') return;
        
        const piece = this.board[row][col];
        
        if (this.selectedPiece) {
            if (this.selectedPiece.row === row && this.selectedPiece.col === col) {
                // Deselect the same piece
                this.deselectPiece();
            } else {
                // Try to move to this position
                this.attemptMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
            }
        } else if (piece && piece.color === this.currentPlayer) {
            // Select piece
            this.selectPiece(pieceEl, row, col);
        }
    }

    selectPiece(pieceEl, row, col) {
        this.selectedPiece = { el: pieceEl, row: row, col: col };
        pieceEl.setAttribute('chess-piece', 'selected', true);
        
        // Calculate and show valid moves
        this.validMoves = this.getValidMoves(row, col);
        this.highlightValidMoves();
    }

    deselectPiece() {
        if (this.selectedPiece) {
            this.selectedPiece.el.setAttribute('chess-piece', 'selected', false);
            this.selectedPiece = null;
            this.clearHighlights();
        }
    }

    attemptMove(fromRow, fromCol, toRow, toCol) {
        if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            this.makeMove(fromRow, fromCol, toRow, toCol);
            this.deselectPiece();
            
            if (!this.gameOver) {
                // AI move after a delay
                setTimeout(() => {
                    this.makeAIMove();
                }, 1000);
            }
        } else {
            // Invalid move, just deselect
            this.deselectPiece();
        }
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // Update board
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Record move
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: capturedPiece
        });
        
        // Update 3D representation
        this.updatePiecePosition(fromRow, fromCol, toRow, toCol);
        
        // Check for game end conditions
        if (this.isCheckmate(!this.currentPlayer === 'white' ? 'white' : 'black')) {
            this.gameOver = true;
            this.statusText.setAttribute('value', `Schachmatt! ${this.currentPlayer === 'white' ? 'Weiß' : 'Schwarz'} gewinnt!`);
        } else if (this.isStalemate(!this.currentPlayer === 'white' ? 'white' : 'black')) {
            this.gameOver = true;
            this.statusText.setAttribute('value', 'Patt! Unentschieden!');
        } else {
            // Switch players
            this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
            this.updateUI();
        }
    }

    updatePiecePosition(fromRow, fromCol, toRow, toCol) {
        const fromPiece = this.gameContainer.querySelector(`[chess-piece][data-row="${fromRow}"][data-col="${fromCol}"]`);
        const toPiece = this.gameContainer.querySelector(`[chess-piece][data-row="${toRow}"][data-col="${toCol}"]`);
        
        // Remove captured piece
        if (toPiece) {
            toPiece.remove();
        }
        
        // Move piece
        if (fromPiece) {
            const x = (toCol - 3.5) * 0.3;
            const z = (toRow - 3.5) * 0.3;
            
            fromPiece.setAttribute('animation__move', `property: position; to: ${x} 0.15 ${z}; dur: 500`);
            fromPiece.setAttribute('chess-piece', 'row', toRow);
            fromPiece.setAttribute('chess-piece', 'col', toCol);
        }
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col, piece.color);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col);
                break;
            case 'king':
                moves = this.getKingMoves(row, col);
                break;
        }
        
        // Filter out moves that would put own king in check
        return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col, piece.color));
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Forward move
        if (this.isInBounds(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col: col });
            
            // Double move from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col: col });
            }
        }
        
        // Captures
        for (const dcol of [-1, 1]) {
            const newRow = row + direction;
            const newCol = col + dcol;
            if (this.isInBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (target && target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }

    getRookMoves(row, col) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        for (const [drow, dcol] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * drow;
                const newCol = col + i * dcol;
                
                if (!this.isInBounds(newRow, newCol)) break;
                
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== this.board[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        }
        
        return moves;
    }

    getKnightMoves(row, col) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [drow, dcol] of knightMoves) {
            const newRow = row + drow;
            const newCol = col + dcol;
            
            if (this.isInBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }

    getBishopMoves(row, col) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        for (const [drow, dcol] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * drow;
                const newCol = col + i * dcol;
                
                if (!this.isInBounds(newRow, newCol)) break;
                
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== this.board[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        }
        
        return moves;
    }

    getQueenMoves(row, col) {
        return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
    }

    getKingMoves(row, col) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [drow, dcol] of directions) {
            const newRow = row + drow;
            const newCol = col + dcol;
            
            if (this.isInBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const validMoves = this.getValidMoves(fromRow, fromCol);
        return validMoves.some(move => move.row === toRow && move.col === toCol);
    }

    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Simulate the move
        const originalPiece = this.board[toRow][toCol];
        const movingPiece = this.board[fromRow][fromCol];
        
        this.board[toRow][toCol] = movingPiece;
        this.board[fromRow][fromCol] = null;
        
        const inCheck = this.isInCheck(color);
        
        // Restore the board
        this.board[fromRow][fromCol] = movingPiece;
        this.board[toRow][toCol] = originalPiece;
        
        return inCheck;
    }

    isInCheck(color) {
        // Find the king
        let kingPos = null;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingPos = { row, col };
                    break;
                }
            }
            if (kingPos) break;
        }
        
        if (!kingPos) return false;
        
        // Check if any opponent piece can attack the king
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color !== color) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;
        
        // Check if any move can get out of check
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) return false;
                }
            }
        }
        
        return true;
    }

    isStalemate(color) {
        if (this.isInCheck(color)) return false;
        
        // Check if player has any valid moves
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) return false;
                }
            }
        }
        
        return true;
    }

    highlightValidMoves() {
        this.clearHighlights();
        
        for (const move of this.validMoves) {
            const square = this.gameContainer.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (square) {
                square.setAttribute('material', 'color: #00FF00; opacity: 0.5');
                square.classList.add('valid-move-highlight');
            }
        }
    }

    clearHighlights() {
        const highlights = this.gameContainer.querySelectorAll('.valid-move-highlight');
        highlights.forEach(square => {
            const row = parseInt(square.getAttribute('data-row'));
            const col = parseInt(square.getAttribute('data-col'));
            const isLight = (row + col) % 2 === 0;
            const color = isLight ? '#F0D9B5' : '#B58863';
            
            square.setAttribute('material', `color: ${color}; opacity: 1`);
            square.classList.remove('valid-move-highlight');
        });
    }

    makeAIMove() {
        if (this.gameOver || this.currentPlayer !== 'black') return;
        
        const move = this.getBestMove('black');
        if (move) {
            this.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
        }
    }

    getBestMove(color) {
        const allMoves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(row, col);
                    for (const move of moves) {
                        allMoves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col,
                            score: this.evaluateMove(row, col, move.row, move.col)
                        });
                    }
                }
            }
        }
        
        if (allMoves.length === 0) return null;
        
        // Sort by score and pick the best move
        allMoves.sort((a, b) => b.score - a.score);
        
        // Add some randomness to the top moves
        const topMoves = allMoves.filter(move => move.score >= allMoves[0].score - 0.5);
        return topMoves[Math.floor(Math.random() * topMoves.length)];
    }

    evaluateMove(fromRow, fromCol, toRow, toCol) {
        let score = 0;
        
        const piece = this.board[fromRow][fromCol];
        const target = this.board[toRow][toCol];
        
        // Capture value
        if (target) {
            const pieceValues = {
                'pawn': 1, 'knight': 3, 'bishop': 3,
                'rook': 5, 'queen': 9, 'king': 100
            };
            score += pieceValues[target.type] || 0;
        }
        
        // Center control
        const centerDistance = Math.abs(toRow - 3.5) + Math.abs(toCol - 3.5);
        score += (7 - centerDistance) * 0.1;
        
        // Piece development
        if (piece.type === 'knight' || piece.type === 'bishop') {
            if (fromRow === 0 || fromRow === 7) { // Moving from back rank
                score += 0.3;
            }
        }
        
        // King safety (avoid moving king)
        if (piece.type === 'king') {
            score -= 0.2;
        }
        
        return score + Math.random() * 0.1; // Add slight randomness
    }

    updateUI() {
        if (this.statusText) {
            this.statusText.setAttribute('value', 
                this.gameOver ? 'Spiel beendet' : 'Schach läuft...'
            );
        }
        
        if (this.turnIndicator) {
            this.turnIndicator.setAttribute('value', 
                `Am Zug: ${this.currentPlayer === 'white' ? 'Weiß (Du)' : 'Schwarz (Computer)'}`
            );
            this.turnIndicator.setAttribute('visible', !this.gameOver);
        }
        
        if (this.resetButton) {
            this.resetButton.setAttribute('visible', this.gameOver);
        }
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.gameOver = false;
        this.moveHistory = [];
        this.validMoves = [];
        
        this.render3DBoard();
        this.updateUI();
        
        if (this.resetButton) {
            this.resetButton.setAttribute('visible', false);
        }
    }
}

// Initialize the game when the script loads
window.chessGame = new ChessGame();

console.log('Chess game loaded');