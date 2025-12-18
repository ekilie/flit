# Audio Player Implementation

This document describes the comprehensive audio player system implemented for the Listen mobile app.

## Overview

A fully functional global audio player system with support for:
- Posts with audio content
- Podcasts with episodes
- Audiobooks with chapters
- Voice memos
- Audio reels (infinite scroll)
- Queue management
- Background playback
- Sleep timer
- Playback speed control
- Progress persistence

## Recent Updates (expo-audio Migration)

### 🔄 Migration from expo-av to expo-audio
- ✅ **Main audio player** now uses `expo-audio` instead of deprecated `expo-av`
- ✅ **Unified audio coordination** - Both main player and global player share state
- ✅ **Single audio instance** - Only one audio can play at a time across the entire app
- ✅ **Removed duplicate MiniPlayer instances** - Now only renders once in core layout

### Key Changes
1. `useAudioPlayer` hook migrated from expo-av to expo-audio
2. Shared global state between `useAudioPlayer` and `useGlobalAudioPlayer`
3. Automatic audio source switching - starting one player stops all others
4. Single MiniPlayer instance in `app/(core)/_layout.tsx`
5. Removed custom mini player from infinite scroll screen

## Architecture

### Core Components

#### 1. Audio Store (`stores/audioPlayer.ts`)
Central Zustand store managing:
- Current playing item
- Playback queue
- Playback state (playing, paused, position, duration)
- Playback settings (volume, speed, repeat, shuffle)
- Sleep timer
- Progress history for resume functionality

#### 2. Audio Player Hook (`hooks/useAudioPlayer.ts`)
**Now uses expo-audio** integrating with the audio store:
- Audio playback control (play, pause, seek)
- Queue management
- Volume and speed control
- Sleep timer management
- Haptic feedback integration
- Progress tracking
- **Global coordination** with other audio players

#### 3. Global Audio Player Hook (`hooks/use-global-audioi-player.ts`)
Used for short-form audio content (posts, reels):
- Lightweight player for individual audio items
- Shared global state prevents audio overlap
- Auto-coordination with main audio player
- Used in PostItem, infinite scroll, etc.

#### 4. Specialized Player Hooks

**Audiobook Player** (`hooks/useAudiobookPlayer.ts`)
- Chapter management
- Chapter navigation
- Progress sync with API
- Resume from last position

**Podcast Player** (`hooks/usePodcastPlayer.ts`)
- Episode queue management
- Episode navigation
- Progress sync with API

### UI Components

#### 1. MiniPlayer (`components/player/MiniPlayer.tsx`)
- **Single instance** - Only rendered in `app/(core)/_layout.tsx`
- Floating player bar visible across the app
- Shows current playing item
- Basic controls (play/pause, next, previous)
- Tap to open full player
- Auto-hides when no audio is playing
- **No longer duplicated** in tabs layout or ScreenLayout

#### 2. Full Player (`app/(core)/(modals)/full-player.tsx`)
- Full-screen modal player interface
- Artwork display
- Progress slider with time display
- Full playback controls
- Queue view modal
- Speed control modal
- Volume slider
- Sleep timer button
- Repeat and shuffle toggles

#### 3. Integration Components

**AudiobookPlayerButton** (`components/player/AudiobookPlayerButton.tsx`)
- Easy-to-use play button for audiobooks
- Chapter selection modal
- Current chapter indicator
- Loading states

**PodcastEpisodePlayerButton** (`components/player/PodcastEpisodePlayerButton.tsx`)
- Play button for podcast episodes
- Icon and full button variants
- Current episode indicator

**SleepTimerModal** (`components/player/SleepTimerModal.tsx`)
- Sleep timer configuration
- Preset durations (5, 10, 15, 30, 45, 60 minutes)
- End of track option
- Active timer display with countdown

### Audio Coordination System

The app uses a **shared global state** to ensure only one audio plays at a time:

```typescript
// Exported from use-global-audioi-player.ts
export function setSharedGlobalPlayer(player: any, uri: string | null);
export function getSharedGlobalPlayer(): { player, uri };
```

