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