import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Character } from '../types/character';
import { GamePhase, GameState, Player } from '../services/gameService';

interface GameSliceState {
    currentGame: GameState | null;
    selectedCharacter: Character | null;
    loading: boolean;
    error: string | null;
}

const initialState: GameSliceState = {
    currentGame: null,
    selectedCharacter: null,
    loading: false,
    error: null,
};

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setCurrentGame: (state, action: PayloadAction<GameState>) => {
            state.currentGame = action.payload;
            state.error = null;
        },
        setSelectedCharacter: (state, action: PayloadAction<Character>) => {
            state.selectedCharacter = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearGame: (state) => {
            state.currentGame = null;
            state.selectedCharacter = null;
            state.error = null;
        },
        updateGameState: (state, action: PayloadAction<Partial<GameState>>) => {
            if (state.currentGame) {
                state.currentGame = { ...state.currentGame, ...action.payload };
            }
        },
        updatePlayer: (state, action: PayloadAction<Player>) => {
            if (state.currentGame) {
                const playerIndex = state.currentGame.players.findIndex(
                    p => p.uid === action.payload.uid
                );
                if (playerIndex !== -1) {
                    state.currentGame.players[playerIndex] = action.payload;
                }
            }
        },
    },
});

export const {
    setCurrentGame,
    setSelectedCharacter,
    setLoading,
    setError,
    clearGame,
    updateGameState,
    updatePlayer,
} = gameSlice.actions;

export default gameSlice.reducer; 