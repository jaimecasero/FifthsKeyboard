////////////////////////MODEL //////////////////////////////////////
const FLAT_CHAR = "&flat;";
const SHARP_CHAR = "&sharp;";
const NAT_CHAR = "&natur;";
const NOTE_CHAR = "&sung;";
const NUM_NOTES = 12;
const NOTE_LABEL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
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

const CHORD_COLOR=["red", "green", "blue", "orange", "pink", "purple"];
const IN_KEY_RADIUS=18;

const FRET_MARKERS = [3, 5, 7, 9,12];
const FRET_WIDTH_RATIO= 1.5;
var STRING_SEPARATION;
var STRING_SEPARATION_HALF;
const STRING_OFFSET = [10,5,0,0,-5,-10];
var FRET_SEPARATION;


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

        renderFretboard();
    }
})(window, document, undefined);



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
    CALCULATED_CHORD = [];
    let keyNoteOffset = parseInt(rootChordSelect.value, 10);
    console.log("root chord:" + rootChordSelect.value);
    for (let i = 0; i < CHORD_MOD_ARR[chordSelect.value].length; i++) {
        let noteIndex = (keyNoteOffset + CHORD_MOD_ARR[chordSelect.value][i]) % NOTE_LABEL.length;
        console.log("noteIndex:" + noteIndex);
        CALCULATED_CHORD.push(noteIndex);
    }
    calculatedChordInput.value = CALCULATED_CHORD.map(index => NOTE_LABEL[index]).join(",");
}

function retrieveTuning() {
    return TUNING_ARRAY[parseInt(tuningSelect.value, 10)];
}

function calculateFretNoteIndex(stringIndex, fretIndex) {
    let openNote = retrieveTuning()[stringIndex];

    let openNoteOffset = NOTE_LABEL.indexOf(openNote);
    return (fretIndex + openNoteOffset) % NOTE_LABEL.length;
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


function renderFretboard() {
    calculateKey();
    calculateChord();
    const ctx = fretCanvas.getContext("2d");
// Clear the entire canvas
    ctx.clearRect(0, 0, fretCanvas.width, fretCanvas.height);
    STRING_SEPARATION = fretCanvas.width / STD_TUNING.length;
    FRET_SEPARATION = fretCanvas.height / NOTE_LABEL.length;
    STRING_SEPARATION_HALF = STRING_SEPARATION/2;

    //draw strings
    for (let i=0; i < STD_TUNING.length ; i++) {
        ctx.beginPath();
        ctx.moveTo(STRING_SEPARATION * i + STRING_OFFSET[i] + STRING_SEPARATION_HALF, 0);
        ctx.lineTo(STRING_SEPARATION * i + STRING_SEPARATION_HALF, fretCanvas.height);
        ctx.stroke();
    }

    //draw frets & markers
    for (let i=0; i <= NOTE_LABEL.length ; i++){
        if (i === 0 ) {
            ctx.lineWidth = 10;
        }
        ctx.beginPath();
        const FRET_OFFSET=i * FRET_WIDTH_RATIO;
        const FRET_Y = FRET_SEPARATION * i - FRET_OFFSET;
        ctx.moveTo(STRING_SEPARATION_HALF, FRET_Y );
        ctx.lineTo(fretCanvas.width - STRING_SEPARATION + STRING_SEPARATION_HALF, FRET_Y);
        ctx.stroke();
        ctx.lineWidth = 1;
        if (FRET_MARKERS.indexOf(i) > -1) {
            if (i % 2 === 0) {
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.arc(STRING_SEPARATION , FRET_Y - FRET_SEPARATION / 2, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.arc(STRING_SEPARATION * 5, FRET_Y - FRET_SEPARATION / 2, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.arc(STRING_SEPARATION * 3, FRET_Y - FRET_SEPARATION / 2, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        }

        for (let j=0; j < STD_TUNING.length ; j++) {
            drawNoteIndex(i+1, j);
        }
    }

}


function drawNoteIndex(fret, string) {
    let noteIndex = calculateFretNoteIndex(string, fret);
    let note = NOTE_LABEL[noteIndex];
    let chordIndex = isFretOnChord(string,fret);
    let keyIndex = isFretOnKey(string,fret);
    const ctx = fretCanvas.getContext("2d");
    const NOTE_CENTER_X=STRING_SEPARATION * string + STRING_OFFSET[string] * (1 - fret / 12)  + STRING_SEPARATION_HALF;
    const FRET_OFFSET=fret * FRET_WIDTH_RATIO;
    const NOTE_CENTER_Y=FRET_SEPARATION * fret - FRET_OFFSET - 20;

    let radius = IN_KEY_RADIUS - 3 ;
    ctx.beginPath();
    ctx.fillStyle = "white";
    if (keyIndex > - 1) {
        radius = IN_KEY_RADIUS;
    }
    console.log("vis:" + visualizationSelect.value);
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
            console.log("color:" + ctx.fillStyle);
            break;
    }
    ctx.arc(NOTE_CENTER_X, NOTE_CENTER_Y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "white";
    if (chordIndex > - 1) {
        ctx.fillStyle = CHORD_COLOR[chordIndex];
    }
    ctx.arc(NOTE_CENTER_X, NOTE_CENTER_Y, radius - 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();




    ctx.fillStyle = 'black';
    if (chordIndex > - 1) {
        ctx.fillStyle = "white";
    }

    ctx.font = "10px Arial";
    if (keyIndex > - 1) {
        note = note + (keyIndex + 1);
        ctx.font = "bold 14px Arial";
    }
    //make coordinate correction so text is centered in the circle
    ctx.fillText(note, NOTE_CENTER_X - 10, NOTE_CENTER_Y + 5);


}








//////////////////////////// CONFIGURATION ////////////////////////////


