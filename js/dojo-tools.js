"use strict";

//-------------------------------------------------------------- General definitions

const DEBUG = false;

const ANIMATE = 1;

const ALL_KEYS = ['hh', 'hl', 'hn', 'nv'];

const TYPE_LABELS = {NC: "Norm-Conserving",JTH: "PAW"};
const REL_LABELS = {SR: "Scalar",FR: "Fully"};
const ALLOWED_FORMATS = ["djrepo","in","psml","psp8","upf"];

function humanize(size) {
        var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        var ord = Math.floor(Math.log(size) / Math.log(1024));
        ord = Math.min(Math.max(0, ord), units.length - 1);
        var s = Math.round((size / Math.pow(1024, ord)) * 100) / 100;
        return s + ' ' + units[ord];
}

const COLORS = {
  "bg_hydrogen": "#C5CEFF",
  "bg_alkali": "#A3B2D7",
  "bg_alkaline": "#A7C0D2",
  "bg_transition_metal":"#BBECE2",
  "bg_post_transition_metal": "#C7E1C2",
  "bg_metalloid": "#E3DFBE",
  "bg_nonmetal": "#E5C9A9",
  "bg_halogen": "#D29292",
  "bg_noble_gas": "#D26969",
  "bg_lanthanoid": "#DFF4EA",
  "bg_actinoid": "#F4D6D6",
  "bg_she": "#82E0AA",
  "bg_unknown": "#E3E3E3"
};

