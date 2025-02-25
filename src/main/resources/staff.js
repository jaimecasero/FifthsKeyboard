////////////////////////MODEL //////////////////////////////////////
const NUM_NOTES = 12;
const NOTE_LABEL = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_MIDI_CODE = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const MAJOR_MIDI_CODE = [12, 14, 16, 17, 19, 21, 23];
const SIGNATURE_MAJOR_MOD = [MAJOR_MIDI_CODE[7 - 1], MAJOR_MIDI_CODE[3 - 1], MAJOR_MIDI_CODE[6 - 1], MAJOR_MIDI_CODE[2 - 1], MAJOR_MIDI_CODE[5 - 1], MAJOR_MIDI_CODE[1 - 1], MAJOR_MIDI_CODE[4 - 1]];//B, E, A, D, G, C, F
const KEYBOARD_GAIN = 0.657;//the gain applied when note is pressed
const FLAT_CHAR = "&flat;";
const SHARP_CHAR = "&sharp;";
const NAT_CHAR = "&natur;";
const NOTE_CHAR = "&sung;";

const WHOLE_CHAR = "&#119133;";
const HALF_CHAR = "&#119134;";
const QUARTER_CHAR = "&#119135;";
const EIGHTH_CHAR = "&#119136;";
const SIXTEENTH_CHAR = "&#119137;";

const INITIAL_MISTAKES = 0;
const SPEED_CHANGE_RATIO = 0.9;

const MAJOR_TO_SIGNATURE_INDEX = [0, 5, 9, 3, 11, 1, 6, 8, 4, 10, 2, 7];
const TREBLE_MIDI_CODE = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81]; //[C4-B5]
const TREBLE_OCTAVE = 4;
const BASS_MIDI_CODE = [40, 41, 43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60]; //[E2-C4]
const BASS_OCTAVE = 2;
const CLEF_CODE_ARRAY = [TREBLE_MIDI_CODE, BASS_MIDI_CODE];
const CLEF_OCTAVE_ARRAY = [TREBLE_OCTAVE, BASS_OCTAVE];


let HARRY_SONG = "midi/HarryPotter.mid"
const WAKA_SONG = "midi/waka.mid";
const THUNDER_SONG = "midi/thunder.mid";
const POTRA_SONG = "midi/potra.mid";
const SONG_PATHS = [HARRY_SONG, WAKA_SONG, THUNDER_SONG, POTRA_SONG];

let HARRY_TRACK = 0;
const WAKA_TRACK = 0;
const THUNDER_TRACK = 0;
const POTRA_TRACK = 0;
const SONG_TRACKS = [HARRY_TRACK, WAKA_TRACK, THUNDER_TRACK, POTRA_TRACK];


var currentNote = "";//midi code for current note
var currentNoteTablePos = 1; //current note table column
var currentNoteIndex = -1; //index to NOTE_CODE arrray
var currentSongIndex = 0;
var nextNoteTimer = undefined;//holds promise for timer
var octave = 4;
var speed = 1;//current speed,
var resultingClef = [];//contains midi notes of resulting clef after calculating artificial modifiers
var resultingClefArtificials = []; //contains -1 for flatten notes or  1 for sharpen
var midiData;//contains midi object after parsing midi file
var signatureType = 0; //negative for flat sigs and positive for sharp signatures. defaults to no flat/sharp
var signatureArtificials = 0; //number of artificials  in signature. defaults to no artificials


////////DOM CACHING//////////////////
var clefTable;
var outputSelect;
var clefSelect;
var scoreText;
var hintCheckbox;
var playCheckbox;
var mistakesText;
var levelText;
var signatureSelect;
var trackSelect;

(function (window, document, undefined) {
    window.onload = init;

    function init() {
        // the code to be called when the dom has loaded
        // #document has its nodes
        console.log("init");
        initOscillators();
        //cache DOM elements for better performance
        clefTable = document.getElementById('clefTable');
        outputSelect = document.getElementById('outputSelect');
        clefSelect = document.getElementById('clefSelect');
        scoreText = document.getElementById('scoreText');
        hintCheckbox = document.getElementById('hintCheckbox');
        playCheckbox = document.getElementById('playCheckbox');
        mistakesText = document.getElementById('mistakesText');
        levelText = document.getElementById('levelText');
        signatureSelect = document.getElementById('signatureSelect');
        trackSelect = document.getElementById('trackSelect');
        //register key handlers
        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);

        changeClef();
        loadSong();
    }
})(window, document, undefined);


