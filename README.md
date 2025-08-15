# WebXR Chess AR

Ein vollständiges Schachspiel für VR-Headsets im AR-Modus mit Ebenenerkennung und KI-Gegner.

## Features

- **WebXR AR-Unterstützung**: Funktioniert mit allen WebXR-kompatiblen VR-Headsets
- **Ebenenerkennung**: Wählen Sie eine beliebige ebene Fläche für das Schachbrett
- **KI-Gegner**: Spielen Sie gegen den Computer
- **Vollständige Schachregeln**: Inklusive Rochade, En Passant und Schachmatt-Erkennung
- **VR-Controller-Interaktion**: Natürliche Auswahl und Bewegung von Figuren
- **Visueller Feedback**: Hervorhebung gültiger Züge und ausgewählter Figuren

## Voraussetzungen

- VR-Headset mit WebXR-Unterstützung (Meta Quest, HoloLens, etc.)
- Moderner Browser mit WebXR-Support
- HTTPS-Verbindung (erforderlich für WebXR)

## Installation

1. Laden Sie alle Dateien in einen Webserver hoch
2. Stellen Sie sicher, dass HTTPS aktiviert ist
3. Öffnen Sie `index.html` in einem WebXR-kompatiblen Browser

## Verwendung

1. **AR starten**: Klicken Sie auf "AR starten" und gewähren Sie die erforderlichen Berechtigungen
2. **Fläche wählen**: Schauen Sie sich um und suchen Sie eine ebene Fläche (Tisch, Boden, etc.)
3. **Schachbrett platzieren**: Tippen Sie auf die gewünschte Position, um das Schachbrett zu platzieren
4. **Spielen**: 
   - Zeigen Sie mit dem VR-Controller auf eine Figur und drücken Sie den Auslöser zum Auswählen
   - Gültige Züge werden grün hervorgehoben
   - Zeigen Sie auf ein Zielfeld und drücken Sie erneut den Auslöser
   - Der Computer macht automatisch seinen Zug

## Steuerung

- **Auslöser**: Figur auswählen/Zug machen
- **Neues Spiel**: Startet eine neue Partie
- **Zug zurück**: Macht den letzten Zug rückgängig

## Technische Details

### Architektur

- **main.js**: Haupt-WebXR-Anwendung und Koordination
- **chess-engine.js**: Schachlogik, Regelvalidierung und KI
- **chess-board.js**: 3D-Schachbrett-Rendering und -Interaktion
- **chess-pieces.js**: 3D-Schachfiguren-Erstellung und -Animation

### Verwendete Technologien

- **Three.js**: 3D-Grafik-Engine
- **WebXR Device API**: AR/VR-Funktionalität
- **Hit Testing API**: Ebenenerkennung

## Unterstützte Browser

- Chrome/Edge (Android, Windows)
- Firefox Reality
- Browser mit WebXR-Polyfill

## Bekannte Einschränkungen

- Benötigt gute Beleuchtung für optimale Ebenenerkennung
- KI verwendet derzeit einfache Heuristiken (kann verbessert werden)
- Keine Netzwerk-Multiplayer-Funktionalität

## Entwicklung

### Lokales Testen

```bash
# Einfacher HTTPS-Server für Entwicklung
npx http-server -S -p 8080
```

### Anpassungen

- **KI-Schwierigkeit**: Bearbeiten Sie `getComputerMove()` in `chess-engine.js`
- **Figuren-Design**: Modifizieren Sie die Geometrie-Funktionen in `chess-pieces.js`
- **Board-Größe**: Ändern Sie `boardSize` in `chess-board.js`

## Lizenz

MIT License - Freie Nutzung und Modifikation erlaubt.