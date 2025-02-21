////////////////////////MODEL //////////////////////////////////////
const NUM_NOTES = 12;
const NOTE_LABEL = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_MIDI_CODE = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const KEYBOARD_GAIN = 0.657;//the gain applied when note is pressed


const CLEF_ROWS=7;
const TREBLE_MIDI_CODE = [59,60,62,64,65,67,69,71,72,74,76,77,79,81]; //[C4-B5]
const TREBLE_OCTAVE = 4;
const BASS_MIDI_CODE =   [39,40,41,43,45,47,48,50,52,53,55,57,59,60]; //[E2-C4]
const BASS_OCTAVE = 2;

const CLEF_CODE_ARRAY= [TREBLE_MIDI_CODE,BASS_MIDI_CODE];
const CLEF_OCTAVE_ARRAY= [TREBLE_OCTAVE,BASS_OCTAVE];

const NOTE_CHAR="O";

var currentNote="";
var currentNoteTablePos=1;
var currentNoteIndex=0;
var song=[71,76,79,77,69,71,72,74];
var nextNoteTimer;
var selectedClef = 0;

var speed = 1;




////////DOM CACHING//////////////////
var clefTable;
var outputSelect;
var clefSelect;

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
        //register key handlers
        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);

        changeClef(selectedClef);
    }
})(window, document, undefined);

function resetClefCell(clefIndex,column) {
    const clefRowIndex = CLEF_ROWS - Math.floor(clefIndex / 2) - 1;
    let clefRow = clefTable.getElementsByTagName("tr")[clefRowIndex];
    let clefCell = clefRow.getElementsByTagName("td")[column];
    clefCell.innerHTML = "";

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
    if (clefIndex > 0){
        const clefRowIndex = CLEF_ROWS - Math.floor(clefIndex / 2) - 1;
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
    let clefCell = clefRow.getElementsByTagName("td")[column];
    clefCell.innerHTML = clefCell.innerHTML + "<span class='" + textClass + "'>" + text + "</span>";
}

function start() {
    currentNoteIndex = 0;
    renderCurrentNote();

}


function renderCurrentNote() {
    currentNote = song[currentNoteIndex];
    let clefIndex = midiToClefIndex(currentNote);
    resetClefCell(clefIndex, currentNoteTablePos);
    currentNoteIndex = currentNoteIndex + 1;
    if (currentNoteIndex >= song.length) {
        currentNoteIndex = 0;
    }
    currentNote = song[currentNoteIndex];
    clefIndex = midiToClefIndex(currentNote);
    setClefCell(clefIndex, currentNoteTablePos);
    playMidiNote(currentNote, KEYBOARD_GAIN);
    nextNoteTimer = setTimeout(renderCurrentNote, 1000 * speed);
}

///////////////INPUT HANDLING/////////////////////////////////////////
var shiftPressed = false;
var pressedKeys=[];

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

    if (shiftPressed) {
        keyPressed = keyPressed + "#";
    }


    const noteIndex = NOTE_LABEL.findIndex((element) => element === keyPressed);
    console.log("rep:" + event.repeat)
    if (noteIndex > -1 && !event.repeat) {
        console.log("noteIndex:" + noteIndex);
        playNote(noteIndex, KEYBOARD_GAIN);
    } else {
    }
}

function keyUpHandler(event) {
    let keyPressed = String.fromCharCode(event.keyCode);
    const index = pressedKeys.indexOf(keyPressed);
    if (index !== -1) {
        pressedKeys.splice(index, 1)
    }
    if (shiftPressed) {
        keyPressed = keyPressed + "#";
    }
    const noteIndex = NOTE_LABEL.findIndex((element) => element === keyPressed);
    if (noteIndex > -1) {
        let ring = 0;
        if (event.shiftKey) {
            ring = 0;
        }
        if (event.altKey) {
            ring = 1;
        }
        if (event.ctrlKey) {
            ring = 2;
        }
        playNoteOff(noteIndex, ring);
    }

}


