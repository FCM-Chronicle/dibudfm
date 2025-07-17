const cleanup = setup();
            this.eventListeners.set(key, { setup, cleanup, timestamp: Date.now() });
        } catch (error) {
            console.error(`음악 시스템 이벤트 리스너 설정 오류 (${key}):`, error);
        }
    }

    setupUI() {
        // 설정 탭에 음악 컨트롤 추가
        const settingsContent = document.querySelector('.settings-content');
        if (settingsContent && !document.getElementById('musicControls')) {
            const musicSection = document.createElement('div');
            musicSection.className = 'settings-section';
            musicSection.id = 'musicControls';
            musicSection.innerHTML = `
                <h4>🎵 음악 설정</h4>
                <div class="music-controls">
                    <div class="control-group">
                        <label>
                            <input type="checkbox" id="musicEnabled" ${this.enabled ? 'checked' : ''}>
                            음악 활성화
                        </label>
                    </div>
                    <div class="control-group">
                        <label>볼륨: <span id="volumeDisplay">${Math.round(this.volume * 100)}%</span></label>
                        <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="${this.volume}">
                    </div>
                    <div class="control-group">
                        <button class="btn" onclick="window.musicSystem.toggleMute()">
                            ${this.isMuted ? '🔇 음소거 해제' : '🔊 음소거'}
                        </button>
                    </div>
                    <div class="control-group">
                        <div class="current-track">
                            현재 재생: <span id="currentTrackDisplay">없음</span>
                        </div>
                    </div>
                </div>
            `;
            settingsContent.appendChild(musicSection);
            
            // 이벤트 리스너 설정
            this.setupMusicControlEvents();
        }
    }

    setupMusicControlEvents() {
        const enabledCheckbox = document.getElementById('musicEnabled');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeDisplay = document.getElementById('volumeDisplay');
        
        if (enabledCheckbox) {
            enabledCheckbox.addEventListener('change', (e) => {
                this.enabled = e.target.checked;
                if (!this.enabled) {
                    this.stopCurrentTrack();
                }
                this.saveUserPreferences();
            });
        }
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseFloat(e.target.value);
                this.setVolume(volume);
                if (volumeDisplay) {
                    volumeDisplay.textContent = `${Math.round(volume * 100)}%`;
                }
            });
        }
    }

    // ===========================================
    // 음악 재생 관리
    // ===========================================

    async playContextMusic(context, trackIndex = null) {
        if (!this.enabled || this.isMuted) return;
        
        const contextData = this.musicLibrary[context];
        if (!contextData || !contextData.tracks.length) {
            console.warn(`⚠️ 컨텍스트 음악을 찾을 수 없음: ${context}`);
            return;
        }
        
        // 이미 같은 컨텍스트의 음악이 재생 중이면 스킵
        if (this.currentContext === context && this.isPlaying) {
            return;
        }
        
        // 현재 재생 중인 음악 정지
        await this.stopCurrentTrack();
        
        // 트랙 선택
        const track = trackIndex !== null ? 
            contextData.tracks[trackIndex] : 
            contextData.tracks[Math.floor(Math.random() * contextData.tracks.length)];
        
        if (!track) return;
        
        try {
            this.currentContext = context;
            this.currentTrack = track;
            
            // Web Audio API 사용 가능 시
            if (this.audioContext) {
                await this.playWithWebAudio(track, contextData);
            } else {
                // HTML5 Audio 폴백
                await this.playWithHTMLAudio(track, contextData);
            }
            
            // 재생 히스토리 기록
            this.recordPlayback(context, track);
            
            // UI 업데이트
            this.updateCurrentTrackDisplay();
            
            console.log(`🎵 음악 재생 시작: ${track.name} (${context})`);
            
        } catch (error) {
            console.error(`❌ 음악 재생 오류: ${track.name}`, error);
        }
    }

    async playWithWebAudio(track, contextData) {
        try {
            // 오디오 버퍼 로드 (캐시 활용)
            const audioBuffer = await this.loadAudioBuffer(track.url);
            
            // 오디오 소스 생성
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = audioBuffer;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 볼륨 설정
            const finalVolume = this.volume * contextData.volume;
            gainNode.gain.value = finalVolume;
            
            // 루프 설정
            source.loop = contextData.loop;
            
            // 재생 시작
            source.start(0);
            
            this.currentAudioSource = source;
            this.isPlaying = true;
            
            // 재생 완료 이벤트
            source.onended = () => {
                this.isPlaying = false;
                this.currentAudioSource = null;
                
                if (!contextData.loop) {
                    // 다음 트랙 재생 (컨텍스트에 여러 트랙이 있는 경우)
                    setTimeout(() => {
                        if (this.currentContext === this.currentContext) {
                            this.playContextMusic(this.currentContext);
                        }
                    }, 2000);
                }
            };
            
        } catch (error) {
            throw new Error(`Web Audio 재생 실패: ${error.message}`);
        }
    }

    async playWithHTMLAudio(track, contextData) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(track.url);
            audio.volume = this.volume * contextData.volume;
            audio.loop = contextData.loop;
            
            audio.addEventListener('loadeddata', () => {
                audio.play()
                    .then(() => {
                        this.currentAudioSource = audio;
                        this.isPlaying = true;
                        resolve();
                    })
                    .catch(reject);
            });
            
            audio.addEventListener('ended', () => {
                this.isPlaying = false;
                this.currentAudioSource = null;
                
                if (!contextData.loop) {
                    setTimeout(() => {
                        if (this.currentContext === this.currentContext) {
                            this.playContextMusic(this.currentContext);
                        }
                    }, 2000);
                }
            });
            
            audio.addEventListener('error', reject);
        });
    }

    async loadAudioBuffer(url) {
        // 이미 로드된 버퍼가 있으면 재사용
        if (this.audioBuffers.has(url)) {
            return this.audioBuffers.get(url);
        }
        
        // 로딩 중인 프로미스가 있으면 대기
        if (this.loadingPromises.has(url)) {
            return await this.loadingPromises.get(url);
        }
        
        // 새로운 오디오 버퍼 로드
        const loadPromise = this.fetchAndDecodeAudio(url);
        this.loadingPromises.set(url, loadPromise);
        
        try {
            const audioBuffer = await loadPromise;
            this.audioBuffers.set(url, audioBuffer);
            this.loadingPromises.delete(url);
            return audioBuffer;
        } catch (error) {
            this.loadingPromises.delete(url);
            throw error;
        }
    }

    async fetchAndDecodeAudio(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            return audioBuffer;
        } catch (error) {
            throw new Error(`오디오 로드 실패 (${url}): ${error.message}`);
        }
    }

    async stopCurrentTrack() {
        if (!this.isPlaying) return;
        
        try {
            if (this.currentAudioSource) {
                if (this.audioContext && this.currentAudioSource.stop) {
                    // Web Audio API
                    this.currentAudioSource.stop();
                } else if (this.currentAudioSource.pause) {
                    // HTML5 Audio
                    this.currentAudioSource.pause();
                    this.currentAudioSource.currentTime = 0;
                }
            }
            
            // 페이드 아웃 효과 정리
            this.fadeIntervals.forEach(interval => clearInterval(interval));
            this.fadeIntervals.clear();
            
            this.isPlaying = false;
            this.currentAudioSource = null;
            
        } catch (error) {
            console.error('❌ 음악 정지 오류:', error);
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // 현재 재생 중인 음악의 볼륨 조정
        if (this.isPlaying && this.currentAudioSource) {
            const contextData = this.musicLibrary[this.currentContext];
            const finalVolume = this.volume * (contextData?.volume || 1);
            
            if (this.audioContext && this.currentAudioSource.gainNode) {
                this.currentAudioSource.gainNode.gain.value = finalVolume;
            } else if (this.currentAudioSource.volume !== undefined) {
                this.currentAudioSource.volume = finalVolume;
            }
        }
        
        this.saveUserPreferences();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopCurrentTrack();
        } else {
            // 현재 컨텍스트의 음악 재개
            this.playContextMusic(this.currentContext);
        }
        
        // UI 업데이트
        const muteButton = document.querySelector('#musicControls button');
        if (muteButton) {
            muteButton.textContent = this.isMuted ? '🔇 음소거 해제' : '🔊 음소거';
        }
        
        this.saveUserPreferences();
    }

    // ===========================================
    // 이벤트 핸들러들
    // ===========================================

    onTabChange(tabName) {
        const contextMapping = {
            'transfer': 'transfer',
            'youth': 'menu',
            'achievements': 'menu',
            'settings': 'menu'
        };
        
        const newContext = contextMapping[tabName] || 'menu';
        if (newContext !== this.currentContext) {
            this.playContextMusic(newContext);
        }
    }

    onMatchEnd(matchData) {
        const userScore = matchData.homeScore;
        const opponentScore = matchData.awayScore;
        
        if (userScore > opponentScore) {
            this.playContextMusic('victory');
        } else if (userScore < opponentScore) {
            this.playContextMusic('defeat');
        } else {
            this.playContextMusic('menu');
        }
    }

    // ===========================================
    // 데이터 관리
    // ===========================================

    recordPlayback(context, track) {
        const record = {
            timestamp: Date.now(),
            context: context,
            trackName: track.name,
            trackUrl: track.url
        };
        
        this.playbackHistory.unshift(record);
        
        // 히스토리 크기 제한
        if (this.playbackHistory.length > this.maxHistorySize) {
            this.playbackHistory = this.playbackHistory.slice(0, this.maxHistorySize);
        }
    }

    updateCurrentTrackDisplay() {
        const display = document.getElementById('currentTrackDisplay');
        if (display) {
            const trackName = this.currentTrack ? this.currentTrack.name : '없음';
            display.textContent = trackName;
        }
    }

    // ===========================================
    // 설정 저장/로드
    // ===========================================

    saveUserPreferences() {
        const preferences = {
            enabled: this.enabled,
            volume: this.volume,
            isMuted: this.isMuted
        };
        
        try {
            localStorage.setItem('musicSystem_preferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('음악 설정 저장 오류:', error);
        }
    }

    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('musicSystem_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                this.enabled = preferences.enabled !== false;
                this.volume = preferences.volume || 0.5;
                this.isMuted = preferences.isMuted || false;
            }
        } catch (error) {
            console.error('음악 설정 로드 오류:', error);
        }
    }

    getSaveData() {
        return {
            version: this.version,
            preferences: {
                enabled: this.enabled,
                volume: this.volume,
                isMuted: this.isMuted
            },
            playbackHistory: this.playbackHistory.slice(0, 10) // 최근 10개만 저장
        };
    }

    loadSaveData(data) {
        if (data) {
            if (data.preferences) {
                this.enabled = data.preferences.enabled !== false;
                this.volume = data.preferences.volume || 0.5;
                this.isMuted = data.preferences.isMuted || false;
            }
            
            this.playbackHistory = data.playbackHistory || [];
            
            console.log('💾 음악 시스템 데이터 로드됨');
        }
    }

    // ===========================================
    // 메모리 관리 및 정리
    // ===========================================

    performMemoryCleanup() {
        // 오래된 오디오 버퍼 정리 (사용하지 않는 것들)
        const activeUrls = new Set();
        Object.values(this.musicLibrary).forEach(contextData => {
            contextData.tracks.forEach(track => {
                activeUrls.add(track.url);
            });
        });
        
        for (const [url, buffer] of this.audioBuffers.entries()) {
            if (!activeUrls.has(url)) {
                this.audioBuffers.delete(url);
                console.log(`🧹 사용하지 않는 오디오 버퍼 제거: ${url}`);
            }
        }
        
        // 재생 히스토리 정리
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.playbackHistory = this.playbackHistory.filter(record => 
            record.timestamp > oneDayAgo
        );
    }

    cleanup() {
        console.log('🧹 음악 시스템 정리 시작...');
        
        // 현재 재생 중인 음악 정지
        this.stopCurrentTrack();
        
        // 인터벌 정리
        this.intervals.forEach(interval => {
            clearInterval(interval);
        });
        this.intervals.clear();
        
        this.fadeIntervals.forEach(interval => {
            clearInterval(interval);
        });
        this.fadeIntervals.clear();
        
        // 이벤트 리스너 정리
        this.eventListeners.forEach((listener, key) => {
            if (listener.cleanup) {
                listener.cleanup();
            }
        });
        this.eventListeners.clear();
        
        // 오디오 컨텍스트 정리
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        
        // 오디오 버퍼 정리
        this.audioBuffers.clear();
        this.loadingPromises.clear();
        
        // 설정 저장
        this.saveUserPreferences();
        
        console.log('✅ 음악 시스템 정리 완료');
    }

    // ===========================================
    // 유틸리티 및 디버그 메서드들
    // ===========================================

    getSystemStatus() {
        return {
            version: this.version,
            initialized: this.initialized,
            enabled: this.enabled,
            volume: this.volume,
            isMuted: this.isMuted,
            isPlaying: this.isPlaying,
            currentContext: this.currentContext,
            currentTrack: this.currentTrack?.name || null,
            audioBuffersLoaded: this.audioBuffers.size,
            loadingPromises: this.loadingPromises.size,
            playbackHistorySize: this.playbackHistory.length
        };
    }

    getPlaybackStatistics() {
        const stats = {
            totalPlays: this.playbackHistory.length,
            contextDistribution: {},
            mostPlayedTracks: {},
            averageSessionLength: 0
        };
        
        this.playbackHistory.forEach(record => {
            // 컨텍스트 분포
            stats.contextDistribution[record.context] = (stats.contextDistribution[record.context] || 0) + 1;
            
            // 트랙별 재생 횟수
            stats.mostPlayedTracks[record.trackName] = (stats.mostPlayedTracks[record.trackName] || 0) + 1;
        });
        
        return stats;
    }

    testAudioSupport() {
        const results = {
            webAudioAPI: !!this.audioContext,
            html5Audio: typeof Audio !== 'undefined',
            supportedFormats: []
        };
        
        if (results.html5Audio) {
            const audio = new Audio();
            const formats = ['mp3', 'ogg', 'wav', 'm4a'];
            
            formats.forEach(format => {
                const canPlay = audio.canPlayType(`audio/${format}`);
                if (canPlay) {
                    results.supportedFormats.push(format);
                }
            });
        }
        
        return results;
    }

    playTestSound() {
        const testContext = Object.keys(this.musicLibrary)[0];
        this.playContextMusic(testContext);
        console.log(`🧪 테스트 사운드 재생: ${testContext}`);
    }
}

