//--------------------------------------------------------- Table of Contents
//=========================================================
//History: dojo-tools.js was intially coded by Michel van 
//Sletten (MVS). It was updated by Lórien MacEnulty (LMac)
//in 2025-2026. The code was organized and commented by
//LMac in 2026.
//
//contents = functions [name()], event listeners [EL], SVGs
//           dictionaries [dict], global definitions, etc.
//=========================================================
//     Section                                     contents
//  1. General definitions
//  2. Main Entry point:                       dojo_start()
//  3. Build User Interface:                     build_ui()
//  4. Download Functionality            checkAndDownload()
//                         updateDownloadButtonAppearance()
//                          resetDownloadButtonAppearance()
//                                   window.downloadFile EL
//                          window.downloadFile.isChrome EL
//                          window.downloadFile.isSafari EL
//                                          downloadTable()
//                                   _get_targz_selection()
//                                  _get_pseudo_selection()
//  5. Mode Switch Radio Button                   getMode()
//  6. Pseudo Characteristic Selection         fillSelect()
//                                    initializeSelectors()
//                                              updateREL()
//                                              updateVER()
//                                               updateXC()
//                                              updateACC()
//                                              updateFMT()
//                                          updateDisplay()
//                                    updatePeriodicTable()
//                                         saveSelections()
//                                      restoreSelections()
//  7. Selection Preset Button            selectIfPresent() 
//                                              setPreset()
//  8. Citation Box                     updateCitationBox()
//                                   getRelevantCitations()
//                                         downloadBibtex()
//                                        getCitationText()
//                                      showCitationToast()
//                               copyCitationsToClipboard()
//  9. Periodic Table                     Periodic Table EL
//                                       updatePluginAria()
//                                                onEnter()
//                                                onLeave()
//                                         updateMetaInfo()
//                                               set_info()
// 10. Detail Box                                   set_X()
//                                                reset_X()
// 11. Guided Tour                    dojoTour_guidedtour()
//                                               tourText()
//                                     handleOutsideClick()
//                                        cleanupShepherd()
//                              removeOutsideClickHandler()
// 12. Warning Flags                  not_available_toast()
//                                               announce()
// 13. Footer                                Footer Year EL
// 14. About Page Contributors               makeIconLink() 
//                                  buildContributorTable()
//                                    contributors-table EL
// 15. Page Content Trees                           tree EL
//                                               drawTree()
//                                      waitForTreeImages()
//                                              moveArrow()
//                                               rippleAt()
// 16. Easter Egg                                   chaos()
//


//Set JavaScript mode to strict.
"use strict";

//--------------------------------------------------------- 1. General definitions
//=========================================================
//Defines global constants:
//    - DEBUG: If true, print things to console.
//    - ANIMATE: If 1, allows certain elements to initiate
//      special animations.
//    - ALL_KEYS: json dictionary keys for meta information
//      included in the element boxes. Corresponding
//      definition in deploy.py (update in both places).
//    - TYPE_LABELS: Expansion of "NC" and "JTH" types for
//      explicit user selection options.
//    - REL_LABELS: Expansion of "SR" and "FR" relativistic
//      considerations for explicit user selection options.
//    - ALLOWED_FORMATS: Types of pseudo file formats made
//      available to the user in selection bar.
//    - COLORS: Default background colors for element boxes.
//    - ELEMENTS: All elements in periodic table
//         [atomic #, atomic symbol, element name, 
//          valence electron configuration]
//    - CONTRIBUTORS: List of all contributors to
//      PseudoDojo, the scope of their contribution, and
//      links to relevant online professional profiles.
//      Used in about.html page table.
//    - orcidSVG: Orcid logo icon
//    - websiteSVG: World Wide Web icon
//=========================================================
//Authors: MVS and LMac

const DEBUG = false;
const ANIMATE = 1;
const ALL_KEYS = ['hh', 'hl', 'hn', 'nv'];
const TYPE_LABELS = {NC: "Norm-Conserving",JTH: "PAW"};
const REL_LABELS = {SR: "Scalar",FR: "Fully"};
const ALLOWED_FORMATS = ["djrepo","in","psml","psp8","upf"];

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

const ELEMENTS = [
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

//Add contributors to PseudoDojo here. If no online profiles,
//leave entry as empty string.
const CONTRIBUTORS = [
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

//Orcid icon for contributor table
const orcidSVG = `
  <svg aria-hidden="true" viewBox="0 0 256 256">
    <circle cx="128" cy="128" r="128" fill="#A6CE39"/>
    <text x="128" y="170" text-anchor="middle" 
          font-family="Arial" font-size="120"
          font-weight="bold" fill="white">iD</text>
  </svg>`;

//Website icon for contributor table
const websiteSVG = `
  <svg aria-hidden="true" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18"/>
    <path d="M12 3a15 15 0 0 1 0 18"/>
    <path d="M12 3a15 15 0 0 0 0 18"/>
  </svg>`;


//--------------------------------------------------------- 2. Main Entry Point
//=========================================================
// Loads the following dictionaries from json files:
//    - files.json: generated upon execution of 
//      deploy.py. Sorts available pseudopotentials according 
//      to their characteristics:
//      FILES[Type][Relativity][Version][XC][Accuracy][Element][Format]
//                   = local/path/to/Element.Format or meta information
//        >> Type: "NC" | "PAW" (type of pseudopotential)
//        >> Relativity: "SR" = scalar | "FR" = fully 
//           (relativistic considerations)
//        >> Version: "<version number as float>"
//        >> XC: "PBE" | "PBEsol" | "LDA" 
//           (exchange-correlation functional)
//        >> Accuracy: "standard" | "stringent"
//        >> Element: two character element code of 
//           available pseudos
//        >> Format: "djrepo" | "in" | "meta" | "psml" | 
//           "psp8" | "upf" (file formats)
//           If format is "meta", the entry is another 
//           dictionary with
//             >>  "hh" = high ecut hint [Hartree]
//             >>  "hl" = low ecut hint [Hartree]
//             >>  "hn" = middle ecut hint [Hartree]
//             >>  "nv" = number of valence orbitals
//    - targz.json: generated upon execution of deploy.py. 
//      Sorts available total pseudopotential tables according 
//      to characteristics:
//      TARGZ[Type][Relativity][Version][XC][Accuracy][Format]
//        = local/path/to/Type_Relativity_Version_XC_Accuracy_Format.targz
//        >> Options and definitions same as above
//    - citations.json: static file with PseudoDojo relevant 
//      citation info:
//      CITATIONS[Pseudo Selection][cite Formats] 
//        = "citation format string"
//        >> Pseudo Selection: string combination of options 
//           listed above, separated by "|", to which the 
//           citation is associated. E.g., Jing et al (2026) 
//           is the paper that publishes the version 0.6
//           norm-conserving lanthanide table for PBE, so the 
//           pseudo selection the user must have indicated on 
//           the web interface is "NC|SR|0.6|PBE". The original 
//           PseudoDojo paper has Pseudo Selection = "*" to make 
//           sure it comes up in the citation box regardless of 
//           the user's selection.
//        >> Cite Formats: formats the citation is written in
//             >> "short" = Last_Name_of_Author1 <em>et 
//                          al.</em> (year)
//             >> "full" = Chicago style citation = Name1 
//                         LastName1, Name2 LastName2 ... 
//                         NameN LastNameN. "Full Manuscript 
//                         Title." Journal Name Volume#, Issue# 
//                         (year):pages [with n-dash].
//             >> "bibtex" = bibtex citation with lines separated 
//                           by \n
//             >> "link" = DOI url
//
//=========================================================
//Authors: MVS and LMac
//Called by: index.html

var FILES = null;
var TARGZ = null;
var CITATIONS = null;
function dojo_start() {
  //Load dictionaries from json files.
  var a = $.getJSON("json/files.json");
  var b = $.getJSON("json/targz.json");
  var c = $.getJSON("json/citations.json");

  //When all requests are successful...
  $.when(a, b, c).done(function(v1, v2, v3){
    //...set global variables and build UI.
    FILES = v1[0];
    TARGZ = v2[0];
    CITATIONS = v3[0];
    build_ui();
  });
}

//--------------------------------------------------------- 3. Build User Interface
//=========================================================
//Function for managing the functionality of the user 
//interface on index.html. Monitors user-induced changes 
//and calls the corresponding functions in later sections.
//=========================================================
//Authors: MVS and LMac
//Called by: dojo_start()

const periodicButtons = {};
function build_ui() {

  //Wait until HTML has been loaded and parsed before running.
  $(document).ready(function () {

    //-----------------------------------------------------
    //Listen for changes to radio button, which informs the
    //mode (either download or see test results) dictating the
    //behavior of clicking on a periodic table element.
    const downloadMode = document.getElementById("downloadMode");
    const validationMode = document.getElementById("validationMode");

    if (downloadMode && validationMode) {
      //If radio button present, make and use function that updates
      //ARIA with the meta related to the pseudopotential selected.
      function onModeChanged() {
        const mode = getMode();
        Object.values(periodicButtons).forEach(button => {
          updatePluginAria(button, mode);
        });
      }

      downloadMode.addEventListener("change", onModeChanged);
      validationMode.addEventListener("change", onModeChanged);

      //Initialize the ARIA labels in download mode.
      onModeChanged();
    }

    //-----------------------------------------------------
    //Monitor selection menu for user updates and initialize
    //selectors.
    TYPE.addEventListener("change", updateREL);
    REL.addEventListener("change", updateVER);
    VER.addEventListener("change", updateXC);
    XC.addEventListener("change", updateACC);
    ACC.addEventListener("change", updateFMT);
    FMT.addEventListener("change", updateDisplay);
    initializeSelectors();

    //-----------------------------------------------------
    //Update the citation box according to user's selections.
    updateCitationBox();

    //-----------------------------------------------------
    //Assign listeners to the citation box.
    const citationBox = document.getElementById("citebox");

    //Make sure citation box has been created.
    if (citationBox) {

      //When user clicks on the citation box...
      citationBox.addEventListener("click",function (event) {

        //Check first if they clicked on the BibTex button
        //if it is even delegated. Then Delegate event to 
        //download BibTeX button.
        const bibtexButton = event.target.closest("#downloadBibtex");
        if (bibtexButton) {
          event.stopPropagation();
          downloadBibtex();
          return;
        }

        //Otherwise, copy citations to clipboard.
        copyCitationsToClipboard(event);
      });

      //When user selects the citation box using keyboard...
      citationBox.addEventListener("keydown",function (event) {

        //Check first if they clicked on the BibTex button
        //if it is even delegated. Then Delegate event to 
        //download BibTeX button.
        const bibtexButton = event.target.closest("#downloadBibtex");
        if (bibtexButton) {
          //If user presses Enter or Spacebar, download BibTeX file.
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            downloadBibtex();
          }

          //Otherwise, return without doing anything.
          return;
        }

        //Otherwise, copy Chicago citations to clipboard.
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          copyCitationsToClipboard(event);
        }
      });
    }

    //-----------------------------------------------------
    //Monitor the preset button for changes.
    const presetButton = document.getElementById("preset-btn");
    if (presetButton) {
      presetButton.addEventListener("click", setPreset);
    }

    //-----------------------------------------------------
    //Append CSS positioning classes to element boxes.
    //For Helium:
    $(".plugin:nth-of-type(2)").addClass("nth-of-type-float");

    //For Boron and Aluminum:
    $(".plugin:nth-of-type(5), .plugin:nth-of-type(13)")
      .addClass("nth-of-type-margin");

    //For Alkalis and Hydrogen:
    $(".plugin:nth-of-type(1), " +
      ".plugin:nth-of-type(3), " +
      ".plugin:nth-of-type(11), " +
      ".plugin:nth-of-type(19), " +
      ".plugin:nth-of-type(37), " +
      ".plugin:nth-of-type(55)").addClass("nth-of-type-clear");

    //-----------------------------------------------------
    //Periodic table element hover/focus behavior
    $(".plugin").hover(onEnter, onLeave)
                .on("focus", onEnter)
                .on("blur", onLeave);

    //-----------------------------------------------------
    //Periodic table element activation
    $(".plugin").on("click", function (event) {
      const button = $(this);
      const selection = _get_pseudo_selection(button);

      console.log("Clicked element:", button);
      console.log("Selection:", selection);

      //If file unavailable...
      if (!selection.url) {
        //...notify user via flag.
        not_available_toast(event);
        return;
      }

      //Determine current mode (download pseudos or See test results).
      const validationMode = document.getElementById("validationMode");
      const isValidation = validationMode && validationMode.checked;

      //-----------------------------------------------------
      //Validation mode - "See test results"
      //If element is clicked, right now opens a blank window in separate tab.
      //In future, will be used as portal to testing results suite.
      if (isValidation) {
        const elementName = selection.element || button.text().trim();
        const url = `/validation/${elementName}.html`;
        window.open(url, "_blank");
        return;
      }

      //-----------------------------------------------------
      //Download mode - "Download pseudos"
      //If element is clicked, download dialog opens to download pseudo file.
      checkAndDownload(selection.url,event);

    });

    //-----------------------------------------------------
    //Download full pseudo table button
    $(".download_button").on("mouseenter", function () {
      updateDownloadButtonAppearance($(this));
    })

    //When mouse stops hovering, reset appearance of download button.
    .on("mouseleave", function () {
      resetDownloadButtonAppearance($(this));
    })

    //When button clicked, initiate download table.
    .on("click", function (event) {
      downloadTable(event);
    })

    //When button selected via keyboard, initiate download table.
    .on("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        downloadTable(event);
      }
    });

  });
}

