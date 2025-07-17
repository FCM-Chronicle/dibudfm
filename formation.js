// formation.js - 포메이션 관리 시스템

// 포메이션 데이터 정의
const formationData = {
    "433": {
        name: "4-3-3 (밸런스)",
        description: "균형잡힌 기본 포메이션",
        gk: { x: 50, y: 5 },
        df: [
            { x: 42, y: 20, label: "LB", use: true },
            { x: 47, y: 20, label: "CB", use: true },
            { x: 53, y: 20, label: "CB", use: true },
            { x: 58, y: 20, label: "RB", use: true }
        ],
        mf: [
            { x: 45, y: 45, label: "LCM", use: true },
            { x: 50, y: 45, label: "CM", use: true },
            { x: 55, y: 45, label: "RCM", use: true }
        ],
        fw: [
            { x: 45, y: 80, label: "LW", use: true },
            { x: 50, y: 80, label: "ST", use: true },
            { x: 55, y: 80, label: "RW", use: true }
        ]
    },
    
    "343": {
        name: "3-4-3 (공격적)",
        description: "공격적인 3백 시스템",
        gk: { x: 50, y: 5 },
        df: [
            { x: 57, y: 20, label: "LCB", use: true },
            { x: 60, y: 20, label: "CB", use: true },
            { x: 63, y: 20, label: "RCB", use: true },
            { x: -100, y: -100, label: "숨김", use: false }
        ],
        mf: [
            { x: 35, y: 45, label: "LM", use: true },
            { x: 42, y: 45, label: "CM", use: true },
            { x: 46, y: 45, label: "CM", use: true },
            { x: 68, y: 45, label: "RM", use: true }
        ],
        fw: [
            { x: 44, y: 80, label: "LW", use: true },
            { x: 50, y: 80, label: "ST", use: true },
            { x: 56, y: 80, label: "RW", use: true }
        ],
        redistribution: {
            hidden: ["df-3"],
            added: ["mf-3"]
        }
    },
    
    "424": {
        name: "4-2-4 (극공격)",
        description: "극도로 공격적인 포메이션",
        gk: { x: 50, y: 5 },
        df: [
            { x: 42, y: 20, label: "LB", use: true },
            { x: 47, y: 20, label: "CB", use: true },
            { x: 53, y: 20, label: "CB", use: true },
            { x: 58, y: 20, label: "RB", use: true }
        ],
        mf: [
            { x: 49, y: 45, label: "CM", use: true },
            { x: -100, y: -100, label: "숨김", use: false },
            { x: 51, y: 45, label: "CM", use: true }
        ],
        fw: [
            { x: 35, y: 75, label: "LW", use: true },
            { x: 45, y: 80, label: "ST", use: true },
            { x: 48, y: 80, label: "ST", use: true },
            { x: 72, y: 75, label: "RW", use: true }
        ],
        redistribution: {
            hidden: ["mf-1"],
            added: ["fw-3"]
        }
    },
    
    "4222": {
        name: "4-2-2-2 (더블피벗)",
        description: "미드필더 2라인 시스템",
        gk: { x: 50, y: 5 },
        df: [
            { x: 42, y: 20, label: "LB", use: true },
            { x: 47, y: 20, label: "CB", use: true },
            { x: 53, y: 20, label: "CB", use: true },
            { x: 58, y: 20, label: "RB", use: true }
        ],
        mf: [
            { x: 60, y: 40, label: "CDM", use: true },
            { x: 20, y: 58, label: "CAM", use: true },
            { x: 40, y: 40, label: "CDM", use: true },
            { x: 70, y: 58, label: "CAM", use: true }
        ],
        fw: [
            { x: 45, y: 80, label: "ST", use: true },
            { x: -100, y: -100, label: "숨김", use: false },
            { x: 55, y: 80, label: "ST", use: true }
        ],
        redistribution: {
            hidden: ["fw-1"],
            added: ["mf-3"]
        }
    },
    
    "4231": {
        name: "4-2-3-1 (CAM)",
        description: "공격형 미드필더 3명 시스템",
        gk: { x: 50, y: 5 },
        df: [
            { x: 42, y: 20, label: "LB", use: true },
            { x: 47, y: 20, label: "CB", use: true },
            { x: 53, y: 20, label: "CB", use: true },
            { x: 58, y: 20, label: "RB", use: true }
        ],
        mf: [
            { x: 60, y: 40, label: "CDM", use: true },
            { x: 50, y: 65, label: "CAM", use: true },
            { x: 40, y: 40, label: "CDM", use: true },
            { x: 25, y: 65, label: "LW", use: true, canUse: ["MF", "FW"] },
            { x: 75, y: 65, label: "RW", use: true, canUse: ["MF", "FW"] }
        ],
        fw: [
            { x: 50, y: 85, label: "ST", use: true },
            { x: -100, y: -100, label: "숨김", use: false },
            { x: -100, y: -100, label: "숨김", use: false }
        ],
        redistribution: {
            hidden: ["fw-1", "fw-2"],
            added: ["mf-3", "mf-4"]
        }
    }
};

