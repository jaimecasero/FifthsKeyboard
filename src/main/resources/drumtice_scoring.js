/**
 * drumtice_scoring.js — Pattern-matching scoring engine for drum practice.
 *
 * CONCEPT:
 *   The player plays at their own pace. The engine continuously records
 *   timestamped hits into a rolling buffer. After each hit it attempts to
 *   match the buffer against the target pattern by:
 *
 *   1. Detecting the player's effective BPM from their input timing.
 *   2. Time-stretching (normalizing) user hits to the target BPM grid.
 *   3. Running a pattern-similarity check (are the right instruments present?).
 *   4. If similarity is high enough, computing a 0–100% timing accuracy score.
 *
 * INTEGRATION:
 *   - Call `scoringEngine.init(midiData, drumTrack)` after loading a song.
 *   - Call `scoringEngine.recordHit(midiNote)` from your midiNoteDown handler.
 *   - The engine fires callbacks with live feedback and final scores.
 *
 * The engine is self-contained with no DOM dependencies — it communicates
 * via callbacks you register.
 */

const scoringEngine = (function () {

    // === Configuration ===
    const CONFIG = {
        // Minimum similarity (0-1) to trigger a score evaluation
        SIMILARITY_THRESHOLD: 0.6,

        // Maximum timing error (in fraction of a beat) before a note scores 0
        MAX_TIMING_ERROR_BEATS: 0.25,

        // How many pattern-lengths of history to keep in the buffer
        BUFFER_PATTERN_MULTIPLIER: 3,

        // Minimum hits required before attempting any matching
        MIN_HITS_BEFORE_MATCH: 3,

        // Debounce: don't re-score within this many ms of last score
        SCORE_COOLDOWN_MS: 500,

        // BPM detection: min/max reasonable range
        BPM_MIN: 30,
        BPM_MAX: 240,
    };

    // === State ===
    let targetPattern = [];   // Array of { midi, beatPos } — normalized to beats
    let patternLengthBeats = 0;
    let targetPPQ = 480;

    let hitBuffer = [];       // Array of { midi, timeMs } — raw user input
    let maxBufferSize = 200;

    let lastScoreTime = 0;
    let isActive = false;

    // === Callbacks ===
    let onScoreUpdate = null;     // (scoreObj) => void
    let onSimilarityUpdate = null; // (similarity) => void
    let onBPMDetected = null;      // (bpm) => void

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    /**
     * Initialize the engine with a loaded MIDI song.
     * @param {object} midiData - Parsed MIDI object (from @tonejs/midi)
     * @param {number} drumTrackIndex - Index of the drum track
     * @param {number} [level=4] - Difficulty level (1-4), filters target notes
     */
    function init(midiData, drumTrackIndex, level) {
        level = level || 4;
        const track = midiData.tracks[drumTrackIndex];
        const ppq = midiData.header.ppq;
        targetPPQ = ppq;

        // Build target pattern: normalize tick positions to beat positions
        targetPattern = [];
        const levelMap = buildLevelMapForScoring(track, ppq);

        for (let i = 0; i < track.notes.length; i++) {
            const note = track.notes[i];
            const noteLevel = levelMap.get(note.ticks + "_" + note.midi) || 4;

            if (noteLevel <= level) {
                targetPattern.push({
                    midi: note.midi,
                    beatPos: note.ticks / ppq, // position in beats
                    level: noteLevel,
                });
            }
        }

        // Determine pattern length in beats (round up to nearest bar)
        if (targetPattern.length > 0) {
            const lastBeat = targetPattern[targetPattern.length - 1].beatPos;
            patternLengthBeats = Math.ceil(lastBeat / 4) * 4; // round to bar
            if (patternLengthBeats === 0) patternLengthBeats = 4;
        } else {
            patternLengthBeats = 4;
        }

        // Set buffer size
        maxBufferSize = targetPattern.length * CONFIG.BUFFER_PATTERN_MULTIPLIER + 20;

        // Reset state
        hitBuffer = [];
        lastScoreTime = 0;
        isActive = true;

        console.log("[Scoring] Initialized. Target has " + targetPattern.length +
            " notes over " + patternLengthBeats + " beats. Level: " + level);
    }

    /**
     * Record a user hit. Call this every time the user plays a note.
     * @param {number} midiNote - MIDI note number
     * @returns {object|null} - Score result if pattern matched, else null
     */
    function recordHit(midiNote) {
        if (!isActive || targetPattern.length === 0) return null;

        const now = performance.now();

        hitBuffer.push({
            midi: midiNote,
            timeMs: now,
        });

        // Trim buffer
        if (hitBuffer.length > maxBufferSize) {
            hitBuffer = hitBuffer.slice(-maxBufferSize);
        }

        // Don't try matching until we have enough hits
        if (hitBuffer.length < CONFIG.MIN_HITS_BEFORE_MATCH) return null;

        // Cooldown check
        if (now - lastScoreTime < CONFIG.SCORE_COOLDOWN_MS) return null;

        // Attempt pattern match
        const result = attemptMatch();
        return result;
    }

    /**
     * Register callback for score updates.
     * @param {function} cb - Called with { score, bpm, similarity, details }
     */
    function onScore(cb) {
        onScoreUpdate = cb;
    }

    /**
     * Register callback for live similarity updates (called more often).
     * @param {function} cb - Called with { similarity, detectedBPM }
     */
    function onSimilarity(cb) {
        onSimilarityUpdate = cb;
    }

    /**
     * Reset the hit buffer (e.g., when changing songs).
     */
    function reset() {
        hitBuffer = [];
        lastScoreTime = 0;
    }

    /**
     * Get current state for debugging.
     */
    function getState() {
        return {
            bufferSize: hitBuffer.length,
            targetSize: targetPattern.length,
            patternLengthBeats: patternLengthBeats,
            isActive: isActive,
        };
    }

    // =========================================================================
    // CORE MATCHING ENGINE
    // =========================================================================

    /**
     * Attempt to match the recent hit buffer against the target pattern.
     * Returns a score object if match is good enough, null otherwise.
     */
    function attemptMatch() {
        if (hitBuffer.length < 2) return null;

        // Step 1: Detect BPM from user's timing
        const detectedBPM = detectBPM();
        if (!detectedBPM) return null;

        if (onBPMDetected) onBPMDetected(detectedBPM);

        // Step 2: Convert user hits to beat positions using detected BPM
        const msPerBeat = 60000 / detectedBPM;
        const userBeats = normalizeHitsToBeats(msPerBeat);

        // Step 3: Check instrument similarity (are the right drums being hit?)
        const similarity = computeSimilarity(userBeats);

        if (onSimilarityUpdate) {
            onSimilarityUpdate({ similarity: similarity, detectedBPM: detectedBPM });
        }

        // Step 4: If similar enough, compute timing score
        if (similarity >= CONFIG.SIMILARITY_THRESHOLD) {
            lastScoreTime = performance.now();
            const timingScore = computeTimingScore(userBeats, msPerBeat);

            const result = {
                score: Math.round(timingScore * 100),
                bpm: Math.round(detectedBPM),
                similarity: Math.round(similarity * 100),
                details: {
                    targetNotes: targetPattern.length,
                    userHits: userBeats.length,
                    msPerBeat: msPerBeat,
                },
            };

            if (onScoreUpdate) onScoreUpdate(result);
            return result;
        }

        return null;
    }

    // =========================================================================
    // BPM DETECTION
    // =========================================================================

    /**
     * Detect BPM from the user's hit timing.
     *
     * Strategy: look at inter-onset intervals (IOIs) between hits,
     * cluster them, and find the most common interval that maps to
     * a subdivision (8th note, quarter note, etc.).
     */
    function detectBPM() {
        if (hitBuffer.length < 3) return null;

        // Collect all inter-onset intervals
        const iois = [];
        for (let i = 1; i < hitBuffer.length; i++) {
            const delta = hitBuffer[i].timeMs - hitBuffer[i - 1].timeMs;
            if (delta > 0 && delta < 5000) { // ignore gaps > 5s
                iois.push(delta);
            }
        }

        if (iois.length < 2) return null;

        // Find the median IOI as a robust central estimate
        const sorted = iois.slice().sort((a, b) => a - b);
        const medianIOI = sorted[Math.floor(sorted.length / 2)];

        // The median IOI likely corresponds to the smallest common subdivision
        // being played (usually 8th notes for drum patterns).
        // Try mapping it to quarter, 8th, 16th note durations and pick
        // the BPM that falls in a reasonable range.

        const candidates = [];
        // If medianIOI = quarter note:
        candidates.push({ bpm: 60000 / medianIOI, subdivision: 1 });
        // If medianIOI = 8th note:
        candidates.push({ bpm: 60000 / (medianIOI * 2), subdivision: 0.5 });
        // If medianIOI = 16th note:
        candidates.push({ bpm: 60000 / (medianIOI * 4), subdivision: 0.25 });
        // If medianIOI = half note:
        candidates.push({ bpm: 60000 / (medianIOI / 2), subdivision: 2 });

        // Pick the candidate closest to a reasonable BPM
        let bestCandidate = null;
        let bestScore = Infinity;

        for (const c of candidates) {
            if (c.bpm >= CONFIG.BPM_MIN && c.bpm <= CONFIG.BPM_MAX) {
                // Prefer candidates closer to typical tempos (80-140)
                const dist = Math.abs(c.bpm - 110);
                if (dist < bestScore) {
                    bestScore = dist;
                    bestCandidate = c;
                }
            }
        }

        // Refine: use autocorrelation on IOIs for better accuracy
        if (bestCandidate) {
            const refinedBPM = refineWithAutocorrelation(iois, bestCandidate.bpm);
            return refinedBPM || bestCandidate.bpm;
        }

        return null;
    }

    /**
     * Refine BPM estimate using autocorrelation of IOI sequence.
     */
    function refineWithAutocorrelation(iois, initialBPM) {
        const msPerBeat = 60000 / initialBPM;

        // Quantize IOIs to beat fractions, accumulate total time
        let totalMs = 0;
        let totalBeats = 0;

        for (const ioi of iois) {
            // Round to nearest subdivision (16th note = 0.25 beats)
            const rawBeats = ioi / msPerBeat;
            const quantized = Math.round(rawBeats * 4) / 4;
            if (quantized > 0) {
                totalMs += ioi;
                totalBeats += quantized;
            }
        }

        if (totalBeats > 0) {
            const refinedMsPerBeat = totalMs / totalBeats;
            const refinedBPM = 60000 / refinedMsPerBeat;
            if (refinedBPM >= CONFIG.BPM_MIN && refinedBPM <= CONFIG.BPM_MAX) {
                return refinedBPM;
            }
        }

        return null;
    }

    // =========================================================================
    // BEAT NORMALIZATION
    // =========================================================================

    /**
     * Convert raw timestamped hits into beat positions.
     * Takes the most recent window of hits that spans ~1 pattern length.
     *
     * @param {number} msPerBeat - Milliseconds per beat at detected BPM
     * @returns {Array} - Array of { midi, beatPos } normalized to pattern range
     */
    function normalizeHitsToBeats(msPerBeat) {
        const patternDurationMs = patternLengthBeats * msPerBeat;

        // Take the most recent hits within ~1 pattern duration (with some margin)
        const windowMs = patternDurationMs * 1.2;
        const now = hitBuffer[hitBuffer.length - 1].timeMs;
        const windowStart = now - windowMs;

        const recentHits = hitBuffer.filter(h => h.timeMs >= windowStart);
        if (recentHits.length === 0) return [];

        // Use the first hit in the window as beat 0
        const originMs = recentHits[0].timeMs;

        return recentHits.map(h => ({
            midi: h.midi,
            beatPos: (h.timeMs - originMs) / msPerBeat,
        }));
    }

    // =========================================================================
    // SIMILARITY CHECK
    // =========================================================================

    /**
     * Compute how similar the user's instrument pattern is to the target.
     * This checks: are the right drums being hit in roughly the right order?
     *
     * Returns 0-1 where 1 = perfect instrument match.
     */
    function computeSimilarity(userBeats) {
        if (userBeats.length === 0 || targetPattern.length === 0) return 0;

        // Build instrument histograms (group by drum type)
        const targetInstruments = groupByDrumType(targetPattern);
        const userInstruments = groupByDrumType(userBeats);

        // Compare: for each instrument in target, is it in user hits?
        const allTypes = new Set([
            ...Object.keys(targetInstruments),
            ...Object.keys(userInstruments),
        ]);

        let matchScore = 0;
        let totalWeight = 0;

        for (const type of allTypes) {
            const targetCount = (targetInstruments[type] || 0);
            const userCount = (userInstruments[type] || 0);

            if (targetCount > 0) {
                // Weight by how many notes of this type are in the target
                const weight = targetCount;
                // Score: how close is user count to target count?
                const ratio = Math.min(userCount, targetCount) / Math.max(userCount, targetCount);
                matchScore += ratio * weight;
                totalWeight += weight;
            }
        }

        return totalWeight > 0 ? matchScore / totalWeight : 0;
    }

    /**
     * Group notes by drum type (kick, snare, hihat, etc.)
     * Maps different MIDI notes for the same instrument to a common key.
     */
    function groupByDrumType(notes) {
        const groups = {};
        const typeMap = {
            35: 'kick', 36: 'kick',
            37: 'snare', 38: 'snare', 40: 'snare',
            42: 'hihat', 44: 'hihat', 46: 'hihat_open',
            41: 'tom_low', 43: 'tom_low', 45: 'tom_low',
            47: 'tom_mid', 48: 'tom_mid',
            50: 'tom_hi',
            49: 'crash', 57: 'crash',
            51: 'ride',
        };

        for (const note of notes) {
            const type = typeMap[note.midi] || ('other_' + note.midi);
            groups[type] = (groups[type] || 0) + 1;
        }
        return groups;
    }

    // =========================================================================
    // TIMING SCORE
    // =========================================================================

    /**
     * Compute timing accuracy score (0-1).
     *
     * For each target note, find the best matching user hit (same instrument,
     * closest in time). Score each match based on timing error.
     *
     * @param {Array} userBeats - Normalized user hits { midi, beatPos }
     * @param {number} msPerBeat - For error scaling
     * @returns {number} 0-1 timing accuracy
     */
    function computeTimingScore(userBeats, msPerBeat) {
        if (targetPattern.length === 0 || userBeats.length === 0) return 0;

        // For alignment: try shifting the user pattern to find best overall fit.
        // The user's beat 0 might not align with the pattern's beat 0.
        // Try multiple offsets and pick the best total score.

        const bestResult = findBestAlignment(userBeats);
        return bestResult.score;
    }

    /**
     * Try aligning user beats to target at different offsets.
     * Returns { score, offset } for the best alignment.
     */
    function findBestAlignment(userBeats) {
        if (userBeats.length === 0) return { score: 0, offset: 0 };

        let bestScore = 0;
        let bestOffset = 0;

        // Try aligning each user hit with each target note as anchor points
        // For efficiency, only try aligning the first few user hits with
        // the first target note.
        const anchorsToTry = Math.min(userBeats.length, 6);

        for (let a = 0; a < anchorsToTry; a++) {
            // Offset so that userBeats[a] aligns with targetPattern[0]
            const offset = targetPattern[0].beatPos - userBeats[a].beatPos;
            const score = scoreWithOffset(userBeats, offset);

            if (score > bestScore) {
                bestScore = score;
                bestOffset = offset;
            }
        }

        // Also try aligning prominent hits (kicks/snares) with their target
        const userKicks = userBeats.filter(h => [35, 36].includes(h.midi));
        const targetKicks = targetPattern.filter(n => [35, 36].includes(n.midi));
        if (userKicks.length > 0 && targetKicks.length > 0) {
            for (let k = 0; k < Math.min(userKicks.length, 3); k++) {
                const offset = targetKicks[0].beatPos - userKicks[k].beatPos;
                const score = scoreWithOffset(userBeats, offset);
                if (score > bestScore) {
                    bestScore = score;
                    bestOffset = offset;
                }
            }
        }

        return { score: bestScore, offset: bestOffset };
    }

    /**
     * Score user beats against target with a given beat offset applied.
     */
    function scoreWithOffset(userBeats, offset) {
        // Apply offset to user beats
        const shifted = userBeats.map(h => ({
            midi: h.midi,
            beatPos: h.beatPos + offset,
        }));

        // For each target note, find the best matching user hit
        const used = new Set(); // track which user hits are already matched
        let totalScore = 0;
        let matchedCount = 0;

        for (const target of targetPattern) {
            let bestIdx = -1;
            let bestError = Infinity;

            for (let i = 0; i < shifted.length; i++) {
                if (used.has(i)) continue;

                // Must be the same drum type
                if (!isSameDrumType(target.midi, shifted[i].midi)) continue;

                const error = Math.abs(shifted[i].beatPos - target.beatPos);
                if (error < bestError) {
                    bestError = error;
                    bestIdx = i;
                }
            }

            if (bestIdx >= 0 && bestError < CONFIG.MAX_TIMING_ERROR_BEATS) {
                used.add(bestIdx);
                // Score: 1.0 at perfect timing, 0.0 at MAX_TIMING_ERROR
                const noteScore = 1.0 - (bestError / CONFIG.MAX_TIMING_ERROR_BEATS);
                totalScore += noteScore;
                matchedCount++;
            }
            // Unmatched target notes score 0 (implicit)
        }

        // Penalize extra hits (wrong notes the user played)
        const extraHits = shifted.length - used.size;
        const extraPenalty = Math.min(extraHits * 0.05, 0.3); // up to 30% penalty

        const rawScore = targetPattern.length > 0
            ? totalScore / targetPattern.length
            : 0;

        return Math.max(0, rawScore - extraPenalty);
    }

    /**
     * Check if two MIDI notes are the same drum type.
     */
    function isSameDrumType(midi1, midi2) {
        const typeMap = {
            35: 1, 36: 1,           // kick
            37: 2, 38: 2, 40: 2,   // snare
            42: 3, 44: 3,           // closed hihat
            46: 4,                   // open hihat
            41: 5, 43: 5, 45: 5,   // floor tom
            47: 6, 48: 6,           // mid tom
            50: 7,                   // hi tom
            49: 8, 57: 8,           // crash
            51: 9,                   // ride
        };
        return (typeMap[midi1] || midi1) === (typeMap[midi2] || midi2);
    }

    // =========================================================================
    // LEVEL MAP HELPER (mirrors drumtice_level_changes.js)
    // =========================================================================

    function buildLevelMapForScoring(track, ppq) {
        const levelMap = new Map();

        // Try text events first
        if (track.text && Array.isArray(track.text)) {
            const textEvents = track.text.slice().sort((a, b) => a.ticks - b.ticks);
            let textIdx = 0;
            for (let i = 0; i < track.notes.length; i++) {
                while (textIdx < textEvents.length &&
                    textEvents[textIdx].ticks <= track.notes[i].ticks) {
                    const txt = textEvents[textIdx].text;
                    if (txt && txt.startsWith("level:")) {
                        const level = parseInt(txt.split(":")[1]);
                        levelMap.set(track.notes[i].ticks + "_" + track.notes[i].midi, level);
                    }
                    textIdx++;
                }
            }
        }

        // Fallback: compute dynamically
        if (levelMap.size === 0) {
            for (const note of track.notes) {
                const level = computeNoteLevelLocal(note.midi, note.ticks, ppq);
                levelMap.set(note.ticks + "_" + note.midi, level);
            }
        }

        return levelMap;
    }

    function computeNoteLevelLocal(midiNote, absTick, ppq) {
        const KICK = [35, 36], SNARE = [37, 38, 40], HH = [42, 44];
        const isMainBeat = (absTick % ppq) === 0;
        const isEighth = (absTick % (ppq / 2)) === 0;
        const beat = Math.floor(absTick / ppq) % 4;

        if (KICK.includes(midiNote) && isMainBeat && (beat === 0 || beat === 2)) return 1;
        if (SNARE.includes(midiNote) && isMainBeat && (beat === 1 || beat === 3)) return 1;
        if (HH.includes(midiNote) && isEighth) return 2;
        if (KICK.includes(midiNote)) return 2;
        if (SNARE.includes(midiNote)) return 2;
        if ([46].includes(midiNote) || [41, 43, 45, 47, 48, 50].includes(midiNote)) return 3;
        if (HH.includes(midiNote)) return 3;
        return 4;
    }

    // =========================================================================
    // EXPOSE PUBLIC API
    // =========================================================================

    return {
        init: init,
        recordHit: recordHit,
        onScore: onScore,
        onSimilarity: onSimilarity,
        reset: reset,
        getState: getState,
        // Expose config for tuning
        CONFIG: CONFIG,
    };

})();