import Foundation

struct UserProfile: Codable {
    let email: String
    var username: String
    let createdAt: Date
    var gamesPlayed: Int
    var gamesWon: Int
    var friends: [String]
    var friendRequests: [String]
} 