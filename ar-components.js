// AR Components for WebXR Chess Game

// Hit Test Component for AR placement
AFRAME.registerComponent('ar-hit-test', {
    init: function () {
        this.el.addEventListener('click', this.onSelect.bind(this));
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;
        this.localSpace = null;
        this.isPlaced = false;
        
        this.scene = document.querySelector('a-scene');
        this.gameContainer = document.querySelector('#game-container');
        this.statusText = document.querySelector('#game-status');
        
        // Setup XR session handling
        this.scene.addEventListener('enter-vr', this.onEnterVR.bind(this));
        this.scene.addEventListener('exit-vr', this.onExitVR.bind(this));
        
        // Don't start AR session automatically - wait for user interaction
    },

    startARSession: function() {
        // Check for camera permissions first
        this.requestCameraPermission().then(() => {
            if (navigator.xr) {
                navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
                    if (supported) {
                        console.log('WebXR AR supported, attempting to start session');
                        this.requestARSession();
                    } else {
                        console.warn('AR not supported, using camera fallback');
                        this.setupCameraFallback();
                    }
                }).catch((err) => {
                    console.warn('Error checking AR support:', err);
                    this.setupCameraFallback();
                });
            } else {
                console.warn('WebXR not supported, using camera fallback');
                this.setupCameraFallback();
            }
        }).catch((err) => {
            console.error('Camera permission denied:', err);
            this.setupCameraFallback();
        });
    },

    requestCameraPermission: function() {
        return new Promise((resolve, reject) => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then((stream) => {
                        // Stop the stream immediately, we just wanted permission
                        stream.getTracks().forEach(track => track.stop());
                        console.log('Camera permission granted');
                        resolve();
                    })
                    .catch((err) => {
                        console.error('Camera permission denied:', err);
                        reject(err);
                    });
            } else {
                // Fallback for older browsers
                console.warn('getUserMedia not supported, proceeding without explicit permission');
                resolve();
            }
        });
    },

    requestARSession: function() {
        if (navigator.xr) {
            navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test'],
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: document.body }
            }).then((session) => {
                console.log('AR session started successfully');
                this.scene.renderer.xr.setSession(session);
            }).catch((err) => {
                console.warn('Failed to start AR session:', err);
                this.setupCameraFallback();
            });
        }
    },

    setupCameraFallback: function() {
        console.log('Setting up camera fallback mode');
        
        // Update status text
        this.statusText.setAttribute('value', 'AR nicht verfügbar - Klicke um das Schachbrett zu platzieren');
        
        // Show reticle in center for non-AR devices
        this.el.setAttribute('visible', true);
        this.el.setAttribute('position', '0 0 -2');
        
        // Make reticle clickable for placement
        this.el.classList.add('clickable');
        
        // Try to access camera for background view
        this.setupCameraBackground();
    },

    setupCameraBackground: function() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            })
            .then((stream) => {
                console.log('Camera stream obtained for background');
                
                // Create video element for camera feed
                const video = document.createElement('video');
                video.srcObject = stream;
                video.autoplay = true;
                video.playsInline = true;
                video.muted = true;
                
                // Style video as background
                video.style.position = 'fixed';
                video.style.top = '0';
                video.style.left = '0';
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
                video.style.zIndex = '-1';
                
                document.body.appendChild(video);
                
                // Update scene background
                this.scene.setAttribute('background', 'color: transparent');
                
                this.statusText.setAttribute('value', 'Kamera aktiv - Klicke um das Schachbrett zu platzieren');
            })
            .catch((err) => {
                console.warn('Could not access camera for background:', err);
                this.statusText.setAttribute('value', 'Keine Kamera - Klicke um das Schachbrett zu platzieren');
            });
        }
    },

    onEnterVR: function() {
        const session = this.scene.renderer.xr.getSession();
        if (session && session.requestHitTestSource) {
            this.requestHitTestSource(session);
        }
    },

    onExitVR: function() {
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;
    },

    requestHitTestSource: function(session) {
        if (this.hitTestSourceRequested) return;
        
        this.hitTestSourceRequested = true;
        
        session.requestReferenceSpace('viewer').then((referenceSpace) => {
            this.localSpace = referenceSpace;
            return session.requestHitTestSource({ space: referenceSpace });
        }).then((source) => {
            this.hitTestSource = source;
        }).catch((err) => {
            console.warn('Hit test not available:', err);
            this.setupCameraFallback();
        });
    },

    tick: function() {
        if (!this.hitTestSource || this.isPlaced) return;

        const session = this.scene.renderer.xr.getSession();
        if (!session) return;

        const frame = this.scene.renderer.xr.getFrame();
        if (!frame) return;

        const results = frame.getHitTestResults(this.hitTestSource);
        
        if (results.length > 0) {
            const hit = results[0];
            const pose = hit.getPose(this.localSpace);
            
            if (pose) {
                this.el.setAttribute('visible', true);
                
                const position = pose.transform.position;
                const orientation = pose.transform.orientation;
                
                this.el.setAttribute('position', {
                    x: position.x,
                    y: position.y,
                    z: position.z
                });
                
                this.el.setAttribute('rotation', {
                    x: 0,
                    y: orientation.y * 180 / Math.PI,
                    z: 0
                });
            }
        } else {
            this.el.setAttribute('visible', false);
        }
    },

    onSelect: function() {
        if (this.isPlaced) return;
        
        this.isPlaced = true;
        
        // Get reticle position and rotation
        const position = this.el.getAttribute('position');
        const rotation = this.el.getAttribute('rotation');
        
        // Place the chess board
        this.placeChessBoard(position, rotation);
        
        // Hide reticle
        this.el.setAttribute('visible', false);
        
        // Update UI
        this.statusText.setAttribute('value', 'Schachbrett platziert! Beginne das Spiel...');
        
        // Show game container
        this.gameContainer.setAttribute('visible', true);
        this.gameContainer.setAttribute('position', position);
        this.gameContainer.setAttribute('rotation', rotation);
        
        // Initialize chess game
        setTimeout(() => {
            if (window.chessGame) {
                window.chessGame.initializeGame();
            }
        }, 500);
    },

    placeChessBoard: function(position, rotation) {
        const board = document.createElement('a-entity');
        board.setAttribute('id', 'chess-board');
        board.setAttribute('position', '0 0 0');
        
        // Create board base
        const boardBase = document.createElement('a-box');
        boardBase.setAttribute('width', '2.4');
        boardBase.setAttribute('height', '0.1');
        boardBase.setAttribute('depth', '2.4');
        boardBase.setAttribute('material', 'color: #8B4513; roughness: 0.8');
        boardBase.setAttribute('position', '0 -0.05 0');
        board.appendChild(boardBase);
        
        // Create chess squares
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('a-box');
                const isLight = (row + col) % 2 === 0;
                const color = isLight ? '#F0D9B5' : '#B58863';
                
                square.setAttribute('width', '0.28');
                square.setAttribute('height', '0.02');
                square.setAttribute('depth', '0.28');
                square.setAttribute('material', `color: ${color}; roughness: 0.6`);
                
                const x = (col - 3.5) * 0.3;
                const z = (row - 3.5) * 0.3;
                square.setAttribute('position', `${x} 0.01 ${z}`);
                square.setAttribute('class', 'chess-square clickable');
                square.setAttribute('data-row', row);
                square.setAttribute('data-col', col);
                
                board.appendChild(square);
            }
        }
        
        this.gameContainer.appendChild(board);
    }
});

