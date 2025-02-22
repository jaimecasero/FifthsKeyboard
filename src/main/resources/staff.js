////////////////////////MODEL //////////////////////////////////////
const NUM_NOTES = 12;
const NOTE_LABEL = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_MIDI_CODE = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const KEYBOARD_GAIN = 0.657;//the gain applied when note is pressed
const FLAT_CHAR = "&flat;";
const SHARP_CHAR = "&sharp;";
const NAT_CHAR = "&nat;";
const NOTE_CHAR = "&sung;";

const WHOLE_CHAR = "&#119133;";
const HALF_CHAR = "&#119134;";
const QUARTER_CHAR = "&#119135;";
const EIGHTH_CHAR = "&#119136;";
const SIXTEENTH_CHAR = "&#119137;";

const INITIAL_MISTAKES = 5;
const SPEED_CHANGE_RATIO = 0.9;

const CLEF_TABLE_ROWS = 7;
const CLEF_ROWS = 14;

const TREBLE_MIDI_CODE = [59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81]; //[C4-B5]
const TREBLE_OCTAVE = 4;
const BASS_MIDI_CODE = [39, 40, 41, 43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60]; //[E2-C4]
const BASS_OCTAVE = 2;
const CLEF_CODE_ARRAY = [TREBLE_MIDI_CODE, BASS_MIDI_CODE];
const CLEF_OCTAVE_ARRAY = [TREBLE_OCTAVE, BASS_OCTAVE];


SIGNATURE_MOD=[7,3,6,2,5,1,4];

let HARRY_SONG = "midi/harry.mid"
const WAKA_SONG = "midi/waka.mid";
const THUNDER_SONG = "midi/thunder.mid";
const POTRA_SONG = "midi/potra.mid";
const SONG_PATHS = [HARRY_SONG, WAKA_SONG, THUNDER_SONG, POTRA_SONG];


const SONG_SIGNATURE= [];

let HARRY_TRACK = 0;
const WAKA_TRACK = 0;
const THUNDER_TRACK = 0;
const POTRA_TRACK = 0;
const SONG_TRACKS = [HARRY_TRACK, WAKA_TRACK, THUNDER_TRACK, POTRA_TRACK];


var currentNote = "";
var currentNoteTablePos = 1;
var currentNoteIndex = -1;
var currentSongIndex = 0;
var nextNoteTimer;
var selectedClef = 0;
var octave = 4;
var speed = 1;


////////DOM CACHING//////////////////
var clefTable;
var outputSelect;
var clefSelect;
var scoreText;
var hintCheckbox;
var playCheckbox;
var mistakesText;
var levelText;
let midiData;

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
        //register key handlers
        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);

        changeClef(selectedClef);
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
    console.log(midiData);
}

function resetClefCell(clefIndex, column) {
    const clefRowIndex = CLEF_TABLE_ROWS - Math.floor(clefIndex / 2) - 1;
    let clefRow = clefTable.getElementsByTagName("tr")[clefRowIndex];
    let clefCell = clefRow.getElementsByTagName("td");
    if (clefCell.length > 0 && clefCell.length > column) {
        clefCell = clefCell[column];
        clefCell.innerHTML = "";
    }
}

function midiToClefIndex(midiNote) {

    let clefIndex = -1;
    let matchType = 0; //natural, flat, sharp
    for (let i = 0; i < CLEF_CODE_ARRAY[selectedClef].length; i++) {
        if (midiNote === CLEF_CODE_ARRAY[selectedClef][i]) {
            clefIndex = i;
            break;
        }
        if ( midiNote < CLEF_CODE_ARRAY[selectedClef][i]) {
            if (i % 2 === 0) {
                console.log("flatten detected")
                clefIndex = i - 1;
                matchType = 1;
            } else {
                console.log("sharp detected:" + i);
                clefIndex = i - 1;
                matchType = 1;
            }
            break;
        }
    }
    console.log("midiToClefIndex:" + midiNote + ".index:" + clefIndex + "");
    return  [clefIndex, matchType];
}