// 현재 포메이션
let currentFormation = "433";

// 포메이션 관리자 클래스
class FormationManager {
    constructor() {
        this.currentFormation = "433";
        this.dynamicElements = new Set();
    }
    
    // 포메이션 변경
    changeFormation(newFormation) {
        if (!formationData[newFormation]) {
            console.error(`포메이션 ${newFormation}을 찾을 수 없습니다.`);
            return false;
        }
        
        // 현재 배치된 선수들 백업
        const currentSquad = this.backupCurrentSquad();
        
        // 포메이션 변경
        this.currentFormation = newFormation;
        currentFormation = newFormation;
        
        // 게임 데이터에 저장
        if (typeof gameData !== 'undefined') {
            gameData.currentFormation = newFormation;
        }
        
        // 새 포메이션 적용
        this.applyFormation(newFormation);
        
        // 선수들 재배치
        this.redistributePlayers(currentSquad, newFormation);
        
        // 화면 업데이트
        this.updateDisplay();
        
        console.log(`포메이션이 ${formationData[newFormation].name}으로 변경되었습니다.`);
        return true;
    }
    
    // 현재 스쿼드 백업
    backupCurrentSquad() {
        const backup = {
            gk: null,
            df: [],
            mf: [],
            fw: [],
            virtual: {}
        };
        
        if (typeof gameData !== 'undefined' && gameData.squad) {
            backup.gk = gameData.squad.gk;
            backup.df = [...gameData.squad.df];
            backup.mf = [...gameData.squad.mf];
            backup.fw = [...gameData.squad.fw];
        }
        
        // 가상 포지션 백업
        if (typeof gameData !== 'undefined' && gameData.virtualSquad) {
            backup.virtual = {...gameData.virtualSquad};
        }
        
        return backup;
    }
    
    // 포메이션 적용
    applyFormation(formationKey) {
        const formation = formationData[formationKey];
        
        // 1단계: 기존 동적 요소들 정리
        this.cleanupDynamicElements();
        
        // 2단계: 모든 기본 포지션 표시
        this.showAllBasicPositions();
        
        // 3단계: 숨길 포지션들 처리
        if (formation.redistribution && formation.redistribution.hidden) {
            formation.redistribution.hidden.forEach(slotId => {
                this.hidePosition(slotId);
            });
        }
        
        // 4단계: 추가할 포지션들 생성
        if (formation.redistribution && formation.redistribution.added) {
            formation.redistribution.added.forEach(slotId => {
                this.createOrShowPosition(slotId, formation);
            });
        }
        
        // 5단계: 모든 포지션 좌표 적용
        this.applyPositionCoordinates(formation);
    }
    
    // 동적 요소들 정리
    cleanupDynamicElements() {
        this.dynamicElements.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        this.dynamicElements.clear();
    }
    
