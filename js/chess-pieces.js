class ChessPieces {
    constructor(scene) {
        this.scene = scene;
        this.piecesGroup = null;
        this.pieces = new Map();
        this.pieceHeight = 0.15;
        this.pieceRadius = 0.08;
        this.boardSize = 2;
        this.squareSize = this.boardSize / 8;
    }

    createPieces(boardPosition, boardRotation) {
        this.piecesGroup = new THREE.Group();
        this.piecesGroup.position.copy(boardPosition);
        this.piecesGroup.setRotationFromQuaternion(boardRotation);

        this.createInitialPosition();
        this.scene.add(this.piecesGroup);
    }

    createInitialPosition() {
        const initialBoard = [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = initialBoard[row][col];
                if (piece) {
                    const notation = this.getChessNotation(row, col);
                    this.createPiece(piece, notation, row, col);
                }
            }
        }
    }

    createPiece(type, notation, row, col) {
        const isWhite = type === type.toUpperCase();
        const pieceType = type.toLowerCase();
        
        const geometry = this.getPieceGeometry(pieceType);
        const material = new THREE.MeshLambertMaterial({
            color: isWhite ? 0xF5F5DC : 0x2F2F2F
        });
        
        const piece = new THREE.Mesh(geometry, material);
        
        piece.position.x = (col - 3.5) * this.squareSize;
        piece.position.z = (row - 3.5) * this.squareSize;
        piece.position.y = this.pieceHeight / 2;
        
        piece.castShadow = true;
        piece.receiveShadow = true;
        
        piece.userData = {
            type: pieceType,
            color: isWhite ? 'white' : 'black',
            position: notation,
            row: row,
            col: col,
            originalColor: material.color.getHex(),
            hasMoved: false
        };
        
        this.pieces.set(notation, piece);
        this.piecesGroup.add(piece);
        
        // Add simple hover detection
        piece.addEventListener = piece.addEventListener || function() {};
        
        return piece;
    }

    getPieceGeometry(type) {
        const baseRadius = this.pieceRadius;
        const height = this.pieceHeight;
        
        switch (type) {
            case 'p': // Pawn
                return this.createPawnGeometry(baseRadius, height);
            case 'r': // Rook
                return this.createRookGeometry(baseRadius, height);
            case 'n': // Knight
                return this.createKnightGeometry(baseRadius, height);
            case 'b': // Bishop
                return this.createBishopGeometry(baseRadius, height);
            case 'q': // Queen
                return this.createQueenGeometry(baseRadius, height);
            case 'k': // King
                return this.createKingGeometry(baseRadius, height);
            default:
                return new THREE.CylinderGeometry(baseRadius, baseRadius, height, 8);
        }
    }

    createPawnGeometry(radius, height) {
        const geometry = new THREE.CylinderGeometry(
            radius * 0.6, 
            radius * 0.8, 
            height * 0.7, 
            8
        );
        
        // Add sphere on top
        const sphereGeometry = new THREE.SphereGeometry(radius * 0.5, 8, 6);
        sphereGeometry.translate(0, height * 0.4, 0);
        
        const mergedGeometry = new THREE.BufferGeometry();
        mergedGeometry.copy(geometry);
        mergedGeometry.merge(sphereGeometry);
        
        return mergedGeometry;
    }

    createRookGeometry(radius, height) {
        const geometry = new THREE.CylinderGeometry(
            radius * 0.9, 
            radius, 
            height, 
            8
        );
        
        // Add battlements
        for (let i = 0; i < 4; i++) {
            const battlement = new THREE.BoxGeometry(
                radius * 0.3, 
                height * 0.2, 
                radius * 0.2
            );
            const angle = (i / 4) * Math.PI * 2;
            battlement.translate(
                Math.cos(angle) * radius * 0.7,
                height * 0.4,
                Math.sin(angle) * radius * 0.7
            );
            geometry.merge(battlement);
        }
        
        return geometry;
    }

    createKnightGeometry(radius, height) {
        // Simplified knight as elongated cylinder with top
        const baseGeometry = new THREE.CylinderGeometry(
            radius * 0.7, 
            radius, 
            height * 0.8, 
            8
        );
        
        const headGeometry = new THREE.SphereGeometry(radius * 0.6, 8, 6);
        headGeometry.scale(1.2, 0.8, 1.5);
        headGeometry.translate(0, height * 0.5, radius * 0.3);
        
        baseGeometry.merge(headGeometry);
        return baseGeometry;
    }

    createBishopGeometry(radius, height) {
        const geometry = new THREE.CylinderGeometry(
            radius * 0.6, 
            radius, 
            height * 0.8, 
            8
        );
        
        // Add pointed top
        const topGeometry = new THREE.ConeGeometry(
            radius * 0.4, 
            height * 0.4, 
            8
        );
        topGeometry.translate(0, height * 0.6, 0);
        
        geometry.merge(topGeometry);
        return geometry;
    }

    createQueenGeometry(radius, height) {
        const geometry = new THREE.CylinderGeometry(
            radius * 0.8, 
            radius, 
            height * 0.7, 
            8
        );
        
        // Add crown spikes
        for (let i = 0; i < 5; i++) {
            const spike = new THREE.ConeGeometry(
                radius * 0.1, 
                height * 0.3, 
                4
            );
            const angle = (i / 5) * Math.PI * 2;
            spike.translate(
                Math.cos(angle) * radius * 0.6,
                height * 0.5,
                Math.sin(angle) * radius * 0.6
            );
            geometry.merge(spike);
        }
        
        return geometry;
    }

    createKingGeometry(radius, height) {
        const geometry = new THREE.CylinderGeometry(
            radius * 0.9, 
            radius, 
            height * 0.8, 
            8
        );
        
        // Add cross on top
        const crossVertical = new THREE.BoxGeometry(
            radius * 0.1, 
            height * 0.3, 
            radius * 0.1
        );
        crossVertical.translate(0, height * 0.55, 0);
        
        const crossHorizontal = new THREE.BoxGeometry(
            radius * 0.3, 
            radius * 0.1, 
            radius * 0.1
        );
        crossHorizontal.translate(0, height * 0.5, 0);
        
        geometry.merge(crossVertical);
        geometry.merge(crossHorizontal);
        return geometry;
    }

    getChessNotation(row, col) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        return files[col] + ranks[row];
    }

    getSquarePosition(notation) {
        const file = notation.charAt(0);
        const rank = notation.charAt(1);
        
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        
        const col = files.indexOf(file);
        const row = ranks.indexOf(rank);
        
        return { row, col };
    }

    movePiece(from, to) {
        const piece = this.pieces.get(from);
        if (piece) {
            const toPos = this.getSquarePosition(to);
            
            piece.position.x = (toPos.col - 3.5) * this.squareSize;
            piece.position.z = (toPos.row - 3.5) * this.squareSize;
            
            piece.userData.position = to;
            piece.userData.row = toPos.row;
            piece.userData.col = toPos.col;
            piece.userData.hasMoved = true;
            
            this.pieces.delete(from);
            this.pieces.set(to, piece);
        }
    }

    removePiece(position) {
        const piece = this.pieces.get(position);
        if (piece) {
            this.piecesGroup.remove(piece);
            this.pieces.delete(position);
            
            // Dispose of geometry and material
            piece.geometry.dispose();
            piece.material.dispose();
        }
    }

    getPiece(position) {
        return this.pieces.get(position);
    }

    getPieceData(piece) {
        return piece ? piece.userData : null;
    }

    getAllPieces() {
        return Array.from(this.pieces.values());
    }

    highlightPiece(piece) {
        if (piece && piece.material) {
            piece.material.emissive.setHex(0x444444);
        }
    }

    unhighlightPiece(piece) {
        if (piece && piece.material) {
            piece.material.emissive.setHex(0x000000);
        }
    }

    reset() {
        // Clear all pieces
        this.pieces.forEach(piece => {
            this.piecesGroup.remove(piece);
            piece.geometry.dispose();
            piece.material.dispose();
        });
        this.pieces.clear();
        
        // Recreate initial position
        this.createInitialPosition();
    }

    undoMove(undoData) {
        if (undoData.movedPiece) {
            this.movePiece(undoData.movedPiece.to, undoData.movedPiece.from);
        }
        
        if (undoData.capturedPiece) {
            this.createPiece(
                undoData.capturedPiece.type,
                undoData.capturedPiece.position,
                undoData.capturedPiece.row,
                undoData.capturedPiece.col
            );
        }
    }

    animateMove(from, to, duration = 500) {
        const piece = this.pieces.get(from);
        if (!piece) return Promise.resolve();
        
        return new Promise(resolve => {
            const startPos = piece.position.clone();
            const toPos = this.getSquarePosition(to);
            const endPos = new THREE.Vector3(
                (toPos.col - 3.5) * this.squareSize,
                piece.position.y,
                (toPos.row - 3.5) * this.squareSize
            );
            
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Smooth easing
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                piece.position.lerpVectors(startPos, endPos, easeProgress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    piece.userData.position = to;
                    piece.userData.row = toPos.row;
                    piece.userData.col = toPos.col;
                    piece.userData.hasMoved = true;
                    
                    this.pieces.delete(from);
                    this.pieces.set(to, piece);
                    
                    resolve();
                }
            };
            
            animate();
        });
    }
}