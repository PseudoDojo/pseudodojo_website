"use strict";

const DEBUG = false;

const ANIMATE = 1;

const ALL_KEYS = ['hh', 'hl', 'hn', 'nv'];  // 'd', 'dp', 'gb'];

const ALL_ELEMENTS = [
  'H', 'He', 
  'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne','Na', 'Mg', "Al", "Si", 'P', 'S', 'Cl', 'Ar', 
  'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr',
  'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe',
  'Cs', 'Ba',
  'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er','Tm','Yb', 'Lu',
  'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn',
  "Fr", "Ra",
  "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr",
  "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"
  //"Uue", "Ubn"
];


const COLORS = {
  "bg_hydrogen": "#d16969",
  "bg_alkali": "#d19292",
  "bg_alkaline": "#d1bd92",
  "bg_transition_metal":"#a9c4d4",
  "bg_post_transition_metal": "#a3b2d6",
  "bg_metalloid": "#bdd6a3",
  "bg_nonmetal": "#d6a3be",
  "bg_halogen": "#d2d6a3",
  "bg_noble_gas": "#c4cdff",
  "bg_lanthanoid": "#edb8ff",
  "bg_actinoid": "#bf96ff",
  "bg_she": "#82E0AA"
};


var FILES = null;
var TARGZ = null;


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


