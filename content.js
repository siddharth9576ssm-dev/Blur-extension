/* AuraBlur Core Content Engine */

(function () {
    let observer = null;
    let settingsCache = {};
    const scheduleTask = window.requestIdleCallback || window.requestAnimationFrame || ((cb) => setTimeout(cb, 16));

    // Regular expression to identify emails, credit card shapes, phone numbers, and balances
    const credRegex = /(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(?:\b(?:\d[ -]*?){13,16}\b)|(?:\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})|(?:\$|£|€|¥|₹)\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/;

    // 1. Precise RGBA parser
    function parseRgba(rgbaString) {
        if (!rgbaString) return null;
        
        // Support rgb(...) and rgba(...) color strings
        const matches = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!matches) return null;
        
        return {
            r: parseInt(matches[1], 10),
            g: parseInt(matches[2], 10),
            b: parseInt(matches[3], 10),
            a: matches[4] !== undefined ? parseFloat(matches[4]) : 1.0
        };
    }

    // 2. Evaluate if color is considered light or highly vibrant based on sensitivity threshold
    function isLightColor(bg, sensitivity) {
        const color = parseRgba(bg);
        if (!color) return false;
        
        // If color is highly transparent, it's virtually invisible (e.g., alpha < 0.1), skip it
        if (color.a < 0.1) return false;
        
        // Check if any of the primary color channels (R, G, B) meet the brightness threshold.
        // This allows vibrant saturated colors (like hot pink, bright yellow, or electric cyan) to be styled
        // while safely ignoring dark colors (like black, dark brown, or dark grey).
        return (Math.max(color.r, color.g, color.b) >= sensitivity);
    }

    // 3. Scan a specific element for white areas
    function scanElement(el, sensitivity, active) {
        if (!active) {
            el.classList.remove("aura-blur-active");
            return;
        }

        // Avoid scanning scripts, styles, templates
        if (el.matches("script, style, link, template, meta, noscript")) return;

        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        
        if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
            if (isLightColor(bg, sensitivity)) {
                el.classList.add("aura-blur-active");
            } else {
                el.classList.remove("aura-blur-active");
            }
        }
    }

    // 4. Privacy Media blurring
    function scanMedia(root = document, active, hoverReveal) {
        const elements = root === document 
            ? document.querySelectorAll("img, video, iframe, canvas, svg") 
            : root.querySelectorAll("img, video, iframe, canvas, svg");
            
        // Check if root itself is a media element
        const allMedia = (root !== document && root.matches("img, video, iframe, canvas, svg"))
            ? [root, ...elements]
            : elements;

        allMedia.forEach(el => {
            if (active) {
                el.classList.add("aura-privacy-media");
                if (hoverReveal) {
                    el.classList.add("aura-hover-reveal");
                } else {
                    el.classList.remove("aura-hover-reveal");
                }
            } else {
                el.classList.remove("aura-privacy-media");
                el.classList.remove("aura-hover-reveal");
            }
        });
    }

    // 5. Privacy Form / Inputs blurring
    function scanInputs(root = document, active, hoverReveal) {
        const elements = root === document 
            ? document.querySelectorAll("input, textarea, [contenteditable]") 
            : root.querySelectorAll("input, textarea, [contenteditable]");
            
        // Check if root itself is an input element
        const allInputs = (root !== document && root.matches("input, textarea, [contenteditable]"))
            ? [root, ...elements]
            : elements;

        allInputs.forEach(el => {
            // Skip buttons, toggles, checkboxes
            if (el.matches("input[type='button'], input[type='submit'], input[type='checkbox'], input[type='radio'], input[type='image'], input[type='file']")) return;
            
            if (active) {
                el.classList.add("aura-privacy-input");
                if (hoverReveal) {
                    el.classList.add("aura-hover-reveal");
                } else {
                    el.classList.remove("aura-hover-reveal");
                }
            } else {
                el.classList.remove("aura-privacy-input");
                el.classList.remove("aura-hover-reveal");
            }
        });
    }

    // 5b. Privacy Text Blurring
    function scanText(root = document, active, hoverReveal) {
        const elements = root === document 
            ? document.querySelectorAll("p, li, blockquote, pre, h1, h2, h3, h4, h5, h6, span, div") 
            : root.querySelectorAll("p, li, blockquote, pre, h1, h2, h3, h4, h5, h6, span, div");
            
        const allText = (root !== document && root.matches("p, li, blockquote, pre, h1, h2, h3, h4, h5, h6, span, div"))
            ? [root, ...elements]
            : elements;

        allText.forEach(el => {
            // If it is a span or div, it MUST be a leaf node (no children) to avoid blurring large layout containers
            if ((el.tagName === "SPAN" || el.tagName === "DIV") && el.children.length > 0) return;
            
            const text = el.textContent.trim();
            if (!text) return;

            if (active) {
                el.classList.add("aura-privacy-text");
                if (hoverReveal) {
                    el.classList.add("aura-hover-reveal");
                } else {
                    el.classList.remove("aura-hover-reveal");
                }
            } else {
                el.classList.remove("aura-privacy-text");
                el.classList.remove("aura-hover-reveal");
            }
        });
    }

    // 5c. Privacy Credentials Blurring (looks for emails, phone numbers, balance symbols, card patterns)
    function scanCredentials(root = document, active, hoverReveal) {
        const elements = root === document 
            ? document.querySelectorAll("span, td, a, div, p") 
            : root.querySelectorAll("span, td, a, div, p");
            
        const allItems = (root !== document && root.matches("span, td, a, div, p"))
            ? [root, ...elements]
            : elements;

        allItems.forEach(el => {
            // Target leaf nodes containing text directly (no child elements to prevent blurring huge parent blocks)
            if (el.children.length > 0) return;

            const text = el.textContent.trim();
            if (!text) return;

            if (active && credRegex.test(text)) {
                el.classList.add("aura-privacy-credential");
                if (hoverReveal) {
                    el.classList.add("aura-hover-reveal");
                } else {
                    el.classList.remove("aura-hover-reveal");
                }
            } else {
                el.classList.remove("aura-privacy-credential");
                el.classList.remove("aura-hover-reveal");
            }
        });
    }

    // 6. Dynamic CSS variables injector (adjusts style instantly with no page redraws)
    function injectCssVariables(blurRadius, opacity, colorMode) {
        let styleEl = document.getElementById("aura-variables-style");
        if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = "aura-variables-style";
            document.head.appendChild(styleEl);
        }
        
        let rgbColor = "255, 255, 255"; // Default Frosted (white glass)
        if (colorMode === "midnight") {
            rgbColor = "8, 5, 20";      // Obsidian black glass
        } else if (colorMode === "cyber") {
            rgbColor = "88, 10, 160";   // Cyber neon violet glass
        } else if (colorMode === "privacy") {
            rgbColor = "100, 100, 105";  // Matte grey mask
        }
        
        styleEl.textContent = `
            :root {
                --aura-blur-amount: ${blurRadius}px !important;
                --aura-bg-color: rgba(${rgbColor}, ${opacity / 100}) !important;
                --aura-privacy-blur: ${blurRadius * 1.5}px !important;
            }
        `;
    }

    // 7. Check if extension should run on the current site
    function isAuraActive(settings) {
        const currentHost = window.location.hostname;
        const isDomainDisabled = settings.disabledDomains && settings.disabledDomains.includes(currentHost);
        return settings.masterActive && !isDomainDisabled;
    }

    // 8. Fully deactivate Aura effect and cleanup variables
    function deactivateAura() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }

        // Clean up classes
        document.querySelectorAll(".aura-blur-active").forEach(el => el.classList.remove("aura-blur-active"));
        document.querySelectorAll(".aura-privacy-media").forEach(el => el.classList.remove("aura-privacy-media"));
        document.querySelectorAll(".aura-privacy-input").forEach(el => el.classList.remove("aura-privacy-input"));
        document.querySelectorAll(".aura-privacy-text").forEach(el => el.classList.remove("aura-privacy-text"));
        document.querySelectorAll(".aura-privacy-credential").forEach(el => el.classList.remove("aura-privacy-credential"));
        document.querySelectorAll(".aura-hover-reveal").forEach(el => el.classList.remove("aura-hover-reveal"));

        // Remove CSS style tag
        const styleEl = document.getElementById("aura-variables-style");
        if (styleEl) styleEl.remove();
    }

    // 9. MutationObserver for dynamically loaded AJAX / React nodes
    function startObserver(sensitivity) {
        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver((mutations) => {
            scheduleTask(() => {
                // If inactive while observer triggers, exit immediately
                if (!isAuraActive(settingsCache)) return;

                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Scan node itself
                            scanElement(node, sensitivity, true);
                            
                            // Query and scan standard container elements
                            const containers = node.querySelectorAll("div, section, article, nav, header, footer, main, aside, form, ul, ol, li");
                            containers.forEach(el => scanElement(el, sensitivity, true));
                            
                            // Apply Privacy Mode elements in this node if configured
                            if (settingsCache.blurMedia) {
                                scanMedia(node, true, settingsCache.hoverReveal);
                            }
                            if (settingsCache.blurInputs) {
                                scanInputs(node, true, settingsCache.hoverReveal);
                            }
                            if (settingsCache.blurText) {
                                scanText(node, true, settingsCache.hoverReveal);
                            }
                            if (settingsCache.blurCredentials) {
                                scanCredentials(node, true, settingsCache.hoverReveal);
                            }
                        }
                    });
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 10. Core Apply Settings function
    function applySettings() {
        if (!isAuraActive(settingsCache)) {
            deactivateAura();
            return;
        }

        // 1. Inject root variables
        injectCssVariables(settingsCache.blurRadius, settingsCache.opacity, settingsCache.colorMode);

        // 2. Perform page elements scanning (containers instead of * for 50x performance)
        const containers = document.querySelectorAll("div, section, article, nav, header, footer, main, aside, form, ul, ol, li, body");
        containers.forEach(el => scanElement(el, settingsCache.sensitivity, true));

        // 3. Perform Privacy Guard scanning
        scanMedia(document, settingsCache.blurMedia, settingsCache.hoverReveal);
        scanInputs(document, settingsCache.blurInputs, settingsCache.hoverReveal);
        scanText(document, settingsCache.blurText, settingsCache.hoverReveal);
        scanCredentials(document, settingsCache.blurCredentials, settingsCache.hoverReveal);

        // 4. Arm MutationObserver for new elements
        startObserver(settingsCache.sensitivity);
    }

    // 11. Fetch Settings & Init
    function init() {
        chrome.storage.sync.get({
            masterActive: true,
            blurRadius: 10,
            opacity: 20,
            sensitivity: 200,
            blurMedia: false,
            blurInputs: false,
            blurText: false,
            blurCredentials: false,
            hoverReveal: true,
            colorMode: "frosted",
            disabledDomains: []
        }, (data) => {
            settingsCache = data;
            applySettings();
        });
    }

    // 12. Listen to Settings changes in real-time across tabs
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== "sync") return;

        let needsReapply = false;
        
        for (const key in changes) {
            if (changes[key].newValue !== undefined) {
                settingsCache[key] = changes[key].newValue;
                needsReapply = true;
            }
        }

        if (needsReapply) {
            applySettings();
        }
    });

    // 13. DOM Bootloader
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();