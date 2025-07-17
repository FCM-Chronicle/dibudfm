searchPlayers(filters) {
        let filteredPlayers = [...this.transferMarket];
        
        // 기본 필터들
        if (filters.name && filters.name.trim()) {
            const searchName = filters.name.toLowerCase();
            filteredPlayers = filteredPlayers.filter(player => 
                player.name.toLowerCase().includes(searchName)
            );
        }
        
        if (filters.position) {
            filteredPlayers = filteredPlayers.filter(player => 
                player.position === filters.position
            );
        }
        
        if (filters.minRating) {
            filteredPlayers = filteredPlayers.filter(player => 
                player.rating >= filters.minRating
            );
        }
        
        if (filters.maxAge) {
            filteredPlayers = filteredPlayers.filter(player => 
                player.age <= filters.maxAge
            );
        }
        
        // 고급 필터들
        if (filters.maxPrice) {
            filteredPlayers = filteredPlayers.filter(player => 
                player.price <= filters.maxPrice
            );
        }
        
        if (filters.nationality) {
            filteredPlayers = filteredPlayers.filter(player => 
                player.nationality && player.nationality.includes(filters.nationality)
            );
        }
        
        if (filters.demandLevel) {
            filteredPlayers = filteredPlayers.filter(player => 
                player.demandLevel === filters.demandLevel
            );
        }
        
        if (filters.contractYears) {
            filteredPlayers = filteredPlayers.filter(player => 
                player.contractYears <= filters.contractYears
            );
        }
        
        if (filters.onlyLegends) {
            filteredPlayers = filteredPlayers.filter(player => player.isLegend);
        }
        
        if (filters.onlyWonderKids) {
            filteredPlayers = filteredPlayers.filter(player => player.isWonderKid);
        }
        
        // 정렬
        if (filters.sortBy) {
            filteredPlayers.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'rating':
                        return b.rating - a.rating;
                    case 'age':
                        return a.age - b.age;
                    case 'price':
                        return filters.sortDesc ? b.price - a.price : a.price - b.price;
                    case 'name':
                        return a.name.localeCompare(b.name);
                    default:
                        return 0;
                }
            });
        }
        
        return filteredPlayers;
    }

    // ===========================================
    // 선수 영입 및 계약
    // ===========================================

    signPlayer(player, negotiateDiscount = false) {
        const gameState = window.gameManager?.gameState;
        if (!gameState) {
            return { success: false, message: '게임 상태를 찾을 수 없습니다.' };
        }
        
        let finalPrice = player.price;
        
        // 협상 시도
        if (negotiateDiscount && player.negotiable) {
            const negotiationResult = this.negotiatePrice(player);
            finalPrice = negotiationResult.finalPrice;
            
            if (!negotiationResult.success) {
                return { 
                    success: false, 
                    message: `협상 실패! ${player.name}의 요구 가격은 ${player.price}억입니다.`,
                    negotiationFailed: true
                };
            }
        }
        
        // 자금 확인
        if (gameState.teamMoney < finalPrice) {
            return { 
                success: false, 
                message: `자금이 부족합니다! (필요: ${finalPrice}억, 보유: ${gameState.teamMoney}억)` 
            };
        }
        
        // 팀 인원 제한 확인
        const currentTeam = window.teams[gameState.selectedTeam];
        if (currentTeam && currentTeam.length >= 30) {
            return { 
                success: false, 
                message: '팀 인원이 가득 찼습니다! (최대 30명)' 
            };
        }
        
        // 영입 처리
        const transferResult = this.executeTransfer(player, gameState.selectedTeam, finalPrice);
        
        if (transferResult.success) {
            // 게임 상태 업데이트
            gameState.teamMoney -= finalPrice;
            
            // 이적 기록 저장
            this.recordTransfer({
                player: transferResult.player,
                fromTeam: player.originalTeam,
                toTeam: gameState.selectedTeam,
                fee: finalPrice,
                type: 'signing',
                timestamp: Date.now(),
                wasNegotiated: negotiateDiscount && player.negotiable
            });
            
            // 시장에서 제거
            this.removePlayerFromMarket(player);
            
            // 시장 동향 업데이트
            this.updateMarketAfterTransfer(player, finalPrice);
            
            // GameManager에 알림
            if (window.gameManager) {
                window.gameManager.emit('playerTransferred', {
                    type: 'user_signing',
                    player: transferResult.player,
                    fromTeam: player.originalTeam,
                    toTeam: gameState.selectedTeam,
                    fee: finalPrice
                });
            }
            
            return {
                success: true,
                message: `${player.name}을(를) ${finalPrice}억에 영입했습니다!${negotiateDiscount ? ' (협상 성공!)' : ''}`,
                player: transferResult.player,
                finalPrice: finalPrice,
                savings: negotiateDiscount ? player.price - finalPrice : 0
            };
        }
        
        return transferResult;
    }

    negotiatePrice(player) {
        const gameState = window.gameManager?.gameState;
        
        // 협상 성공 확률 계산
        let successChance = 0.4; // 기본 40%
        
        // 팀 평판에 따른 보정
        const teamReputation = this.getTeamReputation(gameState.selectedTeam);
        successChance += teamReputation * 0.1;
        
        // 선수 상황에 따른 보정
        if (player.contractYears <= 1) successChance += 0.2; // 계약 만료 임박
        if (player.age >= 30) successChance += 0.1; // 나이 많은 선수
        if (player.daysOnMarket >= 30) successChance += 0.15; // 오래 머문 선수
        
        // 팀 사기에 따른 보정
        const moraleBonus = (gameState.teamMorale - 50) / 500; // -0.1 ~ +0.1
        successChance += moraleBonus;
        
        const negotiationSuccess = Math.random() < successChance;
        
        if (negotiationSuccess) {
            // 10% ~ 25% 할인
            const discountPercent = 0.1 + Math.random() * 0.15;
            const finalPrice = Math.round(player.price * (1 - discountPercent));
            
            return {
                success: true,
                finalPrice: finalPrice,
                discountPercent: Math.round(discountPercent * 100),
                originalPrice: player.price
            };
        }
        
        return {
            success: false,
            finalPrice: player.price
        };
    }

    executeTransfer(marketPlayer, toTeam, finalPrice) {
        // 새 선수 객체 생성
        const newPlayer = {
            name: marketPlayer.name,
            position: marketPlayer.position,
            rating: marketPlayer.rating,
            age: marketPlayer.age,
            nationality: marketPlayer.nationality,
            isYouthProduct: false,
            transferValue: finalPrice,
            contractYears: 3 + Math.floor(Math.random() * 3), // 3-5년 계약
            joiningDate: Date.now()
        };
        
        // 유망주 특성 유지
        if (marketPlayer.isWonderKid) {
            newPlayer.isWonderKid = true;
            newPlayer.growthPotential = marketPlayer.growthPotential;
        }
        
        // 레전드 특성 유지
        if (marketPlayer.isLegend) {
            newPlayer.isLegend = true;
        }
        
        // 팀에 추가
        if (!window.teams[toTeam]) {
            window.teams[toTeam] = [];
        }
        window.teams[toTeam].push(newPlayer);
        
        // 원래 팀에서 제거 (외부리그가 아닌 경우)
        if (marketPlayer.originalTeam !== "외부리그") {
            this.removePlayerFromOriginalTeam(marketPlayer);
        }
        
        return {
            success: true,
            player: newPlayer
        };
    }

    removePlayerFromOriginalTeam(marketPlayer) {
        const originalTeamPlayers = window.teams[marketPlayer.originalTeam];
        if (!originalTeamPlayers) return;
        
        const playerIndex = originalTeamPlayers.findIndex(p => 
            p.name === marketPlayer.name && p.position === marketPlayer.position
        );
        
        if (playerIndex !== -1) {
            originalTeamPlayers.splice(playerIndex, 1);
        }
    }

    removePlayerFromMarket(player) {
        this.transferMarket = this.transferMarket.filter(p => 
            !(p.name === player.name && p.originalTeam === player.originalTeam)
        );
    }

    // ===========================================
    // 선수 방출 시스템
    // ===========================================

    releasePlayer(player, requestedFee = null) {
        const gameState = window.gameManager?.gameState;
        if (!gameState?.selectedTeam) {
            return { success: false, message: '팀이 선택되지 않았습니다.' };
        }
        
        const teamPlayers = window.teams[gameState.selectedTeam];
        const playerIndex = teamPlayers.findIndex(p => 
            p.name === player.name && p.position === player.position
        );
        
        if (playerIndex === -1) {
            return { success: false, message: '해당 선수를 찾을 수 없습니다.' };
        }
        
        // 이적료 계산
        const marketValue = this.calculatePlayerPrice(player);
        const releaseValue = requestedFee || Math.round(marketValue * 0.4); // 40% 가격으로 방출
        
        // 방출 처리
        const releasedPlayer = teamPlayers.splice(playerIndex, 1)[0];
        
        // 스쿼드에서도 제거
        this.removePlayerFromSquad(player, gameState);
        
        // 이적료 받기
        gameState.teamMoney += releaseValue;
        
        // 새로운 팀 찾기
        const newTeam = this.findNewTeamForPlayer(releasedPlayer);
        
        // 이적 기록
        this.recordTransfer({
            player: releasedPlayer,
            fromTeam: gameState.selectedTeam,
            toTeam: newTeam,
            fee: releaseValue,
            type: 'release',
            timestamp: Date.now()
        });
        
        // GameManager에 알림
        if (window.gameManager) {
            window.gameManager.emit('playerTransferred', {
                type: 'user_release',
                player: releasedPlayer,
                fromTeam: gameState.selectedTeam,
                toTeam: newTeam,
                fee: releaseValue
            });
        }
        
        let message = `${player.name}을(를) 방출했습니다.`;
        
        if (newTeam !== "외부리그") {
            // 다른 팀으로 이적
            window.teams[newTeam].push({ ...releasedPlayer });
            message += ` ${window.teamNames[newTeam]}로 이적했습니다.`;
        } else {
            // 외부리그로 이적 또는 이적 시장에 추가
            if (Math.random() < 0.7) {
                message += " 외부리그로 이적했습니다.";
            } else {
                // 이적 시장에 다시 등록
                this.addPlayerToMarket(releasedPlayer, "자유계약", {
                    daysOnMarket: 0,
                    transferReason: "팀에서 방출됨",
                    negotiable: true
                });
                message += " 이적 시장에 등록되었습니다.";
            }
        }
        
        if (releaseValue > 0) {
            message += ` (이적료: ${releaseValue}억원)`;
        }
        
        return {
            success: true,
            message: message,
            transferFee: releaseValue,
            newTeam: newTeam
        };
    }

    findNewTeamForPlayer(player) {
        const gameState = window.gameManager?.gameState;
        const availableTeams = Object.keys(window.teams).filter(team => 
            team !== gameState?.selectedTeam && window.teams[team].length < 30
        );
        
        if (availableTeams.length === 0) {
            return "외부리그";
        }
        
        // 선수 레벨에 맞는 팀 찾기
        const suitableTeams = availableTeams.filter(teamKey => {
            const teamStrength = this.getTeamStrength(teamKey);
            const playerLevel = player.rating;
            
            // ±10 범위 내의 팀
            return Math.abs(teamStrength - playerLevel) <= 10;
        });
        
        const targetTeams = suitableTeams.length > 0 ? suitableTeams : availableTeams;
        return targetTeams[Math.floor(Math.random() * targetTeams.length)];
    }

    removePlayerFromSquad(player, gameState) {
        const squad = gameState.squad;
        
        if (squad.gk && squad.gk.name === player.name) {
            squad.gk = null;
        }
        
        ['df', 'mf', 'fw'].forEach(position => {
            if (squad[position]) {
                squad[position] = squad[position].map(p => 
                    p && p.name === player.name ? null : p
                );
            }
        });
    }

    // ===========================================
    // AI 팀 간 이적 시스템
    // ===========================================

    processAITransfers() {
        this.aiTransferCooldown--;
        
        // 30% 확률로 AI 이적 발생 (쿨다운 없을 때)
        if (this.aiTransferCooldown <= 0 && Math.random() < 0.3) {
            this.executeAITransfer();
            this.aiTransferCooldown = 3 + Math.floor(Math.random() * 4); // 3-6경기 쿨다운
        }
    }

    executeAITransfer() {
        const gameState = window.gameManager?.gameState;
        const availableTeams = Object.keys(window.teams).filter(team => 
            team !== gameState?.selectedTeam
        );
        
        if (availableTeams.length < 2) return;
        
        // 매수팀과 매도팀 선정
        const buyingTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
        const sellingTeams = availableTeams.filter(team => team !== buyingTeam);
        const sellingTeam = sellingTeams[Math.floor(Math.random() * sellingTeams.length)];
        
        const sellingTeamPlayers = window.teams[sellingTeam];
        if (!sellingTeamPlayers || sellingTeamPlayers.length <= 16) return; // 최소 인원 유지
        
        // 이적 대상 선수 선택
        const transferCandidate = this.selectAITransferCandidate(sellingTeamPlayers, buyingTeam, sellingTeam);
        if (!transferCandidate) return;
        
        // 이적 실행
        const transferFee = this.calculateAITransferFee(transferCandidate, buyingTeam, sellingTeam);
        const transferData = this.executeAITransferTransaction(transferCandidate, sellingTeam, buyingTeam, transferFee);
        
        if (transferData) {
            // 이적 기록
            this.recordTransfer(transferData);
            
            // GameManager에 알림 (SNS 포스트 생성용)
            if (window.gameManager) {
                window.gameManager.emit('playerTransferred', transferData);
            }
            
            console.log(`🔄 AI 이적: ${transferCandidate.name} (${sellingTeam} → ${buyingTeam}) - ${transferFee}억`);
        }
    }

    selectAITransferCandidate(players, buyingTeam, sellingTeam) {
        // 가중치 기반 선수 선택
        const candidates = players.map(player => {
            let weight = 1;
            
            // 나이별 가중치
            if (player.age <= 25) weight *= 2.0; // 젊은 선수 선호
            else if (player.age <= 30) weight *= 1.5;
            else if (player.age >= 35) weight *= 0.3; // 나이 많은 선수는 잘 안 움직임
            
            // 능력치별 가중치
            if (player.rating >= 90) weight *= 0.1; // 최고급은 거의 안 움직임
            else if (player.rating >= 85) weight *= 0.4; // 스타급은 가끔
            else if (player.rating >= 80) weight *= 1.5; // 준수한 선수들이 자주 이적
            else if (player.rating >= 75) weight *= 2.0; // 중급 선수들이 가장 많이 이적
            
            // 팀 강도 차이 고려
            const buyingTeamStrength = this.getTeamStrength(buyingTeam);
            const sellingTeamStrength = this.getTeamStrength(sellingTeam);
            
            if (buyingTeamStrength > sellingTeamStrength && player.rating >= 80) {
                weight *= 2.0; // 강팀으로의 이적 선호
            }
            
            return { player, weight };
        });
        
        // 가중치 기반 랜덤 선택
        const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
        if (totalWeight === 0) return null;
        
        let randomValue = Math.random() * totalWeight;
        
        for (const candidate of candidates) {
            randomValue -= candidate.weight;
            if (randomValue <= 0) {
                return candidate.player;
            }
        }
        
        return candidates[0]?.player;
    }

    calculateAITransferFee(player, buyingTeam, sellingTeam) {
        let baseFee = this.calculatePlayerPrice(player);
        
        // 팀 간 강도 차이 반영
        const buyingStrength = this.getTeamStrength(buyingTeam);
        const sellingStrength = this.getTeamStrength(sellingTeam);
        
        if (buyingStrength > sellingStrength) {
            baseFee *= 1.2; // 강팀이 약팀에서 사갈 때 프리미엄
        } else if (buyingStrength < sellingStrength) {
            baseFee *= 0.8; // 약팀이 강팀에서 사갈 때 할인
        }
        
        // AI 이적은 일반적으로 시장가보다 낮음
        baseFee *= 0.7 + Math.random() * 0.4; // 70% ~ 110%
        
        return Math.round(baseFee);
    }

    executeAITransferTransaction(player, fromTeam, toTeam, fee) {
        // 원래 팀에서 제거
        const fromTeamPlayers = window.teams[fromTeam];
        const playerIndex = fromTeamPlayers.findIndex(p => 
            p.name === player.name && p.position === player.position
        );
        
        if (playerIndex === -1) return null;
        
        const transferredPlayer = fromTeamPlayers.splice(playerIndex, 1)[0];
        
        // 새 팀에 추가
        window.teams[toTeam].push({ ...transferredPlayer });
        
        // 이적 데이터 생성
        return {
            type: 'ai_transfer',
            player: transferredPlayer,
            fromTeam: fromTeam,
            toTeam: toTeam,
            fee: fee,
            timestamp: Date.now(),
            isShockingTransfer: this.isShockingTransfer(transferredPlayer, fromTeam, toTeam, fee),
            impact: this.calculateTransferImpact(transferredPlayer, fromTeam, toTeam, fee)
        };
    }

    isShockingTransfer(player, fromTeam, toTeam, fee) {
        // 충격적 이적 판단 기준
        if (player.rating >= 88) return true; // 최고급 선수
        if (fee >= 3000) return true; // 고액 이적료
        if (this.areRivalTeams(fromTeam, toTeam)) return true; // 라이벌 팀 간
        if (player.isLegend) return true; // 레전드 선수
        
        return false;
    }

    calculateTransferImpact(player, fromTeam, toTeam, fee) {
        let impact = 0;
        
        // 기본 임팩트 (능력치 기반)
        impact += (player.rating - 70) * 0.5;
        
        // 이적료 기반
        impact += Math.log10(fee / 100) * 3; // 로그 스케일
        
        // 나이 보정
        if (player.age <= 22) impact += 3; // 유망주
        else if (player.age >= 35) impact += 5; // 베테랑
        
        // 팀 간 격차
        const strengthDiff = Math.abs(this.getTeamStrength(fromTeam) - this.getTeamStrength(toTeam));
        impact += strengthDiff * 0.3;
        
        // 라이벌 팀 간 이적
        if (this.areRivalTeams(fromTeam, toTeam)) {
            impact += 8;
        }
        
        return Math.round(impact);
    }

    areRivalTeams(team1, team2) {
        const rivals = [
            ['manCity', 'manUnited'], ['arsenal', 'tottenham'], ['liverpool', 'manUnited'],
            ['realMadrid', 'barcelona'], ['acMilan', 'inter'], ['bayern', 'dortmund'],
            ['liverpool', 'manCity'], ['chelsea', 'arsenal']
        ];
        
        return rivals.some(pair => 
            (pair.includes(team1) && pair.includes(team2))
        );
    }

    // ===========================================
    // 시장 업데이트 및 관리
    // ===========================================

    updateMarketAfterMatch() {
        // 시장에 있는 선수들의 일수 증가
        this.transferMarket.forEach(player => {
            player.daysOnMarket++;
            
            // 시장 가격 변동
            if (player.daysOnMarket > 30) {
                player.price = Math.round(player.price * 0.97); // 3% 하락
            } else if (player.daysOnMarket > 60) {
                player.price = Math.round(player.price * 0.95); // 추가 5% 하락
            }
            
            // 90일 이상이면 시장에서 제거 (10% 확률)
            if (player.daysOnMarket > 90 && Math.random() < 0.1) {
                player.daysOnMarket = -1; // 제거 표시
            }
        });
        
        // 제거 표시된 선수들 제거
        this.transferMarket = this.transferMarket.filter(player => player.daysOnMarket >= 0);
        
        // 새로운 선수 추가 (15% 확률)
        if (Math.random() < 0.15) {
            this.addRandomPlayerToMarket();
        }
        
        // 시장 동향 업데이트
        this.updateMarketTrends();
    }

    addRandomPlayerToMarket() {
        const gameState = window.gameManager?.gameState;
        const availableTeams = Object.keys(window.teams).filter(team => 
            team !== gameState?.selectedTeam
        );
        
        if (availableTeams.length === 0) return;
        
        const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
        const teamPlayers = window.teams[randomTeam];
        
        if (!teamPlayers || teamPlayers.length <= 18) return; // 최소 인원 유지
        
        const availablePlayers = teamPlayers.filter(player => 
            !this.transferMarket.some(tp => 
                tp.name === player.name && tp.originalTeam === randomTeam
            )
        );
        
        if (availablePlayers.length > 0) {
            const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
            this.addPlayerToMarket(randomPlayer, randomTeam, {
                daysOnMarket: 0,
                transferReason: "새로운 기회"
            });
        }
    }

    updateMarketAfterTransfer(player, finalPrice) {
        // 같은 포지션 선수들의 가치에 영향
        const positionPlayers = this.transferMarket.filter(p => p.position === player.position);
        
        positionPlayers.forEach(p => {
            // 비슷한 능력치의 선수 가격 상승
            if (Math.abs(p.rating - player.rating) <= 5) {
                p.price = Math.round(p.price * 1.05); // 5% 상승
            }
        });
        
        // 포지션별 트렌드 업데이트
        const positionTrend = this.marketTrends.get(player.position);
        if (positionTrend) {
            positionTrend.trend = Math.min(1.3, positionTrend.trend * 1.02);
        }
    }

    updatePlayerValues() {
        // 선수 성장에 따른 시장 가치 업데이트
        this.transferMarket.forEach(player => {
            const newPrice = this.calculatePlayerPrice(player);
            if (Math.abs(newPrice - player.price) / player.price > 0.1) { // 10% 이상 변화
                player.price = newPrice;
            }
        });
    }

    updatePlayerValuesBasedOnPerformance(matchData) {
        // 경기 결과에 따른 선수 가치 변동
        const winningTeam = matchData.homeScore > matchData.awayScore ? matchData.homeTeam : matchData.awayTeam;
        const losingTeam = matchData.homeScore > matchData.awayScore ? matchData.awayTeam : matchData.homeTeam;
        
        // 승리팀 선수들 가치 소폭 상승
        this.adjustTeamPlayersValue(winningTeam, 1.02); // 2% 상승
        
        // 패배팀 선수들 가치 소폭 하락
        this.adjustTeamPlayersValue(losingTeam, 0.99); // 1% 하락
    }

    adjustTeamPlayersValue(teamKey, multiplier) {
        this.transferMarket.forEach(player => {
            if (player.originalTeam === teamKey) {
                player.price = Math.round(player.price * multiplier);
            }
        });
    }

    // ===========================================
    // 유틸리티 함수들
    // ===========================================

    getTeamStrength(teamKey) {
        const teamPlayers = window.teams[teamKey];
        if (!teamPlayers || teamPlayers.length === 0) return 70;
        
        const sortedPlayers = teamPlayers.sort((a, b) => b.rating - a.rating);
        const topPlayers = sortedPlayers.slice(0, 11);
        return topPlayers.reduce((sum, p) => sum + p.rating, 0) / topPlayers.length;
    }

    getTeamReputation(teamKey) {
        const reputations = {
            'realMadrid': 1.0, 'barcelona': 1.0, 'manCity': 0.9, 'bayern': 0.9,
            'liverpool': 0.8, 'psg': 0.8, 'manUnited': 0.7, 'chelsea': 0.7,
            'arsenal': 0.6, 'tottenham': 0.6, 'dortmund': 0.6, 'acMilan': 0.6,
            'inter': 0.5, 'atMadrid': 0.5, 'leverkusen': 0.4, 'napoli': 0.4,
            'asRoma': 0.3, 'newCastle': 0.3, 'seryun': 1.2 // 레전드 팀
        };
        
        return reputations[teamKey] || 0.5;
    }

    trackPlayerValue(player, price) {
        const key = `${player.name}_${player.position}`;
        if (!this.playerValues.has(key)) {
            this.playerValues.set(key, []);
        }
        
        const valueHistory = this.playerValues.get(key);
        valueHistory.push({
            price: price,
            timestamp: Date.now(),
            age: player.age,
            rating: player.rating
        });
        
        // 최근 10개 기록만 유지
        if (valueHistory.length > 10) {
            valueHistory.splice(0, valueHistory.length - 10);
        }
    }

    recordTransfer(transferData) {
        this.transferHistory.push({
            ...transferData,
            id: Date.now() + Math.random()
        });
        
        // 최근 100개 기록만 유지
        if (this.transferHistory.length > 100) {
            this.transferHistory = this.transferHistory.slice(-100);
        }
        
        // 이적 콜백 실행
        this.executeTransferCallbacks(transferData);
    }

    executeTransferCallbacks(transferData) {
        this.transferCallbacks.forEach(callback => {
            try {
                callback(transferData);
            } catch (error) {
                console.error('이적 콜백 실행 오류:', error);
            }
        });
    }

    shuffleTransferMarket() {
        for (let i = this.transferMarket.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.transferMarket[i], this.transferMarket[j]] = [this.transferMarket[j], this.transferMarket[i]];
        }
    }

    // ===========================================
    // 정보 조회 메서드들
    // ===========================================

    getTransferMarketDisplay(limit = 20, filters = {}) {
        let players = this.searchPlayers(filters);
        
        // 기본 정렬 (평점 높은 순)
        if (!filters.sortBy) {
            players = players.sort((a, b) => b.rating - a.rating);
        }
        
        return players.slice(0, limit);
    }

    getTransferHistory(limit = 10) {
        return this.transferHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    getPlayerValueHistory(playerName, position) {
        const key = `${playerName}_${position}`;
        return this.playerValues.get(key) || [];
    }

    getMarketTrends() {
        const trends = {};
        this.marketTrends.forEach((trendData, position) => {
            trends[position] = {
                trend: trendData.trend,
                direction: trendData.momentum > 0 ? 'rising' : 
                         trendData.momentum < 0 ? 'falling' : 'stable',
                percentage: Math.round((trendData.trend - 1) * 100)
            };
        });
        return trends;
    }

    getTransferStats() {
        const stats = {
            totalPlayers: this.transferMarket.length,
            averagePrice: 0,
            priceRanges: {
                under500: 0,
                between500_1000: 0,
                between1000_2000: 0,
                over2000: 0
            },
            positionCounts: { GK: 0, DF: 0, MF: 0, FW: 0 },
            ageCounts: {
                under21: 0,
                between21_25: 0,
                between26_30: 0,
                over30: 0
            },
            totalTransfers: this.transferHistory.length
        };
        
        if (this.transferMarket.length > 0) {
            stats.averagePrice = Math.round(
                this.transferMarket.reduce((sum, p) => sum + p.price, 0) / this.transferMarket.length
            );
            
            this.transferMarket.forEach(player => {
                // 가격대별 분류
                if (player.price < 500) stats.priceRanges.under500++;
                else if (player.price < 1000) stats.priceRanges.between500_1000++;
                else if (player.price < 2000) stats.priceRanges.between1000_2000++;
                else stats.priceRanges.over2000++;
                
                // 포지션별 분류
                stats.positionCounts[player.position]++;
                
                // 나이별 분류
                if (player.age < 21) stats.ageCounts.under21++;
                else if (player.age < 26) stats.ageCounts.between21_25++;
                else if (player.age < 31) stats.ageCounts.between26_30++;
                else stats.ageCounts.over30++;
            });
        }
        
        return stats;
    }

    getTopTransfers(limit = 5) {
        return this.transferHistory
            .filter(transfer => transfer.fee > 0)
            .sort((a, b) => b.fee - a.fee)
            .slice(0, limit);
    }

    getRecentAITransfers(limit = 5) {
        return this.transferHistory
            .filter(transfer => transfer.type === 'ai_transfer')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    // ===========================================
    // 고급 기능들
    // ===========================================

    addTransferCallback(callback) {
        this.transferCallbacks.add(callback);
    }

    removeTransferCallback(callback) {
        this.transferCallbacks.delete(callback);
    }

    onPlayerTransferred(transferData) {
        // 다른 시스템에서 이적 알림을 받았을 때 처리
        this.updateMarketAfterTransfer(transferData.player, transferData.fee);
    }

    generateTransferRumors() {
        // 5% 확률로 이적 루머 생성
        if (Math.random() > 0.05) return null;
        
        const availablePlayer = this.transferMarket[
            Math.floor(Math.random() * this.transferMarket.length)
        ];
        
        if (!availablePlayer) return null;
        
        const gameState = window.gameManager?.gameState;
        const interestedTeams = Object.keys(window.teams).filter(team => 
            team !== gameState?.selectedTeam && team !== availablePlayer.originalTeam
        );
        
        if (interestedTeams.length === 0) return null;
        
        const rumorTeam = interestedTeams[Math.floor(Math.random() * interestedTeams.length)];
        
        return {
            player: availablePlayer,
            interestedTeam: rumorTeam,
            rumored: true,
            reliability: Math.random() * 100, // 0-100% 신뢰도
            timestamp: Date.now()
        };
    }

    simulateTransferWindow() {
        // 이적 윈도우 시뮬레이션 (시즌 특정 시기)
        const currentMatch = window.gameManager?.gameState?.matchesPlayed || 0;
        
        // 시즌 중반 (15-20경기) 또는 시즌 말 (30-36경기)에 활성화
        const isTransferWindow = (currentMatch >= 15 && currentMatch <= 20) || 
                               (currentMatch >= 30 && currentMatch <= 36);
        
        if (isTransferWindow) {
            // 이적 활동 증가
            this.aiTransferCooldown = Math.max(0, this.aiTransferCooldown - 1);
            
            // 더 많은 선수들이 시장에 나옴
            if (Math.random() < 0.3) {
                this.addRandomPlayerToMarket();
            }
            
            // 가격 변동성 증가
            this.transferMarket.forEach(player => {
                const priceChange = (Math.random() - 0.5) * 0.1; // ±5%
                player.price = Math.round(player.price * (1 + priceChange));
            });
        }
        
        return isTransferWindow;
    }

    // ===========================================
    // 저장/로드
    // ===========================================

    getSaveData() {
        return {
            transferMarket: this.transferMarket.slice(0, 50), // 최근 50명만 저장
            transferHistory: this.transferHistory.slice(-50), // 최근 50건만 저장
            aiTransferCooldown: this.aiTransferCooldown,
            marketTrends: Array.from(this.marketTrends.entries()),
            playerValues: Array.from(this.playerValues.entries()).slice(-100) // 최근 100개만
        };
    }

    loadSaveData(saveData) {
        if (!saveData) return;
        
        this.transferMarket = saveData.transferMarket || [];
        this.transferHistory = saveData.transferHistory || [];
        this.aiTransferCooldown = saveData.aiTransferCooldown || 0;
        
        // Map 데이터 복원
        if (saveData.marketTrends) {
            this.marketTrends = new Map(saveData.marketTrends);
        }
        
        if (saveData.playerValues) {
            this.playerValues = new Map(saveData.playerValues);
        }
        
        console.log('💼 이적 시스템 데이터 복원 완료');
    }

    // ===========================================
    // 정리 및 리셋
    // ===========================================

    cleanup() {
        // 콜백들 정리
        this.transferCallbacks.clear();
        
        // 메모리 정리 - 오래된 데이터 제거
        if (this.transferHistory.length > 200) {
            this.transferHistory = this.transferHistory.slice(-100);
        }
        
        if (this.transferMarket.length > 100) {
            // 오래된 선수들 제거 (90일 이상)
            this.transferMarket = this.transferMarket.filter(
                player => player.daysOnMarket < 90
            );
        }
        
        // 선수 가치 기록 정리
        this.playerValues.forEach((history, key) => {
            if (history.length > 20) {
                this.playerValues.set(key, history.slice(-10));
            }
        });
        
        console.log('🧹 이적 시스템 정리 완료');
    }

    resetTransferSystem() {
        this.transferMarket = [];
        this.transferHistory = [];
        this.aiTransferCooldown = 0;
        this.marketTrends.clear();
        this.playerValues.clear();
        
        this.initializeMarketTrends();
        console.log('🔄 이적 시스템 초기화 완료');
    }

    // ===========================================
    // 디버깅 및 테스트 함수들
    // ===========================================

    debugTransferSystem() {
        console.group('🔍 이적 시스템 디버그 정보');
        console.log('시장 선수 수:', this.transferMarket.length);
        console.log('이적 기록 수:', this.transferHistory.length);
        console.log('AI 이적 쿨다운:', this.aiTransferCooldown);
        console.log('시장 동향:', this.getMarketTrends());
        console.log('이적 통계:', this.getTransferStats());
        console.groupEnd();
    }

    forceAITransfer() {
        // 테스트용 강제 AI 이적
        this.aiTransferCooldown = 0;
        this.executeAITransfer();
        console.log('🔧 강제 AI 이적 실행됨');
    }

    addTestPlayer() {
        // 테스트용 선수 추가
        const testPlayer = {
            name: "테스트 선수",
            position: "FW",
            rating: 85,
            age: 25,
            originalTeam: "테스트팀",
            price: 1500,
            daysOnMarket: 0,
            negotiable: true
        };
        
        this.transferMarket.push(testPlayer);
        console.log('🔧 테스트 선수 추가됨');
    }
}

// 기존 시스템과의 호환성을 위한 래퍼
if (!window.transferSystem) {
    window.transferSystem = new EnhancedTransferSystem();
}

// 기존 전역 함수들 유지 (호환성)
window.initializeTransferMarket = () => {
    if (window.transferSystem && !window.transferSystem.isInitialized) {
        window.transferSystem.initialize();
    }
};

window.displayTransferPlayers = (filters = {}) => {
    if (!window.transferSystem) {
        console.error('이적 시스템이 초기화되지 않았습니다.');
        return;
    }

    const container = document.getElementById('transferPlayers');
    if (!container) return;

    container.innerHTML = '';
    const transferPlayers = window.transferSystem.getTransferMarketDisplay(20, filters);

    if (transferPlayers.length === 0) {
        container.innerHTML = '<p>현재 이적 가능한 선수가 없습니다.</p>';
        return;
    }

    transferPlayers.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'transfer-player enhanced';
        
        const teamInfo = player.originalTeam === "외부리그" ? 
            "외부리그" : (window.teamNames[player.originalTeam] || player.originalTeam);
        
        // 향상된 UI
        playerCard.innerHTML = `
            <div class="player-header">
                <div class="player-name">${player.name}</div>
                <div class="player-badges">
                    ${player.isLegend ? '<span class="badge legend">👑 레전드</span>' : ''}
                    ${player.isWonderKid ? '<span class="badge wonderkid">⭐ 유망주</span>' : ''}
                    ${player.negotiable ? '<span class="badge negotiable">💬 협상가능</span>' : ''}
                </div>
            </div>
            <div class="player-info">
                <div class="basic-info">
                    <span class="position">${player.position}</span>
                    <span class="rating">능력치: ${player.rating}</span>
                    <span class="age">나이: ${player.age}</span>
                </div>
                <div class="extended-info">
                    <span class="team">소속: ${teamInfo}</span>
                    <span class="contract">계약: ${player.contractYears || 'N/A'}년</span>
                    <span class="reason">사유: ${player.transferReason || 'N/A'}</span>
                </div>
            </div>
            <div class="market-info">
                <div class="price">${player.price}억</div>
                <div class="market-details">
                    <span class="days">시장 ${player.daysOnMarket}일째</span>
                    <span class="trend ${player.marketTrend}">${player.marketTrend === 'rising' ? '📈' : player.marketTrend === 'falling' ? '📉' : '➡️'}</span>
                    <span class="demand">${player.demandLevel}</span>
                </div>
            </div>
        `;
        
        playerCard.addEventListener('click', () => {
            const negotiateDiscount = player.negotiable && confirm('협상을 시도하시겠습니까? (추가 비용 절약 가능)');
            const result = window.transferSystem.signPlayer(player, negotiateDiscount);
            
            if (result.success) {
                if (window.gameManager) {
                    window.gameManager.gameState.teamMoney = Math.max(0, window.gameManager.gameState.teamMoney);
                    if (typeof window.updateDisplay === 'function') {
                        window.updateDisplay();
                    }
                }
                
                alert(result.message + (result.savings > 0 ? `\n절약 금액: ${result.savings}억원` : ''));
                displayTransferPlayers(); // 목록 새로고침
                
                // 성장 시스템에 새 선수 추가
                if (result.player.age <= 28 && window.playerGrowthSystem) {
                    if (typeof window.playerGrowthSystem.initializePlayersForTeam === 'function') {
                        window.playerGrowthSystem.initializePlayersForTeam(window.gameManager.gameState.selectedTeam);
                    }
                }
                
                // 팀 선수 목록 새로고침
                if (document.getElementById('squad').classList.contains('active')) {
                    if (typeof window.displayTeamPlayers === 'function') {
                        window.displayTeamPlayers();
                    }
                }
            } else {
                alert(result.message);
            }
        });
        
        container.appendChild(playerCard);
    });
};