// Gesture Detector for touch interactions
AFRAME.registerComponent('gesture-detector', {
    schema: {
        element: { default: '' }
    },

    init: function () {
        this.targetElement = this.data.element && document.querySelector(this.data.element) || this.el;
        this.internalState = {
            previousState: null
        };

        this.emitGestureEvent = this.emitGestureEvent.bind(this);
        this.targetElement.addEventListener('touchstart', this.emitGestureEvent);
        this.targetElement.addEventListener('touchend', this.emitGestureEvent);
        this.targetElement.addEventListener('touchmove', this.emitGestureEvent);
    },

    remove: function () {
        this.targetElement.removeEventListener('touchstart', this.emitGestureEvent);
        this.targetElement.removeEventListener('touchend', this.emitGestureEvent);
        this.targetElement.removeEventListener('touchmove', this.emitGestureEvent);
    },

    emitGestureEvent: function (event) {
        const currentState = this.getTouchState(event);
        const previousState = this.internalState.previousState;

        const gestureContinues = previousState &&
            currentState &&
            currentState.touchCount === previousState.touchCount;

        const gestureEnded = previousState && !gestureContinues;
        const gestureStarted = currentState && !gestureContinues;

        if (gestureEnded) {
            const eventName = this.getEventPrefix(previousState.touchCount) + 'fingerend';
            this.el.emit(eventName, previousState);
            this.internalState.previousState = null;
        }

        if (gestureStarted) {
            currentState.startTime = performance.now();
            currentState.startPosition = currentState.position;
            currentState.startSpread = currentState.spread;
            const eventName = this.getEventPrefix(currentState.touchCount) + 'fingerstart';
            this.el.emit(eventName, currentState);
            this.internalState.previousState = currentState;
        }

        if (gestureContinues) {
            const eventName = this.getEventPrefix(currentState.touchCount) + 'fingermove';
            this.el.emit(eventName, currentState);
            this.internalState.previousState = currentState;
        }
    },

    getTouchState: function (event) {
        if (event.touches.length === 0) return null;

        const touchList = [];
        for (let i = 0; i < event.touches.length; i++) {
            touchList.push(event.touches[i]);
        }

        const touchCount = touchList.length;
        const centroid = this.getCentroid(touchList);
        const spread = this.getSpread(touchList, centroid);

        return {
            touchCount: touchCount,
            position: centroid,
            spread: spread,
            touches: touchList
        };
    },

    getCentroid: function (touchList) {
        let x = 0;
        let y = 0;
        for (const touch of touchList) {
            x += touch.clientX;
            y += touch.clientY;
        }
        return {
            x: x / touchList.length,
            y: y / touchList.length
        };
    },

    getSpread: function (touchList, centroid) {
        let spread = 0;
        for (const touch of touchList) {
            spread += Math.sqrt(
                Math.pow(centroid.x - touch.clientX, 2) +
                Math.pow(centroid.y - touch.clientY, 2)
            );
        }
        return spread / touchList.length;
    },

    getEventPrefix: function (touchCount) {
        const numberNames = ['one', 'two', 'three', 'four', 'five'];
        return numberNames[Math.min(touchCount, 5) - 1];
    }
});

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
        this.originalPosition = this.el.getAttribute('position');
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
                this.el.setAttribute('animation__select', 'property: position; to: 0 0.1 0; dur: 200; relative: true');
            } else {
                this.el.setAttribute('material', 'emissive: #000000; emissiveIntensity: 0');
                this.el.setAttribute('animation__deselect', 'property: position; to: 0 -0.1 0; dur: 200; relative: true');
            }
        }
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('AR Components initialized');
    
    // Add user interaction button for AR session
    const startButton = document.createElement('button');
    startButton.textContent = 'AR Schach starten';
    startButton.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 15px 30px;
        font-size: 18px;
        background: linear-gradient(45deg, #00d4ff, #00ff88);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        z-index: 1001;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
    `;
    
    startButton.addEventListener('click', function() {
        console.log('Start button clicked');
        startButton.remove();
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // Initialize AR
        const reticle = document.querySelector('#reticle');
        if (reticle && reticle.components['ar-hit-test']) {
            reticle.components['ar-hit-test'].startARSession();
        }
    });
    
    // Add button to loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.appendChild(startButton);
    }
    
    // Show controls info
    setTimeout(() => {
        const controlsInfo = document.getElementById('controls-info');
        if (controlsInfo) {
            controlsInfo.style.opacity = '1';
        }
    }, 1000);
});