////////////////////////MODEL //////////////////////////////////////
const FLAT_CHAR = "&flat;";
const SHARP_CHAR = "&sharp;";
const NAT_CHAR = "&natur;";
const NOTE_CHAR = "&sung;";
const FRET_NUM = 13;
const NUM_NOTES = 12;
const NOTE_LABEL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTE_MIDI_CODE = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const STRING_OCTAVE = [2,2,3,3,3,4];
const NOTE_FIFTHS_COLOR = ['#FF3333', '#33FF8D', '#FF8A33', '#3358FF', '#FFFC33', '#FF33C1', '#33FF33', '#FF6133', '#33FCFF', '#FFB233', '#A833FF', '#93FF33'];

const STD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];
const FOURTHS_TUNING = ['E', 'A', 'D', 'G', 'C', 'F'];
const DROPD_TUNING = ['D', 'A', 'D', 'G', 'C', 'F'];
const DAD_TUNING = ['D', 'A', 'D', 'G', 'A', 'D'];
const OPEND_TUNING = ['D', 'A', 'D', 'Gb', 'A', 'D'];
const OPENE_TUNING = ['E', 'B', 'E', 'Ab', 'B', 'E'];
const OPENG_TUNING = ['D', 'G', 'D', 'G', 'B', 'D'];
const OPENA_TUNING = ['E', 'A', 'E', 'A', 'Db', 'E'];
const OPENC6_TUNING = ['C', 'A', 'C', 'G', 'C', 'E'];
const OPENC_TUNING = ['C', 'G', 'C', 'G', 'C', 'E'];

const TUNING_ARRAY= [STD_TUNING,FOURTHS_TUNING, DROPD_TUNING, DAD_TUNING, OPEND_TUNING, OPENE_TUNING, OPENG_TUNING, OPENA_TUNING, OPENC6_TUNING, OPENC_TUNING];

const CHORD_COLOR=["red", "green", "blue", "orange", "pink", "purple", "brown", "brown", "black", "white"];
const IN_KEY_RADIUS=14;
const IN_KEY_STYLE="bold 10px Arial";

const FRET_MARKERS = [3, 5, 7, 9,12];
const FRET_WIDTH_RATIO= 1.5;
var STRING_SEPARATION;
var STRING_SEPARATION_HALF;
const STRING_OFFSET = [10,5,0,0,-6,-11];
var FRET_SEPARATION;
var FRET_SEPARATION_ARRAY=[];

const LYDIAN_INTERVAL = [0, 2, 4, 6, 7, 9, 11];
const IONIAN_INTERVAL = [0, 2, 4, 5, 7, 9, 11];
const MIXOLYDIAN_INTERVAL = [0, 2, 4, 5, 7, 9, 10];
const DORIAN_INTERVAL = [0, 2, 3, 5, 7, 9, 10];
const AEOLIAN_INTERVAL = [0, 2, 3, 5, 7, 8, 10];
const PRHYGIAN_INTERVAL = [0, 1, 3, 5, 7, 8, 10];
const LOCRIAN_INTERVAL = [0, 1, 3, 5, 6, 8, 10];
const ACOUSTIC_INTERVAL = [0, 2, 4, 6, 7, 9, 10];
const HARMONIC_MINOR_INTERVAL = [0, 2, 3, 5, 7, 8, 11];
const MELODIC_MINOR_INTERVAL = [0, 2, 3, 5, 7, 9, 11];
const PHRYGIAN_DOM_INTERVAL = [0, 1, 4, 5, 7, 8, 10];
const DOUBLE_HARMONIC = [0, 1, 4, 5, 7, 8, 11];
const KEY_MODE_INTERVAL = [LYDIAN_INTERVAL, IONIAN_INTERVAL, MIXOLYDIAN_INTERVAL, DORIAN_INTERVAL, AEOLIAN_INTERVAL, PRHYGIAN_INTERVAL, LOCRIAN_INTERVAL, ACOUSTIC_INTERVAL, HARMONIC_MINOR_INTERVAL, MELODIC_MINOR_INTERVAL, PHRYGIAN_DOM_INTERVAL, DOUBLE_HARMONIC];


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
const ELEVENTH_FORMULA = [0, 4, 7, 10, 14, 17];
const THIRTEENTH_FORMULA = [0, 4, 7, 10, 14, 17, 21];
const CHORD_MOD_ARR = [MAJOR_FORMULA, MINOR_FORMULA, SUS2_FORMULA, SUS4_FORMULA, DIM_FORMULA, SIXTH_FORMULA, MINOR_SIXTH_FORMULA, MAJOR7_FORMULA, SEVENTH_FORMULA, MINOR7_FORMULA, NINTH_FORMULA, ELEVENTH_FORMULA, THIRTEENTH_FORMULA];

