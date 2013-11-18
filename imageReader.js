function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

var areaSelect;
var displayedPages = [];
var numberPages = 1;

var url, uris, editable, next, prev;

function setEditable(bool) {
    editable = bool;
    if (editable) {
    	if (areaSelect) {
    		areaSelect.remove();
    		delete areaSelect;
    		jQuery('#selectedImage').remove();  
    	}  	
    	
    	areaSelect = jQuery('#pagediv0').children().imgAreaSelect({
            handles: true,
            instance: true,
            parent: jQuery('#pagediv0'),
            onSelectEnd: function(img, selection) {
              jQuery('#imageX1').val((selection.x1 * 100)/jQuery(img).width());
              jQuery('#imageY1').val((selection.y1 * 100)/jQuery(img).height());
              jQuery('#imageX2').val((selection.x2 * 100)/jQuery(img).width());
              jQuery('#imageY2').val((selection.y2 * 100)/jQuery(img).height());
            }
        });
    	
    	$('#BRpager').slider( "option", "disabled", true );
    } else {
    	if (areaSelect) {
    		areaSelect.remove();
    		delete areaSelect;
    		jQuery('#selectedImage').remove();  
    	}  	
    	
    	jQuery('#pagediv0').children().css("cursor","move");
    	$('#BRpager').slider( "option", "disabled", false );
    	var parentElement = jQuery("#pagediv0").parent();
    	var html = jQuery("#pagediv0")[0].outerHTML;
    	jQuery("#pagediv0").remove();
    	parentElement.append(html);
    	
    	jQuery('#pagediv0').children().mousedown(function() {
    		clearSelection();
            parent.window.jQuery.fn.clearObjectUrl();
            parent.window.jQuery.fn.clearSelectedText();
        });
    }
}

function getFacsimilesFromArtefact(artefactID, treePath) {
  if (treePath.indexOf(artefactID) != -1) {
    return;
  }
  treePath.push(artefactID);
  jQuery.ajax({
    url : '/sites/all/modules/austese_repository/api/artefacts/' + artefactID,
    type : 'GET',
    timeout: 60000,
    async: false,
    processData: false,
    headers: {
        'Content-Type': 'application/json'
    },
    success : function(res) {    
      var facsimiles = res.facsimiles;
      for (var i in facsimiles) {
        uris.push(facsimiles[i]);
      }
      var artefacts = res.artefacts;
      for (var i in artefacts) {
        getFacsimilesFromArtefact(artefacts[i], treePath);
      }
    },
    error : function(xhr, status, error) {
       console.log("Error retrieving artefacts",error, xhr,status);
    }
  });
}

