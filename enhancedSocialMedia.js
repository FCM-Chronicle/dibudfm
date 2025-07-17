// enhancedSocialMedia.js - 향상된 SNS 시스템 (AI 이적 알림 포함)

class EnhancedSocialMediaSystem {
    constructor() {
        this.posts = [];
        this.followers = 1200;
        this.transferWatchers = new Set(); // 이적 관심 목록
        this.lastAITransferCheck = Date.now();
        this.trendingTopics = new Map();
        
        // 확장된 반응들 (기존 + 이적 관련)
        this.reactions = {
            // 기존 반응들...
            bigWin: [
                "ㅅㅂ 개쩐다 ㅋㅋㅋㅋㅋ", "개털었네 ㄹㅇ", "역시 감독님의 크신 은혜겠지요 ㅠㅠ",
                "축구는 역시 발로", "상대팀 불쌍해보이누 ㅋㅋㅋ", "오늘만큼은 행복하다"
            ],
            normalWin: [
                "좋다 3점 땡큐", "힘들게 이겼네", "선수들 폼 슬슬 오르는듯", "그래도 이기면 장땡이지"
            ],
            
            // 새로운 이적 관련 반응들
            shockingTransfer: [
                "헐 이거 진짜냐?? 🤯", "완전 예상 못했는데", "이적료 얼마야?", "개사기 이적이네",
                "어떻게 이런 일이", "축구는 정말 모르겠다", "충격이다 진짜", "이건 좀 의외인데?",
                "관계자분들 어떻게 생각하세요", "FM 현실판이네 ㄷㄷ", "감독 판단이 대단하네",
                "팬들 반응이 궁금하다", "이제 어떻게 될까", "완전 판이 바뀌겠는데"
            ],
            
            starTransfer: [
                "오 좋은 영입이네", "잘 뽑았다", "돈값 할듯", "팀이 강해지겠는데?",
                "이제 우승 가능한가?", "좋은 보강이다", "영입 센스 좋네", "기대된다 ㄷㄷ",
                "이런 선수 필요했어", "감독 눈 좋네", "가성비 좋아보이는데"
            ],
            
            normalTransfer: [
                "음 괜찮은 것 같은데", "적당한 영입이네", "그냥 그럭저럭", "이정도면 괜찮지",
                "무난한 선택인듯", "별로 특별할건 없네", "평범한 영입", "그냥 보강용인가",
                "나쁘지 않은데?", "뭔가 아쉽긴 하지만", "기대는 안되지만 나쁘지 않아"
            ],
            
            controversialTransfer: [
                "이건 좀 아닌것 같은데", "왜 이 선수를?", "이해 안되는 영입", "돈 낭비 아냐?",
                "다른 선수 사지 왜 이걸", "영입 실패 냄새", "의문스러운 선택", "팬들 화낼듯",
                "이상한 선수 영입하네", "감독이 뭘 생각하는거야", "반대 의견 많을듯"
            ],
            
            retireTransfer: [
                "은퇴하는구나 ㅠㅠ", "레전드의 마지막", "수고하셨습니다", "감동이다 진짜",
                "추억이 새록새록", "정말 오랫동안 봤는데", "감사했습니다", "좋은 선수였어",
                "이제 끝이구나", "레전드 은퇴 ㅠㅠ", "축구계 큰 손실"
            ]
        };
        
        // 이적 관련 키워드와 임팩트 점수
        this.transferImpact = {
            shocking: { threshold: 15, hashtags: ['#충격이적', '#대박', '#예상밖'] },
            star: { threshold: 10, hashtags: ['#스타영입', '#대형영입', '#보강완료'] },
            normal: { threshold: 5, hashtags: ['#영입', '#이적'] },
            controversial: { threshold: -5, hashtags: ['#의문의영입', '#논란'] }
        };
    }

    // ===========================================
    // 초기화 및 설정
    // ===========================================

    initialize() {
        this.setupAITransferMonitoring();
        this.loadSavedData();
        console.log('📱 향상된 SNS 시스템 초기화 완료');
    }