///// Data Model /////
let CALCULATED_KEY = [];
let CALCULATED_CHORD = [];

////////DOM CACHING//////////////////
var keySelect;
var modeSelect;
var rootChordSelect;
var chordSelect;
var visualizationSelect;
var fretCanvas;
var calculatedKeyInput;
var calculatedChordInput;
var tuningSelect;


(function (window, document, undefined) {
    window.onload = init;

    function init() {
        // the code to be called when the dom has loaded
        // #document has its nodes
        console.log("init");
        initOscillators();
        //cache DOM elements for better performance
        keySelect = document.getElementById('keySelect');
        modeSelect = document.getElementById('modeSelect');
        rootChordSelect = document.getElementById('rootChordSelect');
        chordSelect = document.getElementById('chordSelect');
        visualizationSelect = document.getElementById('visualizationSelect');
        fretCanvas = document.getElementById('fretCanvas');
        calculatedKeyInput = document.getElementById('calculatedKeyInput');
        calculatedChordInput = document.getElementById('calculatedChordInput');
        tuningSelect = document.getElementById('tuningSelect');

        for (let i=0; i <= FRET_NUM; i++) {
            let sep = calculateFretHeight(i);
            FRET_SEPARATION_ARRAY.push(sep);
        }
        STRING_SEPARATION = fretCanvas.width / STD_TUNING.length;
        STRING_SEPARATION_HALF = STRING_SEPARATION/2;
        renderFretboard();

        //register multitouch listener
        fretCanvas.addEventListener('touchstart', function (event) {
            event.preventDefault();
            //resume audiocontext on canvas touch

            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                const rect = fretCanvas.getBoundingClientRect();
                //transpose touch coordinates to canvas
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                let force = 1.0;
                if (touch.force > 0) {
                    force = touch.force;
                }
                canvasDownXY(x, y, force);
            }
        }, false);
        fretCanvas.addEventListener('touchend', function (event) {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                const rect = fretCanvas.getBoundingClientRect();
                //transpose touch coordinates to canvas
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                canvasUpXY(x, y);
            }
        }, false);
    }
})(window, document, undefined);


function canvasDownXY(x, y, force) {

    let stringIndex= Math.floor(x / STRING_SEPARATION);
    let fretIndex = 0;
    for (let i = 0; i < FRET_SEPARATION_ARRAY.length; i++) {
        if (y < FRET_SEPARATION_ARRAY[i]) {
            fretIndex = i;
            break;
        }
    }
    let openStringIndex = 12 - calculateFretNoteIndex(stringIndex, 0);
    let noteIndex = calculateFretNoteIndex(stringIndex, fretIndex);
    let noteOctave = 0;
    if (fretIndex >= openStringIndex) {
        noteOctave = noteOctave + 12;
    }
    console.log("noteIndex:" + noteIndex);

    let resultingMidi = NOTE_MIDI_CODE[noteIndex] + (12 * STRING_OCTAVE[stringIndex]) + noteOctave;
    console.log("midi:" + resultingMidi);
    playOscillatorNote(resultingMidi, force);
}



function canvasUpXY(x, y) {
    console.log("up:" + x + "," + y);

}


