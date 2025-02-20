import SwiftUI

struct GamePlayView: View {
    @StateObject private var viewModel: GamePlayViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var showingCharacterInfo = false
    @State private var selectedInfoPlayer: Player?
    
    init(game: Game, authViewModel: AuthViewModel) {
        _viewModel = StateObject(wrappedValue: GamePlayViewModel(game: game, authViewModel: authViewModel))
    }
    
    var body: some View {
        ZStack {
            // Background
            Color(.systemBackground)
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Phase and timer header
                HStack {
                    Spacer()
                    Text(viewModel.game.currentPhase.rawValue)
                        .font(.headline)
                    Spacer()
                    Text("\(viewModel.timeRemaining)s")
                        .foregroundColor(viewModel.isCurrentPlayerTurn ? .yellow : .secondary)
                }
                .padding()
                
                // Game area
                ZStack {
                    // Top player
                    if let player = viewModel.topPlayer {
                        PlayerView(player: player,
                                 position: .top,
                                 isCurrentTurn: viewModel.isPlayerTurn(player),
                                 canBeTargeted: viewModel.canTarget(player),
                                 onTap: { viewModel.handlePlayerTap(player) },
                                 onInfoTap: { selectedInfoPlayer = player })
                            .frame(width: 120)
                            .position(x: UIScreen.main.bounds.width / 2, y: 80)
                    }
                    
                    // Left player
                    if let player = viewModel.leftPlayer {
                        PlayerView(player: player,
                                 position: .left,
                                 isCurrentTurn: viewModel.isPlayerTurn(player),
                                 canBeTargeted: viewModel.canTarget(player),
                                 onTap: { viewModel.handlePlayerTap(player) },
                                 onInfoTap: { selectedInfoPlayer = player })
                            .frame(width: 120)
                            .position(x: 60, y: UIScreen.main.bounds.height / 2 - 100)
                    }
                    
                    // Right player
                    if let player = viewModel.rightPlayer {
                        PlayerView(player: player,
                                 position: .right,
                                 isCurrentTurn: viewModel.isPlayerTurn(player),
                                 canBeTargeted: viewModel.canTarget(player),
                                 onTap: { viewModel.handlePlayerTap(player) },
                                 onInfoTap: { selectedInfoPlayer = player })
                            .frame(width: 120)
                            .position(x: UIScreen.main.bounds.width - 60, y: UIScreen.main.bounds.height / 2 - 100)
                    }
                    
                    // Center game area
                    VStack(spacing: 20) {
                        // Last played card
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .foregroundColor(Color.gray.opacity(0.1))
                                .frame(width: 100, height: 140)
                            
                            if let lastCard = viewModel.game.discardPile.last {
                                CardView(card: lastCard, isEnabled: false)
                            } else {
                                Text("No cards\nplayed")
                                    .multilineTextAlignment(.center)
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        // Deck
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .foregroundColor(Color.blue.opacity(0.1))
                                .frame(width: 100, height: 140)
                            
                            VStack {
                                Image(systemName: "rectangle.stack.fill")
                                    .font(.title)
                                Text("\(viewModel.game.deck.count)")
                                    .font(.caption)
                            }
                            .foregroundColor(.blue)
                        }
                    }
                    .position(x: UIScreen.main.bounds.width / 2, y: UIScreen.main.bounds.height / 2 - 100)
                }
                
                Spacer()
                
                // Current player stats
                if let currentPlayer = viewModel.currentPlayer {
                    HStack(spacing: 20) {
                        // Health
                        HStack {
                            Image(systemName: "heart.fill")
                                .foregroundColor(.red)
                            Text("\(currentPlayer.health)/\(currentPlayer.maxHealth)")
                                .foregroundColor(.red)
                        }
                        
                        // Ammo
                        HStack {
                            Image(systemName: "star.circle.fill")
                                .foregroundColor(.orange)
                            Text("\(currentPlayer.ammo)")
                                .foregroundColor(.orange)
                        }
                        
                        // Range
                        HStack {
                            Image(systemName: "scope")
                                .foregroundColor(.blue)
                            Text("\(currentPlayer.attackRange)")
                                .foregroundColor(.blue)
                        }
                    }
                    .padding(.vertical, 8)
                    
                    // Hand cards
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(currentPlayer.hand, id: \.id) { card in
                                CardView(card: card,
                                        isSelected: viewModel.selectedCard?.id == card.id,
                                        isEnabled: viewModel.isCurrentPlayerTurn)
                                    .onTapGesture {
                                        viewModel.handleCardTap(card)
                                    }
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                    .frame(height: 160)
                }
            }
        }
        .sheet(item: $selectedInfoPlayer) { player in
            CharacterInfoView(player: player)
        }
    }
}