const elements = [
  [1,"H","Hydrogen","bg_hydrogen","1s"],
  [2,"He","Helium","bg_noble_gas","1s"],
  [3,"Li","Lithium","bg_alkali","2s"],
  [4,"Be","Beryllium","bg_alkaline","2s"],
  [5,"B","Boron","bg_metalloid","2s 2p"],
  [6,"C","Carbon","bg_nonmetal","2s 2p"],
  [7,"N","Nitrogen","bg_nonmetal","2s 2p"],
  [8,"O","Oxygen","bg_nonmetal","2s 2p"],
  [9,"F","Fluorine","bg_halogen","2s 2p"],
  [10,"Ne","Neon","bg_noble_gas","2s 2p"],
  [11,"Na","Sodium","bg_alkali","2p 3s"],
  [12,"Mg","Magnesium","bg_alkaline","2p 3s"],
  [13,"Al","Aluminum","bg_post_transition_metal","3s 3p"],
  [14,"Si","Silicon","bg_metalloid","3s 3p"],
  [15,"P","Phosphorus","bg_nonmetal","3s 3p"],
  [16,"S","Sulfur","bg_nonmetal","3s 3p"],
  [17,"Cl","Chlorine","bg_halogen","3s 3p"],
  [18,"Ar","Argon","bg_noble_gas","3s 3p"],
  [19,"K","Potassium","bg_alkali","4s 3p 3s 2p 2s 1s"],
  [20,"Ca","Calcium","bg_alkaline","4s 3p 3s 2p 2s 1s"],
  [21,"Sc","Scandium","bg_transition_metal","3d 4s 3p 3s 2p 2s"],
  [22,"Ti","Titanium","bg_transition_metal","3d 4s 3p 3s 2p 2s"],
  [23,"V","Vanadium","bg_transition_metal","3d 4s 3p 3s 2p 2s"],
  [24,"Cr","Chromium","bg_transition_metal","3d 4s 3p 3s 2p 2s"],
  [25,"Mn","Manganese","bg_transition_metal","3d 4s 3p 3s 2p 2s"],
  [26,"Fe","Iron","bg_transition_metal","3d 4s 3p 3s 2p 2s"],
  [27,"Co","Cobalt","bg_transition_metal","3d 4s 3p 3s 2p 2s"],
  [28,"Ni","Nickel","bg_transition_metal","3d 4s 3p 3s 2p 2s"],
  [29,"Cu","Copper","bg_transition_metal","3d 4s 3p 3s 2p 2s"],
  [30,"Zn","Zinc","bg_transition_metal","3d 4s 3p 3s 2p 2s"],
  [31,"Ga","Gallium","bg_post_transition_metal","3s 3p 4s 3d 4p"],
  [32,"Ge","Germanium","bg_post_transition_metal","3s 3p 4s 3d 4p"],
  [33,"As","Arsenic","bg_metalloid","3s 3p 4s 3d 4p"],
  [34,"Se","Selenium","bg_nonmetal","3s 3p 4s 3d 4p"],
  [35,"Br","Bromine","bg_halogen","3s 3p 4s 3d 4p"],
  [36,"Kr","Krypton","bg_noble_gas","3s 3p 4s 3d 4p"],
  [37,"Rb","Rubidium","bg_alkali","4s 3d 4p 5s 4d 5p"],
  [38,"Sr","Strontium","bg_alkaline","4s 3d 4p 5s 4d 5p"],
  [39,"Y","Yttrium","bg_transition_metal","4d 5s 4p 4s 3d 4p"],
  [40,"Zr","Zirconium","bg_transition_metal","4d 5s 4p 4s 3d 4p"],
  [41,"Nb","Niobium","bg_transition_metal","4d 5s 4p 4s 3d 4p"],
  [42,"Mo","Molybdenum","bg_transition_metal","4d 5s 4p 4s 3d 4p"],
  [43,"Tc","Technetium","bg_transition_metal","4d 5s 4p 4s 3d 4p"],
  [44,"Ru","Ruthenium","bg_transition_metal","4d 5s 4p 4s 3d 4p"],
  [45,"Rh","Rhodium","bg_transition_metal","4d 5s 4p 4s 3d 4p"],
  [46,"Pd","Palladium","bg_transition_metal","4d 5s 4p 4s 3d 4p"],
  [47,"Ag","Silver","bg_transition_metal","4d 5s 4p 4s 3d 4p"],
  [48,"Cd","Cadmium","bg_transition_metal","4d 5s 4p 4s 3d 4p"],
  [49,"In","Indium","bg_post_transition_metal","4s 4p 5s 4d 5p"],
  [50,"Sn","Tin","bg_post_transition_metal","4s 4p 5s 4d 5p"],
  [51,"Sb","Antimony","bg_metalloid","4s 4p 5s 4d 5p"],
  [52,"Te","Tellurium","bg_metalloid","4s 4p 5s 4d 5p"],
  [53,"I","Iodine","bg_halogen","4s 4p 5s 4d 5p"],
  [54,"Xe","Xenon","bg_noble_gas","4s 4p 5s 4d 5p"],
  [55,"Cs","Cesium","bg_alkali","5s 4d 5p 6s 5d 6p"],
  [56,"Ba","Barium","bg_alkaline","5s 4d 5p 6s 5d 6p"],
  [57,"La","Lanthanum","bg_lanthanoid","5d 6s 5p 5s 4d 5p"],
  [58,"Ce","Cerium","bg_lanthanoid","4f 5d 6s 5p 5s 4d"],
  [59,"Pr","Praseodym.","bg_lanthanoid","4f 6s 5p 5s 4d"],
  [60,"Nd","Neodymium","bg_lanthanoid","4f 6s 5p 5s 4d"],
  [61,"Pm","Promethium","bg_lanthanoid","4f 6s 5p 5s 4d"],
  [62,"Sm","Samarium","bg_lanthanoid","4f 6s 5p 5s 4d"],
  [63,"Eu","Europium","bg_lanthanoid","4f 6s 5p 5s 4d"],
  [64,"Gd","Gadolinium","bg_lanthanoid","4f 5d 6s 5p 5s 4d"],
  [65,"Tb","Terbium","bg_lanthanoid","4f 6s 5p 5s 4d"],
  [66,"Dy","Dysprosium","bg_lanthanoid","4f 6s 5p 5s 4d"],
  [67,"Ho","Holmium","bg_lanthanoid","4f 6s 5p 5s 4d"],
  [68,"Er","Erbium","bg_lanthanoid","4f 6s 5p 5s 4d"],
  [69,"Tm","Thulium","bg_lanthanoid","4f 6s 5p 5s 4d"],
  [70,"Yb","Ytterbium","bg_lanthanoid","4f 6s 5p 5s 4d"],
  [71,"Lu","Lutetium","bg_lanthanoid","4f 5d 6s 5p 5s 4d"],
  [72,"Hf","Hafnium","bg_transition_metal","5d 6s 5p 5s 4d"],
  [73,"Ta","Tantalum","bg_transition_metal","5d 6s 5p 5s 4d"],
  [74,"W","Tungsten","bg_transition_metal","5d 6s 5p 5s 4d"],
  [75,"Re","Rhenium","bg_transition_metal","5d 6s 5p 5s 4d"],
  [76,"Os","Osmium","bg_transition_metal","5d 6s 5p 5s 4d"],
  [77,"Ir","Iridium","bg_transition_metal","5d 6s 5p 5s 4d"],
  [78,"Pt","Platinum","bg_transition_metal","5d 6s 5p 5s 4d"],
  [79,"Au","Gold","bg_transition_metal","5d 6s 5p 5s 4d"],
  [80,"Hg","Mercury","bg_transition_metal","5d 6s 5p 5s 4d"],
  [81,"Tl","Thallium","bg_post_transition_metal","6p 5d 6s 5p 5s 4d"],
  [82,"Pb","Lead","bg_post_transition_metal","6p 5d 6s 5p 5s 4d"],
  [83,"Bi","Bismuth","bg_post_transition_metal","6p 5d 6s 5p 5s 4d"],
  [84,"Po","Polonium","bg_metalloid","6p 5d 6s 5p 5s 4d"],
  [85,"At","Astatine","bg_halogen","6p 5d 6s 5p 5s 4d"],
  [86,"Rn","Radon","bg_noble_gas","6p 5d 6s 5p 5s 4d"],
  [87,"Fr","Francium","bg_alkali","7s 6p 5d 6s 5p 5s"],
  [88,"Ra","Radium","bg_alkaline","7s 6p 5d 6s 5p 5s"],
  [89,"Ac","Actinoid","bg_actinoid","6d 7s 6p 5d 6s 5p"],
  [90,"Th","Thorium","bg_actinoid","6d 7s 6p 5d 6s 5p"],
  [91,"Pa","Protactinium","bg_actinoid","5f 6d 7s 6p 5d 6s"],
  [92,"U","Uranium","bg_actinoid","5f 6d 7s 6p 5d 6s"],
  [93,"Np","Neptunium","bg_actinoid","5f 6d 7s 6p 5d 6s"],
  [94,"Pu","Plutonium","bg_actinoid","5f 7s 6p 5d 7s 6p"],
  [95,"Am","Americium","bg_actinoid","5f 7s 6p 5d 7s 6p"],
  [96,"Cm","Curium","bg_actinoid","5f 6d 7s 6p 5d 7s"],
  [97,"Bk","Berkelium","bg_actinoid","5f 7s 6p 5d 7s 6p"],
  [98,"Cf","Californium","bg_actinoid","5f 7s 6p 5d 7s 6p"],
  [99,"Es","Einsteinium","bg_actinoid","5f 7s 6p 5d 7s 6p"],
  [100,"Fm","Fermium","bg_actinoid","5f 7s 6p 5d 7s 6p"],
  [101,"Md","Mendelev.","bg_actinoid","5f 7s 6p 5d 7s 6p"],
  [102,"No","Nobelium","bg_actinoid","5f 7s 6p 5d 7s 6p"],
  [103,"Lr","Lawrencium","bg_actinoid","5f 6d 7s 6p 5d 7s"],
  [104,"Rf","Rutherford.","bg_unknown","6d 7s 6p 5d 7s 6p"],
  [105,"Db","Dubnium","bg_unknown","6d 7s 6p 5d 7s 6p"],
  [106,"Sg","Seaborgium","bg_unknown","6d 7s 6p 5d 7s 6p"],
  [107,"Bh","Bohrium","bg_unknown","6d 7s 6p 5d 7s 6p"],
  [108,"Hs","Hassium","bg_unknown","6d 7s 6p 5d 7s 6p"],
  [109,"Mt","Meitnerium","bg_unknown","6d 7s 6p 5d 7s 6p"],
  [110,"Ds","Darmstadt.","bg_unknown","6d 7s 6p 5d 7s 6p"],
  [111,"Rg","Roentgen.","bg_unknown","6d 7s 6p 5d 7s 6p"],
  [112,"Cn","Copernicium","bg_unknown","6d 7s 6p 5d 7s 6p"],
  [113,"Nh","Nihonium","bg_unknown","7p 6d 7s 6p 5d 7s"],
  [114,"Fl","Flerovium","bg_unknown","7p 6d 7s 6p 5d 7s"],
  [115,"Mc","Moscovium","bg_unknown","7p 6d 7s 6p 5d 7s"],
  [116,"Lv","Livermorium","bg_unknown","7p 6d 7s 6p 5d 7s"],
  [117,"Ts","Tennessine","bg_unknown","7p 6d 7s 6p 5d 7s"],
  [118,"Og","Oganesson","bg_unknown","7p 6d 7s 6p 5d 7s"]
];

