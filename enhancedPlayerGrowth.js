// enhancedPlayerGrowth.js - 향상된 선수 성장 시스템 (GameManager 호환)

class EnhancedPlayerGrowthSystem {
    constructor() {
        this.growthData = new Map();
        this.growthHistory = new Map(); // 성장 이력 추적
        this.seasonalGrowthBonus = 1.0;
        this.teamTrainingLevel = 1;
        this.isInitialized = false;
        
        // 성장 이벤트 콜백들
        this.growthCallbacks = new Set();
        
        console.log('📈 향상된 선수 성장 시스템 생성됨');
    }

    // ===========================================
    // 초기화 및 설정
    // ===========================================

    initialize() {
        if (this.isInitialized) {
            console.warn('⚠️ PlayerGrowthSystem 이미 초기화됨');
            return;
        }

        this.setupGameManagerIntegration();
        this.initializeTeamTraining();
        this.isInitialized = true;
        
        console.log('✅ 향상된 선수 성장 시스템 초기화 완료');
    }

    setupGameManagerIntegration() {
        // GameManager와 연동
        if (window.gameManager) {
            window.gameManager.on('teamSelected', (teamKey) => this.onTeamSelected(teamKey));
            window.gameManager.on('matchEnded', (matchData) => this.onMatchEnd(matchData));
            window.gameManager.on('formationChanged', () => this.updateSquadBasedGrowth());
        }
    }

    initializeTeamTraining() {
        const gameState = window.gameManager?.gameState;
        if (!gameState?.selectedTeam) return;

        // 팀별 초기 훈련 레벨 설정
        const teamTrainingLevels = {
            'barcelona': 5, 'ajax': 5, // 최고 유스 시설
            'manCity': 4, 'chelsea': 4, 'bayern': 4, 'arsenal': 4,
            'liverpool': 3, 'manUnited': 3, 'tottenham': 3, 'dortmund': 3,
            'realMadrid': 2, 'acMilan': 2, 'psg': 2,
            'seryun': 6 // 레전드 팀 특별 보너스
        };

        this.teamTrainingLevel = teamTrainingLevels[gameState.selectedTeam] || 1;
        console.log(`🏋️ 팀 훈련 레벨 설정: ${this.teamTrainingLevel}`);
    }

    // ===========================================
    // 이벤트 핸들러들
    // ===========================================

    onTeamSelected(teamKey) {
        this.initializePlayersForTeam(teamKey);
        this.teamTrainingLevel = this.getTeamTrainingLevel(teamKey);
        console.log(`👥 팀 선택됨: ${teamKey}, 성장 시스템 업데이트`);
    }

    onMatchEnd(matchData) {
        this.processPostMatchGrowth(matchData);
        this.updateSeasonalBonus();
    }

    // ===========================================
    // 선수 성장 로직
    // ===========================================

    initializePlayersForTeam(teamKey) {
        const teamPlayers = window.teams?.[teamKey];
        if (!teamPlayers) return;

        let newPlayersCount = 0;

        teamPlayers.forEach(player => {
            if (player.age <= 28 && !this.growthData.has(player.name)) {
                const growthPotential = this.calculateGrowthPotential(player, teamKey);
                
                // 월별 성장을 더 정교하게 계산
                const monthlyGrowth = this.calculateMonthlyGrowth(growthPotential, player);
                const monthsToGrow = Math.ceil(growthPotential / monthlyGrowth);
                
                this.growthData.set(player.name, {
                    playerId: `${player.name}_${teamKey}`,
                    currentRating: Math.round(player.rating),
                    maxGrowth: Math.round(growthPotential),
                    remainingGrowth: Math.round(growthPotential),
                    monthsToGrow: monthsToGrow,
                    monthlyGrowth: monthlyGrowth,
                    lastGrowthCheck: Date.now(),
                    totalGrowthSoFar: 0,
                    growthSpeed: this.calculateGrowthSpeed(player),
                    specialTraits: this.generateSpecialTraits(player),
                    mentality: this.calculateMentality(player),
                    injuryProneness: Math.random() * 0.1 // 0-10% 부상 확률
                });

                newPlayersCount++;
                this.initializeGrowthHistory(player.name);
            }
        });

        if (newPlayersCount > 0) {
            console.log(`📊 ${newPlayersCount}명의 선수에게 성장 데이터 부여됨`);
        }
    }

