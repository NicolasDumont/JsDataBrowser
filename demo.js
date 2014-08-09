//XLS PARSER:
var drop;
var XL;

//CSV PARSER:
var stepped = 0, rowCount = 0, errorCount = 0, firstError;
var start, end;
//var firstRun = true;
//var maxUnparseLength = 10000;
var parseConfig = {
    /*delimiter: $('#delimiter').val(),
     header: $('#header').prop('checked'),
     dynamicTyping: $('#dynamicTyping').prop('checked'),
     preview: parseInt($('#preview').val() || 0),
     step: $('#stream').prop('checked') ? stepFn : undefined,
     encoding: $('#encoding').val(),
     worker: $('#worker').prop('checked'),
     comments: $('#comments').val(),
     */ complete: completeFn/*,
     error: errorFn,
     download: inputType == "remote"*/
};

//DATA LAYOUT:
/**
 * Performs a binary search on the host array.
 * http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
 * -> http://googleresearch.blogspot.be/2006/06/extra-extra-read-all-about-it-nearly.html
 * This method can either be injected into Array.prototype or called with a specified scope like this:
 * binaryIndexOf.call(someArray, searchElement);
 *
 * @param {*} searchElement The item to search for within the array.
 * @return {Number} The index of the element which defaults to -1 when not found.
 *
 * Array.prototype.binaryIndexOf = binaryIndexOf;
 * var arr = [0, 1, 2, 4, 5, 6, 6.5, 7, 8, 9];
 * arr.splice(Math.abs(arr.binaryIndexOf(3)), 0, 3);
 * document.body.textContent = JSON.stringify(arr);
 */
var parsedDataLayout;
binaryIndexOf = function (lookupValue) {
    'use strict';

    var lowIndex = 0;
    var highIndex = this.length - 1;
    var midIndex;
    var midValue;

    while (lowIndex <= highIndex) {
        midIndex = (lowIndex + highIndex) >>> 1;  //http://www.c-point.com/javascript_tutorial/jsoprurshift.htm //int mid = low + ((high - low) / 2);
        midValue = this[midIndex];
        console.warn("lowIndex: " + lowIndex + ", highIndex: " + highIndex + ", midIndex: " + midIndex + ", midValue: " + midValue);

        if (midValue < lookupValue) {
            lowIndex = midIndex + 1;
        }
        else if (midValue > lookupValue) {
            highIndex = midIndex - 1;
        }
        else {
            console.warn("KEY FOUND at: " + midIndex);
            return midIndex;
        }
    }
    //return ~Math.max(lowIndex, highIndex);
    //return -(lowIndex + 1);  // key not found
    var returnValue = lowIndex - 1;
    console.warn("KEY WAS NEVER FOUND, but it *would* be at index " + midIndex + ". MinIndex: " + lowIndex + ". MaxIndex: " + highIndex + ". We found value " + midValue + " at index " + highIndex + " while looking for " + lookupValue + ". Returning " + returnValue);
    return returnValue;
}
/*public static int binarySearch(int[] a, int key) {
     int low = 0;
     int high = a.length - 1;

     while (low <= high) {
         int mid = low + ((high - low) / 2); //not int mid = (low + high) / 2;
         int midVal = a[mid];

         if (midVal < key)
         low = mid + 1
         else if (midVal > key)
         high = mid - 1;
         else
         return mid; // key found
     }
     return -(low + 1);  // key not found.
 }*/
Array.prototype.binaryIndexOf = binaryIndexOf;

function DataItem(name, description, position, length) {
    'use strict';
    this.name = name;
    this.description = description;
    this.position = position;
    this.length = length;
}
var DataLayout = {
    items: [],
    itemsIndex: [],
    addItem: function(dataItem) {
        var x = this;
        this.items.push(dataItem);
        this.itemsIndex.push(dataItem.position);
    },
    getItem: function (cursorPosition) {
        return this.items[this.itemsIndex.binaryIndexOf(cursorPosition)];
    },
    fieldRegex: /^sk\.[1-9]{1,2}$|^0\.|^[1-9]{1,2}\.[0-9]{1,2}\./i,
    fill: function(csvData) {
        csvData.forEach(function(element){
            if(this.fieldRegex.exec(element[0].trim()) != null) {
                console.log("Will keep dataLayout line starting with " + element[0].trim() + " : " + element[1].trim());
                this.addItem(new DataItem(element[1].trim(), element[10].trim(), element[4].trim(), element[3].trim()));
            }
        }, this);
    }
};
var dataLayout = Object.create(DataLayout);
//var loadDataLayout = function(excelDataLayoutFile) {
//var item1 = new DataItem("field1", "This is field number one.", 0, 2);
//dataLayout.addItem(item1);
    //dataLayout.addItem(new DataItem("field1", "This is field number one.", 0, 2));
    //dataLayout.addItem(new DataItem("field2", "This is field number two.", 2, 5));