    setupAITransferMonitoring() {
        // AI 팀 간 이적 모니터링 시작
        this.aiTransferInterval = setInterval(() => {
            this.checkForAITransfers();
        }, 30000); // 30초마다 체크
        
        console.log('👥 AI 이적 모니터링 시작');
    }

    // ===========================================
    // AI 이적 감지 및 알림
    // ===========================================

    checkForAITransfers() {
        try {
            // GameManager의 transferSystem에서 최근 이적 확인
            const transferSystem = window.gameManager?.transferSystem;
            if (!transferSystem) return;

            // 새로운 AI 이적 시뮬레이션 실행
            this.simulateAITransfer();
            
        } catch (error) {
            console.error('AI 이적 체크 오류:', error);
        }
    }

    simulateAITransfer() {
        // 5% 확률로 AI 팀 간 이적 발생
        if (Math.random() > 0.05) return;

        const teams = Object.keys(window.teams || {});
        const userTeam = window.gameManager?.gameState?.selectedTeam;
        const aiTeams = teams.filter(team => team !== userTeam);
        
        if (aiTeams.length < 2) return;

        // 랜덤하게 팀 선택
        const fromTeam = aiTeams[Math.floor(Math.random() * aiTeams.length)];
        const toTeam = aiTeams.filter(t => t !== fromTeam)[Math.floor(Math.random() * (aiTeams.length - 1))];
        
        const fromTeamPlayers = window.teams[fromTeam];
        if (!fromTeamPlayers || fromTeamPlayers.length <= 15) return; // 최소 인원 유지

        // 이적할 선수 선택 (능력치와 나이 고려)
        const transferCandidate = this.selectTransferCandidate(fromTeamPlayers);
        if (!transferCandidate) return;

        // 이적 실행
        this.executeAITransfer(transferCandidate, fromTeam, toTeam);
    }

    selectTransferCandidate(players) {
        // 가중치 기반 선수 선택
        const candidates = players.map(player => {
            let weight = 1;
            
            // 능력치별 가중치 (중간 능력치 선수가 이적할 확률 높음)
            if (player.rating >= 90) weight *= 0.1; // 최고급 선수는 거의 안 움직임
            else if (player.rating >= 85) weight *= 0.3; // 스타급은 가끔
            else if (player.rating >= 80) weight *= 1.5; // 준수한 선수들이 자주 이적
            else if (player.rating >= 75) weight *= 2.0; // 중급 선수들이 가장 많이 이적
            else weight *= 1.2; // 하급 선수들도 이적
            
            // 나이별 가중치
            if (player.age <= 25) weight *= 1.8; // 젊은 선수 선호
            else if (player.age <= 30) weight *= 1.2;
            else if (player.age >= 35) weight *= 0.3; // 나이 많은 선수는 잘 안 움직임
            
            return { player, weight };
        });

        // 가중치 기반 랜덤 선택
        const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
        let randomValue = Math.random() * totalWeight;
        
        for (const candidate of candidates) {
            randomValue -= candidate.weight;
            if (randomValue <= 0) {
                return candidate.player;
            }
        }
        
        return candidates[0]?.player;
    }

    executeAITransfer(player, fromTeam, toTeam) {
        // 실제 팀 데이터에서 선수 이동
        const fromTeamPlayers = window.teams[fromTeam];
        const playerIndex = fromTeamPlayers.findIndex(p => 
            p.name === player.name && p.position === player.position
        );
        
        if (playerIndex === -1) return;

        // 선수 제거 및 추가
        fromTeamPlayers.splice(playerIndex, 1);
        window.teams[toTeam].push({ ...player });

        // 이적료 계산
        const transferFee = this.calculateTransferFee(player);
        
        // 이적 임팩트 계산
        const impact = this.calculateTransferImpact(player, fromTeam, toTeam);
        
        // 이적 데이터 생성
        const transferData = {
            type: 'ai_transfer',
            player: player,
            fromTeam: fromTeam,
            toTeam: toTeam,
            fee: transferFee,
            impact: impact,
            timestamp: Date.now(),
            isShockingTransfer: impact >= this.transferImpact.shocking.threshold,
            isStarTransfer: impact >= this.transferImpact.star.threshold,
            isControversial: impact < 0
        };

        // SNS 포스트 생성
        this.createAITransferPost(transferData);
        
        // GameManager에 알림
        if (window.gameManager) {
            window.gameManager.emit('playerTransferred', transferData);
        }

        console.log(`🔄 AI 이적 실행: ${player.name} (${fromTeam} → ${toTeam}) - 임팩트: ${impact}`);
    }

