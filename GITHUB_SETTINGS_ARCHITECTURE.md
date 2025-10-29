# GitHub Settings - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     SAKR STORE MANAGER                          │
│                    (Electron Application)                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     RENDERER PROCESS                             │
│                    (React + Redux)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐                    ┌──────────────┐            │
│  │  App.jsx   │                    │ MainContent  │            │
│  │            │                    │              │            │
│  │ [Main View]│◄──────────────────►│ [Products]   │            │
│  │ [Settings] │  View Switching    │              │            │
│  └─────┬──────┘                    └──────────────┘            │
│        │                                                         │
│        │                                                         │
│        ▼                                                         │
│  ┌─────────────────────────────────────────┐                   │
│  │      Settings.jsx Component              │                   │
│  ├─────────────────────────────────────────┤                   │
│  │  ┌──────────────────────────────────┐   │                   │
│  │  │  Form Fields:                     │   │                   │
│  │  │  • Repository URL                 │   │                   │
│  │  │  • GitHub Username                │   │                   │
│  │  │  • Personal Access Token          │   │                   │
│  │  │  • Local Project Path             │   │                   │
│  │  └──────────────────────────────────┘   │                   │
│  │                                          │                   │
│  │  ┌──────────────────────────────────┐   │                   │
│  │  │  Actions:                         │   │                   │
│  │  │  • Browse Directory               │   │                   │
│  │  │  • Test Connection                │   │                   │
│  │  │  • Save Settings                  │   │                   │
│  │  │  • Clear Form                     │   │                   │
│  │  └──────────────────────────────────┘   │                   │
│  └────────────┬─────────────────────────────┘                   │
│               │                                                  │
│               │ window.electron.*                               │
│               │                                                  │
└───────────────┼──────────────────────────────────────────────────┘
                │
                │ IPC Communication
                │
┌───────────────┼──────────────────────────────────────────────────┐
│               │                                                   │
│               ▼                                                   │
│  ┌─────────────────────────────────────────┐                    │
│  │      Preload.js (Context Bridge)        │                    │
│  ├─────────────────────────────────────────┤                    │
│  │  Exposed API:                            │                    │
│  │  • window.electron.saveSettings()        │                    │
│  │  • window.electron.loadSettings()        │                    │
│  │  • window.electron.browseDirectory()     │                    │
│  │  • window.electron.testConnection()      │                    │
│  └─────────────┬───────────────────────────┘                    │
│                │                                                  │
│                │ ipcRenderer.invoke()                            │
│                │                                                  │
│                ▼                                                  │
│  ┌─────────────────────────────────────────┐                    │
│  │      Main.js (IPC Handlers)             │                    │
│  ├─────────────────────────────────────────┤                    │
│  │                                          │                    │
│  │  ipcMain.handle('settings:save')         │                    │
│  │  ipcMain.handle('settings:load')         │                    │
│  │  ipcMain.handle('settings:browseDirectory')                  │
│  │  ipcMain.handle('settings:testConnection')                   │
│  │                                          │                    │
│  └─────────────┬───────────────────────────┘                    │
│                │                                                  │
│                │ Uses Services                                   │
│                │                                                  │
│                ▼                                                  │
│                                                                   │
│  ┌──────────────────────┐    ┌──────────────────────┐           │
│  │   ConfigService      │    │     GitService        │           │
│  │  (Singleton)         │    │                       │           │
│  ├──────────────────────┤    ├──────────────────────┤           │
│  │                      │    │                       │           │
│  │ • saveConfig()       │    │ • isRepository()      │           │
│  │ • loadConfig()       │    │ • testConnection()    │           │
│  │ • getConfigWithToken()    │ • getStatus()         │           │
│  │ • getConfigForDisplay()   │ • getRemotes()        │           │
│  │ • updateConfig()     │    │                       │           │
│  │ • hasConfig()        │    │ Uses: simple-git      │           │
│  │ • deleteConfig()     │    │                       │           │
│  │                      │    └──────────┬────────────┘           │
│  └──────────┬───────────┘               │                        │
│             │                            │                        │
│             │ Uses                       │                        │
│             ▼                            ▼                        │
│  ┌──────────────────────┐    ┌──────────────────────┐           │
│  │  Encryption Utils    │    │  Local Git Repo      │           │
│  ├──────────────────────┤    │  (.git folder)       │           │
│  │                      │    └──────────────────────┘           │
│  │ • encryptToken()     │                                        │
│  │ • decryptToken()     │                                        │
│  │ • isEncrypted()      │                                        │
│  │                      │                                        │
│  │ Algorithm:           │                                        │
│  │ AES-256-GCM          │                                        │
│  │                      │                                        │
│  └──────────┬───────────┘                                        │
│             │                                                     │
│             │ Writes/Reads                                       │
│             ▼                                                     │
│  ┌──────────────────────┐                                        │
│  │   config.json        │                                        │
│  │ (User Data Directory)│                                        │
│  ├──────────────────────┤                                        │
│  │ {                    │                                        │
│  │   repoUrl: "...",    │                                        │
│  │   username: "...",   │                                        │
│  │   encryptedToken: "eyJ..." ◄── ENCRYPTED!                   │
│  │   projectPath: "...",│                                        │
│  │   lastUpdated: "..." │                                        │
│  │   version: "1.0"     │                                        │
│  │ }                    │                                        │
│  └──────────────────────┘                                        │
│                                                                   │
│                    MAIN PROCESS                                  │
│                 (Node.js + Electron)                             │
└───────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Save Settings Flow

