import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { ScreenTemplate } from '../components/ScreenTemplate';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { gameService, GameState, Player } from '../services/gameService';
import { RouteProp, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { authService } from '../services/authService';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;

interface PlayerViewProps {
    name: string;
    position: 'top' | 'left' | 'right';
    cards: number;
    isCurrentTurn: boolean;
    onSelect?: () => void;
}

const PlayerView: React.FC<PlayerViewProps> = ({
    name,
    position,
    cards,
    isCurrentTurn,
    onSelect
}) => {
    const containerStyle = [
        styles.playerContainer,
        position === 'top' ? styles.topPlayer :
            position === 'left' ? styles.leftPlayer :
                styles.rightPlayer,
        isCurrentTurn && styles.currentTurnPlayer
    ];

    const cardsContainerStyle = [
        styles.cardsContainer,
        position === 'top' ? styles.topCards :
            position === 'left' ? styles.leftCards :
                styles.rightCards
    ];

    return (
        <TouchableOpacity
            style={containerStyle}
            onPress={onSelect}
            disabled={!onSelect}
        >
            <View style={styles.playerInfo}>
                <Icon name="account-circle" size={40} color="#FFFFFF" />
                <Text style={styles.playerName}>{name}</Text>
            </View>
            <View style={cardsContainerStyle}>
                {Array(cards).fill(0).map((_, index) => (
                    <View key={index} style={styles.cardPlaceholder} />
                ))}
            </View>
        </TouchableOpacity>
    );
};

interface ActionCardProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, onPress, disabled }) => (
    <TouchableOpacity
        style={[styles.actionCard, disabled && styles.actionCardDisabled]}
        onPress={onPress}
        disabled={disabled}
    >
        <Text style={styles.actionCardText}>{title}</Text>
    </TouchableOpacity>
);