window.searchPlayers = () => {
    if (!window.transferSystem) return;
    
    const filters = {
        name: document.getElementById('nameSearch')?.value,
        position: document.getElementById('positionFilter')?.value,
        minRating: parseInt(document.getElementById('minRating')?.value) || 0,
        maxAge: parseInt(document.getElementById('maxAge')?.value) || 999,
        maxPrice: parseInt(document.getElementById('maxPrice')?.value) || 999999,
        sortBy: 'rating'
    };
    
    displayTransferPlayers(filters);
};

// GameManager 호환 클래스 등록
window.EnhancedTransferSystem = EnhancedTransferSystem;
window.TransferSystem = EnhancedTransferSystem; // 기존 이름으로도 접근 가능

console.log('✅ Enhanced Transfer System 로드 완료');// enhancedTransferSystem.js - 향상된 이적 시스템 (GameManager 호환)

class EnhancedTransferSystem {
    constructor() {
        this.transferMarket = [];
        this.transferHistory = []; // 이적 기록
        this.aiTransferCooldown = 0;
        this.marketTrends = new Map(); // 시장 동향
        this.playerValues = new Map(); // 선수 가치 추적
        this.basePrice = 500;
        this.isInitialized = false;
        
        // 확장된 타 리그 선수들 (더 현실적)
        this.extraPlayers = [
            // 현역 스타들
            { name: "V.죄케레스", position: "FW", rating: 85, age: 25, team: "외부리그", nationality: "네덜란드" },
            { name: "주앙 칸셀루", position: "DF", rating: 82, age: 31, team: "외부리그", nationality: "포르투갈" },
            { name: "L.토레이라", position: "MF", rating: 85, age: 27, team: "외부리그", nationality: "우루과이" },
            { name: "K.나카무라", position: "MF", rating: 80, age: 23, team: "외부리그", nationality: "일본" },
            { name: "R.산체스", position: "GK", rating: 84, age: 29, team: "외부리그", nationality: "칠레" },
            
            // 레전드들 (은퇴 위기)
            { name: "C.호날두", position: "FW", rating: 91, age: 40, team: "외부리그", nationality: "포르투갈", 
              isLegend: true, marketValue: 2000 },
            { name: "리오넬 메시", position: "FW", rating: 92, age: 37, team: "외부리그", nationality: "아르헨티나", 
              isLegend: true, marketValue: 3000 },
            { name: "벤제마", position: "FW", rating: 83, age: 37, team: "외부리그", nationality: "프랑스", 
              isLegend: true, marketValue: 1200 },
            
            // 중견 선수들
            { name: "사디오 마네", position: "FW", rating: 83, age: 33, team: "외부리그", nationality: "세네갈" },
            { name: "은골로 캉테", position: "MF", rating: 84, age: 34, team: "외부리그", nationality: "프랑스" },
            { name: "음뵈모", position: "FW", rating: 87, age: 26, team: "외부리그", nationality: "벨기에" },
            { name: "포그바", position: "MF", rating: 80, age: 32, team: "외부리그", nationality: "프랑스" },
            { name: "라포르트", position: "DF", rating: 83, age: 31, team: "외부리그", nationality: "스페인" },
            
            // 유망주들
            { name: "엔드리크 펠리페", position: "FW", rating: 78, age: 18, team: "외부리그", nationality: "브라질", 
              isWonderKid: true, growthPotential: 15 },
            { name: "A.시몬스", position: "MF", rating: 72, age: 19, team: "외부리그", nationality: "네덜란드", 
              isWonderKid: true, growthPotential: 12 },
            { name: "M.텔", position: "FW", rating: 75, age: 19, team: "외부리그", nationality: "독일", 
              isWonderKid: true, growthPotential: 10 }
        ];
        
        // 이적 이벤트 콜백들
        this.transferCallbacks = new Set();
        
        console.log('💼 향상된 이적 시스템 생성됨');
    }

