
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

window.onload = function() {
    var url;
    if (getUrlVars()["url"]) {
        url = decodeURIComponent(getUrlVars()["url"]);
    } 

    jQuery('#injected-text').load(url, function() {
        setTimeout(iResize, 50);
    });

    jQuery("#container-div-2").scroll(function() {
        jQuery("#container-div-1").scrollTop(jQuery("#container-div-2").scrollTop());
    });

    if (getUrlVars()["editable"] == 'true') {
        jQuery("#container-div-1").click(function() {
           clearSelected();
        });

        jQuery("#container-div-2").click(function() {
            clearSelected();
        });
    } else {
        jQuery("#container-div-1").click(function() {
            clearSelected();

            parent.window.jQuery.fn.clearObjectUrl();
            parent.window.jQuery.fn.clearSelectedImage();
        });

        jQuery("#container-div-2").click(function() {
            clearSelected();

            parent.window.jQuery.fn.clearObjectUrl();
            parent.window.jQuery.fn.clearSelectedImage();
        });
    }
}

function iResize() {
    var sizeInt = (jQuery('#injected-text').outerHeight() + 50);

    jQuery('#annotations-div').height(sizeInt);
    jQuery('#annotations-div').css('height', sizeInt);
}

function focusText(img) {
    var startOffset = img.getAttribute('startOffset');
    var startOffsetXpath = img.getAttribute('startOffsetXpath');
    var endOffset = img.getAttribute('endOffset');
    var endOffsetXpath = img.getAttribute('endOffsetXpath');

    focusTextOffsetsWithXPaths(startOffset, startOffsetXpath, endOffset, endOffsetXpath);
}

function focusTextOffsetsWithXPaths(startOffset, startOffsetXpath, endOffset, endOffsetXpath) {
    var injectedText = document.getElementById('injected-text');

    if (window.getSelection && document.createRange) {
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(injectedText);
        range.setStart(lookupElementByXPath(startOffsetXpath), startOffset);
        range.setEnd(lookupElementByXPath(endOffsetXpath), endOffset);
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (document.selection && document.body.createTextRange) {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(injectedText);
        textRange.setStart(lookupElementByXPath(startOffsetXpath), startOffset);
        textRange.setEnd(lookupElementByXPath(endOffsetXpath), endOffset);
        textRange.select();
    }
}

function lookupElementByXPath(path) {
    var evaluator = new XPathEvaluator();
    var result = evaluator.evaluate(path, document.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
}

function focusTextOffsets(startOffset, endOffset) {
    var injectedText = document.getElementById('injected-text');

    if (window.getSelection && document.createRange) {
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(injectedText);
        range.setStart(injectedText.childNodes[0], startOffset);
        range.setEnd(injectedText.childNodes[0], endOffset);
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (document.selection && document.body.createTextRange) {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(injectedText);
        textRange.setStart(injectedText.childNodes[0], startOffset);
        textRange.setEnd(injectedText.childNodes[0], endOffset);
        textRange.select();
    }
}

function highlightImage(img, sync) {
    if (img.getAttribute('selected') != 'selected') {
        clearSelected();
        img.src = 'resources/link_yellow.png';
        img.setAttribute('selected', 'selected');

        parent.window.jQuery.fn.cycleTextZIndex(img.getAttribute("id").substring(5));

        focusText(img);

        if (getUrlVars()["editable"] != 'true') {
            parent.window.jQuery.fn.setObjectUrl(img.getAttribute("objectUrl"));
            parent.window.jQuery.fn.cycleImageZIndex(img.getAttribute("id").substring(5));
            parent.window.jQuery.fn.setSelectedImage(img.getAttribute("objectUrl"), img.getAttribute('index'));
        }
    }
}

function setSelectedText(objectUrl) {
    clearSelected();
    var img = jQuery("[objectUrl=" + objectUrl + "]")[0];
    img.setAttribute("selected", "selected");
    img.setAttribute("src", "resources/link_yellow.png");

    jQuery("#container-div-1").scrollTop(img.offsetTop - (jQuery("#container-div-1")[0].offsetHeight / 4));
    jQuery("#container-div-2").scrollTop(jQuery("#container-div-1").scrollTop());
    jQuery("#container-div-1").scrollTop(jQuery("#container-div-2").scrollTop());

    focusText(img);
}

function clearSelected(){
    jQuery("[selected=selected]").css("z-index","1");
    jQuery("[selected=selected]").css("z-index");
    jQuery("[selected=selected]")
        .attr("src", "resources/link_black.png")
        .attr("selected", "")
        .css("pointer-events","auto");
}

function clearSelectedText() {
    clearSelected();

    if (window.getSelection) {
        if (window.getSelection().empty) {
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {
        document.selection.empty();
    }
}
