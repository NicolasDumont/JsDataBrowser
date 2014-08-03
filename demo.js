//PARSER:
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
binaryIndexOf=function (key) {
    'use strict';

    var low = 0;
    var high = this.length - 1;
    var mid;
    var midVal;

    while (low <= high) {
        mid = (low + high) >>> 1;  //int mid = low + ((high - low) / 2);
        midVal = this[mid];
        console.warn("low: " + low + ", high: " + high + ", mid: " + mid + ", midVal: " + midVal);

        if (midVal < key) {
            low = mid+1;
        }
        else if (midVal > key) {
            high = mid-1;
        }
        else {
            console.warn("KEY FOUND at: " + mid);
            return mid;
        }
    }
    console.warn("KEY WAS NEVER FOUND, but it *would* be at: " + mid + " min: " + low + " max: " + high + ". We found: " + midVal + " at that index, and are looking for " + key);
    //return ~Math.max(low, high);
    return -(low + 1);  // key not found
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
    }
};
var dataLayout = Object.create(DataLayout);
//var loadDataLayout = function(excelDataLayoutFile) {
var item1 = new DataItem("field1", "This is field number one.", 0, 2);
dataLayout.addItem(item1);
    dataLayout.addItem(new DataItem("field1", "This is field number one.", 0, 2));
    dataLayout.addItem(new DataItem("field2", "This is field number two.", 2, 5));
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

    //PARSER:
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
        var columnEnd = editor.selection.getCursor().column + 2;
        //var range = new Range(rowStart, columnStart, rowEnd, columnEnd);
        //marker = editor.getSession().addMarker(range,"ace_selected_word", "text");
        //state.highlightMarker = session.addMarker(adjRangeAce,"ace_selection", "text");
        textMarker = editor.session.addMarker(new aceRange(rowStart, columnStart, rowEnd, columnEnd), "ace_selection", "text"); //"ace_active-line", "fullLine");
        //editor.tokenTooltip.show(editor.text, 10, 10);
        //var s = editor.getSelectedText();
        //if (s != "")
        editor.tokenTooltip.setText(editor.getSelectedText());
        alert(dataLayout.getItem(columnStart).description);
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

function hoveredItem()
{

}