export const GameScreen = () => {
    const route = useRoute<GameScreenRouteProp>();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        if (!route.params?.gameId) return;

        const unsubscribe = gameService.onGameStateChanged(
            route.params.gameId,
            (state) => setGameState(state)
        );

        return () => unsubscribe();
    }, [route.params?.gameId]);

    const handlePlayerSelect = (playerId: string) => {
        setSelectedPlayer(playerId);
    };

    const handleActionCardPress = async (actionIndex: number) => {
        if (!gameState || !currentUser) return;

        if (gameState.currentTurn !== currentUser.uid) {
            Alert.alert('Not your turn', 'Please wait for your turn');
            return;
        }

        if (!selectedPlayer) {
            Alert.alert('Select a player', 'Please select a target player first');
            return;
        }

        try {
            await gameService.playCard(gameState.id, `action_${actionIndex}`, selectedPlayer);
            setSelectedPlayer(null);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    if (!gameState || !currentUser) {
        return (
            <ScreenTemplate>
                <Text style={styles.loadingText}>Loading game...</Text>
            </ScreenTemplate>
        );
    }

    const currentPlayer = gameState.players.find(p => p.uid === currentUser.uid);
    const playerPosition = currentPlayer?.position || 0;

    // Arrange players based on current player's position
    const getPlayerAtPosition = (relativePos: number): Player | undefined => {
        const targetPos = (playerPosition + relativePos) % gameState.players.length;
        return gameState.players.find(p => p.position === targetPos);
    };

    const topPlayer = getPlayerAtPosition(2);
    const leftPlayer = getPlayerAtPosition(1);
    const rightPlayer = getPlayerAtPosition(3);

    return (
        <ScreenTemplate>
            <View style={styles.container}>
                {/* Top player */}
                {topPlayer && (
                    <PlayerView
                        name={topPlayer.displayName || `Player ${topPlayer.position + 1}`}
                        position="top"
                        cards={topPlayer.cards.length}
                        isCurrentTurn={gameState.currentTurn === topPlayer.uid}
                        onSelect={() => handlePlayerSelect(topPlayer.uid)}
                    />
                )}

                <View style={styles.middleSection}>
                    {/* Left player */}
                    {leftPlayer && (
                        <PlayerView
                            name={leftPlayer.displayName || `Player ${leftPlayer.position + 1}`}
                            position="left"
                            cards={leftPlayer.cards.length}
                            isCurrentTurn={gameState.currentTurn === leftPlayer.uid}
                            onSelect={() => handlePlayerSelect(leftPlayer.uid)}
                        />
                    )}

                    {/* Center action cards */}
                    <View style={styles.actionCardsContainer}>
                        <View style={styles.actionCardsRow}>
                            <ActionCard
                                title="Action Card 1"
                                onPress={() => handleActionCardPress(0)}
                                disabled={gameState.currentTurn !== currentUser.uid}
                            />
                            <ActionCard
                                title="Action Card 2"
                                onPress={() => handleActionCardPress(1)}
                                disabled={gameState.currentTurn !== currentUser.uid}
                            />
                        </View>
                        <View style={styles.actionCardsRow}>
                            <ActionCard
                                title="Action Card 3"
                                onPress={() => handleActionCardPress(2)}
                                disabled={gameState.currentTurn !== currentUser.uid}
                            />
                            <ActionCard
                                title="Action Card 4"
                                onPress={() => handleActionCardPress(3)}
                                disabled={gameState.currentTurn !== currentUser.uid}
                            />
                        </View>
                    </View>

                    {/* Right player */}
                    {rightPlayer && (
                        <PlayerView
                            name={rightPlayer.displayName || `Player ${rightPlayer.position + 1}`}
                            position="right"
                            cards={rightPlayer.cards.length}
                            isCurrentTurn={gameState.currentTurn === rightPlayer.uid}
                            onSelect={() => handlePlayerSelect(rightPlayer.uid)}
                        />
                    )}
                </View>

                {/* Bottom equipment cards */}
                <View style={styles.equipmentSection}>
                    <View style={styles.equipmentCards}>
                        {gameState.equipmentCards.map((card, index) => (
                            <ActionCard
                                key={index}
                                title={`Equipment ${index + 1}`}
                                onPress={() => { }}
                                disabled={gameState.currentTurn !== currentUser.uid}
                            />
                        ))}
                    </View>
                    <View style={styles.playerCards}>
                        {currentPlayer?.cards.map((_, index) => (
                            <View key={index} style={styles.cardPlaceholder} />
                        ))}
                    </View>
                </View>

                {/* Game status */}
                <View style={styles.statusBar}>
                    <Text style={styles.statusText}>
                        {gameState.phase === 'day' ? '☀️ Day' : '🌙 Night'} - Round {gameState.round}
                    </Text>
                    {gameState.currentTurn === currentUser.uid && (
                        <Text style={styles.turnText}>Your turn!</Text>
                    )}
                </View>
            </View>
        </ScreenTemplate>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    playerContainer: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    currentTurnPlayer: {
        borderColor: '#6C63FF',
    },
    topPlayer: {
        alignSelf: 'center',
    },
    leftPlayer: {
        alignItems: 'flex-start',
    },
    rightPlayer: {
        alignItems: 'flex-end',
    },
    playerInfo: {
        alignItems: 'center',
    },
    playerName: {
        color: '#FFFFFF',
        fontSize: 14,
        marginTop: 4,
    },
    cardsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    topCards: {
        flexDirection: 'row',
    },
    leftCards: {
        flexDirection: 'column',
    },
    rightCards: {
        flexDirection: 'column',
    },
    cardPlaceholder: {
        width: 40,
        height: 60,
        backgroundColor: '#2C2F33',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#666',
    },
    middleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: 20,
    },
    actionCardsContainer: {
        gap: 16,
    },
    actionCardsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    actionCard: {
        width: 100,
        height: 140,
        backgroundColor: '#2C2F33',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#666',
    },
    actionCardDisabled: {
        opacity: 0.5,
    },
    actionCardText: {
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'center',
        padding: 8,
    },
    equipmentSection: {
        alignItems: 'center',
        gap: 16,
    },
    equipmentCards: {
        flexDirection: 'row',
        gap: 16,
    },
    playerCards: {
        flexDirection: 'row',
        gap: 8,
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 18,
        textAlign: 'center',
    },
    statusBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#2C2F33',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    turnText: {
        color: '#6C63FF',
        fontSize: 14,
        fontWeight: 'bold',
    },
}); 