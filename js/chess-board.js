class ChessBoard {
    constructor(scene) {
        this.scene = scene;
        this.boardGroup = null;
        this.squares = [];
        this.highlightedSquares = [];
        this.boardSize = 2;
        this.squareSize = this.boardSize / 8;
    }

    createBoard(position, rotation) {
        this.boardGroup = new THREE.Group();
        this.boardGroup.position.copy(position);
        this.boardGroup.setRotationFromQuaternion(rotation);

        this.createBoardBase();
        this.createSquares();
        this.createBoardEdge();
        this.createCoordinateLabels();

        this.scene.add(this.boardGroup);
    }

    createBoardBase() {
        const baseGeometry = new THREE.BoxGeometry(
            this.boardSize + 0.2, 
            0.05, 
            this.boardSize + 0.2
        );
        const baseMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513 
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -0.025;
        base.receiveShadow = true;
        this.boardGroup.add(base);
    }

    createSquares() {
        const squareGeometry = new THREE.PlaneGeometry(this.squareSize, this.squareSize);
        squareGeometry.rotateX(-Math.PI / 2);

        for (let row = 0; row < 8; row++) {
            this.squares[row] = [];
            for (let col = 0; col < 8; col++) {
                const isLight = (row + col) % 2 === 0;
                const color = isLight ? 0xF0D9B5 : 0xB58863;
                
                const material = new THREE.MeshLambertMaterial({ 
                    color: color 
                });
                const square = new THREE.Mesh(squareGeometry, material);
                
                square.position.x = (col - 3.5) * this.squareSize;
                square.position.z = (row - 3.5) * this.squareSize;
                square.position.y = 0.001;
                
                square.userData = {
                    row: row,
                    col: col,
                    position: this.getChessNotation(row, col),
                    originalColor: color,
                    isLight: isLight
                };
                
                square.receiveShadow = true;
                this.squares[row][col] = square;
                this.boardGroup.add(square);
            }
        }
    }

    createBoardEdge() {
        const edgeHeight = 0.05;
        const edgeWidth = 0.05;
        
        const edgeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x654321 
        });

        // Top and bottom edges
        for (let i = 0; i < 2; i++) {
            const edgeGeometry = new THREE.BoxGeometry(
                this.boardSize + edgeWidth * 2, 
                edgeHeight, 
                edgeWidth
            );
            const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
            edge.position.z = (i === 0 ? -1 : 1) * (this.boardSize / 2 + edgeWidth / 2);
            edge.position.y = edgeHeight / 2;
            edge.castShadow = true;
            this.boardGroup.add(edge);
        }

        // Left and right edges
        for (let i = 0; i < 2; i++) {
            const edgeGeometry = new THREE.BoxGeometry(
                edgeWidth, 
                edgeHeight, 
                this.boardSize
            );
            const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
            edge.position.x = (i === 0 ? -1 : 1) * (this.boardSize / 2 + edgeWidth / 2);
            edge.position.y = edgeHeight / 2;
            edge.castShadow = true;
            this.boardGroup.add(edge);
        }
    }

    createCoordinateLabels() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

        // File labels (a-h) at bottom
        for (let col = 0; col < 8; col++) {
            context.clearRect(0, 0, 64, 64);
            context.fillStyle = '#000';
            context.font = 'bold 32px Arial';
            context.textAlign = 'center';
            context.fillText(files[col], 32, 45);
            
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshBasicMaterial({ 
                map: texture, 
                transparent: true 
            });
            const geometry = new THREE.PlaneGeometry(0.1, 0.1);
            const label = new THREE.Mesh(geometry, material);
            
            label.position.x = (col - 3.5) * this.squareSize;
            label.position.z = this.boardSize / 2 + 0.08;
            label.position.y = 0.001;
            label.rotateX(-Math.PI / 2);
            
            this.boardGroup.add(label);
        }

        // Rank labels (1-8) at left
        for (let row = 0; row < 8; row++) {
            context.clearRect(0, 0, 64, 64);
            context.fillStyle = '#000';
            context.font = 'bold 32px Arial';
            context.textAlign = 'center';
            context.fillText(ranks[7 - row], 32, 45);
            
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshBasicMaterial({ 
                map: texture, 
                transparent: true 
            });
            const geometry = new THREE.PlaneGeometry(0.1, 0.1);
            const label = new THREE.Mesh(geometry, material);
            
            label.position.x = -this.boardSize / 2 - 0.08;
            label.position.z = (row - 3.5) * this.squareSize;
            label.position.y = 0.001;
            label.rotateX(-Math.PI / 2);
            
            this.boardGroup.add(label);
        }
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

    getSquareData(square) {
        return square.userData;
    }

    getSquares() {
        const allSquares = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                allSquares.push(this.squares[row][col]);
            }
        }
        return allSquares;
    }

    highlightMoves(validMoves) {
        this.clearHighlights();
        
        validMoves.forEach(move => {
            const pos = this.getSquarePosition(move);
            if (pos.row >= 0 && pos.col >= 0) {
                const square = this.squares[pos.row][pos.col];
                const isCapture = move.includes('x');
                const color = isCapture ? 0xFF4444 : 0x44FF44;
                
                square.material.color.setHex(color);
                square.material.opacity = 0.8;
                square.material.transparent = true;
                
                this.highlightedSquares.push(square);
            }
        });
    }

    highlightSquare(notation, color = 0xFFFF00) {
        const pos = this.getSquarePosition(notation);
        if (pos.row >= 0 && pos.col >= 0) {
            const square = this.squares[pos.row][pos.col];
            square.material.color.setHex(color);
            square.material.opacity = 0.8;
            square.material.transparent = true;
            this.highlightedSquares.push(square);
        }
    }

    clearHighlights() {
        this.highlightedSquares.forEach(square => {
            square.material.color.setHex(square.userData.originalColor);
            square.material.opacity = 1.0;
            square.material.transparent = false;
        });
        this.highlightedSquares = [];
    }

    getWorldPosition(notation) {
        const pos = this.getSquarePosition(notation);
        if (pos.row >= 0 && pos.col >= 0) {
            const square = this.squares[pos.row][pos.col];
            const worldPos = new THREE.Vector3();
            square.getWorldPosition(worldPos);
            return worldPos;
        }
        return null;
    }

    getSquareFromWorldPosition(worldPosition) {
        let closestSquare = null;
        let minDistance = Infinity;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = this.squares[row][col];
                const squareWorldPos = new THREE.Vector3();
                square.getWorldPosition(squareWorldPos);
                
                const distance = worldPosition.distanceTo(squareWorldPos);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestSquare = square;
                }
            }
        }
        
        return closestSquare;
    }
}