import firestore from '@react-native-firebase/firestore';
import { authService } from './authService';

export interface GameState {
    id: string;
    players: Player[];
    status: 'waiting' | 'playing' | 'finished';
    currentTurn: string;
    lastUpdated: number;
    winner?: string;
}

export interface Player {
    uid: string;
    displayName: string | null;
    isReady: boolean;
    score: number;
}

class GameStateService {
    private gamesCollection = firestore().collection('games');

    // Create a new game
    async createGame(): Promise<string> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        const newGame: Omit<GameState, 'id'> = {
            players: [{
                uid: currentUser.uid,
                displayName: currentUser.displayName,
                isReady: false,
                score: 0
            }],
            status: 'waiting',
            currentTurn: currentUser.uid,
            lastUpdated: Date.now()
        };

        const gameRef = await this.gamesCollection.add(newGame);
        return gameRef.id;
    }

    // Join an existing game
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
                isReady: false,
                score: 0
            }],
            lastUpdated: Date.now()
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
            lastUpdated: Date.now()
        });
    }

    // Update game state
    async updateGameState(gameId: string, updates: Partial<GameState>): Promise<void> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        const gameRef = this.gamesCollection.doc(gameId);
        await gameRef.update({
            ...updates,
            lastUpdated: Date.now()
        });
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
            // If no players left, delete the game
            await gameRef.delete();
        } else {
            // Update the game with remaining players
            await gameRef.update({
                players: updatedPlayers,
                currentTurn: updatedPlayers[0].uid,
                lastUpdated: Date.now()
            });
        }
    }

    // Find available games
    async findAvailableGames(): Promise<GameState[]> {
        const snapshot = await this.gamesCollection
            .where('status', '==', 'waiting')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as GameState));
    }
}

export const gameStateService = new GameStateService(); 