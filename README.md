# 🌌 AuraBlur: Glassmorphic & Privacy Shield

A premium, modern browser extension designed to elevate your web experience with beautiful dynamic glassmorphism overlays and customizable sensitive content privacy masks.

<p align="center">
  <img src="icon-128.png" alt="AuraBlur Logo" width="128" height="128">
</p>

---

## ✨ Features

### 🎨 1. Aura Glassmorphism Customizer
Transform harsh, stark-white web pages and bright layout sections into sleek, premium frosted-glass interfaces in real-time.
* **Vibrant & Light Color Detection**: Automatically detects light backgrounds and vibrant primary colors (like hot pink, cyan, and pastels) and applies glassmorphic styling.
* **Customizer Sliders**:
  * **Blur Radius**: Fine-tune the background frosted glass blur from `0px` to `30px`.
  * **Backdrop Opacity**: Control the glass backing sheet's transparency from `0%` to `100%`.
  * **Detection Sensitivity**: Adjust how aggressively the extension targets bright layout blocks.

### 🛡️ 2. Privacy Guard (Mask & Reveal)
Protect your screen from shoulder surfers and accidental exposure of sensitive details.
* **Blur Images & Videos**: Mask all media containers until you hover over them.
* **Blur Input Fields**: Hide active forms, credit card entries, and search bars.
* **Blur Reading Text**: Conceal articles, paragraphs, and blockquotes behind clean frosted bars.
* **Sensitive Credentials Mask**: Intelligently identifies and blurs emails, credit card formats, phone numbers, and financial balances using a local regex engine.
* **Hover to Reveal**: Seamlessly reveal any blurred element temporarily by hovering your cursor over it.

### 🎭 3. Visual Presets
Choose from four beautifully crafted, preset styling models with one click:
* ❄️ **Frosted**: Classic white glass with light specular reflections.
* 🌙 **Midnight**: Dark, obsidian glassmorphism for a high-end dark mode look.
* 🌌 **Cyber Neon**: Hyper-glowing violet neon glass style.
* 🛡️ **Privacy**: Instant full-mask privacy layout with all blur options engaged.

### 🚀 4. Site-Specific Whitelisting
Enable or disable AuraBlur on a per-site basis instantly using the integrated control panel toggle.

---

## 📁 File Structure

The project has been streamlined and optimized to contain only the necessary, high-performance files:
```text
AuraBlur/
├── content.js         # Core privacy & color detection engine
├── manifest.json      # Extension permissions, scripts, and asset mappings
├── popup.html         # Control panel structural layout
├── popup.js           # Interactive UI settings controller
├── styles.css         # CSS classes for glassmorphic styling and masks
├── icon-16.png        # Extension toolbar icon (16x16)
├── icon-32.png        # High-DPI screen icon (32x32)
├── icon-48.png        # Management page icon (48x48)
└── icon-128.png       # Web Store listing icon (128x128)
```

---

## 🛠️ Local Installation (Developer Mode)

To run AuraBlur locally on your browser completely for free:

1. Clone or download this repository as a `.zip` file and extract it.
2. Open your browser's extension manager:
   * **Chrome**: Go to `chrome://extensions`
   * **Edge**: Go to `edge://extensions`
3. Toggle the **"Developer Mode"** switch in the top-right corner.
4. Click the **"Load unpacked"** button in the top-left.
5. Select the folder containing these files.
6. Open the extension, configure your settings, and enjoy!

---

## 🔒 Privacy First

AuraBlur is built with an offline-first architecture to guarantee your privacy:
* **Zero Data Collection**: We do not collect, store, or transmit any browsing history, credentials, or personal information.
* **100% Local Processing**: All content scanning and masking run inside your browser's local memory—no external API requests are ever made.