    // ===========================================
    // 초기화 및 GameManager 연동
    // ===========================================

    initialize() {
        if (this.isInitialized) {
            console.warn('⚠️ TransferSystem 이미 초기화됨');
            return;
        }

        this.setupGameManagerIntegration();
        this.initializeMarketTrends();
        this.isInitialized = true;
        
        console.log('✅ 향상된 이적 시스템 초기화 완료');
    }

    setupGameManagerIntegration() {
        if (window.gameManager) {
            window.gameManager.on('teamSelected', (teamKey) => this.onTeamSelected(teamKey));
            window.gameManager.on('matchEnded', (matchData) => this.onMatchEnd(matchData));
            window.gameManager.on('playerGrowth', () => this.updatePlayerValues());
        }
    }

    onTeamSelected(teamKey) {
        this.initializeTransferMarket();
        this.calculateInitialPlayerValues(teamKey);
        console.log(`💼 이적 시스템: ${teamKey} 팀 선택 처리 완료`);
    }

    onMatchEnd(matchData) {
        this.updateMarketAfterMatch();
        this.processAITransfers();
        this.updatePlayerValuesBasedOnPerformance(matchData);
    }

    // ===========================================
    // 이적 시장 초기화 및 관리
    // ===========================================

    initializeTransferMarket() {
        this.transferMarket = [];
        
        // 기존 팀 선수들을 이적 시장에 추가
        Object.keys(window.teams || {}).forEach(teamKey => {
            if (teamKey !== window.gameManager?.gameState?.selectedTeam) {
                this.addTeamPlayersToMarket(teamKey);
            }
        });

        // 타 리그 선수들 추가
        this.addExternalPlayersToMarket();
        
        // 시장 섞기
        this.shuffleTransferMarket();
        
        console.log(`💼 이적 시장 초기화: ${this.transferMarket.length}명의 선수`);
    }

