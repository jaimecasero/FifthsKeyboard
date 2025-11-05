////////////////////////MODEL //////////////////////////////////////
const NUM_NOTES = 12;
const NOTE_LABEL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTE_MIDI_CODE = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const KEYBOARD_GAIN = 0.657;//the gain applied when note is pressed
const FLAT_CHAR = "&flat;";
const SHARP_CHAR = "&sharp;";
const NAT_CHAR = "&natur;";
const NOTE_CHAR = "&sung;";
const STRING_TUNING = ['E', 'A', 'D', 'G', 'B', 'E']


const IONIAN_INTERVAL = [0, 2, 4, 5, 7, 9, 11];
const DORIAN_INTERVAL = [0, 2, 3, 5, 7, 9, 10];
const PRHYGIAN_INTERVAL = [0, 1, 3, 5, 7, 8, 10];
const LYDIAN_INTERVAL = [0, 2, 4, 6, 7, 9, 11];
const MIXOLYDIAN_INTERVAL = [0, 2, 4, 5, 7, 9, 10];
const AEOLIAN_INTERVAL = [0, 2, 3, 5, 7, 8, 10];
const LOCRIAN_INTERVAL = [0, 1, 3, 5, 6, 8, 10];
const KEY_MODE_INTERVAL = [IONIAN_INTERVAL, DORIAN_INTERVAL, PRHYGIAN_INTERVAL, LYDIAN_INTERVAL, MIXOLYDIAN_INTERVAL, AEOLIAN_INTERVAL, LOCRIAN_INTERVAL];


const MAJOR_FORMULA = [0, 4, 7, 0];
const MINOR_FORMULA = [0, 3, 7, 0];
const SUS2_FORMULA = [0, 2, 7, 0];
const SUS4_FORMULA = [0, 5, 7, 0];
const DIM_FORMULA = [0, 3, 6, 0];
const SIXTH_FORMULA = [0, 4, 7, 9];
const MINOR_SIXTH_FORMULA = [0, 4, 7, 8];
const MAJOR7_FORMULA = [0, 4, 7, 11];
const SEVENTH_FORMULA = [0, 4, 7, 10];
const MINOR7_FORMULA = [0, 3, 7, 10];
const NINTH_FORMULA = [0, 4, 7, 10, 14];
const ELEVENTH_FORMULA = [0, 4, 7, 10, 14, 19];
const THIRTEENTH_FORMULA = [0, 4, 7, 10, 14, 19, 21];
const CHORD_MOD_ARR = [MAJOR_FORMULA, MINOR_FORMULA, SUS2_FORMULA, SUS4_FORMULA, DIM_FORMULA, SIXTH_FORMULA, MINOR_SIXTH_FORMULA, MAJOR7_FORMULA, SEVENTH_FORMULA, MINOR7_FORMULA, NINTH_FORMULA, ELEVENTH_FORMULA, THIRTEENTH_FORMULA];


////////DOM CACHING//////////////////
var fretTable;
var keySelect;
var modeSelect;
var rootChordSelect;
var chordSelect;


(function (window, document, undefined) {
    window.onload = init;

    function init() {
        // the code to be called when the dom has loaded
        // #document has its nodes
        console.log("init");
        initOscillators();
        //cache DOM elements for better performance
        fretTable = document.getElementById('fretTable');
        keySelect = document.getElementById('keySelect');
        modeSelect = document.getElementById('modeSelect');
        rootChordSelect = document.getElementById('rootChordSelect');
        chordSelect = document.getElementById('chordSelect');
        initFretBoard();
        loadKey();
        loadChord();
    }
})(window, document, undefined);


function calculateFretNoteIndex(stringIndex, fretIndex) {
    let openNote = STRING_TUNING[stringIndex];
    let openNoteOffset = NOTE_LABEL.indexOf(openNote);
    let noteIndex = (fretIndex + openNoteOffset) % NOTE_LABEL.length;
    return noteIndex;
}

function calculateFretNote(stringIndex, fretIndex) {
    let noteIndex = calculateFretNoteIndex(stringIndex, fretIndex);
    return NOTE_LABEL[noteIndex];
}

const FRET_MARKERS = [3, 5, 7, 9, 12];