function noteDurationToSymbol(duration, ppq) {
    console.log("noteDurationToSymbol:" + duration + " ppq:" + ppq);
    let beats = duration / ppq;
    let symbol = "";
    if (beats >= 4) {
        return WHOLE_CHAR;
    }
    if (beats >= 2) {
        return HALF_CHAR;
    }
    if (beats >= 1) {
        return QUARTER_CHAR;
    }
    if (beats >= 0.5) {
        return EIGHTH_CHAR;
    }
    if (beats >= 0.25) {
        return SIXTEENTH_CHAR;
    }
    return symbol;
}


async function loadSong() {
    const response = await fetch(SONG_PATHS[currentSongIndex]);
    const arrayBuffer = await response.arrayBuffer();
    midiData = new Midi(arrayBuffer);
    while (trackSelect.options.length > 0) {
        trackSelect.remove(0);
    }
    for (let i = 0; i < midiData.tracks.length; i++) {
        let newOption = document.createElement("option");
        newOption.text = midiData.tracks[i].name + "-" + midiData.tracks[i].instrument.name;
        newOption.value = i;
        trackSelect.appendChild(newOption);
    }
    signatureSelect.value = 0;
    if (midiData.header.keySignatures.length > 0) {
        let noteIndex = NOTE_LABEL.indexOf(midiData.header.keySignatures[0].key);
        if (noteIndex > -1) {
            signatureSelect.value = MAJOR_TO_SIGNATURE_INDEX[noteIndex];
        }

    }
    changeClef();
    console.log(midiData);
}

function resetClefCell(clefIndex, column) {
    let cell = getClefCell(clefIndex, column);
    if (cell !== undefined) {
        cell.innerHTML = "";
    }
}

function midiToClefIndex(midiNote) {
    let clefIndex = -1;
    let matchType = 9999; //natural, flat, sharp
    for (let i = 0; i < resultingClef.length; i++) {
        if (midiNote === resultingClef[i]) {
            clefIndex = clefTable.getElementsByTagName("tr").length - i - 1;
            break;
        }
        if (midiNote < resultingClef[i - 1]) {
            //previous note is bigger, so the note is not in the current key
            if (signatureType === 1) {
                //for sharp keys set match type to flat
                clefIndex = clefTable.getElementsByTagName("tr").length - i + 1;
                matchType = 1;
            } else if (signatureType === -1) {
                //for flat keys set match type to flat
                clefIndex = clefTable.getElementsByTagName("tr").length - i;
                matchType = -1;
            }
            if (resultingClefArtificials[i - 1] !== 0) {
                //previous note was already altered, so this is natural switch
                //keep clefIndex on current row
                clefIndex = clefTable.getElementsByTagName("tr").length - i;
                matchType = 0;
            }
            break;
        }

        if (i === resultingClef.length - 1) {
            //no more notes in the array
            if (signatureType === 1) {
                //for sharp keys set match type to flat
                clefIndex = clefTable.getElementsByTagName("tr").length - i;
                matchType = 1;
            } else if (signatureType === -1) {
                //for flat keys set match type to flat
                clefIndex = clefTable.getElementsByTagName("tr").length - i;
                matchType = -1;
            }
            if (resultingClefArtificials[i - 1] !== 0) {
                //previous note was already altered, so this is natural switch
                //keep clefIndex on current row
                clefIndex = clefTable.getElementsByTagName("tr").length - i;
                matchType = 0;
            }
            break;
        }
    }
    console.log("midiToClefIndex:" + midiNote + ".index:" + clefIndex + " matchtype:" + matchType);
    return [clefIndex, matchType];
}

function setClefCell(clefIndex, column) {
    if (clefIndex[0] >= 0) {
        let noteClass = "note-on-space";
        if (clefIndex[0] % 2 === 0) {
            noteClass = "note-on-line";
            //outer lines are just striked
            if (clefIndex[0] < 2 || clefIndex[0] > 10) {
                noteClass = "note-on-line-striked";
            }
        }
        let matchType = "";
        if (clefIndex[1] === -1) {
            matchType = FLAT_CHAR;
        }
        if (clefIndex[1] === 1) {
            matchType = SHARP_CHAR;
        }
        if (clefIndex[1] === 0) {
            matchType = NAT_CHAR;
        }
        console.log("clefRowIndex:" + clefIndex + " class:" + noteClass);
        let noteSymbol = noteDurationToSymbol(midiData.tracks[0].notes[currentNoteIndex].durationTicks, midiData.header.ppq);
        setClefText(matchType + noteSymbol, noteClass, clefIndex[0], column);
    }
}