function setClefCell(clefIndex, column) {
    if (clefIndex[0] > 0) {
        const clefRowIndex = CLEF_TABLE_ROWS - Math.floor(clefIndex[0] / 2) - 1;
        let noteClass = "note-on-line";
        if (clefIndex[0] % 2 === 0) {
            noteClass = "note-on-space";
        }
        let matchType = "";
        if (clefIndex[1] < 0) {
            matchType = FLAT_CHAR;
        }
        if (clefIndex[1] > 0) {
            matchType = SHARP_CHAR;
        }
        console.log("clefRowIndex:" + clefRowIndex + " class:" + noteClass);
        let noteSymbol = noteDurationToSymbol(midiData.tracks[0].notes[currentNoteIndex].durationTicks, midiData.header.ppq);
        setClefText(matchType + noteSymbol, noteClass, clefRowIndex, column);
    }
}

function setClefText(text, textClass, clefRowIndex, column) {
    console.log("setClefText:" + text + " " + textClass + " " + clefRowIndex + " " + column);
    let clefRow = clefTable.getElementsByTagName("tr")[clefRowIndex];
    let clefCell = clefRow.getElementsByTagName("td");
    if (clefCell.length > 0 && clefCell.length > column) {
        clefCell = clefCell[column];
        clefCell.innerHTML = clefCell.innerHTML + "<span class='" + textClass + "'>" + text + "</span>";
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
    while (adjustedNote < CLEF_CODE_ARRAY[selectedClef][0]) {
        adjustedNote = adjustedNote + NUM_NOTES;
    }

    while (adjustedNote > CLEF_CODE_ARRAY[selectedClef][CLEF_CODE_ARRAY[selectedClef].length - 1]) {
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
    playMidiNote(NOTE_MIDI_CODE[keyIndex] + (NUM_NOTES * octave), pressure);
    if (isSamePitch(currentNote, NOTE_MIDI_CODE[keyIndex])) {
        console.log("same pitch");
        let hintRatio = hintCheckbox.checked ? 1 : 3;
        scoreText.value = parseInt(scoreText.value) + hintRatio;
        resetClefCell(midiToClefIndex(currentNote)[0], currentNoteTablePos);
        currentNoteTablePos = clefTable.getElementsByTagName("tr")[0].getElementsByTagName("td").length;
        currentNoteIndex = currentNoteIndex + 1;
        if (currentNoteIndex >= midiData.tracks[0].notes.length) {
            currentNoteIndex = 0;
        }
        if ( scoreText.value / (parseInt(levelText.value)*10) > 1 &&  (scoreText.value % (parseInt(levelText.value)*10)) > 0) {
            console.log("score:" + scoreText.value + " level:" + levelText.value);
            speed = speed * (SPEED_CHANGE_RATIO);
            levelText.value = parseInt(levelText.value) + 1;
        }
    } else {
        mistakesText.value = parseInt(mistakesText.value) - 1;
        if (mistakesText.value <= 0) {
            stop();
            window.alert("You run out of mistakes, Your score is " + scoreText.value + ". Press OK to restart");
        }
    }
}

function keyNoteUp(event, keyIndex) {
    playMidiNoteOff(NOTE_MIDI_CODE[keyIndex] + (NUM_NOTES * octave));
}

function isSamePitch(midiNote1, midiNote2) {
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

function changeClef(outputMode) {
    selectedClef = clefSelect.value;
    for (let i = 0; i < CLEF_ROWS; i++) {
        resetClefCell(i, 0);
    }
    if (hintCheckbox.checked) {
        for (let i = 0; i < CLEF_CODE_ARRAY[selectedClef].length; i++) {
            let noteIndex = -1;
            let clefMidiNote = CLEF_CODE_ARRAY[selectedClef][i];
            do {
                noteIndex = NOTE_MIDI_CODE.findIndex(midiNote => midiNote === clefMidiNote);
                clefMidiNote = clefMidiNote - NUM_NOTES;
            } while (noteIndex < 0 && clefMidiNote > 0);
            let noteClass = "note-on-line";
            let clefIndex = CLEF_TABLE_ROWS - Math.floor(i / 2) - 1;
            if (i % 2 === 0) {
                noteClass = "note-on-space";
            } else {
                if (clefIndex === 0 || clefIndex === 6) {
                    noteClass = "note-on-line-striked";
                }
            }
            console.log("clefIndex:" + clefIndex + " class:" + noteClass + " midiNote:" + clefMidiNote)
            setClefText(NOTE_LABEL[noteIndex], noteClass, clefIndex, 0);
        }
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