function keyNoteDown(event, keyIndex) {
    const pressure = ((event.pressure == null) ? KEYBOARD_GAIN : event.pressure);
    console.log("keyNoteDown:" + NOTE_MAJOR_LABEL.indexOf(keyNoteFormation[keyIndex]));
    playNote(NOTE_MAJOR_LABEL.indexOf(keyNoteFormation[keyIndex]), pressure);
}

function keyNoteUp(event, keyIndex) {
    playNoteOff(NOTE_MAJOR_LABEL.indexOf(keyNoteFormation[keyIndex]));
}

function playNote(noteIndex, force) {
    const actualMidiNote = NOTE_MAJOR_CODE[noteIndex] + octave * 12;
    playMidiNote(actualMidiNote, force);
    renderCircle();
}

function playNoteOff(noteIndex) {
    const actualMidiNote = NOTE_MAJOR_CODE[noteIndex] + octave * 12;
    playMidiNoteOff(actualMidiNote);
    renderCircle();
}


//////////////////////////// CONFIGURATION ////////////////////////////
function changeOutput(outputMode) {
    if (changeOutput === "0") {
    } else {
        initMidi();
    }
}

function changeClef(outputMode) {
    selectedClef = clefSelect.value;
    for (let i = 0; i < CLEF_ROWS; i++) {
        resetClefCell(i,0);
    }
    for (let i = 0; i < CLEF_CODE_ARRAY[selectedClef].length; i++) {
        let noteIndex = -1;
        let clefMidiNote = CLEF_CODE_ARRAY[selectedClef][i];
        do {
            noteIndex = NOTE_MIDI_CODE.findIndex(midiNote => midiNote === clefMidiNote);
            clefMidiNote = clefMidiNote - NUM_NOTES;
        } while(noteIndex < 0 && clefMidiNote > 0);
        console.log("noteIndex:" + noteIndex + " midiNote:" + clefMidiNote);
        let noteClass = "note-on-line";
        let clefIndex = CLEF_ROWS - Math.floor(i / 2) - 1;
        if (i % 2 === 0) {
            noteClass = "note-on-space";
        }
        setClefText(NOTE_LABEL[noteIndex], noteClass, clefIndex, 0);
    }
}




function playMidiNote(adjustedMidiNote, force) {
    if (outputSelect.value === "0") {
        playOscillatorNote(adjustedMidiNote, force);
    } else {
        playExtMidiNote(adjustedMidiNote, force);
    }
}

function playMidiNoteOff(adjustedMidiNote) {
    if (outputSelect.value === "0") {
        playOscillatorNoteOff(adjustedMidiNote);
    } else {
        playExtMidiNoteOff(adjustedMidiNote);
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

/////////////////////////////Ext MIDI OUTPUT///////////1///////////
const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
var extMidiOutput;
var midiOut;
var midiVelocity = 127;
var midiChannel = 0;

function initMidi() {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({sysex: true}).then(onMIDISuccess, onMIDIFailure);
    } else {
        console.log("no midi support");
    }
}

function changeMidiChannel(channel) {
    midiChannel = channel;
}

function onMIDISuccess(midiAccess) {
    console.log(midiAccess);
    extMidiOutput = midiAccess.outputs;
    const midiOutputSelect = document.getElementById('midiOutputSelect');
    for (let output of extMidiOutput.values()) {
        const opt = document.createElement('option');
        opt.value = output.id;
        opt.innerHTML = output.name;
        midiOutputSelect.appendChild(opt);
        midiOut = output;
    }
}

function changeMidiOutput() {
    const midiOutputSelect = document.getElementById('midiOutputSelect');
    for (let output of extMidiOutput.values()) {
        if (output.id === midiOutputSelect.value) {
            midiOut = output;
            break;
        }
    }
}

function playExtMidiNote(midiNote, force) {
    console.log("turn on:" + midiNote);
    midiOut.send([NOTE_ON | midiChannel, midiNote, midiVelocity * force]);
}

function playExtMidiNoteOff(midiNote) {
    console.log("turn off:" + midiNote);
    midiOut.send([NOTE_OFF | midiChannel, midiNote, midiVelocity]);
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}
