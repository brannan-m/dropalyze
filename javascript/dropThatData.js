//console.log("are you working?")

// Variables for buttons and such
var dropzone = document.getElementById('dropzone');
var sampleDataButton = document.getElementById('sampleDataButton');
var buildGraphsButton = document.getElementById('buildGraphsButton');
//Variable for the csv file
var csv;

// Variables for headers, conditions, and sample size
var sampleSize = 0;
var columnHeaders = [];
var numberColumnHeaders;
var conditions = [];
var numberConditions;

//Arrays for the data
var unorganizedData = [[]];
var organizedData = [];

//Data to be used graphs
var standDevOfData = [];
var meansOfData = [];
var confIntervalOfData = [];
var cellSizesOfData = [];

//Graph labels
var labelForTitle = "Label for Title";
var labelYAxis = "Average Score";
var labelXAxis = "";

//Formatting
//Different color schemes for bar graphs
// Not being used bc JS keeps changing this varible to what colorScale is for no damn reason
var colorSillyScaleOrig = ["#f1595f","#79c36a","#599ad3","#f9a65a","#9e66ab","#cd7058","#d77fb3","#f1595f","#79c36a","#599ad3","#f9a65a","#9e66ab","#cd7058","#d77fb3"];
var colorScale = ["#f1595f","#79c36a","#599ad3","#f9a65a","#9e66ab","#cd7058","#d77fb3","#f1595f","#79c36a","#599ad3","#f9a65a","#9e66ab","#cd7058","#d77fb3"];
var colorScaleSummary = [];

//Dimensions
var svgHeight = 400;
var svgWidth = 500;
var legendWidthSpacing = 200;
var summaryGraphWidth;

var padding = {
		    left: 60, right: 0,
		    top: 40, bottom: 20,
			label: 3
		};

//Misc. Settings
var dataLoaded = false;
var graphsAlreadyPresent = false;

// Graph and Stats Settings
var alpha;
var alphaOfGraphs;
var dataType;
var dataTypeOfGraphs;
var decimalPlaces = 1;
var yMax;
var droppedStatus = false;

loadFromLocalStorage();

// Loading from localStorage
function loadFromLocalStorage() {
	console.log("Loading from LocalStorage");
	if (localStorage.getItem("dataType") === null) {
	  // Do nothing if no localStorage has been set
	} else {
		document.getElementById('decimalPlacesDropdown').value = localStorage.decimalPlaces;
		document.getElementById('yMax_tf').value = localStorage.yMax;
		document.getElementById("alphaDropdown").value = localStorage.alpha;
		document.getElementById("dataTypeDropdown").value = localStorage.dataType;
		var colorScaleString = localStorage.colorScale;
		colorScale = stringToArray(colorScaleString);
	}
}

//Saves the options in local storage
function saveToLocalStorage() {
	console.log("Saving to LocalStorage");
	if (typeof(Storage) !== "undefined") {
		// Yes support of localStorage
		localStorage.setItem('dataType',dataType);
		localStorage.setItem('decimalPlaces',decimalPlaces);
		localStorage.setItem('yMax',yMax);
		localStorage.setItem('alpha',alpha);
		localStorage.setItem('colorScale',arrayToString(colorScale));
	} else {
		// No support of localStorage
		console.log("Sorry. Your browser does not support localStorage and cannot save your settings.");
	}
}

// Converts array to string (for localStorage)
function arrayToString(theArray) {
	var theString;
	for (var arrayToString_i = 0; arrayToString_i < theArray.length; arrayToString_i++) {
		if(arrayToString_i == 0){
			theString = theArray[arrayToString_i];
		} else {
			theString += ",";
			theString += theArray[arrayToString_i];
		}
	}
	return theString;
}

// Converts string to array (for localStorage)
function stringToArray(theString) {
	var theArray = theString.split(",");
	return theArray;
}

// Buttons and Drop Zones
dropzone.ondrop = function(e) {
	//Updates Y-axis only if data file dropped
	labelYAxis = document.getElementById('yAxisLabel_tf').value;
	
	e.preventDefault();
	this.className = 'dropzone';
	//console.log(e);
	
	//Registers the files as an array
	var files = e.dataTransfer.files;
	//console.log(files);
	
	//Record number of files being uploaded
	var numberOfFilesDropped = files.length;
	
	//Only trigger parseFiles function if at least one file uploaded
	if (numberOfFilesDropped > 0 && dataLoaded == false) {
		parseFilesDropped(files);
		droppedStatus = true;
		dataLoaded = true;
	}
}
//Changes CSS styles when on dragover of dropzone
dropzone.ondragover = function() {
	this.className = 'dropzone dragover';
	return false;
}

// Changes CSS styles back when ondragleave
dropzone.ondragleave = function() {
	this.className = 'dropzone';
	return false;
}

sampleDataButton.onclick = function() {
	if (dataLoaded == false) {
		exampleData();
		dataLoaded = true;
	}
}

buildGraphsButton.onclick = function() {
	if (dataLoaded == true) {
		updateColor();
		checkOptions();
		checkForGraphs();
	}
}

restart.onclick = function() {
	location.reload();
}

//Checks whats in the options area
function checkOptions() {
	console.log("Grabbing the input from the options area")
	//Grabs the data from the options area
	decimalPlaces = document.getElementById('decimalPlacesDropdown').value;
	yMax = document.getElementById('yMax_tf').value;
	alpha = document.getElementById("alphaDropdown").value;
	dataType = document.getElementById("dataTypeDropdown").value;
	if (droppedStatus == true) {labelYAxis = document.getElementById('yAxisLabel_tf').value};
	
	saveToLocalStorage();
	
	
}

