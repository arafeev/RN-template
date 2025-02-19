import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { authService } from './authService';

export enum GameError {
    NOT_AUTHENTICATED = 'User must be authenticated',
    GAME_NOT_FOUND = 'Game not found',
    GAME_IN_PROGRESS = 'Game already in progress',
    GAME_FULL = 'Game is full',
    ALREADY_IN_GAME = 'Already in this game',
    NOT_YOUR_TURN = 'Not your turn',
    INVALID_ACTION = 'Invalid action',
    PLAYER_NOT_FOUND = 'Player not found',
    TARGET_NOT_FOUND = 'Target player not found',
    INSUFFICIENT_PLAYERS = 'Not enough players to start the game',
}

export enum GamePhase {
    WAITING = 'waiting',
    NIGHT = 'night',
    DAY = 'day',
    VOTING = 'voting',
    FINISHED = 'finished',
}

export enum GameRole {
    MAFIA = 'mafia',
    CITIZEN = 'citizen',
    DOCTOR = 'doctor',
    DETECTIVE = 'detective',
}

export interface Player {
    uid: string;
    displayName: string | null;
    cards: string[];
    role: 'mafia' | 'citizen' | 'doctor' | 'detective' | null;
    isReady: boolean;
    position: number; // 0-3, clockwise from bottom
}

export interface GameState {
    id: string;
    players: Player[];
    status: GamePhase;
    currentTurn: string | null;
    phase: GamePhase | null;
    round: number;
    actionCards: string[];
    equipmentCards: string[];
    lastUpdated: number;
    winner?: 'mafia' | 'citizens';
    votingResults?: { [key: string]: string[] }; // playerId: [voterIds]
    nightActions?: {
        mafiaTarget?: string;
        doctorTarget?: string;
        detectiveTarget?: string;
    };
}

class GameService {
    readonly gamesCollection = firestore().collection('games');

    // Create a new game
    async createGame(): Promise<string> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error(GameError.NOT_AUTHENTICATED);

        const newGame: Omit<GameState, 'id'> = {
            players: [{
                uid: currentUser.uid,
                displayName: currentUser.displayName,
                cards: [],
                role: null,
                isReady: false,
                position: 0,
            }],
            status: GamePhase.WAITING,
            currentTurn: null,
            phase: null,
            round: 0,
            actionCards: this.generateActionCards(),
            equipmentCards: this.generateEquipmentCards(),
            lastUpdated: Date.now(),
        };

