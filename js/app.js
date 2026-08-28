const state = {
            theme: localStorage.getItem('theme') || 'light',
            activated: false,
            isAnimating: false,
            currentSound: localStorage.getItem('sound') || 'water',
            currentIndex: 0,
            cardLanguage: localStorage.getItem('cardLanguage') || 'zh',
            contentPool: [],
            touchStartX: 0,
            touchEndX: 0
        };

        // Audio Context
        let audioCtx = null;
        function getAudioCtx() {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            return audioCtx;
        }

        // Sound Generators
        const sounds = {
            // 水滴声 - 清脆、纯净
            water: () => {
                const ctx = getAudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(1800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(3000, ctx.currentTime);

                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

                osc.connect(filter).connect(gain).connect(ctx.destination);
                osc.start(); osc.stop(ctx.currentTime + 0.2);
            },

            // 轻柔点击
            click: () => {
                const ctx = getAudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.005);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

                osc.connect(gain).connect(ctx.destination);
                osc.start(); osc.stop(ctx.currentTime + 0.12);
            },

            // 机械红轴 - 低沉、浑厚
            'mechanical-red': () => {
                const ctx = getAudioCtx();
                const noise = ctx.createBufferSource();
                const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
                noise.buffer = buffer;

                const lowpass = ctx.createBiquadFilter();
                lowpass.type = 'lowpass';
                lowpass.frequency.setValueAtTime(400, ctx.currentTime);

                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.5, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

                noise.connect(lowpass).connect(gain).connect(ctx.destination);
                noise.start();
            },

            // 机械青轴 - 清脆、有click声
            'mechanical-blue': () => {
                const ctx = getAudioCtx();
                // Click声
                const click = ctx.createOscillator();
                const clickGain = ctx.createGain();
                click.type = 'square';
                click.frequency.setValueAtTime(3500, ctx.currentTime);
                click.frequency.setValueAtTime(0, ctx.currentTime + 0.02);
                clickGain.gain.setValueAtTime(0.15, ctx.currentTime);
                clickGain.gain.setValueAtTime(0.15, ctx.currentTime + 0.02);
                clickGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.03);
                click.connect(clickGain).connect(ctx.destination);
                click.start(); click.stop(ctx.currentTime + 0.03);

                // Bottom 声
                const bottom = ctx.createOscillator();
                const bottomGain = ctx.createGain();
                bottom.type = 'sine';
                bottom.frequency.setValueAtTime(120, ctx.currentTime + 0.02);
                bottomGain.gain.setValueAtTime(0, ctx.currentTime + 0.02);
                bottomGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.025);
                bottomGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                bottom.connect(bottomGain).connect(ctx.destination);
                bottom.start(ctx.currentTime + 0.02); bottom.stop(ctx.currentTime + 0.1);
            },

            // 机械茶轴 - 中等、柔和
            'mechanical-brown': () => {
                const ctx = getAudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const noise = ctx.createBufferSource();
                const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
                noise.buffer = buffer;

                const lowpass = ctx.createBiquadFilter();
                lowpass.type = 'lowpass';
                lowpass.frequency.setValueAtTime(600, ctx.currentTime);

                const noiseGain = ctx.createGain();
                noiseGain.gain.setValueAtTime(0.25, ctx.currentTime);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.06);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

                noise.connect(lowpass).connect(noiseGain).connect(ctx.destination);
                osc.connect(gain).connect(ctx.destination);
                noise.start(); osc.start(); osc.stop(ctx.currentTime + 0.06);
            },

            // 静音红轴 - 很轻、几乎无声
            'mechanical-silent': () => {
                const ctx = getAudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.05);

                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

                osc.connect(gain).connect(ctx.destination);
                osc.start(); osc.stop(ctx.currentTime + 0.05);
            },

            // 风铃
            bell: () => {
                const ctx = getAudioCtx();
                const frequencies = [1046.5, 1318.5, 1568, 2093]; // C6, E6, G6, C7
                frequencies.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
                    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
                    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.08 + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 1.5);
                    osc.connect(gain).connect(ctx.destination);
                    osc.start(ctx.currentTime + i * 0.08);
                    osc.stop(ctx.currentTime + i * 0.08 + 1.5);
                });
            }
        };

        const soundNames = {
            water: '水滴声',
            click: '轻柔点击',
            'mechanical-red': '机械红轴',
            'mechanical-blue': '机械青轴',
            'mechanical-brown': '机械茶轴',
            'mechanical-silent': '静音红轴',
            bell: '风铃'
        };

        function playSound() {
            try { sounds[state.currentSound]?.(); } catch (e) {}
        }

        function playSuccessChime() {
            try {
                const ctx = getAudioCtx();
                const notes = [523.25, 659.25, 783.99];
                notes.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
                    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
                    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.5);
                    osc.connect(gain).connect(ctx.destination);
                    osc.start(ctx.currentTime + i * 0.12);
                    osc.stop(ctx.currentTime + i * 0.12 + 0.5);
                });
            } catch (e) {}
        }

        // Content Library - 1000 Philosophical Stories & Wisdom

        const philosophicalStories = LifeAnchorContent.philosophicalStories;

        LifeAnchorI18n.apply();

        // DOM
        const themeToggle = document.getElementById('themeToggle');
        const anchorButton = document.getElementById('anchorButton');
        const flashOverlay = document.getElementById('flashOverlay');
        const messageCard = document.getElementById('messageCard');
        const mainMessage = document.getElementById('mainMessage');
        const storySource = document.getElementById('storySource');
        const cardLanguageSelector = document.getElementById('cardLanguageSelector');
        const cardLanguageOptions = document.querySelectorAll('.card-language-option');
        const particlesContainer = document.getElementById('particlesContainer');
        const soundBtn = document.getElementById('soundBtn');
        const soundMenu = document.getElementById('soundMenu');
        const soundLabel = document.getElementById('soundLabel');

        // Init
        function initTheme() {
            document.documentElement.setAttribute('data-theme', state.theme);
        }

        function initSound() {
            soundLabel.textContent = soundNames[state.currentSound];
            document.querySelectorAll('.sound-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.sound === state.currentSound);
            });
        }

        // Theme Toggle
        themeToggle.addEventListener('click', () => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', state.theme);
            localStorage.setItem('theme', state.theme);
        });

        // Sound Menu
        soundBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            soundMenu.classList.toggle('show');
        });

        document.querySelectorAll('.sound-option').forEach(opt => {
            opt.addEventListener('click', () => {
                state.currentSound = opt.dataset.sound;
                soundLabel.textContent = soundNames[state.currentSound];
                localStorage.setItem('sound', state.currentSound);
                document.querySelectorAll('.sound-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                soundMenu.classList.remove('show');
                playSound();
            });
        });

        document.addEventListener('click', () => soundMenu.classList.remove('show'));

        // Ripple
        function createRipple(e) {
            const btn = e.currentTarget;
            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const size = Math.max(rect.width, rect.height);
            ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
            btn.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        }

        // Particles
        function createParticles() {
            particlesContainer.innerHTML = '';
            for (let i = 0; i < 18; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                p.style.cssText = `
                    left:${Math.random()*100}%;
                    top:${Math.random()*100}%;
                    width:${4+Math.random()*6}px;
                    height:${4+Math.random()*6}px;
                    --drift-x:${(Math.random()-0.5)*200}px;
                    --drift-y:${-100-Math.random()*200}px;
                    animation-delay:${Math.random()*5}s;
                `;
                particlesContainer.appendChild(p);
            }
            particlesContainer.classList.add('particles-active');
        }

        // Shuffle and prepare content pool
        function prepareContentPool() {
            state.contentPool = [...philosophicalStories];
            // Fisher-Yates shuffle
            for (let i = state.contentPool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [state.contentPool[i], state.contentPool[j]] = [state.contentPool[j], state.contentPool[i]];
            }
            state.currentIndex = 0;
        }

        // Show current content
        function showCurrentContent(direction = null) {
            const content = state.contentPool[state.currentIndex];
            const hasEnglish = Boolean(content.storyEn);

            mainMessage.textContent = content.story || '';
            storySource.textContent = content.source || '';

            let englishMessage = document.getElementById('mainMessageEn');
            let englishSource = document.getElementById('storySourceEn');

            if (!englishMessage) {
                englishMessage = document.createElement('p');
                englishMessage.className = 'main-message main-message-en';
                englishMessage.id = 'mainMessageEn';
                mainMessage.insertAdjacentElement('afterend', englishMessage);
            }

            if (!englishSource) {
                englishSource = document.createElement('p');
                englishSource.className = 'source source-en';
                englishSource.id = 'storySourceEn';
                storySource.insertAdjacentElement('afterend', englishSource);
            }

            englishMessage.textContent = content.storyEn || '';
            englishSource.textContent = content.sourceEn || '';

            const mode = state.cardLanguage;
            const showZh = mode === 'zh' || mode === 'bilingual';
            const showEn = mode === 'en' || mode === 'bilingual';

            mainMessage.style.display = showZh ? '' : 'none';
            storySource.style.display = showZh ? '' : 'none';
            englishMessage.style.display = showEn && hasEnglish ? '' : 'none';
            englishSource.style.display = showEn && hasEnglish && content.sourceEn ? '' : 'none';

            // 原有未翻译内容不会伪造英文；英文模式下会明确显示可用语言。
            if (mode === 'en' && !hasEnglish) {
                mainMessage.style.display = '';
                mainMessage.textContent = content.story;
                storySource.style.display = '';
                storySource.textContent = content.source;
            }
        }

        function setCardLanguage(language) {
            state.cardLanguage = language;
            localStorage.setItem('cardLanguage', language);
            cardLanguageOptions.forEach(option => {
                option.classList.toggle('active', option.dataset.cardLanguage === language);
            });
            showCurrentContent();
        }

        cardLanguageOptions.forEach(option => {
            option.addEventListener('click', (event) => {
                event.stopPropagation();
                setCardLanguage(option.dataset.cardLanguage);
            });
        });

        // Navigate content
        function navigateContent(direction) {
            if (state.isAnimating) return;
            state.isAnimating = true;

            // Add slide class
            messageCard.classList.remove('visible');
            cardLanguageSelector.classList.remove('visible');
            if (direction === 'prev') {
                messageCard.classList.add('slide-left');
            } else {
                messageCard.classList.add('slide-right');
            }

            playSound();

            setTimeout(() => {
                // Update index
                if (direction === 'prev') {
                    state.currentIndex = (state.currentIndex - 1 + state.contentPool.length) % state.contentPool.length;
                } else {
                    state.currentIndex = (state.currentIndex + 1) % state.contentPool.length;
                }

                showCurrentContent();
                messageCard.classList.remove('slide-left', 'slide-right');
                messageCard.classList.add('visible');
            cardLanguageSelector.classList.add('visible');
                state.isAnimating = false;
            }, 300);
        }

        // Activate
        function activateButton(e) {
            if (state.isAnimating) return;
            state.isAnimating = true;

            createRipple(e);
            playSound();
            flashOverlay.classList.add('active');
            createParticles();

            // Prepare new content pool on first activation
            if (!state.activated) {
                prepareContentPool();
                showCurrentContent();
            }

            setTimeout(playSuccessChime, 400);

            setTimeout(() => {
                flashOverlay.classList.remove('active');
                messageCard.classList.add('visible');
            cardLanguageSelector.classList.add('visible');
                state.activated = true;
                state.isAnimating = false;
            }, 600);
        }

        // Close
        function closeMessage(e) {
            // Check if clicking on swipe hints
            if (e.target.closest('.hint-left')) {
                e.stopPropagation();
                navigateContent('prev');
                return;
            }
            if (e.target.closest('.hint-right')) {
                e.stopPropagation();
                navigateContent('next');
                return;
            }

            if (e.target === messageCard || messageCard.contains(e.target)) return;
            if (messageCard.classList.contains('visible')) {
                messageCard.classList.remove('visible');
            cardLanguageSelector.classList.remove('visible');
                setTimeout(() => {
                    particlesContainer.classList.remove('particles-active');
                    state.activated = false;
                }, 400);
            }
        }

        // Touch handlers for swipe
        function handleTouchStart(e) {
            state.touchStartX = e.changedTouches[0].screenX;
        }

        function handleTouchEnd(e) {
            state.touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }

        function handleSwipe() {
            if (!messageCard.classList.contains('visible')) return;

            const swipeThreshold = 50;
            const diff = state.touchStartX - state.touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left -> next
                    navigateContent('next');
                } else {
                    // Swipe right -> prev
                    navigateContent('prev');
                }
            }
        }

        // Keyboard navigation
        function handleKeyDown(e) {
            if (!messageCard.classList.contains('visible')) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateContent('prev');
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                navigateContent('next');
            } else if (e.key === 'Escape') {
                closeMessage({ target: document.body });
            }
        }

        // Events
        anchorButton.addEventListener('click', activateButton);
        document.addEventListener('click', closeMessage);
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
        document.addEventListener('keydown', handleKeyDown);

        // Start
        initTheme();
        setCardLanguage(state.cardLanguage);
        initSound();

        document.addEventListener('DOMContentLoaded', () => {
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.transition = 'opacity 1s ease';
                document.body.style.opacity = '1';
            }, 100);
        });

        // Card language selector labels follow the system UI language.
        document.querySelector('[data-card-language="zh"]').textContent = LifeAnchorI18n.get('cardZh');
        document.querySelector('[data-card-language="en"]').textContent = LifeAnchorI18n.get('cardEn');
        document.querySelector('[data-card-language="bilingual"]').textContent = LifeAnchorI18n.get('cardBi');
