import Foundation

struct GameCard: Identifiable, Codable {
    let id: String
    let type: CardType
    let name: String
    let effect: CardEffect
    let description: String
    let range: Int
    
    init(type: CardType, name: String, effect: CardEffect, description: String, range: Int = 1) {
        self.id = UUID().uuidString
        self.type = type
        self.name = name
        self.effect = effect
        self.description = description
        self.range = range
    }
    
    static func createInitialDeck() -> [GameCard] {
        var deck: [GameCard] = []
        
        // Weapons
        deck += [
            GameCard(type: .weapon, name: "Revolver", effect: .damage(1), description: "Basic weapon", range: 1),
            GameCard(type: .weapon, name: "Shotgun", effect: .damage(2), description: "Powerful close-range weapon", range: 1),
            GameCard(type: .weapon, name: "Rifle", effect: .damage(1), description: "Long-range weapon", range: 2),
            GameCard(type: .weapon, name: "Double Barrel", effect: .special("Can shoot twice"), description: "Allows two shots per turn"),
        ]
        
        // Defense
        deck += [
            GameCard(type: .defense, name: "Behind the Barricade", effect: .shield, description: "Block an attack"),
            GameCard(type: .defense, name: "Dodge", effect: .shield, description: "Avoid being hit"),
        ]
        
        // Equipment
        deck += [
            GameCard(type: .equipment, name: "Scope", effect: .range(1), description: "Increase attack range by 1"),
            GameCard(type: .equipment, name: "Don's Cigar", effect: .heal(1), description: "Heal 1 health point"),
            GameCard(type: .equipment, name: "Golden Watch", effect: .draw(3), description: "Draw 3 cards"),
        ]
        
        // Actions
        deck += [
            GameCard(type: .action, name: "Shootout", effect: .damage(1), description: "Standard attack"),
            GameCard(type: .action, name: "Showdown", effect: .special("Duel"), description: "Challenge to a duel"),
            GameCard(type: .action, name: "Dirty Ties", effect: .special("Kidnap"), description: "Take a card from opponent"),
            GameCard(type: .action, name: "Bribe", effect: .special("Block next card"), description: "Prevent opponent from playing next card"),
        ]
        
        // Add multiple copies of common cards
        deck += deck.filter { $0.type == .defense || $0.name == "Revolver" }
        
        return deck
    }
}

enum CardType: String, Codable {
    case weapon
    case defense
    case equipment
    case action
}

enum CardEffect: Codable, Equatable {
    case damage(Int)
    case heal(Int)
    case draw(Int)
    case shield
    case range(Int)
    case special(String)
    
    var description: String {
        switch self {
        case .damage(let amount):
            return "Deal \(amount) damage"
        case .heal(let amount):
            return "Heal \(amount) HP"
        case .draw(let amount):
            return "Draw \(amount) cards"
        case .shield:
            return "Block next attack"
        case .range(let distance):
            return "Range: \(distance)"
        case .special(let effect):
            return effect
        }
    }
    
    static func == (lhs: CardEffect, rhs: CardEffect) -> Bool {
        switch (lhs, rhs) {
        case (.damage(let a), .damage(let b)):
            return a == b
        case (.heal(let a), .heal(let b)):
            return a == b
        case (.draw(let a), .draw(let b)):
            return a == b
        case (.shield, .shield):
            return true
        case (.range(let a), .range(let b)):
            return a == b
        case (.special(let a), .special(let b)):
            return a == b
        default:
            return false
        }
    }
} 