//--------------------------------------------------------- 4. Downloading Functionality
//Handles downloading functionality of index.html.
//
//Functions:
//  4a. checkAndDownload()
//  4b. updateDownloadButtonAppearance()
//  4c. resetDownloadButtonAppearance()
//  4d. window.downloadFile event listener
//  4e. window.downloadFile.isChrome event listener
//  4f. window.downloadFile.isSafari event listener
//  4g. downloadTable
//  4h. _get_targz_selection
//  4i. _get_pseudo_selection
//=========================================================

//==================================== 4a. checkAndDownload
//Check URL and download file at that URL. If not available,
//a toast warning box is raised.
//=========================================================
//Authors: MVS and LMac
//Arguments: url = local path to the file (string)
//           event = coordinates of user interaction
//Called by: build_ui()

function checkAndDownload(url, event) {
  $.get(url).done(function () {
    window.downloadFile(url);
  })
  .fail(function () {
    //Upon failure, notify user with a flag.
    not_available_toast(event);
  });
}

//====================== 4b. updateDownloadButtonAppearance
//Update full-table download button appearance according
//to availability of targz file.
//=========================================================
//Authors: MVS and LMac
//Arguments: button = object user is interacting with, $(this)
//Called by: build_ui()

function updateDownloadButtonAppearance(button) {
  const selection = _get_targz_selection();
  if (selection.url) {
    button.css({"background-color": "#5BC75B",
                "color": "#FFFFFF"
    });
  } else {
    button.css({"background-color": "#CC4444",
                "color": "#610000"
    });
  }
}

//======================= 4c. resetDownloadButtonAppearance
//Reset full-table download button appearance
//=========================================================
//Authors: MVS and LMac
//Arguments: button = object user is interacting with, $(this)
//Called by: build_ui()

function resetDownloadButtonAppearance(button) {
  button.css({
      "background-color": "#4B4B4D",
      "color": "#FFFFFF"
  });
}

//================== 4d. window.downloadFile event listener
//Browser-based management of attempted file downloading.
//If iOS detected, download is not permitted. If Chrome or
//Safari, directions are given to find the correct file
//on the local server.
//=========================================================
//Authors: MVS and LMac
//Arguments: url to file user has requested (string)
//Called by: checkAndDownload(url, event)

window.downloadFile = function (url) {
  //iOS devices do not support normal file downloading.
  if (/(iP)/g.test(navigator.userAgent)) {
      alert("Your device does not support files downloading. " +
            "Please try again in a desktop browser."
      );
      return false;
  }

  //If browser is Chrome or Safari...
  if (window.downloadFile.isChrome || window.downloadFile.isSafari) {
    const link = document.createElement("a");
    link.href = url;
    if (link.download !== undefined) {
      const fileName = url.substring(url.lastIndexOf("/") + 1);
      link.download = fileName;
    }

    if (document.createEvent) {
      const event = document.createEvent("MouseEvents");
      event.initEvent("click",true,true);
      link.dispatchEvent(event);
      return true;
    }
  }

  //Fallback
  const downloadUrl = url + "?download";
  window.open(downloadUrl, "_self");
  return true;
};

//==== 4e. 4f. window.downloadFile.isChrome event listeners
//What browser is the user on?
//=========================================================
//Authors: MVS
//Called by: downloadFile(url)

window.downloadFile.isChrome = navigator.userAgent
    .toLowerCase()
    .indexOf("chrome") > -1;

window.downloadFile.isSafari = navigator.userAgent
    .toLowerCase()
    .indexOf("safari") > -1;


//======================================= 4g. downloadTable
//Download full table button functionality.
//=========================================================
//Authors: MVS and LMac
//Arguments: event = coordinates of user interaction
//Called by: build_ui()

function downloadTable(event) {    
  //Download the targz file with the full table.
  var sel = _get_targz_selection();
  
  //If no URL is found, raise a flag.
  if (!sel.url) {
    not_available_toast(event);
    return;
  }

  //If URL is found, set window to that URL.
  $.get(sel.url).done(function() {
    window.location.href = sel.url;
  })
  //Upon failure, notify user with warning flag.
  .fail(function() {
    not_available_toast(event);
    return;
  });
}

//================================ 4h. _get_targz_selection
//When download table button is clicked or hovered over, 
//fetch the targz file path in targz.json corresponding to 
//the current pseudopotential selection characteristics to
//test if it exists and return selection characteristics.
//=========================================================
//Authors: MVS and LMac
//Called by: downloadTable(event)
//           updateDownloadButtonAppearance(button)

function _get_targz_selection(){

  //Get what values the user has selected currently.
  var type = $("#TYPE").val();
  var rel = $("#REL").val();
  var vers = $("#VER").val();
  var xcf = $("#XC").val();
  var acc = $("#ACC").val();
  var fmt = $("#FMT").val();

  //See if a JSON entry corresponding to these selections
  //exists in targz.json. If not, set url to null to
  //signal unavailability of file.
  try {
    var url = TARGZ[type][rel][vers][xcf][acc][fmt];
  }
  catch (error) {
    console.log("Error in _get_targz_selection:", error);
    var url = null;
  }

  //Debugging print to console.
  if (DEBUG) console.log("in _get_targz_selection with url:", url)

  //Return pseudopotential characteristics.
  return {url: url, type: type, xcf: xcf, acc: acc, fmt: fmt};
}

//=============================== 4i. _get_pseudo_selection
//When periodic table elements are clicked or hovered over, 
//fetches the file path in files.json corresponding to the 
//current pseudopotential selection characteristics to test 
//if it exists and return selection characteristics as
//class-like object:
// selection =  {type: type ["NC" or "JTH"], 
//               relativity: rel ["SR" or "FR"], 
//               version: version number ["float"], 
//               xcf: exchange-correlation functional [string], 
//               accuracy: "standard" or "stringent",
//               format: file type suffix [string],
//               element: element symbol [string],
//               url: path to local file [string], 
//               color: background color [class], 
//               z: atomic number [integer]}
//=========================================================
//Authors: MVS and LMac
//Arguments: dom_object = object user is interacting with
//                        --> $(this) 
//Called by: build_ui(), onEnter(),
//           updatePluginAria(button, mode = getMode())

function _get_pseudo_selection(dom_object){
  
  //Get relevant element attributes from CSS classes
  //associated with this button. 
  var str = dom_object.attr("class");
  var res = str.split(" ");
  var dum = res[2];
  var zeen = parseInt(dum.split("_")[0]);  //Atomic Z
  var color = res[1];                      //background color
  var res = dum.split("_");
  var elm = res[1];                        //atomic symbol
  
  //Get what values the user has selected currently.
  const type = TYPE.value;
  const rel  = REL.value;
  const ver  = VER.value;
  const xc   = XC.value;
  const acc  = ACC.value;
  const fmt  = FMT.value;
  var name_string = type + '-' + rel + '-v' + ver
   
  //See if a JSON entry corresponding to these selections
  //exists in files.json. If not, set url to null to
  //signal unavailability of file.         
  try {     
    var url = FILES[type][rel][ver][xc][acc][elm][fmt];
  }         
  catch (error) { 
    var url = null;
    if (DEBUG) {
        console.log("Error in _get_pseudo_selection for elm:", 
                    elm, "type: ", type, "xcf:", xc, "acc:", 
                    acc, "fmt:", fmt);
        console.log(error);
    }
  }

  //Set selection object.
  var select = {type: type, relativity: rel, version: ver, xcf: xc, 
                accuracy: acc, format: fmt, element: elm, url: url,
                color: color, z: zeen};

  //Debugging print to console.
  if (DEBUG) {
    console.log("in _get_pseudo_selection with url:", url);
    console.log("select:", select);
  }

  //Return pseudopotential and element characteristics.
  return select;
}

//--------------------------------------------------------- 5. Mode Switch Radio Button
//=========================================================
//The radio button is a slider that allows the user to
//determine what happens when they click on an element in
//the periodic table. In Download mode, clicking on an
//element will download the pseudopotential. In Validation
//mode, clicking on an element will take the user to the 
//testing suite user interface (to be implemented) for that
//pseudopotential.
//
//Functions:
//  5a. getMode()
//=========================================================

//=========================================================
//This function returns which mode the user has currently 
//selected. Default is Download mode.
//=========================================================
//Authors: LMac
//Called by: build_ui(),
//           updatePluginAria(button, mode = getMode())

function getMode() {
  const validationMode = document.getElementById("validationMode");
  return validationMode.checked
    ? "validation"
    : "download";
}

