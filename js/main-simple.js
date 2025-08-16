class SimpleWebXRChess {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.reticle = null;
        this.controller = null;
        this.session = null;
        this.chessBoard = null;
        this.chessPieces = null;
        this.chessEngine = null;
        this.boardPlaced = false;
        this.gameState = 'placement';
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.createReticle();
        this.setupUI();
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
        this.scene.add(directionalLight);
    }

    createReticle() {
        const geometry = new THREE.RingGeometry(0.15, 0.2, 32);
        geometry.rotateX(-Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8
        });
        this.reticle = new THREE.Mesh(geometry, material);
        this.reticle.visible = false;
        this.scene.add(this.reticle);
    }

    setupUI() {
        const startButton = document.getElementById('startButton');
        const resetButton = document.getElementById('resetButton');

        if (startButton) {
            startButton.addEventListener('click', () => this.startAR());
        }
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetGame());
        }
    }

    async startAR() {
        if (!navigator.xr) {
            alert('WebXR nicht unterstützt');
            return;
        }

        try {
            // Sehr einfache Session-Anfrage
            this.session = await navigator.xr.requestSession('immersive-ar');
            
            console.log('AR Session gestartet');
            
            // Renderer mit Session verbinden
            this.renderer.xr.setSession(this.session);
            
            // Controller setup
            this.setupController();
            
            // UI anpassen
            document.getElementById('startButton').style.display = 'none';
            document.getElementById('gameUI').style.display = 'block';
            document.getElementById('status').textContent = 'Schauen Sie umher und tippen Sie zum Platzieren';
            
            // Reticle anzeigen
            this.reticle.visible = true;
            
            // Session end handler
            this.session.addEventListener('end', () => {
                this.onSessionEnd();
            });

        } catch (error) {
            console.error('AR Fehler:', error);
            alert('AR konnte nicht gestartet werden: ' + error.message);
        }
    }

    setupController() {
        this.controller = this.renderer.xr.getController(0);
        this.controller.addEventListener('select', () => this.onSelect());
        this.scene.add(this.controller);
    }

    onSelect() {
        if (!this.boardPlaced) {
            this.placeBoardAtReticle();
        } else {
            // Hier würde die Spiellogik kommen
            console.log('Figur auswählen/bewegen');
        }
    }

    placeBoardAtReticle() {
        console.log('Platziere Schachbrett...');
        
        // Position vom Reticle nehmen
        const position = this.reticle.position.clone();
        const rotation = new THREE.Quaternion();
        
        try {
            // Schachbrett erstellen
            this.chessBoard = new ChessBoard(this.scene);
            this.chessBoard.createBoard(position, rotation);

            this.chessPieces = new ChessPieces(this.scene);
            this.chessPieces.createPieces(position, rotation);

            this.chessEngine = new ChessEngine();

            // Reticle verstecken
            this.reticle.visible = false;
            this.boardPlaced = true;
            this.gameState = 'playing';
            
            document.getElementById('status').textContent = 'Weiss ist am Zug';
            console.log('Schachbrett platziert bei:', position);
            
        } catch (error) {
            console.error('Fehler beim Platzieren:', error);
            document.getElementById('status').textContent = 'Fehler beim Platzieren';
        }
    }

    updateReticlePosition() {
        if (!this.boardPlaced && this.reticle.visible && this.session) {
            // Einfache Position vor der Kamera
            const camera = this.camera;
            this.reticle.position.set(0, -0.8, -2);
        }
    }

    resetGame() {
        if (this.chessEngine) {
            this.chessEngine.reset();
        }
        if (this.chessPieces) {
            this.chessPieces.reset();
        }
        document.getElementById('status').textContent = 'Neues Spiel gestartet';
    }

    onSessionEnd() {
        console.log('AR Session beendet');
        this.session = null;
        this.boardPlaced = false;
        this.gameState = 'placement';
        
        document.getElementById('startButton').style.display = 'block';
        document.getElementById('gameUI').style.display = 'none';
        
        if (this.reticle) {
            this.reticle.visible = false;
        }
    }

    animate() {
        this.renderer.setAnimationLoop(() => {
            this.updateReticlePosition();
            this.renderer.render(this.scene, this.camera);
        });
    }
}

// Starte die App
window.addEventListener('load', () => {
    new SimpleWebXRChess();
});