//}

//EDITOR:
var textMarker;

$(function()
{
	/*// Tabs
	$('#tab-string').click(function()
	{
		$('.tab').removeClass('active');
		$(this).addClass('active');
		$('.input-area').hide();
		$('#input-string').show();
		$('#submit').text("Parse");
		inputType = "string";
	});

	$('#tab-local').click(function()
	{
		$('.tab').removeClass('active');
		$(this).addClass('active');
		$('.input-area').hide();
		$('#input-local').show();
		$('#submit').text("Parse");
		inputType = "local";
	});

	$('#tab-remote').click(function()
	{
		$('.tab').removeClass('active');
		$(this).addClass('active');
		$('.input-area').hide();
		$('#input-remote').show();
		$('#submit').text("Parse");
		inputType = "remote";
	});

	$('#tab-unparse').click(function()
	{
		$('.tab').removeClass('active');
		$(this).addClass('active');
		$('.input-area').hide();
		$('#input-unparse').show();
		$('#submit').text("Unparse");
		inputType = "json";
	});



	// Sample files
	$('#remote-normal-file').click(function() {
		$('#url').val($('#local-normal-file').attr('href'));
	});
	$('#remote-large-file').click(function() {
		$('#url').val($('#local-large-file').attr('href'));
	});
	$('#remote-malformed-file').click(function() {
		$('#url').val($('#local-malformed-file').attr('href'));
	});*/
    //XLS PARSER:
    drop = document.getElementById('drop');
    if(drop.addEventListener) {
        drop.addEventListener('dragenter', handleDragover, false);
        drop.addEventListener('dragover', handleDragover, false);
        drop.addEventListener('drop', handleDrop, false);
    }

    //CSV PARSER:
	$('#submit').click(function()
	{
		if ($(this).prop('disabled') == "true")
			return;

		stepped = 0;
		rowCount = 0;
		errorCount = 0;
		firstError = undefined;

		var input = $('#input').val();
//hardcoded:
        inputType = "local";

		if (inputType == "remote")
		input = $('#url').val();

		// Allow only one parse at a time
		$(this).prop('disabled', true);

		console.log("--------------------------------------------------");

		//if (inputType == "local")
        if ($('#files')[0].files.length)
		{
			if (!$('#files')[0].files.length)
			{
				alert("Please choose at least one file to parse.");
                $(this).prop('disabled', false);
			}

			$('#files').parse({
				config: parseConfig,
				before: function(file, inputElem)
				{
					start = now();
					console.log("Parsing", file);
				},
				error: function(err, file)
				{
					console.log("ERROR:", err, file);
					firstError = firstError || err;
					errorCount++;
				}/*,
                step: function(results, parser)
                {
                    stepped++;
                    alert(stepped);
                    if (results)
                    {
                        if (results.data)
                            rowCount += results.data.length;
                        if (results.errors)
                        {
                            errorCount += results.errors.length;
                            firstError = firstError || results.errors[0];
                        }
                    }
                }/*,
				complete: function() //no arguments
				{

				}*/
			});
		}
		else if (inputType == "remote" && !input)
		{
			alert("Please enter the URL of a file to download and parse.");
			return enableButton();
		}
        else
        {
            start = now();
            var results = Papa.parse(input, parseConfig);
            console.log("Synchronous results:", results);
            if (parseConfig.worker || parseConfig.download)
                console.log("Running...");
        }
	});

    //EDITOR:
    //alert("in $(function()");
    var aceRange = ace.require('ace/range').Range;  //http://stackoverflow.com/questions/10452869/when-i-try-to-create-a-range-object-in-ace-js-an-illegal-constructor-error-is
    var editor = ace.edit("editor");
    //var TokenTooltip = require("./token_tooltip").TokenTooltip;
    var TokenTooltip = ace.require('ace/tokentooltip').TokenTooltip;
    editor.tokenTooltip = new TokenTooltip(editor);
    editor.tokenTooltip.setText("");
    editor.getSession().selection.on('changeCursor', function(e)
    {
        //console.log("Row: " + editor.selection.getCursor().row + " Column: " + editor.selection.getCursor().column);
        if (textMarker) editor.session.removeMarker(textMarker);
        var rowStart = editor.selection.getCursor().row;
        var rowEnd = editor.selection.getCursor().row;
        var columnStart = editor.selection.getCursor().column;
        var columnEnd;
        var tooltipText;
        var foundItem = dataLayout.getItem(columnStart);
        if (typeof foundItem !== "undefined" && columnStart < foundItem.position + foundItem.length) {
            //alert(foundItem.description);
            columnStart = foundItem.position;
            columnEnd = foundItem.position + foundItem.length;
            textMarker = editor.session.addMarker(new aceRange(rowStart, columnStart, rowEnd, columnEnd), "ace_selection", "text"); //"ace_active-line", "fullLine");
            tooltipText = foundItem.description;
        }
        else {
            //alert("Item not defined in the data layout!");
            tooltipText = "No corresponding item defined in Data Layout!";
        }
        //var range = new Range(rowStart, columnStart, rowEnd, columnEnd);
        //marker = editor.getSession().addMarker(range,"ace_selected_word", "text");
        //state.highlightMarker = session.addMarker(adjRangeAce,"ace_selection", "text");
        //editor.tokenTooltip.show(editor.text, 10, 10);
        //var s = editor.getSelectedText();
        //if (s != "")
        //editor.tokenTooltip.setText(editor.getSelectedText());
        editor.tokenTooltip.setText(tooltipText);
    });
    /*editor.commands.addCommand({
        name: 'myCommand',
        bindKey: {win: 'Ctrl-M',  mac: 'Command-M'},
        exec: function(editor) {
            //...
        },
        readOnly: true // false if this command should not apply in readOnly mode
    });*/
});