**How it works:**
1. When main audio player starts → stops any post/reel audio
2. When post/reel audio starts → stops main player
3. Both hooks check and update shared global state
4. Result: **No audio overlap anywhere in the app**

### Utilities

#### Audio Utils (`lib/audioUtils.ts`)
Helper functions for:
- Converting API types to queue items
- Duration parsing and formatting
- Progress calculation
- Type-safe audio item creation

## Usage Examples

### Playing an Audiobook

```typescript
import { useAudiobookPlayer } from '@/hooks/useAudiobookPlayer';

function AudiobookScreen() {
  const { playAudiobook } = useAudiobookPlayer();
  
  const handlePlay = async () => {
    await playAudiobook(audiobook, chapterIndex);
  };
  
  // Or use the component
  return <AudiobookPlayerButton audiobook={audiobook} />;
}
```

### Playing a Podcast Episode

```typescript
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';

function PodcastScreen() {
  const { playPodcastEpisode } = usePodcastPlayer();
  
  const handlePlay = async () => {
    await playPodcastEpisode(episode, podcast, allEpisodes);
  };
  
  // Or use the component
  return (
    <PodcastEpisodePlayerButton 
      episode={episode}
      podcast={podcast}
      allEpisodes={episodes}
      variant="full"
    />
  );
}
```

### Using the Base Audio Player

```typescript
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { postAudioToQueueItem } from '@/lib/audioUtils';

function PostAudioPlayer() {
  const { playItem, togglePlayPause, isPlaying } = useAudioPlayer();
  
  const handlePlay = async () => {
    const queueItem = postAudioToQueueItem(
      post.id,
      post.text,
      post.audio_url,
      post.duration,
      post.user.name
    );
    await playItem(queueItem, [queueItem]);
  };
}
```

### Managing Queue

```typescript
const {
  queue,
  addToQueue,
  addMultipleToQueue,
  removeFromQueue,
  clearQueue,
  skipToQueueItem,
} = useAudioPlayer();

// Add single item
addToQueue(queueItem);

// Add multiple items
addMultipleToQueue([item1, item2, item3]);

// Skip to specific item
skipToQueueItem(2); // Skip to index 2
```

### Setting Sleep Timer

```typescript
const { setSleepTimer, clearSleepTimer, sleepTimerEndTime } = useAudioPlayer();

// Set 30 minute timer
setSleepTimer(30);

// Clear timer
clearSleepTimer();

// Check remaining time
const remaining = sleepTimerEndTime - Date.now();
```

## Features

### ✅ Implemented

1. **Core Playback**
   - Play/pause/stop controls
   - Seek to position
   - Next/previous track
   - Volume control
   - Playback speed (0.25x - 3x)

2. **Queue Management**
   - Add/remove items
   - Reorder queue
   - Skip to specific item
   - Shuffle mode
   - Repeat modes (off, one, all)

3. **Progress Persistence**
   - Save playback position
   - Resume from last position
   - Sync with API for audiobooks/podcasts

4. **UI Components**
   - Global MiniPlayer
   - Full-screen player
   - Integration buttons
   - Sleep timer modal

5. **Advanced Features**
   - Sleep timer with presets
   - Chapter navigation (audiobooks)
   - Episode queue (podcasts)
   - Background audio support (iOS)
   - Haptic feedback

### 🔄 Integration Points

- **Settings Store**: Integrates with haptics and audio quality settings
- **API Layer**: Progress sync for audiobooks and podcasts
- **Existing Hooks**: Works alongside useAudiobooks, usePodcasts
- **Theme System**: Respects app theme configuration

### 📱 Platform Support

- **iOS**: Full background audio support via UIBackgroundModes
- **Android**: Background playback ready
- **Web**: Basic playback support (no background mode)

## Configuration

### Background Audio (iOS)

Already configured in `app.json`:
```json
{
  "ios": {
    "infoPlist": {
      "UIBackgroundModes": ["audio"]
    }
  }
}
```

### Audio Session (expo-audio)

Configured in `useAudioPlayer.ts`:
```typescript
// expo-audio handles audio session automatically
// No manual audio mode setup needed
const player = useExpoAudioPlayer(currentUri ? { uri: currentUri } : null);
```

