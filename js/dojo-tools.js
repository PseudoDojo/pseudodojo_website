/*
*/

const DEBUG = true;

const ALL_KEYS = ['hh', 'hl', 'hn', 'nv', 'd', 'dp', 'gb'];

const ALL_ELEMENTS = [
  'H', 'He', 
  'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne','Na', 'Mg', "Al", "Si", 'P', 'S', 'Cl', 'Ar', 
  'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr',
  'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe',
  'Cs', 'Ba',
  'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er','Tm','Yb', 'Lu',
  'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn'
];


function getParameterByName(name) {
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
     setTimeout(function(){ div.innerHTML = ""; }, 100);
  }
}


function make_light() {
    document.getElementById('FMT').value = 'psp8'
    hide_clases = ["hide", "name", 'intro', "styled-longselect", "selection_bar", "help_button", "description", "menubar"];
    for (var j = 0; j < hide_clases.length; j++) {
        var tohide = document.getElementsByClassName(hide_clases[j]);
        for (var i =0; i < tohide.length; i++) {
            tohide[i].style.visibility="hidden";
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


function set_info(info, animate) {
    var averages = [0, 0, 0, 0, 0, 0, 0];
    var sums = [0, 0, 0, 0, 0, 0, 0];

    if (animate * localStorage.getItem('animate') === 1){
        //console.log('added animating');
        $('.plugin').removeClass('anim');
        $('.plugin').removeClass('chaos');
        setTimeout("$('.plugin').addClass('anim')", 10)
    }

    for (el in ALL_ELEMENTS) {
        for (key in ALL_KEYS){
            var id_key = ALL_ELEMENTS[el] + '_' + ALL_KEYS[key];
            var x = document.getElementById(id_key);
            var el_info = info[ALL_ELEMENTS[el]];
            var val = 'na';
            if (typeof(el_info) == 'undefined') {
                val = 'na';
            }
            else {
                val = el_info[ALL_KEYS[key]];
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
    for (i in averages){
        averages[i] = averages[i] / sums[i]
        averages[i] = averages[i].toFixed(2)
    }

    var summary = "The averages of this table:\n\n"
    summary += "low hint\t\t\t\t: " + averages[1] + " Ha\n"
    summary += "normal hint\t\t\t: " + averages[2] + " Ha\n"
    summary += "high hint\t\t\t\t: " + averages[0] + " Ha\n"
    summary += "nuber of valence shells\t: " + averages[3] + " \n"
    summary += "delta\t\t\t\t\t: " + averages[4] + " meV\n"
    summary += "normalized delta\t\t: " + averages[5] + " \n"
    summary += "gbrv\t\t\t\t\t: " + averages[6] + " %\n"
    if (sums[0] > 0) {
        set_av(averages);
        reset_X()
    }
}

function loadJSON(file, callback) {
    // Helper function to load a json file and execute a callback that receives the json string
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == 200) {
            // Required use of an anonymous callback as .open will NOT return a value 
            // but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);
 }


var FILES = null;
var TARGZ = null;


function store_available_files() {
    // Load dictionaries from json files and set global variables: FILES and TARGZ.
    loadJSON('files.json', function(text) {
        FILES = JSON.parse(text);
    });
    loadJSON('targz.json', function(text) {
        TARGZ = JSON.parse(text);
    });
}


function load_set_info(animate) {
    type = document.getElementById('TYP').value;
    xcf = document.getElementById('XCF').value;
    acc = document.getElementById('ACC').value;

    // Build dictionary element_symbol -> metadata.
    var meta = {};
    for (const elm of ALL_ELEMENTS) {
        try {
            meta[elm] = FILES[type][xcf][acc][elm]["meta"];
        }
        catch (error) {
            console.log("Cannot find element:", elm, "with type:", type, "xcf:", xcf, "acc:", acc, "\n", error);
            meta[elm] = {};
        }
    }
    //console.log("meta:", meta);
   
    //set_info({}, 0);
    //var file = type + '_' + xcf + '_' + acc + '.json';
    //loadJSON(file, function(text) {
    //    var info = JSON.parse(text);
    //    set_info(info, animate);
    //});
}


function set_X(elm, color, n){
    // Update params shown in the X_n box.
    if (ALL_ELEMENTS.indexOf(elm) >= 0){
        document.getElementById('N').innerHTML = n;
        var x = document.getElementById('X_n');
        x.style.backgroundColor = color;
        var x = document.getElementById('X_el');
        x.innerHTML = elm;
        for (key in ALL_KEYS){
            var id_key = 'X_' + ALL_KEYS[key];
            var id_key_in = elm + '_' + ALL_KEYS[key];
            // Get the params from the pseudo associated to this element and copy to the X box.
            var x = document.getElementById(id_key_in);
            var y = document.getElementById(id_key);
            var val = x.innerHTML;
            y.innerHTML = val;
        }
    }
}


function reset_X(){
    // Reset the params shown in the X_n box.
    document.getElementById('X_el').innerHTML = 'Mean'
    document.getElementById('N').innerHTML = '';
    document.getElementById('X_n').style.backgroundColor = "#ffffff";
    for (key in ALL_KEYS){
        document.getElementById("X_" + ALL_KEYS[key]).innerHTML = document.getElementById("av_" + ALL_KEYS[key]).innerHTML
    }
}


function set_av(val){
    document.getElementById('av_el').innerHTML = 'Mean'
    for (key in ALL_KEYS){
        document.getElementById("av_" + ALL_KEYS[key]).innerHTML = val[key]
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
          intro: 'Here you select the type of pseudopotential. SR stands for scalar relativistic, FR for fully relativistic (including SOC). '+
                 'The options for xc, accuracy and format are adjusted based on your choice.'
        },
        {
          element: '#XCF',
          intro:  "In this selector you can pick one of the available exchange-correlation functionals. " +
                  "Have a look at the F.A.Q. if your fuctional of choice is not there."
        },
        {
          element: '#ACC',
          intro:  "In this selector you can select one of the available accuracy levels. " +
                  "Have a look at the F.A.Q. for a detailed description."
        },
        {
          element: '#FMT',
          intro:  "In this selector you can pick the format of the pseudopotential file. " +
                  "PSP8 for ABINIT, UPF2 for Quantum Espresso, PSML1.1 is supported by Siesta. " +
                  "When you select HTML, clicking the elements will display a full report of all the tests we performed. " +
                  "Finally djrepo will give you all the numerical results of the tests in json format."
        },
        {
          element: '#X_n',
          intro:  "As long as you don't hover one of the elements, this box shows the average values for the table you selected. " +
                  "Once you hover the elements, it shows the values for that element. "
        },
        {
          element: "#X_hl",
          intro:  "This is the low cutoff energy hint (Ha). Good for a quick calculation or as a starting point for your convergence studies."
        },
        {
          element: "#X_hn",
          intro:  "This is the normal cutoff energy hint (Ha). A good guess for high-throughput calculations."
        },
        {
          element: "#X_hh",
          intro:  "This is the high cutoff energy hint (Ha), beyond this value you should not observe significant changes in the results anymore."
        },
        {
          element: "#X_nv",
          intro:  "The number of valence shells."
        },
        {
          element: "#X_d",
          intro:  "The results of the delta gauge test (meV). This is the integral between the equation of state calculated using the pseudo potential and a reference all electron equation of state."
        },
        {
          element: "#X_dp",
          intro:  "The normalized delta gauge."
        },
        {
          element: "#X_gb",
          intro:  "The gbrv fcc and bcc average (%). This is the relative error in the lattice parameter with respect to reference all electrons results."
        },
        {
          element: "#silicon",
          intro:  "You can now click all the elements in the table to download or view the selected file for a single element. If the box turns green the file is available, if it turns red we are still working on it."
        },
        {
          element: ".download_button",
          intro:  "Alternatively, with the download button you can get a tar of the full table, always one pseudopotential per element."
        },
        {
          element: "#papers",
          intro:  "A list of papers using PseudoDojo pseudopotentials. Did you use them? Send us the DOI and we'll add yours as well."
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
  document.getElementById("ACC").length = 0;
  document.getElementById("XCF").length = 0;
  document.getElementById("FMT").length = 0;
  document.getElementById('warning_box').innerHTML = "";
  //set_warning(' this version is outdated')

  switch (type)
  {
    case "jth-sr-v1.1" :
      document.getElementById("ACC").options[0] = new Option("standard", "standard");
      document.getElementById("ACC").options[1] = new Option("stringent", "stringent");
      document.getElementById("XCF").options[1] = new Option("LDA", "LDA");
      document.getElementById("XCF").options[0] = new Option("PBE", "PBE");
      document.getElementById("FMT").options[0] = new Option("xml", "xml");
      break;

    case "nc-sr-v0.4" :
      document.getElementById("ACC").options[0] = new Option("standard", "standard");
      document.getElementById("ACC").options[1] = new Option("stringent", "stringent");
      document.getElementById("XCF").options[2] = new Option("LDA", "LDA");
      document.getElementById("XCF").options[0] = new Option("PBE", "PBE");
      document.getElementById("XCF").options[1] = new Option("PBEsol", "PBEsol");
      document.getElementById("FMT").options[0] = new Option("psp8", "psp8");
      document.getElementById("FMT").options[1] = new Option("upf", "upf");
      document.getElementById("FMT").options[2] = new Option("psml", "psml");
      document.getElementById("FMT").options[3] = new Option("html", "html");
      document.getElementById("FMT").options[4] = new Option("djrepo", "djrepo");
      break;

    case "nc-fr-v0.4" :
      document.getElementById("ACC").options[0] = new Option("standard", "standard");
      document.getElementById("ACC").options[1] = new Option("stringent", "stringent");
      document.getElementById("XCF").options[0] = new Option("PBE", "PBE");
      document.getElementById("XCF").options[1] = new Option("PBEsol", "PBEsol");
      document.getElementById("FMT").options[0] = new Option("psp8", "psp8");
      document.getElementById("FMT").options[1] = new Option("upf", "upf");
      document.getElementById("FMT").options[2] = new Option("psml", "psml");
      document.getElementById("FMT").options[3] = new Option("html", "html");
      document.getElementById("FMT").options[4] = new Option("djrepo", "djrepo");
      break;

    case "nc-sr-04-3plus" :
      set_warning(" this table contains Lanthanide potentials for use in the 3+ configuration only. <b>They all have the f-electrons frozen in the core.</b> The hints are based on the convergence of the nitride lattice parameter, see the report under format:html for details.");
      document.getElementById("ACC").options[0] = new Option("standard", "standard");
      document.getElementById("XCF").options[0] = new Option("PBE", "PBE");
      document.getElementById("FMT").options[0] = new Option("psp8", "psp8");
      document.getElementById("FMT").options[1] = new Option("upf", "upf");
      document.getElementById("FMT").options[2] = new Option("psml", "psml");
      document.getElementById("FMT").options[3] = new Option("html", "html");
      document.getElementById("FMT").options[4] = new Option("djrepo", "djrepo");
      break;

    //case "core" :
    //  // TODO or perhaps add new format and handle file download.
    //  document.getElementById("ACC").options[0] = new Option("", "standard");
    //  document.getElementById("XCF").options[0] = new Option("PBE","pbe");
    //  document.getElementById("FMT").options[2] = new Option("FC","fc");
    //  break;
    default:
      throw 'Invalid type:' + type;
  }

}


function chaos() {
    localStorage.setItem('animate', 1)
    $('.plugin').removeClass('anim');
    $('.plugin').removeClass('chaos');
    setTimeout("$('.plugin').addClass('chaos')",10)
    var plugins = document.querySelectorAll(".plugin");
    for (var i = 0; i < 118; i++) {
      var plugin = plugins[i];
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
  var color = colors[res[1]];
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
    console.log("Error in _get_pseudo_selection:", error);
    var url = null;
  }
  if (DEBUG) console.log("in _get_pseudo_selection with url:", url)

  var select = {elm: elm, url: url, type: type, xcf: xcf, acc: acc, fmt: fmt, color: color, n: n};
  console.log("select:", select);
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


function build_ui(){
  var params = decodeURIComponent(window.location.search.slice(1))
              .split('&')
              .reduce(function _reduce (/*Object*/ a, /*String*/ b) {
                        b = b.split('=');
                        a[b[0]] = b[1];
                        return a;
              }, {});

  colors = {
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

  jQuery(document).ready(function($) {
    $(".plugin:nth-of-type(2)").addClass('nth-of-type-float');
    $(".plugin:nth-of-type(5), .plugin:nth-of-type(13)").addClass('nth-of-type-margin');
    $(".plugin:nth-of-type(1), .plugin:nth-of-type(3), .plugin:nth-of-type(11), .plugin:nth-of-type(19), .plugin:nth-of-type(37), .plugin:nth-of-type(55)").addClass('nth-of-type-clear');

    // .hover(handlerIn, handlerOut)
    $('.plugin').hover(function(){
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
      var str = $(this).attr("class");
      var res = str.split(" ");
      var bgori = colors[res[1]];
      var mythis = $(this);
      mythis.css("background-color", bgori);
      mythis.css("color", "#4B4B4D");
    });

    $('.plugin').on('click', function() {
      // get the element selected by the user.
      var mythis = $(this);
      var sel = _get_pseudo_selection(mythis);

      if (sel.fmt === 'html'){
        //var url = trunk.concat(typ,"_",xcf,"_",acc,"/",elm,".",fmt);
        $.get(sel.url)
          .done(function() {
            // exists code
            window.location.href = sel.url;
          }).fail(function() {
            // not exists code
          })}
      else {
        //var url = trunk.concat(typ,"_",xcf,"_",acc,"/",elm,".",fmt,'.gz');
        $.get(sel.url)
          .done(function() {
            // exists code
            window.downloadFile(sel.url);
          }).fail(function() {
            // not exists code
          })}
    });

    // .hover( handlerIn, handlerOut)
    $('.download_button').hover(
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

      $.get(sel.url)
        .done(function() {
            // exists code
          window.location.href = sel.url;
        }).fail(function() {
            // not exists code
        })
    });

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
  var typ = getParameterByName('typ');
  if (typ === null){
    typ = document.getElementById('TYP').value;
  }
  var options = document.getElementById('TYP').options;
  for (i in options){
    if (options[i].value == typ){
         options[i].selected = true;
    }
  }

  dynamic_dropdown(typ);

  // if XCF ACC and FMT have been changed previously set them back to those selections 
  if (localStorage.getItem('selectedXCF')) {
    var options = document.getElementById('XCF').options
    for (i in options){
       if (options[i].value == localStorage.getItem('selectedXCF')){
         options[i].selected = true;
       }
    }
  }

  if (localStorage.getItem('selectedACC')) {
    var options = document.getElementById('ACC').options
    for (i in options){
       if (options[i].value == localStorage.getItem('selectedACC')){
         options[i].selected = true;
       }
    }
  }

  if (localStorage.getItem('selectedFMT')) {
    var options = document.getElementById('FMT').options
    for (i in options){
       if (options[i].value == localStorage.getItem('selectedFMT')){
         options[i].selected = true;
       }
    }
  }
}