        const gameRef = await this.gamesCollection.add(newGame);
        return gameRef.id;
    }

    // Join a game
    async joinGame(gameId: string): Promise<void> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        const gameRef = this.gamesCollection.doc(gameId);
        const gameDoc = await gameRef.get();

        if (!gameDoc.exists) throw new Error('Game not found');

        const gameData = gameDoc.data() as GameState;
        if (gameData.status !== 'waiting') throw new Error('Game already in progress');
        if (gameData.players.length >= 4) throw new Error('Game is full');
        if (gameData.players.some(p => p.uid === currentUser.uid)) {
            throw new Error('Already in this game');
        }

        await gameRef.update({
            players: [...gameData.players, {
                uid: currentUser.uid,
                displayName: currentUser.displayName,
                cards: [],
                role: null,
                isReady: false,
                position: gameData.players.length,
            }],
            lastUpdated: Date.now(),
        });
    }

    // Set player ready status
    async setPlayerReady(gameId: string, ready: boolean): Promise<void> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        const gameRef = this.gamesCollection.doc(gameId);
        const gameDoc = await gameRef.get();

        if (!gameDoc.exists) throw new Error('Game not found');

        const gameData = gameDoc.data() as GameState;
        const updatedPlayers = gameData.players.map(player =>
            player.uid === currentUser.uid
                ? { ...player, isReady: ready }
                : player
        );

        await gameRef.update({
            players: updatedPlayers,
            lastUpdated: Date.now(),
        });

        // Check if all players are ready to start the game
        if (updatedPlayers.length >= 4 && updatedPlayers.every(p => p.isReady)) {
            await this.startGame(gameId);
        }
    }

    // Start the game
    private async startGame(gameId: string): Promise<void> {
        const gameRef = this.gamesCollection.doc(gameId);
        const gameDoc = await gameRef.get();
        const gameData = gameDoc.data() as GameState;

        // Assign roles randomly
        const roles: Player['role'][] = ['mafia', 'detective', 'doctor', 'citizen'];
        const shuffledRoles = this.shuffleArray([...roles]);

        const playersWithRoles = gameData.players.map((player, index) => ({
            ...player,
            role: shuffledRoles[index],
            cards: this.dealInitialCards(),
        }));

        await gameRef.update({
            players: playersWithRoles,
            status: 'playing',
            phase: 'night',
            round: 1,
            currentTurn: playersWithRoles.find(p => p.role === 'mafia')?.uid || null,
            lastUpdated: Date.now(),
        });
    }

    // Play a card
    async playCard(gameId: string, cardId: string, targetPlayerId?: string): Promise<void> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        const gameRef = this.gamesCollection.doc(gameId);
        const gameDoc = await gameRef.get();
        if (!gameDoc.exists) throw new Error('Game not found');

        const gameData = gameDoc.data() as GameState;
        const currentPlayer = gameData.players.find(p => p.uid === currentUser.uid);
        const targetPlayer = targetPlayerId
            ? gameData.players.find(p => p.uid === targetPlayerId) || undefined
            : undefined;

        if (!currentPlayer) throw new Error('Player not found');
        if (targetPlayerId && !targetPlayer) throw new Error('Target player not found');
        if (gameData.currentTurn !== currentUser.uid) throw new Error('Not your turn');

        // Handle card effects based on the player's role and the card type
        await this.handleCardEffect(gameRef, gameData, currentPlayer, cardId, targetPlayer);
    }

    // Subscribe to game state changes
    onGameStateChanged(gameId: string, callback: (gameState: GameState) => void) {
        return this.gamesCollection.doc(gameId).onSnapshot((doc) => {
            if (doc.exists) {
                const gameState = { id: doc.id, ...doc.data() } as GameState;
                callback(gameState);
            }
        });
    }

    // Leave game
    async leaveGame(gameId: string): Promise<void> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        const gameRef = this.gamesCollection.doc(gameId);
        const gameDoc = await gameRef.get();

        if (!gameDoc.exists) throw new Error('Game not found');

        const gameData = gameDoc.data() as GameState;
        const updatedPlayers = gameData.players.filter(p => p.uid !== currentUser.uid);

        if (updatedPlayers.length === 0) {
            await gameRef.delete();
        } else {
            await gameRef.update({
                players: updatedPlayers,
                status: gameData.status === 'playing' ? 'finished' : gameData.status,
                lastUpdated: Date.now(),
            });
        }
    }

    private generateActionCards(): string[] {
        // Generate a deck of action cards
        return [
            'investigate',
            'protect',
            'eliminate',
            'vote',
            // Add more action cards as needed
        ];
    }

    private generateEquipmentCards(): string[] {
        // Generate a deck of equipment cards
        return [
            'shield',
            'weapon',
            'potion',
            // Add more equipment cards as needed
        ];
    }

    private dealInitialCards(): string[] {
        // Deal initial cards to a player
        return this.shuffleArray(this.generateActionCards()).slice(0, 3);
    }

    private async handleCardEffect(
        gameRef: FirebaseFirestoreTypes.DocumentReference,
        gameState: GameState,
        currentPlayer: Player,
        cardId: string,
        targetPlayer: Player | undefined
    ): Promise<void> {
        // Implement card effects based on the card type and player roles
        // This is where you'll add the game logic for different cards

        // Example:
        switch (cardId) {
            case 'investigate':
                if (currentPlayer.role !== 'detective') throw new Error('Only the detective can investigate');
                if (!targetPlayer) throw new Error('Must select a target player');
                // Reveal target player's role to the detective
                break;

            case 'protect':
                if (currentPlayer.role !== 'doctor') throw new Error('Only the doctor can protect');
                if (!targetPlayer) throw new Error('Must select a target player');
                // Protect the target player
                break;

            case 'eliminate':
                if (currentPlayer.role !== 'mafia') throw new Error('Only the mafia can eliminate');
                if (!targetPlayer) throw new Error('Must select a target player');
                // Attempt to eliminate the target player
                break;

            // Add more card effects
        }

        // Update game state after card effect
        await this.updateGameStateAfterCard(gameRef, gameState, currentPlayer, cardId);
    }

    private async updateGameStateAfterCard(
        gameRef: FirebaseFirestoreTypes.DocumentReference,
        gameState: GameState,
        currentPlayer: Player,
        cardId: string
    ): Promise<void> {
        // Remove the played card from the player's hand
        const updatedPlayers = gameState.players.map(player =>
            player.uid === currentPlayer.uid
                ? { ...player, cards: player.cards.filter(c => c !== cardId) }
                : player
        );

        // Determine next player's turn
        const currentPlayerIndex = gameState.players.findIndex(p => p.uid === currentPlayer.uid);
        const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
        const nextPlayer = gameState.players[nextPlayerIndex];

        // Update game state
        await gameRef.update({
            players: updatedPlayers,
            currentTurn: nextPlayer.uid,
            lastUpdated: Date.now(),
        });
    }

    private shuffleArray<T>(array: T[]): T[] {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    private validateGameState(gameState: GameState): void {
        if (gameState.players.length < 4) {
            throw new Error(GameError.INSUFFICIENT_PLAYERS);
        }

        const roles = gameState.players.map(p => p.role);
        const hasMafia = roles.includes(GameRole.MAFIA);
        const hasDoctor = roles.includes(GameRole.DOCTOR);
        const hasDetective = roles.includes(GameRole.DETECTIVE);

        if (!hasMafia || !hasDoctor || !hasDetective) {
            throw new Error('Invalid role distribution');
        }
    }

    private async updateGamePhase(gameRef: FirebaseFirestoreTypes.DocumentReference, gameState: GameState): Promise<void> {
        const batch = firestore().batch();

        switch (gameState.phase) {
            case GamePhase.NIGHT:
                if (this.isNightActionsComplete(gameState)) {
                    // Process night actions
                    const { mafiaTarget, doctorTarget } = gameState.nightActions || {};
                    if (mafiaTarget && mafiaTarget !== doctorTarget) {
                        // Eliminate player if not protected by doctor
                        const updatedPlayers = gameState.players.filter(p => p.uid !== mafiaTarget);
                        batch.update(gameRef, {
                            players: updatedPlayers,
                            phase: GamePhase.DAY,
                            nightActions: firestore.FieldValue.delete(),
                        });
                    }
                }
                break;

            case GamePhase.DAY:
                // Move to voting phase after day discussion
                batch.update(gameRef, {
                    phase: GamePhase.VOTING,
                    votingResults: {},
                });
                break;

            case GamePhase.VOTING:
                if (this.isVotingComplete(gameState)) {
                    // Process voting results
                    const eliminatedPlayer = this.getVotingResult(gameState);
                    if (eliminatedPlayer) {
                        const updatedPlayers = gameState.players.filter(p => p.uid !== eliminatedPlayer);
                        batch.update(gameRef, {
                            players: updatedPlayers,
                            phase: GamePhase.NIGHT,
                            round: gameState.round + 1,
                            votingResults: firestore.FieldValue.delete(),
                        });
                    }
                }
                break;
        }

        // Check win conditions
        const winner = this.checkWinCondition(gameState);
        if (winner) {
            batch.update(gameRef, {
                status: GamePhase.FINISHED,
                winner,
            });
        }

        await batch.commit();
    }

    private isNightActionsComplete(gameState: GameState): boolean {
        const { nightActions } = gameState;
        if (!nightActions) return false;

        const mafiaPlayer = gameState.players.find(p => p.role === GameRole.MAFIA);
        const doctorPlayer = gameState.players.find(p => p.role === GameRole.DOCTOR);
        const detectivePlayer = gameState.players.find(p => p.role === GameRole.DETECTIVE);

        return Boolean(
            mafiaPlayer && nightActions.mafiaTarget &&
            doctorPlayer && nightActions.doctorTarget &&
            detectivePlayer && nightActions.detectiveTarget
        );
    }

    private isVotingComplete(gameState: GameState): boolean {
        const { votingResults } = gameState;
        if (!votingResults) return false;

        const totalVotes = Object.values(votingResults).flat().length;
        return totalVotes === gameState.players.length;
    }

    private getVotingResult(gameState: GameState): string | null {
        const { votingResults } = gameState;
        if (!votingResults) return null;

        const voteCounts: { [key: string]: number } = {};
        Object.values(votingResults).flat().forEach(votedId => {
            voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
        });

        const maxVotes = Math.max(...Object.values(voteCounts));
        const eliminated = Object.entries(voteCounts)
            .filter(([_, count]) => count === maxVotes)
            .map(([id]) => id);

        return eliminated.length === 1 ? eliminated[0] : null;
    }

    private checkWinCondition(gameState: GameState): 'mafia' | 'citizens' | null {
        const mafiaCount = gameState.players.filter(p => p.role === GameRole.MAFIA).length;
        const citizenCount = gameState.players.filter(p => p.role !== GameRole.MAFIA).length;

        if (mafiaCount === 0) return 'citizens';
        if (mafiaCount >= citizenCount) return 'mafia';
        return null;
    }
}

export const gameService = new GameService(); 