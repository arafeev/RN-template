import Foundation

enum GameRole: String, Codable {
    case don = "Don"
    case traitor = "Traitor"
    case capo = "Capo"
    case fbiAgent = "FBI Agent"
    
    static func rolesForPlayerCount(_ count: Int) -> [GameRole] {
        switch count {
        case 4:
            return [.don, .traitor] + Array(repeating: .fbiAgent, count: 2)
        case 5:
            return [.don, .traitor, .capo] + Array(repeating: .fbiAgent, count: 2)
        case 6:
            return [.don, .traitor, .capo] + Array(repeating: .fbiAgent, count: 3)
        case 7:
            return [.don, .traitor] + Array(repeating: .capo, count: 2) + Array(repeating: .fbiAgent, count: 3)
        default:
            return []
        }
    }
}

struct Character: Identifiable, Codable {
    let id: String
    let name: String
    let ability: String
    let baseHealth: Int
    let baseAmmo: Int
    
    static let allCharacters: [Character] = [
        Character(id: UUID().uuidString, name: "Enforcer", ability: "Can deal extra damage", baseHealth: 4, baseAmmo: 2),
        Character(id: UUID().uuidString, name: "Medic", ability: "Can heal other players", baseHealth: 3, baseAmmo: 1),
        Character(id: UUID().uuidString, name: "Scout", ability: "Can see other players' cards", baseHealth: 3, baseAmmo: 2),
        Character(id: UUID().uuidString, name: "Sniper", ability: "Can attack from distance", baseHealth: 3, baseAmmo: 1),
        Character(id: UUID().uuidString, name: "Tank", ability: "Has extra health", baseHealth: 5, baseAmmo: 1),
        Character(id: UUID().uuidString, name: "Assassin", ability: "Can eliminate players silently", baseHealth: 3, baseAmmo: 2)
    ]
}

struct Player: Identifiable, Codable {
    let id: String
    let userId: String
    let username: String
    var role: GameRole?
    var character: Character?
    var selectedCharacter: Character?
    var characterOptions: [Character]?
    var health: Int
    var maxHealth: Int
    var ammo: Int
    var isReady: Bool
    var hand: [GameCard]
    var equipment: [GameCard]
    var attackRange: Int
    var hasPlayedFirefight: Bool
    
    init(userId: String, username: String) {
        self.id = UUID().uuidString
        self.userId = userId
        self.username = username
        self.health = 0
        self.maxHealth = 0
        self.ammo = 0
        self.isReady = false
        self.hand = []
        self.equipment = []
        self.attackRange = 1
        self.hasPlayedFirefight = false
    }
    
    var canBeTargeted: Bool {
        health > 0
    }
    
    mutating func applyDamage(_ amount: Int) {
        health = max(0, health - amount)
    }
    
    mutating func heal(_ amount: Int) {
        health = min(maxHealth, health + amount)
    }
} 