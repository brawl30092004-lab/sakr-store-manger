# Build & Distribution Quick Reference

## Pre-Build Checklist
- [ ] `npm install` - All dependencies installed
- [ ] `build/icon.ico` exists - Run `create-icons.bat` if needed
- [ ] Version updated in `package.json`
- [ ] GitHub publish config updated (owner/repo)

## Build Commands

### Create Icons
```bash
create-icons.bat
```

### Development Build
```bash
npm run electron:dev
```

### Production Build
```bash
npm run electron:build
```

## Build Output

Location: `release/` folder

Files generated:
- `Sakr Store Manager Setup {version}.exe` - NSIS installer (~150-200 MB)
- `Sakr Store Manager {version} Portable.exe` - Portable version (~150-200 MB)
- `latest.yml` - Auto-update metadata (upload to GitHub)

## Testing

### 1. Test NSIS Installer
```bash
# Run the installer
.\release\Sakr Store Manager Setup 1.0.0.exe

# Launch from Start Menu
# Test all features
# Uninstall from Windows Settings
```

### 2. Test Portable Version
```bash
# Just run it
.\release\Sakr Store Manager 1.0.0 Portable.exe

# No installation needed
```

### 3. Test on Clean Windows VM
- Copy installer to VM
- Install and run
- Verify all features work
- Test uninstallation

## Distribution

### GitHub Release
1. Create new release on GitHub
2. Tag version (e.g., `v1.0.0`)
3. Upload files:
   - `Sakr Store Manager Setup {version}.exe`
   - `Sakr Store Manager {version} Portable.exe`
   - `latest.yml` (for auto-updates)
4. Publish release

### Direct Download
- Host installers on your website
- Provide download links to users

## Auto-Updater

### Configuration
In `package.json`:
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "YOUR_GITHUB_USERNAME",
      "repo": "sakr-store-manager"
    }
  }
}
```

### How It Works
1. App checks for updates on startup (production only)
2. Prompts user if update available
3. Downloads update in background
4. Installs on app quit/restart

### Publishing Updates
1. Update version in `package.json`
2. Run `npm run electron:build`
3. Create GitHub release with new tag
4. Upload `Sakr Store Manager Setup {version}.exe` and `latest.yml`
5. Publish release
6. Users get notified automatically

## Common Issues

### "Icon not found"
```bash
create-icons.bat
```

### "Sharp module error"
```bash
npm rebuild sharp --platform=win32 --arch=x64
```

### "Build fails"
```bash
rm -rf dist release node_modules
npm install
npm run electron:build
```

### "Auto-updater not working"
- Check `publish` config in package.json
- Ensure GitHub release is published (not draft)
- Verify `latest.yml` uploaded
- Only works in production builds

## Version Management

### Semantic Versioning
- `1.0.0` - Initial release
- `1.0.1` - Bug fix
- `1.1.0` - New feature
- `2.0.0` - Breaking change

### Update Version
1. Edit `package.json` → `"version": "1.0.1"`
2. Commit and tag:
   ```bash
   git add package.json
   git commit -m "Bump version to 1.0.1"
   git tag v1.0.1
   git push origin main --tags
   ```

## File Sizes
- Installer: ~150-200 MB (includes Electron + Node.js + Sharp)
- Portable: ~150-200 MB (same contents, no installer)

This is normal! The bundle includes:
- Electron runtime (~100 MB)
- Node.js (~30 MB)
- Native modules (Sharp ~20 MB)
- Your app code

## Need More Help?
See `BUILD_AND_DISTRIBUTION_GUIDE.md` for detailed documentation.

## Quick Build & Test Workflow

```bash
# 1. Create icons (first time only)
create-icons.bat

# 2. Build the app
npm run electron:build

# 3. Test installer
.\release\Sakr Store Manager Setup 1.0.0.exe

# 4. Create GitHub release and upload files
# 5. Done! 🎉
```