function initFretBoard() {
    let tBodyRows = fretTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    for (let i = 0; i < tBodyRows.length; i++) {
        for (let j = 0; j < STRING_TUNING.length; j++) {
            let fretButton = document.createElement("input");
            fretButton.type = "radio";
            fretButton.name = "stringRadio" + j;
            fretButton.value = i + "-" + j;
            tBodyRows[i].getElementsByTagName("td")[j].innerHTML = "<span>" + calculateFretNote(j, i) + "</span>";
            //tBodyRows[i].getElementsByTagName("td")[j].appendChild(fretButton);

        }
        if (FRET_MARKERS.indexOf(i) !== -1) {
            tBodyRows[i].getElementsByTagName("td")[6].innerHTML = "<span class='marker'>" + i + "</span>";
        }
    }
}

let CALCULATED_KEY = [];
let CALCULATED_CHORD = [];

function calculateKey() {
    CALCULATED_KEY = [];
    let keyNoteOffset = parseInt(keySelect.value, 10);
    for (let i = 0; i < KEY_MODE_INTERVAL[modeSelect.value].length; i++) {
        let keyDegreeIndex = (keyNoteOffset + KEY_MODE_INTERVAL[modeSelect.value][i]) % NOTE_LABEL.length;
        CALCULATED_KEY.push(keyDegreeIndex);
    }
    console.log("calculated key:" + CALCULATED_KEY);
}

function calculateChord() {
    CALCULATED_CHORD = [];
    let keyNoteOffset = parseInt(rootChordSelect.value, 10);
    console.log("root chord:" + rootChordSelect.value);
    for (let i = 0; i < CHORD_MOD_ARR[chordSelect.value].length; i++) {
        let noteIndex = (keyNoteOffset + CHORD_MOD_ARR[chordSelect.value][i]) % NOTE_LABEL.length;
        console.log("noteIndex:" + noteIndex);
        CALCULATED_CHORD.push(noteIndex);
    }
    console.log("calculated chord:" + CALCULATED_CHORD);
}


function isFretOnKey(stringIndex, fretIndex) {
    let fretNoteIndex = calculateFretNoteIndex(stringIndex, fretIndex);
    return CALCULATED_KEY.indexOf(fretNoteIndex);
}

function isFretOnChord(stringIndex, fretIndex) {
    let fretNoteIndex = calculateFretNoteIndex(stringIndex, fretIndex);
    return CALCULATED_CHORD.indexOf(fretNoteIndex);
}


function playMidiNoteAction(event) {
    //play user note to throw feedback, that should hurt your ear
    playMidiNote(event.detail.midiNote + CLEF_OCTAVE_ARRAY[clefSelect.value] * NUM_NOTES, event.detail.pressure);
}


function midiToNote(midiNote) {
    for (let i = 0; i < NOTE_LABEL.length; i++) {
        if (isSameNote(midiNote, NOTE_MIDI_CODE[i])) {
            return NOTE_LABEL[i];
        }
    }
    return "";
}


///////////////INPUT HANDLING/////////////////////////////////////////
var shiftPressed = false;
var altPressed = false;
var pressedKeys = [];

