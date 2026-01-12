////////////////////////MODEL //////////////////////////////////////
const KEYBOARD_GAIN = 0.657;//the gain applied when note is pressed

////////////////////////MODEL //////////////////////////////////////
const soundFiles = [
    "./audio/metro-1.wav", "./audio/metro-n.wav",];

const USER_NOTE_ON_HIT_EVENT = "user_note_on_hit";
const USER_FAILED_EVENT = "user_failed";
const MIDI_SELECTED_EVENT = "midi_selected";

const WHOLE_CHAR = "&#119133;";
const HALF_CHAR = "&#119134;";
const QUARTER_CHAR = "&#119135;";
const EIGHTH_CHAR = "&#119136;";
const SIXTEENTH_CHAR = "&#119137;";
const THIRTY_SECOND_CHAR = "&#119138;";

const ACOUSTIC_BASS_DRUM_MIDI=35;
const BASS_DRUM_MIDI=36;
const SIDE_STICK_MIDI=37;
const ACOUSTIC_SNARE_MIDI=38;
const HAND_CLAP_MIDI=39;
const ELECTRIC_SNARE_MIDI=40;
const LOW_FLOOR_TOM_MIDI=41;
const CLOSED_HIHAT_MIDI=42;
const HIGH_FLOOR_TOM_MIDI=43;
const PEDAL_HIHAT_MIDI=44;
const LOW_TOM_MIDI=45;
const OPEN_HI_HAT_MIDI=46;
const HI_MID_TOM=48;
const CRASH_CYMBAL_1=49;
const HIGH_TOM=50;
const RIDE_CYMBAL_1=51;
const CRASH_CYMBAL_2=57;
const INITIAL_MISTAKES = 0;

//https://musescore.org/sites/musescore.org/files/General%20MIDI%20Standard%20Percussion%20Set%20Key%20Map.pdf
const DRUM_MIDI_CODE = [[49],[42, 46],[51],[50],[47,48],[37,38,40],[],[41,45],[],[35,36],[],[44],[],[]]; //[accent,Cymbal,hh,ride,ht,mt,s,lt,k,ph]


const CLEF_COLUMNS = 16;

var currentNote = "";//midi code for current note
var currentNoteIndex = -1; //index to NOTE_CODE arrray
var drumTrack=0; //track in midi with channel 10
var midiData;//contains midi object after parsing midi file
let audioBuffers = [];

let timerID; // global or scoped outside functions
let isPlaying = false;

////////DOM CACHING//////////////////
var clefTable;
var inputSelect;
var scoreText;
var mistakesText;
var bpmSelect;
var detectedText;
var beatSelect;
var playButton;
let footRow;




