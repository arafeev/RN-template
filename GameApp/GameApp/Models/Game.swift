import Foundation
import SwiftUI

// MARK: - Game Model
struct Game: Identifiable, Codable {
    let id: String
    let name: String
    let hostId: String
    let maxPlayers: Int
    var players: [Player]
    var status: GameStatus
    let createdAt: Date
    var roles: [GameRole]?
    var currentPhase: GamePhase
    var currentPlayerIndex: Int
    var deck: [GameCard]
    var discardPile: [GameCard]
    var activeEffects: [ActiveEffect]
    
    init(name: String, hostId: String, maxPlayers: Int, hostUsername: String) {
        self.id = UUID().uuidString
        self.name = name
        self.hostId = hostId
        self.maxPlayers = maxPlayers
        self.players = [Player(userId: hostId, username: hostUsername)]
        self.status = .waiting
        self.createdAt = Date()
        self.currentPhase = .waiting
        self.currentPlayerIndex = 0
        self.deck = []
        self.discardPile = []
        self.activeEffects = []
    }
    
    mutating func initializeDeck() {
        // Initialize with game cards
        deck = GameCard.createInitialDeck()
        deck.shuffle()
    }
    
    mutating func drawCards(_ count: Int, for playerId: String) -> [GameCard] {
        guard let playerIndex = players.firstIndex(where: { $0.userId == playerId }) else { return [] }
        var drawnCards: [GameCard] = []
        
        for _ in 0..<count {
            if deck.isEmpty {
                reshuffleDeck()
            }
            
            if let card = deck.popLast() {
                drawnCards.append(card)
                players[playerIndex].hand.append(card)
            }
        }
        
        return drawnCards
    }
    
    private mutating func reshuffleDeck() {
        deck = discardPile.shuffled()
        discardPile.removeAll()
    }
    
    mutating func playCard(_ card: GameCard, from playerId: String, targeting targetId: String? = nil) -> Bool {
        guard let playerIndex = players.firstIndex(where: { $0.userId == playerId }),
              let cardIndex = players[playerIndex].hand.firstIndex(where: { $0.id == card.id }) else {
            return false
        }
        
        // Check if the card can be played
        if !canPlayCard(card, by: players[playerIndex]) {
            return false
        }
        
        // Remove card from hand
        players[playerIndex].hand.remove(at: cardIndex)
        
        // Apply card effect
        applyCardEffect(card, from: players[playerIndex], targeting: targetId)
        
        // Add to discard pile
        discardPile.append(card)
        
        return true
    }
    
    func canPlayCard(_ card: GameCard, by player: Player) -> Bool {
        // Check if player has already played a Firefight card this turn
        if card.type == .weapon {
            if player.hasPlayedFirefight {
                return false
            }
        }
        
        // Check for duplicate equipment
        if card.type == .equipment {
            if player.equipment.contains(where: { $0.name == card.name }) {
                return false
            }
        }
        
        return true
    }
    
    private mutating func applyCardEffect(_ card: GameCard, from player: Player, targeting targetId: String?) {
        switch card.effect {
        case .damage(let amount):
            if let targetId = targetId,
               let targetIndex = players.firstIndex(where: { $0.userId == targetId }) {
                players[targetIndex].health -= amount
            }
        case .heal(let amount):
            if let playerIndex = players.firstIndex(where: { $0.userId == player.userId }) {
                players[playerIndex].health = min(players[playerIndex].health + amount, player.maxHealth)
            }
        case .draw(let amount):
            _ = drawCards(amount, for: player.userId)
        case .shield:
            activeEffects.append(ActiveEffect(type: .shield, playerId: player.userId, duration: 1))
        case .range(let distance):
            if let playerIndex = players.firstIndex(where: { $0.userId == player.userId }) {
                players[playerIndex].attackRange += distance
            }
        case .special(let effect):
            handleSpecialEffect(effect, for: player.userId, targeting: targetId)
        }
    }
    
    private mutating func handleSpecialEffect(_ effect: String, for playerId: String, targeting targetId: String?) {
        // Implement special card effects here
    }
    
    mutating func endTurn() {
        // Check if player needs to discard
        let currentPlayer = players[currentPlayerIndex]
        if currentPlayer.hand.count > currentPlayer.health {
            currentPhase = .discarding
            return
        }
        
        // Move to next player
        currentPlayerIndex = (currentPlayerIndex + 1) % players.count
        currentPhase = .drawingCards
        
        // Reset turn-based flags
        players[currentPlayerIndex].hasPlayedFirefight = false
        
        // Remove expired effects
        activeEffects.removeAll { $0.duration <= 0 }
        activeEffects = activeEffects.map { effect in
            var updated = effect
            updated.duration -= 1
            return updated
        }
    }
    
    mutating func addPlayer(_ player: Player) -> Bool {
        guard players.count < maxPlayers else { return false }
        players.append(player)
        if players.count == maxPlayers {
            status = .preparing
            currentPhase = .roleDistribution
            roles = GameRole.rolesForPlayerCount(maxPlayers)
        }
        return true
    }
    
    mutating func distributeRoles() {
        guard let roles = roles, roles.count == players.count else { return }
        var shuffledRoles = roles.shuffled()
        // Ensure Don is revealed
        if let donIndex = shuffledRoles.firstIndex(of: .don) {
            shuffledRoles.swapAt(0, donIndex)
        }
        
        for i in 0..<players.count {
            players[i].role = shuffledRoles[i]
        }
        currentPhase = .characterSelection
        distributeCharacters()
    }
    
    mutating func distributeCharacters() {
        let allCharacters = Character.allCharacters
        for i in 0..<players.count {
            let shuffledCharacters = allCharacters.shuffled()
            players[i].characterOptions = Array(shuffledCharacters.prefix(2))
        }
    }
    
    mutating func selectCharacter(playerId: String, character: Character) {
        guard let playerIndex = players.firstIndex(where: { $0.id == playerId }) else { return }
        players[playerIndex].selectedCharacter = character
        players[playerIndex].health = character.baseHealth
        players[playerIndex].ammo = character.baseAmmo
        
        // If player is Don, add extra ammo
        if players[playerIndex].role == .don {
            players[playerIndex].ammo += 1
        }
        
        players[playerIndex].isReady = true
        
        // Check if all players have selected their characters
        if players.allSatisfy({ $0.isReady }) {
            status = .inProgress
            currentPhase = .drawingCards
            initializeDeck()
        }
    }
}

// MARK: - Game Status
enum GameStatus: String, Codable {
    case waiting = "Waiting"
    case preparing = "Preparing"
    case inProgress = "In Progress"
    case completed = "Completed"
    
    var color: Color {
        switch self {
        case .waiting: return .green
        case .preparing: return .orange
        case .inProgress: return .blue
        case .completed: return .gray
        }
    }
}

// MARK: - Game Phase
enum GamePhase: String, Codable {
    case waiting = "Waiting for Players"
    case roleDistribution = "Distributing Roles"
    case characterSelection = "Character Selection"
    case drawingCards = "Drawing Cards"
    case playingCards = "Playing Cards"
    case playing = "Playing"
    case discarding = "Discarding Cards"
    case finished = "Game Finished"
}

struct ActiveEffect: Codable {
    let type: EffectType
    let playerId: String
    var duration: Int
}

enum EffectType: Codable {
    case shield
    case rangeBoost
    case damageBoost
    case custom(String)
} 