function exampleData() {
	
	/*
	unorganizedData = [
		["Design","Task 1", "Task 2", "Task 3", "Task 4", "Task 5", "Task 6"],
		["Prototype A","38", "26", "64", "54", "51", "63"],
		["Prototype A","57", "35", "54", "42", "65", "45"],
		["Prototype A","64", "16", "64", "52", "14", "31"],
		["Prototype B","96", "85", "35", "51", "35", "33"],
		["Prototype B","94", "76", "84", "64", "54", "55"],
		["Prototype B","87", "94", "55", "64", "48", "63"],
		["Prototype B","54", "84", "84", "64", "45", "65"],
		["Prototype B","83", "86", "46", "68", "73", "64"],
		["Prototype X","56", "35"],
		["Prototype X","86", "45"]
	];
	*/
	
	
	/*
	unorganizedData = [
		["Design","Task 1", "Task 2"],
		["A","38", "26"],
		["A","57", "35"],
		["A","64", "16"],
		["Prototype B","96", "85"],
		["Prototype B","94", "76"],
		["Prototype B","87", "94"],
		["Prototype B","54", "84"],
		["Prototype B","83", "86"],
		["A","", "35"],
		["A","86", "45"]
	];
	
	*/
	
	
	unorganizedData = [
		["Design","Task 1", "Task 2", "Task 3"],
		["Prototype X","38", "26", "85"],
		["Prototype X","57", "35", "40"],
		["Prototype A","64", "16", "57"],
		["Prototype B","96", "85", "54"],
		["Prototype B","94", "76", "65"],
		["Prototype B","87", "94", "42"],
		["Prototype B","54", "84", "35"],
		["Prototype B","83", "86", "15"],
		["Prototype A","", "35", "75"],
		["Prototype A","86", "45", "54"],
		["Prototype A","38", "26", "85"],
		["Prototype A","57", "35", "45"],
		["Prototype A","64", "16", "57"],
		["Prototype B","96", "85", "54"],
		["Prototype B","94", "76", "65"],
		["Prototype B","87", "94", "42"],
		["Prototype B","54", "84", "35"],
		["Prototype B","83", "86", "15"],
		["Prototype A","", "35", "75"],
		["Prototype A","86", "45", "54"],
		["Prototype A","38", "26", "85"],
		["Prototype A","57", "35", "45"],
		["Prototype A","64", "16", "57"],
		["Prototype B","96", "85", "54"],
		["Prototype B","94", "76", "65"],
		["Prototype B","87", "94", "42"],
		["Prototype B","54", "84", "35"],
		["Prototype B","83", "86", "15"],
		["Prototype A","", "35", "75"],
		["Prototype A","86", "45", "54"],
		["Prototype A","38", "26", "85"],
		["Prototype A","57", "35", "45"],
		["Prototype A","64", "16", "57"],
		["Prototype B","96", "85", "54"],
		["Prototype B","94", "76", "65"],
		["Prototype B","87", "94", "42"],
		["Prototype B","54", "84", "35"],
		["Prototype B","83", "86", "15"],
		["Prototype A","", "35", "75"],
		["Prototype A","86", "45", "54"],
		["Prototype A","38", "26", "85"],
		["Prototype A","57", "35", "45"],
		["Prototype A","64", "16", "57"],
		["Prototype B","96", "85", "54"],
		["Prototype B","94", "76", "65"],
		["Prototype B","87", "94", "42"],
		["Prototype B","54", "84", "35"],
		["Prototype B","83", "86", "15"],
		["Prototype A","23", "35", "75"],
		["Prototype A","86", "45", "54"],
		["Prototype C","54", "84", "35"],
		["Prototype C","83", "86", "15"],
		["Prototype C","42", "35", "75"],
		["Prototype C","86", "45", "54"],
		["Prototype C","38", "26", "85"],
		["Prototype C","57", "35", "45"],
		["Prototype C","64", "16", "57"],
		["Prototype C","96", "85", "54"],
		["Prototype C","94", "76", "65"],
		["Prototype C","87", "94", "42"],
		["Prototype C","54", "84", "35"],
		["Prototype C","83", "86", "15"],
		["Prototype C","43", "35", "75"],
		["Prototype C","86", "45", "54"],
		["Prototype k","38", "26", "85"],
		["Prototype k","38", "26", "85"],
		["Prototype Z","57", "35", "40"]
		
	];
	
	
	dataOrganization();
}


function parseFilesDropped(rawFiles) {
	
	dataLoaded = true;
	console.log("The rawFile is: " + rawFiles);
	
	//A loop will need to replace the next line if multiple files are handled
	
	//Register the first file uploaded
	var file = rawFiles[0];
	
	console.log("The name of the file is: " + file.name + " and it is " + file.size + " bytes.");
	
	
	//Open FileReader to read content
	var reader = new FileReader();
	
	// begin the read operation
	reader.readAsText(file, "UTF-8");
	
	// init the reader event handlers
	reader.onload = handleReaderLoad;
	
}

function handleReaderLoad(event, file) {
	//Set csv variable equal to file contents
	csv = event.target.result;
	CSVToArray(csv);
	
}
// Thanks to Ben Nadel (http://www.bennadel.com/) Parsing CSV Strings With Javascript 
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
	
	//Future version: modify CVSToArray to be able to handle 3+ columns
	
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ",");
	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
		(
			// Delimiters.
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
			// Standard fields.
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
		);
	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [[]];
	// Create an array to hold our individual pattern
	// matching groups.
	var arrMatches = null;
	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	while (arrMatches = objPattern.exec( strData )){
		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];
		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (
			strMatchedDelimiter.length &&
			(strMatchedDelimiter != strDelimiter)
			){
			// Since we have reached a new row of data,
			// add an empty row to our data array.
			
			//arrData.push( [] );
			unorganizedData.push( [] );
		}
		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[ 2 ]){
			// We found a quoted value. When we capture
			// this value, unescape any double quotes.
			var strMatchedValue = arrMatches[ 2 ].replace(
				new RegExp( "\"\"", "g" ),
				"\""
				);
		} else {
			// We found a non-quoted value.
			var strMatchedValue = arrMatches[ 3 ];
		}
		// Now that we have our value string, let's add
		// it to the data array.
		//arrData[ arrData.length - 1 ].push( strMatchedValue );
		unorganizedData[ unorganizedData.length - 1 ].push( strMatchedValue );
		
	}
	// Return the parsed data.
	//return( arrData );
	//console.log("unorganizedData = " + unorganizedData);
	dataOrganization();
}


function dataOrganization() {
	
	//Starts the data analysis over
	sampleSize = 0;
	columnHeaders = [];
	numberColumnHeaders = [];
	conditions = [];
	numberConditions;

	//Arrays for the data
	organizedData = [];

	//Data to be used graphs
	standDevOfData = [];
	meansOfData = [];
	confIntervalOfData = [];
	
	//Grabs the data options
	/*
	alpha = document.getElementById("alphaDropdown").value;
	dataType = document.getElementById("dataTypeDropdown").value;
	*/
	checkOptions();
	
	// Updates buttons and dropzone based on data being loaded
	sampleDataButton.classList.remove("active");
	sampleDataButton.classList.add("inactive");
	dropzone.innerHTML = "<br/>Data Loaded";
	
	buildGraphsButton.classList.remove("inactive");
	buildGraphsButton.classList.add("active");
	
	/* Future version: include check of data: 
	dichotomous, continuous (subset of rating scale)  */
	
	// Goes through the unorganizedData and captures the values
	// of the first column (conditions) and pushes to an array
	var conditionsColumn = [];
	for(var q = 1; q < unorganizedData.length; q++ ) {
		conditionsColumn.push(unorganizedData[q][0]);
	}
	
	conditions = findUnique(conditionsColumn);
	
	
	//Determines how many columns there are and the labels
	columnHeaders = unorganizedData[0];
	numberColumnHeaders = columnHeaders.length;
	//console.log("columnHeaders = " + columnHeaders);
	//console.log("numberColumnHeaders = " + numberColumnHeaders);
	
	
	//Separates data into multidimensional array 
	var intermediateTempArray = []
	for(var i = 0; i < conditions.length; i++) {
		intermediateTempArray = [];
		for(var j = 1; j < unorganizedData.length; j++) {
			if(unorganizedData[j][0] === conditions[i]) {
				intermediateTempArray.push(unorganizedData[j]);
			}
		}
		//Original, not pushing correctly
		organizedData.push(intermediateTempArray);
		
		//Updated
		//organizedData[i].push(intermediateTempArray);
	}
	
	//console.log("organizedData = " + organizedData);
	
	//Determines the sample size by adding up the number of 
	//console.log("conditions.length = " + conditions.length);
	for (var l = 0; l < conditions.length; l++) {
		sampleSize += organizedData[l].length;
	}
	//console.log("Sample size = " + sampleSize);
	
	
	//Future
	basicStats();
}

// Finds unique items for determining the column headers
function findUnique(arrayInQuestion) {
	var uni_n = {}, uni_r = [];	
	for (var uni_i = 0; uni_i < arrayInQuestion.length; uni_i++) {
		if(!uni_n[arrayInQuestion[uni_i]]) {
			uni_n[arrayInQuestion[uni_i]] = true;
			uni_r.push(arrayInQuestion[uni_i]);
		}
	}
	//console.log("Conditions = " + uni_r);
	return uni_r;
}


