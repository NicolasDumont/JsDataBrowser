$(function() {
    $('#inputFile').on('change', function(){
        if ($("#inputFile").val()) {
            $('#inputFile').parse({
                config: {
                    //delimiter: '|' //$('#delimiter').val(),
                    //header: $('#header').prop('checked'),
                    //dynamicTyping: $('#dynamicTyping').prop('checked'),
                    //preview: parseInt($('#preview').val() || 0),
                    //step: $('#stream').prop('checked') ? stepFn : undefined,
                    //encoding: $('#encoding').val(),
                    //worker: true,
                    //comments: $('#comments').val(),
                    //complete: completeFn,
                    //error: errorFn//,
                    //download: inputType == "remote"
                },
                before: function (file, inputElem) {
                    alert("Parsing " + file.name);
                },
                /*step: function (results, parser) //does not work
                {
                    alert("Row data:", results.data);
                    alert("Row errors:", results.errors);
                },*/
                error: function (err, file) {
                    alert("Error while parsing file: " + err);
                },
                complete: function (results) {
                    alert("Parsing complete: " + results);
                }
            });
        }
        else{alert('no file chosen');}
    });
});