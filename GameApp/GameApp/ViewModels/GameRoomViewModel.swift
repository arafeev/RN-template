import SwiftUI

class GameRoomViewModel: ObservableObject {
    @Published private(set) var game: Game
    @Published var navigateToGamePlay = false
    private let authViewModel: AuthViewModel
    
    var currentPlayer: Player? {
        game.players.first { $0.userId == currentUserId }
    }
    
    var canStartGame: Bool {
        game.players.count >= 4 && game.hostId == currentUserId
    }
    
    private var currentUserId: String {
        authViewModel.currentUser?.id ?? UUID().uuidString
    }
    
    private var currentUsername: String {
        authViewModel.userProfile?.username ?? "Player"
    }
    
    init(game: Game, authViewModel: AuthViewModel) {
        self.game = game
        self.authViewModel = authViewModel
        
        // Add current player if not already in game
        if !game.players.contains(where: { $0.userId == currentUserId }) {
            var updatedGame = game
            let player = Player(userId: currentUserId, username: currentUsername)
            if updatedGame.addPlayer(player) {
                self.game = updatedGame
            }
        }
    }
    
    func startGame() {
        guard canStartGame else { return }
        var updatedGame = game
        updatedGame.distributeRoles()
        game = updatedGame
    }
    
    func selectCharacter(_ character: Character) {
        var updatedGame = game
        updatedGame.selectCharacter(playerId: currentUserId, character: character)
        game = updatedGame
        
        // If all players have selected their characters, navigate to game play
        if game.players.allSatisfy({ $0.isReady }) {
            navigateToGamePlay = true
        }
    }
    
    func shouldShowRole(for player: Player) -> Bool {
        guard let currentPlayer = currentPlayer,
              let currentRole = currentPlayer.role,
              let playerRole = player.role else {
            return false
        }
        
        // Don is always revealed to everyone
        if playerRole == .don { return true }
        
        // Players can see their own role
        if player.id == currentPlayer.id { return true }
        
        // Don can see Capos
        if currentRole == .don && playerRole == .capo { return true }
        
        return false
    }
    
    func isCurrentPlayer(_ player: Player) -> Bool {
        player.userId == currentUserId
    }
    
    // Debug method to fill room with mock players
    func fillRoomWithMockPlayers() {
        var updatedGame = game
        let remainingSlots = updatedGame.maxPlayers - updatedGame.players.count
        
        for i in 0..<remainingSlots {
            let mockPlayer = Player(
                userId: "mock_\(UUID().uuidString)",
                username: "Test Player \(i + 1)"
            )
            _ = updatedGame.addPlayer(mockPlayer)
        }
        
        game = updatedGame
    }
    
    // Debug method to simulate other players selecting characters
    func debugSelectCharactersForOthers() {
        var updatedGame = game
        
        // Skip the current player as they need to select manually
        for player in updatedGame.players where player.userId != currentUserId {
            // If player has character options but hasn't selected yet
            if let options = player.characterOptions, !player.isReady {
                // Select the first available character
                updatedGame.selectCharacter(playerId: player.userId, character: options[0])
            }
        }
        
        game = updatedGame
        
        // Check if everyone (including current player) is ready
        if game.players.allSatisfy({ $0.isReady }) {
            navigateToGamePlay = true
        }
    }
    
    func cleanup() {
        // TODO: Implement cleanup when player leaves the game
    }
} 