//--------------------------------------------------------- 6. Pseudo Characteristic Selection
//=========================================================
//The user is presented with pseudopotential characteristics
//in a selection bar at the top of index.html. They can select
//among available options for Type of pseudo (TYPE), 
//Relativistic considerations (REL), table version (VER), 
//exchange-correlation functional (XC), accuracy (ACC), and 
//file format (FMT) (see Section 2 for a description of options, 
//which come from files.json).
//
//Functions:
//  6a. fillSelect()
//  6b. initializeSelectors()
//  6c. updateREL()
//  6d. updateVER()
//  6e. updateXC()
//  6f. updateACC()
//  6g. updateFMT()
//  6h. updateDisplay()
//  6i. updatePeriodicTable()
//  6j. saveSelections()
//  6k. restoreSelections()
//=========================================================

//========================================== 6a. fillSelect
//fillSelect is a helper function that sets the options for
//each characteristic.
//=========================================================
//Authors: LMac
//Arguments: id = HTML <select> ID as in index.html (string)
//           values = array of available options (array of strings)
//           preferred = default selected value (string)
//           labels = translates json dictionary keys into
//                    human readable format (defined in Sec. 1)
//                    (map of value to string -> {SR: "Scalar"})
//Called by: initializeSelectors(), updateREL(), updateVER(),
//           updateXC(), updateACC(), updateFMT()
      
function fillSelect(id, values, preferred = null, labels = {}) {

  //Find corresponding HTML selector.
  const select = document.getElementById(id);

  //Empty the dropdown menu.
  while (select.options.length) {
    select.remove(0);
  }

  //Loop through array of available options and create an
  //HTML <option> tag for it with value, label, and human-
  //readable text.
  values.forEach(v => {
    const option = document.createElement("option");
    option.value = v;
    option.text = labels[v] || v;
    option.label = labels[v] || v;
    select.add(option);
  });

  //Set the default selection as the first value if not
  //specified intentionally by developer.
  if (preferred && values.includes(preferred))
    select.value = preferred;
  else if (values.length)
    select.selectedIndex = 0;
    select.setAttribute("aria-describedby","selectorStatus");

}

//================================= 6b. initializeSelectors
//Begins the cascade of initalizing selectors upon loading
//of index.html.
//=========================================================
//Authors: LMac
//Called by: build_ui()

function initializeSelectors() {

  //Set the options for TYPE.
  fillSelect(
    "TYPE",
    Object.keys(FILES),
    localStorage.getItem("selectedTYPE"),
    TYPE_LABELS
  );

  //Update relativity options to align with what's
  //available under this selected type.
  updateREL();
}

//=========================================== 6c. updateREL
//Update options for relativistic considerations.
//=========================================================
//Authors: LMac
//Called by: build_ui(), initializeSelectors(), 
//           restoreSelections(), setPreset()

function updateREL() {
  //Get Type value
  const type = TYPE.value;

  //Set the options for REL.
  fillSelect(
    "REL",
    Object.keys(FILES[type]),
    REL.value,
    REL_LABELS
  );

  //Update table version options to align with what's
  //available under this selected relativity.
  updateVER();
}

//=========================================== 6d. updateVER
//Update options for pseudopotential table version number
//=========================================================
//Authors: LMac
//Called by: build_ui(), updateREL(), restoreSelections(), 
//           setPreset()

function updateVER() {

  //Get Type and Relativity values.
  const type = TYPE.value;
  const rel  = REL.value;

  //Set the options for VER.
  fillSelect(
    "VER",
    Object.keys(FILES[type][rel]),
    VER.value
  );

  //Update XC options to align with what's
  //available under this selected version.
  updateXC();
}

//============================================ 6e. updateXC
//Update options for exchange-correlation potential
//=========================================================
//Authors: LMac
//Called by: build_ui(), updateVER(), restoreSelections(), 
//           setPreset()

function updateXC() {

  //Get Type, relativity, and version values.
  const type = TYPE.value;
  const rel  = REL.value;
  const ver  = VER.value;

  //Set the options for XC.
  fillSelect(
    "XC",
    Object.keys(FILES[type][rel][ver]),
    XC.value
  );

  //Update accuracy options to align with what's
  //available under this selected XC.
  updateACC();
}

//=========================================== 6f. updateACC
//Update options for accuracy (standard and/or stringent)
//=========================================================
//Authors: LMac
//Called by: build_ui(), updateXC(), restoreSelections(), 
//           setPreset()

function updateACC() {

  //Get Type, relativity, version, and xc values.
  const type = TYPE.value;
  const rel  = REL.value;
  const ver  = VER.value;
  const xc   = XC.value;

  //Set the options for ACC.
  fillSelect(
    "ACC",
    Object.keys(FILES[type][rel][ver][xc]),
    ACC.value
  );

  //Update format options to align with what's
  //available under this selected accuracy.
  updateFMT();
}

//=========================================== 6g. updateFMT
//Update options for file formats according to availability
//=========================================================
//Authors: LMac
//Called by: build_ui(), updateACC(), restoreSelections(), 
//           setPreset()

function updateFMT() {

  //Get Type, relativity, version, XC, and accuracy values.
  const type = TYPE.value;
  const rel  = REL.value;
  const ver  = VER.value;
  const xc   = XC.value;
  const acc  = ACC.value;

  //Create array to store format options.
  const fmts = new Set();

  Object.values(
    FILES[type][rel][ver][xc][acc]
  ).forEach(eldata => {

    //Filter the options in JSON file according to what
    //Section 1 defines as the allowed formats we want to
    //make available to the user.
    Object.keys(eldata)
      .filter(k => k !== "meta" && ALLOWED_FORMATS.includes(k))
      .forEach(fmt => fmts.add(fmt));
  });

  //Sort format options alphabetically and set as options
  //for FMT.
  fillSelect(
    "FMT",
    [...fmts].sort(),
    FMT.value
  );

  //End of option setting cascade; update periodic table
  //aspects and file paths to reflect the new options.
  updateDisplay();
}

//======================================= 6h. updateDisplay
//Update periodic table aspects and file paths to reflect 
//the new pseudopotential selection characteristics. This
//includes updating the pseudo availability, the meta info 
//for each element, the ARIA for each element, and the 
//citation box. Also save the current selections.
//=========================================================
//Authors: LMac
//Called by: build_ui(), updateFMT(), restoreSelections(), 
//           setPreset()

function updateDisplay() {
  updatePeriodicTable();
  updateMetaInfo();
  Object.values(periodicButtons).forEach(updatePluginAria);
  updateCitationBox();
  saveSelections();
}

//================================= 6i. updatePeriodicTable
//Update file availability information according to the
//current pseudopotential selection characteristics.
//=========================================================
//Authors: LMac
//Called by: 

function updatePeriodicTable() {

  //Get currently selected pseudo selectors.
  const type = TYPE.value;
  const rel  = REL.value;
  const ver  = VER.value;
  const xc   = XC.value;
  const acc  = ACC.value;
  const fmt  = FMT.value;

  //List of file paths that are available according to this
  //selection
  const subset = FILES?.[type]?.[rel]?.[ver]?.[xc]?.[acc];

  //For every element button currently loaded...
  Object.values(periodicButtons).forEach(btn => {

    //...remove the CSS class saying it's available and
    //add the unavailable one. Also removes inline style.
    btn.classList.remove("available");
    btn.classList.add("unavailable");
    btn.removeAttribute("style");

    //Remove the data-path attribute from the button.
    delete btn.dataset.path;

  });

  //If the subset is then empty, exit this process.
  if (!subset) return;

  //For each element and format value...
  Object.entries(subset).forEach(([symbol, formats]) => {

    //...if the format doesn't exist in the json, exit
    //loop.
    if (!(fmt in formats)) return;

    //Get periodic table button corresponding to this 
    //element, if it exists.
    const btn = periodicButtons[symbol];
    if (!btn) return;

    //All that get to this point must necessarily
    //have available files, so remove unavailable class, 
    //add the available class, and remove inline styling.
    btn.classList.remove("unavailable");
    btn.classList.add("available");
    btn.removeAttribute("style");

    //Store the file path for the selected format
    //inside the data-path attribute.
    //E.g., data-path="some/path/to/file.png"
    btn.dataset.path = formats[fmt];
  });
}

//====================================== 6j. saveSelections
//Save current selections in local storage for access later. 
//=========================================================
//Authors: LMac
//Called by: updateDisplay()

function saveSelections() {
  localStorage.setItem("selectedTYPE", TYPE.value);
  localStorage.setItem("selectedREL",  REL.value);
  localStorage.setItem("selectedVER",  VER.value);
  localStorage.setItem("selectedXC",   XC.value);
  localStorage.setItem("selectedACC",  ACC.value);
  localStorage.setItem("selectedFMT",  FMT.value);
}

//=================================== 6k. restoreSelections
//Restore the selections from local storage (not currently
//called anywhere, although it's available). 
//=========================================================
//Authors: LMac
//Called by: 

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

//--------------------------------------------------------- 7. Selection Preset Button
//=========================================================
//Optional button to include somewhere on the landing page
//that allows us to advertize or the user to quickly access
//a particularly popular pseudopotential table. Right now,
//it is coded to be next to the lanthanides to advertize
//the new lanthanide pseudos with 4f in the valence manifold.
//
//Functions:
//  7a. selectIfPresent() 
//  7b. setPreset()
//=========================================================

//===================================== 7a. selectIfPresent
//selectIfPresent is a helper function that makes sure that
//the selector presets the developer wants to select are
//indeed available in the options set in Section 6.
//=========================================================
//Authors: LMac
//Arguments: select = HTML <selector> ID (ID object)
//           value = desired preset option (string)
//Called by: setPreset()

function selectIfPresent(select, value) {

  //Check if preset is available in the selector options.
  if ([...select.options].some(o => o.value === value)) {
    select.value = value;
    return true;
  }

  //Otherwise, return false.
  return false;
}

//=========================================== 7b. setPreset
//Set the characteristic values of the desired preset.
//Right now, it is set up to correspond to the new
//lanthanide pseudos with 4f electrons as part of the
//valence manifold.
//=========================================================
//Authors: LMac
//Called by: build_ui()

function setPreset() {

  //Preset value for pseudopotential type
  selectIfPresent(TYPE, "NC");
  updateREL();

  //Preset value for relativistic
  selectIfPresent(REL, "SR");
  updateVER();

  //Preset value for table version
  selectIfPresent(VER, "1.0");
  updateXC();

  //Preset value for exchange-correlation functional
  selectIfPresent(XC, "PBE");
  updateACC();

  //Preset value for table accuracy
  selectIfPresent(ACC, "standard");
  updateFMT();

  //Preset value for format
  selectIfPresent(FMT, "psp8");
  updateDisplay();
}

