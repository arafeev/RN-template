import SwiftUI

class GamePlayViewModel: ObservableObject {
    @Published private(set) var game: Game
    @Published var timeRemaining = 30 // seconds per turn
    @Published var selectedCard: GameCard?
    @Published var selectedTarget: Player?
    @Published var showingDiscardSelection = false
    
    private let authViewModel: AuthViewModel
    private var timer: Timer?
    
    var currentPlayer: Player? {
        game.players.first { $0.userId == currentUserId }
    }
    
    var isCurrentPlayerTurn: Bool {
        game.players[game.currentPlayerIndex].userId == currentUserId
    }
    
    var topPlayer: Player? {
        let players = game.players
        guard players.count >= 3 else { return nil }
        return players[(game.currentPlayerIndex + 2) % players.count]
    }
    
    var leftPlayer: Player? {
        let players = game.players
        guard players.count >= 4 else { return nil }
        return players[(game.currentPlayerIndex + 1) % players.count]
    }
    
    var rightPlayer: Player? {
        let players = game.players
        guard players.count >= 4 else { return nil }
        return players[(game.currentPlayerIndex + 3) % players.count]
    }
    
    private var currentUserId: String {
        authViewModel.currentUser?.id ?? UUID().uuidString
    }
    
    init(game: Game, authViewModel: AuthViewModel) {
        self.game = game
        self.authViewModel = authViewModel
        
        // Initialize deck if not already done
        if game.deck.isEmpty {
            var updatedGame = game
            updatedGame.initializeDeck()
            self.game = updatedGame
        }
        
        startTurn()
    }
    
    func isPlayerTurn(_ player: Player) -> Bool {
        game.players[game.currentPlayerIndex].id == player.id
    }
    
    func handleCardTap(_ card: GameCard) {
        guard isCurrentPlayerTurn else { return }
        
        if selectedCard?.id == card.id {
            // Deselect card
            selectedCard = nil
            selectedTarget = nil
        } else {
            // Select card
            selectedCard = card
            selectedTarget = nil
            
            // If card doesn't need a target, play it immediately
            if !needsTarget(card) {
                playCard(card)
                selectedCard = nil
            }
        }
    }
    
    func handlePlayerTap(_ player: Player) {
        guard isCurrentPlayerTurn,
              let card = selectedCard,
              canTarget(player) else { return }
        
        playCard(card, targeting: player.userId)
        selectedCard = nil
        selectedTarget = nil
    }
    
    private func needsTarget(_ card: GameCard) -> Bool {
        switch card.type {
        case .weapon: return true
        case .defense: return false
        case .equipment: return false
        case .action: return card.effect == .special("Kidnap")
        }
    }
    
    func canTarget(_ player: Player) -> Bool {
        guard let currentPlayer = currentPlayer,
              let selectedCard = selectedCard else { return false }
        
        // Can't target self with attacks
        if selectedCard.type == .weapon && player.userId == currentUserId {
            return false
        }
        
        // Check range for attack cards
        if selectedCard.type == .weapon {
            let distance = getDistance(from: currentPlayer, to: player)
            return distance <= (currentPlayer.attackRange + selectedCard.range)
        }
        
        // For special cards like Dirty Ties, check distance of 1
        if selectedCard.effect == .special("Kidnap") {
            let distance = getDistance(from: currentPlayer, to: player)
            return distance <= 1
        }
        
        return true
    }
    
    private func getDistance(from player1: Player, to player2: Player) -> Int {
        let index1 = game.players.firstIndex(where: { $0.id == player1.id }) ?? 0
        let index2 = game.players.firstIndex(where: { $0.id == player2.id }) ?? 0
        
        let clockwiseDistance = (index2 - index1 + game.players.count) % game.players.count
        let counterclockwiseDistance = (index1 - index2 + game.players.count) % game.players.count
        
        return min(clockwiseDistance, counterclockwiseDistance)
    }
    
    func discardCard(_ card: GameCard) {
        guard let currentPlayer = currentPlayer,
              let cardIndex = currentPlayer.hand.firstIndex(where: { $0.id == card.id }) else { return }
        
        var updatedGame = game
        updatedGame.players[game.currentPlayerIndex].hand.remove(at: cardIndex)
        updatedGame.discardPile.append(card)
        game = updatedGame
        
        // Check if we still need to discard
        if currentPlayer.hand.count <= currentPlayer.health {
            endTurn()
        }
    }
    
    func endTurn() {
        timer?.invalidate()
        
        var updatedGame = game
        updatedGame.endTurn()
        game = updatedGame
        
        if isCurrentPlayerTurn {
            startTurn()
        }
    }
    
    func playCard(_ card: GameCard, targeting targetId: String? = nil) {
        guard isCurrentPlayerTurn,
              let currentPlayer = currentPlayer else { return }
        
        var updatedGame = game
        
        // Check if the card can be played
        if !updatedGame.canPlayCard(card, by: currentPlayer) {
            print("❌ Cannot play card: \(card.name)")
            return
        }
        
        // Play the card
        if updatedGame.playCard(card, from: currentUserId, targeting: targetId) {
            print("✅ Played card: \(card.name)")
            
            // Update weapon usage flag
            if card.type == .weapon {
                let playerIndex = updatedGame.players.firstIndex(where: { $0.userId == currentUserId })!
                updatedGame.players[playerIndex].hasPlayedFirefight = true
            }
            
            // Move to discarding phase if hand is too large
            if currentPlayer.hand.count > currentPlayer.health {
                updatedGame.currentPhase = .discarding
            }
            
            game = updatedGame
        } else {
            print("❌ Failed to play card: \(card.name)")
        }
    }
    
    private func startTurn() {
        guard isCurrentPlayerTurn else { return }
        
        timer?.invalidate()
        timeRemaining = 30
        
        // Start with drawing phase
        game.currentPhase = .drawingCards
        
        // Draw 2 cards at the start of turn
        var updatedGame = game
        _ = updatedGame.drawCards(2, for: currentUserId)
        game = updatedGame
        
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            
            if self.timeRemaining > 0 {
                self.timeRemaining -= 1
            } else {
                self.endTurn()
            }
        }
    }
    
    deinit {
        timer?.invalidate()
    }
} 