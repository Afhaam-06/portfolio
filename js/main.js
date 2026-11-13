/**
 * POKÉDEX PORTFOLIO — INTERACTIVE 3D ENGINE
 * Mohammed Afhaam | 2nd-Year CSE Undergrad
 */

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const stage = document.getElementById('stage');
    const device3D = document.getElementById('device-3d');
    const dexShell = document.getElementById('dex-shell');
    const panelRight = document.getElementById('panel-right');
    const leftMonitor = document.getElementById('left-monitor');
    const rightMonitor = document.getElementById('right-monitor');
    const cardEntryCounter = document.getElementById('card-entry-counter');

    // Controls & Hitboxes
    const closedHitbox = document.getElementById('closed-hitbox');
    const latchTriggerBtn = document.getElementById('latch-trigger-btn');
    const closeDexBtn = document.getElementById('close-dex-btn');
    const soundBtn = document.getElementById('sound-btn');
    const soundIcon = document.getElementById('sound-icon');
    const soundText = document.getElementById('sound-text');
    const dexAudio = document.getElementById('dex-audio');
    const mobilePanelToggle = document.getElementById('mobile-panel-toggle');
    const mobileToggleText = document.getElementById('mobile-toggle-text');
    const mobileToggleIcon = document.getElementById('mobile-toggle-icon');

    // Section Tabs and Cards
    const cartridgeTabs = [...document.querySelectorAll('.tab-cartridge')];
    const cards = [...document.querySelectorAll('.pokemon-tcg-card')];
    let activeCardIndex = 0;
    let isOpeningOrOpen = false;
    let isMobileCardView = false;

    // Hardware Buttons
    const leftActionBtn = document.getElementById('left-action-btn');
    const hardwarePrevBtn = document.getElementById('hardware-prev-btn');
    const hardwareNextBtn = document.getElementById('hardware-next-btn');
    const dpadButtons = document.querySelectorAll('.dpad-key');

    // Quick links and Skill tags
    const typePills = document.querySelectorAll('.type-pill');
    const trainerJumpBtns = document.querySelectorAll('.trainer-jump-btn');
    const cardFlowBtns = document.querySelectorAll('.card-flow-btn');

    // =========================================================================
    // 1. WEB AUDIO API SYNTHESIZER (8-bit Pokédex Sounds)
    // =========================================================================
    let audioCtx = null;
    let isSoundEnabled = true;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playBeep(freq, type = 'square', duration = 0.08, gainVal = 0.12) {
        if (!isSoundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(gainVal, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (_) {}
    }

    function playLatchSound() {
        if (!isSoundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            // Mechanical double click
            playBeep(440, 'triangle', 0.04, 0.2);
            setTimeout(() => playBeep(880, 'sine', 0.09, 0.15), 50);
        } catch (_) {}
    }

    function playBootSound() {
        if (!isSoundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            // Classic Pokémon Boot Chime: G4 -> C5 -> E5 -> G5
            const notes = [392, 523.25, 659.25, 783.99];
            notes.forEach((freq, idx) => {
                setTimeout(() => playBeep(freq, 'triangle', 0.14, 0.16), idx * 80);
            });
        } catch (_) {}
    }

    function playCardSound() {
        if (!isSoundEnabled) return;
        playBeep(659.25, 'sine', 0.06, 0.12);
        setTimeout(() => playBeep(987.77, 'sine', 0.08, 0.1), 40);
    }

    // Toggle Music & Audio
    function toggleSound() {
        isSoundEnabled = !isSoundEnabled;
        getAudioContext();
        if (soundBtn) soundBtn.setAttribute('aria-pressed', String(isSoundEnabled));

        if (isSoundEnabled) {
            soundIcon.textContent = '🔊';
            soundText.textContent = 'SOUND: ON';
            if (body.classList.contains('opened')) {
                dexAudio.play().catch(() => {});
            }
            playBeep(587.33, 'triangle', 0.1, 0.15);
        } else {
            soundIcon.textContent = '🔈';
            soundText.textContent = 'SOUND: OFF';
            dexAudio.pause();
        }
    }

    if (soundBtn) {
        soundBtn.addEventListener('click', toggleSound);
    }

    // =========================================================================
    // 2. REAL 3D CLAMSHELL POKÉDEX OPENING & CLOSING
    // Physical cover swings 180° on central hinge axis
    // =========================================================================
    function openPokedex(targetIndex = null) {
        if (isOpeningOrOpen) {
            if (targetIndex !== null) {
                switchCard(targetIndex);
            }
            return;
        }
        isOpeningOrOpen = true;

        // Reset any mouse tilt during opening so it glides smoothly
        if (stage) {
            stage.style.setProperty('--tilt-x', '0deg');
            stage.style.setProperty('--tilt-y', '0deg');
        }

        // 1. Play unlatch audio
        getAudioContext();
        playLatchSound();

        // Start the theme inside the opening click so browsers permit audio.
        if (isSoundEnabled) {
            dexAudio.currentTime = 0;
            dexAudio.play().catch(() => {});
        }

        // 2. Begin physical 3D clamshell unfolding animation
        body.classList.remove('closed-state');
        body.classList.add('opening');

        // During physical opening, monitors stay off
        leftMonitor.classList.add('screen-off');
        rightMonitor.classList.add('screen-off');

        // If user requested a specific section (e.g. About or Skills), prepare it
        if (targetIndex !== null) {
            switchCard(targetIndex, true);
        }

        // 3. Timed Boot-Up: Wait for 3D clamshell cover to fully swing open
        setTimeout(() => {
            body.classList.remove('opening');
            body.classList.add('opened');

            // CRT Screen Power-Up flash & boot chime
            leftMonitor.classList.add('powering-up');
            rightMonitor.classList.add('powering-up');
            playBootSound();

            if (isSoundEnabled) {
                dexAudio.play().catch(() => {});
            }

            // Power on the monitors and show information
            setTimeout(() => {
                leftMonitor.classList.remove('screen-off');
                rightMonitor.classList.remove('screen-off');
                body.classList.add('powered-on');

                // Clear flash state
                setTimeout(() => {
                    leftMonitor.classList.remove('powering-up');
                    rightMonitor.classList.remove('powering-up');
                }, 400);
            }, 250);

        }, 1150); // Matches the 1.15s CSS clamshell transition
    }

    function closePokedex() {
        if (!isOpeningOrOpen) return;
        isOpeningOrOpen = false;

        if (stage) {
            stage.style.setProperty('--tilt-x', '0deg');
            stage.style.setProperty('--tilt-y', '0deg');
        }

        // Instant monitor power-down
        body.classList.remove('powered-on');
        leftMonitor.classList.add('screen-off');
        rightMonitor.classList.add('screen-off');

        // Stop the boot theme while the dex is shut; it restarts on next open.
        if (dexAudio) {
            dexAudio.pause();
            dexAudio.currentTime = 0;
        }

        playBeep(220, 'sawtooth', 0.1, 0.15);

        // Fold physical cover back over left panel into closed state
        setTimeout(() => {
            body.classList.remove('opened');
            body.classList.add('closed-state');
        }, 80);
    }

    // Open Listeners on Cover
    if (closedHitbox) closedHitbox.addEventListener('click', () => openPokedex());
    if (latchTriggerBtn) latchTriggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openPokedex();
    });
    if (closeDexBtn) closeDexBtn.addEventListener('click', closePokedex);

    // =========================================================================
    // 3. CARD NAVIGATION & SEAMLESS SWITCHING
    // Ensures About, Skills, Projects, Contact are 100% clickable & responsive
    // =========================================================================
    function switchCard(newIndex, force = false) {
        if (newIndex < 0) newIndex = cards.length - 1;
        if (newIndex >= cards.length) newIndex = 0;

        // If user clicked the already active card: give immediate tactile feedback
        if (newIndex === activeCardIndex && !force) {
            playBeep(659.25, 'sine', 0.05, 0.1);
            const activeCard = cards[activeCardIndex];
            if (activeCard) {
                const shine = activeCard.querySelector('.card-holo-shine');
                if (shine) {
                    shine.style.animation = 'none';
                    void shine.offsetWidth;
                    shine.style.animation = 'holoSwipe 4s ease-in-out infinite alternate';
                }
            }
            return;
        }

        playCardSound();

        // 1. Update Cartridge Tabs (on right panel)
        cartridgeTabs.forEach((tab, idx) => {
            const isMatch = idx === newIndex;
            tab.classList.toggle('active', isMatch);
            tab.setAttribute('aria-selected', isMatch ? 'true' : 'false');
            tab.tabIndex = isMatch ? 0 : -1;
        });

        // 2. Update Trading Cards with smooth switch
        cards.forEach((card, idx) => {
            if (idx === newIndex) {
                card.hidden = false;
                // Force reflow for clean CSS transition
                void card.offsetWidth;
                card.classList.add('active');
            } else {
                card.classList.remove('active');
                card.hidden = true;
            }
        });

        activeCardIndex = newIndex;

        // 4. Update entry counter: 001 to 004
        const padNum = String(activeCardIndex + 1).padStart(3, '0');
        if (cardEntryCounter) cardEntryCounter.textContent = padNum;

        // 5. On mobile screens: show card panel automatically
        if (window.innerWidth <= 900) {
            showMobilePanel(true);
        }
    }

    // Cartridge Tabs Clicks (Inside right panel)
    cartridgeTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const target = parseInt(tab.dataset.target, 10);
            switchCard(target);
        });
    });

    // Left Trainer Card Skill Chips (Clicking Python, Java, etc. opens Skills)
    typePills.forEach((pill) => {
        pill.addEventListener('click', () => {
            const target = parseInt(pill.dataset.target, 10);
            switchCard(target);
        });
    });

    // Trainer Card Direct Jump Buttons
    trainerJumpBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = parseInt(btn.dataset.target, 10);
            switchCard(target);
        });
    });

    // Card Flow Buttons (About -> Skills -> Projects -> Contact)
    cardFlowBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = parseInt(btn.dataset.target, 10);
            switchCard(target);
        });
    });

    // Hardware Controls on Left Panel
    if (leftActionBtn) {
        leftActionBtn.addEventListener('click', () => switchCard(activeCardIndex + 1));
    }
    if (hardwarePrevBtn) {
        hardwarePrevBtn.addEventListener('click', () => switchCard(activeCardIndex - 1));
    }
    if (hardwareNextBtn) {
        hardwareNextBtn.addEventListener('click', () => switchCard(activeCardIndex + 1));
    }

    // D-Pad Navigation
    dpadButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const step = parseInt(btn.dataset.step, 10) || 1;
            switchCard(activeCardIndex + step);
        });
    });

    // Mobile Panel View Toggle (For screen widths <= 900px)
    function showMobilePanel(isCard) {
        isMobileCardView = isCard;
        if (isMobileCardView) {
            body.classList.add('mobile-card-active');
            if (mobileToggleText) mobileToggleText.textContent = 'PROFILE';
            if (mobileToggleIcon) mobileToggleIcon.textContent = '👤';
        } else {
            body.classList.remove('mobile-card-active');
            if (mobileToggleText) mobileToggleText.textContent = 'VIEW CARD';
            if (mobileToggleIcon) mobileToggleIcon.textContent = '🎴';
        }
    }

    if (mobilePanelToggle) {
        mobilePanelToggle.addEventListener('click', () => {
            if (!isOpeningOrOpen) {
                openPokedex();
                showMobilePanel(true);
            } else {
                showMobilePanel(!isMobileCardView);
                playBeep(520, 'sine', 0.05, 0.1);
            }
        });
    }

    // Keyboard Shortcuts
    const isEditableTarget = (target) => (
        target instanceof Element
        && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
    );

    window.addEventListener('keydown', (e) => {
        // Never hijack keys while someone is typing in the contact form.
        if (isEditableTarget(e.target)) return;

        if (!isOpeningOrOpen) {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                openPokedex();
            }
            return;
        }

        if (e.code === 'Escape') {
            e.preventDefault();
            closePokedex();
            return;
        }

        // Direct number keys 1-4 for sections
        if (e.key === '1') { switchCard(0); return; }
        if (e.key === '2') { switchCard(1); return; }
        if (e.key === '3') { switchCard(2); return; }
        if (e.key === '4') { switchCard(3); return; }

        if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
            e.preventDefault();
            switchCard(activeCardIndex + 1);
        } else if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
            e.preventDefault();
            switchCard(activeCardIndex - 1);
        }
    });

    // =========================================================================
    // 4. PROJECTS CAROUSEL (Inside Water Card #3)
    // =========================================================================
    const projectData = [
        {
            title: "AI Token Counter",
            category: "BROWSER EXTENSION",
            image: "assets/images/projects/token-counter.png",
            moveTitle: "Token Stream",
            moveDamage: "120",
            moveDesc: "Counts tokens locally in browser with a bundled o200k_base tokenizer. Zero server latency and complete user privacy. Tracks rate limits with visual load bars on Claude, ChatGPT & Gemini.",
            github: "https://github.com/Afhaam-06/AI-token-counter"
        },
        {
            title: "Budget Alert Tracker",
            category: "FULL STACK APP",
            image: "assets/images/projects/expense-budget.png",
            moveTitle: "Threshold Alert",
            moveDamage: "100",
            moveDesc: "Automated expense tracker with dynamic budget thresholds and instant alerts. Built with automated test suites and robust input validation to keep personal finances in check.",
            github: "https://github.com/Afhaam-06"
        },
        {
            title: "Python RPG Battle Engine",
            category: "GAME ARCHITECTURE",
            image: "assets/images/projects/rpg-demo.gif",
            moveTitle: "Turn-Based Combat",
            moveDamage: "140",
            moveDesc: "Classic turn-based RPG battle engine built in Python. Implements Object-Oriented game loops, battle calculations, item inventories, and dynamic enemy AI decision trees.",
            github: "https://github.com/Afhaam-06"
        }
    ];

    const projPills = document.querySelectorAll('.proj-nav-pill');
    const projCardName = document.getElementById('proj-card-name');
    const projCurrentImg = document.getElementById('proj-current-img');
    const projCategoryTag = document.getElementById('proj-category-tag');
    const projMoveTitle = document.getElementById('proj-move-title');
    const projMoveDesc = document.getElementById('proj-move-desc');
    const projGithubLink = document.getElementById('proj-github-link');

    projPills.forEach((pill) => {
        pill.addEventListener('click', () => {
            const idx = parseInt(pill.dataset.proj, 10);
            const proj = projectData[idx];
            if (!proj) return;

            playBeep(784, 'sine', 0.05, 0.1);

            projPills.forEach((p) => p.classList.remove('active'));
            pill.classList.add('active');

            if (projCardName) projCardName.textContent = proj.title;
            if (projCurrentImg) {
                projCurrentImg.src = proj.image;
                projCurrentImg.alt = `${proj.title} Screenshot`;
            }
            if (projCategoryTag) projCategoryTag.textContent = proj.category;
            if (projMoveTitle) projMoveTitle.textContent = proj.moveTitle;
            if (projMoveDesc) projMoveDesc.textContent = proj.moveDesc;
            if (projGithubLink) projGithubLink.href = proj.github;
        });
    });

    // =========================================================================
    // 5. CONTACT FORM — EMAILJS DELIVERY WITH EMAIL-APP FALLBACK
    // =========================================================================
    const contactForm = document.getElementById('contact-form');
    const contactName = document.getElementById('contact-name');
    const contactReach = document.getElementById('contact-reach');
    const contactMessage = document.getElementById('contact-message');
    const contactSend = document.getElementById('contact-send');
    const contactStatus = document.getElementById('contact-status');
    const contactMailto = document.getElementById('contact-mailto');
    const contactHoneypot = contactForm?.querySelector('.console-honeypot');

    const emailConfig = window.EMAILJS_CONFIG || {};
    const emailJsReady = Boolean(
        emailConfig.publicKey && emailConfig.serviceId && emailConfig.templateId
    );
    const portfolioEmail = emailConfig.toEmail || 'mohammedafhaam15@gmail.com';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function isEmail(value) {
        return emailPattern.test(value);
    }

    function isPhone(value) {
        return /^\+?\d{7,15}$/.test(value.replace(/[\s().-]/g, ''));
    }

    function buildMailto(name, reach, message) {
        const subject = name ? `Portfolio message from ${name}` : 'Portfolio message';
        const body = [
            `Name: ${name || '(not provided)'}`,
            `Contact: ${reach || '(not provided)'}`,
            '',
            message || ''
        ].join('\n');
        return `mailto:${portfolioEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    function syncMailtoLink() {
        if (!contactMailto) return;
        const values = [
            contactName?.value.trim(),
            contactReach?.value.trim(),
            contactMessage?.value.trim()
        ];
        contactMailto.href = values.some(Boolean)
            ? buildMailto(...values)
            : `mailto:${portfolioEmail}`;
    }

    function setContactStatus(text, state = '') {
        if (!contactStatus) return;
        contactStatus.textContent = text;
        contactStatus.classList.remove('is-sending', 'is-success', 'is-error');
        if (state) contactStatus.classList.add(`is-${state}`);
    }

    const contactFields = [contactName, contactReach, contactMessage].filter(Boolean);

    contactFields.forEach((field) => {
        field.addEventListener('input', () => {
            field.classList.remove('invalid');
            if (contactStatus?.classList.contains('is-error')) {
                setContactStatus('READY');
            }
            syncMailtoLink();
        });
    });

    if (contactMessage) {
        contactMessage.addEventListener('keydown', (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault();
                contactForm?.requestSubmit();
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Honeypot filled = bot; pretend everything is fine.
            if (contactHoneypot?.value) {
                setContactStatus('MESSAGE SENT', 'success');
                return;
            }

            const name = contactName?.value.trim() || '';
            const reach = contactReach?.value.trim() || '';
            const message = contactMessage?.value.trim() || '';

            const problems = [];
            if (name.length < 2) {
                contactName?.classList.add('invalid');
                problems.push(contactName);
            }
            if (!isEmail(reach) && !isPhone(reach)) {
                contactReach?.classList.add('invalid');
                problems.push(contactReach);
            }
            if (message.length < 2) {
                contactMessage?.classList.add('invalid');
                problems.push(contactMessage);
            }

            if (problems.length) {
                setContactStatus('CHECK THE FIELDS', 'error');
                problems[0]?.focus();
                return;
            }

            const mailtoUrl = buildMailto(name, reach, message);
            if (contactMailto) contactMailto.href = mailtoUrl;

            // No EmailJS keys yet: hand off to the visitor's email app.
            if (!emailJsReady) {
                setContactStatus('OPENING EMAIL APP…', 'sending');
                window.location.href = mailtoUrl;
                setContactStatus('EMAIL APP OPENED', 'success');
                return;
            }

            setContactStatus('TRANSMITTING…', 'sending');
            if (contactSend) contactSend.disabled = true;

            try {
                const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        service_id: emailConfig.serviceId,
                        template_id: emailConfig.templateId,
                        user_id: emailConfig.publicKey,
                        template_params: {
                            from_name: name,
                            contact: reach,
                            reply_to: isEmail(reach) ? reach : portfolioEmail,
                            message,
                            subject: `Portfolio message from ${name}`,
                            to_email: portfolioEmail,
                            sent_at: new Date().toLocaleString()
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                setContactStatus('MESSAGE SENT ✓', 'success');
                contactForm.reset();
                contactFields.forEach((field) => field.classList.remove('invalid'));
                if (contactMailto) contactMailto.href = `mailto:${portfolioEmail}`;
            } catch (error) {
                setContactStatus('FAILED — EMAIL APP', 'error');
                // EmailJS unreachable/blocked: still get the message to Afhaam.
                window.location.href = mailtoUrl;
            } finally {
                if (contactSend) contactSend.disabled = false;
            }
        });
    }

    // =========================================================================
    // 6. SUBTLE 3D TILT WITH MOUSE (Tactile Hardware Depth via CSS Variables)
    // =========================================================================
    if (stage && device3D) {
        stage.addEventListener('mousemove', (e) => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            if (body.classList.contains('opening')) return;

            // Keep the device stable while the visitor is typing a message.
            const focused = document.activeElement;
            if (focused && focused.matches('input, textarea, select')) return;

            const rect = stage.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            if (body.classList.contains('closed-state')) {
                const tiltX = (y * -7).toFixed(2) + 'deg';
                const tiltY = (x * 9).toFixed(2) + 'deg';
                stage.style.setProperty('--tilt-x', tiltX);
                stage.style.setProperty('--tilt-y', tiltY);
            } else if (body.classList.contains('opened')) {
                const tiltX = (y * -3.5).toFixed(2) + 'deg';
                const tiltY = (x * 4.5).toFixed(2) + 'deg';
                stage.style.setProperty('--tilt-x', tiltX);
                stage.style.setProperty('--tilt-y', tiltY);
            }
        });

        stage.addEventListener('mouseleave', () => {
            stage.style.setProperty('--tilt-x', '0deg');
            stage.style.setProperty('--tilt-y', '0deg');
        });
    }
});