    calculateTransferFee(player) {
        let baseFee = 200; // 기본 200억
        
        // 능력치별 이적료
        baseFee *= Math.pow(player.rating / 70, 2.5);
        
        // 나이별 조정
        if (player.age <= 23) baseFee *= 1.4;
        else if (player.age <= 27) baseFee *= 1.2;
        else if (player.age >= 32) baseFee *= 0.7;
        
        // 포지션별 조정
        const positionMultiplier = { 'GK': 0.8, 'DF': 0.9, 'MF': 1.0, 'FW': 1.3 };
        baseFee *= positionMultiplier[player.position] || 1.0;
        
        // 랜덤 요소
        baseFee *= (0.8 + Math.random() * 0.4);
        
        return Math.round(baseFee);
    }

    calculateTransferImpact(player, fromTeam, toTeam) {
        let impact = 0;
        
        // 기본 임팩트 (능력치 기반)
        impact += (player.rating - 70) * 0.5;
        
        // 나이 보정
        if (player.age <= 22) impact += 3; // 유망주
        else if (player.age >= 35) impact += 5; // 베테랑 이적
        
        // 팀 간 격차 (강팀 → 약팀 or 약팀 → 강팀)
        const fromTeamStrength = this.getTeamStrength(fromTeam);
        const toTeamStrength = this.getTeamStrength(toTeam);
        
        const strengthDiff = Math.abs(fromTeamStrength - toTeamStrength);
        if (strengthDiff > 10) {
            impact += strengthDiff * 0.3;
        }
        
        // 라이벌 팀 간 이적 (같은 리그 내 상위권 팀들)
        if (this.areRivalTeams(fromTeam, toTeam)) {
            impact += 8;
        }
        
        // 랜덤 이변 요소
        if (Math.random() < 0.1) {
            impact += Math.random() * 10; // 예상 외 충격
        }
        
        return Math.round(impact);
    }

    getTeamStrength(teamKey) {
        const teamPlayers = window.teams[teamKey];
        if (!teamPlayers) return 70;
        
        const topPlayers = teamPlayers
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 11);
        