function getClefCell(clefRowIndex, column) {
    let clefRow = clefTable.getElementsByTagName("tr");
    let cell = undefined;
    if (clefRow.length > 0 && clefRow.length > clefRowIndex) {
        clefRow = clefRow[clefRowIndex];
        let clefCell = clefRow.getElementsByTagName("td");
        if (clefCell.length > 0 && clefCell.length > column) {
            cell = clefCell[column];
        }
    }
    return cell;
}

function setClefText(text, textClass, clefIndex, column) {
    console.log("setClefText:" + text + " " + textClass + " " + clefIndex + " " + column);
    let clefCell = getClefCell(clefIndex, column);
    if (clefCell !== undefined) {
        clefCell.innerHTML = "<span class='" + textClass + "'>" + text + "</span>";
    }
}

function start() {
    currentNoteIndex = -1;
    currentNoteTablePos = clefTable.getElementsByTagName("tr")[0].getElementsByTagName("td").length;
    mistakesText.value = INITIAL_MISTAKES;
    levelText.value = 1;
    scoreText.value = 0;
    hintCheckbox.readOnly = true;
    renderCurrentNote();
}

function stop() {
    if (nextNoteTimer !== undefined) {
        clearTimeout(nextNoteTimer);
        nextNoteTimer = undefined;
        hintCheckbox.readOnly = false;

    }
}

/**
 *
 * @param midiNote
 * @returns adjusted midi note to clef octave so midinote is within the clef coverage
 */
function adjustMidiToClef(midiNote) {
    let adjustedNote = midiNote;
    while (adjustedNote < resultingClef[0]) {
        adjustedNote = adjustedNote + NUM_NOTES;
    }

    while (adjustedNote > resultingClef[resultingClef.length - 1]) {
        adjustedNote = adjustedNote - NUM_NOTES;
    }
    console.log("adjustMidiToClef:" + midiNote + " adjusted:" + adjustedNote);
    return adjustedNote;
}

function renderCurrentNote() {
    if (currentNoteIndex >= 0) {
        currentNote = midiData.tracks[0].notes[currentNoteIndex].midi;
        console.log("renderCurrentNote:" + currentNote);
        currentNote = adjustMidiToClef(currentNote);
        let clefIndex = midiToClefIndex(currentNote);
        resetClefCell(clefIndex[0], currentNoteTablePos);
    }
    if (currentNoteIndex < 0) {
        currentNoteIndex = 0;
    }
    currentNoteTablePos = currentNoteTablePos - 1;
    if (currentNoteTablePos < 1) {
        currentNoteTablePos = clefTable.getElementsByTagName("tr")[0].getElementsByTagName("td").length;
        //user didnt matched note, pass to next note
        currentNoteIndex = currentNoteIndex + 1;
        if (currentNoteIndex >= midiData.tracks[0].notes.length) {
            currentNoteIndex = 0;
        }
    }
    currentNote = midiData.tracks[0].notes[currentNoteIndex].midi;
    currentNote = adjustMidiToClef(currentNote);
    let clefIndex = midiToClefIndex(currentNote);
    setClefCell(clefIndex, currentNoteTablePos);
    if (playCheckbox.checked) {
        playMidiNote(currentNote, KEYBOARD_GAIN);
    }
    nextNoteTimer = setTimeout(renderCurrentNote, 1000 * speed);
}

///////////////INPUT HANDLING/////////////////////////////////////////
var shiftPressed = false;
var pressedKeys = [];

function keyDownHandler(event) {
    let keyPressed = String.fromCharCode(event.keyCode);
    if (pressedKeys.indexOf(keyPressed) !== -1) {
        return;
    } else {
        pressedKeys.push(keyPressed);
    }
    if (event.keyCode === 16) {
        shiftPressed = true;
    }


    let noteIndex = NOTE_LABEL.findIndex((element) => element === keyPressed);
    if (noteIndex > -1 && !event.repeat) {
        if (shiftPressed) {
            //sharp the note by adding semitone
            noteIndex = noteIndex + 1;
        }
        console.log("keyDownHandler:" + keyPressed + " index:" + noteIndex);
        keyNoteDown(event, noteIndex);
    } else {
    }
}

