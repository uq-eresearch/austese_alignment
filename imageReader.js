function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

var areaSelect = {};
var displayedPages = [];
var numberPages = 1;

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
            //var leafStr = '000';
            //var imgStr = (index+1).toString();
            //var re = new RegExp("0{"+imgStr.length+"}$");
            //var url = 'http://www.archive.org/download/BookReader/img/page'+leafStr.replace(re, imgStr) + '.jpg';
            if(getUrlVars()["url"]) {
              var url = decodeURIComponent(getUrlVars()["url"]);
            }
            return url;
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
        updateToolbarZoom : function(reduce) {
          var value;
          var autofit = null;

          if (this.mode == this.constMode2up) {
            autofit = this.twoPage.autofit;
          } else {
            autofit = this.onePage.autofit;
          }
    
          if (autofit) {
            value = autofit.slice(0,1).toUpperCase() + autofit.slice(1);
          } else {
            value = (100 / reduce).toFixed(2);
            value = value.replace(/0+$/,'');
            value = value.replace(/\.$/,'');
            value += '%';
          }
          jQuery('#BRzoom').text(value);

          var newIndices = diff(this.displayedIndices, displayedPages);
          var oldIndices = diff(displayedPages, this.displayedIndices);
          displayedPages = this.displayedIndices;
          if (getUrlVars()["editable"] == 'true') {          
            for (var i = 0; i < oldIndices.length; i++) {
              delete areaSelect['#pagediv' + oldIndices[i]];
            }
            for (var i = 0; i < newIndices.length; i++) {   
              var area = jQuery('#pagediv' + newIndices[i]).children().imgAreaSelect({
                handles: true,
                instance: true,
                parent: jQuery('#pagediv' + newIndices[i]),
                onSelectEnd: function(img, selection) {
                  jQuery('#imageX1').val((selection.x1 * 100)/jQuery(img).width());
                  jQuery('#imageY1').val((selection.y1 * 100)/jQuery(img).height());
                  jQuery('#imageX2').val((selection.x2 * 100)/jQuery(img).width());
                  jQuery('#imageY2').val((selection.y2 * 100)/jQuery(img).height());
                }
              });
              areaSelect['#pagediv' + newIndices[i]] = area;  
              jQuery('#pagediv' + newIndices[i]).children()
                  .mousedown(function() {
                      clearOtherSelection('#' + jQuery(this).parent().attr('id'));
                  })
                  .css("cursor","auto");
            }
            parent.window.jQuery.fn.showSelectedImage();
          } else {
            for (var i = 0; i < newIndices.length; i++) {
              jQuery('#pagediv' + newIndices[i]).children().click(function() {
                clearSelection();
                parent.window.jQuery.fn.clearObjectUrl();
                parent.window.jQuery.fn.clearSelectedText();
              });
            }
            if (newIndices.length > 0) {
                parent.window.jQuery.fn.refreshOrUpdateAnnotations();
            }
          }
        },
        getPageNum : function(index) {
            return index + 1;
        },
        numLeafs : numberPages,
        bookTitle : 'Image Viewer',
        bookUrl : 'http://austese.net',

        imagesBaseURL : '../BookReader/images/',

        getEmbedCode : function(frameWidth, frameHeight, viewParams) {
            return "Embed code not supported";
        }
    });

    br.init();

    // Limit the interfaces the user can see
    jQuery('.onepg').hide();
    jQuery('.twopg').hide();
    jQuery('.thumb').hide();
    jQuery('#BRpage').width(jQuery('#BRpage').width() - 118);
    jQuery('#BRnavpos').width(jQuery('#BRnavpos').width() + 118);
    jQuery('#BRtoolbar').hide();
    jQuery('#textSrch').hide();
    jQuery('#btnSrch').hide();

    if (getUrlVars()["editable"] == 'true') {
        jQuery('#BRcontainer').attr('onscroll','clearSelection();');
    }
});

function diff(array1, array2) {
    var res = [];
    for (var i = 0; i < array1.length; i++) {
      var val = array1[i];
      var indexOf = -1;
      for (var j = 0; j < array2.length && indexOf == -1; j++) {
        if (array2[j] == val){ 
          indexOf = j;
        }
      }
      if (indexOf == -1) {
        res.push(val);
      }
    }

    return res;
}

function getSelection() {
    for (var key in areaSelect) {
        var selection = areaSelect[key].getSelection();
        if (selection.width != 0 || selection.height != 0) {
            return areaSelect[key];
        }
    }
}

function clearSelection() {  
    clearSelectedImage();
    var sel = getSelection();
    if (sel) {
        sel.cancelSelection();
    }
}