```
User fills form in Settings.jsx
    ↓
Clicks "Save Settings" button
    ↓
Settings.jsx calls: window.electron.saveSettings(config)
    ↓
Preload.js forwards: ipcRenderer.invoke('settings:save', config)
    ↓
Main.js handler receives config
    ↓
Import ConfigService (ES Module)
    ↓
ConfigService.saveConfig(config)
    ↓
    ├─ Validates config object
    ├─ Calls encryptToken(config.token)
    │      ↓
    │  Encryption.js:
    │  ├─ Generate random IV
    │  ├─ Derive key from master password
    │  ├─ Create AES-256-GCM cipher
    │  ├─ Encrypt token
    │  └─ Return base64 encrypted data
    │      ↓
    ├─ Replace plain token with encryptedToken
    ├─ Add metadata (lastUpdated, version)
    └─ Write JSON to config.json
        ↓
Return { success: true, message: "..." }
    ↓
Preload.js returns to renderer
    ↓
Settings.jsx displays success message
    ↓
Token field updates to "••••••••"
```

---

### 2. Load Settings Flow

```
Settings.jsx mounts
    ↓
useEffect calls: window.electron.loadSettings()
    ↓
Preload.js forwards: ipcRenderer.invoke('settings:load')
    ↓
Main.js handler processes request
    ↓
Import ConfigService
    ↓
ConfigService.getConfigForDisplay()
    ↓
    ├─ Check if config.json exists
    ├─ Read file contents
    ├─ Parse JSON
    ├─ Remove encryptedToken from response
    ├─ Add hasToken: true
    └─ Add token: "••••••••" (masked)
        ↓
Return config object
    ↓
Preload.js returns to renderer
    ↓
Settings.jsx populates form fields
    ↓
Token field shows "••••••••"
```

---

### 3. Test Connection Flow

