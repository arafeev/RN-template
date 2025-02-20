import SwiftUI

struct GameLobbyView: View {
    @StateObject private var viewModel = GameLobbyViewModel()
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Available Games")) {
                    ForEach(viewModel.availableGames) { game in
                        GameRowView(game: game)
                            .onTapGesture {
                                viewModel.joinGame(game)
                            }
                    }
                }
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
            .refreshable {
                await viewModel.fetchGames()
            }
            .onAppear {
                Task {
                    await viewModel.fetchGames()
                }
            }
        }
    }
}

struct GameRowView: View {
    let game: Game
    
    var body: some View {
        VStack(alignment: .leading) {
            Text(game.name)
                .font(.headline)
            HStack {
                Text("\(game.players.count)/\(game.maxPlayers) Players")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
                Text(game.status.rawValue)
                    .font(.subheadline)
                    .foregroundColor(game.status.color)
            }
        }
        .padding(.vertical, 8)
    }
}

struct CreateGameView: View {
    @ObservedObject var viewModel: GameLobbyViewModel
    @Environment(\.dismiss) var dismiss
    @State private var gameName = ""
    @State private var maxPlayers = 4
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Game Settings")) {
                    TextField("Game Name", text: $gameName)
                    
                    Stepper("Max Players: \(maxPlayers)", value: $maxPlayers, in: 2...8)
                }
            }
            .navigationTitle("Create Game")
            .navigationBarItems(
                leading: Button("Cancel") { dismiss() },
                trailing: Button("Create") {
                    viewModel.createGame(name: gameName, maxPlayers: maxPlayers)
                    dismiss()
                }
                .disabled(gameName.isEmpty)
            )
        }
    }
}

#Preview {
    GameLobbyView()
} 