    calculateGrowthPotential(player, teamKey) {
        // 유스 선수 특별 처리 (기존 로직 + 향상)
        if (player.isYouthProduct === true && player.maxPotential) {
            const remainingGrowth = player.maxPotential - player.rating;
            let baseGrowth = Math.min(remainingGrowth, 8 + Math.random() * 15);
            
            // 팀 훈련 레벨 보정
            baseGrowth *= (1 + this.teamTrainingLevel * 0.1);
            
            return Math.max(baseGrowth, 3);
        }

        // 일반 선수 성장 계산
        let baseGrowth = 2 + Math.random() * 12; // 2-14 사이
        
        // 나이에 따른 보정 (더 정교하게)
        let ageModifier = 1;
        if (player.age <= 17) {
            ageModifier = 2.2; // 매우 어린 선수
        } else if (player.age <= 20) {
            ageModifier = 1.8;
        } else if (player.age <= 23) {
            ageModifier = 1.4;
        } else if (player.age <= 25) {
            ageModifier = 1.1;
        } else if (player.age <= 28) {
            ageModifier = 0.7; // 성숙한 선수는 느린 성장
        }
        
        // 현재 능력치에 따른 보정
        let ratingModifier = 1;
        const currentRating = Math.round(player.rating);
        if (currentRating < 65) {
            ratingModifier = 2.5; // 낮은 능력치는 빠른 성장
        } else if (currentRating < 75) {
            ratingModifier = 2.0;
        } else if (currentRating < 85) {
            ratingModifier = 1.5;
        } else if (currentRating >= 92) {
            ratingModifier = 0.5; // 최고급 선수는 매우 느린 성장
        }

        // 팀별 특수 보정
        let teamModifier = 1;
        if (teamKey === 'seryun') {
            teamModifier = 2.5; // 레전드 팀 특별 보너스
        } else if (['barcelona', 'ajax'].includes(teamKey)) {
            teamModifier = 1.6; // 최고 유스 시설
        } else if (['manCity', 'chelsea', 'arsenal', 'bayern'].includes(teamKey)) {
            teamModifier = 1.4;
        } else if (['liverpool', 'manUnited', 'tottenham'].includes(teamKey)) {
            teamModifier = 1.2;
        }

        // 훈련 레벨 보정
        teamModifier *= (1 + this.teamTrainingLevel * 0.05);

        const finalGrowth = Math.round(baseGrowth * ageModifier * ratingModifier * teamModifier);
        
        return Math.max(finalGrowth, teamKey === 'seryun' ? 12 : 3);
    }

    calculateMonthlyGrowth(totalGrowth, player) {
        const baseMonthly = totalGrowth / 15; // 15개월 기간
        
        // 나이별 성장 속도 조정
        let speedModifier = 1;
        if (player.age <= 18) speedModifier = 1.4;
        else if (player.age <= 21) speedModifier = 1.2;
        else if (player.age <= 24) speedModifier = 1.0;
        else speedModifier = 0.8;

        return Math.max(0.3, baseMonthly * speedModifier);
    }

    calculateGrowthSpeed(player) {
        // 성장 속도 특성 (1.0이 기본)
        let speed = 0.8 + Math.random() * 0.4; // 0.8 ~ 1.2
        
        // 포지션별 성장 속도
        const positionSpeeds = {
            'GK': 0.9, // 골키퍼는 느린 성장
            'DF': 1.0,
            'MF': 1.1, // 미드필더가 가장 다양하게 성장
            'FW': 1.0
        };
        
        speed *= positionSpeeds[player.position] || 1.0;
        
        return speed;
    }

    generateSpecialTraits(player) {
        const traits = [];
        
        // 20% 확률로 특수 특성 부여
        if (Math.random() < 0.2) {
            const possibleTraits = [
                'early_bloomer', // 조숙형 (빠른 초기 성장)
                'late_bloomer', // 만성형 (늦지만 큰 성장)
                'injury_prone', // 부상 취약
                'mentality_monster', // 정신력 괴물
                'technical_genius', // 기술 천재
                'physical_beast', // 피지컬 괴물
                'leadership', // 리더십
                'clutch_player' // 중요한 순간의 선수
            ];
            
            const traitCount = Math.random() < 0.05 ? 2 : 1; // 5% 확률로 2개 특성
            
            for (let i = 0; i < traitCount; i++) {
                const trait = possibleTraits[Math.floor(Math.random() * possibleTraits.length)];
                if (!traits.includes(trait)) {
                    traits.push(trait);
                }
            }
        }
        
        return traits;
    }

