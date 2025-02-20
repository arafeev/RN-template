import SwiftUI

final class GameLobbyViewModel: ObservableObject {
    @Published var availableGames: [Game] = []
    @Published var showingCreateGame = false
    
    let authViewModel: AuthViewModel
    
    init(authViewModel: AuthViewModel) {
        self.authViewModel = authViewModel
        fetchGames()
    }
    
    private var currentUserId: String {
        authViewModel.currentUser?.id ?? UUID().uuidString
    }
    
    private var currentUsername: String {
        authViewModel.userProfile?.username ?? "Player"
    }
    
    // Mock data for testing
    private var mockGames = [
        Game(name: "Game 1", hostId: "host1", maxPlayers: 4, hostUsername: "Host 1"),
        Game(name: "Game 2", hostId: "host2", maxPlayers: 6, hostUsername: "Host 2")
    ]
    
    func fetchGames() {
        // Mock data for testing
        availableGames = [
            Game(name: "Game 1", hostId: "host1", maxPlayers: 4, hostUsername: "Host 1"),
            Game(name: "Game 2", hostId: "host2", maxPlayers: 6, hostUsername: "Host 2")
        ]
    }
    
    @discardableResult
    func createGame(name: String, maxPlayers: Int) -> Game {
        let newGame = Game(
            name: name,
            hostId: currentUserId,
            maxPlayers: maxPlayers,
            hostUsername: currentUsername
        )
        availableGames.append(newGame)
        showingCreateGame = false
        return newGame
    }
    
    func joinGame(_ game: Game) {
        guard let index = availableGames.firstIndex(where: { $0.id == game.id }) else { return }
        var updatedGame = game
        let newPlayer = Player(userId: currentUserId, username: currentUsername)
        if updatedGame.addPlayer(newPlayer) {
            availableGames[index] = updatedGame
        }
    }
    
    // MARK: - Debug Helpers
    
    func fillGameWithTestPlayers(_ game: Game) {
        print("🎲 Starting to fill game with test players: \(game.id)")
        guard let index = availableGames.firstIndex(where: { $0.id == game.id }) else {
            print("❌ Game not found in available games")
            return
        }
        
        var updatedGame = game
        print("👥 Current player count: \(updatedGame.players.count)")
        
        // Add test players until full
        for i in 0..<(game.maxPlayers - 1) {
            let testPlayer = Player(
                userId: "test_\(i)",
                username: "Test Player \(i + 1)"
            )
            print("➕ Adding test player: \(testPlayer.username)")
            _ = updatedGame.addPlayer(testPlayer)
        }
        
        print("👥 Final player count: \(updatedGame.players.count)")
        print("🎮 Game status: \(updatedGame.status.rawValue)")
        
        availableGames[index] = updatedGame
        objectWillChange.send()
        print("✅ Test players added successfully")
    }
    
    func distributeRoles(_ game: Game) {
        print("🎲 Starting role distribution for game: \(game.id)")
        guard let index = availableGames.firstIndex(where: { $0.id == game.id }) else {
            print("❌ Game not found in available games")
            return
        }
        
        var updatedGame = game
        print("👥 Current players: \(updatedGame.players.map { $0.username })")
        
        // Distribute roles
        updatedGame.distributeRoles()
        print("🎭 Roles distributed: \(updatedGame.players.map { ($0.username, $0.role?.rawValue ?? "None") })")
        
        // Distribute characters
        print("🎮 Proceeding to character distribution")
        for i in 0..<updatedGame.players.count {
            let shuffledCharacters = Character.allCharacters.shuffled()
            updatedGame.players[i].characterOptions = Array(shuffledCharacters.prefix(2))
            
            // Auto-select first character for each player
            if let character = updatedGame.players[i].characterOptions?.first {
                print("🎯 Auto-selecting character \(character.name) for player \(updatedGame.players[i].username)")
                updatedGame.selectCharacter(playerId: updatedGame.players[i].userId, character: character)
            }
        }
        print("🎭 Characters distributed and selected")
        
        // Initialize the game
        updatedGame.status = .inProgress
        updatedGame.currentPhase = .drawingCards
        updatedGame.initializeDeck()
        print("🃏 Game initialized - Status: \(updatedGame.status.rawValue), Phase: \(updatedGame.currentPhase.rawValue)")
        
        // Print final state
        print("🎭 Final player states:")
        for player in updatedGame.players {
            print("  - Player: \(player.username)")
            print("    Role: \(player.role?.rawValue ?? "None")")
            print("    Character: \(player.selectedCharacter?.name ?? "None")")
            print("    Ready: \(player.isReady)")
        }
        
        availableGames[index] = updatedGame
        objectWillChange.send()
        print("✅ Game setup completed")
    }
    
    func autoSelectCharacters(_ game: Game) {
        print("🎮 Starting character auto-selection for game: \(game.id)")
        guard let index = availableGames.firstIndex(where: { $0.id == game.id }) else {
            print("❌ Game not found in available games")
            return
        }
        
        var updatedGame = game
        print("👥 Players before character selection: \(updatedGame.players.map { ($0.username, $0.characterOptions?.count ?? 0) })")
        
        for player in updatedGame.players {
            if let character = player.characterOptions?.first {
                print("🎯 Selecting character \(character.name) for player \(player.username)")
                updatedGame.selectCharacter(playerId: player.userId, character: character)
            } else {
                print("⚠️ No character options available for player \(player.username)")
            }
        }
        
        print("🎭 Final character assignments: \(updatedGame.players.map { ($0.username, $0.selectedCharacter?.name ?? "None") })")
        print("🎮 Game status: \(updatedGame.status.rawValue), Phase: \(updatedGame.currentPhase.rawValue)")
        
        availableGames[index] = updatedGame
        objectWillChange.send()
        print("✅ Character auto-selection completed")
    }
} 