jQuery(document).ready(function() {
    editable = getUrlVars()["editable"] == 'true';
    br = new BookReader();
    
    url = decodeURIComponent(getUrlVars()["url"])
    url = url.substring(url.lastIndexOf("/") + 1);

    uris = [];

    jQuery.ajax({
        url : '/sites/all/modules/austese_repository/api/artefacts/?type=image&pageSize=1&searchField=facsimiles&query=' + url,
        type : 'GET',
        async: false,
        processData: false,
        headers: {
            'Content-Type': 'application/json'
        },
        success : function(res) {
          if (res && res.results && res.results.length == 1) {
            var artefactID = res.results[0].id;
            var rootFound = false;
            var artefacts = [];
            var facsimiles = res.results[0].facsimiles;
            
            var treePath = [artefactID];
            
            while (!rootFound) {
              jQuery.ajax({
                url : '/sites/all/modules/austese_repository/api/artefacts/?type=image&pageSize=1&searchField=artefacts&query=' + artefactID,
                type : 'GET',
                timeout: 60000,
                async: false,
                processData: false,
                headers: {
                    'Content-Type': 'application/json'
                },
                success : function(res) {
                  if (res && res.results && res.results.length == 1) {
                    jQuery.ajax({
                      url : '/sites/all/modules/austese_repository/api/artefacts/' + res.results[0].id,
                      type : 'GET',
                      timeout: 60000,
                      async: false,
                      processData: false,
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      success : function() {
                        artefactID = res.results[0].id;
                        
                        if (treePath.indexOf(artefactID) != -1) {
                          rootFound = true;
                        } else {
                          treePath.push(artefactID);
                          artefacts = res.results[0].artefacts;
                          if (res.results[0].facsimiles) {
                            facsimiles = res.results[0].facsimiles;
                          } else {
                            facsimiles = []
                          }
                        }
                      },
                      error : function(xhr, status, error) {
                        rootFound = true;
                      }
                    });
                  } else {
                    rootFound = true;
                  }
                },
                error : function(xhr, status, error) {
                   console.log("Error retrieving artefacts",error, xhr,status);
                }
              });
            }

            treePath = [];

            for (var i = 0; i < artefacts.length; i++) {
              getFacsimilesFromArtefact(artefacts[i], treePath);
            }
          }
        },
        error : function(xhr, status, error) {
           console.log("Error retrieving artefacts",error, xhr,status);
        }
    });

    jQuery.extend(br, {
        prev : function() {
            if (prev && !editable) {
              jQuery.ajax({
                  url : '/sites/all/modules/austese_repository/api/resources/' + prev,
                  type : 'GET',
                  timeout: 60000,
                  async: false,
                  processData: false,
                  headers: {
                      'Accept': 'application/json'
                  },
                  success : function(res) {
                      url = res.id;
                      initBookreader();
                      
                      parent.window.jQuery.fn.redirectImageReader(res);
                  },
                  error : function(xhr, status, error) {
                     console.log("Error retrieving resource",error, xhr,status);
                  }
              });
            }
        },
        next : function() {
            if (next && !editable) {
              jQuery.ajax({
                  url : '/sites/all/modules/austese_repository/api/resources/' + next,
                  type : 'GET',
                  timeout: 60000,
                  async: false,
                  processData: false,
                  headers: {
                      'Accept': 'application/json'
                  },
                  success : function(res) {                      
                      url = res.id;
                      initBookreader();
                      
                      parent.window.jQuery.fn.redirectImageReader(res);
                  },
                  error : function(xhr, status, error) {
                     console.log("Error retrieving resource",error, xhr,status);
                  }
              });
            }
        },
        getPageWidth : function(index) {
            return 800;
        },

        getPageHeight : function(index) {
            return 1200;
        },
        getPageURI : function(index, reduce, rotate) {
            return "/sites/all/modules/austese_repository/api/resources/" + url;
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

          displayedPages = this.displayedIndices;
          if (editable) {     
        	  if (areaSelect) {
        		  areaSelect.remove();
              	  delete areaSelect;
        	  }
              areaSelect = jQuery('#pagediv0').children().imgAreaSelect({
	            handles: true,
	            instance: true,
	            parent: jQuery('#pagediv0'),
	            onSelectEnd: function(img, selection) {
	              jQuery('#imageX1').val((selection.x1 * 100)/jQuery(img).width());
	              jQuery('#imageY1').val((selection.y1 * 100)/jQuery(img).height());
	              jQuery('#imageX2').val((selection.x2 * 100)/jQuery(img).width());
	              jQuery('#imageY2').val((selection.y2 * 100)/jQuery(img).height());
	            }
	          });
	          jQuery('#pagediv0').children().css("cursor","auto");
              parent.window.jQuery.fn.showSelectedImage();
          } else {
              jQuery('#pagediv0').children().click(function() {
                clearSelection();
                parent.window.jQuery.fn.clearObjectUrl();
                parent.window.jQuery.fn.clearSelectedText();
              });
              parent.window.jQuery.fn.refreshOrUpdateAnnotations();
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
        },
        initNavbar : function() {
          $('#BookReader').append(
              '<div id="BRnav">'
              +     '<div id="BRpage">'   // Page turn buttons
              +         '<button class="BRicon onepg"></button>'
              +         '<button class="BRicon twopg"></button>'
              +         '<button class="BRicon thumb"></button>'
              // $$$ not yet implemented
              //+         '<button class="BRicon fit"></button>'
              +         '<button class="BRicon zoom_in"></button>'
              +         '<button class="BRicon zoom_out"></button>'
              +         '<button class="BRicon book_left"></button>'
              +         '<button class="BRicon book_right"></button>'
              +     '</div>'
              +     '<div id="BRnavpos">' // Page slider and nav line
              //+         '<div id="BRfiller"></div>'
              +         '<div id="BRpager"></div>'  // Page slider
              +         '<div id="BRnavline">'      // Nav line with e.g. chapter markers
              +             '<div class="BRnavend" id="BRnavleft"></div>'
              +             '<div class="BRnavend" id="BRnavright"></div>'
              +         '</div>'     
              +     '</div>'
              +     '<div id="BRnavCntlBtm" class="BRnavCntl BRdn"></div>'
              + '</div>'
          );

          $('#BRpager').slider({
              animate: true,
              min: 0,
              max: (uris.length != 0) ? uris.length - 1 : 1,
              value: (uris.length != 0) ? uris.indexOf(url) - 1 : 0
          })
          .bind('slide', function(event, ui) {
              if (uris.length != 0) {
                $('#pagenum .currentpage').text(ui.value + 1 + ' / ' + uris.length);
              } else {
                $('#pagenum .currentpage').text('1/1');
              }
              $("#pagenum").show();
              return true;
          })
          .bind('slidechange', function(event, ui) {
              if (uris.length != 0) {
                $('#pagenum .currentpage').text(ui.value + 1 + ' / ' + uris.length);
              } else {
                $('#pagenum .currentpage').text('1/1');
              }
              $("#pagenum").hide();
              
              jQuery.ajax({
                  url : '/sites/all/modules/austese_repository/api/resources/' + uris[ui.value],
                  type : 'GET',
                  async: false,
                  processData: false,
                  headers: {
                      'Accept': 'application/json'
                  },
                  success : function(res) {
                      res.uri = res.uri;
                      
                      url = res.id;
                      initBookreader();
                      
                      parent.window.jQuery.fn.redirectImageReader(res);
                  },
                  error : function(xhr, status, error) {
                     console.log("Error retrieving resource",error, xhr,status);
                  }
              });
              
              return true;
          })
          .hover(function() {
                  $("#pagenum").show();
              },function(){
                  $("#pagenum").hide();
              }
          );
          
          var handleHelper = $('#BRpager .ui-slider-handle')
            .append('<div id="pagenum"><span class="currentpage"></span></div>');
          
          if (uris.length != 0) {
            $('#pagenum .currentpage').text(uris.indexOf(url) + 1 + ' / ' + uris.length);
          } else {
            $('#pagenum .currentpage').text('1/1');
          }

          $("#BRzoombtn").draggable({axis:'y',containment:'parent'});
        }
    });

    initBookreader();
});

function initBookreader() {
    var index = uris.indexOf(url);
    if (index != -1) {
      if (index != 0) {
        prev = uris[index - 1];
      } else {
        prev = '';
      }
      if (index != uris.length - 1) {
        next = uris[index + 1];
      } else {
        next = '';
      }
    }

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

    if (editable) {
        jQuery('#BRcontainer').attr('onscroll','clearSelection();');
    }
    jQuery('#pagediv0').children().click(function() {
        clearSelection();
        parent.window.jQuery.fn.clearObjectUrl();
        parent.window.jQuery.fn.clearSelectedText();
    });
}

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
	if (!areaSelect) {
		return null;
	}
    var selection = areaSelect.getSelection();
    if (selection.width != 0 || selection.height != 0) {
        return areaSelect;
    }
}

function clearSelection() {  
    clearSelectedImage();
    var sel = getSelection();
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
    //br.jumpToIndex(index);
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
