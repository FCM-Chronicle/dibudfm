// gameManager.js - 통합 게임 매니저 (모든 시스템을 관리하는 중앙 컨트롤러)

class GameManager {
    constructor() {
        this.version = "2.0.0";
        this.initialized = false;
        this.systems = new Map();
        this.intervals = new Set();
        this.observers = new Set();
        this.eventListeners = new Map();
        
        // 게임 상태
        this.gameState = {
            selectedTeam: null,
            teamMoney: 1000,
            teamMorale: 80,
            currentSponsor: null,
            matchesPlayed: 0,
            currentOpponent: null,
            currentTactic: 'gegenpress',
            currentFormation: '433',
            squad: {
                gk: null,
                df: [null, null, null, null],
                mf: [null, null, null],
                fw: [null, null, null]
            },
            leagueData: {},
            isMatchInProgress: false,
            lastSaveTimestamp: null
        };
        
        // 시스템 참조들
        this.playerGrowth = null;
        this.transferSystem = null;
        this.youthAcademy = null;
        this.achievementSystem = null;
        this.socialMedia = null;
        this.formation = null;
        this.records = null;
        this.music = null;
        this.tactics = null;
        
        console.log('🎮 GameManager 생성됨 - v' + this.version);
    }

    // ===========================================
    // 초기화 및 시스템 관리
    // ===========================================

    async initialize() {
        if (this.initialized) {
            console.warn('⚠️ GameManager 이미 초기화됨');
            return;
        }

        try {
            console.log('🚀 GameManager 초기화 시작...');
            
            // 1. 기본 데이터 초기화
            this.initializeBasicData();
            
            // 2. 시스템들 순차적 초기화 (의존성 순서대로)
            await this.initializeSystems();
            
            // 3. 이벤트 리스너 등록
            this.setupEventListeners();
            
            // 4. 자동 저장 설정
            this.setupAutoSave();
            
            // 5. 메모리 관리 설정
            this.setupMemoryManagement();
            
            this.initialized = true;
            console.log('✅ GameManager 초기화 완료');
            
            return true;
        } catch (error) {
            console.error('❌ GameManager 초기화 실패:', error);
            return false;
        }
    }

    initializeBasicData() {
        // 리그 데이터 초기화
        Object.keys(window.teams || {}).forEach(teamKey => {
            this.gameState.leagueData[teamKey] = {
                matches: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                points: 0,
                goalsFor: 0,
                goalsAgainst: 0
            };
        });
    }

    async initializeSystems() {
        const initOrder = [
            { name: 'formation', class: 'FormationManager', priority: 1 },
            { name: 'tactics', class: 'TacticSystem', priority: 1 },
            { name: 'playerGrowth', class: 'PlayerGrowthSystem', priority: 2 },
            { name: 'transferSystem', class: 'TransferSystem', priority: 3 },
            { name: 'youthAcademy', class: 'YouthAcademy', priority: 3 },
            { name: 'records', class: 'PlayerRecordsSystem', priority: 4 },
            { name: 'socialMedia', class: 'SocialMediaSystem', priority: 5 },
            { name: 'achievementSystem', class: 'AchievementSystem', priority: 6 },
            { name: 'music', class: 'MusicSystem', priority: 7 }
        ];

        // 우선순위별로 정렬
        initOrder.sort((a, b) => a.priority - b.priority);

        for (const system of initOrder) {
            try {
                await this.initializeSystem(system);
            } catch (error) {
                console.error(`❌ ${system.name} 시스템 초기화 실패:`, error);
            }
        }
    }

    async initializeSystem(systemConfig) {
        const { name, class: className } = systemConfig;
        
        // 전역에서 클래스 찾기
        const SystemClass = window[className] || window[`${name}System`] || window[name];
        
        if (!SystemClass) {
            console.warn(`⚠️ ${className} 클래스를 찾을 수 없음`);
            return;
        }

        // 이미 인스턴스가 있는지 확인
        const existingInstance = window[name] || window[`${name}System`];
        
        if (existingInstance && typeof existingInstance === 'object') {
            this[name] = existingInstance;
            console.log(`♻️ 기존 ${name} 인스턴스 재사용`);
        } else {
            this[name] = new SystemClass();
            console.log(`🆕 새 ${name} 인스턴스 생성`);
        }

        // 시스템을 게임 매니저에 등록
        this.systems.set(name, this[name]);
        
        // 시스템별 초기화 메서드 호출
        if (this[name].initialize && typeof this[name].initialize === 'function') {
            await this[name].initialize();
        }

        console.log(`✅ ${name} 시스템 초기화 완료`);
    }

    // ===========================================
    // 이벤트 관리
    // ===========================================