function keyUpHandler(event) {
    let keyPressed = String.fromCharCode(event.keyCode);
    const index = pressedKeys.indexOf(keyPressed);
    if (index !== -1) {
        pressedKeys.splice(index, 1)
    }
    if (event.keyCode === 16) {
        shiftPressed = false;
    }

    let noteIndex = NOTE_LABEL.findIndex((element) => element === keyPressed);
    if (noteIndex > -1) {
        if (shiftPressed) {
            //sharp the note by adding semitone
            noteIndex = noteIndex + 1;
        }
        keyNoteUp(event, noteIndex);
    }

}


function keyNoteDown(event, keyIndex) {
    const pressure = ((event.pressure == null) ? KEYBOARD_GAIN : event.pressure);
    console.log("keyNoteDown:" + keyIndex + " pressure:" + pressure);

    console.log("keyNoteDown:" + NOTE_MIDI_CODE[keyIndex]);
    if (isSameNote(currentNote, NOTE_MIDI_CODE[keyIndex])) {
        playMidiNote(currentNote, pressure);
        console.log("same pitch");
        let hintRatio = hintCheckbox.checked ? 1 : 3;
        scoreText.value = parseInt(scoreText.value) + hintRatio;
        changeTextColor(scoreText, "green");
        setTimeout(function() {changeTextColor(scoreText, "black")}, 500);
        resetClefCell(midiToClefIndex(currentNote)[0], currentNoteTablePos);
        currentNoteTablePos = clefTable.getElementsByTagName("tr")[0].getElementsByTagName("td").length;
        currentNoteIndex = currentNoteIndex + 1;
        if (currentNoteIndex >= midiData.tracks[0].notes.length) {
            currentNoteIndex = 0;
        }
        if (scoreText.value / (parseInt(levelText.value) * 10) > 1 && (scoreText.value % (parseInt(levelText.value) * 10)) > 0) {
            console.log("score:" + scoreText.value + " level:" + levelText.value);
            speed = speed * (SPEED_CHANGE_RATIO);
            levelText.value = parseInt(levelText.value) + 1;
            changeTextColor(levelText, "green");
            setTimeout(function() {changeTextColor(levelText, "black")}, 500);
        }
    } else {
        mistakesText.value = parseInt(mistakesText.value) + 1;
        changeTextColor(mistakesText,"red");
        setTimeout(function() {changeTextColor(mistakesText, "black")}, 500);
    }
}

function changeTextColor(input, newColor) {
    input.style.borderColor = newColor;
}
function keyNoteUp(event, keyIndex) {
    playMidiNoteOff(currentNote);
}

function isSameNote(midiNote1, midiNote2) {
    console.log("midiNote1:" + midiNote1 + ".midi2:" + midiNote2);
    return midiNote1 % NUM_NOTES === midiNote2 % NUM_NOTES;
}

//////////////////////////// CONFIGURATION ////////////////////////////
function changeOutput(outputMode) {
    if (changeOutput === "0") {
    } else {
        initMidi();
    }
}

function changeSong(songIndex) {
    currentSongIndex = songIndex;
    console.log("changeSong:" + currentSongIndex);
    loadSong();
}