//--------------------------------------------------------- 8. Citation Box
//=========================================================
//The citation box proposes a list of citations to the user
//in two formats (Chicago reference style and BibTeX), which
//updates dynamically according to the user's pseudopotential
//selection. The citation information is stored in a JSON
//dictionary in json/citations.json, and it allows the
//developer to associate a particular paper with a set of
//options. See Section 2 for more details on this file. This
//box is designed to encourage users to cite the pseudos
//they use.
//
//Functions:
//  8a. updateCitationBox()
//  8b. getRelevantCitations()
//  8c. downloadBibtex()
//  8d. getCitationText()
//  8e. showCitationToast()
//  8f. copyCitationsToClipboard() 
//=========================================================

//=================================== 8a. updateCitationBox
//Creates the inner HTML of the citebox
//in index.html by selecting relevant citations in
//citations.json, looping through them to render each
//short citation dictionary entry as a link. It then adds
//the BibTeX button and dictates behavior upon user 
//interactions (click, hover, etc).
//=========================================================
//Authors: LMac
//Called by: build_ui(), updateDisplay()

function updateCitationBox() {

  //Get the list of relevant citations.
  const citations = getRelevantCitations();
  //Select the HTML object.
  const box =document.getElementById("citebox");

  //If no relevant citations, tell user.
  //In practice, this will never happen because the
  //original PseudoDojo paper applies to any and all
  //pseudo characteristic selections.
  if (citations.length === 0) {
    box.innerHTML = "<div class='pleasecite center'><strong>" +
                    "No citation available.</strong></div>";
    return;
  }

  //Begin HTML string by declaring tags and 
  //PLEASE CITE heading.
  let html = "<div class='pleasecite center'><strong>PLEASE " +
             "CITE</strong></div><div class='citation'>";

  //Loop over list of relevant citations.
  citations.forEach(c => {

    //If this is the last citation, prepend an 'and', then
    //end with a period.
    if (c === citations[citations.length - 1]) {
      html += `and <a href="${c.link}" target="_blank" ` + 
              `rel="noopener" aria-label="Link to paper ` +
              `${c.short}">${c.short}</a>.</div>`;
    } else {
      //If there are 2 or fewer citations, no need for an
      //Oxford comma.
      if (citations.length <= 2) {
        html += `<a href="${c.link}" target="_blank" ` + 
                `rel="noopener" aria-label="Link to paper ` + 
                `${c.short}">${c.short}</a> `;
      } else {
        //If there are more than two citations and this is not 
        //the last citation, add a ", " at the end. We use the
        //Oxford comma in this house!
        html += `<a href="${c.link}" target="_blank" ` +
                `rel="noopener" aria-label="Link to paper ` + 
                `${c.short}">${c.short}</a>, `;
      }
    }
  });

  //Append HTML for the BibTeX button.
  html += `<button id="downloadBibtex" ` + 
          `class="bibtex_download center" ` + 
          `aria-label="Download relevant citations in BibTeX ` +
          `format">BibTeX</button>`;

  //Commit this as live HTML.
  box.innerHTML = html;

}

//================================ 8b. getRelevantCitations
//Extract list of relevant citations according to the
//pseudopotential characteristics the user has selected.
//=========================================================
//Authors: LMac
//Called by: updateCitationBox(), downloadBibtex(),
//           getCitationText()

function getRelevantCitations() {

  //Declare list of dictionary entry keys corresponding
  //to relevant citations.
  const keys = [];

  //Always cite original PseudoDojo paper.
  keys.push("*");

  //Order of selectors in citations.json dictionary entries.
  const hierarchy = [TYPE.value,REL.value,VER.value,
        XC.value,];

  //Generate every combination of selectors that still
  //preserves the selector order.
  for (let mask = 1; mask < (1 << hierarchy.length); mask++) {
    const combination = [];
    for (let i = 0; i < hierarchy.length; i++) {
      //If this bit is set, include this selector.
      if (mask & (1 << i)) {
        combination.push(hierarchy[i]);
      }
    }
    keys.push(combination.join("|"));
  }

  //Standalone citations
  keys.push(TYPE.value);
  keys.push(XC.value);
  keys.push(VER.value);
  keys.push(FMT.value.toUpperCase());

  //Declare storage for Chicago citations.
  const citations = [];

  //Keep track of citations that have already been
  //added so as not to duplicate in citation box.
  const seen = new Set();
  
  //Map the possible dictionary keys with those
  //with citations in citations.json.
  keys.forEach(key => {
    const c = CITATIONS[key];
    if (!c) return;
    if (seen.has(c.bibtex)) return;
    seen.add(c.bibtex);
    citations.push(c);
  });

  //Return array of citations.
  return citations;
}

//====================================== 8c. downloadBibtex
//Make a BibTeX file called pseudodojo_citations.bibtex
//corresponding to the list of citations corresponding to
//user-selected pseudopotential characteristics. When the
//user clicks on the BibTeX button, it will open the
//download dialogue to save this file locally.
//=========================================================
//Authors: LMac
//Called by: build_ui()

