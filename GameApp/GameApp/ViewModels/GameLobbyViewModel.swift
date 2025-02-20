import SwiftUI

final class GameLobbyViewModel: ObservableObject {
    @Published var availableGames: [Game] = []
    @Published var showingCreateGame = false
    
    // Mock data for testing
    private var mockGames = [
        Game(name: "Game 1", hostId: "host1", maxPlayers: 4),
        Game(name: "Game 2", hostId: "host2", maxPlayers: 6)
    ]
    
    func fetchGames() async {
        // Simulate network delay
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        await MainActor.run {
            availableGames = mockGames.filter { $0.status == .waiting }
        }
    }
    
    func createGame(name: String, maxPlayers: Int) {
        let newGame = Game(name: name, hostId: UUID().uuidString, maxPlayers: maxPlayers)
        mockGames.append(newGame)
        Task {
            await fetchGames()
        }
    }
    
    func joinGame(_ game: Game) {
        guard let index = mockGames.firstIndex(where: { $0.id == game.id }),
              mockGames[index].players.count < mockGames[index].maxPlayers else {
            return
        }
        
        mockGames[index].players.append(UUID().uuidString)
        if mockGames[index].players.count == mockGames[index].maxPlayers {
            mockGames[index].status = .inProgress
        }
        
        Task {
            await fetchGames()
        }
    }
} 