///////////////////////// music utils /////////////////////////
function calculateKey() {
    CALCULATED_KEY = [];
    let keyNoteOffset = parseInt(keySelect.value, 10);
    for (let i = 0; i < KEY_MODE_INTERVAL[modeSelect.value].length; i++) {
        let keyDegreeIndex = (keyNoteOffset + KEY_MODE_INTERVAL[modeSelect.value][i]) % NOTE_LABEL.length;
        CALCULATED_KEY.push(keyDegreeIndex);
    }
    calculatedKeyInput.value = CALCULATED_KEY.map(index => NOTE_LABEL[index]).join(",");
}

function calculateChord() {
    let rootNote = parseInt(rootChordSelect.value, 10);
    CALCULATED_CHORD = calculateChordByIndex(rootNote, chordSelect.value);
    calculatedChordInput.value = CALCULATED_CHORD.map(index => NOTE_LABEL[index]).join(",");
}
function calculateChordByIndex(rootNote, chordType) {
    let calculatedChordArray = [];
    for (let i = 0; i < CHORD_MOD_ARR[chordType].length; i++) {
        let noteIndex = (rootNote + CHORD_MOD_ARR[chordType][i]) % NOTE_LABEL.length;
        calculatedChordArray.push(noteIndex);
    }
    return calculatedChordArray;

}

function retrieveTuning() {
    return TUNING_ARRAY[parseInt(tuningSelect.value, 10)];
}

function calculateFretNoteIndex(stringIndex, fretIndex) {
    let openNote = retrieveTuning()[stringIndex];

    let openNoteOffset = NOTE_LABEL.indexOf(openNote);
    return (fretIndex + openNoteOffset - 1) % NOTE_LABEL.length;
}

function calculateFretNote(stringIndex, fretIndex) {
    let noteIndex = calculateFretNoteIndex(stringIndex, fretIndex);
    return NOTE_LABEL[noteIndex];
}
function isFretOnKey(stringIndex, fretIndex) {
    let fretNoteIndex = calculateFretNoteIndex(stringIndex, fretIndex);
    return CALCULATED_KEY.indexOf(fretNoteIndex);
}

function isFretOnChord(stringIndex, fretIndex) {
    let fretNoteIndex = calculateFretNoteIndex(stringIndex, fretIndex);
    return CALCULATED_CHORD.indexOf(fretNoteIndex);
}

function calculateFretHeight(fretIndex) {
    let wholeFret = (fretCanvas.height * 2) - 150; //150 gives some space to reach 12 fret in canvas
    return wholeFret - (wholeFret / (2 ** (fretIndex /12)));
}

////////////////////////////// rendering //////////////////////////