// 전역 인스턴스 생성 (기존 시스템과 호환성)
if (!window.musicSystem) {
    window.musicSystem = new EnhancedMusicSystem();
}

// 기존 함수들과의 호환성
window.MusicSystem = EnhancedMusicSystem;

// 디버깅 함수들
window.checkMusicSystem = () => {
    console.log('🔍 음악 시스템 상태:', window.musicSystem.getSystemStatus());
};

window.getMusicStats = () => {
    return window.musicSystem.getPlaybackStatistics();
};

window.testAudioSupport = () => {
    return window.musicSystem.testAudioSupport();
};

window.playTestMusic = () => {
    window.musicSystem.playTestSound();
};
    // enhancedMusicSystem.js - 향상된 음악 시스템 (상황별 음악, 메모리 관리)

class EnhancedMusicSystem {
    constructor() {
        this.version = "2.0.0";
        this.initialized = false;
        this.enabled = true;
        
        // 음악 상태
        this.currentTrack = null;
        this.currentContext = 'menu';
        this.volume = 0.5;
        this.isMuted = false;
        this.isPlaying = false;
        
        // 상황별 음악 컬렉션
        this.musicLibrary = {
            menu: {
                tracks: [
                    { name: 'Menu Theme', url: 'sounds/menu_theme.mp3', duration: 120 },
                    { name: 'Lobby Music', url: 'sounds/lobby.mp3', duration: 180 }
                ],
                volume: 0.3,
                loop: true
            },
            match: {
                tracks: [
                    { name: 'Match Intro', url: 'sounds/match_intro.mp3', duration: 30 },
                    { name: 'Stadium Atmosphere', url: 'sounds/stadium.mp3', duration: 300 },
                    { name: 'Tension Building', url: 'sounds/tension.mp3', duration: 150 }
                ],
                volume: 0.4,
                loop: false
            },
            victory: {
                tracks: [
                    { name: 'Victory Fanfare', url: 'sounds/victory.mp3', duration: 45 },
                    { name: 'Championship', url: 'sounds/championship.mp3', duration: 60 }
                ],
                volume: 0.6,
                loop: false
            },
            defeat: {
                tracks: [
                    { name: 'Defeat Theme', url: 'sounds/defeat.mp3', duration: 30 },
                    { name: 'Sad Melody', url: 'sounds/sad.mp3', duration: 90 }
                ],
                volume: 0.4,
                loop: false
            },
            transfer: {
                tracks: [
                    { name: 'Market Music', url: 'sounds/market.mp3', duration: 200 },
                    { name: 'Deal Making', url: 'sounds/negotiation.mp3', duration: 180 }
                ],
                volume: 0.3,
                loop: true
            },
            achievement: {
                tracks: [
                    { name: 'Achievement Unlocked', url: 'sounds/achievement.mp3', duration: 15 },
                    { name: 'Success Jingle', url: 'sounds/success.mp3', duration: 20 }
                ],
                volume: 0.7,
                loop: false
            }
        };
        
        // 오디오 관리
        this.audioContext = null;
        this.audioBuffers = new Map();
        this.currentAudioSource = null;
        this.fadeIntervals = new Set();
        
        // 시스템 상태
        this.intervals = new Set();
        this.eventListeners = new Map();
        this.loadingPromises = new Map();
        this.playbackHistory = [];
        this.maxHistorySize = 20;
        
        console.log('🎵 향상된 음악 시스템 생성됨 - v' + this.version);
    }

