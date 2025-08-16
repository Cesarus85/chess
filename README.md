# WebXR AR Schach für Meta Quest 3

Ein immersives AR-Schachspiel, das WebXR-Technologie nutzt um auf der Meta Quest 3 zu laufen.

## 🚀 Quick Start

1. **HTTPS erforderlich**: WebXR funktioniert nur über HTTPS. Nutze einen lokalen HTTPS-Server:
   ```bash
   # Mit Python (empfohlen)
   python -m http.server 8000 --bind 0.0.0.0
   
   # Oder mit Node.js
   npx serve . -s
   ```

2. **Browser öffnen**: Gehe zu `https://localhost:8000` (oder deine IP)

3. **Spiel starten**: Klicke auf "AR Schach starten" Button

## 🎯 Problemlösung

### "Bitte erlaube Zugriff auf die Kamera" - kein Dialog

**Gelöst!** Das Spiel nutzt jetzt:
- ✅ Benutzerinteraktion erforderlich (Start-Button)
- ✅ Explizite Kamera-Berechtigung
- ✅ Fallback für Browser ohne WebXR
- ✅ Kamera-Hintergrund für normale Browser

### Weitere häufige Probleme

**WebXR nicht verfügbar:**
- Das Spiel fällt automatisch auf Kamera-Modus zurück
- Funktioniert in jedem modernen Browser

**Kamera-Zugriff verweigert:**
- Überprüfe Browser-Einstellungen
- Stelle sicher, dass HTTPS verwendet wird
- Erlaube Kamera-Zugriff manuell in den Browser-Einstellungen

**Schachbrett nicht sichtbar:**
- Klicke auf das weiße Reticle um das Brett zu platzieren
- Im Fallback-Modus: Klicke einfach irgendwo auf den Bildschirm

## 🎮 Steuerung

- **Reticle**: Schaue umher um das Platzierungs-Reticle zu sehen
- **Platzierung**: Klicke um das Schachbrett zu platzieren
- **Figuren bewegen**: Klicke auf eine Figur, dann auf das Zielfeld
- **Neues Spiel**: Button erscheint nach Spielende

## 🔧 Technische Details

- **WebXR**: Immersive AR für Meta Quest 3
- **A-Frame**: 3D WebXR Framework
- **Fallback**: Kamera-Hintergrund für normale Browser
- **Schach-KI**: Einfache aber effektive Computer-Gegner
- **Responsive**: Funktioniert auf Desktop, Mobile und VR

## 📁 Dateien

- `index.html` - Haupt-HTML mit A-Frame
- `ar-components.js` - WebXR AR-Komponenten
- `chess-game.js` - Schachlogik und KI
- `style.css` - Styling und Animationen

## 🌐 Browser-Kompatibilität

- **Meta Quest 3**: Chrome (WebXR AR)
- **Desktop**: Chrome, Firefox, Safari (Kamera-Fallback)
- **Mobile**: Chrome, Safari (Kamera-Fallback)

---

**Hinweis**: Für die beste Erfahrung verwende die Meta Quest 3 mit Chrome Browser und stelle sicher, dass WebXR aktiviert ist.