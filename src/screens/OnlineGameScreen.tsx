import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, FlatList, Alert } from 'react-native';
import { ScreenTemplate } from '../components/ScreenTemplate';
import { gameService, GameState } from '../services/gameService';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type OnlineGameNavigationProp = StackNavigationProp<RootStackParamList, 'OnlineGame'>;

interface GameItemProps {
    game: GameState;
    onJoin: () => void;
}

const GameItem: React.FC<GameItemProps> = ({ game, onJoin }) => (
    <View style={styles.gameItem}>
        <View style={styles.gameInfo}>
            <Text style={styles.gameId}>Game #{game.id.slice(-6)}</Text>
            <Text style={styles.playerCount}>
                Players: {game.players.length}/4
            </Text>
        </View>
        <TouchableOpacity
            style={[styles.joinButton, game.players.length >= 4 && styles.joinButtonDisabled]}
            onPress={onJoin}
            disabled={game.players.length >= 4}
        >
            <Text style={styles.joinButtonText}>
                {game.players.length >= 4 ? 'Full' : 'Join'}
            </Text>
        </TouchableOpacity>
    </View>
);

export const OnlineGameScreen = () => {
    const navigation = useNavigation<OnlineGameNavigationProp>();
    const [games, setGames] = useState<GameState[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = gameService.gamesCollection
            .where('status', '==', 'waiting')
            .onSnapshot((snapshot) => {
                const gamesList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as GameState));
                setGames(gamesList);
            });

        return () => unsubscribe();
    }, []);

    const handleCreateGame = async () => {
        try {
            setIsLoading(true);
            const gameId = await gameService.createGame();
            navigation.navigate('CharacterSelect', { gameId });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinGame = async (gameId: string) => {
        try {
            setIsLoading(true);
            await gameService.joinGame(gameId);
            navigation.navigate('CharacterSelect', { gameId });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenTemplate>
            <View style={styles.container}>
                <TouchableOpacity
                    style={[styles.createButton, isLoading && styles.buttonDisabled]}
                    onPress={handleCreateGame}
                    disabled={isLoading}
                >
                    <Icon name="plus" size={24} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Create New Game</Text>
                </TouchableOpacity>

                <View style={styles.listContainer}>
                    <Text style={styles.title}>Available Games</Text>
                    {games.length > 0 ? (
                        <FlatList
                            data={games}
                            renderItem={({ item }) => (
                                <GameItem
                                    game={item}
                                    onJoin={() => handleJoinGame(item.id)}
                                />
                            )}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.listContent}
                        />
                    ) : (
                        <Text style={styles.emptyText}>No active games found</Text>
                    )}
                </View>
            </View>
        </ScreenTemplate>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 24,
    },
    createButton: {
        backgroundColor: '#6C63FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    listContainer: {
        flex: 1,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    listContent: {
        gap: 12,
    },
    gameItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2F33',
        padding: 16,
        borderRadius: 12,
    },
    gameInfo: {
        flex: 1,
    },
    gameId: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    playerCount: {
        color: '#999',
        fontSize: 14,
        marginTop: 4,
    },
    joinButton: {
        backgroundColor: '#6C63FF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    joinButtonDisabled: {
        backgroundColor: '#666',
    },
    joinButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
    },
}); 