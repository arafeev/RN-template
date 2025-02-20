import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        Group {
            if authViewModel.isAuthenticated {
                MainTabView()
            } else {
                AuthenticationView()
            }
        }
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            GameLobbyView()
                .tabItem {
                    Label("Games", systemImage: "gamecontroller")
                }
            
            FriendsView()
                .tabItem {
                    Label("Friends", systemImage: "person.2")
                }
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.circle")
                }
            
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(AuthViewModel())
    }
} 