function keyDownHandler(event) {
    console.log("keyDownHandler:" + event.keyCode);
    let keyPressed = String.fromCharCode(event.keyCode);
    if (pressedKeys.indexOf(keyPressed) !== -1) {
        return;
    } else {
        pressedKeys.push(keyPressed);
    }
    if (event.keyCode === 16) {
        shiftPressed = true;
    }
    if (event.keyCode === 18) {
        altPressed = true;
    }


    let noteIndex = NOTE_LABEL.findIndex((element) => element === keyPressed);
    if (noteIndex > -1 && !event.repeat) {
        if (shiftPressed && !altPressed) {
            //sharp the note by adding semitone
            noteIndex = noteIndex + 1;
        } else if (shiftPressed && altPressed) {
            //flat the note by substracting semitone
            noteIndex = noteIndex - 1;
        }

        console.log("keyDownHandler:" + keyPressed + " index:" + noteIndex);
        keyNoteDown(event, noteIndex);
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
    if (event.keyCode === 18) {
        shiftPressed = false;
    }

    let noteIndex = NOTE_LABEL.findIndex((element) => element === keyPressed);
    if (noteIndex > -1) {
        if (shiftPressed && !altPressed) {
            //sharp the note by adding semitone
            noteIndex = noteIndex + 1;
        } else if (shiftPressed && altPressed) {
            //flat the note by substracting semitone
            noteIndex = noteIndex - 1;
        }
        keyNoteUp(event, noteIndex);
    }

}

function keyNoteDown(event, keyIndex) {
    document.dispatchEvent(new CustomEvent(USER_NOTE_ON_HIT_EVENT, {
        detail: {
            midiNote: NOTE_MIDI_CODE[keyIndex],
            pressure: event.pressure,
        }
    }));
}

function midiNoteDown(event) {
    let midiNote = event.detail.midiNote;
    const pressure = ((event.pressure == null) ? KEYBOARD_GAIN : event.pressure);
    console.log(midiNote);
    let matched = false;
    if (isSameNote(currentNote, midiNote)) {
        matched = true;
        if (!playCheckbox.checked) {
            //dont play note on ear training mode
            playMidiNote(currentNote, pressure);
        }
        let hintRatio = hintCheckbox.checked ? 1 : 3;
        scoreText.value = parseInt(scoreText.value) + hintRatio;
        setTimeout(function () {
            changeTextColor(scoreText, "black")
        }, 500);
        changeTextColor(scoreText, "green");

        currentNoteIndex = currentNoteIndex + 1;
        if (currentNoteIndex >= midiData.tracks[trackSelect.value].notes.length) {
            currentNoteIndex = 0;
        }

        renderCurrentNote();
    } else {
        document.dispatchEvent(new CustomEvent(USER_FAILED_EVENT, {
            detail: {
                midiNote: midiNote,
                pressure: pressure,
            }
        }));
    }
    return matched;
}

function changeTextColor(input, newColor) {
    input.style.borderColor = newColor;
}

function keyNoteUp(event, keyIndex) {
    playMidiNoteOff(currentNote);
}

function isSameNote(midiNote1, midiNote2) {
    return midiNote1 % NUM_NOTES === midiNote2 % NUM_NOTES;
}

//////////////////////////// CONFIGURATION ////////////////////////////

function playMidiNote(adjustedMidiNote, force) {
    playOscillatorNote(adjustedMidiNote, force);
}

function playMidiNoteOff(adjustedMidiNote) {
    playOscillatorNoteOff(adjustedMidiNote);
}


function loadKey() {
    calculateKey();
    let tBodyRows = fretTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    for (let i = 0; i < tBodyRows.length; i++) {
        for (let j = 0; j < STRING_TUNING.length; j++) {
            let tdClass = "OnKey" + isFretOnKey(j, i) + "Class";
            tBodyRows[i].getElementsByTagName("td")[j].className = tdClass;
        }
    }
}

function loadChord(event) {
    calculateChord();
    let tBodyRows = fretTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    for (let i = 0; i < tBodyRows.length; i++) {
        for (let j = 0; j < STRING_TUNING.length; j++) {
            let tdClass = "OnChord" + isFretOnChord(j, i) + "Class";
            tBodyRows[i].getElementsByTagName("td")[j].getElementsByTagName("span")[0].className = tdClass;
        }
    }
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

//////////////////////  micro INPUT //////////////////////


//////////////////////  midi INPUT //////////////////////

// create web audio api context

async function connectMIDI() {
    if (!navigator.requestMIDIAccess) {
        console.error("Web MIDI API is not supported in this browser.");
        return;
    }

    try {
        const midiAccess = await navigator.requestMIDIAccess();
        console.log("MIDI Access Granted");

        // List all available MIDI inputs
        for (let input of midiAccess.inputs.values()) {
            console.log(`MIDI Device Found: ${input.name}`);
            input.onmidimessage = handleMIDIMessage;
        }

        // Handle device connection/disconnection
        midiAccess.onstatechange = (event) => {
            console.log(`MIDI Device: ${event.port.name}, State: ${event.port.state}`);
        };
    } catch (error) {
        console.error("MIDI Access Denied:", error);
    }
}

function handleMIDIMessage(event) {
    const [status, key, velocity] = event.data; // MIDI message bytes
    // Example: Detect Note On (Key Pressed)
    if (status === 144 && velocity > 0) {
        document.dispatchEvent(new CustomEvent(USER_NOTE_ON_HIT_EVENT, {
            detail: {
                midiNote: key,
                pressure: velocity,
            }
        }));
    }

    // Example: Detect Note Off (Key Released)
    if (status === 128 || (status === 144 && velocity === 0)) {
        playMidiNoteOff(currentNote);
    }
}
