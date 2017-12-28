$(document).ready(function () {
    /*$("#sbar input").on('blur', function () {
    $('#searchR').css("display", "none");
});
$("#sbar input").on('focus', function () {
    $('#searchR').css("display", "visible");
});*/
    $("#search").click(function () {
        var mname = add($("#mname").val());
        var url = 'http://www.omdbapi.com/?apikey=ec6483bd&s=' + mname;
        console.log("called ", url);
        $.get(url).done(function (data) {
            document.getElementById("searchR").style.display = "block";
            var str = "";
            if (data.Response === 'False') {
                console.log(data.Response);
                str += "<h1>Item not found</h1>";
            }
            else {
                //console.log(data);
                for (var i = 0; i < data.Search.length; i++) {
                    str += "<div class=\"outline\" onclick=\"getmovie('" + data.Search[i].Title + "')\"style=\"display:inline-flex; width:90%;\"> <img src=\"" + data.Search[i].Poster + "\" alt=\"\"> <div style=\"padding:1rem;\"><span name=\"title\">" + data.Search[i].Title + "</span><span name=\"year\">" + data.Search[i].Year + " </span><span name=\"type\">" + firstCap(data.Search[i].Type) + "</span> </div> </div>";
                }
                console.log(data.Response);
            }
            $("#searchR").empty().html(str);
            console.log(data);
        }).fail(function (error) {
            console.log("ajax result", error);
        });
    });
    $('#mname').keyup(function () {
        if (event.keyCode == 13) {
            $('#search').click();
        }
        else {
            return false
        }
    });
});

function getmovie(e) {
    console.log(e);
    var url = "/getmovie?title=" + e;
    location.href = url;
}

function add(mname) {
    for (i = 0; i < mname.length; i++) {
        if (mname[i] == ' ') {
            mname = mname.replace(' ', '+');
        }
    }
    return mname;
}

function firstCap(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}