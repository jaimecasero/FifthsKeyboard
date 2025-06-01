////////////////////////MODEL //////////////////////////////////////
const KEYBOARD_GAIN = 0.657;//the gain applied when note is pressed


const USER_NOTE_ON_HIT_EVENT = "user_note_on_hit";
const USER_FAILED_EVENT = "user_failed";
const MIDI_SELECTED_EVENT = "midi_selected";

const WHOLE_CHAR = "&#119133;";
const HALF_CHAR = "&#119134;";
const QUARTER_CHAR = "&#119135;";
const EIGHTH_CHAR = "&#119136;";
const SIXTEENTH_CHAR = "&#119137;";
const THIRTY_SECOND_CHAR = "&#119138;";

const INITIAL_MISTAKES = 0;

const DRUM_MIDI_CODE = [53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84, 86, 88]; //[F3-E6]

const CLEF_CODE_ARRAY = [DRUM_MIDI_CODE];
const CLEF_COLUMNS = 12;

var currentNote = "";//midi code for current note
var currentNoteIndex = -1; //index to NOTE_CODE arrray
var resultingClef = [];//contains midi notes of resulting clef after calculating artificial modifiers
var resultingClefArtificials = []; //contains -1 for flatten notes or  1 for sharpen
var midiData;//contains midi object after parsing midi file
var signatureType = 0; //negative for flat sigs and positive for sharp signatures. defaults to no flat/sharp
var signatureArtificials = 0; //number of artificials  in signature. defaults to no artificials


////////DOM CACHING//////////////////
var clefTable;
var inputSelect;
var scoreText;
var mistakesText;
var bpmSelect;
var detectedText;
var beatSelect;



(function (window, document, undefined) {
    window.onload = init;

    function init() {
        // the code to be called when the dom has loaded
        // #document has its nodes
        console.log("init");
        initMidi();
        //cache DOM elements for better performance
        clefTable = document.getElementById('clefTable');
        inputSelect = document.getElementById('inputSelect');
        scoreText = document.getElementById('scoreText');
        mistakesText = document.getElementById('mistakesText');
        beatSelect = document.getElementById('beatSelect');
        bpmSelect = document.getElementById('bpmSelect');
        detectedText = document.getElementById('detectedText');

        //register key handlers
        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);
        document.addEventListener(USER_NOTE_ON_HIT_EVENT, midiNoteDown, false);
        document.addEventListener(USER_FAILED_EVENT, renderUserFailed, false);
        document.addEventListener(USER_FAILED_EVENT, vibrateAction, false);
        document.addEventListener(MIDI_SELECTED_EVENT, connectMIDI, false);


        for (let i = 0; i < clefTable.getElementsByTagName("tr").length; i++) {
            for (let j = 0; j < CLEF_COLUMNS; j++) {
                let newTableCell = document.createElement("td");
                clefTable.getElementsByTagName("tr")[i].appendChild(newTableCell);
            }
        }

        loadSong();

    }
})(window, document, undefined);

function playMidiNoteAction(event) {
    //play user note to throw feedback, that should hurt your ear
    playMidiNote(event.detail.midiNote + CLEF_OCTAVE_ARRAY[clefSelect.value] * NUM_NOTES, event.detail.pressure);
}

function vibrateAction() {
    if ("vibrate" in navigator) {
        navigator.vibrate(200); // Vibrate for 200ms
    }
}


function renderUserFailed(event) {
    mistakesText.value = parseInt(mistakesText.value) + 1;
    changeTextColor(mistakesText, "red");
    setTimeout(function () {
        changeTextColor(mistakesText, "black")
    }, 500);
    //event.srcElement.style.borderColor = "red";
    //setTimeout(function() {event.srcElement.style.borderColor = "black";}, 500);
}

function noteDurationToSymbol(duration, ppq) {
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
    if (beats < 0.25) {
        return THIRTY_SECOND_CHAR;
    }
    console.log("noteDurationToSymbol:" + duration + " ppq:" + ppq + " symbol:" + symbol);

    return symbol;
}