function basicStats() {
	
	if(graphsAlreadyPresent == true) {
		standDevOfData = [];
		meansOfData = [];
		confIntervalOfData = [];
	}
	
	// organizedData[condition][participant in condition][Measure or task]
	
	// Calculates cell sizes
	cellSizesOfData = [];
	var cellSizesOfColumn = [];
	var cellSizeOfCondition = 0;
	//For each condition
	for (var l = 0; l < organizedData.length; l++) {
		cellSizesOfColumn = [];
		//For each measure or task except for the first one (condition identifiers)
		for (var m = 1; m < numberColumnHeaders; m++) {
			
			// Set back to zero for each condition
			cellSizeOfCondition = 0;
			
			// For each participant in condition
			for (var n = 0; n < organizedData[l].length; n++) {
				if (!isNaN(parseInt(organizedData[l][n][m]))) {
					cellSizeOfCondition++;
				}
			}
			// Pushes task,condition cell size
			cellSizesOfColumn.push(cellSizeOfCondition);
			
		}
		cellSizesOfData.push(cellSizesOfColumn);
		
	}
	console.log("cellSizesOfData = " + cellSizesOfData);
	//console.log("cellSizesOfData[0] = " + cellSizesOfData[0]);
	//console.log("cellSizesOfData[0][0] = " + cellSizesOfData[0][0]);
	
	
	//Calculate means
	var meansOfColumn = [];
	var meanOfCondition = 0;
	//For each condition
	for (var q = 0; q < organizedData.length; q++) {
		meansOfColumn = [];
		//For each measure or task except for the first one (condition identifiers)
		for (var r = 1; r < numberColumnHeaders; r++) {
			
			// Set back to zero for each condition
			meanOfCondition = 0;
			
			// For each participant in condition
			for (var s = 0; s < organizedData[q].length; s++) {
				if (!isNaN(parseInt(organizedData[q][s][r]))) {
					meanOfCondition += parseInt(organizedData[q][s][r]);
				}
			}
			meanOfCondition = meanOfCondition / parseInt(cellSizesOfData[q][r-1]);
			// Pushes task,condition mean
			meansOfColumn.push(meanOfCondition);
			
		}
		meansOfData.push(meansOfColumn);
		
	}
	
	//console.log("meansOfData = " + meansOfData.length);
	//console.log("meansOfData = " + meansOfData);
	//console.log("meansOfData[0] = " + meansOfData[0]);
	//console.log("meansOfData[0][0] = " + meansOfData[0][0]);
	
		
	
	// Calculate SDs
	//var standDevOfData = []; // comment out to make global
	var standDevOfColumn = [];
	var standDevOfCondition = 0;
	//For each condition
	for (var i = 0; i < organizedData.length; i++) {
		standDevOfColumn = [];
		//For each measure or task except for the first one (condition identifiers)
		for (var j = 1; j < numberColumnHeaders; j++) {
			
			// Set back to zero for each condition
			standDevOfCondition = 0;
			
			// For each participant in condition
			for (var k = 0; k < organizedData[i].length; k++) {
				if (!isNaN(parseInt(organizedData[i][k][j]))) {
					standDevOfCondition += Math.pow((parseFloat(organizedData[i][k][j])-(parseFloat(meansOfData[i][j-1]))),2);
				}
			}
			if(parseInt(cellSizesOfData[i][j-1])<2) {
				standDevOfCondition = 1;
			} else {
				standDevOfCondition = standDevOfCondition / (parseInt(cellSizesOfData[i][j-1])-1);
				standDevOfCondition = Math.sqrt(standDevOfCondition);
			}
			
			//console.log("standDevOfCondition = " + standDevOfCondition);
			// Pushes task,condition standard deviation
			standDevOfColumn.push(standDevOfCondition);
			
		}
		standDevOfData.push(standDevOfColumn);
		
	}
	//console.log("standDevOfData = " + standDevOfData);
	//console.log("standDevOfData[0] = " + standDevOfData[0]);
	//console.log("standDevOfData[0][0] = " + standDevOfData[0][0]);
	
	// Check for binary data
	
	
	// Calculate CIs
	var confIntervalOfColumn = [];
	var confIntervalOfCondition = 0;
	
	// Saves the alpha for this build for checkLevelOfRebuild()
	alphaOfGraphs = alpha;
	
	//For each condition
	for (var ci_i = 0; ci_i < meansOfData.length; ci_i++) {
		confIntervalOfColumn = [];
		//For each measure or task except for the first one (condition identifiers)
		for (var ci_j = 0; ci_j < meansOfData[ci_i].length; ci_j++) {
			// Set back to zero for each condition
			confIntervalOfCondition = 0;
			
			if (!isNaN(parseInt(standDevOfData[ci_i][ci_j]))) {
				
				// Sets the zScore: old way when doing Z distribution
				/*
				if (alpha == .05) {
					var zScore = 1.96;
					//console.log("Alpha = " + alpha + "; " + "zScore = " + zScore);
				} else if (alpha == .1) {
					var zScore = 1.65;
					//console.log("Alpha = " + alpha + "; " + "zScore = " + zScore);
				};
				*/
				
				//calculates CI
				//confIntervalOfCondition = zScore*((parseFloat(standDevOfData[ci_i][ci_j]))/ (Math.sqrt(parseInt(cellSizesOfData[ci_i][ci_j]))));
				// Confidence Interval = tValue * SD / sqrt(n)
				
				confIntervalOfCondition = calcTValue(alpha, cellSizesOfData[ci_i][ci_j]-1)*((parseFloat(standDevOfData[ci_i][ci_j]))/ (Math.sqrt(parseInt(cellSizesOfData[ci_i][ci_j]))));
				
				// Pushes task,condition standard deviation
				//console.log("Alpha = " + alpha + "; zScore = " + zScore + "; conf. interval = " + confIntervalOfCondition);
				confIntervalOfColumn.push(confIntervalOfCondition);
			}
		}
		confIntervalOfData.push(confIntervalOfColumn);
	}
	//console.log("confIntervalOfData = " + confIntervalOfData);
	//console.log("confIntervalOfData[0] = " + confIntervalOfData[0]);
	//console.log("confIntervalOfData[0][0] = " + confIntervalOfData[0][0]);
	
	/*
	// Calculate degrees of freedom for each comparison
	var tTestDFAllComparisons = [];
	var tTestDFColumn = [];
	var tTestDF = 0;
	//For each condition
	for (var tdf_i = 0; tdf_i < cellSizesOfData.length; tdf_i++) {
		for (var tdf_j = 0; tdf_j < cellSizesOfData[tdf_i].length; tdf_j++) {
		}
	}
	*/
	//
	
	logStats();
	
	if(graphsAlreadyPresent == true) {
		graphsAlreadyPresent = false;
		makeGraphs();
	}
	addColorPickerButtons();
	addColorPickerResetButton();

} // Basic Stats 

//Call all the stats 
function logStats() {
	/*
	var digitPlaces = 100;
	for (var log_i = 0; log_i < cellSizesOfData[0].length; log_i++) {
		for (var log_j = 0; log_j < cellSizesOfData.length; log_j++) {
			console.log("Task " + columnHeaders[log_i + 1] + "; Condition " + conditions[log_j] + "; mean " + (Math.round(meansOfData[log_j][log_i]*digitPlaces)/digitPlaces) + "; SD " + (Math.round(standDevOfData[log_j][log_i]*digitPlaces)/digitPlaces) + "; CI " + (Math.round(confIntervalOfData[log_j][log_i]*digitPlaces)/digitPlaces) + "; cell size " + cellSizesOfData[log_j][log_i]);
		}
	}
	*/
}

