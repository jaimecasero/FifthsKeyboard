////////////////////////MODEL //////////////////////////////////////
const NUM_NOTES = 12;
const NOTE_LABEL = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_MIDI_CODE = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const KEYBOARD_GAIN = 0.657;//the gain applied when note is pressed
const FLAT_CHAR = "&flat;";
const SHARP_CHAR = "&sharp;";
const NAT_CHAR = "&nat;";
const NOTE_CHAR = "&sung;";
const INITIAL_MISTAKES = 5;
const SPEED_CHANGE_SCORE = 10;
const SPEED_CHANGE_RATIO = 0.9;

const CLEF_TABLE_ROWS = 7;
const CLEF_ROWS = 14;
const TREBLE_MIDI_CODE = [59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81]; //[C4-B5]
const TREBLE_OCTAVE = 4;
const BASS_MIDI_CODE = [39, 40, 41, 43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60]; //[E2-C4]
const BASS_OCTAVE = 2;

const CLEF_CODE_ARRAY = [TREBLE_MIDI_CODE, BASS_MIDI_CODE];
const CLEF_OCTAVE_ARRAY = [TREBLE_OCTAVE, BASS_OCTAVE];

const HARRY_SONG = [71, 76, 79, 77, 69, 71, 72, 74, 74, 71, 76, 71, 76, 74];
const WAKA_SONG = [76, 76, 76, 77, 69, 71, 72, 74, 74, 71, 76, 71, 76, 74];
const THUNDER_SONG = [71, 76, 79, 77, 69, 71, 72, 74, 74, 71, 76, 71, 76, 74];
const POTRA_SONG = [71, 76, 79, 77, 69, 71, 72, 74, 74, 71, 76, 71, 76, 74];
const SONG_ARRAY = [HARRY_SONG, WAKA_SONG, THUNDER_SONG, POTRA_SONG];

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
    }
})(window, document, undefined);

function resetClefCell(clefIndex, column) {
    console.log("resetClefCell:" + clefIndex);
    const clefRowIndex = CLEF_TABLE_ROWS - Math.floor(clefIndex / 2) - 1;
    let clefRow = clefTable.getElementsByTagName("tr")[clefRowIndex];
    let clefCell = clefRow.getElementsByTagName("td")
    console.log("clefCell:" + clefCell.length);
    if (clefCell.length > 0 && clefCell.length > column) {
        clefCell = clefCell[column];
        clefCell.innerHTML = "";
    }
}

function midiToClefIndex(midiNote) {

    let clefIndex = -1;
    for (let i = 0; i < CLEF_CODE_ARRAY[selectedClef].length; i++) {
        if (midiNote === CLEF_CODE_ARRAY[selectedClef][i]) {
            clefIndex = i;
            break;
        }
    }
    console.log("midiToClefIndex:" + midiNote + ".index:" + clefIndex + "");
    return clefIndex;
}

function setClefCell(clefIndex, column) {
    console.log("setClefCell:" + clefIndex);
    if (clefIndex > 0) {
        const clefRowIndex = CLEF_TABLE_ROWS - Math.floor(clefIndex / 2) - 1;
        let noteClass = "note-on-line";
        if (clefIndex % 2 === 0) {
            noteClass = "note-on-space";
        }
        console.log("clefRowIndex:" + clefRowIndex + " class:" + noteClass);

        setClefText(NOTE_CHAR, noteClass, clefRowIndex, column);
    }
}

function setClefText(text, textClass, clefRowIndex, column) {
    console.log("setClefText:" + text + " " + textClass + " " + clefRowIndex + " " + column);
    let clefRow = clefTable.getElementsByTagName("tr")[clefRowIndex];
    let clefCell = clefRow.getElementsByTagName("td");
    console.log("clefCell:" + clefCell.length);
    if (clefCell.length > 0 && clefCell.length > column) {
        clefCell = clefCell[column];
        clefCell.innerHTML = clefCell.innerHTML + "<span class='" + textClass + "'>" + text + "</span>";
    }
}

function start() {
    currentNoteIndex = -1;
    currentNoteTablePos = clefTable.getElementsByTagName("tr")[0].getElementsByTagName("td").length;
    mistakesText.value = INITIAL_MISTAKES;
    renderCurrentNote();

    mistakesText.value = INITIAL_MISTAKES;
    levelText.value = 1;
    scoreText.value = 0;
    hintCheckbox.readOnly = true;

}

function stop() {
    if (nextNoteTimer !== undefined) {
        clearTimeout(nextNoteTimer);
        nextNoteTimer = undefined;
        hintCheckbox.readOnly = false;

    }
}


function renderCurrentNote() {
    if (currentNoteIndex >= 0) {
        currentNote = SONG_ARRAY[currentSongIndex][currentNoteIndex];
        let clefIndex = midiToClefIndex(currentNote);
        resetClefCell(clefIndex, currentNoteTablePos);
    }
    if (currentNoteIndex < 0) {
        currentNoteIndex = 0;
    }
    currentNoteTablePos = currentNoteTablePos - 1;
    if (currentNoteTablePos < 1) {
        currentNoteTablePos = clefTable.getElementsByTagName("tr")[0].getElementsByTagName("td").length;
        //user didnt matched note, pass to next note
        currentNoteIndex = currentNoteIndex + 1;
        if (currentNoteIndex >= SONG_ARRAY[currentSongIndex].length) {
            currentNoteIndex = 0;
        }
    }
    currentNote = SONG_ARRAY[currentSongIndex][currentNoteIndex];
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
        resetClefCell(midiToClefIndex(currentNote), currentNoteTablePos);
        currentNoteTablePos = clefTable.getElementsByTagName("tr")[0].getElementsByTagName("td").length;
        currentNoteIndex = currentNoteIndex + 1;
        if (currentNoteIndex >= SONG_ARRAY[currentSongIndex].length) {
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
            console.log("noteIndex:" + noteIndex + " midiNote:" + clefMidiNote);
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
