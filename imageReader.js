function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

var areaSelect;

jQuery(document).ready(function() {
    br = new BookReader();
    jQuery.extend(br, {
        getPageWidth : function(index) {

            return 800;
        },

        getPageHeight : function(index) {
            return 1200;
        },
        getPageURI : function(index, reduce, rotate) {
            if (getUrlVars()["url"]) {
                return decodeURIComponent(getUrlVars()["url"]);
            } 
        },
        getPageSide : function(index) {
            if (0 == (index & 0x1)) {
                return 'R';
            } else {
                return 'L';
            }
        },
        getSpreadIndices : function(pindex) {
            var spreadIndices = [null, null];
            if ('rl' == this.pageProgression) {
                if (this.getPageSide(pindex) == 'R') {
                    spreadIndices[1] = pindex;
                    spreadIndices[0] = pindex + 1;
                } else {
                    spreadIndices[0] = pindex;
                    spreadIndices[1] = pindex - 1;
                }
            } else {
                if (this.getPageSide(pindex) == 'L') {
                    spreadIndices[0] = pindex;
                    spreadIndices[1] = pindex + 1;
                } else {
                    spreadIndices[1] = pindex;
                    spreadIndices[0] = pindex - 1;
                }
            }

            return spreadIndices;
        },
        getPageNum : function(index) {
            return index + 1;
        },
        numLeafs : 1,
        bookTitle : 'Image Viewer',
        bookUrl : 'http://austese.net',

        imagesBaseURL : '../BookReader/images/',

        getEmbedCode : function(frameWidth, frameHeight, viewParams) {
            return "Embed code not supported";
        }
    });

    br.init();

    jQuery('#BRtoolbar').hide();
    jQuery('#BRnav').hide();
    jQuery('#textSrch').hide();
    jQuery('#btnSrch').hide();

    if (getUrlVars()["editable"] == 'true') {
        areaSelect = jQuery('#pagediv0').children().imgAreaSelect({
            handles : true,
            instance : true,
            onSelectEnd : function(img, selection) {
                jQuery('#offsetX').val(Math.round(jQuery(img).offset().left));
                jQuery('#imageX1').val(selection.x1);
                jQuery('#imageY1').val(selection.y1);
                jQuery('#imageX2').val(selection.x2);
                jQuery('#imageY2').val(selection.y2);
                jQuery('#imageWidth').val(selection.width);
                jQuery('#imageHeight').val(selection.height);
            }
        });
    } else {
        jQuery('#pagediv0').children().click(function() {
            jQuery("[selected=selected]").attr("selected", "").css("background-color", "rgb(127,127,0)").css("border", "3px solid yellow");
            parent.window.jQuery.fn.clearObjectUrl();
            parent.window.jQuery.fn.clearSelectedText();
        });
    }
});

function resetImage(x1, y1, x2, y2) {
    areaSelect.setOptions({
        show : true
    });
    areaSelect.setSelection(x1, y1, x2, y2);
    areaSelect.update();
}

function selectionVisible() {
    return !(areaSelect.getSelection().width == 0 && areaSelect.getSelection().height == 0);
}

function focusImageSelection(img, sync) {
    if (img.getAttribute('selected') != 'selected') {
        jQuery("[selected=selected]").attr("selected", "").css("background-color", "rgb(127,127,0)").css("border", "3px solid yellow");
        img.style.border = '3px solid purple';
        img.style.backgroundColor = 'rgb(127,0,127)';
        img.setAttribute('selected', 'selected');

        if (sync == true) {
            parent.window.jQuery.fn.setObjectUrl(img.getAttribute("objectUrl"));
            parent.window.jQuery.fn.setSelectedText(img.getAttribute("objectUrl"));
        }
    }
}

function setSelectedImage(objectUrl) {
    jQuery("[selected=selected]").attr("selected", "").css("background-color", "rgb(127,127,0)").css("border", "3px solid yellow");

    var img = jQuery("[objectUrl='" + objectUrl + "']")[0];
    img.style.border = '3px solid purple';
    img.style.backgroundColor = 'rgb(127,0,127)';
    img.setAttribute('selected', 'selected');
}

function clearSelectedImage() {
    jQuery("[selected=selected]").attr("selected", "").css("background-color", "rgb(127,127,0)").css("border", "3px solid yellow");
}

function getSelectedObjectUrl() {
    var selectedDivs = jQuery("[selected=selected]");
    if (selectedDivs.length != 1) {
        return;
    }
    return selectedDivs[0].getAttribute('objectUrl');
}