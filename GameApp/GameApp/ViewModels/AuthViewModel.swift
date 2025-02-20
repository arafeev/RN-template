import SwiftUI
import Foundation

final class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: MockUser?
    @Published var userProfile: UserProfile?
    @Published var isLoading = false
    @Published var error: String?
    
    struct MockUser: Codable {
        let id: String
        let email: String
    }
    
    init() {
        loadSavedUser()
    }
    
    private func loadSavedUser() {
        if let userData = UserDefaults.standard.data(forKey: "currentUser"),
           let user = try? JSONDecoder().decode(MockUser.self, from: userData),
           let profileData = UserDefaults.standard.data(forKey: "userProfile"),
           let profile = try? JSONDecoder().decode(UserProfile.self, from: profileData) {
            self.currentUser = user
            self.userProfile = profile
            self.isAuthenticated = true
        }
    }
    
    private func saveUser(_ user: MockUser, profile: UserProfile) {
        if let userData = try? JSONEncoder().encode(user),
           let profileData = try? JSONEncoder().encode(profile) {
            UserDefaults.standard.set(userData, forKey: "currentUser")
            UserDefaults.standard.set(profileData, forKey: "userProfile")
        }
    }
    
    @MainActor
    func signIn(email: String, password: String) async throws {
        isLoading = true
        error = nil
        
        defer {
            isLoading = false
        }
        
        do {
            // Simulate network delay
            try await Task.sleep(nanoseconds: 1_000_000_000)
            
            // Simple validation
            guard !email.isEmpty, !password.isEmpty else {
                throw AuthError.invalidCredentials
            }
            
            // Mock successful login
            let user = MockUser(id: UUID().uuidString, email: email)
            let profile = UserProfile(
                email: email,
                username: email.split(separator: "@").first.map(String.init) ?? "Player",
                createdAt: Date(),
                gamesPlayed: 0,
                gamesWon: 0,
                friends: [],
                friendRequests: []
            )
            
            currentUser = user
            userProfile = profile
            isAuthenticated = true
            
            // Save user data
            saveUser(user, profile: profile)
            
        } catch {
            self.error = error.localizedDescription
            throw error
        }
    }
    
    @MainActor
    func register(email: String, password: String, username: String? = nil) async throws {
        isLoading = true
        error = nil
        
        defer {
            isLoading = false
        }
        
        do {
            // Simulate network delay
            try await Task.sleep(nanoseconds: 1_000_000_000)
            
            // Simple validation
            guard !email.isEmpty, !password.isEmpty, password.count >= 6 else {
                throw AuthError.invalidCredentials
            }
            
            // Mock successful registration
            let user = MockUser(id: UUID().uuidString, email: email)
            let profile = UserProfile(
                email: email,
                username: username ?? email.split(separator: "@").first.map(String.init) ?? "Player",
                createdAt: Date(),
                gamesPlayed: 0,
                gamesWon: 0,
                friends: [],
                friendRequests: []
            )
            
            currentUser = user
            userProfile = profile
            isAuthenticated = true
            
            // Save user data
            saveUser(user, profile: profile)
            
        } catch {
            self.error = error.localizedDescription
            throw error
        }
    }
    
    func signOut() {
        isAuthenticated = false
        currentUser = nil
        userProfile = nil
        UserDefaults.standard.removeObject(forKey: "currentUser")
        UserDefaults.standard.removeObject(forKey: "userProfile")
    }
}

enum AuthError: LocalizedError {
    case invalidCredentials
    
    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Invalid email or password"
        }
    }
} 