    addTeamPlayersToMarket(teamKey) {
        const teamPlayers = window.teams[teamKey];
        if (!teamPlayers) return;
        
        teamPlayers.forEach(player => {
            // 20% 확률로 이적 시장에 등록 (팀 상황에 따라 조정)
            const listingChance = this.calculateListingChance(player, teamKey);
            
            if (Math.random() < listingChance) {
                this.addPlayerToMarket(player, teamKey);
            }
        });
    }

    calculateListingChance(player, teamKey) {
        let chance = 0.2; // 기본 20%
        
        // 나이에 따른 조정
        if (player.age >= 35) chance += 0.3; // 베테랑은 이적 가능성 높음
        else if (player.age <= 22) chance += 0.1; // 유망주도 약간 높음
        else if (player.age >= 30) chance += 0.1;
        
        // 능력치에 따른 조정
        if (player.rating < 70) chance += 0.2; // 낮은 능력치
        else if (player.rating >= 90) chance -= 0.15; // 최고급 선수는 잘 안 나옴
        
        // 팀 강도에 따른 조정
        const teamStrength = this.getTeamStrength(teamKey);
        if (teamStrength < 75) chance += 0.1; // 약한 팀은 선수 매각 가능성 높음
        else if (teamStrength >= 85) chance -= 0.05; // 강한 팀은 잘 안 팖
        
        return Math.min(0.6, Math.max(0.05, chance)); // 5% ~ 60% 사이
    }