    calculateMentality(player) {
        // 정신력 점수 (1-10)
        let mentality = 5 + Math.random() * 3; // 5-8 기본
        
        // 나이에 따른 정신력
        if (player.age >= 25) mentality += 1;
        if (player.age >= 30) mentality += 0.5;
        
        // 능력치에 따른 정신력
        if (player.rating >= 85) mentality += 1;
        if (player.rating >= 90) mentality += 0.5;
        
        return Math.min(10, mentality);
    }

    initializeGrowthHistory(playerName) {
        if (!this.growthHistory.has(playerName)) {
            this.growthHistory.set(playerName, []);
        }
    }

    // ===========================================
    // 성장 처리
    // ===========================================

    processPostMatchGrowth(matchData) {
        if (!window.gameManager?.gameState?.selectedTeam) return;

        const teamPlayers = window.teams[window.gameManager.gameState.selectedTeam];
        if (!teamPlayers) return;

        let growthOccurred = false;
        const currentMatch = window.gameManager.gameState.matchesPlayed;

        teamPlayers.forEach(player => {
            if (this.growthData.has(player.name)) {
                const growthInfo = this.growthData.get(player.name);
                
                if (this.shouldPlayerGrow(player, growthInfo, currentMatch)) {
                    const growthAmount = this.calculateGrowthAmount(player, growthInfo, matchData);
                    
                    if (growthAmount > 0) {
                        this.applyGrowth(player, growthAmount, growthInfo, matchData);
                        growthOccurred = true;
                    }
                }
            }
        });

        if (growthOccurred) {
            this.notifyGrowthOccurred();
        }

        // 모든 팀 AI 성장 처리
        this.processAITeamsGrowth();
    }

    shouldPlayerGrow(player, growthInfo, currentMatch) {
        if (growthInfo.remainingGrowth <= 0) return false;

        // 성장 간격 계산
        let growthInterval = 4; // 기본 4경기마다
        
        // 특성에 따른 조정
        if (growthInfo.specialTraits.includes('early_bloomer')) {
            growthInterval = 3;
        } else if (growthInfo.specialTraits.includes('late_bloomer')) {
            growthInterval = 6;
        }
        
        // 유스 선수는 더 자주 성장
        if (player.isYouthProduct === true) {
            growthInterval = Math.max(2, growthInterval - 1);
        }
        
        // 팀 훈련 레벨에 따른 조정
        growthInterval = Math.max(2, growthInterval - Math.floor(this.teamTrainingLevel / 2));

        return currentMatch > 0 && currentMatch % growthInterval === 0;
    }

    calculateGrowthAmount(player, growthInfo, matchData) {
        let baseGrowth = growthInfo.monthlyGrowth * growthInfo.growthSpeed;
        
        // 경기 참여도에 따른 보정
        const playingTimeMultiplier = this.getPlayingTimeMultiplier(player, matchData);
        baseGrowth *= playingTimeMultiplier;
        
        // 팀 사기에 따른 보정
        const gameState = window.gameManager.gameState;
        const moraleModifier = (gameState.teamMorale || 80) / 100;
        baseGrowth *= (0.8 + moraleModifier * 0.4); // 80% ~ 120%
        
        // 시즌 보너스 적용
        baseGrowth *= this.seasonalGrowthBonus;
        
        // 특성에 따른 보정
        baseGrowth *= this.getTraitGrowthModifier(growthInfo.specialTraits, player.age);
        
        // 정신력에 따른 보정
        const mentalityBonus = 0.9 + (growthInfo.mentality / 100); // 90% ~ 100%
        baseGrowth *= mentalityBonus;
        
        // 랜덤 요소 (80% ~ 120%)
        const randomFactor = 0.8 + Math.random() * 0.4;
        baseGrowth *= randomFactor;
        
        // 부상 확률 체크
        if (Math.random() < growthInfo.injuryProneness) {
            baseGrowth *= 0.5; // 부상 시 50% 성장
            console.log(`🤕 ${player.name} 경미한 부상으로 성장 감소`);
        }
        
        const finalGrowth = Math.max(0.2, Math.round(baseGrowth * 10) / 10);
        return Math.min(finalGrowth, growthInfo.remainingGrowth);
    }

