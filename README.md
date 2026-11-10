# 📺 TizenPortal

> **Fork de [axelnanol/tizenportal](https://github.com/axelnanol/tizenportal)** (licence MIT, tout le mérite du projet revient à Axel Nanol).
> Changements de ce fork : navigation « Smart » par défaut et plus tolérante (elle ne saute plus les liens légèrement décalés), titres du menu Préférences ignorés par les flèches, portail servi depuis `blobro.github.io/tizenportal`.
> Dans TizenBrew : *Ajouter un module GitHub* → `BLOBRO/tizenportal`.


![Tizen](https://img.shields.io/badge/Tizen-3.0%2B-blueviolet) ![License](https://img.shields.io/badge/license-MIT-green)

**TizenPortal** is a browser shell for Samsung Smart TVs running Tizen OS. It provides a launcher for managing any websites and injects site-specific fixes for TV compatibility (self-hosted apps like **Audiobookshelf** are a great fit, but not required).

---

## ✨ Features

### 🚀 Portal Launcher
A TV-friendly launcher with customizable themes to manage your sites in one place.
- Grid-based layout optimized for TV remote navigation
- TizenPortal branding with Portal-inspired icon and themes
- Site editor for adding/editing apps with custom names and icons
- Bundle selector for choosing compatibility fixes per-site

### 🔧 Site Enhancement
Runs as a TizenBrew module to inject fixes into any site.
- **Unified Registry System** - Features and userscripts managed through a consistent registry-based API
- **Declarative bundle system** - Bundles are primarily configuration, which can significantly reduce repetitive DOM manipulation code
- Bundle CSS/JS applied automatically
- Element registration API for focusable elements, styling, and DOM manipulation
- Card registration for multi-element interactive cards
- Viewport locking and focus tooling for responsive sites
- Cross-origin safe (iframe access is limited; runtime guards access)

### 🎮 Remote Control Support
- **D-pad navigation** with spatial focus
- **Color buttons** for quick actions:
  - 🔴 Red: Address bar overlay
  - 🟢 Green: Mouse mode toggle
  - 🟡 Yellow: Preferences (portal) / Return to portal (sites)
  - 🔵 Blue: Diagnostics panel

---

## 📥 Installation

This project is designed to be loaded via **TizenBrew** on your Samsung TV.

1. **Open TizenBrew** on your Samsung TV
2. **Add Module:** `axelnanol/tizenportal`
3. **Launch** TizenPortal from your TizenBrew dashboard

TizenBrew will open the portal and inject the runtime into all navigated pages.

---

## 🎮 Usage

### Adding Sites
1. Press **Enter** on the "+" card
2. Fill in the site details:
   - **Name:** Display name for the card
   - **URL:** Full URL including `http://` or `https://`
  - **Site-specific Bundle:** Select a compatibility bundle
   - **Icon:** Optional - click "Fetch Favicon" or enter a custom URL

### Editing Sites
- Focus a site card and **long-press Enter** to open the editor
- Changes auto-save; press **Close** when finished

### Navigating Sites
1. Select a site card and press **Enter** to open
2. Use **D-pad** for navigation or press **🟢 Green** for mouse mode
3. Press **🟡 Yellow** to return to the portal

### Address Bar

Press **🔴 Red** to open the address bar overlay with browser controls:
- **⎈** Return to portal  &nbsp; **🏠** Site home  &nbsp; **←** Back  &nbsp; **→** Forward  &nbsp; **↻** Reload
- **URL field** — Press Enter to edit, type a new address
- **→ Go** — Navigate to the entered URL
- **ℹ Info** — Open TizenPortal documentation

### Preferences
- Press **🟡 Yellow** on the portal to open Preferences
- Theme modes: Light, Dark, Automatic (Sunset), Portal (Blue & Orange), Custom Backdrop, Custom Colours
- Debug HUD position: Off / Top Right / Top Left / Bottom Right / Bottom Left
- Portal hints (color button labels)
- Viewport lock mode, focus outline mode, and user agent mode
- Auto-focusable elements, scroll-into-view, safe area inset
- GPU hints, CSS normalization, hide scrollbars
- Text input protection: prevents the TV keyboard from opening until Enter is pressed

### Color Button Reference
| Button | Short Press | Long Press |
|--------|-------------|------------|
| 🔴 Red | Address Bar | Reload Page |
| 🟢 Green | Toggle Mouse | Edit Card (portal) / Focus Highlight (sites) |
| 🟡 Yellow | Preferences (portal) / Return to portal (sites) | Add Site (portal) / Return to portal (sites) |
| 🔵 Blue | Diagnostics | Safe Mode |

---

## 🏗️ Architecture

TizenPortal uses a **Universal Runtime** architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        TizenBrew                            │
│  1. Loads module from GitHub tag                            │
│  2. Opens websiteURL (portal) in browser                    │
│  3. Injects tizenportal.js into ALL pages                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Portal Page                               │
│  - Runtime detects it's on the portal                       │
│  - Renders site card grid                                   │
│  - User selects card → navigates with #tp= payload          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Target Site                                  │
│  - Runtime detects it's NOT on portal                       │
│  - Reads #tp= payload for bundle name                       │
│  - Applies bundle CSS/JS                                    │
│  - Provides overlay UI (address bar, diagnostics)           │
└─────────────────────────────────────────────────────────────┘
```

### Key Points

- **Single runtime** (`tizenportal.js`) on all pages
- **Cross-origin safe** — Payload passed via URL hash; iframe access is guarded
- **Full DOM access** — Runtime runs in page context  
- **Bundles compiled in** — All bundles included in runtime

---

## 🆕 Recent Updates

- **Unified Registry System** — Features and userscripts now share a consistent registry-based architecture
- **Manifest System** — Bundle metadata now defined in manifest.json with validation
- **Bundle Options** — Bundles can declare per-site options (with URL fetch support)
- **Preferences Overhaul** — Theme modes, custom colours, backdrop, and HUD position
- **Adblock Enhancements** — Strict mode, allowlist, cookie/inline heuristics
- **Text Input Protection** — Prevents OSK auto-popup (toggle in Preferences)

---

## 📚 Documentation

- **[User Guide](docs/User-Guide.md)** — Complete feature walkthrough
- **[Security Guide](docs/Security.md)** — Security features and best practices
- **[Bundle Authoring](docs/Bundle-Authoring.md)** — How to create site-specific bundles
- **[Unified Registry](docs/UNIFIED-REGISTRY.md)** — Registry system for features and userscripts
- **[Manifest Schema](docs/Manifest-Schema.md)** — Bundle manifest.json reference
- **[API Reference](docs/Api-Reference.md)** — TizenPortal JavaScript API
- **[Architecture](docs/Architecture.md)** — System design and structure

### Additional Resources

- **[Getting Started](docs/Getting-Started.md)** — Quick start guide for new users
- **[FAQ](docs/FAQ.md)** — Frequently asked questions
- **[Troubleshooting](docs/Troubleshooting.md)** — Common issues and solutions
- **[Contributing](docs/Contributing.md)** — How to contribute or fork the project
- **[Adblock Bundle](bundles/adblock/README.md)** — Usage guide and performance benchmarks
- **[Audiobookshelf Bundle](bundles/audiobookshelf/README.md)** — Bundle documentation

---

## 🔒 Security

TizenPortal is designed with security as a priority:

- ✅ **Zero vulnerabilities** in dependencies (npm audit)
- ✅ **Comprehensive input sanitization** (XSS prevention)
- ✅ **Secure URL handling** (blocks javascript:, data:, etc.)
- ✅ **Safe DOM manipulation** (no eval or innerHTML with user data)
- ✅ **Regular security audits** (see [Security Guide](docs/Security.md))

**Important:** Userscripts run with full page access. Only enable scripts you trust and have reviewed. See the [Security Guide](docs/Security.md) for details.

---

## 🤝 Compatibility

| Feature | Support Level |
| :--- | :--- |
| **Target OS** | Samsung Tizen 3.0 - 6.5 |
| **Browser Engine** | Chrome 47 - 69 (Tizen's Chromium) |
| **Tested Apps** | ✅ Audiobookshelf |
| **Built-in Bundles** | default, audiobookshelf, adblock |

---

## 🙏 Acknowledgments

This project uses code and inspiration from the following sources:

- **[WICG/spatial-navigation](https://github.com/WICG/spatial-navigation)** — Spatial navigation polyfill (`spatial-navigation-polyfill` npm package), modified with cross-origin guards and UMD wrapper fix
- **[Financial-Times/polyfill-library](https://github.com/Financial-Times/polyfill-library)** — DOMRect polyfill
- **[TizenTube](https://github.com/reisxd/TizenTube)** — Inspiration and approach for Tizen TV compatibility
- **[TizenBrew](https://github.com/reisxd/TizenBrew)** — Module loading platform

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