    addPlayerToMarket(player, originalTeam, additionalInfo = {}) {
        const marketPlayer = {
            ...player,
            originalTeam: originalTeam,
            price: this.calculatePlayerPrice(player),
            daysOnMarket: Math.floor(Math.random() * 30),
            marketTrend: this.getPlayerMarketTrend(player),
            contractYears: additionalInfo.contractYears || Math.floor(Math.random() * 4) + 1,
            transferReason: additionalInfo.reason || this.generateTransferReason(player),
            demandLevel: this.calculateDemandLevel(player),
            negotiable: Math.random() < 0.7, // 70% 확률로 협상 가능
            ...additionalInfo
        };

        this.transferMarket.push(marketPlayer);
        this.trackPlayerValue(player, marketPlayer.price);
    }

    addExternalPlayersToMarket() {
        this.extraPlayers.forEach(player => {
            const enhancedPlayer = {
                ...player,
                originalTeam: "외부리그",
                price: this.calculatePlayerPrice(player),
                daysOnMarket: Math.floor(Math.random() * 60),
                isExternalPlayer: true,
                contractYears: Math.floor(Math.random() * 3) + 1,
                transferReason: player.isLegend ? "새로운 도전" : "더 나은 기회",
                demandLevel: player.isLegend ? "very_high" : "medium"
            };
            
            this.transferMarket.push(enhancedPlayer);
        });
    }