    getPlayingTimeMultiplier(player, matchData) {
        const squad = window.gameManager.gameState.squad;
        
        // 선발 출전 여부 확인
        const isInStartingEleven = this.isPlayerInSquad(player, squad);
        
        if (isInStartingEleven) {
            // 경기 결과에 따른 추가 보정
            const isWin = matchData?.homeScore > matchData?.awayScore;
            const isDraw = matchData?.homeScore === matchData?.awayScore;
            
            if (isWin) return 2.2; // 승리 시 220%
            if (isDraw) return 1.8; // 무승부 시 180%
            return 1.5; // 패배해도 150%
        } else {
            // 벤치 선수
            return 0.8; // 80%
        }
    }

    getTraitGrowthModifier(traits, playerAge) {
        let modifier = 1.0;
        
        traits.forEach(trait => {
            switch (trait) {
                case 'early_bloomer':
                    modifier *= playerAge <= 21 ? 1.3 : 0.9;
                    break;
                case 'late_bloomer':
                    modifier *= playerAge >= 23 ? 1.4 : 0.8;
                    break;
                case 'mentality_monster':
                    modifier *= 1.15;
                    break;
                case 'technical_genius':
                    modifier *= 1.1;
                    break;
                case 'injury_prone':
                    modifier *= 0.95;
                    break;
            }
        });
        
        return modifier;
    }

    applyGrowth(player, growthAmount, growthInfo, matchData) {
        const oldRating = Math.round(player.rating);
        const newRating = Math.min(99, Math.round(player.rating + growthAmount));
        
        // 성장 적용
        player.rating = newRating;
        growthInfo.remainingGrowth = Math.max(0, growthInfo.remainingGrowth - growthAmount);
        growthInfo.totalGrowthSoFar += growthAmount;
        growthInfo.lastGrowthCheck = Date.now();

        // 성장 이력 기록
        this.recordGrowthHistory(player.name, {
            oldRating,
            newRating,
            growthAmount,
            timestamp: Date.now(),
            matchContext: matchData ? `vs ${window.teamNames[matchData.awayTeam]}` : 'Training',
            traits: [...growthInfo.specialTraits]
        });

        // 성장 알림
        if (newRating > oldRating) {
            this.showGrowthNotification(player, oldRating, newRating, growthInfo);
        }

        // 성장 데이터 업데이트
        this.growthData.set(player.name, growthInfo);

        // 성장 콜백 실행
        this.executeGrowthCallbacks(player, oldRating, newRating);

        // 완전 성장 시 처리
        if (growthInfo.remainingGrowth <= 0.5) {
            this.completePlayerGrowth(player.name, growthInfo);
        }
    }

    recordGrowthHistory(playerName, growthRecord) {
        if (!this.growthHistory.has(playerName)) {
            this.growthHistory.set(playerName, []);
        }
        
        const history = this.growthHistory.get(playerName);
        history.push(growthRecord);
        
        // 최근 20개 기록만 유지
        if (history.length > 20) {
            history.splice(0, history.length - 20);
        }
    }

    completePlayerGrowth(playerName, growthInfo) {
        console.log(`🎓 ${playerName}의 성장 완료! 총 성장: +${growthInfo.totalGrowthSoFar.toFixed(1)}`);
        
        // 완성된 선수 특별 보너스
        const player = this.findPlayerByName(playerName);
        if (player && player.rating >= 85) {
            // 고능력치 달성 시 팀 사기 보너스
            if (window.gameManager) {
                window.gameManager.gameState.teamMorale = Math.min(100, 
                    window.gameManager.gameState.teamMorale + 2
                );
            }
        }
        
        this.growthData.delete(playerName);
    }

