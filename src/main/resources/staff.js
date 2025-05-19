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

const USER_NOTE_ON_HIT_EVENT = "user_note_on_hit";
const USER_FAILED_EVENT = "user_failed";
const MICRO_SELECTED_EVENT = "microphone_selected";
const MIDI_SELECTED_EVENT = "midi_selected";

const WHOLE_CHAR = "&#119133;";
const HALF_CHAR = "&#119134;";
const QUARTER_CHAR = "&#119135;";
const EIGHTH_CHAR = "&#119136;";
const SIXTEENTH_CHAR = "&#119137;";
const THIRTY_SECOND_CHAR = "&#119138;";

const INITIAL_MISTAKES = 0;
const SPEED_CHANGE_RATIO = 0.9;

const MAJOR_TO_SIGNATURE_INDEX = [0, 5, 9, 3, 11, 1, 6, 8, 4, 10, 2, 7];
const TREBLE_MIDI_CODE = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81]; //[C4-B5]
const ALTO_MIDI_CODE =   [50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71]; //[D3-B4]
const TENOR_MIDI_CODE =  [47, 48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67]; //[B2-G4]
const BASS_MIDI_CODE =   [40, 41, 43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60]; //[E2-C4]
const GRAND_MIDI_CODE =  [40, 41, 43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81]; //[E2,B5]
const TREBLE_OCTAVE = 4;
const ALTO_OCTAVE = 3;
const TENOR_OCTAVE = 3;
const BASS_OCTAVE = 2;
const GRAND_OCTAVE = 2;
const CLEF_CODE_ARRAY = [TREBLE_MIDI_CODE, ALTO_MIDI_CODE, TENOR_MIDI_CODE, BASS_MIDI_CODE, GRAND_MIDI_CODE];
const CLEF_OCTAVE_ARRAY = [TREBLE_OCTAVE, ALTO_OCTAVE, TENOR_OCTAVE, BASS_OCTAVE, GRAND_OCTAVE];
const CLEF_COLUMNS = 12;

var currentNote = "";//midi code for current note
var currentNoteIndex = -1; //index to NOTE_CODE arrray
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
var detectedText;
var songSelect;



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
        detectedText = document.getElementById('detectedText');
        songSelect = document.getElementById('songSelect');

        const keyboardButtons = document.getElementsByName("noteButton");

// Previene el menú contextual en todos los botones
        keyboardButtons.forEach(button => {
            console.log("preventing context menu on button");
            button.addEventListener("contextmenu", (event) => {
                event.preventDefault(); // block context menu
            });
        });
        //register key handlers
        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);
        document.addEventListener(USER_NOTE_ON_HIT_EVENT, midiNoteDown, false);
        document.addEventListener(USER_FAILED_EVENT, renderUserFailed, false);
        document.addEventListener(USER_FAILED_EVENT, vibrateAction, false);
        document.addEventListener(MIDI_SELECTED_EVENT, connectMIDI, false);
        document.addEventListener(MICRO_SELECTED_EVENT, connectMicro, false);


        for (let i = 0; i < clefTable.getElementsByTagName("tr").length; i++) {
            for (let j = 0; j < CLEF_COLUMNS; j++) {
                let newTableCell = document.createElement("td");
                clefTable.getElementsByTagName("tr")[i].appendChild(newTableCell);
            }
        }

        changeClef();
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

function midiToNote(midiNote) {
    for (let i = 0; i < NOTE_LABEL.length; i++) {
        if (isSameNote(midiNote, NOTE_MIDI_CODE[i])) {
            return NOTE_LABEL[i];
        }
    }
    return "";
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
    const response = await fetch("midi/" + songSelect.value + ".mid");
    const arrayBuffer = await response.arrayBuffer();
    midiData = new Midi(arrayBuffer);
    while (trackSelect.options.length > 0) {
        trackSelect.remove(0);
    }
    for (let i = 0; i < midiData.tracks.length; i++) {
        //only add tracks with notes
        if (midiData.tracks[i].notes.length > 0) {
            let newOption = document.createElement("option");
            newOption.text = midiData.tracks[i].name + "-" + midiData.tracks[i].instrument.name;
            newOption.value = i;
            trackSelect.appendChild(newOption);
        }
    }
    signatureSelect.value = 0;
    if (midiData.header.keySignatures.length > 0) {
        let noteIndex = NOTE_LABEL.indexOf(midiData.header.keySignatures[0].key);
        if (noteIndex > -1) {
            signatureSelect.value = MAJOR_TO_SIGNATURE_INDEX[noteIndex];
        }

    }
    changeClef();
    start();
}

