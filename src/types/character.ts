export interface Character {
    id: string;
    name: string;
    role: string;
    hp: number;
    specialAbility: string;
    secretRole: string;
    image: any; // TODO: Replace with proper image type when assets are added
    stats: {
        attack: number;
        defense: number;
        speed: number;
    };
    abilityType: 'active' | 'passive';
    abilityUses: 'once' | 'per_turn' | 'per_round' | 'permanent';
    difficulty: 1 | 2 | 3; // 1 = Easy, 2 = Medium, 3 = Hard
    faction: 'mafia' | 'neutral' | 'fbi';
    background: string;
} 