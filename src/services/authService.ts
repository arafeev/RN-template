import auth from '@react-native-firebase/auth';

export interface UserCredentials {
    email: string;
    password: string;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

class AuthService {
    // Sign up with email and password
    async signUp({ email, password }: UserCredentials): Promise<UserProfile> {
        try {
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            return {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
                photoURL: userCredential.user.photoURL,
            };
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    // Sign in with email and password
    async signIn({ email, password }: UserCredentials): Promise<UserProfile> {
        try {
            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            return {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
                photoURL: userCredential.user.photoURL,
            };
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    // Sign out
    async signOut(): Promise<void> {
        try {
            await auth().signOut();
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    // Get current user
    getCurrentUser(): UserProfile | null {
        const user = auth().currentUser;
        if (!user) return null;

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
        };
    }

    // Listen to auth state changes
    onAuthStateChanged(callback: (user: UserProfile | null) => void) {
        return auth().onAuthStateChanged((user) => {
            if (user) {
                callback({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                });
            } else {
                callback(null);
            }
        });
    }

    private handleAuthError(error: any): Error {
        let message = 'An error occurred during authentication';
        if (error.code) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'Email address is already in use';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address';
                    break;
                case 'auth/operation-not-allowed':
                    message = 'Operation not allowed';
                    break;
                case 'auth/weak-password':
                    message = 'Password is too weak';
                    break;
                case 'auth/user-disabled':
                    message = 'User account has been disabled';
                    break;
                case 'auth/user-not-found':
                    message = 'User not found';
                    break;
                case 'auth/wrong-password':
                    message = 'Invalid password';
                    break;
            }
        }
        return new Error(message);
    }
}

export const authService = new AuthService(); 