### Global State Coordination

Both audio hooks share state to prevent simultaneous playback:
```typescript
// In use-global-audioi-player.ts
let sharedGlobalPlayer: any = null;
let sharedGlobalPlayerUri: string | null = null;

export function setSharedGlobalPlayer(player: any, uri: string | null);
export function getSharedGlobalPlayer();
```

## File Structure

```
├── stores/
│   └── audioPlayer.ts           # Zustand store
├── hooks/
│   ├── useAudioPlayer.ts        # Main audio hook (expo-audio)
│   ├── use-global-audioi-player.ts  # Global audio hook with shared state
│   ├── useAudiobookPlayer.ts    # Audiobook integration
│   └── usePodcastPlayer.ts      # Podcast integration
├── components/
│   └── ScreenLayout.tsx         # No longer includes MiniPlayer
├── components/player/
│   ├── MiniPlayer.tsx           # Single floating player bar
│   ├── AudiobookPlayerButton.tsx
│   ├── PodcastEpisodePlayerButton.tsx
│   └── SleepTimerModal.tsx
├── app/(core)/
│   ├── _layout.tsx              # Contains single MiniPlayer instance
│   ├── (tabs)/_layout.tsx       # No longer has MiniPlayer
│   └── (modals)/
│       └── full-player.tsx      # Full-screen player modal
└── lib/
    └── audioUtils.ts            # Utility functions
```

## Testing

To test the audio player:

1. Navigate to audiobooks or podcasts screen
2. Use the player buttons on any content
3. Verify MiniPlayer appears at bottom
4. Tap MiniPlayer to open full player
5. Test all controls (play/pause, seek, next/previous)
6. Test queue view and chapter/episode selection
7. Test sleep timer
8. Test playback speed control

## Future Enhancements

Potential improvements:
- [ ] Notification controls (media session API)
- [ ] Download management for offline playback
- [ ] Audio visualization/waveform
- [ ] Crossfade between tracks
- [ ] Equalizer settings
- [ ] Playlist creation and management
- [ ] Social sharing of current track
- [ ] Lyrics display
- [ ] CarPlay integration (iOS)
- [ ] Android Auto integration

## Troubleshooting

### Audio won't play
- Check audio URL is valid and accessible
- Verify network connection
- Check device volume settings
- Ensure audio session is properly configured

### Background playback not working
- Verify UIBackgroundModes is set in app.json (iOS)
- Check Audio.setAudioModeAsync configuration
- Test with development build (not Expo Go)

### Progress not syncing
- Check network connection
- Verify API endpoints are accessible
- Check authentication token is valid

## Dependencies

- `expo-audio`: **Primary audio playback library** (replaces expo-av)
- `zustand`: State management
- `@react-native-async-storage/async-storage`: Persistence
- `expo-haptics`: Haptic feedback
- `expo-blur`: UI effects
- `expo-linear-gradient`: UI styling
- `expo-image`: Image optimization

**Note:** `expo-av` was removed as it's deprecated. All audio functionality now uses `expo-audio`.

## Migration Notes

### Migrating from expo-av to expo-audio

If you encounter any issues related to the migration:

1. **Check player instance**: expo-audio's player has a slightly different API
   - `player.playing` instead of `status.isPlaying`
   - `player.currentTime` instead of `status.positionMillis`
   - `player.duration` instead of `status.durationMillis`

2. **Seek behavior**: Use `player.seekTo(seconds)` directly (no milliseconds conversion)

3. **Playback rate**: Currently handled via player properties, may need updates for full support

4. **Volume control**: Direct property assignment `player.volume = value`

### Troubleshooting Audio Coordination

If you experience multiple audio streams playing simultaneously:

1. Check that both hooks import shared state functions
2. Verify `setSharedGlobalPlayer` is called when starting playback
3. Ensure `getSharedGlobalPlayer` is checked before playing
4. Look for any direct expo-audio usage not going through hooks

## Contributing

When adding new audio types or features:
1. Add type to `AudioType` in audioPlayer.ts
2. Create conversion function in audioUtils.ts
3. Add specialized hook if needed
4. Create integration component
5. Update this documentation
