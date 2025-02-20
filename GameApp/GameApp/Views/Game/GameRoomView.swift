import SwiftUI

struct GameRoomView: View {
    let game: Game
    @ObservedObject var viewModel: GameLobbyViewModel
    @State private var navigateToGamePlay = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // Game info header
                VStack(alignment: .leading, spacing: 8) {
                    Text(game.name)
                        .font(.title)
                    HStack {
                        Text("Host: \(game.hostId)")
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("\(game.players.count)/\(game.maxPlayers)")
                            .font(.headline)
                    }
                    
                    // Game Status
                    Text("Status: \(game.status.rawValue)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    if game.currentPhase != .waiting {
                        Text("Phase: \(game.currentPhase.rawValue)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                
                // Players list
                VStack(alignment: .leading, spacing: 8) {
                    Text("PLAYERS")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .padding(.horizontal)
                    
                    ForEach(game.players) { player in
                        PlayerRow(player: player)
                            .padding(.horizontal)
                            .padding(.vertical, 8)
                            .background(Color(.systemBackground))
                    }
                }
                
                Spacer()
                
                // Debug Section
                #if DEBUG
                VStack(spacing: 12) {
                    if game.status == .waiting {
                        Button("Fill with Test Players") {
                            print("🎲 Filling game with test players")
                            viewModel.fillGameWithTestPlayers(game)
                        }
                        .buttonStyle(.bordered)
                    }
                }
                .padding()
                #endif
                
                // Action Buttons
                VStack(spacing: 12) {
                    if game.status == .waiting && !game.players.contains(where: { $0.userId == viewModel.authViewModel.currentUser?.id }) {
                        Button("Join Game") {
                            print("👤 Player joining game")
                            viewModel.joinGame(game)
                        }
                        .buttonStyle(.borderedProminent)
                        .padding(.horizontal, 40)
                    }
                    
                    if game.hostId == viewModel.authViewModel.currentUser?.id && game.status == .preparing {
                        Button("Start Game") {
                            print("🎮 Host starting game")
                            print("Current players: \(game.players.map { $0.username })")
                            viewModel.distributeRoles(game)
                        }
                        .buttonStyle(.borderedProminent)
                        .padding(.horizontal, 40)
                    }
                    
                    if game.status == .inProgress {
                        Button("Enter Game") {
                            print("🎮 Entering game play")
                            print("Game state - Status: \(game.status.rawValue), Phase: \(game.currentPhase.rawValue)")
                            print("Players: \(game.players.map { ($0.username, $0.role?.rawValue ?? "None", $0.selectedCharacter?.name ?? "None") })")
                            navigateToGamePlay = true
                        }
                        .buttonStyle(.borderedProminent)
                        .padding(.horizontal, 40)
                    }
                }
                .padding(.bottom, 30)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Game Room")
            .navigationDestination(isPresented: $navigateToGamePlay) {
                GamePlayView(game: game, authViewModel: viewModel.authViewModel)
            }
        }
    }
}

struct PlayerRow: View {
    let player: Player
    
    var body: some View {
        HStack {
            Image(systemName: "person.circle.fill")
                .foregroundColor(.blue)
                .font(.title2)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(player.username)
                    .font(.headline)
                if let character = player.selectedCharacter {
                    Text(character.name)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            if player.isReady {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
            }
            
            if let role = player.role {
                Text(role.rawValue)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(role == .don ? Color.red.opacity(0.2) : Color.blue.opacity(0.2))
                    .cornerRadius(8)
            }
        }
    }
}

#Preview {
    NavigationView {
        GameRoomView(
            game: Game(name: "Test Game", hostId: "host1", maxPlayers: 4, hostUsername: "Host"),
            viewModel: GameLobbyViewModel(authViewModel: AuthViewModel())
        )
    }
} 