        return topPlayers.reduce((sum, p) => sum + p.rating, 0) / topPlayers.length;
    }

    areRivalTeams(team1, team2) {
        const rivals = [
            ['manCity', 'manUnited'], ['arsenal', 'tottenham'], ['liverpool', 'manUnited'],
            ['realMadrid', 'barcelona'], ['acMilan', 'inter'], ['bayern', 'dortmund']
        ];
        
        return rivals.some(pair => 
            (pair.includes(team1) && pair.includes(team2))
        );
    }

    // ===========================================
    // SNS 포스트 생성
    // ===========================================

    createAITransferPost(transferData) {
        const { player, fromTeam, toTeam, fee, impact, isShockingTransfer, isStarTransfer, isControversial } = transferData;
        
        let postContent = "";
        let postType = "ai_transfer";
        let hashtags = [];
        
        // 임팩트에 따른 포스트 내용 및 타입 결정
        if (isShockingTransfer) {
            postType = "shocking_transfer";
            postContent = `🚨 충격적인 이적 속보! ${window.teamNames[fromTeam]}의 ${player.name}(${player.rating})이 ${window.teamNames[toTeam]}로 전격 이적! 추정 이적료 ${fee}억원`;
            hashtags = this.transferImpact.shocking.hashtags;
        } else if (isStarTransfer) {
            postType = "star_transfer";
            postContent = `⭐ 빅딜 성사! ${window.teamNames[toTeam]}이 ${player.name}(${player.rating}) 영입 완료! ${window.teamNames[fromTeam]}에서 ${fee}억원에 영입`;
            hashtags = this.transferImpact.star.hashtags;
        } else if (isControversial) {
            postType = "controversial_transfer";
            postContent = `🤔 의외의 이적? ${player.name}이 ${window.teamNames[fromTeam]}에서 ${window.teamNames[toTeam]}로 이적... 과연 좋은 선택일까?`;
            hashtags = this.transferImpact.controversial.hashtags;
        } else {
            postContent = `📰 이적 소식: ${player.name}(${player.position}, ${player.age}세)이 ${window.teamNames[fromTeam]}에서 ${window.teamNames[toTeam]}로 이적했습니다`;
            hashtags = this.transferImpact.normal.hashtags;
        }
        
        // 해시태그 추가
        postContent += ` ${hashtags.join(' ')} #이적시장`;
        
        const post = {
            id: Date.now() + Math.random(),
            type: postType,
            content: postContent,
            timestamp: Date.now(),
            likes: this.generateLikes(postType),
            comments: this.generateComments(postType),
            transferData: transferData,
            trending: impact >= this.transferImpact.star.threshold
        };

        this.posts.unshift(post);
        
        // 트렌딩 토픽 업데이트
        if (post.trending) {
            this.addToTrending(player.name, impact);
        }
        
        // 팔로워 수 변화
        this.updateFollowersFromTransfer(impact);
        
        // UI 업데이트
        this.updateSocialDisplay();
        
        console.log(`📱 AI 이적 SNS 포스트 생성: ${player.name} (임팩트: ${impact})`);
    }

    addToTrending(playerName, impact) {
        this.trendingTopics.set(playerName, {
            impact: impact,
            timestamp: Date.now(),
            mentions: (this.trendingTopics.get(playerName)?.mentions || 0) + 1
        });
        
        // 24시간 지난 트렌딩 토픽 제거
        const oneDayAgo = Date.now() - 86400000;
        for (const [key, value] of this.trendingTopics.entries()) {
            if (value.timestamp < oneDayAgo) {
                this.trendingTopics.delete(key);
            }
        }
    }

    updateFollowersFromTransfer(impact) {
        let followerChange = 0;
        
        if (impact >= this.transferImpact.shocking.threshold) {
            followerChange = 15 + Math.floor(Math.random() * 25); // +15~40
        } else if (impact >= this.transferImpact.star.threshold) {
            followerChange = 5 + Math.floor(Math.random() * 15); // +5~20
        } else if (impact >= this.transferImpact.normal.threshold) {
            followerChange = Math.floor(Math.random() * 10) - 2; // -2~8
        } else {
            followerChange = -(Math.floor(Math.random() * 5) + 1); // -1~-5
        }
        
        this.followers = Math.max(100, this.followers + followerChange);
    }

    // ===========================================
    // 기존 SNS 기능들 (개선됨)
    // ===========================================

    createMatchPost(matchData) {
        const isWin = matchData.homeScore > matchData.awayScore;
        const isLoss = matchData.homeScore < matchData.awayScore;
        const scoreDiff = Math.abs(matchData.homeScore - matchData.awayScore);
        
        let postContent = "";
        let postType = "";
        
        if (isWin && scoreDiff >= 3) {
            postContent = `🏆 ${window.teamNames[matchData.awayTeam]}을 ${matchData.homeScore}-${matchData.awayScore}로 대승! 완벽한 경기였습니다! #승리 #대승`;
            postType = "bigWin";
        } else if (isWin) {
            postContent = `⚽ ${window.teamNames[matchData.awayTeam]}과의 경기에서 ${matchData.homeScore}-${matchData.awayScore} 승리! #승리 #3점`;
            postType = "normalWin";
        } else if (isLoss && scoreDiff >= 3) {
            postContent = `😞 ${window.teamNames[matchData.awayTeam]}에게 ${matchData.homeScore}-${matchData.awayScore}로 대패... 다음 경기에 더 집중하겠습니다. #패배`;
            postType = "bigLoss";
        } else if (isLoss) {
            postContent = `😔 ${window.teamNames[matchData.awayTeam]}에게 ${matchData.homeScore}-${matchData.awayScore}로 아쉬운 패배. 다음에는 꼭 이기겠습니다! #패배`;
            postType = "narrowLoss";
        } else {
            postContent = `⚖️ ${window.teamNames[matchData.awayTeam]}과 ${matchData.homeScore}-${matchData.awayScore} 무승부. 아쉽지만 1점은 챙겼습니다. #무승부`;
            postType = "draw";
        }
        
        const post = {
            id: Date.now(),
            type: 'match',
            content: postContent,
            timestamp: Date.now(),
            likes: this.generateLikes(postType),
            comments: this.generateComments(postType),
            matchData: matchData
        };
        
        this.posts.unshift(post);
        this.updateFollowers(postType);
        this.updateSocialDisplay();
    }

    generateLikes(postType) {
        const baseLikes = {
            bigWin: 800 + Math.floor(Math.random() * 1500),
            normalWin: 300 + Math.floor(Math.random() * 500),
            shocking_transfer: 1200 + Math.floor(Math.random() * 2000),
            star_transfer: 600 + Math.floor(Math.random() * 800),
            controversial_transfer: 200 + Math.floor(Math.random() * 600),
            ai_transfer: 150 + Math.floor(Math.random() * 300)
        };
        
        return baseLikes[postType] || 100 + Math.floor(Math.random() * 200);
    }

    generateComments(postType) {
        const reactionPool = this.reactions[postType] || this.reactions.normalTransfer;
        const commentCount = postType.includes('transfer') ? 4 + Math.floor(Math.random() * 6) : 3 + Math.floor(Math.random() * 4);
        const selectedComments = [];
        
        for (let i = 0; i < commentCount; i++) {
            const randomComment = reactionPool[Math.floor(Math.random() * reactionPool.length)];
            const randomUser = this.generateRandomUsername();
            selectedComments.push({
                user: randomUser,
                comment: randomComment,
                time: this.generateRandomTime()
            });
        }
        
        return selectedComments;
    }

    generateRandomUsername() {
        const usernames = [
            "축구광", "골머신", "스타디움히어로", "축신모드", "펨코러버", "축구는인생",
            "골든부트", "미드필더", "스트라이커", "골키퍼", "축구천재", "볼터치", "패스마스터"
        ];
        
        const base = usernames[Math.floor(Math.random() * usernames.length)];
        const numbers = Math.floor(Math.random() * 99) + 1;
        const formats = [`${base}${numbers}`, `${base}_${numbers}`, `${base}킹`];
        
        return formats[Math.floor(Math.random() * formats.length)];
    }

    generateRandomTime() {
        const minutes = Math.floor(Math.random() * 120) + 1;
        return minutes < 60 ? `${minutes}분 전` : `${Math.floor(minutes / 60)}시간 전`;
    }

    updateFollowers(postType) {
        const changes = {
            bigWin: 10 + Math.floor(Math.random() * 20),
            normalWin: 3 + Math.floor(Math.random() * 8),
            bigLoss: -(5 + Math.floor(Math.random() * 15)),
            narrowLoss: -(1 + Math.floor(Math.random() * 5))
        };
        
        const change = changes[postType] || 0;
        this.followers = Math.max(100, this.followers + change);
    }

    // ===========================================
    // UI 업데이트
    // ===========================================

    updateSocialDisplay() {
        // 팔로워 수 업데이트
        const followerElement = document.getElementById('followerCount');
        if (followerElement) {
            followerElement.textContent = this.followers.toLocaleString();
        }
        
        // 포스트 수 업데이트
        const postCountElement = document.getElementById('postCount');
        if (postCountElement) {
            postCountElement.textContent = this.posts.length;
        }
        
        // 피드 업데이트
        const feedElement = document.getElementById('socialFeed');
        if (feedElement) {
            this.updateFeed(feedElement);
        }
        
        // 트렌딩 토픽 업데이트
        this.updateTrendingTopics();
    }

    updateFeed(feedElement) {
        feedElement.innerHTML = '';
        
        const recentPosts = this.posts.slice(0, 15); // 최근 15개 포스트
        
        if (recentPosts.length === 0) {
            feedElement.innerHTML = `
                <div class="no-posts">
                    <p>아직 게시물이 없습니다.</p>
                    <p>경기를 시작하면 자동으로 포스트가 생성됩니다!</p>
                </div>`;
            return;
        }
        
        recentPosts.forEach(post => {
            const postElement = this.createPostElement(post);
            feedElement.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const postCard = document.createElement('div');
        postCard.className = `post-card ${post.type}`;
        
        if (post.trending) {
            postCard.classList.add('trending');
        }
        
        const timeAgo = this.getTimeAgo(post.timestamp);
        const teamName = window.gameManager?.gameState?.selectedTeam ? 
            window.teamNames[window.gameManager.gameState.selectedTeam] : 'MyTeam';
        
        postCard.innerHTML = `
            <div class="post-header">
                <div class="team-profile">
                    <div class="team-avatar">⚽</div>
                    <div class="team-info">
                        <div class="team-name">${teamName}</div>
                        <div class="post-time">${timeAgo}</div>
                    </div>
                </div>
                ${post.trending ? '<div class="trending-badge">🔥 트렌딩</div>' : ''}
            </div>
            
            <div class="post-content">
                <p>${post.content}</p>
            </div>
            
            <div class="post-actions">
                <button class="like-btn">❤️ ${post.likes.toLocaleString()}</button>
                <button class="comment-btn">💬 ${post.comments.length}</button>
                <button class="share-btn">📤 ${Math.floor(post.likes / 10)}</button>
            </div>
            
            <div class="post-comments">
                ${post.comments.slice(0, 3).map(comment => `
                    <div class="comment">
                        <strong>${comment.user}:</strong> ${comment.comment}
                        <span class="comment-time">${comment.time}</span>
                    </div>
                `).join('')}
                ${post.comments.length > 3 ? `<div class="more-comments">댓글 ${post.comments.length - 3}개 더 보기</div>` : ''}
            </div>
        `;
        
        return postCard;
    }

    updateTrendingTopics() {
        const trendingElement = document.getElementById('trendingTopics');
        if (!trendingElement) return;
        
        const trending = Array.from(this.trendingTopics.entries())
            .sort((a, b) => b[1].impact - a[1].impact)
            .slice(0, 5);
        
        if (trending.length === 0) {
            trendingElement.innerHTML = '<p>현재 트렌딩 토픽이 없습니다.</p>';
            return;
        }
        
        trendingElement.innerHTML = trending.map(([topic, data], index) => 
            `<div class="trending-item">
                <span class="trending-rank">${index + 1}</span>
                <span class="trending-topic">${topic}</span>
                <span class="trending-mentions">${data.mentions} 언급</span>
            </div>`
        ).join('');
    }

    getTimeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days > 0) return `${days}일 전`;
        if (hours > 0) return `${hours}시간 전`;
        if (minutes > 0) return `${minutes}분 전`;
        return '방금 전';
    }

    // ===========================================
    // 저장/로드
    // ===========================================

    getSaveData() {
        return {
            posts: this.posts.slice(0, 50), // 최근 50개만 저장
            followers: this.followers,
            transferWatchers: Array.from(this.transferWatchers),
            trendingTopics: Array.from(this.trendingTopics.entries())
        };
    }

    loadSaveData(data) {
        if (data) {
            this.posts = data.posts || [];
            this.followers = data.followers || 1200;
            this.transferWatchers = new Set(data.transferWatchers || []);
            this.trendingTopics = new Map(data.trendingTopics || []);
        }
    }

    loadSavedData() {
        const saved = localStorage.getItem('enhancedSNS_data');
        if (saved) {
            try {
                this.loadSaveData(JSON.parse(saved));
            } catch (error) {
                console.error('SNS 데이터 로드 오류:', error);
            }
        }
    }

    cleanup() {
        if (this.aiTransferInterval) {
            clearInterval(this.aiTransferInterval);
        }
        
        // 데이터 저장
        try {
            localStorage.setItem('enhancedSNS_data', JSON.stringify(this.getSaveData()));
        } catch (error) {
            console.error('SNS 데이터 저장 오류:', error);
        }
    }
}

// 전역 인스턴스 생성 (기존 시스템과 호환)
if (!window.socialMediaSystem) {
    window.socialMediaSystem = new EnhancedSocialMediaSystem();
}

// 기존 시스템 대체
window.EnhancedSocialMediaSystem = EnhancedSocialMediaSystem;