function downloadBibtex() {

  //Get list of relevant citations in BibTeX format.
  const citations = getRelevantCitations();
  const entries = citations.map(c => c.bibtex);

  //Join citations with two new lines between them into
  //one plain text string.
  const blob = new Blob(
    [entries.join("\n\n")],
    { type: "text/plain" }
  );

  //Create a URL for downloading the text file.
  const url = URL.createObjectURL(blob);

  //Make a temporary download link and append it to
  //the page, simulate a click, then remove the link
  //and dismantle the temporary URL. 
  const a = document.createElement("a");
  a.href = url;
  a.download = "pseudodojo_citations.bib";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

//===================================== 8d. getCitationText
//Convert list of relevant citations into a string of
//Chicago citations (JSON dictionary key = full)
//=========================================================
//Authors: LMac
//Called by: copyCitationsToClipboard()

function getCitationText() {

  //Get list of relevant citations.
  const citations = getRelevantCitations();

  //Return list of Chicago citations as a string with
  //each entry separated by two new-line characters.
  return citations.map(c => c.full).join("\n\n");
}


//=================================== 8e. showCitationToast
//Show a green flag, just above where the user clicked,
//indicating that the list of citations was successfully 
//copied to clipboard.
//=========================================================
//Authors: LMac
//Arguments: event = coordinates of user interaction
//Called by: copyCitationsToClipboard()

function showCitationToast(event) {

  //Obtain flag as HTML object.
  const toast = document.getElementById("citation-toast");
  let x, y;

  //If the user clicked with a mouse.
  if (event instanceof MouseEvent) {
    //Set coordinates of the flag as the same horizontal
    //coordinate as where the user clicked, but shift the 
    //vertical coordinate slightly up (by 10px).
    x = event.pageX;
    y = event.pageY - 10;

  } else {
    //If instead the usser pressed Enter or Space, have
    //the flag show at the top of the citation box.
    const box = document.getElementById("citebox");
    const rect = box.getBoundingClientRect();

    x = rect.left + rect.width / 2;
    y = rect.top - 5;
  }

  //Show the flag.
  toast.style.left = `${x}px`;
  toast.style.top  = `${y}px`;
  toast.classList.add("show");

  //Limit time that the flag appears (~3 seconds).
  setTimeout(() => {toast.classList.remove("show");}, 2000);

  //Announce appearance of the flag to screen readers.
  announce("List of Chicago-style citations copied to clipboard.");

}

//============================ 8f. copyCitationsToClipboard
//Copy text of Chicago citation list to user clipboard.
//=========================================================
//Authors: LMac
//Arguments: event = coordinates of user interaction
//Called by: build_ui()

async function copyCitationsToClipboard(event) {

  //Try to copy text to clipboard and show 
  //green success flag.
  try {
    await navigator.clipboard.writeText(getCitationText());
    showCitationToast(event);

  //Otherwise, print error to console.
  } catch(err) {
    console.error("Clipboard copy failed:",err);
  }

}

//--------------------------------------------------------- 9. Periodic Table
//=========================================================
//The periodic table is the primary function of the web
//interface, rendered with a simple div tag with
//id = periodic-table in index.html. All 118 elements are
//shown, but typically the tables only have pseudos
//for 73 to 85 elements. Each element box is a button 
//displaying information about the element (atomic number,
//atomic symbol, element name, number of valence orbitals,
//and three hints for the energy cutoff). This information
//is updated dynamically and encoded in the ARIA labels.
//When an element is hovered over or in focus, it turns
//green or red with a check or an 'x' to indicate the
//availability of that pseudopotential, and a detail
//box at the bottom left of the interface magnifies that
//element's information.
//
//Functions:
//  9a. periodic-table event listener
//  9b. updatePluginAria()
//  9c. onEnter() 
//  9d. onLeave()
//  9e. updateMetaInfo()
//  9f. set_info()
//=========================================================

//======================= 9a. periodic-table event listener
//Waits for index.html to load before constructing the
//periodic table element-by-element.
//=========================================================
//Authors: MVS and LMac
//Called by: index.html

document.addEventListener("DOMContentLoaded", function () {

  //Associate with HTML object.
  const container = document.getElementById("periodic-table");

  //Loop over all 118 elements.
  ELEMENTS.forEach(([z,symbol,name,bg,elcon]) => {

    //Concatenate this element's HTML ID attribute.
    const id = String(z).padStart(3,"0") + "_" + symbol;

    //If the table is in neither validation or download
    //mode, exit.
    const selectedMode = document.querySelector('input[name="dojoMode"]:checked');
    if (!selectedMode) return;

    //Append special functions to particular elements.
    var oc_add = "";
    if (z === 118) {
      var oc_add = `onclick="chaos()" aria-label="Make ` + 
                   `the periodic table explode"`;
    }
    if (z === 40) {
      var oc_add = `id="zirconium"`;
    }

    //Make this element's button with tailored attributes.
    //Meta info is set in updateMetaInfo() and set_info().
    const html =
    `<button
      class="plugin ${bg} ${id}"
      ${oc_add}
      data-z="${z}"
      data-symbol="${symbol}"
      data-name="${name}"
      data-valence="${elcon}">
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

    //Append button to HTML object and list of buttons.
    container.insertAdjacentHTML("beforeend", html);
    periodicButtons[symbol] = container.lastElementChild;

    //Initialize this element's ARIA.
    updatePluginAria(periodicButtons[symbol]);

  });

});

//==================================== 9b. updatePluginAria
//Update the ARIA for each element button so that
//accessibility software is able to perceive the
//information pertaining to each element.
//=========================================================
//Authors: LMac
//Arguments: button = element button html
//           mode = "validation" or "download" depending on
//                  state of the radio button 
//Called by: build_ui(), updateDisplay(), periodic-table EL,
//           set_info()

function updatePluginAria(button, mode = getMode()) {

  //Read full element name from button's data attributes.
  const name   = button.dataset.name;

  //Check if this file/content is available and
  //get pseudopotential characteristics.
  const sel = _get_pseudo_selection($(button));
  const symbol = sel.element;
  const available = !!sel.url;

  //Start ARIA string.
  let aria = `Element ${name}. Atomic number ${sel.z}. ` +
        `Atomic symbol ${symbol}. `;

  //If the content is available...
  if (available) {

    //...read inner HTML text of HTML elements showing
    //meta information.
    const nv = document.getElementById(symbol + "_nv")?.textContent ?? "--";
    const hl = document.getElementById(symbol + "_hl")?.textContent ?? "--";
    const hn = document.getElementById(symbol + "_hn")?.textContent ?? "--";
    const hh = document.getElementById(symbol + "_hh")?.textContent ?? "--";

    //Add this information to the ARIA. Make sure
    //these are sentences understood when read aloud.
    aria += `Pseudopotential available. Number of valence ` +
            `orbitals: ${nv}. Suggested low energy ` +
            `cutoff: ${hl} Hartree. Suggested medium ` +
            `energy cutoff: ${hn} Hartree. Suggested ` +
            `high energy cutoff: ${hh} Hartree. ` +
            (mode === "validation"
                ? "Press Enter to view the validation report."
                : "Press Enter to download the pseudopotential.");

  } else {
    //If not available, announce this.
    aria += "Pseudopotential unavailable.";

  }

  //Set aria label.
  button.setAttribute("aria-label", aria);
}


//============================================= 9c. onEnter
//When the cursor starts hovering over or the focus falls 
//on the element box, the detail box updates with that
//element's information and the button indicates the
//availability of the pseudopotential (green background and
//font + checkmark ✓ that replaces the atomic number Z if
//available, red background and font + '✕' if not
//available).
//=========================================================
//Authors: MVS and LMac
//Called by: build_ui()

function onEnter(){

  //Get this object.
  var mythis = $(this);

  //Assess availability of file underlying this object.
  var sel = _get_pseudo_selection(mythis);

  //Make alterations to the atomic number.
  const zee = mythis.find(".zee")[0];
  if (zee) {
    //Remember the original atomic number.
    if (!zee.dataset.number)
        zee.dataset.number = zee.textContent;
    //If content is available...
    if (sel.url) {
      //...append 'ok' CSS class, remove 'bad' class, and
      //replace zee with checkmark.
      zee.textContent = "✓";
      zee.classList.add("ok");
      zee.classList.remove("bad");
    } else {
      //Otherwise, append 'bad' CSS class, remove 'ok'
      //class, and replace zee with x mark.
      zee.textContent = "✕";
      zee.classList.add("bad");
      zee.classList.remove("ok");
    }
  }

  //Update colors and properties of the detail box to
  //be the same as the button's defaults.
  set_X(sel.element, sel.color, sel.z);

  //If the file exists...
  if (sel.url) {
    //...change button colors to greens.
    mythis.css("background-color", "#5BC75B");
    mythis.css("color", "#FFFFFF");
  } else {
    //Otherwhise, change button colors to reds.
    mythis.css("background-color", "#CC4444");
    mythis.css("color", "#610000");
  }

}

//============================================= 9d. onLeave
//Reset element button and details box when cursor 
//stops hovering over the object or it is out of focus.
//=========================================================
//Authors: MVS and LMac
//Called by: build_ui()

function onLeave(){

  //Get this object.
  var mythis = $(this);

  //Recall original atomic number.
  const zee = mythis.find(".zee")[0];

  //If zee exists...
  if (zee) {
    //...reset inner HTML to this number.
    zee.textContent = zee.dataset.number;
    zee.classList.remove("ok","bad");
  }

  //Reset detail box and element button to defaults.
  reset_X();
  mythis.removeAttr("style");
  document.getElementById('X_n').style.color = "#4B4B4D";
}

//====================================== 9e. updateMetaInfo
//This function looks to see if the current pseudo
//selection characteristics provide meta information
//for the elements of the periodic table. It makes a
//dictionary of elements that do have meta information, 
//then feeds that array to set_info to update the 
//periodic table display buttons.
//=========================================================
//Authors: MVS and LMac
//Called by: updateDisplay()

function updateMetaInfo() {

  //Get current pseudo selection characteristics.
  const type = TYPE.value;
  const rel  = REL.value;
  const ver  = VER.value;
  const xc   = XC.value;
  const acc  = ACC.value;

  //Concatenate name of repository.
  var table_name = type + '-' + rel + '-v' + ver
  if (DEBUG) console.log(table_name)
 
  //Loop over all elements to create meta dictionary.
  var meta = {};
  for (const elm of ELEMENTS) {
    try {
      //Find meta for this element in files.json and store
      //in current dictionary.
      meta[elm[1]] = FILES[type][rel][ver][xc][acc][elm[1]]["meta"];
    }
    catch (error) {
      //If there's an error, write to console...
      if (DEBUG) {
        console.log("Cannot find element:", elm[1], 
                    "in table:", table_name, "xcf:", xc, 
                    "accuracy:", acc, "\n", error);
      }
      //...and set meta entry to empty dictionary.
      meta[elm[1]] = {};
    }   
  }

  //If debugging, write meta dictionary to console.
  if (DEBUG) console.log("meta:", meta);

  //Call set_info to set the meta info.
  set_info(meta);
}  

//============================================ 9f. set_info
//Set meta information (keys in ALL_KEYS, Section 1): 
//   nv = # valence orbitals
//   hl = low cutoff energy suggestion [Ha]
//   hn = middle cutoff energy suggestion [Ha]
//   hh = high cutoff energy suggestion [Ha]
//for all element buttons in the periodic table UI. This
//function was simplified from prior versions, which encode
//an averaging of the above values across all elements with
//pseudos, providing those numbers as the default of the
//detail box.
//=========================================================
//Authors: MVS and LMac
//Arguments: info = dictionary with element symbols as keys
//                  and meta dictionaries as entries
//Called by: updateMetaInfo()

function set_info(info) {

  //Loop over all elements.
  for (var el of ELEMENTS) {
    //Loop over all pieces of meta information being updated.
    for (const key of ALL_KEYS) {
      //Concatenate ID name as, e.g., Pd_hh or Cu_nv.
      var id_key = el[1] + '_' + key;

      //Fetch object associated with this ID.
      var x = document.getElementById(id_key);

      //Grab this element's meta dictionary from input.
      var el_info = info[el[1]];

      //If object doesn't exist, write it in the console.
      if (x === null && DEBUG) {
        console.log("null for id_key:", id_key, "el:", el[1], 
                    "key", key, "el_info", el_info);
      }

      //Neatly set default display value to -- .
      var val = '--';

      //If dictionary undefined or null, set display
      //value to '--' .
      if (el_info === undefined || el_info === null) {
        val = '--';
      }
      else {
        //Otherwise, extract this quantity for this element
        //and set it as the display value.
        //If it's undefined or null, set to default -- .
        val = el_info[key];
        if (val === undefined || val === null) val = "--";
      }

      //Write the inner HTML to display the value.
      x.innerHTML = val;
    }
  }

  //Reset the detail box to its defaults.
  reset_X();

  //Update the ARIA with these newly set meta quantities.
  Object.values(periodicButtons).forEach(updatePluginAria);
}

//--------------------------------------------------------- 10. Detail Box
//=========================================================
//When element is hovered or focused, this box magnifies
//the information included for that element, including: 
//  - atomic number Z
//  - atomic symbol
//  - element name
//  - number of valence orbitals 
//    (obtained through meta info in files.json)
//  - low, middle, high ecut suggestions
//    (obtained through meta info in files.json).
//The box adopts the color of the element, not the availability
//information (like green or red or the checkmark/x-mark). It
//is also not focusable or actionable itself. The box quantities
//are labeled using whimsical squiggles and text. Default 
//content is set in index.html and updated in js/dojo-tools.js
//through set_X() and reset(X).
//
//Functions:
//  10a. set_X()
//  10b. reset_X()
//=========================================================

//============================================== 10a. set_X
//On hover or focus of an element button, set information 
//in the detail box on bottom left of screen to magnify
//that element's information.
//=========================================================
//Authors: MVS and LMac
//Arguments: elm = focused element's symbol
//           color = focused element's background color
//           zee = focused element's atomic number
//Called by: onEnter()

//Set information in the detail box on bottom left of screen.
function set_X(elm, color, zee) {

  //Get all element symbols from Section 1 ELEMENTS list.
  var ALL_ELEMENTS = ELEMENTS.map(function(value,index) { return value[1]; });

  //If focused element is in list of all elements.
  var ielm = ALL_ELEMENTS.indexOf(elm);
  if (ielm >= 0) {
    //Set detail box's attributes (background color, atomic
    //number, element symbol, element name) to that of button.
    document.getElementById('X_n').style.backgroundColor = COLORS[color];
    document.getElementById('X_z').innerHTML = zee;
    document.getElementById('X_el').innerHTML = elm;
    document.getElementById('X_name').innerHTML = ELEMENTS[ielm][2];

    //Loop over keys of relevant meta quantities.
    for (var key of ALL_KEYS) {
      //Concatenate relevant IDs.
      var id_key = 'X_' + key;
      var id_key_in = elm + '_' + key;
      //Get the params from the inner HTML currently set for
      //this element and copy to the detail box.
      var x = document.getElementById(id_key_in);
      var y = document.getElementById(id_key);
      //If this element doesn't have a periodic table 
      //category, don't display meta and fix the text color. 
      if (color === "bg_unknown") {
        y.innerHTML = "";
        document.getElementById('X_n').style.color = "#B5B5B5";
      } else {
        //Otherwise, set meta innerHTML of detail box to
        //that of the element button.
        y.innerHTML = x.innerHTML;
      }
    }
  }
}

//============================================ 10b. reset_X
//Reset the information in the detail box on bottom 
//left of screen to its default general values.
//=========================================================
//Authors: MVS and LMac
//Called by: onLeave(), set_info()

function reset_X(){
  //Reset the meta and element information of the detail box
  //to its defaults when element buttons are not in focus.
  document.getElementById('X_n').style.backgroundColor = "#FFFFFF";
  document.getElementById('X_z').innerHTML = 'Z';
  document.getElementById('X_nv').innerHTML = '#';
  document.getElementById('X_hl').innerHTML = 'low';
  document.getElementById('X_hn').innerHTML = 'middle';
  document.getElementById('X_hh').innerHTML = 'high';
  document.getElementById('X_el').innerHTML = 'X';
  document.getElementById('X_name').innerHTML = 'element name';
}


//--------------------------------------------------------- 11. Guided Tour
//=========================================================
//The web interface provides the user with the option to
//onboard themselves to PseudoDojo functionality through
//a guided tour, which is accessed via the 'Quick Tutorial'
//button underneath the PseudoDojo text logo. The tour
//is essentially a series of modals attached to highlighted
//page elements over a sheer background overlay. The tour was
//initially coded using a package called Intro.js, but 
//owing to better WCAG 2.2 accessibility compliance (in
//particular, the accessibility challenges presented by 
//modals) and support, we switched to Shepherd.js. The 
//corresponding CSS is set in css/shepherd.css, with fixes 
//in css/style.css, and the JS is set in js/shepherd.min.js
//and here below.
//
//Functions:
//  11a. dojoTour_guidedtour()
//  11b. tourText()
//  11c. cleanupShephered()
//  11d. handleOutsideClick()
//  11e. removeOutsideClickHandler()
//=========================================================

//================================ 11a. dojoTour_guidedtour
//Sets the steps of the guided tour, which appear as
//modals pointing to certain highlighted elements on a
//darkened overlay. Each modal contains a text
//description of the element or functionality, a 'x' box
//to exit the guided tour, and 'next' and/or 'back'
//buttons to navigate the modals. Clicking anywhere
//outside the modal exits the tour (except for the first
//modal, which I haven't managed to figure out).
//=========================================================
//Authors: LMac and MVS
//Called by: index.html

//initialize tour to empty
let tour = null;

function dojoTour_guidedtour() {

  //Generate a new Shepherd tour object.
  tour = new Shepherd.Tour({

    //Set aspects of the tour: modals on darkened overlay,
    //with cancel icon, triangle (arrow) pointing to
    //element, custom classes, and scrolling behavior.
    useModalOverlay: true,
    defaultStepOptions: {
      cancelIcon: {enabled: true},
      scrollTo: {behavior: "smooth",block: "center"},
      classes: "shadow-md tour-button",
      arrow: true
    }
  });

  //Introduction step
  tour.addStep({
    id: "welcome",
    text: tourText("Welcome to the " +
          "<strong>PseudoDojo</strong>! Let's go on a " +
          "brief tour of the website."),
    buttons: [
      {text: "Next",action: tour.next}
    ]
  });

  //Explain radio button and download vs. validation mode.
  tour.addStep({
    id: "mode",
    attachTo: {element: "#DojoMode",on: "bottom"},
    text: tourText("First stop: are you here to " +
          "<strong>download pseudopotentials</strong>, " +
          "or to <strong>inspect the validation tests" +
          "</strong> that went into making them? Use " +
          "the radio button to select your preferred mode."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  //Describe the meaning of the TYPE options.
  tour.addStep({
    id: "pseudo_type",
    attachTo: {element: "#TYPE",on: "bottom"},
    text: tourText("The selector menu allows you to " +
          "select the aspects of the pseudopotential " +
          "you're interested in. First, select the " +
          "<strong>type</strong> of pseudopotential—either " +
          "norm-conserving or projector-augmented wave (PAW)."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  //Describe the meaning of the Relativity options.
  tour.addStep({
    id: "relativistic",
    attachTo: {element: "#REL",on: "bottom"},
    text: tourText("Next, select the <strong>relativistic " +
          "considerations</strong>. Fully relativistic " +
          "pseudos include spin-orbit coupling considerations. " +
          "NOTE: Relativistic considerations in the JTH PAW " +
          "datasets are a bit complicated. <a href=" +
          `"https://doi.org/10.1016/j.cpc.2013.12.023" ` +
          `target="_blank" rel="noopener" aria-label=` +
          `"Link to more JTH information">This paper</a> ` +
          `explains why.`),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  //Describe the meaning of the Version number.
  tour.addStep({
    id: "version",
    attachTo: {element: "#VER",on: "bottom"},
    text: tourText("Select the most recent or a prior " +
          "<strong>version</strong> of this table."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  //Describe the meaning of the exchange-correlation 
  //functional.
  tour.addStep({
    id: "XC",
    attachTo: {element: "#XC",on: "bottom"},
    text: tourText("Then, you can pick one of the " +
          "available <strong>exchange-correlation (XC) " + 
          "functionals</strong>. Have a look at the " +
          `<a href="faq" aria-label="Go to F.A.Q. page">` +
          "F.A.Q.</a> if your fuctional of choice is " +
          "not available."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  //Describe the meaning of the Accuracy options.
  tour.addStep({
    id: "accuracy",
    attachTo: {element: "#ACC",on: "bottom"},
    text: tourText("We offer pseudopotential tables in " +
          "two degrees of <strong>accuracy</strong>—" +
          "standard or stringent. Generally, the standard " +
          "table features pseudopotentials that we " +
          "consider to be a good compromise between " +
          "computational expense and chemical accuracy. " +
          `Have a look at the <a href="faq" aria-label=` +
          `"Go to F.A.Q. page">F.A.Q.</a> for a detailed ` + 
          "description on the difference between them."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  //Describe the meaning of the file format options.
  tour.addStep({
    id: "format",
    attachTo: {element: "#FMT",on: "bottom"},
    text: tourText("Here you can select the " +
          "<strong>format</strong> of the pseudopotential " +
          " file. Use <span class='hili-or'>.psp8</span> " +
          "for Abinit, <span class='hili-or'>.upf</span> "+
          "for Quantum Espresso, and <span class='hili-or'>" +
          ".psml</span> for Siesta. The <span " +
          "class='hili-or'>.in</span> gives you all the " +
          "input files that were used to generate the " +
          "pseudos, and finally, <span class='hili-or'>" +
          ".djrepo</span> will give you all the numerical " +
          "results of the validation tests in JSON format."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  //Highlight random element to demonstrate file availability
  //visualizers (on hover and selection update).
  tour.addStep({
    id: "zirconium",
    attachTo: {element: "#zirconium",on: "bottom"},
    text: tourText("In <strong>download mode</strong>, " +
          "click on an element to download its " +
          "pseudopotential. In <strong>test result mode" +
          "</strong>, clicking on an element will open up " +
          "the testing suite in a separate tab. In either " +
          "case, we've put in place accesible mechanisms " +
          "to inform you if the content is available. If " +
          `the element's box turns <strong style="color: ` +
          `#5BC75B">green</strong> on hover or a <span ` +
          `style="color: #053605">✓</span> appears, the ` +
          `file content is available. If a <span style="` +
          `color:#610000">✕</span> appears and the box ` +
          `turns <strong style="color: #CC4444">red` +
          "</strong> on hover or the <strong style=" +
          `"color: #A3A3A3">background color-to-text` +
          "</strong> contrast is low, it's not available."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  //Show the detail box to draw attention to the information
  //each button provides.
  tour.addStep({
    id: "detail_box",
    attachTo: {element: "#X_n",on: "top"},
    text: tourText("Each element box reports identifying " +
          "information, like the atomic number, the symbol, " +
          "and the element name, as well as quantitative " +
          "information related to its pseudopotential. Once " +
          "you hover over or focus on the element, this box " +
          "magnifies the information for that element."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  //Hone in on quantitative information, specifically the number
  //of valence orbitals. Give an example to make accessible.
  tour.addStep({
    id: "nv",
    attachTo: {element: "#X_nv",on: "top"},
    text: tourText("We report here for each element the " +
          "<strong>number of orbitals included in the " +
          "valence manifold</strong> (that is, the set of " +
          "outermost orbitals not included in the frozen " +
          "core). Example: carbon has electrons in the " +
          "<i>1s</i>, <i>2s</i>, and <i>2p</i> orbitals, " +
          "but pseudopotentials might only explicitly " +
          "consider the electrons in the <i>2s</i> and " +
          "<i>2p</i> shells. So for carbon, this number " +
          "would be 2."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  //Explain the energy cutoff recommendations.
  tour.addStep({
    id: "hints",
    attachTo: {element: "#LEVS",on: "top"},
    text: tourText("Each element has a list of <strong>" +
          "recommendations for the cutoff energy</strong> " +
          "(e<sub>cut</sub>) in Hartree. The <strong>low " +
          "</strong> suggestion is good for a quick " +
          "calculation or as a starting point for " +
          "convergence studies. The <strong>middle</strong> " +
          " cutoff is both accurate and computationally " +
          "light enough for high-throughput calculations. " +
          "Beyond the <strong>high</strong> cutoff energy " +
          "value, your results are unlikely to change " +
          "significantly."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  //Highlight the Download Table button.
  tour.addStep({
    id: "download_button",
    attachTo: {element: ".download_button",on: "top"},
    text: tourText(`Click on the "Download Table" button ` +
          "to get a tarball of all available " +
          "pseudopotentials in the selected format, one " +
          "pseudopotential per element for all available " +
          "elements."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  //Draw attention to the citation box, specifically the fact
  //that it updates dynamically.
  tour.addStep({
    id: "citation_box",
    attachTo: {element: ".citation_box",on: "bottom"},
    text: tourText("If you end up using our pseudos in your " +
          "work, <strong>please cite the list of papers in " +
          "this citation box</strong>, which updates " + 
          "dynamically to reflect your pseudopotential " +
          "selection criteria. Click anywhere on the box " +
          "to copy the reference list in Chicago style, " +
          `or click on <span style="background-color:#00B89C;` +
          `color: white;border-radius:6px;">&nbsp BibTeX ` +
           "&nbsp</span> to download the BibTeX entries."),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "Next",action: tour.next}
    ]
  });

  //The first Easter Egg, PseudoDojo logo and YouTube song.
  tour.addStep({
    id: "logo",
    attachTo: {element: ".logo",on: "bottom"},
    text: tourText("Finally, if you want to learn the periodic " +
          "table by heart, try clicking on the logo. 😉"),
    buttons: [
      {text: "Back",action: tour.back},
      {text: "End Tour",action: tour.next}
    ]
  });

  //When the tour starts, allow the user to click anywhere
  //outside the dialog to exit the tour.
  tour.on("start", () => {
    //Delay until Shepherd has finished rendering.
    setTimeout(() => {
       document.addEventListener("mousedown", handleOutsideClick, true);
    }, 0);
  });

  //When tour is finished or cancelled, initiate cleanup
  //protocol.
  tour.on("complete", () => cleanupShepherd() );
  tour.on("cancel", () => cleanupShepherd() );

  //Start the tour
  tour.start();
}

//=========================================== 11b. tourText
//Helper function to simplify definition of tour
//stops in dojoTour_guidedtour(), called as entry to
//tour.addStep text dictionary key. Wraps the HTML text
//in a div with tour-step-text class and tabindex=0 to
//be perceivable by accessibility software.
//=========================================================
//Authors: LMac
//Arguments: html = string with HTML code of the text to
//                  display for a tour modal
//Called by: dojoTour_guidedtour()

function tourText(html) {
  return `<div class="tour-step-text" tabindex=0>${html}</div>`;
}

//==================================== 11c. cleanupShepherd
//Patch for Shepherd that fixes an (oddly obvious) bug:
//when the tour ends or is cancelled, the overlay stays
//even as the modal disappears. This function removes the
//overlay and removes the click handler that we implement
//in 11d.
//=========================================================
//Authors: LMac
//Called by: dojoTour_guidedtour()

function cleanupShepherd() {
  //Remove overlay classes and styles.
  document.querySelectorAll(".shepherd-modal-overlay-container").forEach(e => e.remove());
  document.body.classList.remove("shepherd-active","shepherd-target-click-disabled");
  document.body.style.removeProperty("overflow");

  //Remove handler that allows the user to exit the tour
  //just by clicking outside of the modal, somewhere on
  //the overlay.
  removeOutsideClickHandler();
}


//================================= 11d. handleOutsideClick
//Allow user to exit the tour simply by clicking anywhere
//on the darkened overlay outside of the tour step modal.
//=========================================================
//Authors: LMac
//Arguments: event = coordinates of user interaction
//Called by: dojoTour_guidedtour(), 
//           removeOutsideClickHandler()

function handleOutsideClick(event) {

  //Check if tour exists and is active
  if (!tour || !tour.isActive()) return;

  //Retrieve tour step modal that is currently being
  //displayed. If it doesn't exist, exit function.
  const dialog = document.querySelector(".shepherd-element");
  if (!dialog) return;

  //Ignore click anywhere inside the tour step dialog.
  if (event.target.closest(".shepherd-element")) return;

  //Ignore Click anywhere on the highlighted element.
  if (event.target.closest(".shepherd-target")) return;

  //Otherwise, cancel the tour.
  tour.cancel();
}

//================================= 11e. handleOutsideClick
//When exiting the tour, stop monitoring the overlay for
//exit clicks.
//=========================================================
//Authors: LMac
//Called by: cleanupShepherd()

function removeOutsideClickHandler() {
  document.removeEventListener("mousedown", 
           handleOutsideClick, true);
}


//--------------------------------------------------------- 12. Warning Flags
//=========================================================
//I prefer to call these flags rather than toasts, because
//we're no longer using Toastify in order to implement
//bespole accessibility features. They're essentially
//warning messages that are raised when the user completes
//a certain action, like clicking on a pseudo that is
//unavailable or click-copying the list of citations.
//According to WCAG 2.2, when a flag raises, this flag
//must be concurrently announced to accessibility software
//like screen readers, and it must be suppressable.
//
//Functions:
//  12a. not_available_toast()
//  12b. announce()
//=========================================================

//================================ 12a. not_available_toast
//Flags unavailability of selected file when user clicks
//on an element button (or Download Table button). Flag is
//raised 10px above where the user clicked.
//=========================================================
//Authors: LMac
//Arguments: event = coordinates of user interaction
//Called by: build_ui(), checkAndDownload(),
//           downloadTable()

function not_available_toast(event) {

  //Access HTML object corresponding to the flag.
  const toast = document.getElementById("not-available-toast");

  //Set local variables and assess if the event was a
  //mouse click.
  let x, y;
  if (event instanceof MouseEvent) {
    //If user clicked, position the flag to the click
    //coordinates, shifted up by 10px so the flag does
    //not obstruct the object the user clicked.
    x = event.pageX;
    y = event.pageY - 10;

  } else {
    //If the user used keyboard to initiate the download,
    //set the flag coordinates to something near the
    //button that was implicated.
    const rect = event.currentTarget.getBoundingClientRect();
    x = rect.left + rect.width / 2 + window.scrollX - 150;
    y = rect.top + window.scrollY - 80;
  }

  //Call the announcement of the message as non-urgent.
  announce("Sorry. This content is not available.");

  //Set the positioning style classes of the flag.
  toast.style.left = `${x}px`;
  toast.style.top  = `${y}px`;

  //Raise the warning.
  toast.classList.add("show");

  //Keep the warning for a few seconds before removing it.
  setTimeout(() => {toast.classList.remove("show");}, 2000);
}

//=========================================== 12b. announce
//Announces existence of flag to accessibility software
//as soon as the flag is raised.
//=========================================================
//Authors: LMac
//Arguments: message = string of words to be announced
//           urgent = (T or F) importance of message
//                    announcement. If False (default), set 
//                    role of announcement to 'status' and
//                    tone as 'polite.' If True, set to 
//                    'alert' with 'assertive' tone.
//Called by: build_ui(), checkAndDownload(),

function announce(message, urgent = false) {

  //Identify relevant HTML object.
  const live = document.getElementById("toast-announcer");
  if (!live) return;

  //Set relevant accessibility attributes according to
  //how urgent the message is.
  live.setAttribute("role", urgent ? "alert" : "status");
  live.setAttribute("aria-live", urgent ? "assertive" : "polite");

  //Clear previous announcement.
  live.textContent = "";

  //Delay slightly so screen readers notice the change.
  setTimeout(() => {
    //Set the content of the message.
    live.textContent = message;
  }, 50);

}


//--------------------------------------------------------- 13. Footer
//=========================================================
//Provides the current year for the copyright in the footer
//on all static pages.
//=========================================================
//Authors: LMac
//Called by: index.html, about.html, faq.html, 
//           contribute.html, legal.html

document.addEventListener("DOMContentLoaded", () => {

  //Get relevant HTML object.
  const footerYear = document.getElementById("footerYear");

  //Set the year of that object to the current year.
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

});


//--------------------------------------------------------- 14. About Page Contributors
//=========================================================
//The About page renders a table of PseudoDojo contributors
//next to the scope of their contribution and any research-
//related web profiles (like Orcid or LinkedIn). The links
//are rendered as icons (either the Orcid logo or a generic
//World Wide Web icon) in Section 1. The contributors 
//database is a JSON dictionary defined in Section 1, which 
//the following functions draw from for information. To add 
//another contributor, simply add the entry to the 
//dictionary.
//
//Functions:
//  14a. makeIconLink()
//  14b. buildContributorTable()
//  14c. contributors-table event listener 
//=========================================================

//======================================= 14a. makeIconLink
//Assembles the HTML for a particular link, rendered as an
//icon, given the link URL, the ARIA label, the icon SVG,
//and the CSS class to style it.
//=========================================================
//Authors: LMac
//Arguments: url = Orcid link or website URL to be 
//                 associated with this icon (string)
//           label = ARIA label for this link (string)
//           svg = icon svg (either orcidSVG or websiteSVG)
//           cssClass = extra CSS classes for styling
//Called by: buildContributorTable()

function makeIconLink(url, label, svg, cssClass) {

  //Make sure there's a valid link.
  if (!url) return "";

  //Return HTML for link.
  return `<a class="icon-link center ${cssClass}"
             href="${url}" target="_blank"
             rel="noopener noreferrer"
             aria-label="${label}">
             ${svg}
          </a>`;
}

//======================================= 14b. makeIconLink
//Builds the HTML of the full contributor table. Starts
//by assembling the rows by looping over all entries in
//CONTRIBUTORS and rendering icons for research profiles.
//Then sets the innerHTML as a figure tag wrapping a table
//tag. Screen reader headings added where possible,
//although ARIA is limited per WebAIM recommendations.
//=========================================================
//Authors: LMac
//Arguments: containerId = HTML object ID for the table
//                         ("contributors-table")
//Called by: contributors-table event listener

function buildContributorTable(containerId) {

  //Get HTML object.
  const container = document.getElementById(containerId);

  //Loop over contributors dictionary (defined in Section 1)
  //to define a row for each.
  const rows = CONTRIBUTORS.map(person => `
    <tr>
      <th scope="row" class="c1">
        <div class="person center">
          <span class="person-name">
            ${person.name} 
          </span>

          <span class="person-links">
            ${makeIconLink(person.orcid, 
                           `ORCID profile of ${person.name}`,
                           orcidSVG,
                           "orcid"
            )}

            ${makeIconLink(person.website,
                           `Research website of ${person.name}`,
                           websiteSVG,
                           "website"
            )}
          </span>
        </div>
      </th>

      <td class="c2">${person.contribution}</td>
    </tr>`
  ).join("");

  //Wrap rows in HTML tags, add headers, screen-reader
  //information, caption, and style these components.
  container.innerHTML = `
    <figure style="margin:0;">
      <table class="contributors">
        <caption class="sr-only">
          Contributors to PseudoDojo and the scope of their contributions
        </caption>
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

//================== 14c. contributors-table event listener
//Waits for about.html to load before constructing the
//contributors table, but only on the page where the
//element with ID = contributors-table is found.
//=========================================================
//Authors: LMac
//Called by: index.html

document.addEventListener("DOMContentLoaded", () => {

  //Get object associated with ID = contributors-table.
  const conttable = document.getElementById("contributors-table");

  //If it doesn't exist (like most HTML pages), don't 
  //render the table.
  if (!conttable) return;
  //Otherwise, build the table.
  buildContributorTable("contributors-table")
});


//--------------------------------------------------------- 15. Page Content Trees
//=========================================================
//For pages with a lot of information, web content best
//practices suggest breaking up text into ragged-right
//paragraphs spanning no more than 75 characters in width.
//To facilitate this, LMac coded up the following
//content tree structure for each static page.

//There are four static pages across the site:
//     -- About              (about.html)
//     -- F.A.Q.             (faq.html)
//     -- Contribute         (contribute.html)
//     -- Legal & Privacy    (legal.html)
//The Legal & Privacy page is only accessible via the 
//footer navigation. All other pages are in the main 
//navigation bar at the top right of the page. All pages 
//have the same structure:
//     -- Main navigation bar (with Home page button)
//     -- PseudoDojo text logo linked to home page
//     -- Smaller arrow pointing to content
//     -- Header content announcing page
//     -- Content tree
//     -- Footer (with PseudoDojo text logo)
//The content tree is a teal line (trunk) with an arrow 
//travelling along it as the user scrolls down. Tree nodes 
//are white boxes that hold content, and they alternate 
//sides of the trunk. The nodes are connected to the trunk 
//via branches: teal lines with circles that intersect the 
//trunk. When the arrow passes a circle, the interface 
//emits a subtle orange ripple for a bit of visual whimsy.
//
//To create a new static page with this structure, it
//suffices to insert the following HTML snippet
//below the header tag (** = insert tailored content):
//
//  <!-- Salient page content -->
//  <main id="main-content">
//    <div class="page-wrapper">
//      <!-- Page title and headline -->
//      <aside tabindex=0 class="headsup center">
//        <div class="page_title center" 
//             aria-label="Page title, **TITLE OF PAGE** ">
//          <h1>**TITLE OF PAGE**</h1>
//        </div>
//        <h2 class="headline center">
//          **BRIEF DESCRIPTION OF PAGE PURPOSE**
//        </h2>
//      </aside>
//
//      <!-- Begin content tree structure -->
//      <div id="tree" class="tree">
//        <div class="tree-trunk" aria-hidden="true">
//
//          <!-- Draw the tree -->
//          <svg id="tree-svg" preserveAspectRatio="none">
//            <path id="tree-path" fill="none"/>
//          </svg>
//          <!-- Animate the tree arrow -->
//          <div class="tree-arrow" aria-hidden="true"></div>
//          <!-- Draw tree end node -->
//          <div class="tree-end-node" aria-hidden="true"></div>
//
//        </div>
//
//        <!-- Animate the ripples at each tree node -->
//        <div class="tree-effects" aria-hidden="true"></div>
//
//        <!-- First tree node -->
//        <section tabindex=0 class="tree-node">
//          <h3>**TITLE OF SUBSECTION**</h3>
//          **SUBSECTION CONTENT**
//        </section>
//
//        <!-- Second tree node -->
//        <section tabindex=0 class="tree-node">
//          ...
//        </section>
//
//        ...
//
//      </div> <!-- End of tree div -->
//    </div> <!-- End of page-wrapper div -->
//  </main>
//
//Functions:
//  15a. tree event listener
//  15b. drawTree()
//  15c. waitForTreeImages()
//  15d. moveArrow()
//  15e. rippleAt()
//=========================================================

//================================ 15a. tree event listener
//Monitors current page for user changes like scrolling
//and resizing, then initiates the appropriate action
//(like redrawing the tree SVG or moving the arrow).
//Runs when the HTML document is finished loading.
//=========================================================
//Authors: LMac
//Called by: about.html, faq.html, contribute.html,
//           legal.html

document.addEventListener("DOMContentLoaded", async () => {

  //Get tree object from HTML tag ID. If it doesn't
  //exist, exit.
  const tree = document.getElementById("tree");
  if (!tree) return;

  //Wait until the logo images have their dimensions.
  await waitForTreeImages();

  //Draw the tree initially.
  drawTree();
  moveArrow();

  //Move the arrow as the user scrolls.
  window.addEventListener("scroll", moveArrow, {
    passive: true
  });

  //Redraw and reposition when the window changes size.
  window.addEventListener("resize", () => {
    drawTree();
    moveArrow();
  });

});

//=========================================== 15b. drawTree
//Draw the tree structure, including the SVG of its
//trunk, branches, and nodules, as well as the content
//nodes, according to the node content set in each static 
//HTML page. In particular, set height, width, and
//coordinate properties.
//=========================================================
//Authors: LMac
//Called by: tree event listener 

function drawTree() {

  //Set gap between bottom of a tree node and the top of
  //the next tree node that is on the same side of trunk.
  const GAP = 50;

  //Vertical offset of the start of the first node.
  const START_Y = 100;

  //Get list of all nodes on this page as JS array.
  const nodes = [...document.querySelectorAll(".tree-node")];

  //Keep track of the lowest point on the left and right
  //sides of the tree respectively. This info will be
  //used to place the overlapping next node and to inform
  //the total height of the tree SVG.
  let leftBottom = START_Y;
  let rightBottom = START_Y;

  //Temporarily reset all node coordinates to 0.
  nodes.forEach(node => {
    node.style.top = "0px";
  });

  //Loop over all tree nodes to calculate positions.
  nodes.forEach((node, i) => {

    //Fetch the height of the current node (its white box,
    //which is a function of the content, and declare
    //node's vertical position.
    const h = node.offsetHeight;
    let y;

    //If this is the first node...
    if (i === 0) {
      //...place it at the defined vertical offset.
      y = START_Y;

      //Take note of the minimum height on the right side
      //of the trunk.
      rightBottom = y + h;

    //For all other nodes...
    } else {
      //...get the immediately prior node object.
      const prev = nodes[i - 1];

      //Define the desired position of the current node as
      //halfway down the height of the previous node.
      y = prev.offsetTop + prev.offsetHeight / 2;

      //If the node is on the left side...
      if (i % 2 === 1) {
        //...place the node either at the halfway point of
        //the prior node, or at the bottom of the left side
        //plus a gap between them, whichever is LOWER.
        y = Math.max(y, leftBottom + GAP);

        //Redefine the bottom of the left side.
        leftBottom = y + h;

      //If the node is on the right side...
      } else {
        //...same as above, but on the right side.
        y = Math.max(y, rightBottom + GAP);

        //Redefine the bottom of the right side.
        rightBottom = y + h;
      }
    }

    //Set this node's vertical coordinate.
    node.style.top = `${y}px`;

  }); //End of loop over nodes.

  //Obtain the relevant HTML objects for the tree, the SVG
  //and the path.
  const tree = document.querySelector(".tree");
  const svg  = document.getElementById("tree-svg");
  const path = document.getElementById("tree-path");

  //Get the final tree node and define the tree's height to
  //the last node's vertical coordinate plus its height, plus
  //an extra 150px so the bottom of the last node does not
  //overlap with the footer.
  const last = nodes[nodes.length - 1];
  tree.style.height = `${last.offsetTop + last.offsetHeight + 150}px`;

  //Define variables for the current width and height of
  //the tree container.
  const w = tree.clientWidth;
  const h = tree.clientHeight;

  //Match the SVG's coordinate system to the tree dimensions.
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

  //Set the x-coordinate of the top of the trunk: it should
  //look like the trunk stems from the page_title box.
  const x0 = 0.22 * w;

  //Set the middle (main) part of the trunk to the center of
  //the viewport.
  const x1 = 0.50 * w;

  //Tree trunk starts at the top of the container.
  const y0 = 0;

  //Vertical start and end of the diagonal line pivoting
  //the trunk from the page_title to the center of the
  //viewport.
  const y1 = 50;
  const y2 = 100;

  //Draw the trunk as an SVG. Path ends 30px above the tree
  //so that the arrow doesn't do a weird curve thing as it
  //reaches the end of the line.
  path.setAttribute("d",
    `M ${x0} ${y0}
     L ${x0} ${y1}
     L ${x1} ${y2}
     L ${x1} ${h-30}`
  );

  //Find every node on the left side and position its nodule
  //30px to the left of x0 (TODO: fix this).
  document.querySelectorAll(".tree-node.left").forEach(node => {
    node.style.setProperty("--nodule-left", `${x0 - 30}px`);
  });

  //Find every node on the right side and position its nodule
  // 30px to the left of the center trunk.
  document.querySelectorAll(".tree-node.right").forEach(node => {
    node.style.setProperty("--nodule-left", `${x1 - 30}px`);
  });

  //Add last node to indicate the bottom of the tree path.
  const endNode = document.querySelector(".tree-end-node");
  const end = path.getPointAtLength(path.getTotalLength());
  endNode.style.left = `${end.x}px`;
  endNode.style.top  = `${end.y}px`;

}

//================================== 15c. waitForTreeImages
//Have the event listener wait for the images in tree
//nodes to load before drawing the tree. This is there
//specifically because of the logo node in faq.html.
//=========================================================
//Authors: LMac
//Called by: tree event listener

function waitForTreeImages() {

  //Find image objects.
  const images = document.querySelectorAll(".tree-node img");

  //Loop through all images on the page and return a
  //promise to eventually complete the async operation...
  return Promise.all([...images].map(img => {
    //...if the img has completed loading...
    if (img.complete) {
      //...resolve the promise according to definition
      //below.
      return Promise.resolve();
    }

    //Define the resolution of the promise.
    return new Promise(resolve => {
      //Call resolve when the image successfully loads.
      img.addEventListener("load", resolve, { once: true });
      //Call resolve also when an error is encountered.
      img.addEventListener("error", resolve, { once: true });
    });
  }));
}

//========================================== 15d. moveArrow
//As the user scrolls down (up) on a page with a content 
//tree, a small arrow travels down (up) the trunk of the 
//content tree. This function regulates this animation.
//=========================================================
//Authors: LMac
//Called by: tree event listener

//Keep track of the nodes that have been visited already.
const visitedNodes = new Set();
function moveArrow() {

  //Grab relevant HTML objects from current page.
  const tree = document.getElementById("tree");
  const path  = document.getElementById("tree-path");
  const arrow = document.querySelector(".tree-arrow");

  //Total height of path set in css/style.css at #tree-svg
  //and in drawTree(). The height is set everytime the user
  //resizes the window to be the height of all the node
  //boxes (taking into account their overlaps) plus 150 px
  //at the bottom for fluidity. 
  const total = path.getTotalLength();

  //Set the lowest point where the arrow is allowed to go.
  const maxScroll = document.documentElement.scrollHeight
                    - window.innerHeight
                    + 10;

  //Convert user's scroll position to a value between
  //0 (at the top of the page) and 1 (at the bottom).
  const progress = maxScroll <= 0 ? 0 : window.scrollY / maxScroll;

  //Get the x,y coordinates of the desired scroll 
  //placement along the trunk path.
  const pt = path.getPointAtLength(progress * total);

  //Set the arrow coordinates to exactly this point w/ CSS.
  arrow.style.left = `${pt.x}px`;
  arrow.style.top  = `${pt.y}px`;

  //Implement ripple emission once arrow intersects with
  //node nodules on the trunk.
  //Loop through every tree node in this page.
  document.querySelectorAll(".tree-node").forEach((node,i)=>{

    //Fetch this node's top and left coordinate relative to
    //the browser viewport as well as its height and width.
    //Fetch same for overall tree rectangle.
    const r = node.getBoundingClientRect();
    const treeRect = tree.getBoundingClientRect();

    //Fetch the coordinates/size of the small nodule 
    //extending from the node and intersecting with the 
    //tree trunk.
    const style = getComputedStyle(node, "::before");
    const noduleLeft = parseFloat(style.left);
    const noduleTop = parseFloat(style.top);
    const noduleWidth = parseFloat(style.width);
    const noduleHeight = parseFloat(style.height);

    //Calculate coordinates of the center of the nodule
    //with respect to the tree.
    const x = pt.x;
    const y = r.top + noduleTop + noduleHeight / 2
              - treeRect.top;

    //Finally, calculate distance between the arrow
    //coordinates and the node's coordinates.
    const dx = pt.x - x;
    const dy = pt.y - y;

    //If distance is smaller than 18px...
    if(dx*dx + dy*dy < 18*18){
      //...and if this node hasn't been visited already...
      if(!visitedNodes.has(i)){
        //...consider it to have been visited and spark
        //a ripple at this coordinate.
        visitedNodes.add(i);
        rippleAt(x,y);
      }
    }
    //If distance is larger than 18px, delete this node
    //from the list of visited nodes.
    else{
      visitedNodes.delete(i);
    }
  });

  //Find a point 2px ahead of the arrow on the trunk,
  //presuming we're not at the bottom of the page.
  const ahead = path.getPointAtLength(
        Math.min(progress * total + 2, total)
  );

  //Calculate a change in direction of the path.
  const angle = Math.atan2(ahead.y - pt.y,
                ahead.x - pt.x) * 180 / Math.PI;

  //Rotate the arrow to that angle.
  arrow.style.transform = `translate(-50%,-50%) rotate(${angle - 90}deg)`;

}

//=========================================== 15e. rippleAt
//Emit a small orange ripple emanating from this x,y
//coordinate when the scrolling arrow intersects with a
//tree node.
//=========================================================
//Authors: LMac
//Arguments: x = an x coordinate [px]
//           y = a y coordinate [px]
//Called by: moveArrow()
 
function rippleAt(x,y){

  //Find the special effects HTML object.
  const fx = document.querySelector(".tree-effects");

  //Create a new div tag in which to build the ripple.
  const r = document.createElement("div");
  r.className = "tree-ripple";

  //Style its coordinates to the arguments.
  r.style.left = `${x}px`;
  r.style.top = `${y}px`;

  //Offset the ripple onto the center of the nodule.
  r.style.transform = "translate(-50%, -50%)";

  //Append the div to the tree effects HTML object.
  fx.appendChild(r);

  //After 800ms, remove the ripple from the DOM.
  setTimeout(() => r.remove(), 800);

}


//--------------------------------------------------------- 16. Easter Egg
//============================================== 16a. chaos
//Chaos! At the disco when the user clicks on Oganesson
//=========================================================
//Authors: MVS (and Matteo?)
//Called by: periodic-table event listener

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



