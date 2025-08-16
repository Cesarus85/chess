class WebXRChessApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controller1 = null;
        this.controller2 = null;
        this.reticle = null;
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;
        this.chessBoard = null;
        this.chessPieces = null;
        this.chessEngine = null;
        this.boardPlaced = false;
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameState = 'placement'; // 'placement', 'playing', 'game-over'
        
        this.init();
    }

    async init() {
        this.setupScene();
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.createReticle();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            70, 
            window.innerWidth / window.innerHeight, 
            0.01, 
            20
        );
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        this.scene.add(directionalLight);
    }

    createReticle() {
        const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        this.reticle = new THREE.Mesh(geometry, material);
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);
    }

    setupEventListeners() {
        const startButton = document.getElementById('startButton');
        const resetButton = document.getElementById('resetButton');
        const undoButton = document.getElementById('undoButton');

        // Sicherstellen, dass AR nur nach echtem Benutzerklick gestartet wird
        startButton.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Start button clicked');
            this.startAR();
        }, { once: false });
        
        resetButton.addEventListener('click', () => this.resetGame());
        undoButton.addEventListener('click', () => this.undoMove());

        window.addEventListener('resize', () => this.onWindowResize());
    }

    async startAR() {
        console.log('startAR() called');
        
        // Button deaktivieren während des Starts
        const startButton = document.getElementById('startButton');
        startButton.disabled = true;
        startButton.textContent = 'AR wird gestartet...';

        if (!navigator.xr) {
            alert('WebXR wird nicht unterstützt. Verwenden Sie einen WebXR-kompatiblen Browser.');
            this.resetStartButton();
            return;
        }

        try {
            // Zuerst prüfen ob AR unterstützt wird
            console.log('Prüfe AR-Unterstützung...');
            const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
            if (!isSupported) {
                alert('AR wird von diesem Gerät nicht unterstützt');
                this.resetStartButton();
                return;
            }

            console.log('AR unterstützt, starte Session...');
            
            // Session mit minimalen Anforderungen starten
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: [],
                optionalFeatures: ['hit-test', 'dom-overlay'],
                domOverlay: { root: document.body }
            });

            console.log('AR-Session erfolgreich gestartet');

            await this.renderer.xr.setSession(session);
            this.setupControllers(session);
            
            startButton.style.display = 'none';
            document.getElementById('gameUI').style.display = 'block';
            
            this.updateStatus('Suchen Sie eine ebene Fläche oder tippen Sie zum direkten Platzieren...');
            
            session.addEventListener('end', () => {
                console.log('AR-Session beendet');
                this.hitTestSourceRequested = false;
                this.hitTestSource = null;
                this.resetStartButton();
                startButton.style.display = 'block';
                document.getElementById('gameUI').style.display = 'none';
                this.updateStatus('AR-Session beendet');
            });

        } catch (error) {
            console.error('Detaillierter AR-Fehler:', error);
            this.resetStartButton();
            
            let errorMessage = 'AR-Start fehlgeschlagen';
            if (error.message.includes('user activation')) {
                errorMessage += ': Klicken Sie direkt auf den Button';
            } else if (error.message.includes('NotAllowedError')) {
                errorMessage += ': Kamera-Berechtigung wurde verweigert';
            } else {
                errorMessage += `: ${error.message}`;
            }
            
            alert(`${errorMessage}\n\nTipps:\n- Verwenden Sie HTTPS\n- Erlauben Sie Kamera-Zugriff\n- Verwenden Sie Chrome oder Edge`);
        }
    }

    resetStartButton() {
        const startButton = document.getElementById('startButton');
        startButton.disabled = false;
        startButton.textContent = 'AR starten';
    }

    setupControllers(session) {
        this.controller1 = this.renderer.xr.getController(0);
        this.controller1.addEventListener('select', (event) => this.onSelect(event));
        this.scene.add(this.controller1);

        this.controller2 = this.renderer.xr.getController(1);
        this.controller2.addEventListener('select', (event) => this.onSelect(event));
        this.scene.add(this.controller2);

        // Setup hit test mit besserer Fehlerbehandlung
        this.setupHitTesting(session);
    }

    async setupHitTesting(session) {
        try {
            const referenceSpace = await session.requestReferenceSpace('viewer');
            const hitTestSource = await session.requestHitTestSource({ space: referenceSpace });
            this.hitTestSource = hitTestSource;
            this.hitTestSourceRequested = true;
            console.log('Hit-Test erfolgreich eingerichtet');
        } catch (error) {
            console.warn('Hit-Test nicht verfügbar:', error);
            this.updateStatus('Ebenenerkennung nicht verfügbar - Tippen Sie trotzdem zum Platzieren');
            // Fallback: Erlaube direktes Platzieren ohne Hit-Test
            this.reticle.visible = true;
            this.reticle.position.set(0, 0, -2);
        }
    }

    onSelect(event) {
        console.log('Select event triggered', { boardPlaced: this.boardPlaced, gameState: this.gameState });
        
        if (!this.boardPlaced) {
            this.placeBoardAtReticle();
        } else if (this.boardPlaced && this.gameState === 'playing') {
            this.handlePieceSelection(event);
        }
    }

    placeBoardAtReticle() {
        console.log('Platziere Schachbrett...');
        
        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        
        if (this.reticle.visible && this.reticle.matrix) {
            this.reticle.matrix.decompose(position, rotation, new THREE.Vector3());
        } else {
            // Fallback Position vor dem Spieler
            position.set(0, -0.5, -2);
            rotation.set(0, 0, 0, 1);
        }

        console.log('Brett Position:', position);

        try {
            this.chessBoard = new ChessBoard(this.scene);
            this.chessBoard.createBoard(position, rotation);

            this.chessPieces = new ChessPieces(this.scene);
            this.chessPieces.createPieces(position, rotation);

            this.chessEngine = new ChessEngine();

            this.reticle.visible = false;
            this.boardPlaced = true;
            this.gameState = 'playing';
            
            this.updateStatus('Weiss ist am Zug - Wählen Sie eine Figur');
            console.log('Schachbrett erfolgreich platziert');
        } catch (error) {
            console.error('Fehler beim Platzieren des Bretts:', error);
            this.updateStatus('Fehler beim Erstellen des Spielbretts');
        }
    }

    handlePieceSelection(event) {
        const controller = event.target;
        const raycaster = new THREE.Raycaster();
        
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        const intersects = raycaster.intersectObjects(this.chessPieces.getAllPieces());
        
        if (intersects.length > 0) {
            const piece = intersects[0].object;
            this.selectPiece(piece);
        } else {
            const boardIntersects = raycaster.intersectObjects(this.chessBoard.getSquares());
            if (boardIntersects.length > 0 && this.selectedPiece) {
                const square = boardIntersects[0].object;
                this.attemptMove(square);
            }
        }
    }

    selectPiece(piece) {
        if (this.selectedPiece) {
            this.chessPieces.unhighlightPiece(this.selectedPiece);
            this.chessBoard.clearHighlights();
        }

        const pieceData = this.chessPieces.getPieceData(piece);
        if (pieceData && pieceData.color === this.chessEngine.currentPlayer) {
            this.selectedPiece = piece;
            this.chessPieces.highlightPiece(piece);
            
            this.validMoves = this.chessEngine.getValidMoves(pieceData.position);
            this.chessBoard.highlightMoves(this.validMoves);
            
            this.updateStatus(`${pieceData.type} ausgewählt - Wählen Sie ein Zielfeld`);
        } else {
            this.selectedPiece = null;
            this.validMoves = [];
            this.updateStatus('Nicht Ihr Zug oder ungültige Figur');
        }
    }

    attemptMove(targetSquare) {
        const squareData = this.chessBoard.getSquareData(targetSquare);
        const selectedPieceData = this.chessPieces.getPieceData(this.selectedPiece);
        
        if (this.chessEngine.isValidMove(selectedPieceData.position, squareData.position)) {
            this.makeMove(selectedPieceData.position, squareData.position);
        } else {
            this.updateStatus('Ungültiger Zug - Versuchen Sie es erneut');
        }
    }

    makeMove(from, to) {
        const capturedPiece = this.chessEngine.makeMove(from, to);
        
        this.chessPieces.movePiece(from, to);
        if (capturedPiece) {
            this.chessPieces.removePiece(to);
        }

        this.chessPieces.unhighlightPiece(this.selectedPiece);
        this.chessBoard.clearHighlights();
        this.selectedPiece = null;
        this.validMoves = [];

        if (this.chessEngine.isGameOver()) {
            this.gameState = 'game-over';
            this.updateStatus(this.chessEngine.getGameResult());
        } else {
            this.updateStatus('Computer denkt...');
            setTimeout(() => this.makeComputerMove(), 1000);
        }
    }

    makeComputerMove() {
        const computerMove = this.chessEngine.getComputerMove();
        if (computerMove) {
            const capturedPiece = this.chessEngine.makeMove(computerMove.from, computerMove.to);
            
            this.chessPieces.movePiece(computerMove.from, computerMove.to);
            if (capturedPiece) {
                this.chessPieces.removePiece(computerMove.to);
            }

            if (this.chessEngine.isGameOver()) {
                this.gameState = 'game-over';
                this.updateStatus(this.chessEngine.getGameResult());
            } else {
                this.updateStatus('Ihr Zug - Wählen Sie eine Figur');
            }
        }
    }

    resetGame() {
        if (this.chessEngine) {
            this.chessEngine.reset();
        }
        if (this.chessPieces) {
            this.chessPieces.reset();
        }
        if (this.chessBoard) {
            this.chessBoard.clearHighlights();
        }
        
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameState = 'playing';
        this.updateStatus('Neues Spiel - Weiss ist am Zug');
    }

    undoMove() {
        if (this.chessEngine && this.chessEngine.canUndo()) {
            const undoData = this.chessEngine.undoMove();
            this.chessPieces.undoMove(undoData);
            this.updateStatus('Zug rückgängig gemacht');
        }
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.renderer.setAnimationLoop(() => this.render());
    }

    render() {
        if (this.hitTestSource && !this.boardPlaced) {
            const session = this.renderer.xr.getSession();
            const frame = this.renderer.xr.getFrame();
            
            if (frame) {
                const referenceSpace = this.renderer.xr.getReferenceSpace();
                const hitTestResults = frame.getHitTestResults(this.hitTestSource);

                if (hitTestResults.length > 0) {
                    const hit = hitTestResults[0];
                    this.reticle.visible = true;
                    this.reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
                } else {
                    this.reticle.visible = false;
                }
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Start the application when the page loads
window.addEventListener('load', () => {
    new WebXRChessApp();
});