    showGrowthNotification(player, oldRating, newRating, growthInfo) {
        const growthAmount = newRating - oldRating;
        let message = `🌟 ${player.name}의 능력치가 상승했습니다!\n${oldRating} → ${newRating} (+${growthAmount})`;
        
        // 특성 정보 추가
        if (growthInfo.specialTraits.length > 0) {
            const traitNames = {
                'early_bloomer': '조숙형',
                'late_bloomer': '만성형',
                'mentality_monster': '정신력 괴물',
                'technical_genius': '기술 천재',
                'physical_beast': '피지컬 괴물',
                'leadership': '리더십',
                'clutch_player': '클러치 플레이어'
            };
            
            const traits = growthInfo.specialTraits.map(t => traitNames[t] || t).join(', ');
            message += `\n특성: ${traits}`;
        }
        
        // 성장 완료 임박 알림
        if (growthInfo.remainingGrowth <= 2) {
            message += '\n🎯 성장 거의 완료!';
        }
        
        setTimeout(() => {
            alert(message);
        }, 1000);

        console.log(`📈 성장: ${player.name} ${oldRating}→${newRating} (남은 성장: ${growthInfo.remainingGrowth.toFixed(1)})`);
    }

    // ===========================================
    // AI 팀 성장 처리
    // ===========================================

    processAITeamsGrowth() {
        Object.keys(window.teams || {}).forEach(teamKey => {
            if (teamKey !== window.gameManager?.gameState?.selectedTeam) {
                this.processAITeamGrowth(teamKey);
            }
        });
    }

    processAITeamGrowth(teamKey) {
        const teamPlayers = window.teams[teamKey];
        if (!teamPlayers) return;

        teamPlayers.forEach(player => {
            if (player.age <= 28 && Math.random() < 0.15) { // 15% 확률로 성장
                const growthAmount = this.calculateAIGrowthAmount(player, teamKey);
                if (growthAmount > 0) {
                    player.rating = Math.min(99, Math.round(player.rating + growthAmount));
                }
            }
        });
    }

    calculateAIGrowthAmount(player, teamKey) {
        let baseGrowth = 0.3 + Math.random() * 0.7; // 0.3 ~ 1.0
        
        // 팀별 AI 성장 보정
        const teamTrainingLevel = this.getTeamTrainingLevel(teamKey);
        baseGrowth *= (1 + teamTrainingLevel * 0.05);
        
        // 나이별 보정
        if (player.age <= 21) baseGrowth *= 1.5;
        else if (player.age <= 25) baseGrowth *= 1.2;
        else baseGrowth *= 0.8;
        
        // 능력치별 보정
        if (player.rating >= 90) baseGrowth *= 0.3;
        else if (player.rating >= 85) baseGrowth *= 0.6;
        else if (player.rating < 70) baseGrowth *= 1.5;
        
        return Math.round(baseGrowth * 10) / 10;
    }

    getTeamTrainingLevel(teamKey) {
        const levels = {
            'barcelona': 5, 'ajax': 5,
            'manCity': 4, 'chelsea': 4, 'bayern': 4, 'arsenal': 4,
            'liverpool': 3, 'manUnited': 3, 'tottenham': 3, 'dortmund': 3, 'psg': 3,
            'realMadrid': 2, 'acMilan': 2, 'inter': 2, 'atMadrid': 2,
            'seryun': 6
        };
        return levels[teamKey] || 1;
    }

    // ===========================================
    // 유틸리티 및 정보 조회
    // ===========================================

    updateSeasonalBonus() {
        const currentMatch = window.gameManager?.gameState?.matchesPlayed || 0;
        
        // 시즌 후반부에 성장 보너스
        if (currentMatch >= 25) {
            this.seasonalGrowthBonus = 1.2; // 20% 보너스
        } else if (currentMatch >= 15) {
            this.seasonalGrowthBonus = 1.1; // 10% 보너스
        } else {
            this.seasonalGrowthBonus = 1.0;
        }
    }

    updateSquadBasedGrowth() {
        // 포메이션 변경 시 성장률 재계산
        const squad = window.gameManager?.gameState?.squad;
        if (!squad) return;

        this.growthData.forEach((growthInfo, playerName) => {
            const player = this.findPlayerByName(playerName);
            if (player) {
                const isInSquad = this.isPlayerInSquad(player, squad);
                // 주전 여부에 따른 성장률 조정은 실시간으로 계산됨
            }
        });
    }

