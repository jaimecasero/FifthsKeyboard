////////////////////////MODEL //////////////////////////////////////
const NUM_NOTES = 12;
const NOTE_LABEL = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_MIDI_CODE = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const KEYBOARD_GAIN = 0.657;//the gain applied when note is pressed
const FLAT_CHAR = "&flat;";
const SHARP_CHAR = "&sharp;";
const NAT_CHAR = "&natur;";
const NOTE_CHAR = "&sung;";






////////DOM CACHING//////////////////
var fretSelect;
var keySelect;
var moedSelect;
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





    }
})(window, document, undefined);

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
