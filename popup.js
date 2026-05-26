document.addEventListener("DOMContentLoaded", () => {
    // 1. DOM Elements Binding
    const masterToggle = document.getElementById("masterToggle");
    const masterLabel = document.getElementById("masterLabel");
    
    const blurSlider = document.getElementById("blurSlider");
    const blurVal = document.getElementById("blurVal");
    
    const opacitySlider = document.getElementById("opacitySlider");
    const opacityVal = document.getElementById("opacityVal");
    
    const sensitivitySlider = document.getElementById("sensitivitySlider");
    const sensitivityVal = document.getElementById("sensitivityVal");
    
    const blurMediaToggle = document.getElementById("blurMediaToggle");
    const blurInputsToggle = document.getElementById("blurInputsToggle");
    const blurTextToggle = document.getElementById("blurTextToggle");
    const blurCredentialsToggle = document.getElementById("blurCredentialsToggle");
    const hoverRevealToggle = document.getElementById("hoverRevealToggle");
    
    const domainToggle = document.getElementById("domainToggle");
    const domainDisplay = document.getElementById("domainDisplay");
    
    const presetFrosted = document.getElementById("presetFrosted");
    const presetMidnight = document.getElementById("presetMidnight");
    const presetCyber = document.getElementById("presetCyber");
    const presetPrivacy = document.getElementById("presetPrivacy");
    
    let currentDomain = "";
    
    // Preset Specifications
    const PRESETS = {
        frosted: {
            blurRadius: 12,
            opacity: 15,
            sensitivity: 200,
            colorMode: "frosted"
        },
        midnight: {
            blurRadius: 18,
            opacity: 65,
            sensitivity: 200,
            colorMode: "midnight"
        },
        cyber: {
            blurRadius: 10,
            opacity: 25,
            sensitivity: 200,
            colorMode: "cyber"
        },
        privacy: {
            blurRadius: 25,
            opacity: 90,
            sensitivity: 200,
            colorMode: "privacy",
            blurMedia: true,
            blurInputs: true,
            blurText: true,
            blurCredentials: true,
            hoverReveal: true
        }
    };

    // 2. Fetch Active Tab Domain
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].url) {
            try {
                const url = new URL(tabs[0].url);
                currentDomain = url.hostname;
                
                // Exclude system pages
                if (url.protocol.startsWith("chrome") || url.protocol.startsWith("edge") || currentDomain === "") {
                    domainDisplay.textContent = "Browser System Page";
                    domainToggle.disabled = true;
                    domainToggle.parentElement.style.opacity = "0.5";
                } else {
                    domainDisplay.textContent = currentDomain;
                    loadSettings();
                }
            } catch (e) {
                domainDisplay.textContent = "Local Files / Ext Page";
                domainToggle.disabled = true;
                domainToggle.parentElement.style.opacity = "0.5";
                loadSettings();
            }
        } else {
            domainDisplay.textContent = "No Active Website";
            domainToggle.disabled = true;
            domainToggle.parentElement.style.opacity = "0.5";
            loadSettings();
        }
    });

    // 3. Load Saved Settings
    function loadSettings() {
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
            activePreset: "frosted",
            disabledDomains: []
        }, (data) => {
            // Set Master Toggle UI
            masterToggle.checked = data.masterActive;
            updateMasterLabel(data.masterActive);
            
            // Set Slider Values UI
            blurSlider.value = data.blurRadius;
            blurVal.textContent = `${data.blurRadius}px`;
            
            opacitySlider.value = data.opacity;
            opacityVal.textContent = `${data.opacity}%`;
            
            sensitivitySlider.value = data.sensitivity;
            sensitivityVal.textContent = data.sensitivity;
            
            // Set Features UI
            blurMediaToggle.checked = data.blurMedia;
            blurInputsToggle.checked = data.blurInputs;
            blurTextToggle.checked = data.blurText;
            blurCredentialsToggle.checked = data.blurCredentials;
            hoverRevealToggle.checked = data.hoverReveal;
            
            // Set Domain Toggle UI
            if (currentDomain) {
                const isDisabled = data.disabledDomains.includes(currentDomain);
                domainToggle.checked = !isDisabled;
            }
            
            // Activate corresponding Preset Card UI
            highlightPresetCard(data.activePreset);
        });
    }

    // 4. Update UI labels
    function updateMasterLabel(active) {
        masterLabel.textContent = active ? "Aura Shield Active" : "Aura Shield Suspended";
        masterLabel.style.color = active ? "#ffffff" : "var(--text-muted)";
    }

    function highlightPresetCard(preset) {
        // Clear all active styling
        [presetFrosted, presetMidnight, presetCyber, presetPrivacy].forEach(card => {
            card.classList.remove("active");
        });
        
        // Highlight correct one
        if (preset === "frosted") presetFrosted.classList.add("active");
        else if (preset === "midnight") presetMidnight.classList.add("active");
        else if (preset === "cyber") presetCyber.classList.add("active");
        else if (preset === "privacy") presetPrivacy.classList.add("active");
    }

    // 5. Save Changes to Chrome Storage
    function saveSetting(key, val) {
        chrome.storage.sync.set({ [key]: val });
    }

    // 6. Listen to Events
    
    // Master Toggle
    masterToggle.addEventListener("change", (e) => {
        const active = e.target.checked;
        saveSetting("masterActive", active);
        updateMasterLabel(active);
    });

    // Sliders
    blurSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        blurVal.textContent = `${val}px`;
        saveSetting("blurRadius", val);
        // Clear active preset style since user is customizing
        saveSetting("activePreset", "custom");
        highlightPresetCard("custom");
    });

    opacitySlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        opacityVal.textContent = `${val}%`;
        saveSetting("opacity", val);
        saveSetting("activePreset", "custom");
        highlightPresetCard("custom");
    });

    sensitivitySlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        sensitivityVal.textContent = val;
        saveSetting("sensitivity", val);
        saveSetting("activePreset", "custom");
        highlightPresetCard("custom");
    });

    // Feature Toggles
    blurMediaToggle.addEventListener("change", (e) => {
        saveSetting("blurMedia", e.target.checked);
    });

    blurInputsToggle.addEventListener("change", (e) => {
        saveSetting("blurInputs", e.target.checked);
    });

    blurTextToggle.addEventListener("change", (e) => {
        saveSetting("blurText", e.target.checked);
    });

    blurCredentialsToggle.addEventListener("change", (e) => {
        saveSetting("blurCredentials", e.target.checked);
    });

    hoverRevealToggle.addEventListener("change", (e) => {
        saveSetting("hoverReveal", e.target.checked);
    });

    // Domain Whitelist/Blacklist Toggle
    domainToggle.addEventListener("change", (e) => {
        if (!currentDomain) return;
        
        chrome.storage.sync.get({ disabledDomains: [] }, (data) => {
            let disabledList = data.disabledDomains;
            const activeOnDomain = e.target.checked;
            
            if (activeOnDomain) {
                // Enabled: remove from disabled list
                disabledList = disabledList.filter(d => d !== currentDomain);
            } else {
                // Disabled: add to disabled list if not present
                if (!disabledList.includes(currentDomain)) {
                    disabledList.push(currentDomain);
                }
            }
            saveSetting("disabledDomains", disabledList);
        });
    });

    // Preset Clicks Bindings
    function applyPreset(presetKey) {
        const p = PRESETS[presetKey];
        if (!p) return;

        // Apply sliders state in DOM & save to storage
        blurSlider.value = p.blurRadius;
        blurVal.textContent = `${p.blurRadius}px`;
        saveSetting("blurRadius", p.blurRadius);

        opacitySlider.value = p.opacity;
        opacityVal.textContent = `${p.opacity}%`;
        saveSetting("opacity", p.opacity);

        sensitivitySlider.value = p.sensitivity;
        sensitivityVal.textContent = p.sensitivity;
        saveSetting("sensitivity", p.sensitivity);

        saveSetting("colorMode", p.colorMode);
        saveSetting("activePreset", presetKey);
        highlightPresetCard(presetKey);

        // If preset has specific features, update them too
        if (p.blurMedia !== undefined) {
            blurMediaToggle.checked = p.blurMedia;
            saveSetting("blurMedia", p.blurMedia);
        } else {
            blurMediaToggle.checked = false;
            saveSetting("blurMedia", false);
        }
        if (p.blurInputs !== undefined) {
            blurInputsToggle.checked = p.blurInputs;
            saveSetting("blurInputs", p.blurInputs);
        } else {
            blurInputsToggle.checked = false;
            saveSetting("blurInputs", false);
        }
        if (p.blurText !== undefined) {
            blurTextToggle.checked = p.blurText;
            saveSetting("blurText", p.blurText);
        } else {
            blurTextToggle.checked = false;
            saveSetting("blurText", false);
        }
        if (p.blurCredentials !== undefined) {
            blurCredentialsToggle.checked = p.blurCredentials;
            saveSetting("blurCredentials", p.blurCredentials);
        } else {
            blurCredentialsToggle.checked = false;
            saveSetting("blurCredentials", false);
        }
        if (p.hoverReveal !== undefined) {
            hoverRevealToggle.checked = p.hoverReveal;
            saveSetting("hoverReveal", p.hoverReveal);
        }
    }

    presetFrosted.addEventListener("click", () => applyPreset("frosted"));
    presetMidnight.addEventListener("click", () => applyPreset("midnight"));
    presetCyber.addEventListener("click", () => applyPreset("cyber"));
    presetPrivacy.addEventListener("click", () => applyPreset("privacy"));
});