async function loadSong() {

}

function resetClefCell(clefIndex, column) {
    if (clefIndex >= 0) {
        let cell = getClefCell(clefIndex, column);
        if (cell !== undefined) {
            cell.innerHTML = "";
        }
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
        if (resultingClef[i - 1] > midiNote) {
            console.log("previous note is bigger, so the note is not in the current key");
            if (signatureType === 1) {
                //for sharp keys set match type to flat
                clefIndex = clefTable.getElementsByTagName("tr").length - i + 1;
                matchType = 1;
            } else if (signatureType === -1 || signatureType === 0) {
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

function setClefCell(clefIndex, column, durationTicks) {
    if (clefIndex[0] >= 0) {
        let noteClass = "note-on-space";
        if (clefIndex[0] % 2 === 0) {
            noteClass = "note-on-line";
            //outer lines are just striked
            if (clefIndex[0] < 6 || clefIndex[0] > 14) {
                noteClass = "note-on-line-striked";

            }
        }

        switch (clefIndex[0]) {
            case 0:
                setClefText("-", noteClass, clefIndex[0] + 2, column);
                setClefText("-", noteClass, clefIndex[0] + 4, column);
                break;
            case 1:
                setClefText("-", noteClass, clefIndex[0] + 1, column);
                setClefText("-", noteClass, clefIndex[0] + 3, column);
                break;
            case 2:
                setClefText("-", noteClass, clefIndex[0] + 2, column);
                break;
            case 3:
                setClefText("-", noteClass, clefIndex[0] + 1, column);
                break;
            case 20:
                setClefText("-", noteClass, clefIndex[0] - 2, column);
                setClefText("-", noteClass, clefIndex[0] - 4, column);
                break;
            case 19:
                setClefText("-", noteClass, clefIndex[0] - 1, column);
                setClefText("-", noteClass, clefIndex[0] - 3, column);
                break;
            case 18:
                setClefText("-", noteClass, clefIndex[0] - 2, column);
                break;
            case 17:
                setClefText("-", noteClass, clefIndex[0] - 1, column);
                break;

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
        console.log("clefRowIndex:" + clefIndex + " class:" + " noteClass: " + noteClass);
        let noteSymbol = noteDurationToSymbol(durationTicks, midiData.header.ppq);
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
    currentNoteIndex = 0;
    mistakesText.value = INITIAL_MISTAKES;
    scoreText.value = 0;
    hintCheckbox.readOnly = true;
    renderCurrentNote();
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
    for (let i = 0; i < clefTable.getElementsByTagName("tr").length; i++) {
        for (let j = 1; j < CLEF_COLUMNS; j++) {
            resetClefCell(i, j);
        }
    }

    currentNote = adjustMidiToClef(midiData.tracks[trackSelect.value].notes[currentNoteIndex].midi);
    for (let i = 1; i < clefTable.getElementsByTagName("tr").length ; i++) {
        console.log("renderCurrentNote:" + currentNote);
        let noteAux = adjustMidiToClef(midiData.tracks[trackSelect.value].notes[currentNoteIndex + i -1].midi);
        let clefIndex = midiToClefIndex(noteAux);
        setClefCell(clefIndex,  i, midiData.tracks[trackSelect.value].notes[currentNoteIndex + i -1].durationTicks);
    }


    if (playCheckbox.checked) {
        setTimeout(() => {
            playMidiNote(currentNote, KEYBOARD_GAIN);
        }, 500);
    }
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




function playMidiNote(event, adjustedMidiNote) {
    console.log("playMidiNote:" + adjustedMidiNote + " force:" + event.pressure);

    playExtMidiNote(adjustedMidiNote, event.pressure);
}

function playMidiNoteOff(adjustedMidiNote) {
    playExtMidiNoteOff(adjustedMidiNote);
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
            //MIDI.programChange(9, 118);
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
    MIDI.noteOff(0, adjustedMidiNote, 0.5);
}

function playOscillatorNoteOff(adjustedMidiNote) {
    MIDI.noteOff(9, adjustedMidiNote, 0);
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
