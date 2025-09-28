# Staff Hero - Architecture Documentation

## 🏗️ Project Structure

### Core Architecture Principles

1. **Separation of Concerns** - Business logic separated from UI components
2. **Component Reusability** - Shared UI components with consistent styling
3. **Type Safety** - Comprehensive TypeScript interfaces
4. **Performance** - Optimized animations using react-native-reanimated
5. **Testability** - Pure functions for business logic

## 📁 Directory Structure

```
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   └── _layout.tsx        # Root layout with navigation
├── components/
│   ├── game/              # Game-specific components
│   │   ├── answer-buttons.tsx    # Answer selection UI
│   │   ├── game-screen.tsx       # Main game orchestrator
│   │   ├── rhythm-hero.tsx       # Guitar Hero style mode
│   │   ├── sequence-game.tsx     # Note sequence mode
│   │   └── score-display.tsx     # Score and streak display
│   ├── modals/            # Modal dialogs
│   │   ├── game-mode-modal.tsx   # Game mode selection
│   │   └── settings-modal.tsx    # Settings configuration
│   ├── music/             # Music notation components
│   │   └── music-staff.tsx       # SVG-based staff rendering
│   ├── screens/           # Screen components
│   │   ├── analytics-screen.tsx  # Statistics and achievements
│   │   └── home-screen.tsx       # Main menu
│   └── ui/                # Reusable UI components
│       ├── button.tsx            # Standardized button component
│       ├── modal-header.tsx      # Modal header component
│       └── setting-option.tsx    # Settings option component
├── contexts/              # React Context for state management
│   └── game-context.tsx   # Global game state
├── types/                 # TypeScript type definitions
│   ├── analytics.ts       # Analytics and achievements types
│   ├── music.ts          # Core music and game types
│   └── note-symbols.ts   # Note symbol definitions
├── utils/                 # Business logic and utilities
│   ├── analytics-storage.ts     # Local storage for analytics
│   ├── game-logic.ts           # Pure game logic functions
│   ├── music-utils.ts          # Music theory utilities
│   ├── rhythm-logic.ts         # Rhythm game business logic
│   └── sequence-logic.ts       # Sequence game business logic
└── hooks/                 # Custom React hooks
    └── use-theme-color.ts  # Theme color management
```

## 🎮 Game Modes

### 1. Single Note Mode
- **Purpose**: Quick note identification practice
- **Mechanics**: One note at a time, immediate feedback
- **Timing**: 500ms delay for correct, 3000ms for incorrect
- **UI**: Minimal feedback, auto-advance

### 2. Sequence Mode
- **Purpose**: Multi-note identification in order
- **Mechanics**: Select notes in left-to-right sequence
- **Features**: Visual sequence building, reset capability
- **UI**: Sequence slots, progress indicators

### 3. Rhythm Hero Mode
- **Purpose**: Guitar Hero style timing game
- **Mechanics**: Notes move across staff, hit at target line
- **Features**: Accuracy scoring, disappearing effects
- **UI**: Moving musical notes, timing feedback

## 🎵 Music System

### Staff Positioning
- **Reference**: E4 (bottom line) = position 0
- **Calculation**: `e4LineY - ((staffPosition + 1) * (staffLineSpacing / 2))`
- **Range**: Extended with 3 ledger lines above and below
- **Notes**: D3 to C6 (19 different positions)

### Notation Systems
- **Letter Names**: C, D, E, F, G, A, B
- **Solfege**: Do, Re, Mi, Fa, Sol, La, Si
- **Default**: Solfege (beginner-friendly)

## 🔧 Technical Implementation

### State Management
- **Context**: React Context with useReducer for game state
- **Local Storage**: AsyncStorage for analytics and achievements
- **Performance**: Optimized re-renders with proper dependencies

### Animations
- **Library**: react-native-reanimated for 60fps performance
- **Patterns**: Pre-allocated animation values to avoid hook violations
- **Effects**: Note slide-ins, treble clef dancing, button press states

### Styling
- **Theme System**: Light/dark mode support with consistent colors
- **NativeWind**: Tailwind CSS integration for utility-first styling
- **Components**: Reusable styled components with variant support

## 📊 Analytics System

### Data Tracking
- **Game Sessions**: Score, accuracy, duration, difficulty
- **User Preferences**: Favorite modes, notation systems
- **Achievements**: Progressive unlocking system
- **Statistics**: Comprehensive analytics dashboard

### Storage
- **Local**: AsyncStorage for offline persistence
- **Format**: JSON with versioning for app updates
- **Privacy**: All data stored locally on device

## 🧪 Testing Strategy

### Business Logic
- **Pure Functions**: All game logic extracted to testable utilities
- **No Side Effects**: Logic functions don't modify external state
- **Deterministic**: Same inputs always produce same outputs

### Component Testing
- **Separation**: UI components focus on presentation only
- **Props**: Well-defined interfaces for component inputs
- **Mocking**: Business logic can be easily mocked for UI tests

## 🚀 Performance Optimizations

### Animations
- **Native Driver**: All animations use native driver when possible
- **Pre-allocation**: Animation values created once, reused
- **Cleanup**: Proper cleanup of timers and intervals

### Rendering
- **Memoization**: Strategic use of React.memo and useMemo
- **Lazy Loading**: Components loaded only when needed
- **SVG Optimization**: Efficient SVG rendering for musical notation

## 🔮 Future Enhancements

### Additional Note Types
- **Half Notes**: Minim symbols with stems
- **Quarter Notes**: Crotchet symbols with filled heads
- **Eighth Notes**: Quaver symbols with flags

### Advanced Features
- **Key Signatures**: Support for different key signatures
- **Time Signatures**: Rhythm patterns beyond 4/4
- **Bass Clef**: Additional clef support
- **Chord Recognition**: Harmonic interval training

### Multiplayer
- **Real-time**: WebSocket-based multiplayer sessions
- **Leaderboards**: Global and friend-based competitions
- **Collaborative**: Team-based learning modes
