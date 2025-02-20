import SwiftUI

enum GameAction: String, CaseIterable, Identifiable {
    case attack = "Attack"
    case heal = "Heal"
    case investigate = "Investigate"
    case protect = "Protect"
    
    var id: String { rawValue }
    
    var icon: String {
        switch self {
        case .attack: return "burst.fill"
        case .heal: return "cross.fill"
        case .investigate: return "magnifyingglass"
        case .protect: return "shield.fill"
        }
    }
    
    var name: String { rawValue }
    
    func isAvailable(for player: Player) -> Bool {
        guard let role = player.role else { return false }
        
        switch self {
        case .attack:
            return player.ammo > 0
        case .heal:
            return role == .don
        case .investigate:
            return role == .fbiAgent
        case .protect:
            return role == .capo
        }
    }
} 