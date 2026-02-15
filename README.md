# FifthsKeyboard
Webapp implementing a musical keyboard in the Circle of Fifths layout


Outer ring allows to play single notes. THe inner color tell whether note in natural/artificial as in a piano layout. The outer color provides tone affinity grade, where notes in proximity have more affinity. The note in the other side of the circle is the less affinity/tritone

Middle ring changes when key changes. Indicating the diatonic chords in the scale. When press the full chord is played. The outer color reflects the chord function tonic/green dominant/red or subdominant/yellow. 


# Drum Practice Trainer - Timing System Improvements

## Overview
This document explains the improved timing/scoring system that tracks user input and provides feedback on whether they're matching the target drum sheet and BPM.

## Key Improvements

### 1. **Beat-Based Timing Evaluation**
Instead of relying on absolute time which can drift, the system now evaluates hits based on the current beat position:

```javascript
function evaluateUserInput(midiNote, currentBeat) {
    const ppq = midiData.header.ppq / 2;
    const expectedTick = currentBeat * ppq;
    const toleranceTicks = ppq * beatTolerance;
    // ... evaluation logic
}
```

- **Current Beat Tracking**: `currentBeatPosition` is updated as the metronome advances
- **Tick-Based Matching**: Notes are matched based on MIDI ticks, not seconds
- **Tolerance Window**: 40% of a beat before/after (adjustable)

### 2. **Accuracy Scoring System**

Each successful hit is scored based on timing precision:

```javascript
const accuracy = Math.max(0, 100 - (tickDistance / toleranceTicks * 100));
scoreText.value = parseInt(scoreText.value) + Math.round(accuracy);
```

- **100 points** = Perfect timing (exactly on the beat)
- **60-99 points** = Good timing (within tolerance)
- **0 points** = Miss or wrong drum

### 3. **Intelligent Feedback Messages**

Three types of feedback based on what went wrong:

| Feedback Type | Color | Meaning |
|--------------|-------|---------|
| ✓ Drum Name - XX% accurate | Green | Correct drum, good timing |
| ✗ Wrong drum! Expected XXX | Orange | Right timing, wrong drum |
| ✗ Wrong timing | Red | Hit outside the timing window |

### 4. **Visual Feedback on Sheet Music**

When a note is hit correctly, the corresponding cell on the sheet music briefly highlights green:

```javascript
function highlightHitNote(note, beatPosition, success) {
    cell.style.backgroundColor = success ? "#90EE90" : "#FFB6C6";
    setTimeout(() => cell.style.backgroundColor = "", 300);
}
```

### 5. **Performance Analytics**

The system tracks all hits and calculates average accuracy:

```javascript
let accuracyHistory = [];
// On each hit:
accuracyHistory.push(accuracy);
// On stop:
const avgAccuracy = accuracyHistory.reduce((a, b) => a + b, 0) / accuracyHistory.length;
```

### 6. **Duplicate Hit Prevention**

Each note in the MIDI track is marked when hit to prevent double-counting:

```javascript
if (!note.hasBeenHit) {
    note.hasBeenHit = true;
    // award points
}
```

## How It Works

### Timing Flow

1. **Playback starts** → `currentBeatPosition` initialized to 0
2. **Metronome advances** → `currentBeatPosition` increments (0-15 in a 16-beat loop)
3. **User hits drum** → `evaluateUserInput(midiNote, currentBeatPosition)` called
4. **System checks**:
    - Are there any notes scheduled at `currentBeatPosition ± tolerance`?
    - Does the MIDI note match what's expected?
    - Has this note already been hit?
5. **Feedback provided**:
    - Visual (cell highlight, border color)
    - Text (detection field)
    - Haptic (vibration on mobile)
    - Score update

### Tolerance Calculation

```javascript
const beatTolerance = 0.4; // 40% of a beat
const toleranceTicks = ppq * beatTolerance;
```

For a song at 120 BPM with quarter notes:
- 1 beat = 500ms
- Tolerance window = ±200ms (±40%)
- Total acceptable window = 400ms