    // 모든 기본 포지션 표시
    showAllBasicPositions() {
        const positions = ['.gk', '.df-1', '.df-2', '.df-3', '.df-4', 
                          '.mf-1', '.mf-2', '.mf-3', '.fw-1', '.fw-2', '.fw-3'];
        
        positions.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'block';
            }
        });
    }
    
    // 포지션 숨기기
    hidePosition(slotId) {
        const [posType, indexStr] = slotId.split('-');
        const element = document.querySelector(`.${posType}-${parseInt(indexStr) + 1}`);
        if (element) {
            element.style.display = 'none';
        }
    }
    
    // 포지션 생성 또는 표시
    createOrShowPosition(slotId, formation) {
        const [posType, indexStr] = slotId.split('-');
        const index = parseInt(indexStr);
        
        let element = document.querySelector(`.${posType}-${index + 1}`);
        
        // 요소가 없으면 동적 생성
        if (!element) {
            element = this.createPositionElement(posType, index, formation);
        } else {
            // 기존 요소가 있으면 표시
            element.style.display = 'block';
        }
        
        return element;
    }
    
    // 포지션 요소 생성
    createPositionElement(posType, index, formation) {
        const field = document.querySelector('.field');
        if (!field) return null;
        
        const element = document.createElement('div');
        element.className = `position ${posType} ${posType}-${index + 1} dynamic`;
        element.dataset.position = posType;
        element.dataset.index = index;
        
        const slot = document.createElement('div');
        slot.className = 'player-slot';
        
        // 라벨 설정
        const positionData = formation[posType][index];
        if (positionData) {
            slot.textContent = positionData.label;
        }
        
        element.appendChild(slot);
        
        // 클릭 이벤트 등록
        element.addEventListener('click', () => {
            this.handlePositionClick(posType, index, formation);
        });
        
        field.appendChild(element);
        this.dynamicElements.add(element);
        
        return element;
    }
    
    // 포지션 클릭 처리
    handlePositionClick(posType, index, formation) {
        const positionData = formation[posType][index];
        
        if (positionData && positionData.canUse) {
            // 다중 포지션 가능한 경우
            this.openMultiPositionModal(posType, index, positionData.canUse);
        } else {
            // 일반 포지션
            if (typeof openPlayerModal === 'function') {
                openPlayerModal(posType, index);
            }
        }
    }
    
    // 다중 포지션 모달 열기
    openMultiPositionModal(posType, index, allowedPositions) {
        const modal = document.getElementById('playerModal');
        const modalPlayerList = document.getElementById('modalPlayerList');
        
        if (!modal || !modalPlayerList) return;
        
        modalPlayerList.innerHTML = '';
        
        const teamPlayers = teams[gameData.selectedTeam];
        const availablePlayers = teamPlayers.filter(player => 
            allowedPositions.includes(player.position) && 
            !this.isPlayerInSquad(player)
        );
        
        if (availablePlayers.length === 0) {
            modalPlayerList.innerHTML = '<p>배치 가능한 선수가 없습니다.</p>';
        } else {
            availablePlayers.forEach(player => {
                const playerCard = document.createElement('div');
                playerCard.className = 'player-card';
                playerCard.innerHTML = `
                    <div class="name">${player.name}</div>
                    <div class="details">${player.position} | 능력치: ${player.rating} | 나이: ${player.age}</div>
                `;
                
                playerCard.addEventListener('click', () => {
                    this.assignPlayerToPosition(player, posType, index);
                    modal.style.display = 'none';
                });
                
                modalPlayerList.appendChild(playerCard);
            });
        }
        
        modal.style.display = 'block';
    }
    
    // 선수가 스쿼드에 있는지 확인
    isPlayerInSquad(player) {
        if (typeof isPlayerInSquad === 'function') {
            return isPlayerInSquad(player);
        }
        
        // 기본 구현
        const squad = gameData.squad;
        if (!squad) return false;
        
        if (squad.gk && squad.gk.name === player.name) return true;
        
        for (let df of squad.df) {
            if (df && df.name === player.name) return true;
        }
        
        for (let mf of squad.mf) {
            if (mf && mf.name === player.name) return true;
        }
        
        for (let fw of squad.fw) {
            if (fw && fw.name === player.name) return true;
        }
        
        return false;
    }
    
    // 선수를 포지션에 배치
    assignPlayerToPosition(player, posType, index) {
        if (!gameData.squad) return;
        
        if (posType === 'gk') {
            gameData.squad.gk = player;
        } else if (['df', 'mf', 'fw'].includes(posType)) {
            if (!gameData.squad[posType]) {
                gameData.squad[posType] = [];
            }
            gameData.squad[posType][index] = player;
        }
        
        this.updateDisplay();
    }
    
    // 포지션 좌표 적용
    applyPositionCoordinates(formation) {
        // GK 좌표 적용
        const gkElement = document.querySelector('.gk');
        if (gkElement && formation.gk) {
            gkElement.style.left = formation.gk.x + '%';
            gkElement.style.bottom = formation.gk.y + '%';
        }
        
        // DF, MF, FW 좌표 적용
        ['df', 'mf', 'fw'].forEach(posType => {
            if (formation[posType]) {
                formation[posType].forEach((pos, index) => {
                    if (pos.use && pos.x >= 0) {
                        const element = document.querySelector(`.${posType}-${index + 1}`);
                        if (element) {
                            element.style.left = pos.x + '%';
                            element.style.bottom = pos.y + '%';
                            element.style.display = 'block';
                            
                            // 라벨 업데이트
                            const slot = element.querySelector('.player-slot');
                            if (slot && !slot.classList.contains('filled')) {
                                slot.textContent = pos.label;
                            }
                        }
                    }
                });
            }
        });
    }
    
    // 선수들 재배치
    redistributePlayers(backup, newFormationKey) {
        const newFormation = formationData[newFormationKey];
        
        // 기존 스쿼드 초기화
        if (gameData.squad) {
            gameData.squad = {
                gk: null,
                df: [null, null, null, null],
                mf: [null, null, null],
                fw: [null, null, null]
            };
        }
        
        // GK는 항상 유지
        if (backup.gk) {
            gameData.squad.gk = backup.gk;
        }
        
        // 각 포지션별로 재배치
        this.redistributePositionPlayers('df', backup.df, newFormation);
        this.redistributePositionPlayers('mf', backup.mf, newFormation);
        this.redistributePositionPlayers('fw', backup.fw, newFormation);
    }
    
    // 포지션별 선수 재배치
    redistributePositionPlayers(posType, backupPlayers, formation) {
        const availableSlots = formation[posType].filter(pos => pos.use);
        let slotIndex = 0;
        
        for (let player of backupPlayers) {
            if (player && slotIndex < availableSlots.length) {
                const targetIndex = formation[posType].findIndex((pos, idx) => 
                    pos.use && idx >= slotIndex
                );
                
                if (targetIndex >= 0) {
                    gameData.squad[posType][targetIndex] = player;
                    slotIndex = targetIndex + 1;
                }
            }
        }
    }
    
    // 화면 업데이트
    updateDisplay() {
        if (typeof updateFormationDisplay === 'function') {
            updateFormationDisplay();
        }
        
        if (typeof displayTeamPlayers === 'function') {
            displayTeamPlayers();
        }
    }
    
    // 포메이션 정보 가져오기
    getFormationInfo(formationKey) {
        return formationData[formationKey] || null;
    }
    
    // 현재 포메이션 반환
    getCurrentFormation() {
        return this.currentFormation;
    }
    
    // 사용 가능한 포메이션 목록 반환
    getAvailableFormations() {
        return Object.keys(formationData).map(key => ({
            key: key,
            name: formationData[key].name,
            description: formationData[key].description
        }));
    }
}