(function (window, document, undefined) {
    window.onload = init;

    function init() {
        // the code to be called when the dom has loaded
        // #document has its nodes
        console.log("init");
        initOscillators();
        //initOscillators();
        //cache DOM elements for better performance
        clefTable = document.getElementById('clefTable');
        inputSelect = document.getElementById('inputSelect');
        scoreText = document.getElementById('scoreText');
        mistakesText = document.getElementById('mistakesText');
        beatSelect = document.getElementById('beatSelect');
        bpmSelect = document.getElementById('bpmSelect');
        detectedText = document.getElementById('detectedText');
        playButton = document.getElementById('playButton');
        let tFoot = clefTable.getElementsByTagName("tfoot")[0];
        footRow = tFoot.getElementsByTagName("tr")[0];

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
    //console.log("noteDurationToSymbol:" + duration + " ppq:" + ppq + " symbol:" + symbol);

    return symbol;
}


async function loadSong() {
    const response = await fetch("midi/" + beatSelect.value + ".mid");
    const arrayBuffer = await response.arrayBuffer();
    midiData = new Midi(arrayBuffer);
    console.log(midiData);
    for (let i = 0; i < midiData.tracks.length; i++) {
        //only add tracks with notes
        if (midiData.tracks[i].instrument.percussion) {
            drumTrack = i;
            console.log("identified drumTrack:" + drumTrack);
            break;
        }
    }

    start();
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
    for (let i = 0; i < DRUM_MIDI_CODE.length; i++) {
        if (DRUM_MIDI_CODE[i].indexOf(midiNote) > -1) {
            return i;
        }
    }
}

function getClefCell(clefRowIndex, column) {
    let clefRow = clefTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
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
    let clefCell = getClefCell(clefIndex, column);
    if (clefCell !== undefined) {
        clefCell.innerHTML = "<span class='" + textClass + "'>" + text + "</span>";
    }
}

function start() {
    currentNoteIndex = 0;
    mistakesText.value = INITIAL_MISTAKES;
    scoreText.value = 0;
    renderBeat();
}

function changeBpm() {
    sound_delay = (60000 / bpmSelect.value) / 4;
    console.log("delay" + sound_delay);
}


let scheduleAheadTime = 0.1; // seconds
let lookahead = 25; // ms
let nextNoteTime;
let sound_delay = 138;
let currentTime = 0;

function startPlayback() {
    nextNoteTime = audioCtx.currentTime;
    audioCtx.resume().then(() => {
        loadSounds().then(() => {
            currentTime = 0;
            nextNoteTime = audioCtx.currentTime;
            scheduler();
        });
    });
}

async function loadSounds() {
    for (let i = 0; i < soundFiles.length; i++) {
        const response = await fetch(soundFiles[i]);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await audioCtx.decodeAudioData(arrayBuffer);
        audioBuffers[i] = buffer;
    }
    console.log("sounds loaded");
}

function scheduler() {
    while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
        scheduleNote(currentTime, nextNoteTime);
        nextNote();
    }
    timerID = setTimeout(scheduler, lookahead);
}

function scheduleNote(index, when) {
    const source = audioCtx.createBufferSource();
    if (index === 0) {
        source.buffer = audioBuffers[0];
        source.connect(audioCtx.destination);
        source.start(when);
    } else {
        if (index % 4 === 0)
        {
            source.buffer = audioBuffers[0];
            source.connect(audioCtx.destination);
            source.start(when);
        }
    }



    // Delay UI update slightly to match audio
    setTimeout(() => renderNextColumn(index), (when - audioCtx.currentTime) * 1000);

}

function stop() {
    if (timerID) {
        clearTimeout(timerID);
        timerID = null;
    }
}

function playPause() {

    if (isPlaying) {
        stop();
        playButton.value = "Play";
    } else {
        startPlayback();
        playButton.value = "Pause";
    }
    isPlaying = !isPlaying;
}

async function renderNextColumn(currentTime) {

    let td = footRow.getElementsByTagName("td")[currentTime];
    td.style.background = "#D6EEEE";
    let prevTd;
    if (currentTime === 0) {
        prevTd = footRow.getElementsByTagName("td")[CLEF_COLUMNS - 1];
    } else {
        prevTd = footRow.getElementsByTagName("td")[currentTime - 1];
    }
    prevTd.style.background = "white";
}

function nextNote() {
    nextNoteTime += sound_delay / 1000;
    currentTime++;
    if (currentTime >= CLEF_COLUMNS) currentTime = 0;
}



function renderBeat() {
    for (let i = 0; i < clefTable.getElementsByTagName("tr").length; i++) {
        for (let j = 1; j < CLEF_COLUMNS; j++) {
            resetClefCell(i, j);
        }
    }

    let ppq=midiData.header.ppq/2;
    for (let i = 0; i < 16 ; i++) {
        let matchTick =  i * ppq;
        for (let j = 0; j < midiData.tracks[drumTrack].notes.length; j++) {
            if (midiData.tracks[drumTrack].notes[j].ticks === matchTick) {
                let clefIndex = midiToClefIndex(midiData.tracks[drumTrack].notes[j].midi);
                if (clefIndex > -1) {

                    let noteClass = "note-on-line";
                    if (clefIndex % 2 === 0) {
                        noteClass = "note-on-space";
                    }

                    console.log("clefRowIndex:" + clefIndex + " class:" + " noteClass: " + noteClass);
                    let noteSymbol = noteDurationToSymbol(midiData.tracks[drumTrack].notes[j].durationTicks, midiData.header.ppq);
                    switch (midiData.tracks[drumTrack].notes[j].midi) {
                        case CLOSED_HIHAT_MIDI:
                            noteSymbol = "&#119107;";
                            break;
                        case CRASH_CYMBAL_1:
                            noteSymbol = "&#119109;";
                            break;
                        case OPEN_HI_HAT_MIDI:
                            noteSymbol = "&#119109;";
                            break;
                    }
                    setClefText(noteSymbol, noteClass, clefIndex, i);
                }
            }
        }
    }
}

///////////////INPUT HANDLING/////////////////////////////////////////

function keyDownHandler(event) {
    let keyPressed = String.fromCharCode(event.keyCode);
    let midiNote = 0;
    switch (keyPressed) {
        case '7':
            midiNote = CRASH_CYMBAL_1;
            break;
        case '8':
            midiNote = HIGH_TOM;
            break;
        case '9':
            midiNote = HI_MID_TOM;
            break;
        case '0':
            midiNote = CRASH_CYMBAL_2;
            break;
        case 'U':
            midiNote = PEDAL_HIHAT_MIDI;
            break;
        case 'I':
            midiNote = OPEN_HI_HAT_MIDI;
            break;
        case 'O':
            midiNote = CLOSED_HIHAT_MIDI;
            break;
        case 'P':
            midiNote = RIDE_CYMBAL_1;
            break;
        case 'L': case "K": case 'J':
            midiNote = ACOUSTIC_SNARE_MIDI;
            break;

        case 'M': case ",":
            midiNote = ACOUSTIC_BASS_DRUM_MIDI;
            break;

    }
    if (midiNote > 0) {
        document.dispatchEvent(new CustomEvent(USER_NOTE_ON_HIT_EVENT, {
            detail: {
                midiNote: midiNote,
                pressure: event.pressure,
            }
        }));
    }

}

function keyUpHandler(event) {


}

function evaluateUserInput(midiNote, hitTime) {
    const ppq = midiData.header.ppq;
    const track = midiData.tracks[drumTrack];
    const margin = 0.1; // seconds tolerance
    let matched = false; // Track if a note was matched in the current evaluation
    console.log("length:" + track.notes.length);
    for (let i=0 ; 0 < track.notes.length; i++) {
        let expectedTime = track.notes[i].ticks / ppq;
        console.log("hitTime:" + hitTime +
            " expectedTime:" + expectedTime +
            " margin:" + margin +
            " note.midi:" + track.notes[i].midi +
            " midiNote:" + midiNote);
        if (!matched && Math.abs(hitTime - expectedTime) < margin) {
            if (track.notes[i].midi === midiNote) {
                console.log("note matched");
                changeTextColor(scoreText, "green");
                setTimeout(function () {
                    changeTextColor(scoreText, "black")
                }, 500);
                matched = true; // mark as matched
                scoreText.value = parseInt(scoreText.value) + 1;
                return true;
            }
        }
    }
    console.log("note missed or out of sequence");
    detectedText.value = "key missed or out of sequence";
    document.dispatchEvent(new CustomEvent(USER_FAILED_EVENT));
    return false;
}


function midiNoteDown(event) {
    let midiNote = event.detail.midiNote;
    const pressure = ((event.pressure == null) ? KEYBOARD_GAIN : event.pressure);
    let matched = false;
    event.pressure = pressure;
    const hitTime = event.detail.time;

    //evaluateUserInput(midiNote, hitTime);
    playMidiNote(event,midiNote);
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




function playMidiNote(event,adjustedMidiNote, force) {
    audioCtx.resume();
    //playExtMidiNote(adjustedMidiNote, event.pressure);
    playOscillatorNote(adjustedMidiNote, event.pressure);
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
        instrument: "drum",
        onprogress: (state, progress) => console.log(state, progress),
        onsuccess: () => {
            console.log("MIDI.js loaded");
            //MIDI.programChange(0, 24);
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
    console.log(force + ":" + midiVelocity)
    return midiVelocity;
}

function playOscillatorNote(adjustedMidiNote, force) {
    console.log("playOscillatorNote:" + adjustedMidiNote + ":" + force)
    MIDI.noteOn(0, adjustedMidiNote + 50, forceToMidiVelocity(force), 0);
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
    midiOut.send([NOTE_ON | midiChannel, midiNote, midiVelocity * force]);
}

function playExtMidiNoteOff(midiNote) {
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