    setupEventListeners() {
        // DOM 이벤트들
        this.addGlobalEventListener('beforeunload', () => this.cleanup());
        this.addGlobalEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // 게임 이벤트들
        this.on('teamSelected', (teamKey) => this.handleTeamSelection(teamKey));
        this.on('matchEnded', (matchData) => this.handleMatchEnd(matchData));
        this.on('playerTransferred', (transferData) => this.handlePlayerTransfer(transferData));
        this.on('formationChanged', (formationData) => this.handleFormationChange(formationData));
    }

    addGlobalEventListener(event, handler) {
        if (this.eventListeners.has(event)) {
            window.removeEventListener(event, this.eventListeners.get(event));
        }
        
        const boundHandler = handler.bind(this);
        window.addEventListener(event, boundHandler);
        this.eventListeners.set(event, boundHandler);
    }

    on(eventName, callback) {
        if (!this.customEvents) this.customEvents = new Map();
        
        if (!this.customEvents.has(eventName)) {
            this.customEvents.set(eventName, new Set());
        }
        
        this.customEvents.get(eventName).add(callback);
    }

    emit(eventName, data) {
        if (!this.customEvents || !this.customEvents.has(eventName)) return;
        
        this.customEvents.get(eventName).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`이벤트 ${eventName} 처리 중 오류:`, error);
            }
        });
    }

    // ===========================================
    // 게임 상태 관리
    // ===========================================

    selectTeam(teamKey) {
        if (!window.teams || !window.teams[teamKey]) {
            throw new Error(`팀 ${teamKey}를 찾을 수 없습니다`);
        }

        this.gameState.selectedTeam = teamKey;
        
        // 팀별 특성 적용
        this.applyTeamCharacteristics(teamKey);
        
        // 자동 스쿼드 구성
        this.autoFillSquad();
        
        // 이벤트 발생
        this.emit('teamSelected', teamKey);
        
        // 시스템들에게 알림
        this.notifySystemsTeamSelected(teamKey);
        
        console.log(`✅ 팀 선택됨: ${window.teamNames[teamKey]}`);
    }

    applyTeamCharacteristics(teamKey) {
        // 팀별 초기 자금 조정
        const teamMultipliers = {
            'realMadrid': 1.5,
            'barcelona': 1.5,
            'manCity': 1.4,
            'psg': 1.4,
            'bayern': 1.3,
            'seryun': 10.0, // 레전드 팀은 특별
            // 기타 팀들은 1.0
        };
        
        const multiplier = teamMultipliers[teamKey] || 1.0;
        this.gameState.teamMoney = Math.floor(1000 * multiplier);
        
        // 팀별 초기 사기 조정
        const moraleBonus = {
            'seryun': 20,
            'realMadrid': 10,
            'barcelona': 10,
            'manCity': 5,
            // 하위권 팀들은 사기 보너스
            'newCastle': -10,
            'asRoma': -5
        };
        
        this.gameState.teamMorale = Math.max(20, Math.min(100, 80 + (moraleBonus[teamKey] || 0)));
    }

    autoFillSquad() {
        const teamPlayers = window.teams[this.gameState.selectedTeam];
        if (!teamPlayers) return;
        
        // 포지션별로 분류하고 능력치 순 정렬
        const gks = teamPlayers.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating);
        const dfs = teamPlayers.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating);
        const mfs = teamPlayers.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating);
        const fws = teamPlayers.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating);
        
        // 최고 선수들로 자동 배치
        if (gks.length > 0) this.gameState.squad.gk = gks[0];
        
        for (let i = 0; i < 4 && i < dfs.length; i++) {
            this.gameState.squad.df[i] = dfs[i];
        }
        
        for (let i = 0; i < 3 && i < mfs.length; i++) {
            this.gameState.squad.mf[i] = mfs[i];
        }
        
        for (let i = 0; i < 3 && i < fws.length; i++) {
            this.gameState.squad.fw[i] = fws[i];
        }
    }

    // ===========================================
    // 시스템 간 통신
    // ===========================================

    notifySystemsTeamSelected(teamKey) {
        // 각 시스템에 팀 선택 알림
        this.systems.forEach((system, name) => {
            if (system.onTeamSelected && typeof system.onTeamSelected === 'function') {
                try {
                    system.onTeamSelected(teamKey);
                } catch (error) {
                    console.error(`${name} 시스템 팀 선택 처리 오류:`, error);
                }
            }
        });
    }

    handleMatchEnd(matchData) {
        // 경기 상태 업데이트
        this.gameState.isMatchInProgress = false;
        this.gameState.matchesPlayed++;
        
        // 시스템들에게 경기 종료 알림
        this.systems.forEach((system, name) => {
            if (system.onMatchEnd && typeof system.onMatchEnd === 'function') {
                try {
                    system.onMatchEnd(matchData);
                } catch (error) {
                    console.error(`${name} 시스템 경기 종료 처리 오류:`, error);
                }
            }
        });
        
        // SNS 포스트 생성
        if (this.socialMedia) {
            this.socialMedia.createMatchPost(matchData);
        }
        
        console.log('📊 경기 종료 처리 완료');
    }

    handlePlayerTransfer(transferData) {
        const { type, player, fromTeam, toTeam, fee } = transferData;
        
        // AI 팀 간 이적이면 SNS에 알림
        if (type === 'ai_transfer' && this.socialMedia) {
            this.createAITransferPost(transferData);
        }
        
        // 이적 시장 업데이트
        if (this.transferSystem) {
            this.transferSystem.onPlayerTransferred(transferData);
        }
        
        console.log(`🔄 이적 처리: ${player.name} (${fromTeam} → ${toTeam})`);
    }

    createAITransferPost(transferData) {
        const { player, fromTeam, toTeam, fee, isShockingTransfer } = transferData;
        
        let postContent = "";
        let postType = "ai_transfer";
        
        if (isShockingTransfer) {
            postContent = `🚨 충격! ${window.teamNames[fromTeam]}의 핵심 선수 ${player.name}(${player.rating})이 ${window.teamNames[toTeam]}로 이적! 이적료 ${fee}억 추정 #충격이적 #이적시장`;
        } else if (player.rating >= 85) {
            postContent = `⭐ ${window.teamNames[toTeam]}이 ${player.name}(${player.rating}) 영입 완료! ${window.teamNames[fromTeam]}에서 이적 #영입완료 #스타선수`;
        } else {
            postContent = `📰 ${player.name}이 ${window.teamNames[fromTeam]}에서 ${window.teamNames[toTeam]}로 이적했습니다 #이적소식`;
        }

        const post = {
            id: Date.now() + Math.random(),
            type: postType,
            content: postContent,
            timestamp: Date.now(),
            likes: this.socialMedia.generateLikes(postType),
            comments: this.socialMedia.generateComments(postType),
            transferData: transferData
        };

        this.socialMedia.posts.unshift(post);
        this.socialMedia.updateSocialDisplay();
        
        console.log(`📱 AI 이적 SNS 포스트 생성: ${player.name}`);
    }

    // ===========================================
    // 저장/로드 시스템
    // ===========================================

    getSaveData() {
        const saveData = {
            version: this.version,
            timestamp: Date.now(),
            gameState: { ...this.gameState },
            teams: window.teams ? { ...window.teams } : {},
            systemData: {}
        };

        // 각 시스템의 저장 데이터 수집
        this.systems.forEach((system, name) => {
            if (system.getSaveData && typeof system.getSaveData === 'function') {
                try {
                    saveData.systemData[name] = system.getSaveData();
                } catch (error) {
                    console.error(`${name} 시스템 저장 데이터 수집 오류:`, error);
                }
            }
        });

        this.gameState.lastSaveTimestamp = Date.now();
        return saveData;
    }

    loadSaveData(saveData) {
        if (!saveData) {
            throw new Error('저장 데이터가 없습니다');
        }

        // 버전 호환성 체크
        if (saveData.version && this.compareVersions(saveData.version, this.version) > 0) {
            console.warn('⚠️ 더 새로운 버전의 저장 파일입니다');
        }

        // 게임 상태 복원
        this.gameState = { ...this.gameState, ...saveData.gameState };
        
        // 팀 데이터 복원
        if (saveData.teams) {
            Object.assign(window.teams, saveData.teams);
        }

        // 각 시스템의 데이터 복원
        if (saveData.systemData) {
            this.systems.forEach((system, name) => {
                if (saveData.systemData[name] && system.loadSaveData && typeof system.loadSaveData === 'function') {
                    try {
                        system.loadSaveData(saveData.systemData[name]);
                    } catch (error) {
                        console.error(`${name} 시스템 데이터 복원 오류:`, error);
                    }
                }
            });
        }

        console.log('💾 게임 데이터 로드 완료');
    }

    compareVersions(version1, version2) {
        const v1 = version1.split('.').map(Number);
        const v2 = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;
            
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        
        return 0;
    }

    setupAutoSave() {
        // 5분마다 자동 저장
        const autoSaveInterval = setInterval(() => {
            try {
                const saveData = this.getSaveData();
                localStorage.setItem('footballManager_autoSave', JSON.stringify(saveData));
                console.log('💾 자동 저장 완료');
            } catch (error) {
                console.error('❌ 자동 저장 실패:', error);
            }
        }, 300000); // 5분

        this.intervals.add(autoSaveInterval);
    }

    // ===========================================
    // 메모리 관리
    // ===========================================

    setupMemoryManagement() {
        // 메모리 사용량 모니터링 (개발용)
        if (performance.memory) {
            const memoryInterval = setInterval(() => {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
                const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
                
                if (usedMB > limitMB * 0.8) {
                    console.warn(`⚠️ 메모리 사용량 높음: ${usedMB}MB / ${limitMB}MB`);
                    this.performGarbageCollection();
                }
            }, 60000); // 1분마다 체크

            this.intervals.add(memoryInterval);
        }
    }

    performGarbageCollection() {
        // 불필요한 데이터 정리
        
        // 1. 오래된 SNS 포스트 정리 (100개 이상 시)
        if (this.socialMedia && this.socialMedia.posts.length > 100) {
            this.socialMedia.posts = this.socialMedia.posts.slice(0, 50);
            console.log('🧹 SNS 포스트 정리됨');
        }

        // 2. 오래된 골 기록 정리 (1000개 이상 시)
        if (this.records && this.records.goalHistory && this.records.goalHistory.length > 1000) {
            this.records.goalHistory = this.records.goalHistory.slice(-500);
            console.log('🧹 골 기록 정리됨');
        }

        // 3. 이적 시장 오래된 선수 정리
        if (this.transferSystem && this.transferSystem.transferMarket) {
            const before = this.transferSystem.transferMarket.length;
            this.transferSystem.transferMarket = this.transferSystem.transferMarket.filter(
                player => player.daysOnMarket < 60
            );
            const after = this.transferSystem.transferMarket.length;
            
            if (before > after) {
                console.log(`🧹 이적 시장 정리됨: ${before} → ${after}`);
            }
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // 탭이 숨겨졌을 때 - 경기 일시정지 등
            if (this.gameState.isMatchInProgress) {
                console.log('⏸️ 경기 일시정지 (탭 숨김)');
            }
        } else {
            // 탭이 다시 보일 때
            if (this.gameState.isMatchInProgress) {
                console.log('▶️ 경기 재개 (탭 복원)');
            }
        }
    }

    cleanup() {
        console.log('🧹 GameManager 정리 시작...');
        
        // 인터벌 정리
        this.intervals.forEach(interval => {
            clearInterval(interval);
        });
        this.intervals.clear();

        // 옵저버 정리
        this.observers.forEach(observer => {
            if (observer.disconnect) {
                observer.disconnect();
            }
        });
        this.observers.clear();

        // 이벤트 리스너 정리
        this.eventListeners.forEach((handler, event) => {
            window.removeEventListener(event, handler);
        });
        this.eventListeners.clear();

        // 시스템별 정리
        this.systems.forEach((system, name) => {
            if (system.cleanup && typeof system.cleanup === 'function') {
                try {
                    system.cleanup();
                } catch (error) {
                    console.error(`${name} 시스템 정리 오류:`, error);
                }
            }
        });

        console.log('✅ GameManager 정리 완료');
    }

    // ===========================================
    // 유틸리티 메서드들
    // ===========================================

    getSystemStatus() {
        const status = {
            version: this.version,
            initialized: this.initialized,
            systemCount: this.systems.size,
            intervalCount: this.intervals.size,
            observerCount: this.observers.size,
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB',
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + 'MB'
            } : 'N/A'
        };

        return status;
    }

    debugInfo() {
        console.group('🔍 GameManager 디버그 정보');
        console.log('상태:', this.getSystemStatus());
        console.log('게임 상태:', this.gameState);
        console.log('시스템들:', Array.from(this.systems.keys()));
        console.groupEnd();
    }
}

// 전역 게임 매니저 인스턴스 생성
window.gameManager = new GameManager();

// 자동 초기화 (DOM 로드 후)
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM 로드됨, GameManager 초기화 시작...');
    
    // 잠시 대기 (다른 스크립트들이 로드되도록)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        const success = await window.gameManager.initialize();
        if (success) {
            console.log('🎉 게임 매니저 완전 초기화 완료!');
            
            // 기존 gameData를 gameManager로 마이그레이션
            if (window.gameData) {
                Object.assign(window.gameManager.gameState, window.gameData);
                console.log('📦 기존 gameData 마이그레이션 완료');
            }
        }
    } catch (error) {
        console.error('💥 게임 매니저 초기화 중 오류:', error);
    }
});

// 디버깅용 전역 함수들
window.debugGameManager = () => window.gameManager.debugInfo();
window.getGameStatus = () => window.gameManager.getSystemStatus();
window.cleanupGame = () => window.gameManager.cleanup();