function calculateNewClef() {
    let selectedClef = clefSelect.value;
    resultingClef = [];
    resultingClefArtificials = [];
    signatureType = 0;
    signatureArtificials = 0;
    console.log("signatureSelect:" + signatureSelect.value);
    if (signatureSelect.value > 0 && signatureSelect.value < 8) {
        //its a flat signature
        signatureArtificials = signatureSelect.value;
        signatureType = -1;
    } else if (signatureSelect.value > 7) {
        //its a sharp signature
        signatureArtificials = signatureSelect.value - 7;
        signatureType = 1;
    }
    console.log("signatureArtificials:" + signatureArtificials + " signatureType:" + signatureType + ".signature mod:" + SIGNATURE_MAJOR_MOD);

    for (let i = 0; i < CLEF_CODE_ARRAY[selectedClef].length; i++) {
        let nextNote = CLEF_CODE_ARRAY[selectedClef][i];
        let artificialType = 0;
        if (signatureType !== 0) {
            for (let j = 0; j < signatureArtificials; j++) {
                if (signatureType < 0) {
                    if (isSameNote(nextNote, SIGNATURE_MAJOR_MOD[j])) {
                        nextNote = nextNote + signatureType;
                        artificialType = -1;
                        break;
                    }
                } else {
                    if (isSameNote(nextNote, SIGNATURE_MAJOR_MOD[SIGNATURE_MAJOR_MOD.length - j - 1])) {
                        console.log("nextNote:" + nextNote + " SIGNATURE_MAJOR_MOD:" + SIGNATURE_MAJOR_MOD[SIGNATURE_MAJOR_MOD.length - j - 1]);
                        nextNote = nextNote + signatureType;
                        artificialType = -1;
                        break;
                    }
                }
            }
        }
        resultingClef.push(nextNote);
        resultingClefArtificials.push(artificialType);
    }
    console.log("resultingClef:" + resultingClef + " resultingClefArtificials:" + resultingClefArtificials);
}

function changeClef() {

    for (let i = 0; i < clefTable.getElementsByTagName("tr").length; i++) {
        resetClefCell(i, 0);
    }
    calculateNewClef();
    if (hintCheckbox.checked) {
        displaySignatureHint();
    }
}

function displaySignatureHint() {
    for (let i = 0; i < resultingClef.length; i++) {
        let noteIndex = -1;
        let clefMidiNote = resultingClef[i];
        do {
            noteIndex = NOTE_MIDI_CODE.findIndex(midiNote => midiNote === clefMidiNote);
            clefMidiNote = clefMidiNote - NUM_NOTES;
        } while (noteIndex < 0 && clefMidiNote > 0);
        let noteClass = "note-on-space";
        let clefIndex = clefTable.getElementsByTagName("tr").length - i - 1;
        if (i % 2 === 0) {
            noteClass = "note-on-line";
            //outer lines are just striked
            if (clefIndex < 2 || clefIndex > 10) {
                noteClass = "note-on-line-striked";
            }
        }
        console.log("clefIndex:" + clefIndex + " class:" + noteClass + " midiNote:" + clefMidiNote);
        let noteLabel = NOTE_LABEL[noteIndex];
        if (noteLabel.includes('#')) {
            if (signatureType < 0) {
                let adjustedIndex = noteIndex + 1;
                if (adjustedIndex >= NOTE_LABEL.length) {
                    adjustedIndex = 0;
                }
                console.log("adjusted:" + adjustedIndex)
                noteLabel = NOTE_LABEL[adjustedIndex] + FLAT_CHAR;
            }
        }
        setClefText(noteLabel, noteClass, clefIndex, 0);
    }
}


function playMidiNote(adjustedMidiNote, force) {
    playOscillatorNote(adjustedMidiNote, force);
}

function playMidiNoteOff(adjustedMidiNote) {
    playOscillatorNoteOff(adjustedMidiNote);
}


////////////////////// built-in midi OUTPUT //////////////////////

// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext);


function initOscillators() {

    MIDI.loadPlugin({
        soundfontUrl: "./soundfont/",
        instrument: "acoustic_grand_piano",
        onprogress: (state, progress) => console.log(state, progress),
        onsuccess: () => {
            console.log("MIDI.js loaded");
        },
        onerror: (e) => {
            window.alert("browser not supported. Use Chrome:" + e.message);
        }
    });

}

/**
 * Convert mouse event force (0-1) to MIDI velocity (0-127).
 * @param {number} force - The force value from a mouse event (0 to 1).
 * @returns {number} - The corresponding MIDI velocity (0 to 127).
 */
function forceToMidiVelocity(force) {
    // Clamp the force value to the range 0-1
    const clampedForce = Math.min(Math.max(force, 0), 1);
    // Scale the clamped force to the MIDI velocity range (0-127)
    const midiVelocity = Math.round(clampedForce * 127);
    return midiVelocity;
}

function playOscillatorNote(adjustedMidiNote, force) {
    MIDI.noteOn(0, adjustedMidiNote, forceToMidiVelocity(force), 0);
}

function playOscillatorNoteOff(adjustedMidiNote) {
    MIDI.noteOff(0, adjustedMidiNote, 0);
}