function now()
{
    return typeof window.performance !== 'undefined'
        ? window.performance.now()
        : 0;
}

function completeFn(results)
{
    end = now();
    $(this).prop('disabled', false);
    console.log("Parse complete");
    console.log("       Time:", (end-start || "(Unknown; your browser does not support the Performance API)"), "ms");
    if (results)
    {
        if (results.errors)
        {
            console.log("     Errors:", results.errors.length);
            if (results.errors.length > 0)
            {
                console.log(results.errors.join('\n'));
            }
        }
        if (results.data && results.data.length > 0)
        {
            console.log("  Row count:", results.data.length);
        }
    }
    if (stepped)
    {
        console.log("    Stepped:", stepped);
    }
    console.log("    Results:", results.data);

    var editor = ace.edit("editor");
    var csv = Papa.unparse(results);
    console.log("    Delimiter: " + results.meta.delimiter);
    editor.setValue(csv);
}

//XLS PARSER
function fixdata(data) {
    var o = "", l = 0, w = 10240;
    for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
    o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(o.length)));
    return o;
}

function to_json(workbook) {
    var result = {};
    workbook.SheetNames.forEach(function(sheetName) {
        var roa = XLS.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if(roa.length > 0){
            result[sheetName] = roa;
        }
    });
    return result;
}

function to_csv(workbook) {
    var result = [];
    workbook.SheetNames.forEach(function(sheetName) {
        var csv = XLS.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        if(csv.length > 0){
            result.push("SHEET: " + sheetName);
            result.push("");
            result.push(csv);
        }
    });
    return result.join("\n");
}

function to_formulae(workbook) {
    var result = [];
    workbook.SheetNames.forEach(function(sheetName) {
        var formulae = XLS.utils.get_formulae(workbook.Sheets[sheetName]);
        if(formulae.length > 0){
            result.push("SHEET: " + sheetName);
            result.push("");
            result.push(formulae.join("\n"));
        }
    });
    return result.join("\n");
}

var tarea = document.getElementById('b64data');
function b64it() {
    if(typeof console !== 'undefined') console.log("onload", new Date());
    var wb = XLS.read(tarea.value, {type: 'base64'});
    process_wb(wb);
}

