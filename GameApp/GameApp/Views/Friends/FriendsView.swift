import SwiftUI

struct FriendsView: View {
    @StateObject private var viewModel = FriendsViewModel()
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Friend Requests")) {
                    ForEach(viewModel.friendRequests) { request in
                        FriendRequestRow(request: request, viewModel: viewModel)
                    }
                }
                
                Section(header: Text("Friends")) {
                    ForEach(viewModel.friends) { friend in
                        FriendRow(friend: friend)
                    }
                }
            }
            .navigationTitle("Friends")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { viewModel.showingAddFriend = true }) {
                        Image(systemName: "person.badge.plus")
                    }
                }
            }
            .sheet(isPresented: $viewModel.showingAddFriend) {
                AddFriendView(viewModel: viewModel)
            }
            .refreshable {
                await viewModel.fetchFriends()
            }
        }
    }
}

struct FriendRequestRow: View {
    let request: FriendRequest
    @ObservedObject var viewModel: FriendsViewModel
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(request.username)
                    .font(.headline)
                Text("Sent \(request.timestamp.timeAgo())")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            HStack {
                Button(action: { viewModel.acceptRequest(request) }) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                }
                
                Button(action: { viewModel.rejectRequest(request) }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.red)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct FriendRow: View {
    let friend: Friend
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(friend.username)
                    .font(.headline)
                Text(friend.status.rawValue)
                    .font(.subheadline)
                    .foregroundColor(friend.status.color)
            }
            
            Spacer()
            
            if friend.status == .online {
                Button(action: {}) {
                    Text("Invite")
                        .foregroundColor(.blue)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct AddFriendView: View {
    @ObservedObject var viewModel: FriendsViewModel
    @Environment(\.dismiss) var dismiss
    @State private var username = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Add Friend")) {
                    TextField("Username", text: $username)
                        .autocapitalization(.none)
                }
            }
            .navigationTitle("Add Friend")
            .navigationBarItems(
                leading: Button("Cancel") { dismiss() },
                trailing: Button("Send") {
                    viewModel.sendFriendRequest(to: username)
                    dismiss()
                }
                .disabled(username.isEmpty)
            )
        }
    }
}

class FriendsViewModel: ObservableObject {
    @Published var friends: [Friend] = []
    @Published var friendRequests: [FriendRequest] = []
    @Published var showingAddFriend = false
    
    func fetchFriends() async {
        // TODO: Implement Firebase fetch
    }
    
    func sendFriendRequest(to username: String) {
        // TODO: Implement Firebase friend request
    }
    
    func acceptRequest(_ request: FriendRequest) {
        // TODO: Implement Firebase accept
    }
    
    func rejectRequest(_ request: FriendRequest) {
        // TODO: Implement Firebase reject
    }
}

struct Friend: Identifiable {
    let id: String
    let username: String
    let status: UserStatus
}

struct FriendRequest: Identifiable {
    let id: String
    let username: String
    let timestamp: Date
}

enum UserStatus: String {
    case online = "Online"
    case offline = "Offline"
    case inGame = "In Game"
    
    var color: Color {
        switch self {
        case .online: return .green
        case .offline: return .gray
        case .inGame: return .blue
        }
    }
}

extension Date {
    func timeAgo() -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return formatter.localizedString(for: self, relativeTo: Date())
    }
}

struct FriendsView_Previews: PreviewProvider {
    static var previews: some View {
        FriendsView()
    }
} 