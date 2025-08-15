class ChessEngine {
    constructor() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white';
        this.gameHistory = [];
        this.capturedPieces = [];
        this.gameOver = false;
        this.winner = null;
        this.kingPositions = { white: 'e1', black: 'e8' };
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.enPassantTarget = null;
        this.halfmoveClock = 0;
        this.fullmoveNumber = 1;
    }

    createInitialBoard() {
        const board = {};
        
        // Black pieces
        const blackPieces = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        
        for (let i = 0; i < 8; i++) {
            board[files[i] + '8'] = { type: blackPieces[i], color: 'black' };
            board[files[i] + '7'] = { type: 'p', color: 'black' };
            board[files[i] + '2'] = { type: 'p', color: 'white' };
            board[files[i] + '1'] = { type: blackPieces[i].toUpperCase(), color: 'white' };
        }
        
        return board;
    }

    isValidMove(from, to) {
        const piece = this.board[from];
        if (!piece || piece.color !== this.currentPlayer) {
            return false;
        }
        
        const moves = this.generateMoves(from);
        return moves.includes(to);
    }

    generateMoves(position) {
        const piece = this.board[position];
        if (!piece) return [];
        
        const moves = [];
        const [file, rank] = [position[0], parseInt(position[1])];
        const fileIndex = file.charCodeAt(0) - 97; // a=0, b=1, etc.
        
        switch (piece.type.toLowerCase()) {
            case 'p':
                moves.push(...this.generatePawnMoves(position, piece.color));
                break;
            case 'r':
                moves.push(...this.generateRookMoves(position));
                break;
            case 'n':
                moves.push(...this.generateKnightMoves(position));
                break;
            case 'b':
                moves.push(...this.generateBishopMoves(position));
                break;
            case 'q':
                moves.push(...this.generateQueenMoves(position));
                break;
            case 'k':
                moves.push(...this.generateKingMoves(position));
                break;
        }
        
        // Filter out moves that would put own king in check
        return moves.filter(move => !this.wouldBeInCheck(position, move, piece.color));
    }

    generatePawnMoves(position, color) {
        const moves = [];
        const [file, rank] = [position[0], parseInt(position[1])];
        const fileIndex = file.charCodeAt(0) - 97;
        const direction = color === 'white' ? 1 : -1;
        const startRank = color === 'white' ? 2 : 7;
        
        // Forward move
        const oneSquareForward = file + (rank + direction);
        if (rank + direction >= 1 && rank + direction <= 8 && !this.board[oneSquareForward]) {
            moves.push(oneSquareForward);
            
            // Two squares forward from starting position
            if (rank === startRank) {
                const twoSquaresForward = file + (rank + 2 * direction);
                if (!this.board[twoSquaresForward]) {
                    moves.push(twoSquaresForward);
                }
            }
        }
        
        // Captures
        [-1, 1].forEach(deltaFile => {
            const targetFile = String.fromCharCode(fileIndex + deltaFile + 97);
            const targetSquare = targetFile + (rank + direction);
            
            if (targetFile >= 'a' && targetFile <= 'h' && 
                rank + direction >= 1 && rank + direction <= 8) {
                
                const targetPiece = this.board[targetSquare];
                if (targetPiece && targetPiece.color !== color) {
                    moves.push(targetSquare);
                }
                
                // En passant
                if (this.enPassantTarget === targetSquare) {
                    moves.push(targetSquare);
                }
            }
        });
        
        return moves;
    }

    generateRookMoves(position) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        directions.forEach(([deltaFile, deltaRank]) => {
            moves.push(...this.generateSlidingMoves(position, deltaFile, deltaRank));
        });
        
        return moves;
    }

    generateBishopMoves(position) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        directions.forEach(([deltaFile, deltaRank]) => {
            moves.push(...this.generateSlidingMoves(position, deltaFile, deltaRank));
        });
        
        return moves;
    }

    generateQueenMoves(position) {
        return [
            ...this.generateRookMoves(position),
            ...this.generateBishopMoves(position)
        ];
    }

    generateKnightMoves(position) {
        const moves = [];
        const [file, rank] = [position[0], parseInt(position[1])];
        const fileIndex = file.charCodeAt(0) - 97;
        
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        knightMoves.forEach(([deltaFile, deltaRank]) => {
            const newFile = String.fromCharCode(fileIndex + deltaFile + 97);
            const newRank = rank + deltaRank;
            const newSquare = newFile + newRank;
            
            if (newFile >= 'a' && newFile <= 'h' && newRank >= 1 && newRank <= 8) {
                const targetPiece = this.board[newSquare];
                if (!targetPiece || targetPiece.color !== this.board[position].color) {
                    moves.push(newSquare);
                }
            }
        });
        
        return moves;
    }

    generateKingMoves(position) {
        const moves = [];
        const [file, rank] = [position[0], parseInt(position[1])];
        const fileIndex = file.charCodeAt(0) - 97;
        
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        kingMoves.forEach(([deltaFile, deltaRank]) => {
            const newFile = String.fromCharCode(fileIndex + deltaFile + 97);
            const newRank = rank + deltaRank;
            const newSquare = newFile + newRank;
            
            if (newFile >= 'a' && newFile <= 'h' && newRank >= 1 && newRank <= 8) {
                const targetPiece = this.board[newSquare];
                if (!targetPiece || targetPiece.color !== this.board[position].color) {
                    moves.push(newSquare);
                }
            }
        });
        
        // Castling
        const color = this.board[position].color;
        if (this.castlingRights[color].kingside && this.canCastle(color, 'kingside')) {
            moves.push(color === 'white' ? 'g1' : 'g8');
        }
        if (this.castlingRights[color].queenside && this.canCastle(color, 'queenside')) {
            moves.push(color === 'white' ? 'c1' : 'c8');
        }
        
        return moves;
    }

    generateSlidingMoves(position, deltaFile, deltaRank) {
        const moves = [];
        const [file, rank] = [position[0], parseInt(position[1])];
        const fileIndex = file.charCodeAt(0) - 97;
        const pieceColor = this.board[position].color;
        
        let currentFile = fileIndex + deltaFile;
        let currentRank = rank + deltaRank;
        
        while (currentFile >= 0 && currentFile <= 7 && 
               currentRank >= 1 && currentRank <= 8) {
            
            const currentSquare = String.fromCharCode(currentFile + 97) + currentRank;
            const targetPiece = this.board[currentSquare];
            
            if (!targetPiece) {
                moves.push(currentSquare);
            } else {
                if (targetPiece.color !== pieceColor) {
                    moves.push(currentSquare);
                }
                break; // Stop sliding after hitting any piece
            }
            
            currentFile += deltaFile;
            currentRank += deltaRank;
        }
        
        return moves;
    }

    canCastle(color, side) {
        const rank = color === 'white' ? '1' : '8';
        const kingFile = 'e';
        const rookFile = side === 'kingside' ? 'h' : 'a';
        
        // Check if squares between king and rook are empty
        const files = side === 'kingside' ? ['f', 'g'] : ['b', 'c', 'd'];
        for (const file of files) {
            if (this.board[file + rank]) {
                return false;
            }
        }
        
        // Check if king is in check or would pass through check
        const checkFiles = side === 'kingside' ? ['e', 'f', 'g'] : ['e', 'd', 'c'];
        for (const file of checkFiles) {
            if (this.isSquareAttacked(file + rank, color === 'white' ? 'black' : 'white')) {
                return false;
            }
        }
        
        return true;
    }

    wouldBeInCheck(from, to, color) {
        // Make temporary move
        const originalPiece = this.board[to];
        this.board[to] = this.board[from];
        delete this.board[from];
        
        // Update king position if king moved
        let originalKingPos = this.kingPositions[color];
        if (this.board[to].type.toLowerCase() === 'k') {
            this.kingPositions[color] = to;
        }
        
        const inCheck = this.isInCheck(color);
        
        // Restore board
        this.board[from] = this.board[to];
        if (originalPiece) {
            this.board[to] = originalPiece;
        } else {
            delete this.board[to];
        }
        this.kingPositions[color] = originalKingPos;
        
        return inCheck;
    }

    isInCheck(color) {
        const kingPosition = this.kingPositions[color];
        const opponentColor = color === 'white' ? 'black' : 'white';
        return this.isSquareAttacked(kingPosition, opponentColor);
    }

    isSquareAttacked(square, byColor) {
        for (const [position, piece] of Object.entries(this.board)) {
            if (piece.color === byColor) {
                const moves = this.generateMovesForAttack(position);
                if (moves.includes(square)) {
                    return true;
                }
            }
        }
        return false;
    }

    generateMovesForAttack(position) {
        // Similar to generateMoves but without check validation to avoid infinite recursion
        const piece = this.board[position];
        if (!piece) return [];
        
        switch (piece.type.toLowerCase()) {
            case 'p':
                return this.generatePawnAttacks(position, piece.color);
            case 'r':
                return this.generateRookMoves(position);
            case 'n':
                return this.generateKnightMoves(position);
            case 'b':
                return this.generateBishopMoves(position);
            case 'q':
                return this.generateQueenMoves(position);
            case 'k':
                return this.generateKingAttacks(position);
            default:
                return [];
        }
    }

    generatePawnAttacks(position, color) {
        const moves = [];
        const [file, rank] = [position[0], parseInt(position[1])];
        const fileIndex = file.charCodeAt(0) - 97;
        const direction = color === 'white' ? 1 : -1;
        
        [-1, 1].forEach(deltaFile => {
            const targetFile = String.fromCharCode(fileIndex + deltaFile + 97);
            const targetSquare = targetFile + (rank + direction);
            
            if (targetFile >= 'a' && targetFile <= 'h' && 
                rank + direction >= 1 && rank + direction <= 8) {
                moves.push(targetSquare);
            }
        });
        
        return moves;
    }

    generateKingAttacks(position) {
        const moves = [];
        const [file, rank] = [position[0], parseInt(position[1])];
        const fileIndex = file.charCodeAt(0) - 97;
        
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        kingMoves.forEach(([deltaFile, deltaRank]) => {
            const newFile = String.fromCharCode(fileIndex + deltaFile + 97);
            const newRank = rank + deltaRank;
            const newSquare = newFile + newRank;
            
            if (newFile >= 'a' && newFile <= 'h' && newRank >= 1 && newRank <= 8) {
                moves.push(newSquare);
            }
        });
        
        return moves;
    }

    makeMove(from, to) {
        const piece = this.board[from];
        const capturedPiece = this.board[to];
        
        // Store move in history
        const moveData = {
            from: from,
            to: to,
            piece: { ...piece },
            capturedPiece: capturedPiece ? { ...capturedPiece } : null,
            castlingRights: { ...this.castlingRights },
            enPassantTarget: this.enPassantTarget,
            halfmoveClock: this.halfmoveClock,
            fullmoveNumber: this.fullmoveNumber
        };
        
        this.gameHistory.push(moveData);
        
        // Handle special moves
        this.handleSpecialMoves(from, to, piece);
        
        // Make the move
        this.board[to] = piece;
        delete this.board[from];
        
        // Update king position
        if (piece.type.toLowerCase() === 'k') {
            this.kingPositions[piece.color] = to;
        }
        
        // Update game state
        this.updateGameState(piece, capturedPiece);
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        return capturedPiece;
    }

    handleSpecialMoves(from, to, piece) {
        // Castling
        if (piece.type.toLowerCase() === 'k' && Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) === 2) {
            const rank = from[1];
            const isKingside = to[0] > from[0];
            const rookFrom = (isKingside ? 'h' : 'a') + rank;
            const rookTo = (isKingside ? 'f' : 'd') + rank;
            
            this.board[rookTo] = this.board[rookFrom];
            delete this.board[rookFrom];
        }
        
        // En passant
        if (piece.type.toLowerCase() === 'p' && to === this.enPassantTarget) {
            const capturedPawnRank = piece.color === 'white' ? '5' : '4';
            const capturedPawnSquare = to[0] + capturedPawnRank;
            delete this.board[capturedPawnSquare];
        }
        
        // Set en passant target for pawn double moves
        this.enPassantTarget = null;
        if (piece.type.toLowerCase() === 'p' && Math.abs(parseInt(from[1]) - parseInt(to[1])) === 2) {
            const middleRank = (parseInt(from[1]) + parseInt(to[1])) / 2;
            this.enPassantTarget = from[0] + middleRank;
        }
        
        // Update castling rights
        if (piece.type.toLowerCase() === 'k') {
            this.castlingRights[piece.color].kingside = false;
            this.castlingRights[piece.color].queenside = false;
        } else if (piece.type.toLowerCase() === 'r') {
            if (from === 'a1' || from === 'a8') {
                this.castlingRights[piece.color].queenside = false;
            } else if (from === 'h1' || from === 'h8') {
                this.castlingRights[piece.color].kingside = false;
            }
        }
    }

    updateGameState(piece, capturedPiece) {
        // Update halfmove clock
        if (piece.type.toLowerCase() === 'p' || capturedPiece) {
            this.halfmoveClock = 0;
        } else {
            this.halfmoveClock++;
        }
        
        // Update fullmove number
        if (this.currentPlayer === 'black') {
            this.fullmoveNumber++;
        }
        
        // Check for game over conditions
        this.checkGameOver();
    }

    checkGameOver() {
        const opponent = this.currentPlayer === 'white' ? 'black' : 'white';
        const hasValidMoves = this.hasValidMoves(opponent);
        
        if (!hasValidMoves) {
            if (this.isInCheck(opponent)) {
                this.gameOver = true;
                this.winner = this.currentPlayer;
            } else {
                this.gameOver = true;
                this.winner = 'draw';
            }
        } else if (this.halfmoveClock >= 100) {
            this.gameOver = true;
            this.winner = 'draw';
        }
    }

    hasValidMoves(color) {
        for (const [position, piece] of Object.entries(this.board)) {
            if (piece.color === color) {
                const moves = this.generateMoves(position);
                if (moves.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }

    getValidMoves(position) {
        return this.generateMoves(position);
    }

    isGameOver() {
        return this.gameOver;
    }

    getGameResult() {
        if (!this.gameOver) return 'Spiel läuft';
        
        if (this.winner === 'draw') {
            return 'Unentschieden';
        } else {
            return `${this.winner === 'white' ? 'Weiss' : 'Schwarz'} gewinnt!`;
        }
    }

    canUndo() {
        return this.gameHistory.length > 0;
    }

    undoMove() {
        if (!this.canUndo()) return null;
        
        const lastMove = this.gameHistory.pop();
        
        // Restore board state
        this.board[lastMove.from] = lastMove.piece;
        if (lastMove.capturedPiece) {
            this.board[lastMove.to] = lastMove.capturedPiece;
        } else {
            delete this.board[lastMove.to];
        }
        
        // Restore game state
        this.castlingRights = lastMove.castlingRights;
        this.enPassantTarget = lastMove.enPassantTarget;
        this.halfmoveClock = lastMove.halfmoveClock;
        this.fullmoveNumber = lastMove.fullmoveNumber;
        this.currentPlayer = lastMove.piece.color;
        this.gameOver = false;
        this.winner = null;
        
        // Restore king position
        if (lastMove.piece.type.toLowerCase() === 'k') {
            this.kingPositions[lastMove.piece.color] = lastMove.from;
        }
        
        return {
            movedPiece: { from: lastMove.to, to: lastMove.from },
            capturedPiece: lastMove.capturedPiece
        };
    }

    reset() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white';
        this.gameHistory = [];
        this.capturedPieces = [];
        this.gameOver = false;
        this.winner = null;
        this.kingPositions = { white: 'e1', black: 'e8' };
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.enPassantTarget = null;
        this.halfmoveClock = 0;
        this.fullmoveNumber = 1;
    }

    // Simple AI for computer moves
    getComputerMove() {
        const moves = this.getAllValidMoves('black');
        if (moves.length === 0) return null;
        
        // Simple evaluation: prefer captures, then random
        const captures = moves.filter(move => this.board[move.to]);
        const selectedMoves = captures.length > 0 ? captures : moves;
        
        const randomMove = selectedMoves[Math.floor(Math.random() * selectedMoves.length)];
        return randomMove;
    }

    getAllValidMoves(color) {
        const moves = [];
        
        for (const [position, piece] of Object.entries(this.board)) {
            if (piece.color === color) {
                const pieceMoves = this.generateMoves(position);
                pieceMoves.forEach(to => {
                    moves.push({ from: position, to: to });
                });
            }
        }
        
        return moves;
    }
}