function getOtherSelection(id) {
    for (var key in areaSelect) {
        if (id != key) {
            var selection = areaSelect[key].getSelection();
            if (selection.width != 0 || selection.height != 0) {
                return areaSelect[key];
            }
        }
    }
}

function clearOtherSelection(id) {
    var sel = getOtherSelection(id);
    if (sel) {
        sel.cancelSelection();
    }
}

function resetImage(x1, y1, x2, y2) {
    clearSelection();
    var img = jQuery(jQuery('#selectedImage').parent().find('img')[0]);
    var imgHeight = img.height();
    var imgWidth = img.width();

    var selection = areaSelect['#' + jQuery('#selectedImage').parent().attr('id')];
    selection.setOptions({
        show : true
    });
    selection.setSelection(((x1 * imgWidth)/100.00), ((y1 * imgHeight)/100.00), 
                ((x2 * imgWidth)/100.00), ((y2 * imgHeight)/100.00));
    selection.update();

    jQuery('#imageX1').val(x1);
    jQuery('#imageY1').val(y1);
    jQuery('#imageX2').val(x2);
    jQuery('#imageY2').val(y2);
}

function selectionVisible() {
    var selection = getSelection();
    return (selection) && (selection.getSelection().width > 0 || selection.getSelection().height > 0);
}

function focusImageSelection(img, sync, pageX, pageY) {
    if (img.getAttribute('selected') != 'selected') {
        clearSelectedImage();
        highlightImage(img);

        parent.window.jQuery.fn.cycleImageZIndex(img.getAttribute("id").substring(6));

        if (sync == true) {
            parent.window.jQuery.fn.setObjectUrl(img.getAttribute("objectUrl"));
            parent.window.jQuery.fn.cycleTextZIndex(img.getAttribute("id").substring(6));
            parent.window.jQuery.fn.setSelectedText(img.getAttribute("objectUrl"));
        }
    } else {
        clearSelectedImage();
        
        var nextElement = null;
        for (var i = 0; i < 1000 && nextElement == null; i++) {
            nextElement = document.elementFromPoint(pageX, pageY);
        }
        highlightImage(nextElement);

        parent.window.jQuery.fn.cycleImageZIndex(nextElement.getAttribute("id").substring(6));

        if (sync == true) {
            parent.window.jQuery.fn.setObjectUrl(nextElement.getAttribute("objectUrl"));
            parent.window.jQuery.fn.cycleTextZIndex(nextElement.getAttribute("id").substring(6));
            parent.window.jQuery.fn.setSelectedText(nextElement.getAttribute("objectUrl"));
        }
    }
}

function jumpToIndex(index) {
    br.jumpToIndex(index);
}

function setSelectedImage(objectUrl, index) {
    clearSelectedImage();
    br.jumpToIndex(index);
    highlightImageWhenAppears(objectUrl, 0)
}

function highlightImageWhenAppears(objectUrl, loopCount) { 
    if (loopCount >= 60) {
        return;
    }

    var img = jQuery("div[objectUrl='" + objectUrl + "']")[0];
    if (!img) {
        setTimeout(function(){highlightImageWhenAppears(objectUrl, loopCount + 1);},500);
    } else {
        highlightImage(img);
    }
}

function highlightImage(img) {
    if (img.className != 'entireImage') {
        img.style.border = '3px solid #CC66CC';
    } else {
        img.style.opacity = '0.2'; 
        img.style.filter = 'alpha(opacity=20)'; 
    }
    img.style.backgroundColor = 'rgb(127,0,127)';
    img.setAttribute('selected', 'selected');
}

function clearSelectedImage() {
    jQuery("[selected=selected]")
        .css("z-index","1");
    jQuery(".entireImage[selected=selected]")
        .css("background-color", "rgb(255,255,255)")
        .css("opacity", "0")
        .css("filter", "alpha(opacity=0)");
    jQuery("[selected=selected]:not(.entireImage)")
        .css("background-color", "rgb(127,127,0)")
        .css("border", "3px solid yellow");
    jQuery("[selected=selected]")
        .attr("selected", "");
}

function getSelectedObjectUrl() {
    var selectedDivs = jQuery("[selected=selected]");
    if (selectedDivs.length != 1) {
        return;
    }
    return selectedDivs[0].getAttribute('objectUrl');
}

function getImageUrls() {
    var imgUrls = [];
    for (var i = 0; i < numberPages; i++) {
        imgUrls.push(br.getPageURI(i,0,0));
    }
    return imgUrls;
}

function getDisplayedPages() {
    return displayedPages;
}