```
User clicks "Test Connection" button
    ↓
Settings.jsx calls: window.electron.testConnection(config)
    ↓
Preload.js forwards: ipcRenderer.invoke('settings:testConnection', config)
    ↓
Main.js handler receives config
    ↓
    ├─ Import ConfigService
    ├─ Get full config with decrypted token
    │      ↓
    │  ConfigService.getConfigWithToken()
    │      ├─ Read config.json
    │      ├─ Parse JSON
    │      ├─ Call decryptToken(encryptedToken)
    │      │      ↓
    │      │  Encryption.js:
    │      │  ├─ Decode base64
    │      │  ├─ Extract IV, authTag, encryptedData
    │      │  ├─ Derive key from master password
    │      │  ├─ Create decipher
    │      │  ├─ Set auth tag
    │      │  └─ Decrypt and return plain token
    │      │      ↓
    │      └─ Return config with plain token
    │          ↓
    ├─ Merge with provided config
    ├─ Create GitService instance
    └─ Call gitService.testConnection()
            ↓
        GitService:
        ├─ Check if directory is Git repo (.git folder)
        ├─ Validate config (username, token, repoUrl)
        ├─ Check remotes with simple-git
        └─ Attempt fetch --dry-run
            ↓
        Return { success: true/false, message: "..." }
            ↓
Main.js returns result
    ↓
Preload.js returns to renderer
    ↓
Settings.jsx displays result message
    ↓
Green (success) or Red (error) message
```

---

### 4. Browse Directory Flow

```
User clicks "Browse" button
    ↓
Settings.jsx calls: window.electron.browseDirectory()
    ↓
Preload.js forwards: ipcRenderer.invoke('settings:browseDirectory')
    ↓
Main.js handler processes request
    ↓
Electron dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select Local Git Repository Folder'
})
    ↓
Native OS directory picker opens
    ↓
User selects folder and clicks "Select"
    ↓
dialog returns { filePaths: [selectedPath] }
    ↓
Main.js returns selectedPath
    ↓
Preload.js returns to renderer
    ↓
Settings.jsx updates projectPath field
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                              │
└─────────────────────────────────────────────────────────────────┘

Layer 1: UI Security
┌──────────────────────────────────────────────────────────────┐
│ • Password input type (token field)                          │
│ • Token masking ("••••••••")                                 │
│ • No console logging of sensitive data                       │
└──────────────────────────────────────────────────────────────┘
                            ↓
Layer 2: Process Isolation
┌──────────────────────────────────────────────────────────────┐
│ • Context isolation enabled                                   │
│ • Renderer cannot access Node.js modules directly            │
│ • IPC communication only through preload script              │
└──────────────────────────────────────────────────────────────┘
                            ↓
Layer 3: Encryption in Transit
┌──────────────────────────────────────────────────────────────┐
│ • Plain token sent once during save                          │
│ • Encrypted immediately in main process                      │
│ • Never logged or stored in plain text                       │
└──────────────────────────────────────────────────────────────┘
                            ↓
Layer 4: Encryption at Rest
┌──────────────────────────────────────────────────────────────┐
│ • AES-256-GCM encryption                                      │
│ • Random IV per encryption                                   │
│ • Authentication tags prevent tampering                      │
│ • Master password derived with scrypt                        │
└──────────────────────────────────────────────────────────────┘
                            ↓
Layer 5: Secure Storage
┌──────────────────────────────────────────────────────────────┐
│ • OS-specific user data directory                            │
│ • File permissions managed by OS                             │
│ • Not in project directory (avoids Git commits)             │
│ • JSON format with encrypted token only                      │
└──────────────────────────────────────────────────────────────┘
```

---

## File Organization

```
sakr-store-manager/
│
├── src/
│   ├── components/
│   │   ├── Settings.jsx          ◄── UI Component
│   │   ├── Settings.css          ◄── Styles
│   │   └── ...
│   │
│   ├── services/
│   │   ├── configService.js      ◄── Config Management
│   │   ├── gitService.js         ◄── Git Operations
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── encryption.js         ◄── Token Encryption
│   │   └── ...
│   │
│   └── App.jsx                   ◄── Main App (View Routing)
│
├── electron/
│   ├── main.js                   ◄── IPC Handlers
│   └── preload.js                ◄── Context Bridge
│
└── Documentation/
    ├── GITHUB_SETTINGS_IMPLEMENTATION.md       ◄── Full Docs
    ├── GITHUB_SETTINGS_QUICK_REFERENCE.md      ◄── Quick Guide
    ├── GITHUB_SETTINGS_TESTING_GUIDE.md        ◄── Test Suite
    └── GITHUB_SETTINGS_COMPLETE_SUMMARY.md     ◄── Summary
```

