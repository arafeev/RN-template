import SwiftUI

struct SettingsView: View {
    @StateObject private var viewModel = SettingsViewModel()
    @AppStorage("enableNotifications") private var enableNotifications = true
    @AppStorage("enableSoundEffects") private var enableSoundEffects = true
    @AppStorage("enableBackgroundMusic") private var enableBackgroundMusic = true
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Notifications")) {
                    Toggle("Enable Notifications", isOn: $enableNotifications)
                    if enableNotifications {
                        Toggle("Game Invites", isOn: $viewModel.gameInvites)
                        Toggle("Friend Requests", isOn: $viewModel.friendRequests)
                        Toggle("Game Updates", isOn: $viewModel.gameUpdates)
                    }
                }
                
                Section(header: Text("Audio")) {
                    Toggle("Sound Effects", isOn: $enableSoundEffects)
                    Toggle("Background Music", isOn: $enableBackgroundMusic)
                    if enableSoundEffects || enableBackgroundMusic {
                        Slider(value: $viewModel.volume, in: 0...1) {
                            Text("Volume")
                        }
                    }
                }
                
                Section(header: Text("Game Preferences")) {
                    Picker("Default Character", selection: $viewModel.defaultCharacter) {
                        ForEach(viewModel.availableCharacters, id: \.self) { character in
                            Text(character).tag(character)
                        }
                    }
                    
                    Toggle("Show Tutorial Tips", isOn: $viewModel.showTutorialTips)
                }
                
                Section(header: Text("Privacy")) {
                    Toggle("Show Online Status", isOn: $viewModel.showOnlineStatus)
                    Toggle("Allow Friend Requests", isOn: $viewModel.allowFriendRequests)
                }
                
                Section(header: Text("About")) {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text(viewModel.appVersion)
                            .foregroundColor(.secondary)
                    }
                    
                    NavigationLink("Terms of Service") {
                        TermsView()
                    }
                    
                    NavigationLink("Privacy Policy") {
                        PrivacyView()
                    }
                }
            }
            .navigationTitle("Settings")
            .onChange(of: enableNotifications) { newValue in
                viewModel.updateNotificationSettings(enabled: newValue)
            }
        }
    }
}

struct TermsView: View {
    var body: some View {
        ScrollView {
            Text("Terms of Service content goes here...")
                .padding()
        }
        .navigationTitle("Terms of Service")
    }
}

struct PrivacyView: View {
    var body: some View {
        ScrollView {
            Text("Privacy Policy content goes here...")
                .padding()
        }
        .navigationTitle("Privacy Policy")
    }
}

class SettingsViewModel: ObservableObject {
    @Published var gameInvites = true
    @Published var friendRequests = true
    @Published var gameUpdates = true
    @Published var volume: Double = 0.7
    @Published var defaultCharacter = "Random"
    @Published var showTutorialTips = true
    @Published var showOnlineStatus = true
    @Published var allowFriendRequests = true
    
    let availableCharacters = ["Random", "Mafia", "Detective", "Doctor", "Citizen"]
    let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    
    func updateNotificationSettings(enabled: Bool) {
        if enabled {
            // Request notification permissions
            UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
                if let error = error {
                    print("Error requesting notification permissions: \(error)")
                }
            }
        }
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
    }
} 