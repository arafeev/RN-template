import SwiftUI

struct GameLobbyView: View {
    @StateObject private var viewModel: GameLobbyViewModel
    
    init(authViewModel: AuthViewModel) {
        _viewModel = StateObject(wrappedValue: GameLobbyViewModel(authViewModel: authViewModel))
    }
    
    var body: some View {
        NavigationView {
            List {
                // Available Games
                Section(header: Text("Available Games")) {
                    ForEach(viewModel.availableGames) { game in
                        NavigationLink(destination: GameRoomView(game: game, viewModel: viewModel)) {
                            GameRow(game: game)
                        }
                    }
                }
                
                // Debug Section
                #if DEBUG
                Section(header: Text("Debug")) {
                    Button("Create Test Game") {
                        viewModel.createGame(name: "Test Game", maxPlayers: 4)
                    }
                    Button("Create Full Game") {
                        let game = viewModel.createGame(name: "Full Game", maxPlayers: 4)
                        viewModel.fillGameWithTestPlayers(game)
                    }
                }
                #endif
            }
            .navigationTitle("Game Lobby")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { viewModel.showingCreateGame = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $viewModel.showingCreateGame) {
                CreateGameView(viewModel: viewModel)
            }
            .onAppear {
                viewModel.fetchGames()
            }
        }
    }
}

struct GameRow: View {
    let game: Game
    
    var body: some View {
        VStack(alignment: .leading) {
            Text(game.name)
                .font(.headline)
            HStack {
                Text("Host: \(game.hostId)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
                Text("\(game.players.count)/\(game.maxPlayers)")
                    .font(.caption)
                    .padding(4)
                    .background(game.status.color.opacity(0.2))
                    .cornerRadius(4)
            }
        }
        .padding(.vertical, 4)
    }
}

struct CreateGameView: View {
    @ObservedObject var viewModel: GameLobbyViewModel
    @Environment(\.dismiss) private var dismiss
    
    @State private var gameName = ""
    @State private var maxPlayers = 4
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("Game Name", text: $gameName)
                    Stepper("Max Players: \(maxPlayers)", value: $maxPlayers, in: 2...6)
                }
            }
            .navigationTitle("Create Game")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        viewModel.createGame(name: gameName, maxPlayers: maxPlayers)
                        dismiss()
                    }
                    .disabled(gameName.isEmpty)
                }
            }
        }
    }
}

#Preview {
    GameLobbyView(authViewModel: AuthViewModel())
} 