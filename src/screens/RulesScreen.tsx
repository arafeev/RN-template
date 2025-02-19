import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { ScreenTemplate } from '../components/ScreenTemplate';

export const RulesScreen = () => {
    return (
        <ScreenTemplate scrollable>
            <View style={styles.container}>
                <Text style={styles.title}>Game Rules</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <Text style={styles.text}>
                        Mafia is a party game that simulates a conflict between an informed minority (the mafia) and an uninformed majority (the citizens).
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Roles</Text>
                    <Text style={styles.text}>
                        • Citizens - Must find and eliminate the mafia{'\n'}
                        • Mafia - Must eliminate the citizens{'\n'}
                        • Doctor - Can save one person each night{'\n'}
                        • Detective - Can investigate one person each night
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gameplay</Text>
                    <Text style={styles.text}>
                        The game alternates between night and day phases. During the night, the mafia chooses a victim, while the doctor and detective use their abilities. During the day, all players discuss and vote to eliminate a suspected mafia member.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Winning</Text>
                    <Text style={styles.text}>
                        • Citizens win when all mafia members are eliminated{'\n'}
                        • Mafia wins when they equal or outnumber the citizens
                    </Text>
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
    title: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    section: {
        backgroundColor: '#2C2F33',
        padding: 16,
        borderRadius: 8,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
    },
    text: {
        color: '#CCCCCC',
        fontSize: 16,
        lineHeight: 24,
    },
}); 