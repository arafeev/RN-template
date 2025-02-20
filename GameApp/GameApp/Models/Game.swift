import Foundation
import SwiftUI

// MARK: - Game Model
struct Game: Identifiable, Codable {
    let id: String
    let name: String
    let hostId: String
    let maxPlayers: Int
    var players: [String]
    var status: GameStatus
    let createdAt: Date
    
    init(name: String, hostId: String, maxPlayers: Int) {
        self.id = UUID().uuidString
        self.name = name
        self.hostId = hostId
        self.maxPlayers = maxPlayers
        self.players = [hostId]
        self.status = .waiting
        self.createdAt = Date()
    }
}

// MARK: - Game Status
enum GameStatus: String, Codable {
    case waiting = "waiting"
    case inProgress = "inProgress"
    case completed = "completed"
    
    var color: Color {
        switch self {
        case .waiting: return .green
        case .inProgress: return .blue
        case .completed: return .gray
        }
    }
} 