const contributors = [
  {
    name: "Jean-Michel Beuken",
    contribution: "Legacy web interface",
    orcid: "",
    website: "https://be.linkedin.com/in/jean-michel-beuken-b018b130"
  },
  {
    name: "Eric Bousquet",
    contribution: "NC lanthanides",
    orcid: "https://orcid.org/0000-0002-9290-3463",
    website: "http://www.phythema.ulg.ac.be/"
  },
  {
    name: "Matteo Giantomassi",
    contribution: "Python infrastructure, NC tables, web interface",
    orcid: "https://orcid.org/0000-0002-7007-9813",
    website: "https://www.uclouvain.be/en/people/matteo.giantomassi"
  },
  {
    name: "Xavier Gonze",
    contribution: "Advisor",
    orcid: "",
    website: "https://perso.uclouvain.be/xavier.gonze/people/"
  },
  {
    name: "Don Hamann",
    contribution: "NC tables",
    orcid: "",
    website: "http://www.mat-simresearch.com/"
  },
  {
    name: "Weiguo Jing",
    contribution: "NC tables",
    orcid: "https://orcid.org/0000-0002-7317-607X",
    website: "https://www.uclouvain.be/en/people/weiguo.jing"
  },
  {
    name: "François Jollet",
    contribution: "PAW tables",
    orcid: "",
    website: "https://www-lmce.cea.fr/team/condensed_matter_physics/jollet.html"
  },
  {
    name: "Lórien MacEnulty",
    contribution: "Web interface",
    orcid: "https://orcid.org/0000-0001-8261-5524",
    website: "https://macenulty.com"
  },
  {
    name: "Gian-Marco Rignanese",
    contribution: "Advisor, web interface",
    orcid: "https://orcid.org/0000-0002-1422-1205",
    website: "https://perso.uclouvain.be/gian-marco.rignanese/"
  },
  {
    name: "Marc Torrent",
    contribution: "PAW tables",
    orcid: "",
    website: "https://www-lmce.cea.fr/en/team/condensed_matter_physics/torrent.html"
  },
  {
    name: "Michiel J. van Setten",
    contribution: "Python infrastructure, NC tables, web interface",
    orcid: "",
    website: "https://be.linkedin.com/in/michielvansetten"
  },
  {
    name: "Matthieu Verstraete",
    contribution: "Advisor, .psml format",
    orcid: "https://orcid.org/0000-0001-6921-5163",
    website: "http://www.nanomat.ulg.ac.be/?page_id=26"
  }
];


//-------------------------------------------------------------- Main Entry Point
var FILES = null;
var TARGZ = null;
var CITATIONS = null;
function dojo_start() {
    // Load dictionaries from json files, set the global variables FILES and TARGZ and build the user interface.
    var a = $.getJSON("json/files.json");
    var b = $.getJSON("json/targz.json");
    var c = $.getJSON("json/citations.json");

    $.when(a, b, c).done(function(v1, v2, v3){
       // when all requests are successful
       FILES = v1[0];
       TARGZ = v2[0];
       CITATIONS = v3[0];
       build_ui();
    });
}

//-------------------------------------------------------------- Build User Interface
const periodicButtons = {};
function build_ui(){

  var params = decodeURIComponent(window.location.search.slice(1))
              .split('&')
              .reduce(function _reduce (/*Object*/ a, /*String*/ b) {
                        b = b.split('=');
                        a[b[0]] = b[1];
                        return a;
              }, {});

  $(document).ready(function($) {
    $(".plugin:nth-of-type(2)").addClass('nth-of-type-float');
    $(".plugin:nth-of-type(5), .plugin:nth-of-type(13)").addClass('nth-of-type-margin');
    $(".plugin:nth-of-type(1), .plugin:nth-of-type(3), .plugin:nth-of-type(11), .plugin:nth-of-type(19), .plugin:nth-of-type(37), .plugin:nth-of-type(55)").addClass('nth-of-type-clear');

    TYPE.addEventListener("change", updateREL);
    REL.addEventListener("change", updateVER);
    VER.addEventListener("change", updateXC);
    XC.addEventListener("change", updateACC);
    ACC.addEventListener("change", updateFMT);
    FMT.addEventListener("change", updateDisplay);
    initializeSelectors();
    updateCitationBox();
    document.getElementById("preset-btn").addEventListener("click", setPreset);

    //Sets what happens when element is hovered (TODO: extend to focus mode as well)
    $('.plugin')
      .hover(onEnter, onLeave)
      .on('focus', onEnter)
      .on('blur', onLeave);

    console.log(
        "Number of plugins:",
        $('.plugin').length
    );

    //Sets what happens when element is clicked
    $('.plugin').on('click', function() {
      console.log("CLICK");    
      var mythis = $(this);
      var sel = _get_pseudo_selection(mythis);
      
      console.log("Clicked element:", mythis);
      console.log("Selection:", sel); 

      if (!sel.url) {
        show_toast("Sorry but this file is not available!");
        return;
      }
    
      // Determine mode
      var isValidation = document.getElementById("validationMode").checked;
    
      // =========================
      // VALIDATION MODE
      // =========================
      if (isValidation) {
        const url = `/validation/${sel.element || mythis.text().trim()}.html`;
        window.open(url, '_blank');
        return;
      }
    
      // =========================
      // DOWNLOAD MODE
      // =========================
    
      if (sel.fmt === 'html') {
        $.get(sel.url)
          .done(function() {
            window.location.href = sel.url;
          })
          .fail(function() {
            show_toast("File not found.");
          });
    
      } else {
        $.get(sel.url)
          .done(function() {
            window.downloadFile(sel.url);
          })
          .fail(function() {
            show_toast("File not found.");
          });
      }
    
    });

    $('.download_button').hover(
      // .hover( handlerIn, handlerOut)
      function(){
        // Download the targz file with the full table.
        var mythis = $(this);
        var sel = _get_targz_selection();

        if (sel.url) {
            mythis.css("background-color", "#44AA44");
            mythis.css("color", "#FFFFFF");
        }
        else {
            // tgz not available.
            mythis.css("background-color", "#CC4444");
            mythis.css("color", "#FFFFFF");
        }
      },
      function(){
        var mythis = $(this);
        mythis.css("background-color", "#4D4D4D");
        mythis.css("color", "#FFFFFF");
        setTimeout(function(){
          mythis.css("background-color", "#4D4D4D");
          mythis.css("color", "#FFFFFF");
        },500);
    });

    $('.download_button').on('click', function() {
        downloadTable();
    });

    $('.download_button').on('keydown', function(e) {

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            downloadTable();
        }
    });

    if (getParameterByName('layout') === 'light'){
      make_light();
    }

    window.downloadFile = function (sUrl) {
        //iOS devices do not support downloading.
        // We have to inform user about this.
        if (/(iP)/g.test(navigator.userAgent)) {
            alert('Your device does not support files downloading. Please try again in desktop browser.');
            return false;
        }
    
        //If in Chrome or Safari - download via virtual link click
        if (window.downloadFile.isChrome || window.downloadFile.isSafari) {
            //Creating new link node.
            var link = document.createElement('a');
            link.href = sUrl;

            if (link.download !== undefined) {
                // Set HTML5 download attribute. This will prevent file from opening if supported.
                var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
                link.download = fileName;
            }
    
            // Dispatching click event.
            if (document.createEvent) {
                var e = document.createEvent('MouseEvents');
                e.initEvent('click', true, true);
                link.dispatchEvent(e);
                return true;
            }
        }
    
        // Force file download (whether supported by server).
        var query = '?download';

        window.open(sUrl + query, '_self');
    }
    
    window.downloadFile.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    window.downloadFile.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

  });
}

//-------------------------------------------------------------- Switch
document.addEventListener("DOMContentLoaded", function () {

    const downloadMode =
        document.getElementById("downloadMode");
    if (!downloadMode) return;
    const validationMode =
        document.getElementById("validationMode");
    if (!validationMode) return;
    function getMode() {
        return validationMode.checked
            ? "validation"
            : "download";
    }

    // Optional: react immediately when the mode changes.
    downloadMode.addEventListener("change", onModeChanged);
    validationMode.addEventListener("change", onModeChanged);

    function onModeChanged() {
        console.log("Mode:", getMode());

        // If desired, update the UI here.
    }

});