function resetClefCell(clefIndex, column) {
    console.log("resetClefCell:" + clefIndex + " " + column);
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
    levelText.value = 1;
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
        playMidiNote(currentNote, pressure);
        let hintRatio = hintCheckbox.checked ? 1 : 3;
        scoreText.value = parseInt(scoreText.value) + hintRatio;
        setTimeout(function () {
            changeTextColor(scoreText, "black")
        }, 500);
        changeTextColor(scoreText, "green");

        for (let i = 0; i < clefTable.getElementsByTagName("tr").length; i++) {
            for (let j = 1; j < CLEF_COLUMNS; j++) {
                resetClefCell(i, j);
            }
        }
        currentNoteIndex = currentNoteIndex + 1;
        if (currentNoteIndex >= midiData.tracks[trackSelect.value].notes.length) {
            currentNoteIndex = 0;
        }
        if (scoreText.value / (parseInt(levelText.value) * 10) > 1 && (scoreText.value % (parseInt(levelText.value) * 10)) > 0) {
            console.log("score:" + scoreText.value + " level:" + levelText.value);
            levelText.value = parseInt(levelText.value) + 1;
            changeTextColor(levelText, "green");
            setTimeout(function () {
                changeTextColor(levelText, "black")
            }, 500);
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
function changeOutput(outputMode) {
    if (changeOutput === "0") {
    } else {
        initMidi();
    }
}

function changeSong() {
    for (let i = 0; i < clefTable.getElementsByTagName("tr").length; i++) {
        for (let j = 1; j < CLEF_COLUMNS; j++) {
            resetClefCell(i, j);
        }
    }
    loadSong();
}

function changeTrack() {
    for (let i = 0; i < clefTable.getElementsByTagName("tr").length; i++) {
        for (let j = 1; j < CLEF_COLUMNS; j++) {
            resetClefCell(i, j);
        }
    }
    start();
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

function changeInput(inputIndex) {
    if (inputIndex === "0") {
    }
}

function changeClef() {
    let previousLength = clefTable.getElementsByTagName("tr").length;
    // add rows for grand clef
    if (clefSelect.value === "4") {
        let tBody = clefTable.getElementsByTagName("tbody")[0];
        let newTableRow = document.createElement("tr");
        newTableRow.className = "outside-space-clef-row";
        tBody.appendChild(newTableRow);
        newTableRow = document.createElement("tr");
        newTableRow.className = "line-clef-row";
        tBody.appendChild(newTableRow);
        newTableRow = document.createElement("tr");
        newTableRow.className = "space-clef-row";
        tBody.appendChild(newTableRow);
        newTableRow = document.createElement("tr");
        newTableRow.className = "line-clef-row";
        tBody.appendChild(newTableRow);
        newTableRow = document.createElement("tr");
        newTableRow.className = "space-clef-row";
        tBody.appendChild(newTableRow);
        newTableRow = document.createElement("tr");
        newTableRow.className = "line-clef-row";
        tBody.appendChild(newTableRow);
        newTableRow = document.createElement("tr");
        newTableRow.className = "space-clef-row";
        tBody.appendChild(newTableRow);
        newTableRow = document.createElement("tr");
        newTableRow.className = "line-clef-row";
        tBody.appendChild(newTableRow);
        newTableRow = document.createElement("tr");
        newTableRow.className = "space-clef-row";
        tBody.appendChild(newTableRow);
        newTableRow = document.createElement("tr");
        newTableRow.className = "line-clef-row";
        tBody.appendChild(newTableRow);
        newTableRow = document.createElement("tr");
        newTableRow.className = "outside-space-clef-row";
        tBody.appendChild(newTableRow);
        newTableRow = document.createElement("tr");
        newTableRow.className = "outside-line-clef-row";
        tBody.appendChild(newTableRow);
        //add table cells
        for (let i = previousLength - 1; i < clefTable.getElementsByTagName("tr").length; i++) {
            for (let j = 0; j < CLEF_COLUMNS; j++) {
                let newTableCell = document.createElement("td");
                clefTable.getElementsByTagName("tr")[i].appendChild(newTableCell);
            }
        }
    } else {
        //remove rows from grand clef
        if (previousLength > 13 ) {
            for (let i = 0; i < 12; i++) {
                clefTable.deleteRow(-1);
            }
        }
    }



    //reset first colum before calculating the new clef
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

//////////////////////  micro INPUT //////////////////////


var audioContext;
var microphone;
var pitch;
var analyser;
var buf;
var detectedCycles = 0; //number of cycles where same note was detected
const CYCLE_THRESHOLD = 10; //how many cycles to trigger use note
var lastDetectedNote = 0;

// create web audio api context
async function connectMicro() {
    console.log("micro selected");
    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
        audioContext = new AudioContext();
        microphone = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        buf = new Float32Array(2048);
        microphone.connect(analyser);


        updatePitch();

    }).catch(err => console.error(err));
}


function updatePitch() {
    analyser.getFloatTimeDomainData(buf);
    const ac = autoCorrelate(buf, audioContext.sampleRate);
    if (ac === -1) {
    } else {
        pitch = ac;
        const note = noteFromPitch(pitch);
        if (note === lastDetectedNote) {
            detectedCycles = detectedCycles + 1;
            if (detectedCycles === CYCLE_THRESHOLD) {
                lastDetectedNote = note;
                //pitch stable enough to trigger note
                detectedText.value = note + " " + midiToNote(note);
                document.dispatchEvent(new CustomEvent(USER_NOTE_ON_HIT_EVENT, {
                    detail: {
                        midiNote: note,
                        pressure: KEYBOARD_GAIN,
                    }
                }));
            }
        } else {
            detectedCycles = 0;
            lastDetectedNote = note;
        }

    }

    window.requestAnimationFrame(updatePitch);
}

function noteFromPitch(frequency) {
    let noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
}

function autoCorrelate(buf, sampleRate) {
    // Implements the ACF2+ algorithm
    var SIZE = buf.length;
    var rms = 0;

    for (var i = 0; i < SIZE; i++) {
        var val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) // not enough signal
        return -1;

    var r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (var i = 0; i < SIZE / 2; i++)
        if (Math.abs(buf[i]) < thres) {
            r1 = i;
            break;
        }
    for (var i = 1; i < SIZE / 2; i++)
        if (Math.abs(buf[SIZE - i]) < thres) {
            r2 = SIZE - i;
            break;
        }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    var c = new Array(SIZE).fill(0);
    for (var i = 0; i < SIZE; i++)
        for (var j = 0; j < SIZE - i; j++)
            c[i] = c[i] + buf[j] * buf[j + i];

    var d = 0;
    while (c[d] > c[d + 1]) d++;
    var maxval = -1, maxpos = -1;
    for (var i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    var T0 = maxpos;

    var x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    a = (x1 + x3 - 2 * x2) / 2;
    b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
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
