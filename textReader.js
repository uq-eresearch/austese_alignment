
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

    $.get(url, function (data) { 
        var injectedText = jQuery('#injected-text');
        data = data.replace('\'', '\\\'');
        data = '\'' + data + '\'';
        injectedText.html(data);
        var newHTML = injectedText.html();
        injectedText.html(newHTML.substr(1,newHTML.length-2));
        setTimeout(iResize, 50);
    });

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
    var containerDiv = document.getElementById('container-div-2');

    var startElement = lookupElementByXPath(startOffsetXpath);
    var endElement = lookupElementByXPath(endOffsetXpath);

    var sel = window.rangy.getSelection();
    var range = rangy.createRange();

    range.selectNodeContents(containerDiv);
    if (startElement != containerDiv || endElement != containerDiv) {
        range.setStart(startElement, startOffset);
        range.setEnd(endElement, endOffset);
    }
    sel.removeAllRanges();
    sel.addRange(range);
}

function lookupElementByXPath(path) {
    var aNode = document.documentElement;
    var xpe = aNode.ownerDocument || aNode;

    if (xpe.createNSResolver) {
        var evaluator = new XPathEvaluator();
        var result = evaluator.evaluate(
            path,
            document.documentElement,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null);

        return result.singleNodeValue;
    } else {
        var paths = path.split('/');
        var node = document.documentElement;
        var returnNode = null;

        for (var i = 0; i < paths.length; i++) {
            if (paths[i] != "") {
                var patt1 = "\\[\\d*\\]";
                var index = -1;
                if (paths[i].match(patt1)) {
                    index = paths[i].match(patt1)[0];
                    index = parseInt(index.substring(1, index.length - 1));
                }

                var patt2 = ".*\\[";
                var tagname = -1;
                if (paths[i].match(patt2)) {
                    tagname = paths[i].match(patt2)[0];
                    tagname = tagname.substring(0, tagname.length - 1);
                }

                var children = node.childNodes;

                if (tagname == "text()") {
                    for (var j = 0; j < children.length; j++) {
                        if (!children[j].tagName) {
                            if (index == 1) {
                                node = children[j];
                                returnNode = node;
                                j = children.length;
                            } else {
                                index = index - 1;
                            }
                        }
                    }
                    if (j != (children.length + 1)) {
                        returnNode = null;
                    }
                } else {
                    for (var j = 0; j < children.length; j++) {
                        if (children[j].tagName && (children[j].tagName.toLowerCase() == tagname)) {
                            if (index == 1) {
                                node = children[j];
                                returnNode = node;
                                j = children.length;
                            } else {
                                index = index - 1;
                            }
                        }
                    }
                    if (j != (children.length + 1)) {
                        returnNode = null;
                    }
                }
            }
        }
        return returnNode;
    }
    return null;
}

function focusTextOffsets(startOffset, endOffset) {
    var injectedText = document.getElementById('injected-text');
    var sel = window.rangy.getSelection();
    var range = rangy.createRange();
    range.selectNodeContents(injectedText);
    range.setStart(injectedText.childNodes[0], startOffset);
    range.setEnd(injectedText.childNodes[0], endOffset);
    sel.removeAllRanges();
    sel.addRange(range);
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

function stopPropagation(event) {
    if (event.stopPropagation) {
        event.stopPropagation();
    } else {
        window.event.cancelBubble = true;
    }
}