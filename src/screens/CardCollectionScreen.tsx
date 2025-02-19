import React from 'react';
import { Text, StyleSheet, View, FlatList, Image, TouchableOpacity } from 'react-native';
import { ScreenTemplate } from '../components/ScreenTemplate';

interface Card {
    id: string;
    name: string;
    role: string;
    image: any; // Replace with actual image paths
    unlocked: boolean;
}

const dummyCards: Card[] = [
    {
        id: '1',
        name: 'Don',
        role: 'Mafia',
        image: null,
        unlocked: true,
    },
    {
        id: '2',
        name: 'Detective',
        role: 'Citizen',
        image: null,
        unlocked: true,
    },
    {
        id: '3',
        name: 'Doctor',
        role: 'Citizen',
        image: null,
        unlocked: false,
    },
    // Add more cards as needed
];

export const CardCollectionScreen = () => {
    const renderCard = ({ item }: { item: Card }) => (
        <TouchableOpacity
            style={[styles.card, !item.unlocked && styles.cardLocked]}
            disabled={!item.unlocked}
        >
            <View style={styles.cardContent}>
                {item.image ? (
                    <Image source={item.image} style={styles.cardImage} />
                ) : (
                    <View style={styles.cardImagePlaceholder} />
                )}
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardRole}>{item.role}</Text>
            </View>
            {!item.unlocked && (
                <View style={styles.lockedOverlay}>
                    <Text style={styles.lockedText}>Locked</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <ScreenTemplate>
            <View style={styles.container}>
                <Text style={styles.title}>Card Collection</Text>
                <Text style={styles.subtitle}>Unlock new characters as you play!</Text>

                <FlatList
                    data={dummyCards}
                    renderItem={renderCard}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.cardRow}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </ScreenTemplate>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        color: '#999',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    cardRow: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    card: {
        width: '48%',
        aspectRatio: 0.7,
        backgroundColor: '#2C2F33',
        borderRadius: 12,
        overflow: 'hidden',
    },
    cardLocked: {
        opacity: 0.7,
    },
    cardContent: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
    },
    cardImage: {
        width: '100%',
        height: '70%',
        borderRadius: 8,
    },
    cardImagePlaceholder: {
        width: '100%',
        height: '70%',
        backgroundColor: '#1E2124',
        borderRadius: 8,
    },
    cardName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
    },
    cardRole: {
        color: '#999',
        fontSize: 14,
    },
    lockedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockedText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}); 