//-------------------------------------------------------------- Citation Box
function updateCitationBox() {

    const citations = getRelevantCitations();
    const box =document.getElementById("citebox");

    if (citations.length === 0) {
        box.innerHTML = "<div class='pleasecite'><strong>No citation available.</strong></div>";
        return;
    }

    let html = "<div class='pleasecite'><strong>PLEASE CITE</strong></div><div class='citation'>";

    citations.forEach(c => {
        if (c === citations[citations.length - 1]) {
            html += `and <a href="${c.link}" target="_blank" rel="noopener" aria-label="Link to paper ${c.short}">${c.short}</a>.</div>`;
        }
        else {
            if (citations.length === 2) {html += `<a href="${c.link}" target="_blank" rel="noopener">${c.short}</a> `} 
            else {html += `<a href="${c.link}" target="_blank" rel="noopener" aria-label="Link to paper ${c.short}">${c.short}</a>, `};
        }
    });

    html += `
    <button
      id="downloadBibtex"
      class="bibtex_download" aria-label="Download relevant citations in BibTeX format">
      BibTeX
    </button>`;

    box.innerHTML = html;
    const bibtexButton = document.getElementById("downloadBibtex");

    // Download BibTeX
    bibtexButton.addEventListener("click", function (event) {
      event.stopPropagation();
      downloadBibtex();
    });

    bibtexButton.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        downloadBibtex();
      }
    });

    // Clicking elsewhere in the citation box copies the citations
    box.addEventListener("click", function (event) {
      // Ignore clicks on the BibTeX button
      if (event.target.closest("#downloadBibtex")) return;
      copyCitationsToClipboard(event);
    });

    // Pressing Enter or Space on the citation box copies the citations
    box.addEventListener("keydown", function (event) {
      // Ignore key presses originating from the BibTeX button
      if (event.target.closest("#downloadBibtex")) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        copyCitationsToClipboard(event);
      }
    });
}

function getRelevantCitations() {

    const keys = [];

    // Always cite PseudoDojo
    keys.push("*");

    // Prefix hierarchy
    const hierarchy = [
        TYPE.value,
        REL.value,
        VER.value,
        XC.value,
    ];

    for (let i = 1; i <= hierarchy.length; i++) {
        keys.push(
            hierarchy.slice(0, i).join("|")
        );
    }

    // Standalone citations
    keys.push(TYPE.value);
    keys.push(XC.value);
    keys.push(FMT.value.toUpperCase());

    const seen = new Set();
    const citations = [];

    keys.forEach(key => {
        const c = CITATIONS[key];
        if (!c) return;
        if (seen.has(c.bibtex)) return;
        seen.add(c.bibtex);
        citations.push(c);
    });

    return citations;
}