### Accuracy Formula

```
accuracy = 100 - (tickDistance / toleranceTicks * 100)

Examples:
- Perfect hit (tickDistance = 0): 100%
- Off by 25% of tolerance: 75%
- Off by 50% of tolerance: 50%
- Off by 100% of tolerance: 0%
```

## Configuration Options

### Adjustable Parameters

```javascript
// In drumtice.js, line ~324
const beatTolerance = 0.4; // Change to 0.3 for stricter, 0.5 for more lenient
```

### BPM Settings

The dropdown provides 8 tempo options:
- Largo (40) - Very slow practice
- Adagio (60) - Slow practice
- Andante (76) - Moderate practice
- **Moderato (108)** - Default
- Allegro (120) - Fast
- Vivace (168) - Very fast
- Presto (176) - Extremely fast
- Prestissimo (200) - Maximum speed

## Bug Fixes

### Fixed Loop Condition Bug
**Original (line 322):**
```javascript
for (let i=0 ; 0 < track.notes.length; i++) // BUG: always true!
```

**Fixed:**
```javascript
for (let i = 0; i < track.notes.length; i++)
```

### Improved MIDI Input Handling

MIDI velocity is now properly normalized:
```javascript
pressure: velocity / 127  // Convert 0-127 to 0-1 range
```

## User Interface Improvements

### New UI Elements
- **Performance Stats Panel** - Shows score, mistakes, and real-time feedback
- **How It Works Section** - Explains the color-coded feedback system
- **Organized Layout** - Clearer separation of controls, stats, and instructions

### Enhanced Feedback Display
- Wider feedback text field (350px) for longer messages
- Color-coded borders on text fields
- Drum name labels in feedback (e.g., "Kick", "Snare" instead of MIDI numbers)

## Testing the System

### Practice Mode Flow

1. **Select a beat pattern** (e.g., "ITE verse")
2. **Choose a slow tempo** (e.g., Adagio 60 BPM)
3. **Click Play** to start the metronome
4. **Watch the beat indicator** (blue highlight moving across bottom row)
5. **Hit the drums** when notes appear above the blue highlight
6. **Observe feedback**:
    - Green border = correct!
    - Orange/Red border = try again
    - Score increases with good timing

### Keyboard Controls

| Key | Drum |
|-----|------|
| 7 | Crash Cymbal 1 |
| 8 | High Tom |
| 9 | Mid Tom |
| 0 | Crash Cymbal 2 |
| U | Pedal Hi-Hat |
| I | Open Hi-Hat |
| O | Closed Hi-Hat |
| P | Ride Cymbal |
| J, K, L | Snare |
| M, , (comma) | Kick Drum |

## Future Enhancements

Possible additions to the timing system:

1. **Streak Counter** - Track consecutive perfect hits
2. **Difficulty Modes** - Adjust tolerance based on skill level
3. **Ghost Note Detection** - Penalize extra hits between notes
4. **Velocity Tracking** - Score based on hit strength (loud vs soft)
5. **Practice Mode** - Slow down specific sections automatically
6. **Recording Playback** - Record and replay performances with timing visualization

## Technical Notes

### Performance Optimization

- Uses event delegation for MIDI input
- DOM elements cached on initialization
- Visual updates batched with `setTimeout`
- No memory leaks from event listeners

### Browser Compatibility

- **Required**: Web Audio API, Web MIDI API
- **Recommended**: Chrome/Edge (best MIDI support)
- **Mobile**: Touch events supported, vibration on errors

### Dependencies

- **MIDI.js** - For soundfont playback
- **Tone.js MIDI** - For MIDI file parsing
- **Meyda** - Audio analysis (loaded but not yet utilized)

## Credits

Original concept by Jaime Casero
Timing system improvements: Enhanced evaluation logic, accuracy scoring, visual feedback

---

**Last Updated**: February 2026
**Version**: 2.0 - Improved Timing System