// 전역 포메이션 매니저 인스턴스
const formationManager = new FormationManager();

// 포메이션 UI 초기화 - 강제로 다시 생성 (새로운 스타일링 적용)
function initializeFormationUI() {
    console.log('🔧 포메이션 UI 강제 생성 시작');
    
    const squadTab = document.getElementById('squad');
    if (!squadTab) {
        console.error('❌ Squad tab을 찾을 수 없습니다!');
        return false;
    }
    
    // 기존 포메이션 선택기 완전 제거
    const existingSelectors = squadTab.querySelectorAll('.formation-selector');
    console.log('🗑️ 기존 선택기 제거:', existingSelectors.length, '개');
    existingSelectors.forEach(selector => selector.remove());
    
    // 포메이션 선택기 생성 (새로운 스타일링)
    const formationSelector = document.createElement('div');
    formationSelector.className = 'formation-selector';
    formationSelector.innerHTML = `
        <div class="formation-selector-inner">
            <div class="formation-label">⚽ 포메이션:</div>
            <select id="formationSelect">
                <option value="433">4-3-3 (밸런스)</option>
                <option value="343">3-4-3 (공격적)</option>
                <option value="424">4-2-4 (극공격)</option>
                <option value="4222">4-2-2-2 (더블피벗)</option>
                <option value="4231">4-2-3-1 (CAM)</option>
            </select>
            <div id="formationDescription">균형잡힌 기본 포메이션</div>
        </div>
    `;
    
    // 스쿼드 탭의 맨 앞에 삽입
    squadTab.insertBefore(formationSelector, squadTab.firstChild);
    
    console.log('✅ 포메이션 선택기 생성 완료');
    
    // 이벤트 리스너 등록
    setTimeout(() => {
        setupFormationEvents();
    }, 100);
    
    return true;
}