//Determines _ for confidence interval
function calcTValue(alphaValue, df) {
	//console.log("Alpha = " + alphaValue + "; df = " + df);
	var tTable=document.getElementById("tDistribution");
	var alphaColumn;
	
	if(alphaValue == .1) {
		alphaColumn = 1;
	} else if (alphaValue == .05) {
		alphaColumn = 2;
	} else if (alphaValue == .01) {
		alphaColumn = 3;
	}
	if(df>=1000) {
		// future ??????????????????????????????????????????????????????????????????????????????????????
	} else if (df>=1000) {
		return tTable.rows[36].cells[alphaColumn].innerHTML;
	} else if (df>=100) {
		return tTable.rows[35].cells[alphaColumn].innerHTML;
	} else if (df>=80) {
		return tTable.rows[34].cells[alphaColumn].innerHTML;
	} else if (df>=60) {
		return tTable.rows[33].cells[alphaColumn].innerHTML;
	} else if (df>=40) {
		return tTable.rows[32].cells[alphaColumn].innerHTML;
	} else if (df>=30) {
		return tTable.rows[31].cells[alphaColumn].innerHTML;
	} else {
		console.log("df = " + df + "; tValue = " + tTable.rows[df+1].cells[alphaColumn].innerHTML);
		
		return tTable.rows[df+1].cells[alphaColumn].innerHTML;
	}
	
}

/*
  ____                _____      _                
 |  _ \              / ____|    | |               
 | |_) | __ _ _ __  | |     ___ | | ___  _ __ ___ 
 |  _ < / _` | '__| | |    / _ \| |/ _ \| '__/ __|
 | |_) | (_| | |    | |___| (_) | | (_) | |  \__ \
 |____/ \__,_|_|     \_____\___/|_|\___/|_|  |___/


*/
function addColorPickerButtons() {
	for(var colorPicker_i = 0; colorPicker_i < conditions.length; colorPicker_i++) {
		var colorPickerInput = document.createElement('BUTTON');
		colorPickerInput.id = "colorPickerButton" + colorPicker_i;
		if (colorPickerInput.classList) {
			colorPickerInput.classList.add("colorPickerClass" + colorPicker_i);
		} else {
			colorPickerInput.className += ' ' + "colorPickerClass";
		}
		var picker = new jscolor(colorPickerInput);
		//picker.id = "colorPickerButton" + colorPicker_i;
		picker.buttonHeight = 35;
		picker.fromString(colorScale[colorPicker_i]);
		picker.closable = true;
		colorPickerInput.innerHTML = conditions[colorPicker_i];
		document.getElementById('colorPickerContainer').appendChild(colorPickerInput);
		
		colorPickerInput.addEventListener('click', function(){updateColor();}, false);
	}
}

function addColorPickerResetButton() {
	var colorPickerReset = document.createElement('BUTTON');
	colorPickerReset.id = "colorPickerReset";
	if (colorPickerReset.classList) {
		colorPickerReset.classList.add("colorPickerResetClass");
	} else {
		colorPickerReset.className += ' ' + "colorPickerResetClass";
	}
	colorPickerReset.innerHTML = "Reset Colors";
	document.getElementById('colorPickerResetContainer').appendChild(colorPickerReset);
	colorPickerReset.addEventListener('click', function(){resetColorPickButtons();}, false);
}


function removeColorPickerButtons() {
	console.log("Removing the buttons!");
	//console.log("colorScale pre = " + colorScale);
	for(var colorPickerRemove_i = 0; colorPickerRemove_i < conditions.length; colorPickerRemove_i++) {
		//console.log("Removing buttons: " + colorPickerRemove_i);
		var removeButton = document.getElementById("colorPickerButton" + colorPickerRemove_i);
		removeButton.parentNode.removeChild(removeButton);
	}
	//console.log("colorScale post = " + colorScale);
}

function resetColorPickButtons() {
	//var tempColorScale = colorSillyScaleOrig;
	console.log("colorSillyScaleOrig Before Setting = " + colorSillyScaleOrig);
	//colorScale = ["#f1595f","#79c36a","#599ad3","#f9a65a","#9e66ab","#cd7058","#d77fb3","#f1595f","#79c36a","#599ad3","#f9a65a","#9e66ab","#cd7058","#d77fb3"];
	colorScale = colorSillyScaleOrig;
	console.log("colorSillyScaleOrig After Setting = " + colorSillyScaleOrig);
	//console.log("colorSillyScaleOrig prepre = " + colorSillyScaleOrig);
	removeColorPickerButtons();
	addColorPickerButtons();
}

// Runs through all values of colorScale looking for updated color values
function updateColor() {
	console.log("colorSillyScaleOrig Before updateColor = " + colorSillyScaleOrig);
	for(var updateColorPicker_i = 0; updateColorPicker_i < conditions.length; updateColorPicker_i++) {
		//colorScale[updateColorPicker_i] = rgb2hex(document.getElementById('colorPickerButton' + updateColorPicker_i).style.backgroundColor);
		colorScale[updateColorPicker_i] = "#79c36a";
	}
	console.log("colorSillyScaleOrig After updateColor = " + colorSillyScaleOrig);
}
// Converts rgb to hex
function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}


/*
 ____   _____ 
|  _ \ |___ / 
| | | |  |_ \ 
| |_| |  __) |
|____/ |____/ 

*/

// Original example of working D3
/* 
var chart = d3.select('.chart');
var bar = chart.append('g');
bar.append('rect')
	.attr('width', 20)
	.attr('height', 50);




// 
var employees = [
  {dept: 'A', age : 22},
  {dept: 'B', age : 26},
  {dept: 'C', age : 35},
  {dept: 'D', age : 30},
  {dept: 'E', age : 27}
];

var svgHeight = 400;
var svgWidth = 400;
var maxAge = 65; // You can also compute this from the data
var barSpacing = 1; // The amount of space you want to keep between the bars
var padding = {
    left: 30, right: 0,
    top: 20, bottom: 20
};

function animateBarsUp() {
  var maxWidth = svgWidth - padding.left - padding.right;
  var maxHeight = svgHeight - padding.top - padding.bottom;

  // Define your conversion functions
  var convert = {    
    x: d3.scale.ordinal(),
    y: d3.scale.linear()
  };

  // Define your axis
  var axis = {
    x: d3.svg.axis().orient('bottom'),
    y: d3.svg.axis().orient('left')
  };
    
  // Define the conversion function for the axis points
  axis.x.scale(convert.x);
  axis.y.scale(convert.y);

  // Define the output range of your conversion functions
  convert.y.range([maxHeight, 0]);
  convert.x.rangeRoundBands([0, maxWidth]);
    
  // Once you get your data, compute the domains
  convert.x.domain(employees.map(function (d) {
      return d.dept;
    })
  );
    
  convert.y.domain([0, maxAge]);

  // Setup the markup for your SVG
  var svg = d3.select('.chart')
    .attr({
        width: svgWidth,
        height: svgHeight
    });
  
  // The group node that will contain all the other nodes
  // that render your chart
  var chart = svg.append('g')
    .attr({
        transform: function (d, i) {
          return 'translate(' + padding.left + ',' + padding.top + ')';
        }
      });
    
  chart.append('g') // Container for the axis
    .attr({
      class: 'x axis',
      transform: 'translate(0,' + maxHeight + ')'
    })
    .call(axis.x); // Insert an axis inside this node

  chart.append('g') // Container for the axis
    .attr({
      class: 'y axis',
      height: maxHeight
    })
    .call(axis.y); // Insert an axis inside this node

  var bars = chart
    .selectAll('g.bar-group')
    .data(employees)
    .enter()
    .append('g') // Container for the each bar
    .attr({
      transform: function (d, i) {
        return 'translate(' + convert.x(d.dept) + ', 0)';
      },
      class: 'bar-group'
    });

  bars.append('rect')
        .attr({
        y: maxHeight,
        height: 0,
        width: function(d) {return convert.x.rangeBand(d) - 1;},
        class: 'bar'
    })
    .transition()
    .duration(1500)
    .attr({
      y: function (d, i) {
        return convert.y(d.age);
      },
      height: function (d, i) {
        return maxHeight - convert.y(d.age);
      }
    });

  return chart;
}

animateBarsUp();

*/

