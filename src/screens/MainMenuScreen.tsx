import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type MainMenuNavigationProp = StackNavigationProp<RootStackParamList, 'MainMenu'>;

interface MenuItemProps {
    title: string;
    icon: string;
    onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ title, icon, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <Icon name={icon} size={24} color="#FFFFFF" style={styles.menuIcon} />
        <Text style={styles.menuText}>{title}</Text>
        <Icon name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
);

export const MainMenuScreen = () => {
    const navigation = useNavigation<MainMenuNavigationProp>();

    const menuItems = [
        {
            title: 'Play',
            icon: 'play',
            onPress: () => navigation.navigate('Game'),
        },
        {
            title: 'Online Game',
            icon: 'earth',
            onPress: () => navigation.navigate('OnlineGame'),
        },
        {
            title: 'Friends',
            icon: 'account-group',
            onPress: () => navigation.navigate('Friends'),
        },
        {
            title: 'Rules',
            icon: 'book-open-variant',
            onPress: () => navigation.navigate('Rules'),
        },
        {
            title: 'Card Collection',
            icon: 'cards',
            onPress: () => navigation.navigate('CardCollection'),
        },
        {
            title: 'Settings',
            icon: 'cog',
            onPress: () => navigation.navigate('Settings'),
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>MAFIA COMMAND</Text>
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <MenuItem
                            key={index}
                            title={item.title}
                            icon={item.icon}
                            onPress={item.onPress}
                        />
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E2124',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginVertical: 24,
    },
    menuContainer: {
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2F33',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 8,
    },
    menuIcon: {
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}); 