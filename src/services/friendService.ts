import firestore from '@react-native-firebase/firestore';
import { authService } from './authService';

export interface FriendRequest {
    id: string;
    fromUserId: string;
    toUserId: string;
    status: 'pending' | 'accepted' | 'rejected';
    timestamp: number;
}

export interface Friend {
    id: string;
    userId: string;
    displayName: string | null;
    photoURL: string | null;
    status: 'online' | 'offline' | 'in-game';
    lastSeen: number;
}

class FriendService {
    private friendsCollection = firestore().collection('friends');
    private friendRequestsCollection = firestore().collection('friendRequests');
    private usersCollection = firestore().collection('users');

    // Send friend request
    async sendFriendRequest(toUserId: string): Promise<void> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        // Check if request already exists
        const existingRequest = await this.friendRequestsCollection
            .where('fromUserId', '==', currentUser.uid)
            .where('toUserId', '==', toUserId)
            .get();

        if (!existingRequest.empty) {
            throw new Error('Friend request already sent');
        }

        // Check if they are already friends
        const existingFriendship = await this.friendsCollection
            .where('userId', '==', currentUser.uid)
            .where('friendId', '==', toUserId)
            .get();

        if (!existingFriendship.empty) {
            throw new Error('Already friends');
        }

        // Create friend request
        await this.friendRequestsCollection.add({
            fromUserId: currentUser.uid,
            toUserId,
            status: 'pending',
            timestamp: Date.now(),
        });
    }

    // Accept friend request
    async acceptFriendRequest(requestId: string): Promise<void> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        const requestDoc = await this.friendRequestsCollection.doc(requestId).get();
        if (!requestDoc.exists) throw new Error('Friend request not found');

        const request = requestDoc.data() as FriendRequest;
        if (request.toUserId !== currentUser.uid) {
            throw new Error('Not authorized to accept this request');
        }

        const fromUser = await this.usersCollection.doc(request.fromUserId).get();
        const fromUserData = fromUser.data();

        // Create friend entries for both users
        const batch = firestore().batch();

        // Friend entry for current user
        const currentUserFriendRef = this.friendsCollection.doc();
        batch.set(currentUserFriendRef, {
            userId: currentUser.uid,
            friendId: request.fromUserId,
            displayName: fromUserData?.displayName,
            photoURL: fromUserData?.photoURL,
            status: 'offline',
            lastSeen: Date.now(),
        });

        // Friend entry for the other user
        const otherUserFriendRef = this.friendsCollection.doc();
        batch.set(otherUserFriendRef, {
            userId: request.fromUserId,
            friendId: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            status: 'offline',
            lastSeen: Date.now(),
        });

        // Update request status
        batch.update(requestDoc.ref, { status: 'accepted' });

        await batch.commit();
    }

    // Reject friend request
    async rejectFriendRequest(requestId: string): Promise<void> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        const requestDoc = await this.friendRequestsCollection.doc(requestId).get();
        if (!requestDoc.exists) throw new Error('Friend request not found');

        const request = requestDoc.data() as FriendRequest;
        if (request.toUserId !== currentUser.uid) {
            throw new Error('Not authorized to reject this request');
        }

        await requestDoc.ref.update({ status: 'rejected' });
    }

    // Remove friend
    async removeFriend(friendId: string): Promise<void> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        const batch = firestore().batch();

        // Remove friend entries for both users
        const currentUserFriendQuery = await this.friendsCollection
            .where('userId', '==', currentUser.uid)
            .where('friendId', '==', friendId)
            .get();

        const otherUserFriendQuery = await this.friendsCollection
            .where('userId', '==', friendId)
            .where('friendId', '==', currentUser.uid)
            .get();

        currentUserFriendQuery.docs.forEach(doc => batch.delete(doc.ref));
        otherUserFriendQuery.docs.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
    }

    // Get friend requests
    async getFriendRequests(): Promise<FriendRequest[]> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        const snapshot = await this.friendRequestsCollection
            .where('toUserId', '==', currentUser.uid)
            .where('status', '==', 'pending')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FriendRequest));
    }

    // Get friends list
    async getFriends(): Promise<Friend[]> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        const snapshot = await this.friendsCollection
            .where('userId', '==', currentUser.uid)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Friend));
    }

    // Update user status
    async updateStatus(status: Friend['status']): Promise<void> {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        const friendDocs = await this.friendsCollection
            .where('userId', '==', currentUser.uid)
            .get();

        const batch = firestore().batch();
        friendDocs.docs.forEach(doc => {
            batch.update(doc.ref, {
                status,
                lastSeen: Date.now(),
            });
        });

        await batch.commit();
    }

    // Subscribe to friend status changes
    onFriendsStatusChanged(callback: (friends: Friend[]) => void) {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User must be authenticated');

        return this.friendsCollection
            .where('userId', '==', currentUser.uid)
            .onSnapshot((snapshot) => {
                const friends = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Friend));
                callback(friends);
            });
    }

    // Search users by username
    async searchUsers(query: string): Promise<Array<{
        uid: string;
        displayName: string | null;
        photoURL: string | null;
    }>> {
        if (query.length < 3) return [];

        const snapshot = await this.usersCollection
            .where('displayName', '>=', query)
            .where('displayName', '<=', query + '\uf8ff')
            .limit(10)
            .get();

        return snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));
    }
}

export const friendService = new FriendService(); 