function process_wb(wb) {
    if(use_worker) XLS.SSF.load_table(wb.SSF);
    var parsedXls = "";
    /*switch(get_radio_value("format")) {
        case "json":
            output = JSON.stringify(to_json(wb), 2, 2);
            break;
        case "form":
            output = to_formulae(wb);
            break;
        default:*/
        parsedXls = to_csv(wb);
    //output = to_html(wb);
    //}
    /*if(xlsToCsv.innerText === undefined) xlsToCsv.textContent = output;
    else xlsToCsv.innerText = output;
    if(typeof console !== 'undefined') console.log("output", new Date());*/
    //Papaparse the csv
    start = now();
    parsedDataLayout = Papa.parse(parsedXls); //, parseConfig);
    /*console.log("Synchronous results:", parsedDataLayout);
    if (parseConfig.worker || parseConfig.download)
        console.log("Running...");*/
    xlsToCsvParsed.innerText = Papa.unparse(parsedDataLayout);
    dataLayout.fill(parsedDataLayout.data);
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    rABS = 1;
    use_worker = 0;
    var files = e.dataTransfer.files;
    var i, f;
    for (i = 0, f = files[i]; i != files.length; ++i) {
        var reader = new FileReader();
        var name = f.name;
        reader.onload = function(e) {
            if(typeof console !== 'undefined') console.log("onload", new Date(), rABS, use_worker);
            var data = e.target.result;
            //var arr = new Array();
            //for(var i = 0; i != data.length; ++i) arr[i] = data[i];
            var fileExtension = f.name.split('.').pop();
            var wb;
            if(fileExtension === "xls") //arr[0] == 0xd0)
                //wb = (XL=XLS).read(arr, {type:"array"});
                wb = (XL=XLS).read(data, {type: 'binary'});
            else if (fileExtension === "xlsx")
                //wb = (XL=XLSX).read(arr, {type:"binary"});
                wb = (XL=XLSX).read(data, {type:"binary"});
            else
                alert("Please upload a xls or xlsx file!")
            console.log(wb);
            process_wb(wb); //, fmt);

            /* from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript */
            /*function getParameterByName(name) {
                name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(location.search);
                return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            }

            var url=getParameterByName("file");
            var fmt=getParameterByName("fmt");
            var oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);
            oReq.responseType = "arraybuffer";
            oReq.onload = function(e) {
                var arraybuffer = oReq.response;
                var data = new Uint8Array(arraybuffer);
                var arr = new Array();
                for(var i = 0; i != data.length; ++i) arr[i] = data[i];
                var wb;
                if(arr[0] == 0xd0) wb = (XL=XLS).read(arr, {type:"array"});
                else wb = (XL=XLSX).read(arr, {type:"binary"});
                console.log(wb);
                process_wb(wb, fmt);
            }
            oReq.send();*/
            /*if(use_worker) {
                xlsworker(data, process_wb);
            } else {
                var wb;
                if(rABS) {
                    wb = XLS.read(data, {type: 'binary'});
                } else {
                    var arr = fixdata(data);
                    wb = XLS.read(btoa(arr), {type: 'base64'});
                }
                process_wb(wb);
            }*/
        };
        if(rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
    }
}

function handleDragover(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

//Table Display:
function get_columns(sheet) {
    var val, rowObject, range, columnHeaders, emptyRow, C;
    range = XL.utils.decode_range(sheet["!ref"]);
    columnHeaders = [];
    for (C = range.s.c; C <= range.e.c; ++C) {
        val = sheet[XL.utils.encode_cell({c: C, r: range.s.r})];
        if(val){
            switch(val.t) {
                case 's': case 'str': columnHeaders[C] = val.v; break;
                case 'n': columnHeaders[C] = val.v; break;
            }
        }
    }
    return columnHeaders;
}

function to_html(wb) {
    var json = to_json(wb);
    wb.SheetNames.forEach(function(sheet) {
        var cols = get_columns(wb.Sheets[sheet]);
        var tbl = document.createElement('div');
        var src = "<h3>" + sheet + "</h3>";
        src += "<table>";
        src += "<thead><tr>";
        cols.forEach(function(c) { src += "<th>" + (typeof c !== "undefined" ? c : "") + "</th>"; });
        src += "</tr></thead>";
        (json[sheet]||[]).forEach(function(row) {
            src += "<tr>";
            cols.forEach(function(c) { src += "<td>" + (typeof row[c] !== "undefined" ? row[c] : "") + "</c>"; });
            src += "</tr>";
        });
        src += "</table>";
        tbl.innerHTML = src;
        var node = document.getElementById('hot');
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        node.appendChild(tbl);
    });
};