import React, { useState } from 'react';
import { Text, StyleSheet, View, Switch, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenTemplate } from '../components/ScreenTemplate';
import { authService } from '../services/authService';

export const SettingsScreen = () => {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);

    const handleLogout = async () => {
        try {
            await authService.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const SettingItem = ({
        icon,
        title,
        value,
        onValueChange
    }: {
        icon: string;
        title: string;
        value: boolean;
        onValueChange: (value: boolean) => void;
    }) => (
        <View style={styles.settingItem}>
            <Icon name={icon} size={24} color="#FFFFFF" style={styles.settingIcon} />
            <Text style={styles.settingText}>{title}</Text>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#767577', true: '#6C63FF' }}
                thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
            />
        </View>
    );

    return (
        <ScreenTemplate>
            <View style={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Game Settings</Text>
                    <SettingItem
                        icon="volume-high"
                        title="Sound Effects"
                        value={soundEnabled}
                        onValueChange={setSoundEnabled}
                    />
                    <SettingItem
                        icon="music"
                        title="Background Music"
                        value={musicEnabled}
                        onValueChange={setMusicEnabled}
                    />
                    <SettingItem
                        icon="vibrate"
                        title="Vibration"
                        value={vibrationEnabled}
                        onValueChange={setVibrationEnabled}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Icon name="logout" size={24} color="#FF3B30" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.version}>Version 1.0.0</Text>
            </View>
        </ScreenTemplate>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        backgroundColor: '#2C2F33',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingIcon: {
        marginRight: 16,
    },
    settingText: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 16,
        marginLeft: 16,
    },
    version: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 'auto',
        marginBottom: 16,
    },
}); 