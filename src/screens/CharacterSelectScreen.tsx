import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
    TextInput,
    FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { characters } from '../data/characters';
import { Character } from '../types/character';
import { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <View style={styles.statContainer}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statBarBackground}>
            <View style={[styles.statBarFill, { width: `${value}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);

const DifficultyBadge: React.FC<{ difficulty: number }> = ({ difficulty }) => {
    const getBadgeColor = (diff: number) => {
        switch (diff) {
            case 1: return '#4CAF50';
            case 2: return '#FFC107';
            case 3: return '#F44336';
            default: return '#9E9E9E';
        }
    };

    return (
        <View style={[styles.difficultyBadge, { backgroundColor: getBadgeColor(difficulty) }]}>
            <Text style={styles.difficultyText}>
                {difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : 'Hard'}
            </Text>
        </View>
    );
};

type CharacterSelectScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CharacterSelect'>;
type CharacterSelectScreenRouteProp = RouteProp<RootStackParamList, 'CharacterSelect'>;

type FilterType = 'all' | 'mafia' | 'neutral' | 'fbi';
type SortType = 'name' | 'difficulty' | 'attack' | 'defense' | 'speed';

const CharacterSelectScreen: React.FC = () => {
    const navigation = useNavigation<CharacterSelectScreenNavigationProp>();
    const route = useRoute<CharacterSelectScreenRouteProp>();
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortType>('name');
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const gameId = route.params.gameId;

    const filteredCharacters = characters
        .filter(char => {
            const matchesFilter = activeFilter === 'all' || char.faction === activeFilter;
            const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                char.role.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'difficulty':
                    return a.difficulty - b.difficulty;
                case 'attack':
                    return b.stats.attack - a.stats.attack;
                case 'defense':
                    return b.stats.defense - a.stats.defense;
                case 'speed':
                    return b.stats.speed - a.stats.speed;
                default:
                    return 0;
            }
        });

    const handleConfirm = () => {
        if (selectedCharacter) {
            navigation.navigate('Game', {
                gameId,
                characterId: selectedCharacter.id,
            });
        }
    };

    const FilterButton: React.FC<{ filter: FilterType; label: string }> = ({ filter, label }) => (
        <TouchableOpacity
            style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}
            onPress={() => setActiveFilter(filter)}
        >
            <Text style={[styles.filterButtonText, activeFilter === filter && styles.filterButtonTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const SortButton: React.FC<{ sort: SortType; label: string }> = ({ sort, label }) => (
        <TouchableOpacity
            style={[styles.sortButton, sortBy === sort && styles.sortButtonActive]}
            onPress={() => setSortBy(sort)}
        >
            <Text style={[styles.sortButtonText, sortBy === sort && styles.sortButtonTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const handleScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / (CARD_WIDTH + 20));
        setCurrentIndex(index);
    };

    const renderCharacterCard = (character: Character) => {
        const isSelected = selectedCharacter?.id === character.id;

        return (
            <TouchableOpacity
                key={character.id}
                onPress={() => setSelectedCharacter(character)}
                style={[styles.cardContainer, isSelected && styles.selectedCard]}
            >
                <LinearGradient
                    colors={['#2C3E50', '#34495E']}
                    style={styles.cardGradient}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.characterName}>{character.name}</Text>
                        <DifficultyBadge difficulty={character.difficulty} />
                    </View>

                    <View style={styles.imageContainer}>
                        <Image source={character.image} style={styles.characterImage} />
                        <View style={styles.roleContainer}>
                            <Text style={styles.roleText}>{character.role}</Text>
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        <StatBar label="Attack" value={character.stats.attack} color="#F44336" />
                        <StatBar label="Defense" value={character.stats.defense} color="#4CAF50" />
                        <StatBar label="Speed" value={character.stats.speed} color="#2196F3" />
                    </View>

                    <View style={styles.abilityContainer}>
                        <Text style={styles.abilityTitle}>Special Ability</Text>
                        <Text style={styles.abilityText}>{character.specialAbility}</Text>
                        <View style={styles.abilityMetaContainer}>
                            <Text style={styles.abilityMetaText}>
                                {character.abilityType.charAt(0).toUpperCase() + character.abilityType.slice(1)}
                            </Text>
                            <Text style={styles.abilityMetaText}>•</Text>
                            <Text style={styles.abilityMetaText}>
                                {character.abilityUses.split('_').map(word =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.backgroundText}>{character.background}</Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Your Character</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={24} color="#666" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search characters..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="close" size={24} color="#666" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
                <FilterButton filter="all" label="All" />
                <FilterButton filter="mafia" label="Mafia" />
                <FilterButton filter="neutral" label="Neutral" />
                <FilterButton filter="fbi" label="FBI" />
            </ScrollView>

            {/* Sort Options */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortContainer}>
                <SortButton sort="name" label="Name" />
                <SortButton sort="difficulty" label="Difficulty" />
                <SortButton sort="attack" label="Attack" />
                <SortButton sort="defense" label="Defense" />
                <SortButton sort="speed" label="Speed" />
            </ScrollView>

            {/* Character Cards */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {filteredCharacters.map(renderCharacterCard)}
            </ScrollView>

            {/* Pagination Indicators */}
            <View style={styles.paginationContainer}>
                {filteredCharacters.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            currentIndex === index && styles.paginationDotActive
                        ]}
                    />
                ))}
            </View>

            <TouchableOpacity
                style={[styles.confirmButton, !selectedCharacter && styles.disabledButton]}
                onPress={handleConfirm}
                disabled={!selectedCharacter}
            >
                <Text style={styles.confirmButtonText}>
                    {selectedCharacter ? `Confirm ${selectedCharacter.name}` : 'Select a Character'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        alignItems: 'center',
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 20,
    },
    scrollView: {
        flexGrow: 0,
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginHorizontal: 10,
        borderRadius: 15,
        overflow: 'hidden',
    },
    selectedCard: {
        borderWidth: 3,
        borderColor: '#FFD700',
    },
    cardGradient: {
        flex: 1,
        padding: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    characterName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    difficultyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    difficultyText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    imageContainer: {
        height: CARD_HEIGHT * 0.3,
        marginBottom: 10,
        position: 'relative',
    },
    characterImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    roleContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 5,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    roleText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statsContainer: {
        marginBottom: 10,
    },
    statContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    statLabel: {
        color: '#FFFFFF',
        width: 60,
        fontSize: 12,
    },
    statBarBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#4444',
        borderRadius: 4,
        marginHorizontal: 10,
    },
    statBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    statValue: {
        color: '#FFFFFF',
        width: 30,
        fontSize: 12,
        textAlign: 'right',
    },
    abilityContainer: {
        marginBottom: 10,
    },
    abilityTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    abilityText: {
        color: '#FFFFFF',
        fontSize: 14,
        marginBottom: 5,
    },
    abilityMetaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    abilityMetaText: {
        color: '#AAAAAA',
        fontSize: 12,
        marginRight: 5,
    },
    backgroundText: {
        color: '#CCCCCC',
        fontSize: 12,
        fontStyle: 'italic',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        marginVertical: 20,
    },
    disabledButton: {
        backgroundColor: '#666666',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2F33',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        marginLeft: 8,
        marginRight: 8,
    },
    filtersContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#2C2F33',
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: '#6C63FF',
    },
    filterButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    filterButtonTextActive: {
        fontWeight: 'bold',
    },
    sortContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sortButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#2C2F33',
        marginRight: 8,
    },
    sortButtonActive: {
        backgroundColor: '#4CAF50',
    },
    sortButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
    },
    sortButtonTextActive: {
        fontWeight: 'bold',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2C2F33',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#6C63FF',
        width: 16,
    },
});

export default CharacterSelectScreen; 