import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { ScreenTemplate } from '../components/ScreenTemplate';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { friendService, Friend, FriendRequest } from '../services/friendService';

interface FriendItemProps {
    friend: Friend;
    onRemove: () => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, onRemove }) => {
    const statusColor =
        friend.status === 'online' ? '#4CAF50' :
            friend.status === 'in-game' ? '#FFC107' : '#666';

    return (
        <View style={styles.friendItem}>
            <View style={styles.friendInfo}>
                <View style={styles.avatarContainer}>
                    <Icon name="account-circle" size={40} color="#FFFFFF" />
                    <View
                        style={[
                            styles.statusIndicator,
                            { backgroundColor: statusColor }
                        ]}
                    />
                </View>
                <View>
                    <Text style={styles.friendName}>{friend.displayName || 'Unknown'}</Text>
                    <Text style={styles.statusText}>
                        {friend.status === 'online' ? 'Online' :
                            friend.status === 'in-game' ? 'In Game' : 'Offline'}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={onRemove}
            >
                <Icon name="account-remove" size={24} color="#FF5252" />
            </TouchableOpacity>
        </View>
    );
};

interface FriendRequestItemProps {
    request: FriendRequest;
    onAccept: () => void;
    onReject: () => void;
}

const FriendRequestItem: React.FC<FriendRequestItemProps> = ({
    request,
    onAccept,
    onReject,
}) => (
    <View style={styles.requestItem}>
        <View style={styles.requestInfo}>
            <Icon name="account-circle" size={40} color="#FFFFFF" />
            <Text style={styles.requestText}>
                Friend request from {request.fromUserId}
            </Text>
        </View>
        <View style={styles.requestActions}>
            <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={onAccept}
            >
                <Icon name="check" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={onReject}
            >
                <Icon name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    </View>
);

export const FriendsScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{
        uid: string;
        displayName: string | null;
        photoURL: string | null;
    }>>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadFriends();
        loadFriendRequests();

        const unsubscribe = friendService.onFriendsStatusChanged((updatedFriends) => {
            setFriends(updatedFriends);
        });

        return () => unsubscribe();
    }, []);

    const loadFriends = async () => {
        try {
            const friendsList = await friendService.getFriends();
            setFriends(friendsList);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const loadFriendRequests = async () => {
        try {
            const requests = await friendService.getFriendRequests();
            setFriendRequests(requests);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleSearch = async () => {
        if (searchQuery.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const results = await friendService.searchUsers(searchQuery);
            setSearchResults(results);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendRequest = async (userId: string) => {
        try {
            await friendService.sendFriendRequest(userId);
            Alert.alert('Success', 'Friend request sent!');
            setSearchResults([]);
            setSearchQuery('');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await friendService.acceptFriendRequest(requestId);
            loadFriendRequests();
            loadFriends();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            await friendService.rejectFriendRequest(requestId);
            loadFriendRequests();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleRemoveFriend = async (friendId: string) => {
        Alert.alert(
            'Remove Friend',
            'Are you sure you want to remove this friend?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await friendService.removeFriend(friendId);
                            loadFriends();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScreenTemplate>
            <View style={styles.container}>
                {/* Search Section */}
                <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                        <Icon name="magnify" size={24} color="#666" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search users..."
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                        />
                        {isLoading && (
                            <ActivityIndicator size="small" color="#6C63FF" />
                        )}
                    </View>

                    {searchResults.length > 0 && (
                        <View style={styles.searchResults}>
                            {searchResults.map((user) => (
                                <TouchableOpacity
                                    key={user.uid}
                                    style={styles.searchResultItem}
                                    onPress={() => handleSendRequest(user.uid)}
                                >
                                    <View style={styles.userInfo}>
                                        <Icon name="account-circle" size={32} color="#FFFFFF" />
                                        <Text style={styles.userName}>
                                            {user.displayName || 'Unknown'}
                                        </Text>
                                    </View>
                                    <Icon name="account-plus" size={24} color="#6C63FF" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Friend Requests Section */}
                {friendRequests.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Friend Requests</Text>
                        <FlatList
                            data={friendRequests}
                            renderItem={({ item }) => (
                                <FriendRequestItem
                                    request={item}
                                    onAccept={() => handleAcceptRequest(item.id)}
                                    onReject={() => handleRejectRequest(item.id)}
                                />
                            )}
                            keyExtractor={item => item.id}
                        />
                    </View>
                )}

                {/* Friends List Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Friends</Text>
                    {friends.length > 0 ? (
                        <FlatList
                            data={friends}
                            renderItem={({ item }) => (
                                <FriendItem
                                    friend={item}
                                    onRemove={() => handleRemoveFriend(item.id)}
                                />
                            )}
                            keyExtractor={item => item.id}
                        />
                    ) : (
                        <Text style={styles.emptyText}>
                            No friends yet. Use the search bar to find friends!
                        </Text>
                    )}
                </View>
            </View>
        </ScreenTemplate>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    searchSection: {
        marginBottom: 24,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2F33',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        marginLeft: 12,
    },
    searchResults: {
        marginTop: 8,
        backgroundColor: '#2C2F33',
        borderRadius: 12,
        overflow: 'hidden',
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1E2124',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 16,
        marginLeft: 12,
    },
    section: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#2C2F33',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    friendInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#2C2F33',
    },
    friendName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    statusText: {
        color: '#999',
        fontSize: 14,
    },
    removeButton: {
        padding: 8,
    },
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#2C2F33',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    requestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    requestText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginLeft: 12,
    },
    requestActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#FF5252',
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 32,
    },
}); 