function downloadBibtex() {

    const citations = getRelevantCitations();
    const entries = citations.map(c => c.bibtex);

    const blob = new Blob(
        [entries.join("\n\n")],
        { type: "text/plain" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pseudodojo_citations.bib";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getCitationText() {

    const citations =
        getRelevantCitations();

    return citations
        .map(c => c.full)
        .join("\n\n");
}

function showCitationToast(event) {

    const toast = document.getElementById("citation-toast");
    let x, y;

    if (event instanceof MouseEvent) {

        // User clicked
        x = event.pageX;
        y = event.pageY - 10;

    } else {

        // User pressed Enter or Space
        x = 750;
        y = 75;
    }

    toast.style.left = `${x}px`;
    toast.style.top  = `${y}px`;
    toast.classList.add("show");

    setTimeout(() => {toast.classList.remove("show");}, 2000);
}


async function copyCitationsToClipboard(event) {

    try {

        await navigator.clipboard.writeText(
            getCitationText()
        );

        showCitationToast(event);

    } catch(err) {

        console.error(
            "Clipboard copy failed:",
            err
        );
    }
}

//-------------------------------------------------------------- Warning Box
function set_warning(type,txt) {
  // type can be "info", "warning", or "success".
  // Set the text in the warning box
  let heading;
  if (type === "warning") {
    heading = "WARNING!";
  }
  else if (type === "info") {
    heading = "NOTE:";
  }
  else {
    heading = "SUCCESS!";
  };
  var warningbox = document.getElementById('warning_box');
  warningbox.innerHTML = `<div class="alert ${type}" aria-label="Warning"><span id="cbn" class="closebtn" aria-label="Close">&times;</span><div class="warning-text"><strong>${heading}</strong> ${txt}</div></div>`;
  var close = document.getElementById("cbn");
  close.onclick = function(){
     var div = document.getElementById('warning_box');
     setTimeout(function(){div.innerHTML = "";}, 100);
  }
}

//-------------------------------------------------------------- Periodic Table
document.addEventListener("DOMContentLoaded", function () {

  const container = document.getElementById("periodic-table");

  elements.forEach(([z,symbol,name,bg,elcon]) => {

    const id = String(z).padStart(3,"0") + "_" + symbol;
    const selectedMode = document.querySelector('input[name="dojoMode"]:checked');
    if (!selectedMode) return;
    const mode = selectedMode.value;

//    const ival = meta[symbol]["nv"];
//    const elcon.splice(-(2*nv + (nv - 1)));

    var oc_add = "";
    if (z === 118) {
      var oc_add = `onclick="chaos()" aria-label="Make the periodic table explode"`;
    }
    if (z === 40) {
      var oc_add = `id="zirconium"`;
    }

    const html =
`  <button class="plugin ${bg} ${id}" ${oc_add} aria-label="${mode} for ${name}">
    <div class="zee hide">${z}</div>
    <div class="l_top hide" id="${symbol}_hl">hl</div>
    <div class="l_middle hide" id="${symbol}_hn">hn</div>
    <div class="l_bottom hide" id="${symbol}_hh">hh</div>
    <div class="element">${symbol}</div>
    <div class="name-wrap hide">
      <div class="name hide">${name}</div>
    </div>
    <div class="valence hide" id="${symbol}_nv">nv</div>
  </button>`;

    container.insertAdjacentHTML("beforeend", html);
    periodicButtons[symbol] = container.lastElementChild;

  });

});

//----------------
//What happens when the cursor starts hovering over the object.
function onEnter(){
  var mythis = $(this);
  var sel = _get_pseudo_selection(mythis);

  // update the color and properties of the  X_n box.
  set_X(sel.elm, sel.color, sel.zeen);

  // If the file exists, then background-color of element is green, otherwise red.
  if (sel.url) {
      mythis.css("background-color", "#44AA44");
      mythis.css("color", "#FFFFFF");
  } else { 
      mythis.css("background-color", "#CC4444");
      mythis.css("color", "#FFFFFF");
  }
}

//----------------
// What happens when the cursor stops hovering over the object
function onLeave(){
  reset_X();
  $(this).removeAttr("style");
  document.getElementById('X_n').style.color = "#4B4B4D";
}

//----------------
// Update ecut suggestions via meta
function updateMetaInfo() {
    const type = TYPE.value;
    const rel  = REL.value;
    const ver  = VER.value;
    const xc   = XC.value;
    const acc  = ACC.value;

    var table_name = type + '-' + rel + '-v' + ver
    console.log(table_name)
 
    // Build dictionary element_symbol -> metadata.
    var meta = {};
    for (const elm of elements) {
        try {
            meta[elm[1]] = FILES[type][rel][ver][xc][acc][elm[1]]["meta"];
        }
        catch (error) {
            if (DEBUG) console.log("Cannot find element:", elm[1], "in table:", table_name, "xcf:", xc, "accuracy:", acc, "\n", error);
            meta[elm[1]] = {};
        }   
    }
    if (DEBUG) console.log("meta:", meta);
    set_info(meta);
}  


function getParameterByName(name) {
    // Extract parameter from the url
    var url = window.location.href;
    //console.log(url);
    var name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


//----------------
// Set meta information (nv = # valence orbitals and ecut suggestions)
function set_info(info) {
    var averages = {};
    var sums = {};
    for (key of ALL_KEYS) {
      averages[key] = 0.0;
      sums[key] = 0.0;
    }

    if (ANIMATE === 1){
        //console.log('in set_info with animate option');
        $('.plugin').removeClass('anim');
        $('.plugin').removeClass('chaos');
        setTimeout("$('.plugin').addClass('anim')", 10)
    }

    for (var el of elements) {
        for (const key of ALL_KEYS) {
            var id_key = el[1] + '_' + key;
            var x = document.getElementById(id_key);
            var el_info = info[el[1]];
            if (x === null) console.log("null for id_key:", id_key, "el:", el[1], "key", key, "el_info", el_info);

            var val = '--';
            if (el_info === undefined || el_info === null) {
                val = '--';
            }
            else {
                val = el_info[key];
                if (val === undefined || val === null) val = "--";
            }

            if (val === 'na' || val === 'nan'){
                var xx = 1;
            }
            else {
                averages[key] += parseFloat(val);
                sums[key] += 1;
            }
            x.innerHTML = val;
        }
    }

    for (var key of ALL_KEYS) {
        averages[key] = averages[key] / sums[key];
        averages[key] = averages[key].toFixed(1);
    }

    if (sums["hl"] > 0) {
        //set_average(averages);
        reset_X();
    }
}

//-------------------------------------------------------------- Detail box bottom left of screen
//Set information in the detail box on bottom left of screen.
function set_X(elm, color, zee) {
    // Update parameters shown in the detail box upon hover or focus.
    var ALL_ELEMENTS = elements.map(function(value,index) { return value[1]; });
    var ielm = ALL_ELEMENTS.indexOf(elm);
    if (ielm >= 0) {
        document.getElementById('X_n').style.backgroundColor = COLORS[color];
        document.getElementById('X_z').innerHTML = zee;
        document.getElementById('X_el').innerHTML = elm;
        document.getElementById('X_name').innerHTML = elements[ielm][2];
        for (var key of ALL_KEYS) {
            var id_key = 'X_' + key;
            var id_key_in = elm + '_' + key;
            // Get the params from the pseudo associated with this element and copy to the detail box.
            var x = document.getElementById(id_key_in);
            var y = document.getElementById(id_key);
            if (color === "bg_unknown") {
                y.innerHTML = "";
                document.getElementById('X_n').style.color = "#B5B5B5";
            } else {
            y.innerHTML = x.innerHTML;
            }
        }
    }
}

function reset_X(){
    // Reset the params shown in the X_n box.
    document.getElementById('X_n').style.backgroundColor = "#ffffff";
    document.getElementById('X_z').innerHTML = 'Z';
    document.getElementById('X_nv').innerHTML = '#';
    document.getElementById('X_hl').innerHTML = 'low';
    document.getElementById('X_hn').innerHTML = 'middle';
    document.getElementById('X_hh').innerHTML = 'high';
    document.getElementById('X_el').innerHTML = 'X';
    document.getElementById('X_name').innerHTML = 'element name';
}


//-------------------------------------------------------------- Dynamic Pseudo Characteristic Menu Update
function fillSelect(id, values, preferred = null, labels = {}) {

    const select = document.getElementById(id);

    while (select.options.length) {
        select.remove(0);
    }

    values.forEach(v => {

        const option = document.createElement("option");

        option.value = v;

        option.text = labels[v] || v;

        option.label = labels[v] || v;

        select.add(option);

    });

    if (preferred && values.includes(preferred))
        select.value = preferred;
    else if (values.length)
        select.selectedIndex = 0;

    select.setAttribute("aria-describedby","selectorStatus");

}

function initializeSelectors() {

    fillSelect(
        "TYPE",
        Object.keys(FILES),
        localStorage.getItem("selectedTYPE"),
        TYPE_LABELS
    );

    updateREL();
}

function updateREL() {

    const type = TYPE.value;

    fillSelect(
        "REL",
        Object.keys(FILES[type]),
        REL.value,
        REL_LABELS
    );

    updateVER();
}

function updateVER() {

    const type = TYPE.value;
    const rel  = REL.value;

    fillSelect(
        "VER",
        Object.keys(FILES[type][rel]),
        VER.value
    );

    updateXC();
}

function updateXC() {

    const type = TYPE.value;
    const rel  = REL.value;
    const ver  = VER.value;

    fillSelect(
        "XC",
        Object.keys(FILES[type][rel][ver]),
        XC.value
    );

    updateACC();
}

function updateACC() {

    const type = TYPE.value;
    const rel  = REL.value;
    const ver  = VER.value;
    const xc   = XC.value;

    fillSelect(
        "ACC",
        Object.keys(FILES[type][rel][ver][xc]),
        ACC.value
    );

    updateFMT();
}

function updateFMT() {

    const type = TYPE.value;
    const rel  = REL.value;
    const ver  = VER.value;
    const xc   = XC.value;
    const acc  = ACC.value;

    const fmts = new Set();

    Object.values(
        FILES[type][rel][ver][xc][acc]
    ).forEach(eldata => {

        Object.keys(eldata)
            .filter(k => k !== "meta" && ALLOWED_FORMATS.includes(k))
            .forEach(fmt => fmts.add(fmt));
    });

    fillSelect(
        "FMT",
        [...fmts].sort(),
        FMT.value
    );

    updateDisplay();
}

function updateDisplay() {
    updatePeriodicTable();
    updateMetaInfo();
    updateCitationBox();
    saveSelections();
}

function saveSelections() {
    localStorage.setItem("selectedTYPE", TYPE.value);
    localStorage.setItem("selectedREL",  REL.value);
    localStorage.setItem("selectedVER",  VER.value);
    localStorage.setItem("selectedXC",   XC.value);
    localStorage.setItem("selectedACC",  ACC.value);
    localStorage.setItem("selectedFMT",  FMT.value);
}

function restoreSelections() {

    if (localStorage.getItem("selectedTYPE"))
        TYPE.value = localStorage.getItem("selectedTYPE");

    updateREL();
    if (localStorage.getItem("selectedREL"))
        REL.value = localStorage.getItem("selectedREL");

    updateVER();
    if (localStorage.getItem("selectedVER"))
        VER.value = localStorage.getItem("selectedVER");

    updateXC();
    if (localStorage.getItem("selectedXC"))
        XC.value = localStorage.getItem("selectedXC");

    updateACC();
    if (localStorage.getItem("selectedACC"))
        ACC.value = localStorage.getItem("selectedACC");

    updateFMT();
    if (localStorage.getItem("selectedFMT"))
        FMT.value = localStorage.getItem("selectedFMT");

    updateDisplay();
}

function updatePeriodicTable() {
    const type = TYPE.value;
    const rel  = REL.value;
    const ver  = VER.value;
    const xc   = XC.value;
    const acc  = ACC.value;
    const fmt  = FMT.value;

    const subset =
        FILES?.[type]?.[rel]?.[ver]?.[xc]?.[acc];

    Object.values(periodicButtons).forEach(btn => {

        btn.classList.remove("available");
        btn.classList.add("unavailable");
        btn.removeAttribute("style");

        delete btn.dataset.path;
    });

    if (!subset) return;

    Object.entries(subset).forEach(([symbol, formats]) => {

        if (!(fmt in formats)) return;

        const btn = periodicButtons[symbol];

        if (!btn) return;

        btn.classList.remove("unavailable");
        btn.classList.add("available");
        btn.removeAttribute("style");

        btn.dataset.path = formats[fmt];
    });
}

//-------------------------------------------------------------- New Lanthanides preset button
function selectIfPresent(select, value) {

    if ([...select.options].some(o => o.value === value)) {
        select.value = value;
        return true;
    }

    return false;
}

function setPreset() {

    selectIfPresent(TYPE, "NC");
    updateREL();

    selectIfPresent(REL, "SR");
    updateVER();

    selectIfPresent(VER, "1.0");
    updateXC();

    selectIfPresent(XC, "PBE");
    updateACC();

    selectIfPresent(ACC, "standard");
    updateFMT();

    selectIfPresent(FMT, "psp8");

    updateDisplay();
}



//-------------------------------------------------------------- Select element pseudo
//Finds the url and other properties of the selected pseudopotential.
function _get_pseudo_selection(dom_object){

  var str = dom_object.attr("class");
  var res = str.split(" ");
  var dum = res[2];
  var zeen = parseInt(dum.split("_")[0]);    //Atomic Z
  var color = res[1];                        //background color (e.g., bg_transition_metal)
  var res = dum.split("_");
  var elm = res[1];                          //element code (e.g., C for carbon)

  const type = TYPE.value;
  const rel  = REL.value;
  const ver  = VER.value;
  const xc   = XC.value;
  const acc  = ACC.value;
  const fmt  = FMT.value;
  var name_string = type + '-' + rel + '-v' + ver

  try {
    var url = FILES[type][rel][ver][xc][acc][elm][fmt];
  } 
  catch (error) {
    var url = null;
    if (DEBUG) {
        console.log("Error in _get_pseudo_selection for elm:", elm, "type: ", type, "xcf:", xc, "acc:", acc, "fmt:", fmt);
        console.log(error);
    }
  }

  var select = {elm: elm, url: url, type: type, xcf: xc, acc: acc, fmt: fmt, color: color, zeen: zeen};
  if (DEBUG) {
    console.log("in _get_pseudo_selection with url:", url);
    console.log("select:", select);
  }

  return select;
}

//-------------------------------------------------------------- Download Table button
function downloadTable() {

    // Download the targz file with the full table.
    var sel = _get_targz_selection();

    if (!sel.url) {
        show_toast("Sorry but this targz is not available!");
        return;
    }

    $.get(sel.url)
        .done(function() {
            window.location.href = sel.url;
        })
        .fail(function() {
            // not exists code
        });
}

function _get_targz_selection(){
  var type = $("#TYPE").val();
  var rel = $("#REL").val();
  var vers = $("#VER").val();
  var xcf = $("#XC").val();
  var acc = $("#ACC").val();
  var fmt = $("#FMT").val();

  try {
    var url = TARGZ[type][rel][vers][xcf][acc][fmt];
  }
  catch (error) {
    console.log("Error in _get_targz_selection:", error);
    var url = null;
  }
  if (DEBUG) console.log("in _get_targz_selection with url:", url)

  return {url: url, type: type, xcf: xcf, acc: acc, fmt: fmt};
}

//-------------------------------------------------------------- Guided Tour
let tour = null;
function dojoTour_guidedtour() {
  tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      cancelIcon: {enabled: true},
      scrollTo: {behavior: "smooth",block: "center"},
      classes: "shadow-md tour-button",
      arrow: true
    }
  });

  tour.addStep({
    id: "welcome",
    text: tourText("Welcome to the <strong>PseudoDojo</strong>! Let's go on a brief tour of the website."),
    buttons: [
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "mode",
    attachTo: {element: "#DojoMode",on: "bottom"},
    text: tourText("First stop: are you here to <strong>download pseudopotentials</strong>, or to <strong>inspect the " +
          "validation tests</strong> that went into making them? Use the radio button to select your preferred mode."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "pseudo_type",
    attachTo: {element: "#TYPE",on: "bottom"},
    text: tourText("The selector menu allows you to select the aspects of the pseudopotential you're interested in. First, " +
          "select the <strong>type</strong> of pseudopotential—either norm-conserving or projector-augmented wave (PAW)."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "relativistic",
    attachTo: {element: "#REL",on: "bottom"},
    text: tourText("Next, select the <strong>relativistic considerations</strong>. " +
          "Fully relativistic pseudos include spin-orbit coupling considerations. " +
          "NOTE: Relativistic considerations in the JTH PAW datasets are a bit complicated. " +
          `<a href=\"https://doi.org/10.1016/j.cpc.2013.12.023\" target=\"_blank\" rel=\"noopener\" ` +
          `aria-label=\"Link to more JTH information\">This paper</a> explains why.`),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "version",
    attachTo: {element: "#VER",on: "bottom"},
    text: tourText("Select the most recent or a prior <strong>version</strong> of this table."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "XC",
    attachTo: {element: "#XC",on: "bottom"},
    text: tourText("Then, you can pick one of the available <strong>exchange-correlation (XC) functionals</strong>. " +
          `Have a look at the <a href="faq">F.A.Q.</a> if your fuctional of choice is not available.`),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "accuracy",
    attachTo: {element: "#ACC",on: "bottom"},
    text: tourText("We offer pseudopotential tables in two degrees of <strong>accuracy</strong>—standard or stringent. " +
          "Generally, the standard table features pseudopotentials that we consider to be a good compromise " +
          `between computational expense and chemical accuracy. Have a look at the <a href="faq">F.A.Q.</a> ` +
          "for a detailed description on the difference between them."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "format",
    attachTo: {element: "#FMT",on: "bottom"},
    text: tourText("Here you can select the <strong>format</strong> of the pseudopotential file. " +
          "Use <span class='hili-or'>.psp8</span> for Abinit, <span class='hili-or'>.upf</span> "+
          " for Quantum Espresso, and <span class='hili-or'>.psml</span> for Siesta. The "+
          "<span class='hili-or'>.in</span> gives you all the input files that were used to "+
          "generate the pseudos, and finally, <span class='hili-or'>.djrepo</span> will give "+
          "you all the numerical results of the validation tests in JSON format."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "zirconium",
    attachTo: {element: "#zirconium",on: "bottom"},
    text: tourText("In <strong>download mode</strong>, click on an element to download its pseudopotential. " +
          "In <strong>test result mode</strong>, clicking on an element will open up the testing suite in a separate tab. " +
          "In either case, we've put in place accesible mechanisms to inform you if the content is available." +
          "If the element's box turns <strong style=\"color: #44AA44\">green</strong> on hover, the file " +
          "content is available. If it turns <strong style=\"color: #CC4444\">red</strong> on hover or the " +
          " <strong style=\"color: #A3A3A3\">background color-to-text</strong> contrast is low, it's not available."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "detail_box",
    attachTo: {element: "#X_n",on: "top"},
    text: tourText("Each element box reports identifying information, like the atomic number, the symbol, and the element name, "+
          "as well as quantitative information related to its pseudopotential. Once you hover over or focus on the "+
          "element, this box magnifies the information for that element."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "nv",
    attachTo: {element: "#X_nv",on: "top"},
    text: tourText("We report here for each element the <strong>number of orbitals included in the valence manifold</strong> (that is, the set of outermost " +
          "orbitals not included in the frozen core). Example: carbon has electrons in the <i>1s</i>, <i>2s</i>, and <i>2p</i> orbitals, " +
          "but pseudopotentials might only explicitly consider the electrons in the <i>2s</i> and <i>2p</i> shells. So for " +
          "carbon, this number would be 2."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "hints",
    attachTo: {element: "#LEVS",on: "top"},
    text: tourText("Each element has a list of <strong>recommendations for the cutoff energy</strong> (e<sub>cut</sub>) in Hartree. " +
          "The <strong>low</strong> suggestion is good for a quick calculation or as a starting point for convergence studies. " +
          "The <strong>middle</strong> cutoff is both accurate and computationally light enough for high-throughput calculations. " +
          "Beyond the <strong>high</strong> cutoff energy value, your results are unlikely to change significantly."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "download_button",
    attachTo: {element: ".download_button",on: "top"},
    text: tourText(`Click on the "Download Table" button to get a tarball of all available pseudopotentials in the selected format, ` +
          "one pseudopotential per element for all available elements."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "citation_box",
    attachTo: {element: ".citation_box",on: "bottom"},
    text: tourText("If you end up using our pseudos in your work, <strong>please cite the list of papers in this citation box</strong>, which updates " + 
          "dynamically to reflect your pseudopotential selection criteria. Click anywhere on the box to copy the reference list in Chicago style, " +
          "or click on <span style=\"background-color:#00B89C;color: white;border-radius:6px;\">&nbsp BibTeX &nbsp</span> to download the BibTeX entries."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  tour.addStep({
    id: "logo",
    attachTo: {element: ".logo",on: "bottom"},
    text: tourText(`Finally, if you want to learn the periodic table by heart, try clicking on the logo. 😉`),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "End Tour",action: tour.next}
    ]
  });

  tour.on("start", () => {
    // Delay until Shepherd has finished rendering.
    setTimeout(() => {
       document.addEventListener("mousedown", handleOutsideClick, true);
    }, 0);
  });

  tour.on("complete", () => cleanupShepherd() );
  tour.on("cancel", () => cleanupShepherd() );
  tour.start();
}

function tourText(html) {
    return `<div class="tour-step-text" tabindex=0>${html}</div>`;
}

function cleanupShepherd() {
  document.querySelectorAll(".shepherd-modal-overlay-container").forEach(e => e.remove());
  document.body.classList.remove("shepherd-active","shepherd-target-click-disabled");
  document.body.style.removeProperty("overflow");
  removeOutsideClickHandler();
}

function handleOutsideClick(event) {

  if (!tour || !tour.isActive()) return;

  const dialog = document.querySelector(".shepherd-element");
  if (!dialog) return;

  // Click anywhere inside the Shepherd dialog? Ignore it.
  if (event.target.closest(".shepherd-element")) return;

  // Click on the highlighted element? Ignore it (optional).
  if (event.target.closest(".shepherd-target")) return;

  tour.cancel();
}

function removeOutsideClickHandler() {
    document.removeEventListener("mousedown", handleOutsideClick, true);
}

//-------------------------------------------------------------- Small warning banners
function show_toast(text){
  Toastify({
    text: text,
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: "bottom", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();
}

//-------------------------------------------------------------- Make layout less stimulating
// When user clicks on Tennessine
function make_light() {
    document.getElementById('FMT').value = 'psp8'
    const hide_classes = ["hide", "name", 'intro', "styled-longselect",
                          "selection_bar", "help_button", "description", "menubar"];
    for (cls of hide_class) {
        for (tohide of document.getElementsByClassName(hide_class)) {
            tohide.style.visibility = "hidden";
        }
    }

    document.getElementById('X_n').setAttribute("style","left:326px; top:91px; height:170px; width:140px;");
    document.getElementById('N').setAttribute("style","left:326px; top:91px; height:170px; width:140px; font-size=20px");
    document.getElementById("download_button").setAttribute("style","left:70px; top:151px; width:200px; height:55px; padding:15px");
    elements = document.getElementsByClassName('element')
    for (var i; i < elements.length; i++){
       elements[i].setAttribute('style', 'font-size:24px; margin-top:12px; line-height:1; text-align:center;');
    }
    document.getElementById("X_el").setAttribute('style', 'margin-top:20px;');
    document.getElementById("X_hl").setAttribute('style', 'font-size:20px; padding:2px');
    document.getElementById("X_hn").setAttribute('style', 'font-size:20px; padding:2px');
    document.getElementById("X_hh").setAttribute('style', 'font-size:20px; padding:2px');
    document.getElementById("X_nv").setAttribute('style', 'font-size:20px; margin-top:-158px; padding:2px');
    document.getElementById("det_test").setAttribute('style', 'font-size:20px; padding:2px');
    document.getElementById("det_hints").setAttribute('style', 'font-size:20px; margin-top:5px; padding:2px');
    document.getElementById("X_d").setAttribute('style', 'font-size:20px; padding:2px');
    document.getElementById("X_dp").setAttribute('style', 'font-size:20px; padding:2px');
    document.getElementById("X_gb").setAttribute('style', 'font-size:20px; padding:2px');
}


//-------------------------------------------------------------- Easter egg
// When the user clicks on Oganesson
function chaos() {
    $('.plugin').removeClass('anim');
    $('.plugin').removeClass('chaos');
    setTimeout("$('.plugin').addClass('chaos')",10)
    var plugins = document.querySelectorAll(".plugin");
    for (var plugin of plugins) {
      animatePlugin(plugin);
    }

    function animatePlugin(plugin) {
      var xMax = 500;
      var yMax = 500;
      var x1 = Math.random() - 0.5;
      x1 = x1 * xMax;
      var x2 = Math.random() - 0.5;
      x2 = x2 * xMax;
      var y1 = Math.random() - 0.5;
      y1 = y1 * yMax;
      var y2 = Math.random() - 0.5;
      y2 = y2 * yMax;

      plugin.keyframes = [{
        opacity: 1,
        transform: "translate3d(" + x1 + "px, " + y1 + "px, 0px)"
      }, {
        opacity: 0.2,
        transform: "translate3d(" + x2 + "px, " + y2 + "px, 0px)"
      }, {
        opacity: 0.2,
        transform: "translate3d(" + -x1 + "px, " + -y1 + "px, 0px)"
      }, {
        opacity: 1,
        transform: "translate3d(" + -x2 + "px, " + -y2 + "px, 0px)"
      }];

      plugin.animProps = {
        duration: 2000 + Math.random() * 4000,
        easing: "ease-out",
        iterations: 1
      }
    var animationPlayer = plugin.animate(plugin.keyframes, plugin.animProps);
    }
}

//-------------------------------------------------------------- Contributors list, About page
const orcidSVG = `
<svg aria-hidden="true" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#A6CE39"/>
  <text x="128" y="170"
        text-anchor="middle"
        font-family="Arial"
        font-size="120"
        font-weight="bold"
        fill="white">iD</text>
</svg>`;

const websiteSVG = `
<svg aria-hidden="true"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     stroke-width="2">
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18"/>
    <path d="M12 3a15 15 0 0 1 0 18"/>
    <path d="M12 3a15 15 0 0 0 0 18"/>
</svg>`;

function makeIconLink(url, label, svg, cssClass) {
    if (!url) return "";

    return `
        <a class="icon-link ${cssClass}"
           href="${url}"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="${label}">
            ${svg}
        </a>`;
}

function buildContributorTable(containerId) {

    const container = document.getElementById(containerId);

    const rows = contributors.map(person => `
        <tr>
          <th scope="row" class="c1">
            <div class="person">
              <span class="person-name">${person.name} </span>

              <span class="person-links">
                ${makeIconLink(
                   person.orcid,
                   `ORCID profile of ${person.name}`,
                   orcidSVG,
                   "orcid"
                )}

                ${makeIconLink(
                   person.website,
                   `Research website of ${person.name}`,
                   websiteSVG,
                   "website"
                )}
              </span>
            </div>
          </th>

          <td class="c2">
            ${person.contribution}
          </td>
        </tr>
    `).join("");

    container.innerHTML = `
        <figure style="margin:0;">
          <table class="contributors">
            <caption class="sr-only">Contributors to PseudoDojo and the scope of their contributions</caption>
            <thead>
              <tr>
                  <th class="tabletop" scope="col" style="width:60%">NAME</th>
                  <th class="tabletop" scope="col" style="width:40%">CONTRIBUTION</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </figure>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
  const conttable = document.getElementById("contributors-table");
  if (!conttable) return;
  buildContributorTable("contributors-table")
});


//-------------------------------------------------------------- Page trees
const visitedNodes = new Set();

function moveArrow() {

    const tree  = document.querySelector(".tree");
    const path  = document.getElementById("tree-path");
    const arrow = document.querySelector(".tree-arrow");

    const total = path.getTotalLength();
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight + 10;
    const progress = maxScroll <= 0 ? 0 : window.scrollY / maxScroll;

    const pt = path.getPointAtLength(progress * total);

    arrow.style.left = `${pt.x}px`;
    arrow.style.top  = `${pt.y}px`;

    document.querySelectorAll(".tree-node").forEach((node,i)=>{

        const r = node.getBoundingClientRect();
        const treeRect = tree.getBoundingClientRect();
        const style = getComputedStyle(node, "::before");

        const noduleLeft = parseFloat(style.left);
        const noduleTop = parseFloat(style.top);
        const noduleWidth = parseFloat(style.width);
        const noduleHeight = parseFloat(style.height);

        const x = pt.x;
        const y = r.top + noduleTop + noduleHeight / 2 - treeRect.top;
        const dx = pt.x - x;
        const dy = pt.y - y;

        if(dx*dx + dy*dy < 18*18){
            if(!visitedNodes.has(i)){
                visitedNodes.add(i);
                rippleAt(x,y);
            }
        }
        else{
            visitedNodes.delete(i);
        }

    });

    /* Rotate to follow the path */
    const ahead = path.getPointAtLength(
        Math.min(progress * total + 2, total)
    );

    const angle = Math.atan2(
        ahead.y - pt.y,
        ahead.x - pt.x
    ) * 180 / Math.PI;

    arrow.style.transform =
        `translate(-50%,-50%) rotate(${angle - 90}deg)`;
}

document.addEventListener("DOMContentLoaded", () => {
  const tree = document.getElementById("tree"); // or whatever unique element exists

  if (!tree) return;

  window.addEventListener("resize", () => {
    drawTree();
    moveArrow();
  });

  window.addEventListener("scroll", moveArrow, { passive: true });
  window.addEventListener("resize", moveArrow);
});

function drawTree() {
    const GAP = 50;
    const START_Y = 100;

    const nodes = [...document.querySelectorAll(".tree-node")];

    let leftBottom = START_Y;
    let rightBottom = START_Y;

    nodes.forEach(node => {
        node.style.top = "0px";
    });

    nodes.forEach((node, i) => {
        const h = node.offsetHeight;
        let y;

        if (i === 0) {
            y = START_Y;
            rightBottom = y + h;
        } else {
            const prev = nodes[i - 1];

            // Desired position: halfway down the previous node
            y = prev.offsetTop + prev.offsetHeight / 2;

            if (i % 2 === 1) {
                // Even child -> left side
                y = Math.max(y, leftBottom + GAP);
                leftBottom = y + h;
            } else {
                // Odd child -> right side
                y = Math.max(y, rightBottom + GAP);
                rightBottom = y + h;
            }
        }
        node.style.top = `${y}px`;
    });

    const tree = document.querySelector(".tree");
    const svg  = document.getElementById("tree-svg");
    const path = document.getElementById("tree-path");

    const last = nodes[nodes.length - 1];
    tree.style.height = `${last.offsetTop + last.offsetHeight + 150}px`;
    const w = tree.clientWidth;
    const h = tree.clientHeight;

    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

    const x0 = 0.22 * w;
    const x1 = 0.50 * w;

    const y0 = 0;
    const y1 = 50;
    const y2 = 100;

    path.setAttribute(
        "d",
        `M ${x0} ${y0}
         L ${x0} ${y1}
         L ${x1} ${y2}
         L ${x1} ${h-30}`
    );

    document.querySelectorAll(".tree-node.left").forEach(node => {
        node.style.setProperty("--nodule-left", `${x0 - 30}px`);
    });

    document.querySelectorAll(".tree-node.right").forEach(node => {
        node.style.setProperty("--nodule-left", `${x1 - 30}px`);
    });

    const endNode = document.querySelector(".tree-end-node");
    const end = path.getPointAtLength(path.getTotalLength());

    endNode.style.left = `${end.x}px`;
    endNode.style.top  = `${end.y}px`;
}

function rippleAt(x,y){
    const fx = document.querySelector(".tree-effects");
    const r = document.createElement("div");
    r.className = "tree-ripple";
    r.style.left = `${x}px`;
    r.style.top = `${y}px`;
    r.style.transform = "translate(-50%, -50%)";
    fx.appendChild(r);
    setTimeout(() => r.remove(), 800);
}

document.addEventListener("DOMContentLoaded", () => {
  const tree = document.getElementById("tree");

  if (!tree) return;

  drawTree();
  moveArrow();
});

//-------------------------------------------------------------- Footer
document.addEventListener("DOMContentLoaded", () => {
  const footerYear = document.getElementById("footerYear");

  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
});


