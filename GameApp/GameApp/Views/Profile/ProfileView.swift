import SwiftUI

struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Profile Information")) {
                    if viewModel.isEditing {
                        TextField("Username", text: $viewModel.username)
                    } else {
                        HStack {
                            Text("Username")
                            Spacer()
                            Text(viewModel.username)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    HStack {
                        Text("Email")
                        Spacer()
                        Text(viewModel.email)
                            .foregroundColor(.secondary)
                    }
                }
                
                Section(header: Text("Statistics")) {
                    StatRow(title: "Games Played", value: viewModel.gamesPlayed)
                    StatRow(title: "Games Won", value: viewModel.gamesWon)
                    StatRow(title: "Win Rate", value: viewModel.winRate)
                }
                
                Section {
                    Button(action: { authViewModel.signOut() }) {
                        Text("Sign Out")
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Profile")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: viewModel.toggleEdit) {
                        Text(viewModel.isEditing ? "Save" : "Edit")
                    }
                }
            }
        }
    }
}

struct StatRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
            Spacer()
            Text(value)
                .foregroundColor(.secondary)
        }
    }
}

class ProfileViewModel: ObservableObject {
    @Published var username = "Player"
    @Published var email = "player@example.com"
    @Published var gamesPlayed = "0"
    @Published var gamesWon = "0"
    @Published var winRate = "0%"
    @Published var isEditing = false
    
    init() {
        fetchProfile()
    }
    
    func fetchProfile() {
        // TODO: Implement Firebase fetch
    }
    
    func toggleEdit() {
        if isEditing {
            saveProfile()
        }
        isEditing.toggle()
    }
    
    private func saveProfile() {
        // TODO: Implement Firebase save
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
} 