// 포메이션 이벤트 설정 함수
function setupFormationEvents() {
    const selectElement = document.getElementById('formationSelect');
    const descriptionElement = document.getElementById('formationDescription');
    
    if (!selectElement) {
        console.error('❌ formationSelect 요소를 찾을 수 없습니다!');
        return;
    }
    
    console.log('✅ formationSelect 발견, 이벤트 리스너 등록');
    
    // 포메이션 변경 이벤트
    selectElement.addEventListener('change', (e) => {
        const newFormation = e.target.value;
        const formationInfo = formationData[newFormation];
        
        console.log('🔄 포메이션 변경:', newFormation);
        
        // 설명 업데이트
        if (descriptionElement && formationInfo) {
            descriptionElement.textContent = formationInfo.description;
        }
        
        // 포메이션 변경
        if (typeof formationManager !== 'undefined' && formationManager.changeFormation(newFormation)) {
            // 성공 시 알림
            setTimeout(() => {
                alert(`✅ 포메이션이 ${formationInfo.name}으로 변경되었습니다!`);
            }, 500);
        } else {
            console.error('❌ 포메이션 변경 실패');
            alert('포메이션 변경에 실패했습니다.');
        }
    });
    
    // 현재 포메이션으로 초기값 설정
    const currentFormationKey = (typeof gameData !== 'undefined' && gameData.currentFormation) 
        ? gameData.currentFormation : "433";
    selectElement.value = currentFormationKey;
    
    // 초기 설명 설정
    if (descriptionElement) {
        const initialFormation = formationData[currentFormationKey];
        if (initialFormation) {
            descriptionElement.textContent = initialFormation.description;
        }
    }
    
    console.log('✅ 이벤트 리스너 설정 완료');
}

// 포메이션 시스템 초기화
function initializeFormationSystem() {
    console.log('🔧 포메이션 시스템 초기화 시작');
    
    // UI 초기화
    initializeFormationUI();
    
    // 현재 포메이션 적용
    const currentFormationKey = (typeof gameData !== 'undefined' && gameData.currentFormation) 
        ? gameData.currentFormation : "433";
    
    formationManager.currentFormation = currentFormationKey;
    formationManager.applyFormation(currentFormationKey);
    
    console.log('✅ 포메이션 시스템이 초기화되었습니다.');
}

// 페이지 로드 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM 로드 완료, 포메이션 시스템 초기화 시작');
    
    // 기존 게임이 로드된 후 포메이션 시스템 초기화
    setTimeout(() => {
        console.log('📝 1단계: 기본 시스템 확인');
        
        // 포메이션 시스템 초기화
        if (typeof initializeFormationSystem === 'function') {
            console.log('🔧 2단계: 포메이션 시스템 초기화');
            initializeFormationSystem();
        }
        
        // UI 강제 생성
        setTimeout(() => {
            console.log('🎨 3단계: UI 강제 생성');
            if (!document.getElementById('formationSelect')) {
                initializeFormationUI();
            }
            
            // 최종 확인
            setTimeout(() => {
                console.log('✅ 4단계: 최종 상태 확인');
                
                const formationSelect = document.getElementById('formationSelect');
                if (!formationSelect) {
                    console.warn('⚠️ 포메이션 드롭다운이 여전히 없음, 한 번 더 시도');
                    initializeFormationUI();
                } else {
                    console.log('🎉 포메이션 시스템 초기화 완료!');
                }
            }, 1000);
        }, 1000);
    }, 1500);
});

// 스쿼드 탭 클릭 시에도 포메이션 UI 확인
document.addEventListener('click', function(e) {
    if (e.target.dataset && e.target.dataset.tab === 'squad') {
        console.log('📂 스쿼드 탭 클릭됨');
        setTimeout(() => {
            const formationSelect = document.getElementById('formationSelect');
            if (!formationSelect) {
                console.log('🔄 스쿼드 탭에서 포메이션 UI 없음, 재생성');
                initializeFormationUI();
            }
        }, 300);
    }
});

