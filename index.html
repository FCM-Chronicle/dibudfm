<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Football Manager 2.0</title>
    
    <!-- 기본 스타일 -->
    <style>
        /* 기본 레이아웃 스타일 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .game-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            min-height: 100vh;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
        }

        .game-header {
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: white;
            padding: 20px;
            text-align: center;
            position: relative;
        }

        .game-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .game-subtitle {
            font-size: 14px;
            opacity: 0.8;
        }

        .system-status {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            cursor: pointer;
        }

        .system-status.ready {
            background: rgba(40, 167, 69, 0.8);
        }

        .system-status.loading {
            background: rgba(255, 193, 7, 0.8);
        }

        .system-status.error {
            background: rgba(220, 53, 69, 0.8);
        }

        .tab-navigation {
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            padding: 0 20px;
            display: flex;
            overflow-x: auto;
        }

        .tab-btn {
            background: none;
            border: none;
            padding: 15px 20px;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
            font-weight: 500;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .tab-btn:hover {
            background: rgba(0, 123, 255, 0.1);
        }

        .tab-btn.active {
            border-bottom-color: #007bff;
            color: #007bff;
            background: rgba(0, 123, 255, 0.05);
        }

        .tab-content {
            padding: 20px;
            min-height: 600px;
        }

        .tab-panel {
            display: none;
        }

        .tab-panel.active {
            display: block;
        }

        .loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 400px;
            gap: 20px;
        }

        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error-screen {
            text-align: center;
            padding: 40px;
            color: #dc3545;
        }

        .debug-panel {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 12px;
            max-width: 300px;
            z-index: 9999;
            display: none;
        }

        .debug-panel.show {
            display: block;
        }

        .debug-toggle {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11px;
            z-index: 10000;
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
            .game-container {
                margin: 0;
            }

            .game-header {
                padding: 15px;
            }

            .game-title {
                font-size: 24px;
            }

            .system-status {
                position: static;
                margin-top: 10px;
                display: inline-block;
            }

            .tab-navigation {
                padding: 0 10px;
            }

            .tab-btn {
                padding: 12px 15px;
                font-size: 14px;
            }

            .tab-content {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="game-container">
        <!-- 게임 헤더 -->
        <header class="game-header">
            <h1 class="game-title">⚽ Enhanced Football Manager 2.0</h1>
            <p class="game-subtitle">향상된 축구 매니저 게임 - AI 이적, 유스 아카데미, 업적 시스템</p>
            <div class="system-status loading" id="systemStatus" onclick="toggleDebugPanel()">
                시스템 로딩 중...
            </div>
        </header>

        <!-- 탭 네비게이션 -->
        <nav class="tab-navigation">
            <button class="tab-btn active" data-tab="home">
                🏠 홈
            </button>
            <button class="tab-btn" data-tab="team">
                👥 팀 관리
            </button>
            <button class="tab-btn" data-tab="match">
                ⚽ 경기
            </button>
            <button class="tab-btn" data-tab="transfer">
                💰 이적 시장
            </button>
            <button class="tab-btn" data-tab="youth">
                🎓 유스 아카데미
            </button>
            <button class="tab-btn" data-tab="achievements">
                🏆 업적
            </button>
            <button class="tab-btn" data-tab="social">
                📱 SNS
            </button>
            <button class="tab-btn" data-tab="settings">
                ⚙️ 설정
            </button>
        </nav>

        <!-- 탭 콘텐츠 -->
        <main class="tab-content">
            <!-- 홈 탭 -->
            <div class="tab-panel active" data-panel="home">
                <div id="homeContent">
                    <div class="loading-screen">
                        <div class="loading-spinner"></div>
                        <p>게임 시스템을 초기화하고 있습니다...</p>
                    </div>
                </div>
            </div>

            <!-- 팀 관리 탭 -->
            <div class="tab-panel" data-panel="team">
                <div id="teamContent">
                    <h2>👥 팀 관리</h2>
                    <div id="teamManagement">
                        <!-- 팀 선택 및 스쿼드 관리 내용이 여기에 로드됩니다 -->
                    </div>
                </div>
            </div>

            <!-- 경기 탭 -->
            <div class="tab-panel" data-panel="match">
                <div id="matchContent">
                    <h2>⚽ 경기</h2>
                    <div id="matchSystem">
                        <!-- 경기 시스템 내용이 여기에 로드됩니다 -->
                    </div>
                </div>
            </div>

            <!-- 이적 시장 탭 -->
            <div class="tab-panel" data-panel="transfer">
                <div id="transferContent">
                    <h2>💰 이적 시장</h2>
                    <div id="transferGrid">
                        <!-- 이적 시장 내용이 여기에 로드됩니다 -->
                    </div>
                </div>
            </div>

            <!-- 유스 아카데미 탭 -->
            <div class="tab-panel" data-panel="youth">
                <div id="youthContent">
                    <h2>🎓 유스 아카데미</h2>
                    <div id="youthGrid">
                        <!-- 유스 아카데미 내용이 여기에 로드됩니다 -->
                    </div>
                </div>
            </div>

            <!-- 업적 탭 -->
            <div class="tab-panel" data-panel="achievements">
                <div id="achievementsContent">
                    <h2>🏆 업적</h2>
                    <div class="achievement-filters">
                        <button class="filter-btn active" data-filter="all">전체</button>
                        <button class="filter-btn" data-filter="unlocked">달성됨</button>
                        <button class="filter-btn" data-filter="locked">미달성</button>
                        <button class="filter-btn" data-filter="victory">승리</button>
                        <button class="filter-btn" data-filter="management">경영</button>
                        <button class="filter-btn" data-filter="development">육성</button>
                    </div>
                    <div class="achievement-progress-header">
                        <div class="progress-info">
                            진행도: <span id="achievementCountDisplay">0</span>/<span id="achievementTotalCount">0</span>
                            (<span id="achievementProgressText">0%</span>)
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar">
                                <div class="progress-fill" id="achievementProgressBar" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                    <div id="achievementsGrid">
                        <!-- 업적 내용이 여기에 로드됩니다 -->
                    </div>
                </div>
            </div>

            <!-- SNS 탭 -->
            <div class="tab-panel" data-panel="social">
                <div id="socialContent">
                    <h2>📱 SNS</h2>
                    <div class="social-header">
                        <div class="social-stats">
                            <div class="stat-item">
                                팔로워: <span id="followerCount">0</span>
                            </div>
                            <div class="stat-item">
                                포스트: <span id="postCount">0</span>
                            </div>
                        </div>
                        <div class="trending-section">
                            <h4>🔥 트렌딩</h4>
                            <div id="trendingTopics">
                                <!-- 트렌딩 토픽이 여기에 표시됩니다 -->
                            </div>
                        </div>
                    </div>
                    <div id="socialFeed">
                        <!-- SNS 피드가 여기에 로드됩니다 -->
                    </div>
                </div>
            </div>

            <!-- 설정 탭 -->
            <div class="tab-panel" data-panel="settings">
                <div id="settingsContent">
                    <h2>⚙️ 설정</h2>
                    <div class="settings-content">
                        <div class="settings-section">
                            <h4>🎮 게임 정보</h4>
                            <div class="game-info">
                                <div>버전: <span id="gameVersion">2.0.0</span></div>
                                <div>시스템 상태: <span id="systemStatusText">초기화 중</span></div>
                                <div>로드된 시스템: <span id="loadedSystemsCount">0</span></div>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h4>💾 데이터 관리</h4>
                            <div class="data-controls">
                                <button class="btn" onclick="saveGameData()">게임 저장</button>
                                <button class="btn" onclick="loadGameData()">게임 불러오기</button>
                                <button class="btn" onclick="resetGameData()" style="background: #dc3545;">게임 초기화</button>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h4>🔧 디버그</h4>
                            <div class="debug-controls">
                                <button class="btn" onclick="toggleDebugPanel()">디버그 패널 토글</button>
                                <button class="btn" onclick="checkSystemStatus()">시스템 상태 확인</button>
                                <button class="btn" onclick="performSystemCleanup()">메모리 정리</button>
                            </div>
                        </div>
                        
                        <!-- 음악 컨트롤이 여기에 추가됩니다 -->
                        
                        <!-- 업적 요약이 여기에 추가됩니다 -->
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- 디버그 패널 -->
    <div class="debug-panel" id="debugPanel">
        <div>시스템 상태: <span id="debugSystemStatus">-</span></div>
        <div>메모리 사용량: <span id="debugMemoryUsage">-</span></div>
        <div>활성 시스템: <span id="debugActiveSystems">-</span></div>
        <div>마지막 업데이트: <span id="debugLastUpdate">-</span></div>
    </div>

    <button class="debug-toggle" onclick="toggleDebugPanel()">DEBUG</button>

    <!-- 필수 게임 데이터 (기존 데이터들) -->
    <script>
        // 기존 게임 데이터들을 여기에 포함 (teams, teamNames 등)
        // 또는 별도 파일에서 로드
        
        // 팀 데이터 (예시)
        window.teams = {
            // 기존 팀 데이터들...
        };
        
        window.teamNames = {
            // 기존 팀 이름들...
        };
        
        // 기본 게임 상태
        window.gameData = {
            selectedTeam: null,
            teamMoney: 1000,
            teamMorale: 80,
            // 기존 게임 데이터들...
        };
    </script>

    <!-- 향상된 시스템들 로드 -->
    <script src="gameManager.js"></script>
    <script src="enhancedSocialMedia.js"></script>
    <script src="enhancedAchievements.js"></script>
    <script src="enhancedPlayerGrowth.js"></script>
    <script src="enhancedYouthAcademy.js"></script>
    <script src="enhancedTransferSystem.js"></script>
    <script src="enhancedMusicSystem.js"></script>

    <!-- 기존 게임 시스템들 -->
    <script src="matchSystem.js"></script>
    <script src="formation.js"></script>
    <script src="tactics.js"></script>
    <!-- 기타 기존 스크립트들... -->

    <!-- 메인 스크립트 -->
    <script>
        // ==========================================
        // 메인 게임 초기화 및 UI 관리
        // ==========================================

        let gameInitialized = false;
        let currentTab = 'home';

        // DOM 로드 완료 후 초기화
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('🚀 Enhanced Football Manager 2.0 시작');
            
            // UI 이벤트 리스너 설정
            setupUIEventListeners();
            
            // 게임 초기화 시작
            await initializeGame();
        });

        // UI 이벤트 리스너 설정
        function setupUIEventListeners() {
            // 탭 버튼 이벤트
            const tabButtons = document.querySelectorAll('.tab-btn');
            tabButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tabName = btn.dataset.tab;
                    switchTab(tabName);
                });
            });

            // 키보드 단축키
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey) {
                    switch(e.key) {
                        case '1': switchTab('home'); e.preventDefault(); break;
                        case '2': switchTab('team'); e.preventDefault(); break;
                        case '3': switchTab('match'); e.preventDefault(); break;
                        case '4': switchTab('transfer'); e.preventDefault(); break;
                        case '5': switchTab('youth'); e.preventDefault(); break;
                        case '6': switchTab('achievements'); e.preventDefault(); break;
                        case '7': switchTab('social'); e.preventDefault(); break;
                        case '8': switchTab('settings'); e.preventDefault(); break;
                        case 's': saveGameData(); e.preventDefault(); break;
                        case 'l': loadGameData(); e.preventDefault(); break;
                    }
                }
            });
        }

        // 게임 초기화
        async function initializeGame() {
            try {
                updateSystemStatus('loading', '시스템 초기화 중...');
                
                // GameManager 초기화 대기
                let attempts = 0;
                while (!window.gameManager && attempts < 50) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }

                if (!window.gameManager) {
                    throw new Error('GameManager 로드 실패');
                }

                // GameManager 초기화
                const success = await window.gameManager.initialize();
                if (!success) {
                    throw new Error('GameManager 초기화 실패');
                }

                // UI 초기화
                await initializeUI();
                
                // 홈 화면 설정
                setupHomeTab();
                
                gameInitialized = true;
                updateSystemStatus('ready', '시스템 준비 완료');
                
                console.log('✅ 게임 초기화 완료');
                
            } catch (error) {
                console.error('❌ 게임 초기화 실패:', error);
                updateSystemStatus('error', '초기화 실패');
                showErrorScreen(error.message);
            }
        }

        // UI 초기화
        async function initializeUI() {
            // 각 탭의 초기 내용 설정
            await Promise.all([
                initializeTeamTab(),
                initializeMatchTab(),
                initializeTransferTab(),
                initializeYouthTab(),
                initializeAchievementsTab(),
                initializeSocialTab(),
                initializeSettingsTab()
            ]);
        }

        // 탭 전환
        function switchTab(tabName) {
            if (currentTab === tabName) return;

            // 탭 버튼 활성화 상태 변경
            const tabButtons = document.querySelectorAll('.tab-btn');
            const tabPanels = document.querySelectorAll('.tab-panel');

            tabButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabName);
            });

            tabPanels.forEach(panel => {
                panel.classList.toggle('active', panel.dataset.panel === tabName);
            });

            currentTab = tabName;

            // 탭별 업데이트 로직
            updateTabContent(tabName);

            // 음악 시스템에 탭 변경 알림
            if (window.musicSystem && window.musicSystem.onTabChange) {
                window.musicSystem.onTabChange(tabName);
            }
        }

        // 탭 콘텐츠 업데이트
        function updateTabContent(tabName) {
            switch(tabName) {
                case 'transfer':
                    if (window.transferSystem && window.transferSystem.updateTransferTab) {
                        window.transferSystem.updateTransferTab();
                    }
                    break;
                case 'youth':
                    if (window.youthAcademy && window.youthAcademy.updateYouthTab) {
                        window.youthAcademy.updateYouthTab();
                    }
                    break;
                case 'achievements':
                    if (window.achievementSystem && window.achievementSystem.updateAchievementsTab) {
                        window.achievementSystem.updateAchievementsTab();
                    }
                    break;
                case 'social':
                    if (window.socialMediaSystem && window.socialMediaSystem.updateSocialDisplay) {
                        window.socialMediaSystem.updateSocialDisplay();
                    }
                    break;
            }
        }

        // 각 탭 초기화 함수들
        async function initializeTeamTab() {
            const teamContent = document.getElementById('teamManagement');
            teamContent.innerHTML = `
                <div class="team-selection">
                    <h3>팀 선택</h3>
                    <div id="teamSelector">
                        <!-- 팀 선택 UI가 여기에 로드됩니다 -->
                    </div>
                </div>
                <div class="squad-management">
                    <h3>스쿼드 관리</h3>
                    <div id="squadDisplay">
                        <!-- 스쿼드 UI가 여기에 로드됩니다 -->
                    </div>
                </div>
            `;
        }

        async function initializeMatchTab() {
            const matchContent = document.getElementById('matchSystem');
            matchContent.innerHTML = `
                <div class="match-setup">
                    <h3>경기 준비</h3>
                    <div id="matchSetup">
                        <!-- 경기 설정 UI가 여기에 로드됩니다 -->
                    </div>
                </div>
                <div class="match-display">
                    <h3>경기 진행</h3>
                    <div id="matchDisplay">
                        <!-- 경기 화면이 여기에 로드됩니다 -->
                    </div>
                </div>
            `;
        }

        async function initializeTransferTab() {
            // 이적 시스템이 자체적으로 UI를 관리
        }

        async function initializeYouthTab() {
            // 유스 아카데미가 자체적으로 UI를 관리
        }

        async function initializeAchievementsTab() {
            // 업적 시스템이 자체적으로 UI를 관리
            const totalCount = document.getElementById('achievementTotalCount');
            if (totalCount && window.achievementSystem) {
                totalCount.textContent = Object.keys(window.achievementSystem.achievements).length;
            }
        }

        async function initializeSocialTab() {
            // SNS 시스템이 자체적으로 UI를 관리
        }

        async function initializeSettingsTab() {
            // 설정 탭은 각 시스템이 자동으로 추가
            updateGameInfo();
        }

        // 홈 탭 설정
        function setupHomeTab() {
            const homeContent = document.getElementById('homeContent');
            homeContent.innerHTML = `
                <div class="welcome-section">
                    <h2>⚽ Enhanced Football Manager에 오신 것을 환영합니다!</h2>
                    <p>새롭게 향상된 시스템들을 경험해보세요.</p>
                </div>
                
                <div class="quick-stats">
                    <div class="stat-card">
                        <h3>💰 팀 자금</h3>
                        <div class="stat-value" id="homeTeamMoney">-</div>
                    </div>
                    <div class="stat-card">
                        <h3>🔥 팀 사기</h3>
                        <div class="stat-value" id="homeTeamMorale">-</div>
                    </div>
                    <div class="stat-card">
                        <h3>🏆 달성 업적</h3>
                        <div class="stat-value" id="homeAchievements">-</div>
                    </div>
                    <div class="stat-card">
                        <h3>🎓 유스 선수</h3>
                        <div class="stat-value" id="homeYouthCount">-</div>
                    </div>
                </div>
                
                <div class="recent-activity">
                    <h3>📋 최근 활동</h3>
                    <div id="recentActivityList">
                        <!-- 최근 활동 목록이 여기에 표시됩니다 -->
                    </div>
                </div>
                
                <div class="quick-actions">
                    <h3>⚡ 빠른 작업</h3>
                    <div class="action-buttons">
                        <button class="btn" onclick="switchTab('team')">팀 관리</button>
                        <button class="btn" onclick="switchTab('match')">경기 시작</button>
                        <button class="btn" onclick="switchTab('transfer')">이적 시장</button>
                        <button class="btn" onclick="switchTab('youth')">유스 아카데미</button>
                    </div>
                </div>
            `;
            
            // 홈 화면 정보 업데이트
            updateHomeStats();
        }

        // 홈 화면 통계 업데이트
        function updateHomeStats() {
            const gameState = window.gameManager?.gameState;
            if (!gameState) return;

            // 팀 자금
            const moneyElement = document.getElementById('homeTeamMoney');
            if (moneyElement) {
                moneyElement.textContent = gameState.teamMoney + '억원';
            }

            // 팀 사기
            const moraleElement = document.getElementById('homeTeamMorale');
            if (moraleElement) {
                moraleElement.textContent = gameState.teamMorale + '%';
            }

            // 달성 업적
            const achievementsElement = document.getElementById('homeAchievements');
            if (achievementsElement && window.achievementSystem) {
                const unlockedCount = Object.values(window.achievementSystem.achievements).filter(a => a.unlocked).length;
                const totalCount = Object.keys(window.achievementSystem.achievements).length;
                achievementsElement.textContent = `${unlockedCount}/${totalCount}`;
            }

            // 유스 선수
            const youthElement = document.getElementById('homeYouthCount');
            if (youthElement && window.youthAcademy) {
                youthElement.textContent = window.youthAcademy.youthPlayers.length + '명';
            }
        }

        // 시스템 상태 업데이트
        function updateSystemStatus(status, message) {
            const statusElement = document.getElementById('systemStatus');
            if (statusElement) {
                statusElement.className = `system-status ${status}`;
                statusElement.textContent = message;
            }
        }

        // 게임 정보 업데이트
        function updateGameInfo() {
            const versionElement = document.getElementById('gameVersion');
            const statusElement = document.getElementById('systemStatusText');
            const systemsElement = document.getElementById('loadedSystemsCount');

            if (versionElement) versionElement.textContent = '2.0.0';
            if (statusElement) statusElement.textContent = gameInitialized ? '준비 완료' : '초기화 중';
            if (systemsElement && window.gameManager) {
                systemsElement.textContent = window.gameManager.systems.size;
            }
        }

        // 에러 화면 표시
        function showErrorScreen(message) {
            const homeContent = document.getElementById('homeContent');
            homeContent.innerHTML = `
                <div class="error-screen">
                    <h2>❌ 시스템 오류</h2>
                    <p>${message}</p>
                    <button class="btn" onclick="location.reload()">페이지 새로고침</button>
                </div>
            `;
        }

        // ==========================================
        // 디버그 및 유틸리티 함수들
        // ==========================================

        function toggleDebugPanel() {
            const debugPanel = document.getElementById('debugPanel');
            debugPanel.classList.toggle('show');
            
            if (debugPanel.classList.contains('show')) {
                updateDebugInfo();
                // 5초마다 디버그 정보 업데이트
                window.debugInterval = setInterval(updateDebugInfo, 5000);
            } else {
                if (window.debugInterval) {
                    clearInterval(window.debugInterval);
                }
            }
        }

        function updateDebugInfo() {
            const gameManager = window.gameManager;
            if (!gameManager) return;

            const status = gameManager.getSystemStatus();
            
            document.getElementById('debugSystemStatus').textContent = gameManager.initialized ? '정상' : '초기화 중';
            document.getElementById('debugMemoryUsage').textContent = status.memoryUsage || 'N/A';
            document.getElementById('debugActiveSystems').textContent = status.systemCount;
            document.getElementById('debugLastUpdate').textContent = new Date().toLocaleTimeString();
        }

        function checkSystemStatus() {
            if (window.gameManager) {
                window.gameManager.debugInfo();
            }
            
            console.group('🔍 전체 시스템 상태');
            console.log('GameManager:', window.gameManager?.getSystemStatus());
            console.log('Achievement System:', window.achievementSystem?.getDebugInfo());
            console.log('Youth Academy:', window.youthAcademy?.getSystemStatus());
            console.log('Transfer System:', window.transferSystem?.getSystemStatus());
            console.log('Music System:', window.musicSystem?.getSystemStatus());
            console.groupEnd();
        }

        function performSystemCleanup() {
            if (window.gameManager) {
                window.gameManager.systems.forEach((system, name) => {
                    if (system.performMemoryCleanup) {
                        system.performMemoryCleanup();
                        console.log(`🧹 ${name} 메모리 정리 완료`);
                    }
                });
            }
            
            // 가비지 컬렉션 강제 실행 (Chrome에서만 작동)
            if (window.gc) {
                window.gc();
                console.log('🗑️ 가비지 컬렉션 실행됨');
            }
            
            alert('메모리 정리가 완료되었습니다.');
        }

        function saveGameData() {
            try {
                if (!window.gameManager) {
                    alert('게임 매니저가 초기화되지 않았습니다.');
                    return;
                }

                const saveData = window.gameManager.getSaveData();
                localStorage.setItem('footballManager_manualSave', JSON.stringify(saveData));
                
                alert('게임이 저장되었습니다!');
                console.log('💾 수동 저장 완료');
                
            } catch (error) {
                console.error('❌ 저장 실패:', error);
                alert('저장에 실패했습니다: ' + error.message);
            }
        }

        function loadGameData() {
            try {
                const saved = localStorage.getItem('footballManager_manualSave');
                if (!saved) {
                    alert('저장된 게임 데이터가 없습니다.');
                    return;
                }

                if (!window.gameManager) {
                    alert('게임 매니저가 초기화되지 않았습니다.');
                    return;
                }

                const saveData = JSON.parse(saved);
                window.gameManager.loadSaveData(saveData);
                
                // UI 업데이트
                updateHomeStats();
                updateTabContent(currentTab);
                
                alert('게임 데이터를 불러왔습니다!');
                console.log('💾 수동 로드 완료');
                
            } catch (error) {
                console.error('❌ 로드 실패:', error);
                alert('불러오기에 실패했습니다: ' + error.message);
            }
        }

        function resetGameData() {
            if (!confirm('정말로 게임을 초기화하시겠습니까? 모든 데이터가 삭제됩니다.')) {
                return;
            }

            try {
                // 로컬 스토리지 정리
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.includes('footballManager')) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                });

                alert('게임이 초기화되었습니다. 페이지를 새로고침합니다.');
                location.reload();
                
            } catch (error) {
                console.error('❌ 초기화 실패:', error);
                alert('초기화에 실패했습니다: ' + error.message);
            }
        }

        // ==========================================
        // 주기적 업데이트 및 이벤트 처리
        // ==========================================

        // 10초마다 홈 화면 통계 업데이트
        setInterval(() => {
            if (currentTab === 'home' && gameInitialized) {
                updateHomeStats();
            }
        }, 10000);

        // 5분마다 게임 정보 업데이트
        setInterval(() => {
            if (gameInitialized) {
                updateGameInfo();
            }
        }, 300000);

        // 페이지 언로드 시 정리
        window.addEventListener('beforeunload', () => {
            if (window.gameManager) {
                window.gameManager.cleanup();
            }
        });

        // 에러 캐처
        window.addEventListener('error', (event) => {
            console.error('💥 전역 에러:', event.error);
            
            // 치명적 에러인 경우 사용자에게 알림
            if (!gameInitialized) {
                updateSystemStatus('error', '시스템 오류 발생');
            }
        });

        // Promise 에러 캐처
        window.addEventListener('unhandledrejection', (event) => {
            console.error('💥 Promise 에러:', event.reason);
        });

        // ==========================================
        // 전역 함수들 (기존 시스템과의 호환성)
        // ==========================================

        // 기존 함수들과의 호환성을 위한 전역 함수들
        window.switchTab = switchTab;
        window.saveGameData = saveGameData;
        window.loadGameData = loadGameData;
        window.resetGameData = resetGameData;
        window.checkSystemStatus = checkSystemStatus;
        window.performSystemCleanup = performSystemCleanup;
        window.toggleDebugPanel = toggleDebugPanel;

        // 개발자 도구용 함수들
        window.dev = {
            gameManager: () => window.gameManager,
            systems: () => window.gameManager?.systems,
            status: () => checkSystemStatus(),
            cleanup: () => performSystemCleanup(),
            save: () => saveGameData(),
            load: () => loadGameData(),
            reset: () => resetGameData()
        };

        console.log('🛠️ 개발자 도구: window.dev 객체 사용 가능');
    </script>

    <!-- 추가 스타일 -->
    <style>
        /* 홈 화면 스타일 */
        .welcome-section {
            text-align: center;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            margin-bottom: 30px;
        }

        .welcome-section h2 {
            margin-bottom: 10px;
            font-size: 24px;
        }

        .quick-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-2px);
        }

        .stat-card h3 {
            margin-bottom: 10px;
            color: #666;
            font-size: 14px;
        }

        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
        }

        .recent-activity, .quick-actions {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .recent-activity h3, .quick-actions h3 {
            margin-bottom: 15px;
            color: #495057;
        }

        .action-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .action-buttons .btn {
            flex: 1;
            min-width: 120px;
        }

        /* 소셜 헤더 스타일 */
        .social-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .social-stats {
            display: flex;
            gap: 20px;
        }

        .stat-item {
            font-weight: 500;
            color: #495057;
        }

        .trending-section h4 {
            margin-bottom: 10px;
            color: #495057;
        }

        /* 업적 진행도 헤더 */
        .achievement-progress-header {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .progress-info {
            margin-bottom: 10px;
            font-weight: 500;
            color: #495057;
        }

        .progress-bar-container {
            width: 100%;
        }

        .progress-bar {
            background: #e9ecef;
            border-radius: 10px;
            height: 10px;
            overflow: hidden;
        }

        .progress-fill {
            background: linear-gradient(90deg, #28a745, #20c997);
            height: 100%;
            border-radius: 10px;
            transition: width 0.8s ease;
        }

        /* 필터 버튼들 */
        .achievement-filters {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 20px;
            justify-content: center;
        }

        /* 반응형 개선 */
        @media (max-width: 768px) {
            .quick-stats {
                grid-template-columns: repeat(2, 1fr);
            }

            .action-buttons {
                flex-direction: column;
            }

            .action-buttons .btn {
                min-width: auto;
            }

            .social-header {
                flex-direction: column;
                gap: 15px;
            }

            .achievement-filters {
                justify-content: flex-start;
            }

            .filter-btn {
                font-size: 12px;
                padding: 6px 12px;
            }
        }
    </style>
</head>
</body>
</html>