    generateTransferReason(player) {
        const reasons = [
            "계약 만료 임박", "새로운 도전", "출전 기회 부족", "팀 전술에 맞지 않음",
            "더 높은 연봉", "가족 사정", "부상 회복", "감독과의 갈등", "팀 재정 문제"
        ];
        
        // 나이와 능력치에 따라 적절한 이유 선택
        if (player.age >= 35) {
            return Math.random() < 0.4 ? "은퇴 준비" : "마지막 도전";
        } else if (player.age <= 22) {
            return Math.random() < 0.6 ? "출전 기회 부족" : "성장을 위한 이적";
        }
        
        return reasons[Math.floor(Math.random() * reasons.length)];
    }

    calculateDemandLevel(player) {
        if (player.rating >= 88) return "very_high";
        if (player.rating >= 83) return "high";
        if (player.rating >= 78) return "medium";
        if (player.rating >= 73) return "low";
        return "very_low";
    }

    // ===========================================
    // 선수 가격 계산 (고도화)
    // ===========================================

    calculatePlayerPrice(player) {
        let price = this.basePrice;
        
        // 기본 능력치 배수
        const ratingMultiplier = Math.pow(player.rating / 70, 2.8);
        price *= ratingMultiplier;
        
        // 나이 곡선 (더 현실적)
        let ageMultiplier = this.getAgeMultiplier(player.age);
        
        // 레전드 보정
        if (player.isLegend) {
            ageMultiplier *= 2.5; // 레전드는 나이 불문하고 비쌈
        }
        
        // 유망주 보정
        if (player.isWonderKid && player.growthPotential) {
            ageMultiplier *= (1 + player.growthPotential * 0.1);
        }
        
        price *= ageMultiplier;
        
        // 포지션별 시장 가치
        const positionMultiplier = {
            'GK': 0.9,
            'DF': 1.0,
            'MF': 1.1,
            'FW': 1.3
        };
        price *= positionMultiplier[player.position] || 1.0;
        
        // 시장 동향 반영
        const marketTrend = this.getMarketTrendMultiplier(player);
        price *= marketTrend;
        
        // 수요 공급 법칙
        const demandMultiplier = this.getDemandMultiplier(player);
        price *= demandMultiplier;
        
        // 계약 상황 반영
        if (player.contractYears <= 1) {
            price *= 0.6; // 계약 만료 임박 시 할인
        } else if (player.contractYears >= 4) {
            price *= 1.2; // 장기 계약 시 프리미엄
        }
        
        // 랜덤 요소 (80% ~ 130%)
        const randomFactor = 0.8 + Math.random() * 0.5;
        price *= randomFactor;
        
        return Math.round(price);
    }