/* 
Checks whether graphs have been made.
If graphs already present, clears
If no graphs, makes em
*/
function checkForGraphs() {
	if (graphsAlreadyPresent == true) {
		clearGraphs();
	} else {
		makeGraphs();
	}
}
/*
Clears the graphs from the document
If datatype or alpha value has been changed, then restarts with stats
If datatype or alpha value has NOT been changed, then restarts just with graphs
*/
function clearGraphs() {
	//console.log("Means of data is " + meansOfData[0].length + " long.")
	var graphDivElement;
	for(var i = 0; i < meansOfData[0].length + 1; i++)	 {
		//document.getElementById("graphDiv" + i).removeChild("svgElement");
		console.log("Clearing graph " + i);
		graphDivElement = document.getElementById("graphDiv" + i);
		graphDivElement.parentNode.removeChild(graphDivElement);
	}	
	console.log("Clearing the graphs");
	checkLevelOfRebuild();
}

function checkLevelOfRebuild() {
	console.log("-----Checking Lvl of Rebuild-----");
	if(alphaOfGraphs == alpha) {
		console.log("Making the Graphs");
		makeGraphs();
	} else {
		console.log("Rerunning stats");
		basicStats();
	}
}

function makeGraphs() {
	//Changes the label for the buildGraphs button once pressed to rebuild
	buildGraphsButton.innerHTML = "Rebuild graphs";
	
	//Checks to see if graphs are present to determine whether they need removal
	
	
	// Updates graphsAlreadyPresent so next press will remove old graphs
	graphsAlreadyPresent = true;
	
	// From Mikey
	// Making new grpah for each task
	//console.log("Running makeGraphs");
	for(var i = 0; i < meansOfData[0].length + 1; i++)	 {	
		//For each task, add a div		
		var newDiv = document.createElement("div");
		newDiv.id = "graphDiv" + i; // names each graph
		document.getElementsByTagName("body")[0].appendChild(newDiv);
		// Adds an svg 
		var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svgElement.classList.add("chart" + i);
		// Future, need to make svg width and height based on data
		svgElement.width = svgWidth;
		svgElement.height = svgHeight;
		svgElement.id = "graph_Generic";
		//document.getElementsByTagName("body")[0].appendChild(svgElement); 
		document.getElementById("graphDiv" + i).appendChild(svgElement);
	}
	
	var prepDataSummary = new Array();
	for(var j = 0; j < meansOfData[0].length; j++)	 {
		// Future: determine which type of graph to create
		
		// Iterates through each condition and pushes and object to prepData
		var prepData = new Array();
		for(var k = 0; k < conditions.length; k++)	 {
			var obj = new Object();
			obj.condition = conditions[k];
			obj.mean = meansOfData[k][j];
			obj.CI = confIntervalOfData[k][j];
			prepData.push(obj);
			
			// Adding more info in obj.condition for summary graph
			obj.conditionSummary = columnHeaders[j+1] + "" + conditions[k];
			prepDataSummary.push(obj);
		}

		var here = "#graphDiv" + k;
		var x = 2;
		switch (x) {
			case 1: 
				buildGraph_GenericRedone(here,prepData,j, false, svgWidth);
				break;
			default:
				buildGraph_Generic(here,prepData,j, false, svgWidth);
				break;
		}

	}
	//Determines whether there should be a summary graph, then builds it
	//console.log("meansOfData = " + meansOfData.length)
	if (columnHeaders.length > 2) {
		//here = "#graphDiv" + k + 1;
		// future change number
		//console.log("Are you running?")
		here = "#graphDiv2";
		switch(x) {
			case 1:
				buildGraph_GenericRedone(here,prepDataSummary,j, true, svgWidth * 2);
				break;
			default:
				buildGraph_Generic(here,prepDataSummary,j, true, svgWidth * 1.5);
				break;
		}
	}	
	
	
	function buildGraph_Generic(location,graphSpecificData,increment, summaryGraph, graphWidth) {
		//console.log("Building a generic graph: " + increment);
		//var svgHeight = 400;
		//var svgWidth = 500;
		//var barSpacing = 1; // The amount of space you want to keep between the bars
		if (summaryGraph == false) {
			labelForTitle = columnHeaders[increment+1];
		} else {
			labelForTitle = "Summary";
			summaryGraphWidth = graphWidth;
		}
		/*
		//Moved the padding up for the purposes of the summary graph legend
		var padding = {
		    left: 60, right: 0,
		    top: 40, bottom: 20
		};
		*/
		
		function animateBarsUp() {
			var maxWidth = graphWidth - padding.left - padding.right;
			var maxHeight = svgHeight - padding.top - padding.bottom;

			
			var tickCoordArray = [];
			// Original
			/*
			// Define your conversion functions
			var convert = {    
				x: d3.scale.ordinal(),
				y: d3.scale.linear()
			};
		  		  
			// Define your axis
			var axis = {
				x: d3.svg.axis().orient('bottom'),
				xTop: d3.svg.axis().orient('top'),
				y: d3.svg.axis().orient('left')
			};
		  
			// Define the conversion function for the axis points
			axis.x.scale(convert.x);
			axis.y.scale(convert.y);

			// Define the output range of your conversion functions
			convert.y.range([maxHeight, 0]);
			convert.x.rangeRoundBands([0, maxWidth]);
		    
			// Once you get your data, compute the domains
			convert.x.domain(graphSpecificData.map(function (d) {
				return d.condition;
				})
			);
		    
		  convert.y.domain([0, yMax]);
		  */

		  // Setup the markup for your SVG
		  var svgString = ".chart" + increment;
		  var svg = d3.select(svgString)
		    .attr({
		        width: graphWidth + legendWidthSpacing,
		        height: svgHeight + 50
		    });
		  
		// X Axis Stuffs
		//Convert data for X axis
		if (summaryGraph == false) {
			var xScale = d3.scale.ordinal()
				.rangeRoundBands([0, maxWidth])
				.domain(graphSpecificData.map(function(d) {return d.condition;}));
		} else {
			var xScale = d3.scale.ordinal()
				.rangeRoundBands([0, maxWidth])
				.domain(graphSpecificData.map(function(d) {return d.conditionSummary;}));
		}
		// Sets up the X axis
		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient('bottom');
		
		// Removes X axis labels so html foreignObjects can be used
		if(summaryGraph == true || summaryGraph == false) {
			//xAxis.tickValues([0,0]);
			xAxis.tickFormat(d3.requote(""));
			xAxis.tickSize(0);
		}
		
		// Y Axis Stuffs
		//Convert data for Y axis
		var yScale = d3.scale.linear()
			.range([maxHeight, 0])
			.domain([0, yMax]);
		// Sets up the Y axis
		var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient('left')
			//.tickSize(-svgWidth);
			//.tickSize(10)
				
		// Builds the chart axes choppy!chop!)
		  var chart = svg.append('g')
		    .attr({
		        transform: function (d, i) {
		          return 'translate(' + padding.left + ',' + padding.top + ')';
		        }
		      });
		    
		  chart.append('g') // Container for the axis
		    .attr({
		      class: 'x axis',
		      transform: 'translate(0,' + maxHeight + ')'
		    })
		    //.call(axis.x); // Insert an axis inside this node
			.call(xAxis); // Insert an axis inside this node

		  chart.append('g') // Container for the axis
		    .attr({
		      class: 'y axis',
		      height: maxHeight
		    })
		    //.call(axis.y.tickSize(-svgWidth)
			//.call(axis.y); // Insert an axis inside this node
			.call(yAxis); // Insert an axis inside this node
		
		//Selects the Y axis ticks other than 0, and formats with css (.axis line)
		// http://fiddle.jshell.net/zUj3E/1/
		//chart.selectAll("g.y.axis g.tick line")
		chart.selectAll("g.tick line")
			.attr("x2", function(d){
				//d for the tick line is the value of that tick
				if (d>1) {
					return graphWidth - padding.left;
				}
			});
		
		// Creates an array with the coordinates of the ticks
		// http://stackoverflow.com/questions/22722952/how-can-i-get-the-d3-js-axis-ticks-and-positions-as-an-array
		chart.selectAll(".tick").each(function(data) {
		  var tick = d3.select(this);
		  // pull the transform data out of the tick
		  var transform = d3.transform(tick.attr("transform")).translate;

		  // passed in "data" is the value of the tick, transform[0] holds the X value
		 // console.log("each tick", data, transform);
		  tickCoordArray.push(transform);
		});
		
		// Uses the array of the tick coordinates to draw lines
		for(var y_i = 0; y_i < tickCoordArray.length; y_i++) {
			var yTick = chart.append("line")
				.attr("class", "outsideTicks")
				.attr("x1", 0)
				.attr("x1", -5)
				.attr("y1", tickCoordArray[y_i][1])
				.attr("y2", tickCoordArray[y_i][1])
				.style("stroke", "#000");
		}
		
		//Draws ticks for X axis
		if (summaryGraph == false) {
			for(var x_i = 0; x_i < tickCoordArray.length; x_i++) {
				var xTick = chart.append("line")
					.attr("class", "outsideTicks")
					.attr("x1", tickCoordArray[x_i][0])
					.attr("x2", tickCoordArray[x_i][0])
					.attr("y1", svgHeight - padding.top - padding.bottom)
					.attr("y2", svgHeight - padding.top - padding.bottom+7)
					.style("stroke", "#000");
			}
		}
		
		//Y Axis label
		//Old
		/*
		chart.append("text")
			.attr("class", "yAxisLabel")
			.attr("transform", "rotate(-90)")
			.attr("x", -maxHeight)
			//.attr("dx", "6em")
			.attr("dx", 0)
			.attr("y", -40)
			.attr("dy", ".71em")
			.style("text-anchor", "start")
			.text(labelYAxis);
		*/
		chart.append("foreignObject")
			.attr("class", "yAxisLabel")
			.attr("width", 200)
			.attr("height", 100)
			.attr("class", "yAxisLabel")
			.attr("transform", "rotate(-90)")
			.attr("x", -maxHeight - 10)
			//.attr("dx", "6em")
			//.attr("dx", 0)
			.attr("y", -45)
			//.attr("dy", ".71em")
			.append("xhtml:body")
			.style("font", "10px")
			.style("text-anchor", "start")
			.html(labelYAxis);
		
		// Old Title label
		/*
		chart.append("text")
			.attr("class", "titleLabel")
			//.attr("x", ( svgWidth / 2))
			.attr("x", ( maxWidth / 2))
			.attr("y", -10)
			.attr("text-anchor", "middle")
			//.text(labelForTitle);
			//.text("This is a long text string to see whether or not this text to wrap and if so where it starts to wrap but I'm pretty sure it is not going to work.");
			*/
		// Title label
		chart.append("foreignObject")
			.attr("class", "titleLabel")
			//.attr("width", 200)
			.attr("width", (maxWidth * .8))
			.attr("height", 100)
			//.attr("x", ( maxWidth / 2))
			.attr("x", (maxWidth * .1))
			.attr("y", -30)
			.attr("text-anchor", "middle")
			//.html(labelForTitle);
			.html("<center>" + labelForTitle);

		
		
		//Assigns data and conditions to the x axis
		if (summaryGraph == false) {
			var bars = chart
				.selectAll('g.bar-group')
				.data(graphSpecificData)
				.enter()
				.append('g') // Container for the each bar
				.attr({
					transform: function (d, i) {
						return 'translate(' + xScale(d.condition) + ', 0)';
					},
					class: 'bar-group'
				});
		} else {
			var bars = chart
				.selectAll('g.bar-group')
				.data(graphSpecificData)
				.enter()
				.append('g') // Container for the each bar
				.attr({
					transform: function (d, i) {
						return 'translate(' + xScale(d.conditionSummary) + ', 0)';
					},
					class: 'bar-group'
				});
		}
		
		
		//Calculates the width of the bars so errorBarsWidth is known rather than using width: function(d) {return xScale.rangeBand(d) / (1.5);},
		if (summaryGraph == false) {
			var barWidth = ((graphWidth - padding.left) / conditions.length)/1.5;
		} else {
			var barWidth = (graphWidth - padding.left) / (conditions.length * (columnHeaders.length - 1))/1.5;
		}
		
		
		//Bar colors
		//Determines what the bar colors should be for the summaryGraph
		if (summaryGraph == true) {
			colorScaleSummary = [];
			for (var sg_color_i = 0; sg_color_i < columnHeaders.length - 1; sg_color_i++) {
				for (var sg_color_j = 0; sg_color_j < conditions.length; sg_color_j++) {
					colorScaleSummary.push(colorScale[sg_color_j]);
				}
			}
		}
		
		// Determines widths & x coordinate for the summary graph error bars and rects
		if (summaryGraph == true) {
			var summaryRecCorrectedWidth = (graphWidth - padding.left) / ((conditions.length + 1) * meansOfData[0].length);
			var summaryRecD3Width = (graphWidth - padding.left) / ((conditions.length) * meansOfData[0].length);
			var summaryRecXCoord;
		}
		
		bars.append('rect')
			.attr({
				//x: function(d, i) {return ((i+1) * 20)},
				//x: function(d) {return xScale.rangeBand(d) / (6)},
				x: function(d, sumRec_i) {
					if (summaryGraph == false) {
						return xScale.rangeBand(d) / (6)
					} else {
						if (sumRec_i == 0) {
							summaryRecXCoord = summaryRecCorrectedWidth / 2;
							return summaryRecXCoord -(summaryRecD3Width * sumRec_i);
						} else if (sumRec_i % conditions.length == 0) {
							summaryRecXCoord += (summaryRecCorrectedWidth * 2);
							return summaryRecXCoord - (summaryRecD3Width * sumRec_i);
						} else {
							summaryRecXCoord += summaryRecCorrectedWidth;
							return summaryRecXCoord - (summaryRecD3Width * sumRec_i);
						}
						
					}
				},
				y: maxHeight,
		        height: 0,
		        //Working
				/*width: function(d) {return xScale.rangeBand(d) / (1.5);},
				*/
				width: function(d,i) {
					if (summaryGraph == false) {
						return barWidth
					} else {
						//return xScale.rangeBand(d)
						return summaryRecCorrectedWidth
					}
				},
				
				//old
				//width: function(d, i) {return ((i+1) * 20)},
				class: 'bar',
				fill: function(d,i) {
					if (summaryGraph == false) {
						return colorScale[i] // if array
					} else {
						return colorScaleSummary[i] // if array
					}
				//fill: function(d,i) {return colorScale(i)} // if function
				//fill: 'none'
				}
				
		    })
			//Opacity of the bar
			.style({
				opacity: 1.0
			})
			
			//If want to have stroke around bars
			//.style("stroke-width", .75)
			//.style("stroke", "black")
		    //.transition()
		    //.duration(1500)
		    .attr({
		      y: function (d, i) {
		        if(!isNaN(d.mean)) {
					return yScale(d.mean);
				}
		      },
		      height: function (d, i) {
		        if(!isNaN(d.mean)) {
					return maxHeight - yScale(d.mean);
				}
		      }
		    });
			
			
			// This function determines the X coordinates since by default D3 places equal space between graphs; 
			// It also check to see whether the bar will be off the scale, and then returns 0, but maintains the width summation 
			function calcSummaryGraphErrorBarXCoord(d, sumRec_j, offScale) {
				if(sumRec_j == 0) {summaryRecXCoord = 0;}
				if (summaryGraph == false) {
						if (offScale == true) {
							return 0;
						} else {
						return xScale.rangeBand(d) / 2;
						}
					} else {
						if (sumRec_j == 0) {
							summaryRecXCoord = (summaryRecCorrectedWidth);
							if(offScale == true && !isNaN(d.mean)) {
								return 0;
							} else {
								return summaryRecXCoord  -(summaryRecD3Width * sumRec_j);
							}
						} else if (sumRec_j % conditions.length == 0) {
							summaryRecXCoord += (summaryRecCorrectedWidth * 2);
							if(offScale == true && !isNaN(d.mean)) {
								return 0;
							} else {
								return summaryRecXCoord  -(summaryRecD3Width * sumRec_j);
							}
						} else {
							summaryRecXCoord += summaryRecCorrectedWidth;
							if(offScale == true && !isNaN(d.mean)) {
								return 0;
							} else {
								return summaryRecXCoord  -(summaryRecD3Width * sumRec_j);
							}
						}
						
					}
			}
			
			// Error Bars
			var errorBarWidth = barWidth / 2.4;
			//var errorBarHorizColor = "#989898";
			var errorBarHorizColor = "#4d4d4d";
			// Error bars (vertical)
			bars.append("line")
				.attr("class", "errorBars")
				.attr("stroke-width", 1)
				//.style("stroke-dasharray", ("2,2"))
				.attr("stroke", errorBarHorizColor)
				//.attr("x1", function(d) { return xScale.rangeBand(d) / 2})
				//.attr("x2", function(d) { return xScale.rangeBand(d) / 2})
				// Updated for summaryGraph
				.attr("x1", function(d, sumRec_i) { return calcSummaryGraphErrorBarXCoord(d, sumRec_i)})
				.attr("x2", function(d, sumRec_i) { return calcSummaryGraphErrorBarXCoord(d, sumRec_i)})
				//.attr("y1", function(d) { return yScale(d.mean + d.CI) })
				//Sets the max to the top of the Y scale
				.attr("y1", function(d) { 
											// Determines whether the line will be on or off the scale
											if(isNaN(d.mean)) { // do nothing
											} else if(yScale(d.mean + d.CI) < 0) {
												return 0;
											} else {
												return yScale(d.mean + d.CI);
										}})
				//.attr("y2", function(d) { return yScale(d.mean - d.CI) });
				.attr("y2", function(d) { 
											// Determines whether the line will be on or off the scale
											if(isNaN(d.mean)) { // do nothing
											} else if(yScale(d.mean - d.CI) > maxHeight) {
												return maxHeight;
											} else {
												return yScale(d.mean - d.CI);
										}});

			// Error bars (horizontal top)				
			bars.append("line")
				.attr("class", "errorBars")
				.attr("stroke-width", 1)
				//.style("stroke-dasharray", ("1,1"))
				.attr("stroke", errorBarHorizColor)
				//.attr("x1", function(d) { return xScale.rangeBand(d) / 2 - errorBarWidth})
				//.attr("x2", function(d) { return xScale.rangeBand(d) / 2 + errorBarWidth})
				// Updated for summaryGraph
				//.attr("x1", function(d, sumRec_i) { return calcSummaryGraphErrorBarXCoord(d, sumRec_i) - errorBarWidth})
				//.attr("x2", function(d, sumRec_i) { return calcSummaryGraphErrorBarXCoord(d, sumRec_i) + errorBarWidth})
				.attr("x1", function(d, sumRec_i) { 
												// Calls the function to determine X coordinate based on whether the line will be on or off the scale
												if(yScale(d.mean + d.CI) < 0) {
													return calcSummaryGraphErrorBarXCoord(d, sumRec_i, true)
												} else {
													return calcSummaryGraphErrorBarXCoord(d, sumRec_i, false) - errorBarWidth
												}
					
													})
				.attr("x2", function(d, sumRec_i) { 
												// Calls the function to determine X coordinate based on whether the line will be on or off the scale
												if(yScale(d.mean + d.CI) < 0) {
													return calcSummaryGraphErrorBarXCoord(d, sumRec_i, true)
												} else {
													return calcSummaryGraphErrorBarXCoord(d, sumRec_i, false) + errorBarWidth
												}
					
													})
				//.attr("y1", function(d) { return yScale(d.mean + d.CI) })
				//.attr("y2", function(d) { return yScale(d.mean + d.CI) });
				.attr("y1", function(d) { 
											// Determines whether the line will be on or off the scale
											if(yScale(d.mean + d.CI) < 0 || isNaN(d.mean)) {
												//return 0;
												return yScale(0);
											} else {
												return yScale(d.mean + d.CI)
											}
										})
				
				.attr("y2", function(d) { 
											// Determines whether the line will be on or off the scale
											if(yScale(d.mean + d.CI) < 0 || isNaN(d.mean)) {
												//return 0;
												return yScale(0);
											} else {
												return yScale(d.mean + d.CI) 
											}
										});
			
			// Error bars (horizontal bottom)				
			bars.append("line")
				.attr("class", "errorBars")
				.attr("stroke-width", 1)
				//.style("stroke-dasharray", ("1,1"))
				.attr("stroke", errorBarHorizColor)
				//.attr("x1", function(d) { return xScale.rangeBand(d) / 2 - errorBarWidth})
				//.attr("x2", function(d) { return xScale.rangeBand(d) / 2 + errorBarWidth})
				// Updated for summaryGraph
				//.attr("x1", function(d, sumRec_i) { return calcSummaryGraphErrorBarXCoord(d, sumRec_i, false) - errorBarWidth})
				//.attr("x2", function(d, sumRec_i) { return calcSummaryGraphErrorBarXCoord(d, sumRec_i, false) + errorBarWidth})
				.attr("x1", function(d, sumRec_i) { 
												// Calls the function to determine X coordinate based on whether the line will be on or off the scale
												
													if(yScale(d.mean - d.CI) > maxHeight) {
														return calcSummaryGraphErrorBarXCoord(d, sumRec_i, true)
													} else {
														return calcSummaryGraphErrorBarXCoord(d, sumRec_i, false) - errorBarWidth
													}
												
					
													})
				.attr("x2", function(d, sumRec_i) { 
												// Calls the function to determine X coordinate based on whether the line will be on or off the scale
												
													if(yScale(d.mean - d.CI) > maxHeight) {
														return calcSummaryGraphErrorBarXCoord(d, sumRec_i, true)
													} else {
														return calcSummaryGraphErrorBarXCoord(d, sumRec_i, false) + errorBarWidth
													}
												
					
													})
				//.attr("y1", function(d) { return yScale(d.mean - d.CI) })
				//.attr("y2", function(d) { return yScale(d.mean - d.CI) });
				.attr("y1", function(d) { 
											// Determines whether the line will be on or off the scale
											if(yScale(d.mean - d.CI) > maxHeight || isNaN(d.mean)) {
												//return 0;
												return yScale(0);
											} else {
												return yScale(d.mean - d.CI)
											}
										})
				
				.attr("y2", function(d) { 
											// Determines whether the line will be on or off the scale
											if(yScale(d.mean - d.CI) > maxHeight || isNaN(d.mean)) {
												//return 0;
												return yScale(0);
											} else {
												return yScale(d.mean - d.CI) 
											}
										});
			
			
			// Data values
			//This is for the stroke behind the data values to make them stand out better with the error bars
			bars.append("text")
				.attr("class", "dataValuesText")
				.attr("text-anchor", "middle")
				//.attr("x", function(d) { return xScale.rangeBand(d) / 2})
				// Updated for summaryGraph
				.attr("x", function(d, sumRec_i) { return calcSummaryGraphErrorBarXCoord(d, sumRec_i)})
				.attr("y", function(d) { 
					if(!isNaN(d.mean)) {
						return yScale(d.mean) + 3; 
					}
				})
				.attr("dy", "-.5em")
				.attr("stroke-width", 2)
				.attr("stroke", "white")
				.text(function(d) { 
					var theMean = d.mean;
					if(!isNaN(theMean)) { 
						return theMean.toFixed(decimalPlaces); 
					} else {
						// do nothing
					}
				});
				
			//Actual data values
			bars.append("text")
				.attr("class", "dataValuesText")
				.attr("text-anchor", "middle")
				//.attr("x", function(d) { return xScale.rangeBand(d) / 2})
				// Updated for summaryGraph
				.attr("x", function(d, sumRec_i) { return calcSummaryGraphErrorBarXCoord(d, sumRec_i)})
				.attr("y", function(d) { 
					if(!isNaN(d.mean)) {
						return yScale(d.mean) + 3; 
					} else {
						// do nothing
					}
				})
				.attr("dy", "-.5em")
				.text(function(d) { 
					var theMean = d.mean;
					if(!isNaN(d.mean)) {
						return theMean.toFixed(decimalPlaces); 
					} else {
						// do nothing
					}
				});
			
			//Adds X axis labels for both graphs and Legend for summaryGraph
			if (summaryGraph == false) { //                           Other Graph
				for (var graphConditions_i = 0; graphConditions_i < conditions.length; graphConditions_i++) {
					//New labels
					chart.append("foreignObject")
						.attr("class", "summaryGraphLabels")
						//.attr("width", 200)
						.attr("width", ((maxWidth / (conditions.length))) - padding.label)
						//.attr("height", 100)
						//.attr("x", ( maxWidth / 2))
						//.attr("x", (graphConditions_i * maxWidth / (conditions.length-1) - (maxWidth / (conditions.length-1)/2)))
						.attr("x", (padding.label + (graphConditions_i + 1) * maxWidth / (conditions.length) - (maxWidth / (conditions.length))))
						//.attr("y", svgHeight - padding.bottom - 20)
						.attr("y", svgHeight - padding.bottom - padding.top + 7)
						.attr("text-anchor", "middle")
						.html("<center>" + conditions[graphConditions_i] + "<br>(<i>n</i> = " + cellSizesOfData[graphConditions_i][increment] + ")");
						
						
				} // x Axis Label
			} else if (summaryGraph == true) { //                     SummaryGraph
				// x Axis Label
				for (var sumGraphTasks_i = 1; sumGraphTasks_i < columnHeaders.length; sumGraphTasks_i++) {
					//Old labels
					/*
					chart.append("text")
						.attr("class", "summaryGraphLabels")
						//.attr("x", ( svgWidth / 2))
						//.attr("x", ((sumGraphTasks_i) * (maxWidth / (columnHeaders.length-1)))/2 + (sumGraphTasks_i - 1) * (maxWidth / (columnHeaders.length-1)))
						.attr("x", (sumGraphTasks_i * maxWidth / (columnHeaders.length-1) - (maxWidth / (columnHeaders.length-1)/2)))
						.attr("y", svgHeight - padding.bottom - 20)
						.attr("text-anchor", "middle")
						.text(columnHeaders[sumGraphTasks_i]);	
					*/
					//New labels
					chart.append("foreignObject")
						.attr("class", "summaryGraphLabels")
						//.attr("width", 200)
						.attr("width", ((maxWidth / (columnHeaders.length-1))) - padding.label)
						//.attr("height", 100)
						//.attr("x", ( maxWidth / 2))
						//.attr("x", (sumGraphTasks_i * maxWidth / (columnHeaders.length-1) - (maxWidth / (columnHeaders.length-1)/2)))
						.attr("x", (padding.label + sumGraphTasks_i * maxWidth / (columnHeaders.length-1) - (maxWidth / (columnHeaders.length-1))))
						//.attr("y", svgHeight - padding.bottom - 20)
						.attr("y", svgHeight - padding.bottom - padding.top + 5)
						.attr("text-anchor", "middle")
						.html("<center>" + columnHeaders[sumGraphTasks_i]);
						
						
				} // x Axis Label
				
				
				// Legend
				// add legend   
				var legend = svg.append("g")
				  .attr("class", "legend")
				  //.attr("x", 65)
				  //.attr("y", 50)
				  .attr("height", 100)
				  .attr("width", 100)
				  //.attr('transform', 'translate(-20,50)')    
				  
				
				legend.selectAll('rect')
				  .data(meansOfData)
				  .enter()
				  .append("rect")
				  .attr("x", summaryGraphWidth + 5)
				  .attr("y", function(d, i){ return i *  20 + padding.top;})
				  .attr("width", 10)
				  .attr("height", 10)
				  .style("fill", function(d,i) { 
					var color = colorScale[i];
					return color;
				  })
				  
				legend.selectAll('text')
				  .data(meansOfData)
				  .enter()
				  .append("text")
				  .attr("class", "summaryLegendLabels")
				  .attr("x", summaryGraphWidth + 17)
				  .attr("y", function(d, i){ return i *  20 + 10 + padding.top;})
				  .text(function(d, i) {
					var text = conditions[i];
					return text;
				  });
				
			}
			
			
		  return chart;
		}
		
		

		animateBarsUp();
	}
	

	console.log("Graphs made");
} // makeGraphs()