    // ===========================================
    // 초기화 및 시스템 설정
    // ===========================================

    async initialize() {
        if (this.initialized) {
            console.warn('⚠️ 음악 시스템이 이미 초기화됨');
            return true;
        }

        try {
            await this.initializeAudioContext();
            this.setupEventListeners();
            this.loadUserPreferences();
            this.integrateWithGameManager();
            this.setupUI();
            
            this.initialized = true;
            console.log('✅ 음악 시스템 초기화 완료');
            return true;
        } catch (error) {
            console.error('❌ 음악 시스템 초기화 실패:', error);
            this.enabled = false;
            return false;
        }
    }

    async initializeAudioContext() {
        try {
            // Web Audio API 지원 확인
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                throw new Error('Web Audio API 미지원');
            }
            
            this.audioContext = new AudioContext();
            
            // 사용자 상호작용 후 오디오 컨텍스트 시작
            if (this.audioContext.state === 'suspended') {
                document.addEventListener('click', () => {
                    if (this.audioContext.state === 'suspended') {
                        this.audioContext.resume();
                    }
                }, { once: true });
            }
            
            console.log('🔊 오디오 컨텍스트 초기화 완료');
        } catch (error) {
            console.warn('⚠️ Web Audio API 초기화 실패, 기본 오디오 사용:', error);
            // 기본 HTML5 오디오로 폴백
            this.audioContext = null;
        }
    }

    integrateWithGameManager() {
        const gameManager = window.gameManager;
        if (gameManager) {
            // GameManager 이벤트 구독
            gameManager.on('matchStarted', () => this.playContextMusic('match'));
            gameManager.on('matchEnded', (data) => this.onMatchEnd(data));
            gameManager.on('achievementUnlocked', () => this.playContextMusic('achievement'));
            gameManager.on('teamSelected', () => this.playContextMusic('menu'));
            
            console.log('🔗 음악 시스템이 GameManager와 연동됨');
        }
    }

    setupEventListeners() {
        // 탭 변경 감지
        this.safeAddEventListener('tab-change', () => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const target = mutation.target;
                        if (target.classList.contains('active')) {
                            this.onTabChange(target.dataset.tab);
                        }
                    }
                });
            });
            
            const tabs = document.querySelectorAll('[data-tab]');
            tabs.forEach(tab => {
                observer.observe(tab, { attributes: true });
            });
        });
        
        // 볼륨 변경 감지
        this.safeAddEventListener('volume-control', () => {
            const volumeSlider = document.getElementById('volumeSlider');
            if (volumeSlider) {
                volumeSlider.addEventListener('input', (e) => {
                    this.setVolume(parseFloat(e.target.value));
                });
            }
        });
    }

    safeAddEventListener(key, setup) {
        if (this.eventListeners.has(key)) {
            const oldListener = this.eventListeners.get(key);
            if (oldListener.cleanup) oldListener.cleanup();
        }
        
        try {
            const cleanup = setup();
            this.eventListeners.set(key, { setup, cleanup, timestamp: Date.now()