    isPlayerInSquad(player, squad) {
        if (!squad) return false;
        
        if (squad.gk && squad.gk.name === player.name) return true;
        
        for (let position of ['df', 'mf', 'fw']) {
            if (squad[position]) {
                for (let p of squad[position]) {
                    if (p && p.name === player.name) return true;
                }
            }
        }
        
        return false;
    }

    findPlayerByName(playerName) {
        const teamKey = window.gameManager?.gameState?.selectedTeam;
        if (!teamKey) return null;
        
        const teamPlayers = window.teams[teamKey];
        return teamPlayers?.find(p => p.name === playerName);
    }

    // 성장 정보 조회 메서드들
    getPlayerGrowthInfo(playerName) {
        return this.growthData.get(playerName) || null;
    }

    getPlayerGrowthHistory(playerName) {
        return this.growthHistory.get(playerName) || [];
    }

    getTeamGrowthSummary() {
        const teamKey = window.gameManager?.gameState?.selectedTeam;
        if (!teamKey) return [];

        const teamPlayers = window.teams[teamKey];
        if (!teamPlayers) return [];

        const summary = [];

        teamPlayers.forEach(player => {
            if (this.growthData.has(player.name)) {
                const growthInfo = this.growthData.get(player.name);
                const currentRating = Math.round(player.rating);
                const maxPotential = Math.round(currentRating + growthInfo.remainingGrowth);
                
                summary.push({
                    name: player.name,
                    position: player.position,
                    age: player.age,
                    currentRating: currentRating,
                    maxPotential: maxPotential,
                    remainingGrowth: Math.round(growthInfo.remainingGrowth * 10) / 10,
                    monthlyGrowth: Math.round(growthInfo.monthlyGrowth * 100) / 100,
                    totalGrowthSoFar: Math.round(growthInfo.totalGrowthSoFar * 10) / 10,
                    specialTraits: growthInfo.specialTraits,
                    mentality: Math.round(growthInfo.mentality * 10) / 10,
                    growthSpeed: Math.round(growthInfo.growthSpeed * 100) / 100
                });
            }
        });

        return summary.sort((a, b) => b.maxPotential - a.maxPotential);
    }

    getTopGrowthPlayers(limit = 5) {
        const summary = this.getTeamGrowthSummary();
        return summary
            .filter(p => p.totalGrowthSoFar > 0)
            .sort((a, b) => b.totalGrowthSoFar - a.totalGrowthSoFar)
            .slice(0, limit);
    }

    // ===========================================
    // 콜백 및 이벤트 관리
    // ===========================================

    addGrowthCallback(callback) {
        this.growthCallbacks.add(callback);
    }

    removeGrowthCallback(callback) {
        this.growthCallbacks.delete(callback);
    }

    executeGrowthCallbacks(player, oldRating, newRating) {
        this.growthCallbacks.forEach(callback => {
            try {
                callback(player, oldRating, newRating);
            } catch (error) {
                console.error('성장 콜백 실행 오류:', error);
            }
        });
    }

    notifyGrowthOccurred() {
        // GameManager에 성장 발생 알림
        if (window.gameManager) {
            window.gameManager.emit('playerGrowth', {
                timestamp: Date.now(),
                playersGrown: this.getRecentGrowthCount()
            });
        }

        // UI 업데이트
        this.updateSquadDisplay();
    }

    getRecentGrowthCount() {
        const fiveMinutesAgo = Date.now() - 300000;
        let count = 0;
        
        this.growthData.forEach(growthInfo => {
            if (growthInfo.lastGrowthCheck >= fiveMinutesAgo) {
                count++;
            }
        });
        
        return count;
    }

    updateSquadDisplay() {
        // 스쿼드 화면이 활성화되어 있다면 업데이트
        const squadTab = document.getElementById('squad');
        if (squadTab && squadTab.classList.contains('active')) {
            if (typeof window.displayTeamPlayers === 'function') {
                window.displayTeamPlayers();
            }
            if (typeof window.updateFormationDisplay === 'function') {
                window.updateFormationDisplay();
            }
        }
    }

    // ===========================================
    // 선수 나이 증가 및 시즌 관리
    // ===========================================