// 저장/불러오기 시 포메이션 데이터 포함
if (typeof window !== 'undefined') {
    // 전역 함수로 노출
    window.formationManager = formationManager;
    window.formationData = formationData;
    window.initializeFormationSystem = initializeFormationSystem;
    window.initializeFormationUI = initializeFormationUI;
    
    // 기존 저장 함수 확장
    const originalSaveGame = window.saveGame;
    if (originalSaveGame) {
        window.saveGame = function() {
            // 포메이션 데이터를 gameData에 추가
            if (typeof gameData !== 'undefined') {
                gameData.currentFormation = formationManager.getCurrentFormation();
            }
            return originalSaveGame.apply(this, arguments);
        };
    }
    
    // 기존 게임 불러오기 함수 확장
    const originalLoadGame = window.loadGame;
    if (originalLoadGame) {
        window.loadGame = function() {
            const result = originalLoadGame.apply(this, arguments);
            
            // 포메이션 데이터 복원
            setTimeout(() => {
                if (typeof gameData !== 'undefined' && gameData.currentFormation) {
                    formationManager.changeFormation(gameData.currentFormation);
                }
            }, 1000);
            
            return result;
        };
    }
    
    // 기존 selectTeam 함수 확장
    const originalSelectTeam = window.selectTeam;
    if (originalSelectTeam) {
        window.selectTeam = function(teamKey) {
            const result = originalSelectTeam.apply(this, arguments);
            
            // 포메이션 시스템 초기화
            setTimeout(() => {
                console.log('👥 팀 선택 후 포메이션 시스템 재초기화');
                if (typeof initializeFormationSystem === 'function') {
                    initializeFormationSystem();
                }
                // UI도 강제 재생성
                setTimeout(() => {
                    initializeFormationUI();
                }, 500);
            }, 1000);
            
            return result;
        };
    }
}

// 디버깅용 함수들
function debugFormation() {
    console.log('현재 포메이션:', formationManager.getCurrentFormation());
    console.log('포메이션 정보:', formationManager.getFormationInfo(formationManager.getCurrentFormation()));
    console.log('사용 가능한 포메이션:', formationManager.getAvailableFormations());
}

// 포메이션 시스템 상태 확인 함수
function checkFormationSystem() {
    console.log('🔍 포메이션 시스템 상태 확인:');
    console.log('- Squad tab:', !!document.getElementById('squad'));
    console.log('- Formation selector:', !!document.querySelector('.formation-selector'));
    console.log('- Formation select:', !!document.getElementById('formationSelect'));
    console.log('- formationManager:', typeof formationManager !== 'undefined');
    console.log('- formationData:', typeof formationData !== 'undefined');
    console.log('- gameData:', typeof gameData !== 'undefined');
    
    if (typeof gameData !== 'undefined') {
        console.log('- 현재 포메이션:', gameData.currentFormation);
    }
}

// 포메이션 UI 강제 생성 함수 (개선된 버전)
function forceCreateFormationUI() {
    console.log('🔧 포메이션 UI 강제 생성 시작');
    
    const squadTab = document.getElementById('squad');
    if (!squadTab) {
        console.error('❌ Squad tab을 찾을 수 없습니다!');
        return false;
    }
    
    // 기존 포메이션 선택기 모두 제거
    const existingSelectors = squadTab.querySelectorAll('.formation-selector');
    console.log('🗑️ 기존 선택기 제거:', existingSelectors.length, '개');
    existingSelectors.forEach(selector => selector.remove());
    
    // 새 포메이션 선택기 생성
    const formationSelector = document.createElement('div');
    formationSelector.className = 'formation-selector';
    
    formationSelector.innerHTML = `
        <div class="formation-selector-inner">
            <div class="formation-label">⚽ 포메이션:</div>
            <select id="formationSelect">
                <option value="433">4-3-3 (밸런스)</option>
                <option value="343">3-4-3 (공격적)</option>
                <option value="424">4-2-4 (극공격)</option>
                <option value="4222">4-2-2-2 (더블피벗)</option>
                <option value="4231">4-2-3-1 (CAM)</option>
            </select>
            <div id="formationDescription">균형잡힌 기본 포메이션</div>
        </div>
    `;
    
    // 스쿼드 탭 맨 앞에 삽입
    squadTab.insertBefore(formationSelector, squadTab.firstChild);
    
    console.log('✅ 포메이션 선택기 생성 완료');
    
    // 이벤트 리스너 등록
    setTimeout(() => {
        setupFormationEvents();
    }, 100);
    
    return true;
}

// 전역으로 노출 (디버깅용)
if (typeof window !== 'undefined') {
    window.debugFormation = debugFormation;
    window.checkFormationSystem = checkFormationSystem;
    window.forceCreateFormationUI = forceCreateFormationUI;
    window.setupFormationEvents = setupFormationEvents;
}