    getAgeMultiplier(age) {
        // 더 현실적인 나이 곡선
        if (age <= 17) return 1.8;
        if (age <= 20) return 2.2;
        if (age <= 23) return 2.0;
        if (age <= 25) return 1.8;
        if (age <= 27) return 1.5;
        if (age <= 29) return 1.2;
        if (age <= 31) return 1.0;
        if (age <= 33) return 0.8;
        if (age <= 35) return 0.6;
        if (age <= 37) return 0.4;
        return 0.2;
    }

    getMarketTrendMultiplier(player) {
        const trend = this.marketTrends.get(player.position) || { trend: 1.0 };
        return Math.max(0.7, Math.min(1.5, trend.trend));
    }

    getDemandMultiplier(player) {
        const demandMultipliers = {
            'very_high': 1.4,
            'high': 1.2,
            'medium': 1.0,
            'low': 0.9,
            'very_low': 0.8
        };
        
        return demandMultipliers[player.demandLevel] || 1.0;
    }

    // ===========================================
    // 시장 동향 관리
    // ===========================================

    initializeMarketTrends() {
        const positions = ['GK', 'DF', 'MF', 'FW'];
        
        positions.forEach(position => {
            this.marketTrends.set(position, {
                trend: 0.95 + Math.random() * 0.1, // 0.95 ~ 1.05
                momentum: 0,
                lastUpdate: Date.now()
            });
        });
    }

    updateMarketTrends() {
        this.marketTrends.forEach((trendData, position) => {
            // 트렌드는 서서히 변화
            const change = (Math.random() - 0.5) * 0.02; // ±1%
            trendData.trend = Math.max(0.8, Math.min(1.3, trendData.trend + change));
            trendData.momentum = change;
            trendData.lastUpdate = Date.now();
        });
    }

    getPlayerMarketTrend(player) {
        const positionTrend = this.marketTrends.get(player.position);
        if (!positionTrend) return "stable";
        
        if (positionTrend.trend > 1.1) return "rising";
        if (positionTrend.trend < 0.9) return "falling";
        return "stable";
    }

    // ===========================================
    // 선수 검색 및 필터링
    // ===========================================

    searchPlayers(filters) {
        let filteredPlayers = [...this.transferMarket];
        
        // 기본 필터들
        if (filters.name && filters.name.trim()) {
            const searchName = filters.name.toLowerCase