struct CharacterInfoView: View {
    let player: Player
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Character info
                if let character = player.selectedCharacter {
                    Text(character.name)
                        .font(.title)
                    
                    Text(character.ability)
                        .multilineTextAlignment(.center)
                        .padding()
                    
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Base Health: \(character.baseHealth)")
                        Text("Base Ammo: \(character.baseAmmo)")
                    }
                }
                
                // Role info
                if let role = player.role {
                    Text(role.rawValue)
                        .font(.title2)
                        .padding(.top)
                }
                
                Spacer()
            }
            .padding()
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct PlayerView: View {
    let player: Player
    let position: PlayerPosition
    let isCurrentTurn: Bool
    let canBeTargeted: Bool
    let onTap: () -> Void
    let onInfoTap: () -> Void
    
    var body: some View {
        VStack(spacing: 4) {
            // Avatar
            ZStack {
                Circle()
                    .foregroundColor(isCurrentTurn ? .yellow.opacity(0.2) : .gray.opacity(0.2))
                    .frame(width: 40, height: 40)
                
                Image(systemName: "person.fill")
                    .foregroundColor(isCurrentTurn ? .yellow : .gray)
                
                if player.role == .don {
                    Image(systemName: "crown.fill")
                        .foregroundColor(.yellow)
                        .offset(y: -25)
                }
            }
            
            // Card placeholders
            HStack(spacing: 4) {
                ForEach(0..<3) { _ in
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                        .frame(width: 20, height: 30)
                }
            }
            .padding(.vertical, 4)
            
            // Equipment cards (shown as small icons)
            if !player.equipment.isEmpty {
                HStack(spacing: 2) {
                    ForEach(player.equipment) { card in
                        Image(systemName: symbolForCard(card))
                            .font(.caption2)
                            .foregroundColor(.green)
                            .frame(width: 15, height: 15)
                    }
                }
            }
            
            // Stats
            HStack(spacing: 8) {
                Label("\(player.health)", systemImage: "heart.fill")
                    .font(.caption2)
                    .foregroundColor(.red)
                Label("\(player.hand.count)", systemImage: "rectangle.stack")
                    .font(.caption2)
                    .foregroundColor(.blue)
            }
        }
        .padding(8)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .foregroundColor(canBeTargeted ? Color.blue.opacity(0.1) : Color.clear)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .strokeBorder(canBeTargeted ? Color.blue : Color.clear, lineWidth: 2)
                )
        )
        .rotationEffect(position.rotation)
        .onTapGesture(perform: onTap)
    }
    
    private func symbolForCard(_ card: GameCard) -> String {
        switch card.type {
        case .weapon: return "burst.fill"
        case .defense: return "shield.fill"
        case .equipment: return "gear"
        case .action: return "bolt.fill"
        }
    }
}

struct CardView: View {
    let card: GameCard
    var isSelected: Bool = false
    var isEnabled: Bool = true
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 10)
                .fill(backgroundColor)
                .frame(width: 100, height: 140)
            
            VStack(spacing: 8) {
                Text(card.name)
                    .font(.caption)
                    .bold()
                
                Image(systemName: symbolForCard)
                    .font(.title2)
                
                Text(card.description)
                    .font(.caption2)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 4)
                
                if card.type == .weapon {
                    Text("Range: \(card.range)")
                        .font(.caption2)
                }
            }
            .foregroundColor(isEnabled ? .primary : .secondary)
        }
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(isSelected ? Color.blue : Color.clear, lineWidth: 2)
        )
    }
    
    private var backgroundColor: Color {
        if !isEnabled {
            return Color.gray.opacity(0.2)
        }
        switch card.type {
        case .weapon:
            return Color.red.opacity(0.2)
        case .defense:
            return Color.blue.opacity(0.2)
        case .equipment:
            return Color.green.opacity(0.2)
        case .action:
            return Color.orange.opacity(0.2)
        }
    }
    
    private var symbolForCard: String {
        switch card.type {
        case .weapon:
            return "burst.fill"
        case .defense:
            return "shield.fill"
        case .equipment:
            return "gear"
        case .action:
            return "bolt.fill"
        }
    }
}

enum PlayerPosition {
    case top, left, right
    
    var rotation: Angle {
        switch self {
        case .top: return .degrees(180)
        case .left: return .degrees(90)
        case .right: return .degrees(-90)
        }
    }
}

#Preview {
    let authViewModel = AuthViewModel()
    var game = Game(name: "Test Game", hostId: "host1", maxPlayers: 4, hostUsername: "Host")
    
    // Add test players
    game.addPlayer(Player(userId: "player2", username: "Player 2"))
    game.addPlayer(Player(userId: "player3", username: "Player 3"))
    game.addPlayer(Player(userId: "player4", username: "Player 4"))
    
    // Initialize the game
    game.status = .inProgress
    game.currentPhase = .playingCards
    game.initializeDeck()
    
    // Distribute roles and characters
    game.distributeRoles()
    
    // Draw some cards for players
    _ = game.drawCards(5, for: "host1")
    _ = game.drawCards(5, for: "player2")
    _ = game.drawCards(5, for: "player3")
    _ = game.drawCards(5, for: "player4")
    
    return GamePlayView(game: game, authViewModel: authViewModel)
} 