---

## Component Interaction Map

```
┌────────────────────────────────────────────────────────────────┐
│                    Component Relationships                      │
└────────────────────────────────────────────────────────────────┘

Settings.jsx
    │
    ├─ Uses ──► window.electron.saveSettings()
    ├─ Uses ──► window.electron.loadSettings()
    ├─ Uses ──► window.electron.browseDirectory()
    └─ Uses ──► window.electron.testConnection()
                        │
                        │ (IPC)
                        ▼
                    Preload.js
                        │
                        ├─ Exposes to Renderer
                        └─ Invokes Main Process
                                │
                                │ (IPC)
                                ▼
                            Main.js
                                │
                                ├─ Uses ──► ConfigService
                                │               │
                                │               ├─ Uses ──► Encryption
                                │               └─ Reads/Writes ──► config.json
                                │
                                └─ Uses ──► GitService
                                                │
                                                └─ Uses ──► simple-git
                                                            │
                                                            └─ Accesses ──► .git/
```

---

## State Management

```
Application State Flow
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  User Input (Form)                                           │
│      ↓                                                        │
│  Local State (useState)                                      │
│      ↓                                                        │
│  IPC Call (window.electron.*)                               │
│      ↓                                                        │
│  Main Process (ConfigService)                               │
│      ↓                                                        │
│  Disk Storage (config.json)                                 │
│      ↓                                                        │
│  Read Back (loadSettings)                                   │
│      ↓                                                        │
│  Update Local State                                         │
│      ↓                                                        │
│  UI Update (Re-render)                                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
Error Propagation Chain
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  1. Operation Fails (e.g., encryption, file I/O, Git)       │
│                                                               │
│  2. Service throws Error with descriptive message            │
│                                                               │
│  3. Main.js IPC handler catches error                       │
│                                                               │
│  4. Returns { success: false, message: error.message }      │
│                                                               │
│  5. Preload.js forwards response                            │
│                                                               │
│  6. Settings.jsx receives error response                    │
│                                                               │
│  7. Updates status state with error message                 │
│                                                               │
│  8. UI displays red error message to user                   │
│                                                               │
│  9. User can correct and retry                              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        Technology Layers                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend Layer                                                 │
│  ├─ React 18.2.0          (UI Components)                      │
│  ├─ Redux Toolkit 2.9.2   (State Management - Products)        │
│  └─ CSS3                  (Styling)                             │
│                                                                  │
│  Desktop Layer                                                  │
│  ├─ Electron 28.0.0       (Desktop Framework)                  │
│  ├─ IPC                   (Inter-Process Communication)        │
│  └─ Context Bridge        (Secure API Exposure)                │
│                                                                  │
│  Backend Layer                                                  │
│  ├─ Node.js               (JavaScript Runtime)                 │
│  ├─ fs-extra 11.2.0       (File System Operations)            │
│  └─ path                  (Path Manipulation)                  │
│                                                                  │
│  Security Layer                                                 │
│  ├─ crypto (built-in)     (AES-256-GCM Encryption)            │
│  └─ scrypt                (Key Derivation)                     │
│                                                                  │
│  Git Layer                                                      │
│  ├─ simple-git 3.28.0     (Git Operations)                     │
│  └─ .git                  (Local Repository)                   │
│                                                                  │
│  Storage Layer                                                  │
│  ├─ JSON                  (Config File Format)                 │
│  └─ User Data Directory   (OS-Specific Storage)                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

This architecture provides a secure, scalable, and maintainable solution for GitHub integration in the Sakr Store Manager application.