function renderFretboard() {
    calculateKey();
    calculateChord();

    for (let i=0; i < CHORD_MOD_ARR.length ; i++) {
        const resultingChord = calculateChordByIndex(parseInt(rootChordSelect.value, 10), i);
        let chordInkey = true;
        for (let j=0; j < resultingChord.length ; j++) {
            chordInkey = chordInkey && CALCULATED_KEY.indexOf(resultingChord[j]) > -1;
        }
        if (chordInkey) {
            chordSelect.options[i].style.backgroundColor = "lightgreen";
        } else {
            chordSelect.options[i].style.backgroundColor = "red";
        }
    }

    const ctx = fretCanvas.getContext("2d");
    // Clear the entire canvas
    ctx.clearRect(0, 0, fretCanvas.width, fretCanvas.height);


    //draw strings
    for (let i=0; i < STD_TUNING.length ; i++) {
        ctx.beginPath();
        ctx.moveTo(STRING_SEPARATION * i + STRING_OFFSET[i] + STRING_SEPARATION_HALF, 0);
        ctx.lineTo(STRING_SEPARATION * i + STRING_SEPARATION_HALF, fretCanvas.height);
        ctx.stroke();
    }

    //draw frets & markers
    for (let i=0; i <= FRET_NUM ; i++){

        if (i === 1 ) {
            //draw nut line thicker
            ctx.lineWidth = 5;
        }
        ctx.beginPath();
        const FRET_Y = FRET_SEPARATION_ARRAY[i];
        const FRET_OFFSET=FRET_Y - calculateFretHeight(i -1);
        FRET_SEPARATION = FRET_OFFSET;
        ctx.moveTo(STRING_SEPARATION_HALF, FRET_Y );
        ctx.lineTo(fretCanvas.width - STRING_SEPARATION + STRING_SEPARATION_HALF, FRET_Y);
        ctx.stroke();
        ctx.lineWidth = 1;

        //draw fret markers if appropriate
        if (FRET_MARKERS.indexOf(i - 1 ) > -1) {
            let markerHeight = FRET_Y - ( FRET_OFFSET ) / 2;
            if ((i - 1)  % 2 === 0) {
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.arc(STRING_SEPARATION , markerHeight, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.arc(STRING_SEPARATION * 5, markerHeight, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.arc(STRING_SEPARATION * 3, markerHeight, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        }

        //draw the notes on top of frets//strings
        for (let j=0; j < STD_TUNING.length ; j++) {
            drawNoteIndex(i+1, j);
        }
    }

}


function drawNoteIndex(fret, string) {
    let noteIndex = calculateFretNoteIndex(string, fret);
    let note = NOTE_LABEL[noteIndex];
    let chordIndex = isFretOnChord(string,fret);
    let noteDegree =CALCULATED_KEY.indexOf(noteIndex);
    let keyIndex = isFretOnKey(string,fret);
    let modeIndex = parseInt(modeSelect.value, 10);
    const ctx = fretCanvas.getContext("2d");
    const NOTE_CENTER_X=STRING_SEPARATION * string + STRING_OFFSET[string] * (1 - fret / 12)  + STRING_SEPARATION_HALF;
    let currentFretHeight = calculateFretHeight(fret);
    const FRET_OFFSET= FRET_SEPARATION / 2;
    const NOTE_CENTER_Y= currentFretHeight - FRET_OFFSET;
    let radius = IN_KEY_RADIUS - 3 ;

    if (visualizationSelect.value === "Chair") {
        if ((modeIndex < 3 && (noteDegree === 6)) ||
            (modeIndex > 2 && (noteDegree === 1))) {
            //if root note draw chair left
            ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 6;
            let targetY = NOTE_CENTER_Y + FRET_SEPARATION * 4;
            if (modeIndex===2 || modeIndex === 5) {
                //mixolydian/phrigian adds one fret
                targetY = targetY + FRET_SEPARATION;
            }
            ctx.moveTo(NOTE_CENTER_X, NOTE_CENTER_Y);
            ctx.lineTo(NOTE_CENTER_X, targetY);
            ctx.stroke();
        }
        if ((modeIndex < 3 && (noteDegree === 0)) ||
            (modeIndex > 2 && (noteDegree === 2))) {
            //if root note chair bottom
            ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 6;
            ctx.moveTo(NOTE_CENTER_X, NOTE_CENTER_Y);
            let targetY = NOTE_CENTER_Y;
            if (tuningSelect.value === "0" && string === 3) {
                targetY = NOTE_CENTER_Y + FRET_SEPARATION;
            }
            if (modeIndex===0 || modeIndex === 3) {
                //lydian/dorian adds one fret
                targetY = targetY + FRET_SEPARATION;
            }
            ctx.lineTo(NOTE_CENTER_X + STRING_SEPARATION, targetY);
            ctx.stroke();
        }
        if ((modeIndex < 3 && (noteDegree === 4 || noteDegree === 3)) ||
            (modeIndex > 2 && (noteDegree === 5 || noteDegree === 6))) {
            //if forth/fifth degree draw chair right
            ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 6;
            ctx.moveTo(NOTE_CENTER_X, NOTE_CENTER_Y);
            ctx.lineTo(NOTE_CENTER_X, NOTE_CENTER_Y + FRET_SEPARATION * 2);
            ctx.stroke()
        }
    }

    //stack/rectangle lines
    if (visualizationSelect.value === "Stack") {
        if ( (modeIndex<3 && (noteDegree === 0 || noteDegree === 1)) ||
            (modeIndex>2 && ( noteDegree === 2 || noteDegree === 3))) {
            //if root note draw bottom/top stack
            ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 6;
            ctx.moveTo(NOTE_CENTER_X, NOTE_CENTER_Y);
            ctx.lineTo(NOTE_CENTER_X, NOTE_CENTER_Y + FRET_SEPARATION * 2 );
            ctx.stroke()
        }
        if ((modeIndex<3 && (noteDegree === 5 || noteDegree === 2)) ||
            (modeIndex>2 && (noteDegree === 0 || noteDegree === 4))) {
            //top/bottom rectangle
            ctx.beginPath();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 6;
            ctx.moveTo(NOTE_CENTER_X, NOTE_CENTER_Y);
            ctx.lineTo(NOTE_CENTER_X, NOTE_CENTER_Y + FRET_SEPARATION * 3 - FRET_OFFSET);
            ctx.stroke()
        }

        if ( (modeIndex<3 && (noteDegree ===1 || noteDegree === 4 || noteDegree === 2 || noteDegree === 5 )) ||
            ( modeIndex>2 && (noteDegree === 6 || noteDegree === 3 || noteDegree === 0 || noteDegree === 4 ))) {
            //stack line
            ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 6;
            ctx.moveTo(NOTE_CENTER_X, NOTE_CENTER_Y);
            let targetY = NOTE_CENTER_Y;
            if (tuningSelect.value === "0" && string === 3) {
                targetY = NOTE_CENTER_Y + FRET_SEPARATION;
            }
            ctx.lineTo(NOTE_CENTER_X + STRING_SEPARATION, targetY);
            ctx.stroke()

        }
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
    }
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;


    if (keyIndex > - 1 || chordIndex > -1) {
        radius = IN_KEY_RADIUS - 3;

        ctx.beginPath();
        ctx.fillStyle = "white";
        if (keyIndex > -1) {
            radius = IN_KEY_RADIUS;
        }
        switch (visualizationSelect.value) {
            case "Natural":
                if (note.endsWith("b")) {
                    ctx.fillStyle = "grey";
                } else {
                    ctx.fillStyle = "white";
                }
                break;
            case "Fifths":
                ctx.fillStyle = NOTE_FIFTHS_COLOR[noteIndex];
                break;
        }
        ctx.arc(NOTE_CENTER_X, NOTE_CENTER_Y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "white";
        if (chordIndex > -1) {
            ctx.fillStyle = CHORD_COLOR[chordIndex];
        }
        ctx.arc(NOTE_CENTER_X, NOTE_CENTER_Y, radius - 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();


        // text inside circle
        ctx.fillStyle = 'black';
        if (chordIndex > -1) {
            ctx.fillStyle = "white";
        }

        ctx.font = "10px Arial";
        if (keyIndex > -1) {
            note = note + (keyIndex + 1);
            ctx.font = IN_KEY_STYLE;

        }
        //make coordinate correction so text is centered in the circle
        ctx.fillText(note, NOTE_CENTER_X - 8, NOTE_CENTER_Y + 4);
    }

}








////////////////////// built-in midi OUTPUT //////////////////////

// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext);


function initOscillators() {

    MIDI.loadPlugin({
        soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FatBoy/",
        instruments: "acoustic_guitar_nylon",
        onprogress: (state, progress) => console.log(state, progress),
        onsuccess: () => {
            console.log("MIDI.js loaded");
            MIDI.programChange(0, 24);
        },
        onerror: (e) => {
            window.alert("Failed to load midi:" + e.message);
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
    let velocity = forceToMidiVelocity(force);
    console.log("play:" + adjustedMidiNote + "," + velocity);
    MIDI.noteOn(0, adjustedMidiNote, velocity,0);
    const pitchBendValue = 5; // Valor neutro (sin bend)
    const msb = Math.floor(pitchBendValue / 128); // Byte más significativo
    const lsb = pitchBendValue % 128; // Byte menos significativo

    // Enviar el mensaje midi para pitch bend
    //MIDI.pitchBend(0, msb, lsb);

    //MIDI.noteOff(0, adjustedMidiNote,  0.75);
}

function playOscillatorNoteOff(adjustedMidiNote) {
    MIDI.noteOff(0, adjustedMidiNote, 0);
}

