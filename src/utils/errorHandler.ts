import { Alert } from 'react-native';

export enum ErrorType {
    AUTHENTICATION = 'authentication',
    NETWORK = 'network',
    GAME = 'game',
    VALIDATION = 'validation',
    UNKNOWN = 'unknown',
}

export interface AppError extends Error {
    type: ErrorType;
    code?: string;
    originalError?: any;
}

class ErrorHandler {
    static createError(message: string, type: ErrorType, code?: string, originalError?: any): AppError {
        const error = new Error(message) as AppError;
        error.type = type;
        error.code = code;
        error.originalError = originalError;
        return error;
    }

    static handle(error: Error | AppError, showAlert: boolean = true): void {
        console.error('Error:', {
            message: error.message,
            type: (error as AppError).type || ErrorType.UNKNOWN,
            code: (error as AppError).code,
            stack: error.stack,
        });

        if (showAlert) {
            this.showErrorAlert(error);
        }

        // Add error reporting service integration here
        // e.g., Sentry, Firebase Crashlytics, etc.
    }

    static handleFirebaseError(error: any): AppError {
        let type = ErrorType.UNKNOWN;
        let message = 'An unexpected error occurred';

        if (error.code) {
            switch (error.code) {
                case 'auth/invalid-email':
                case 'auth/user-disabled':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/email-already-in-use':
                case 'auth/weak-password':
                case 'auth/operation-not-allowed':
                    type = ErrorType.AUTHENTICATION;
                    message = this.getAuthErrorMessage(error.code);
                    break;

                case 'permission-denied':
                case 'unauthenticated':
                    type = ErrorType.AUTHENTICATION;
                    message = 'You do not have permission to perform this action';
                    break;

                case 'unavailable':
                case 'deadline-exceeded':
                    type = ErrorType.NETWORK;
                    message = 'The service is currently unavailable. Please try again later';
                    break;

                default:
                    if (error.code.startsWith('auth/')) {
                        type = ErrorType.AUTHENTICATION;
                    }
                    message = error.message || message;
            }
        }

        return this.createError(message, type, error.code, error);
    }

    private static showErrorAlert(error: Error | AppError): void {
        const appError = error as AppError;
        const title = this.getErrorTitle(appError.type || ErrorType.UNKNOWN);

        Alert.alert(
            title,
            error.message,
            [{ text: 'OK', style: 'default' }],
            { cancelable: true }
        );
    }

    private static getErrorTitle(type: ErrorType): string {
        switch (type) {
            case ErrorType.AUTHENTICATION:
                return 'Authentication Error';
            case ErrorType.NETWORK:
                return 'Network Error';
            case ErrorType.GAME:
                return 'Game Error';
            case ErrorType.VALIDATION:
                return 'Validation Error';
            default:
                return 'Error';
        }
    }

    private static getAuthErrorMessage(code: string): string {
        switch (code) {
            case 'auth/invalid-email':
                return 'The email address is invalid';
            case 'auth/user-disabled':
                return 'This account has been disabled';
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/email-already-in-use':
                return 'This email is already registered';
            case 'auth/weak-password':
                return 'The password is too weak';
            case 'auth/operation-not-allowed':
                return 'This operation is not allowed';
            default:
                return 'An authentication error occurred';
        }
    }
}

export default ErrorHandler; 