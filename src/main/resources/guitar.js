////////////////////////MODEL //////////////////////////////////////
const FLAT_CHAR = "&flat;";
const SHARP_CHAR = "&sharp;";
const NAT_CHAR = "&natur;";
const NOTE_CHAR = "&sung;";
const NUM_NOTES = 12;
const NOTE_LABEL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const STRING_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];
const CHORD_COLOR=["red", "orange", "yellow", "green", "blue", "purple"];


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

function calculateFretNoteIndex(stringIndex, fretIndex) {
    let openNote = STRING_TUNING[stringIndex];
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

const FRET_MARKERS = [3, 5, 7, 9,12];
const FRET_WIDTH_RATIO= 1.5;
var STRING_SEPARATION;
var STRING_SEPARATION_HALF;
const STRING_OFFSET = [10,5,0,0,-5,-10];
var FRET_SEPARATION;
function renderFretboard() {
    calculateKey();
    calculateChord();
    const ctx = fretCanvas.getContext("2d");
    STRING_SEPARATION = fretCanvas.width / STRING_TUNING.length;
    FRET_SEPARATION = fretCanvas.height / NOTE_LABEL.length;
    STRING_SEPARATION_HALF = STRING_SEPARATION/2;

    //draw strings
    for (let i=0; i < STRING_TUNING.length ; i++) {
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

        for (let j=0; j < STRING_TUNING.length ; j++) {
            drawNoteIndex(i+1, j);
        }
    }

}

function drawNoteIndex(fret, string) {

    const ctx = fretCanvas.getContext("2d");
    const NOTE_CENTER_X=STRING_SEPARATION * string + STRING_OFFSET[string] * (1 - fret / 12)  + STRING_SEPARATION_HALF;
    const FRET_OFFSET=fret * FRET_WIDTH_RATIO;
    const NOTE_CENTER_Y=FRET_SEPARATION * fret - FRET_OFFSET - 20;

    ctx.beginPath();
    ctx.fillStyle = "black";
    let keyIndex = isFretOnKey(string,fret);
    if (keyIndex > - 1) {
        ctx.fillStyle = "red";
    }
    ctx.arc(NOTE_CENTER_X, NOTE_CENTER_Y, 18, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(NOTE_CENTER_X, NOTE_CENTER_Y, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();




    ctx.fillStyle = 'black';
    let chordIndex = isFretOnChord(string,fret);
    if (chordIndex > - 1) {
        ctx.fillStyle = CHORD_COLOR[chordIndex];
    }

    ctx.font = "14px Arial";
    //make coordinate correction so text is centered in the circle
    ctx.fillText(calculateFretNote(string, fret), NOTE_CENTER_X - 5, NOTE_CENTER_Y + 5);


}








//////////////////////////// CONFIGURATION ////////////////////////////



function loadVisualization() {
    let tBodyRows = fretTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    for (let i = 0; i < tBodyRows.length; i++) {
        for (let j = 0; j < STRING_TUNING.length; j++) {
            for (let z = 0; z  < tBodyRows[i].getElementsByTagName("td")[j].classList.length; z++) {
                if (tBodyRows[i].getElementsByTagName("td")[j].classList[z].startsWith("Vis")) {
                    tBodyRows[i].getElementsByTagName("td")[j].classList.remove(tBodyRows[i].getElementsByTagName("td")[j].classList[z]);
                }
            }
            let tdClass = "";
            let note = calculateFretNote(j, i);
            switch (visualizationSelect.value) {
                case "Chord":
                    break;
                case "Natural":
                    if (!note.endsWith("b")) {
                        tdClass = "Vis" + note + visualizationSelect.value + "Class";
                    }
                    break;
                case "Artificial":
                    if (note.endsWith("b")) {
                        tdClass = "Vis" + note + visualizationSelect.value + "Class";
                    }
                    break;
                case "Fifths":
                    tdClass = "Vis" + note + visualizationSelect.value + "Class";

                    break;
            }

            //tBodyRows[i].getElementsByTagName("td")[j].classList.remove();
            if (tdClass.length > 0) {
                tBodyRows[i].getElementsByTagName("td")[j].classList.add(tdClass);
            }
        }
    }
}

function loadKey() {
    calculateKey();
    let tBodyRows = fretTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    for (let i = 0; i < tBodyRows.length; i++) {
        for (let j = 0; j < STRING_TUNING.length; j++) {
            let tdClass = "OnKey" + isFretOnKey(j, i) + "Class";
            for (let z = 0; z  < tBodyRows[i].getElementsByTagName("td")[j].classList.length; z++) {
                if (tBodyRows[i].getElementsByTagName("td")[j].classList[z].startsWith("OnKey")) {
                    tBodyRows[i].getElementsByTagName("td")[j].classList.remove(tBodyRows[i].getElementsByTagName("td")[j].classList[z]);
                }
            }
            tBodyRows[i].getElementsByTagName("td")[j].classList.add(tdClass);
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