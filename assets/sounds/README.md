# Audio assets

## rest-end.mp3

**Required for**: notification sound at the end of a workout's rest timer
(see [src/services/audioService.ts](../../src/services/audioService.ts)).

**Specs**:
- Format: `.mp3`
- Duration: ≤ 500ms (a "ding" or "ting", not a full sound)
- Volume: moderate (not saturated — the app plays at user volume)
- File path: `assets/sounds/rest-end.mp3` (exact name and location)

**Where to find a free sound**:
- [Mixkit](https://mixkit.co/free-sound-effects/notification/) — no attribution required
- [Freesound](https://freesound.org/) — attribution required
- Search terms: "ding", "ting", "notification short", "bell short"

**Recommended Mixkit picks** (verified free, no attribution):
- ["Software interface start"](https://mixkit.co/free-sound-effects/start/) — short and clean
- ["Bell notification"](https://mixkit.co/free-sound-effects/notification/) — typical "ding"

## What if the file is missing?

The `audioService.preloadRestEndSound()` is wrapped in try/catch and falls
back silently if the file doesn't exist or `expo-audio` isn't installed.
The vibration + haptic at the end of the rest timer will still trigger.