function set_warning(txt) {
  // Set the text in the warning box
  var warningbox = document.getElementById('warning_box');
  warningbox.innerHTML = "<div class='alert warning'><span id='cbn' class='closebtn'>&times;</span><strong>Warning!</strong> ".concat(txt, "</div>");
  var close = document.getElementById("cbn");
  close.onclick = function(){
     var div = document.getElementById('warning_box');
     setTimeout(function(){div.innerHTML = "";}, 100);
  }
}


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

    for (var el of ALL_ELEMENTS) {
        for (const key of ALL_KEYS) {
            var id_key = el + '_' + key;
            var x = document.getElementById(id_key);
            var el_info = info[el];
            if (x === null) console.log("null for id_key:", id_key, "el:", el, "key", key, "el_info", el_info);

            var val = 'na';
            if (el_info === undefined || el_info === null) {
                val = 'na';
            }
            else {
                val = el_info[key];
                if (val === undefined || val === null) val = "na";
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

    //console.log("averages:", averages);
    //console.log("sums:", sums);

    for (var key of ALL_KEYS) {
        averages[key] = averages[key] / sums[key];
        averages[key] = averages[key].toFixed(1);
    }

    if (sums["hl"] > 0) {
        set_average(averages);
        reset_X();
    }
}

function dojo_start() {
    // Main entry point.
    // Load dictionaries from json files, set the global variables FILES and TARGZ and build the user interface.
    var a = $.getJSON("files.json");
    var b = $.getJSON("targz.json");

    $.when(a, b).done(function(v1, v2){
       // when all requests are successful
       FILES = v1[0];
       TARGZ = v2[0];
       build_ui();
    });
}


function load_set_info() {
    var type = document.getElementById('TYP').value;
    var xcf = document.getElementById('XCF').value;
    var acc = document.getElementById('ACC').value;
    //if (DEBUG) console.log("In load_set_info with type:", type, "xcf:", xcf, "acc:", acc);

    // Build dictionary element_symbol -> metadata.
    var meta = {};
    for (const elm of ALL_ELEMENTS) {
        try {
            meta[elm] = FILES[type][xcf][acc][elm]["meta"];
        }
        catch (error) {
            if (DEBUG) console.log("Cannot find element:", elm, "with type:", type, "xcf:", xcf, "acc:", acc, "\n", error);
            meta[elm] = {};
        }
    }
    if (DEBUG) console.log("meta:", meta);
    set_info(meta);
}


function set_X(elm, color, n) {
    // Update params shown in the X_n box.
    if (ALL_ELEMENTS.indexOf(elm) >= 0) {
        document.getElementById('N').innerHTML = n;
        document.getElementById('X_n').style.backgroundColor = color;
        document.getElementById('X_el').innerHTML = elm;
        for (var key of ALL_KEYS) {
            var id_key = 'X_' + key;
            var id_key_in = elm + '_' + key;
            // Get the params from the pseudo associated to this element and copy to the X box.
            var x = document.getElementById(id_key_in);
            var y = document.getElementById(id_key);
            //console.log("In set_X with key:", key);
            if (key === "nv") {
                y.innerHTML = "<small>n<sub>v</sub></small>" + x.innerHTML;
            }
            else {
                y.innerHTML = x.innerHTML;
            }
        }
    }
}


function reset_X(){
    // Reset the params shown in the X_n box.
    document.getElementById('X_el').innerHTML = 'Mean'
    document.getElementById('N').innerHTML = '';
    document.getElementById('X_n').style.backgroundColor = "#ffffff";
    for (var key of ALL_KEYS) {
        document.getElementById("X_" + key).innerHTML = document.getElementById("av_" + key).innerHTML;
    }
}


function set_average(vals){
    document.getElementById('av_el').innerHTML = 'Mean'
    for (var key of ALL_KEYS) {
        var node = document.getElementById("av_" + key)
        if (key === "nv") {
            node.innerHTML = "<small>n<sub>v</sub></small>" + vals[key];
        }
        else {
            node.innerHTML = vals[key];
        }
    }
}


function show_X(){
    // Show the X_n box.
    document.getElementById('X_n').style.visibility = "visible";
}


function hide_X(){
    // Hide the X_n box.
    document.getElementById('X_n').style.visibility = "hidden";
}


function humanize(size) {
	var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
	var ord = Math.floor(Math.log(size) / Math.log(1024));
	ord = Math.min(Math.max(0, ord), units.length - 1);
	var s = Math.round((size / Math.pow(1024, ord)) * 100) / 100;
	return s + ' ' + units[ord];
}


function dojoTour_guidedtour() {
    var intro = introJs();
    intro.setOptions({
      steps: [
        {
          intro: "Welcome to the PseudoDojo! Let me explain how to use the website."
        },
        {
          element: '#TYP',
          intro: "Here you select the type of pseudopotential. " + 
                 "SR stands for scalar relativistic, FR for fully relativistic (including SOC). " +
                 'The options for XC, table and format are adjusted based on your choice.'
        },
        {
          element: '#XCF',
          intro:  "Here you can pick one of the available exchange-correlation functionals. " +
                  "Have a look at the F.A.Q. if your fuctional of choice is not available."
        },
        {
          element: '#ACC',
          intro:  "Here you can select one of the available tables. " +
                  "Have a look at the F.A.Q. for a detailed description."
        },
        {
          element: '#FMT',
          intro:  "Here you can select the format of the pseudopotential file. " +
                  "PSP8 for ABINIT, UPF2 for Quantum Espresso, PSML1.1 is supported by Siesta. " +
                  "When you select HTML, clicking the elements will display a full report of all the tests we performed. " +
                  "Finally djrepo will give you all the numerical results of the tests in JSON format."
        },
        {
          element: '#X_n',
          intro:  "As long as you don't hover one of the elements, this box shows the average values " +
                  " for the table you've selected. " +
                  "Once you hover the element, the box shows the values for that element. "
        },
        {
          element: "#X_hl",
          intro:  "This is the low cutoff energy hint (Ha). " + 
                  "Good for a quick calculation or as a starting point for convergence studies."
        },
        {
          element: "#X_hn",
          intro:  "This is the normal cutoff energy hint (Ha). A good guess for high-throughput calculations."
        },
        {
          element: "#X_hh",
          intro:  "This is the high cutoff energy hint (Ha), beyond this value you should not observe " +
                  "significant changes in the results anymore."
        },
        {
          element: "#X_nv",
          intro:  "The number of valence electrons."
        },
        //{
        //  element: "#X_d",
        //  intro:  "The results of the delta gauge test (meV). " + 
        //          "This is the integral between the equation of state calculated using the pseudo potential " +
        //          "and a reference all electron equation of state."
        //},
        //{
        //  element: "#X_dp",
        //  intro:  "The normalized delta gauge."
        //},
        //{
        //  element: "#X_gb",
        //  intro:  "The gbrv fcc and bcc average (%). " +
        //          "This is the relative error in the lattice parameter with respect to reference all electrons results."
        //},
        {
          element: "#silicon",
          intro:  "Click all the elements in the table to download or view the selected file for a single element. " + 
                  "If the box turns green the file is available, if it turns red the file is not available."
        },
        {
          element: ".download_button",
          intro:  "Alternatively, with the download button you can get a tarball with the full table, " +
                  "one pseudopotential per element."
        },
        {
          element: "#papers",
          intro:  "A list of papers using PseudoDojo pseudopotentials. Did you use them? " +
                  "Send us the DOI and we'll add yours as well."
        },
        {
          element: ".logo",
          intro:  "Finally, if you want to learn the periodic table by heart try clicking here."
        }
      ],
      showProgress: true,
      overlayOpacity: 0.3
    });

    //var remove_glow = function() {
    //    console.log('exiting');
    //    $("#guided-tour-button").removeClass("glow");
    //};
    //intro.onexit(remove_glow);
    //intro.oncomplete(remove_glow);

    intro.start();
}


function dynamic_dropdown(type){
  // Set the values of the XC/Accuracy/Format widgets given the pseudo type.
  if (DEBUG) console.log('dynamic dropdown: setting for type:', type);
  var acc = document.getElementById("ACC");
  var xcf = document.getElementById("XCF");
  var fmt = document.getElementById("FMT");
  // Empty options before starting.
  acc.length = 0;
  xcf.length = 0;
  fmt.length = 0;

  document.getElementById('warning_box').innerHTML = "";
  //set_warning(' this version is outdated')

  switch (type) {
    case "jth-sr-v1.1" :
      // List of tables
      acc.options[0] = new Option("standard", "standard");
      acc.options[1] = new Option("stringent", "stringent");
      // List of XC functionals
      xcf.options[0] = new Option("PBE", "PBE");
      xcf.options[1] = new Option("LDA", "LDA");
      // List of file formats
      fmt.options[0] = new Option("xml", "xml");
      //fmt.options[1] = new Option("upf", "upf");
      break;

    case "nc-sr-v0.4" :
      // List of tables
      acc.options[0] = new Option("standard", "standard");
      acc.options[1] = new Option("stringent", "stringent");
      //acc.options[2] = new Option("f-frozen", "f-frozen");
      // List of XC functionals
      xcf.options[0] = new Option("PBE", "PBE");
      xcf.options[1] = new Option("PBEsol", "PBEsol");
      xcf.options[2] = new Option("LDA", "LDA");
      // List of file formats
      fmt.options[0] = new Option("psp8", "psp8");
      fmt.options[1] = new Option("upf", "upf");
      fmt.options[2] = new Option("psml", "psml");
      fmt.options[3] = new Option("html", "html");
      fmt.options[4] = new Option("djrepo", "djrepo");
      break;

    case "nc-fr-v0.4" :
      // List of tables
      acc.options[0] = new Option("standard", "standard");
      acc.options[1] = new Option("stringent", "stringent");
      // List of XC functionals
      xcf.options[0] = new Option("PBE", "PBE");
      xcf.options[1] = new Option("PBEsol", "PBEsol");
      //xcf.options[2] = new Option("PBEsol", "PBEsol");
      // List of file formats
      fmt.options[0] = new Option("psp8", "psp8");
      fmt.options[1] = new Option("upf", "upf");
      fmt.options[2] = new Option("psml", "psml");
      fmt.options[3] = new Option("html", "html");
      fmt.options[4] = new Option("djrepo", "djrepo");
      break;

    //case "nc-sr-04-3plus" :
    //  set_warning(" this table contains Lanthanide potentials for use in the 3+ configuration only. " +
    //            "<b>They all have the f-electrons frozen in the core.</b> " +
    //            "The hints are based on the convergence of the nitride lattice parameter, see the report under format:html for details.");
    //  acc.options[0] = new Option("standard", "standard");
    //  xcf.options[0] = new Option("PBE", "PBE");
    //  fmt.options[0] = new Option("psp8", "psp8");
    //  fmt.options[1] = new Option("upf", "upf");
    //  fmt.options[2] = new Option("psml", "psml");
    //  fmt.options[3] = new Option("html", "html");
    //  fmt.options[4] = new Option("djrepo", "djrepo");
    //  break;

    //case "core" :
    //  // TODO or perhaps add new format and handle file download.
    //  document.getElementById("ACC").options[0] = new Option("", "standard");
    //  document.getElementById("XCF").options[0] = new Option("PBE","pbe");
    //  document.getElementById("FMT").options[2] = new Option("FC","fc");
    //  break;
    default:
      throw 'Invalid type: ' + type;
  }
}


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


function _get_pseudo_selection(dom_object){

  var str = dom_object.attr("class");
  var res = str.split(" ");
  var dum = res[2];
  var n = parseInt(dum.split("_")[0]);
  var color = COLORS[res[1]];
  var res = dum.split("_");
  var elm = res[1];

  var type = $("#TYP").val();
  var xcf = $("#XCF").val();
  var acc = $("#ACC").val();
  var fmt = $("#FMT").val();
  
  try {
    var url = FILES[type][xcf][acc][elm][fmt];
  } 
  catch (error) {
    var url = null;
    if (DEBUG) {
        console.log("Error in _get_pseudo_selection for elm:", elm, "type: ", type, "xcf:", xcf, "acc:", acc, "fmt:", fmt);
        console.log(error);
    }
  }

  var select = {elm: elm, url: url, type: type, xcf: xcf, acc: acc, fmt: fmt, color: color, n: n};
  if (DEBUG) {
    console.log("in _get_pseudo_selection with url:", url);
    console.log("select:", select);
  }

  return select;
}


function _get_targz_selection(){
  var type = $("#TYP").val();
  var xcf = $("#XCF").val();
  var acc = $("#ACC").val();
  var fmt = $("#FMT").val();

  try {
    var url = TARGZ[type][xcf][acc][fmt];
  } 
  catch (error) {
    console.log("Error in _get_targz_selection:", error);
    var url = null;
  }
  if (DEBUG) console.log("in _get_targz_selection with url:", url)

  return {url: url, type: type, xcf: xcf, acc: acc, fmt: fmt};
}


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


function build_ui(){
  document.getElementById('av').style.visibility = "hidden";
  // fill the options for XCF ACC and FMT based on the type.
  set_options();
  load_set_info();

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

    // Here we hide the numbers on the right side. 
    // We keep it in the HTML so that we can easily reuse it if needed.
    const hide_classes = ["r_top", "r_follow"];
    for (var cls of hide_classes) {
        for (var tohide of document.getElementsByClassName(cls)) {
            tohide.style.visibility = "hidden";
        }
    }

    $('.plugin').hover(
      // .hover(handlerIn, handlerOut)
      function(){
        var mythis = $(this);
        var sel = _get_pseudo_selection(mythis);
        
        // update the X_n box.
        set_X(sel.elm, sel.color, sel.n);
        
        if (sel.url) {
            mythis.css("background-color", "#44AA44");
            mythis.css("color", "#FFFFFF");
        }
        else {
            mythis.css("background-color", "#CC4444");
            mythis.css("color", "#FFFFFF");
        }
      }, function(){
        reset_X();
        var mythis = $(this);
        var str = mythis.attr("class");
        var res = str.split(" ");
        var bgori = COLORS[res[1]];
        mythis.css("background-color", bgori);
        mythis.css("color", "#4B4B4D");
    });

    $('.plugin').on('click', function() {
      // get the element selected by the user.
      var mythis = $(this);
      var sel = _get_pseudo_selection(mythis);

      if (! sel.url) {
        show_toast("Sorry but this file is not available!");
        return;
      }

      if (sel.fmt === 'html'){
        $.get(sel.url)
          .done(function() {
            // exists code
            window.location.href = sel.url;
            //window.open(sel.url, '_blank');
          })
          .fail(function() {
            // not exists code
          })}
      else {
        $.get(sel.url)
          .done(function() {
            // exists code
            window.downloadFile(sel.url);
          })
          .fail(function() {
            // not exists code
          })}
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

    $('.download_button').on('click', function(e) {
      // Download the targz file with the full table.
      var sel = _get_targz_selection();

      if (! sel.url) {
        show_toast("Sorry but this targz is not available!");
        return;
      }

      $.get(sel.url)
        .done(function() {
            // exists code
          window.location.href = sel.url;
        })
        .fail(function() {
            // not exists code
        })
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


function set_options(){
  // fill the options for XCF ACC and FMT based on the type.
  var typ = getParameterByName('typ');
  if (typ === null){
    typ = document.getElementById('TYP').value;
  }
  var options = document.getElementById('TYP').options;
  for (var i in options){
    if (options[i].value == typ){
         options[i].selected = true;
    }
  }

  dynamic_dropdown(typ);

  // if XCF ACC and FMT have been changed previously set them back to those selections 
  if (localStorage.getItem('selectedXCF')) {
    var options = document.getElementById('XCF').options
    for (var i in options){
       if (options[i].value == localStorage.getItem('selectedXCF')){
         options[i].selected = true;
       }
    }
  }

  if (localStorage.getItem('selectedACC')) {
    var options = document.getElementById('ACC').options
    for (var i in options){
       if (options[i].value == localStorage.getItem('selectedACC')){
         options[i].selected = true;
       }
    }
  }

  if (localStorage.getItem('selectedFMT')) {
    var options = document.getElementById('FMT').options
    for (var i in options){
       if (options[i].value == localStorage.getItem('selectedFMT')){
         options[i].selected = true;
       }
    }
  }
}