    advancePlayerAges() {
        Object.keys(window.teams || {}).forEach(teamKey => {
            window.teams[teamKey].forEach(player => {
                player.age++;
                
                // 나이 증가로 성장 완료된 선수 정리
                if (this.growthData.has(player.name)) {
                    const growthInfo = this.growthData.get(player.name);
                    
                    // 29세 이상이면 성장 중단
                    if (player.age >= 29) {
                        console.log(`🎂 ${player.name} 나이로 인한 성장 완료 (${player.age}세)`);
                        this.growthData.delete(player.name);
                    }
                    // 성장량이 거의 없으면 완료
                    else if (growthInfo.remainingGrowth <= 0.5) {
                        this.completePlayerGrowth(player.name, growthInfo);
                    }
                }
            });
        });
        
        console.log('📅 모든 선수 나이 +1, 성장 데이터 정리 완료');
    }

    // ===========================================
    // 고급 기능들
    // ===========================================

    upgradeTeamTraining() {
        const cost = this.teamTrainingLevel * 800; // 레벨당 800억
        const gameState = window.gameManager?.gameState;
        
        if (!gameState) return { success: false, message: '게임 상태를 찾을 수 없습니다.' };
        
        if (this.teamTrainingLevel >= 5) {
            return { success: false, message: '이미 최고 레벨입니다!' };
        }
        
        if (gameState.teamMoney < cost) {
            return { success: false, message: `훈련 시설 업그레이드 비용이 부족합니다! (필요: ${cost}억)` };
        }
        
        gameState.teamMoney -= cost;
        this.teamTrainingLevel++;
        
        // 모든 성장 중인 선수의 성장률 향상
        this.growthData.forEach(growthInfo => {
            growthInfo.monthlyGrowth *= 1.1; // 10% 향상
        });
        
        return {
            success: true,
            message: `훈련 시설이 레벨 ${this.teamTrainingLevel}로 업그레이드되었습니다!\n모든 선수의 성장률이 10% 향상되었습니다.`,
            newLevel: this.teamTrainingLevel
        };
    }

    getSpecialGrowthEvent() {
        // 5% 확률로 특별 성장 이벤트 발생
        if (Math.random() > 0.05) return null;
        
        const events = [
            {
                name: '집중 훈련 캠프',
                description: '팀 전체가 특별 훈련에 참여하여 성장률이 일시적으로 증가합니다.',
                effect: () => {
                    this.growthData.forEach(growthInfo => {
                        growthInfo.monthlyGrowth *= 1.3; // 30% 증가 (5경기간)
                    });
                    setTimeout(() => {
                        this.growthData.forEach(growthInfo => {
                            growthInfo.monthlyGrowth /= 1.3;
                        });
                    }, 5 * 86400000); // 5일 후 원복
                }
            },
            {
                name: '멘탈 코칭 세션',
                description: '팀 멘탈 코치의 특별 세션으로 선수들의 정신력이 향상됩니다.',
                effect: () => {
                    this.growthData.forEach(growthInfo => {
                        growthInfo.mentality = Math.min(10, growthInfo.mentality + 0.5);
                    });
                }
            },
            {
                name: '의료진 업그레이드',
                description: '새로운 의료 시설 도입으로 부상 위험이 감소합니다.',
                effect: () => {
                    this.growthData.forEach(growthInfo => {
                        growthInfo.injuryProneness = Math.max(0, growthInfo.injuryProneness - 0.02);
                    });
                }
            }
        ];
        
        return events[Math.floor(Math.random() * events.length)];
    }

    // ===========================================
    // 저장/로드
    // ===========================================

    getSaveData() {
        const saveData = {
            growthData: {},
            growthHistory: {},
            teamTrainingLevel: this.teamTrainingLevel,
            seasonalGrowthBonus: this.seasonalGrowthBonus
        };

        // Map을 일반 객체로 변환
        this.growthData.forEach((value, key) => {
            saveData.growthData[key] = {
                ...value,
                currentRating: Math.round(value.currentRating),
                maxGrowth: Math.round(value.maxGrowth * 10) / 10,
                remainingGrowth: Math.round(value.remainingGrowth * 10) / 10,
                monthlyGrowth: Math.round(value.monthlyGrowth * 100) / 100,
                totalGrowthSoFar: Math.round(value.totalGrowthSoFar * 10) / 10
            };
        });

        this.growthHistory.forEach((value, key) => {
            saveData.growthHistory[key] = value;
        });

        return saveData;
    }

    loadSaveData(saveData) {
        if (!saveData) return;

        // 성장 데이터 복원
        this.growthData.clear();
        Object.entries(saveData.growthData || {}).forEach(([key, value]) => {
            this.growthData.set(key, {
                ...value,
                currentRating: Math.round(value.currentRating),
                maxGrowth: Math.round(value.maxGrowth * 10) / 10,
                remainingGrowth: Math.round(value.remainingGrowth * 10) / 10,
                monthlyGrowth: Math.round(value.monthlyGrowth * 100) / 100,
                totalGrowthSoFar: Math.round((value.totalGrowthSoFar || 0) * 10) / 10,
                specialTraits: value.specialTraits || [],
                mentality: value.mentality || 5,
                injuryProneness: value.injuryProneness || 0.05
            });
        });

        // 성장 이력 복원
        this.growthHistory.clear();
        Object.entries(saveData.growthHistory || {}).forEach(([key, value]) => {
            this.growthHistory.set(key, value);
        });

        this.teamTrainingLevel = saveData.teamTrainingLevel || 1;
        this.seasonalGrowthBonus = saveData.seasonalGrowthBonus || 1.0;

        console.log('📊 선수 성장 데이터 복원 완료');
    }

    // ===========================================
    // 정리 및 리셋
    // ===========================================

    resetGrowthSystem() {
        this.growthData.clear();
        this.growthHistory.clear();
        this.teamTrainingLevel = 1;
        this.seasonalGrowthBonus = 1.0;
        console.log('🔄 성장 시스템 초기화 완료');
    }

    cleanup() {
        // 콜백들 정리
        this.growthCallbacks.clear();
        
        // 메모리 정리
        if (this.growthData.size > 50) {
            console.log('🧹 성장 데이터 정리 시작');
            // 활성화되지 않은 선수들 정리 (오래된 데이터)
            const oneMonthAgo = Date.now() - 2592000000; // 30일
            
            this.growthData.forEach((growthInfo, playerName) => {
                if (growthInfo.lastGrowthCheck < oneMonthAgo) {
                    this.growthData.delete(playerName);
                }
            });
        }
        
        console.log('🧹 성장 시스템 정리 완료');
    }
}

// 기존 시스템과의 호환성을 위한 래퍼
if (!window.playerGrowthSystem) {
    window.playerGrowthSystem = new EnhancedPlayerGrowthSystem();
}

// 기존 전역 함수들 유지 (호환성)
window.initializePlayerGrowth = () => {
    if (window.playerGrowthSystem && !window.playerGrowthSystem.isInitialized) {
        window.playerGrowthSystem.initialize();
    }
};

window.processPostMatchGrowth = (matchData) => {
    if (window.playerGrowthSystem) {
        window.playerGrowthSystem.processPostMatchGrowth(matchData);
    }
};

window.advancePlayerAges = () => {
    if (window.playerGrowthSystem) {
        window.playerGrowthSystem.advancePlayerAges();
    }
};

window.showGrowthSummary = () => {
    if (!window.playerGrowthSystem) {
        alert('성장 시스템이 초기화되지 않았습니다.');
        return;
    }

    const summary = window.playerGrowthSystem.getTeamGrowthSummary();
    
    if (summary.length === 0) {
        alert('현재 성장 중인 선수가 없습니다.');
        return;
    }
    
    let message = `📈 선수 성장 현황 (훈련 레벨: ${window.playerGrowthSystem.teamTrainingLevel})\n\n`;
    
    summary.slice(0, 10).forEach((player, index) => {
        message += `${index + 1}. ${player.name}(${player.position}): ${player.currentRating}→${player.maxPotential}\n`;
        message += `   성장: +${player.totalGrowthSoFar} (남은: ${player.remainingGrowth})\n`;
        if (player.specialTraits.length > 0) {
            message += `   특성: ${player.specialTraits.join(', ')}\n`;
        }
        message += '\n';
    });
    
    if (summary.length > 10) {
        message += `... 외 ${summary.length - 10}명\n`;
    }
    
    alert(message);
};

// GameManager 호환 클래스 등록
window.EnhancedPlayerGrowthSystem = EnhancedPlayerGrowthSystem;
window.PlayerGrowthSystem = EnhancedPlayerGrowthSystem; // 기존 이름으로도 접근 가능

console.log('✅ Enhanced Player Growth System 로드 완료');