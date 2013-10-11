(function($) {
    var alignmentsInMemory = [];
    var loadingAnnotations = false;
    var repositoryModulePath = jQuery('#metadata').data('repmodulepath');
    var metadata = jQuery('#metadata');
    var modulePath = metadata.data('module');
    var project = metadata.data('project');
    var left = metadata.data('lhs');
    var right = metadata.data('rhs');

    // Refresh the text and image iframe with annotations
    function reloadAnnotations() {
        var imageData = jQuery('#lhs-select').select2("data");
        var textData = jQuery('#rhs-select').select2("data");
        var textUrl;
        var dummy = false;
        if (!imageData){
            dummy = true;
            imageData = {uri: '/' + modulePath + '/resources/dummy.png'};
        }
        if (!textData){
            textData = {uri: '/' +  modulePath + '/resources/dummy.txt'};
            textUrl = '/' +  modulePath + '/resources/dummy.txt';
            textUrlRaw = textUrl;
            dummy = true;
        } else {
            textUrl = '/repository/resources/' + textData.id + "/content";
            textUrlRaw = textUrl + "/raw"
        }
        var imageUrl = qualifyURL(imageData.uri);
        var textUrl = qualifyURL(textData.uri);
        if (!dummy){
            document.getElementById('text-input').contentWindow.setEditable(false);
            jQuery('#image-input').on('load',function(e) {
                // Remove onload functions
                jQuery('#image-input').off();
                jQuery('#text-input').off();
                loadAnnotations(textUrl);
            }).attr('src',"/" + modulePath
                + "/imageReader.html?ui=embed&url="
                + encodeURIComponent(imageUrl)
            );
        }
    }
    // create fully qualified URL from relative URL
    function qualifyURL(url) {
        var a = document.createElement('a');
        a.href= url;
        return a.href;
    }
    
    function indexOf(array, element) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == element){ 
                return i;
            }
        }
        return -1;
    }
    
    function refreshAnnotations() {
        var imageData = jQuery('#lhs-select').select2("data");
        var textData = jQuery('#rhs-select').select2("data");
        var textUrl;
        var dummy = false;
        if (!imageData){
            dummy = true;
            imageData = {uri: '/' + modulePath + '/resources/dummy.png'};
        }
        if (!textData){
            textData = {uri: '/' +  modulePath + '/resources/dummy.txt'};
            textUrl = '/' +  modulePath + '/resources/dummy.txt';
            textUrlRaw = textUrl;
            dummy = true;
        } else {
            textUrl = '/repository/resources/' + textData.id + "/content";
            textUrlRaw = textUrl + "/raw"
        }
        var imageUrl = qualifyURL(imageData.uri);
        var textUrl = qualifyURL(textData.uri);
        if (!dummy){
          loadAnnotations(textUrl);
        }
    }
    
    function clearAnnotations() {
        jQuery("#image-input").contents().find('.imgAlignment').remove();
        jQuery("#text-input").contents().find('.textAlignment').remove();
        alignmentsInMemory = [];
    }

    // Load annotations for a given image and text
    // READ MODE
    function loadAnnotations(textUrl) {
        if (!loadingAnnotations && mode == READ_MODE) {
            console.log("load annotations",textUrl)
            loadingAnnotations = true;
            // remove all existing alignments
            clearAnnotations();

            if (!jQuery("#image-input")[0].contentWindow.getImageUrls) {
              // Still Loading
              loadingAnnotations = false;
              return;
            }
            
            var imgs = jQuery("#image-input")[0].contentWindow.getImageUrls();

            jQuery.ajax({
                    url : '/lorestore/oa/?matchval=' + textUrl + '&asTriples=false',
                    type : 'GET',
                    async : false,
                    contentType : "application/rdf+xml",
                    success : function(res) {
                        console.log("got annotations",res)
                        var patt1 = "#xpath=[^=#,]+,[^=#,]+#char=[0-9]+,[0-9]+$";
                        var patt2 = "#xywh=[\\.0-9]+,[\\.0-9]+,[\\.0-9]+,[\\.0-9]+$";
                        var patt3 = /[^=#,]+/g;
                        var patt4 = /[\.0-9]+/g;
                        
                        for ( var i = 0; i < res.childNodes.length; i++) {
                            var length = res.childNodes[i].childNodes.length;
                            for ( var j = 0; j < length; j++) {
                                if ('getElementsByTagName' in res.childNodes[i].childNodes[j]) {
                                    var hasTargets = res.childNodes[i].childNodes[j]
                                            .getElementsByTagName('hasTarget');
                                    if (hasTargets.length == 2) {
                                        var startOffset = -1;
                                        var startOffsetXpath = '';
                                        var endOffset = -1;
                                        var endOffsetXpath = '';
                                        var x = -1;
                                        var y = -1;
                                        var w = -1;
                                        var h = -1;
                                        var src = '';
                                        var pageIndex = -1;

                                        var objectUrl = res.childNodes[i].childNodes[j].getAttribute('rdf:about');
                                        var annotationID = objectUrl.substring(objectUrl.lastIndexOf("/") + 1);
  
                                        var res1 = hasTargets[0]
                                                .getAttribute('rdf:resource');
                                        var res2 = hasTargets[1]
                                                .getAttribute('rdf:resource');

                                        var matchs;
                                        var numbers;
                                        if (res1.match(patt1) && res1.substring(0, textUrl.length) === textUrl) {
                                          matchs = res1.match(patt1);
                                          results = matchs.toString().match(patt3);
                                          if (results.length == 6) {
                                              startOffset = results[4];
                                              startOffsetXpath = results[1];
                                              endOffset = results[5];
                                              endOffsetXpath = results[2];
                                          }
                                        }

                                        if (res1.match(patt2)) {
                                            jQuery(imgs).each(function(index, element) {
                                                if (res1.match(patt2) && res1.indexOf(element) != -1) {
                                                    matchs = res1.match(patt2);
                                                    numbers = matchs.toString()
                                                            .match(patt4);
                                                    if (numbers.length == 4) {
                                                        x = numbers[0];
                                                        y = numbers[1];
                                                        w = numbers[2];
                                                        h = numbers[3];
    
                                                        src = element;
                                                        pageIndex = indexOf(imgs, element);
                                                    }
                                                }
                                            });
                                        }

                                        if (res2.match(patt1) && res2.substring(0,
                                                textUrl.length) === textUrl) {
                                            matchs = res2.match(patt1);
                                            results = matchs.toString()
                                                    .match(patt3);
                                            if (results.length == 6) {
                                                startOffset = results[4];
                                                startOffsetXpath = results[1];
                                                endOffset = results[5];
                                                endOffsetXpath = results[2];
                                            }
                                        }


                                        if (res2.match(patt2)) {
                                            jQuery(imgs).each(function(index, element) {
                                                if (res2.match(patt2) && res2.indexOf(element) != -1) {
                                                    matchs = res2.match(patt2);
                                                    numbers = matchs.toString()
                                                            .match(patt4);
                                                    if (numbers.length == 4) {
                                                        x = numbers[0];
                                                        y = numbers[1];
                                                        w = numbers[2];
                                                        h = numbers[3];

                                                        src = element;
                                                        pageIndex = indexOf(imgs, element);
                                                    }
                                                }
                                            });
                                        }

                                        if (startOffset != -1
                                                && startOffsetXpath != ''
                                                && endOffset != -1
                                                && endOffsetXpath != '' && x != -1
                                                && y != -1 && w != -1 && h != -1) {
                                            addImageAndText(annotationID,
                                                    objectUrl,  src, pageIndex,
                                                    x, y, w, h,
                                                    startOffset, startOffsetXpath,
                                                    endOffset, endOffsetXpath,
                                                    false);
                                        }
                                    }
                                }
                            }
                        }
                        loadingAnnotations = false;
                    },
                    error : function(xhr, testStatus, error) {
                        if (console && console.log) {
                            console.log("Error occured: " + error, xhr, testStatus);
                        }
                        loadingAnnotations = false;
                        return;
                    }
            });
            
        }
    }

    // Add a given image and text annotation to the image and text iframe
    // READ MODE
    function addImageAndText(annotationID, objectUrl, src, index, x, y, w, h, startOffset,
            startOffsetXpath, endOffset, endOffsetXpath, editable) {
        var img = jQuery(jQuery("#image-input").contents().find('img[src="' + src + '"]')[0]);
        var imgHeight = img.height();
        var imgWidth = img.width();

        var rectDiv = jQuery("<div></div>");

        if (editable == true) {
            rectDiv.attr('id', 'selectedImage').attr(
                    'onclick',
                    'resetImage(' + x  + ',' + y + ','
                            + (parseFloat(x, 10) + parseFloat(w, 10)) + ','
                            + (parseFloat(y, 10) + parseFloat(h, 10)) + ')');
            jQuery('#imageX').val(x);
            jQuery('#imageY').val(y);
            jQuery('#imageW').val(w);
            jQuery('#imageH').val(h);
            jQuery('#image-selection').html(
                    "Image Selection " + Math.round((w * imgWidth) / 100)  + " x " 
                    + Math.round((h * imgHeight) / 100) + " px");
        } else {
            rectDiv.attr('id', 'Image_' + annotationID).addClass('imgAlignment');
        }

        if (w == 0 && h == 0) {
            rectDiv.attr('objectUrl', objectUrl).attr('x', x).attr('y', y)
                    .attr('w', w).attr('h', h).attr('class','entireImage').css({
                        'position' : 'absolute',
                        'overflow-x' : 'hidden',
                        'overflow-y' : 'hidden',
                        'z-index' : '2',
                        'x' : 0,
                        'y' : 0,
                        'w' : 0,
                        'h' : 0,
                        'display' : 'block',
                        'opacity' : '0',
                        'filter' : 'alpha(opacity=0)',
                        'background-color' : 'rgb(255, 255, 255)',
                        'cursor' : 'pointer',
                        'left' : 0,
                        'top' : 0,
                        'width' : '100%',
                        'height' : '100%'
                    });
        } else {
            rectDiv.attr('objectUrl', objectUrl).attr('x', x).attr('y', y)
                    .attr('w', w).attr('h', h).css({
                        'position' : 'absolute',
                        'overflow-x' : 'hidden',
                        'overflow-y' : 'hidden',
                        'z-index' : '2',
                        'x' : x,
                        'y' : y,
                        'w' : w,
                        'h' : h,
                        'display' : 'block',
                        'opacity' : '0.4',
                        'filter' : 'alpha(opacity=40)',
                        'background-color' : 'rgb(127, 127, 0)',
                        'cursor' : 'pointer',
                        'border' : '3px solid yellow',
                        'left' : ((x * imgWidth) / 100.00) + 'px',
                        'top' : ((y * imgHeight) / 100.00) + 'px',
                        'width' : (((w * imgWidth) / 100.00) - 6) + 'px',
                        'height' : (((h * imgHeight) / 100.00) - 6) + 'px'
                    });        
        }
        if (img && img.length == 1) {
            var pagediv = img.parent();
            if (editable == true && w == 0 && h == 0) {
                clearImageSelection();
            } else {
                jQuery("#image-input").contents().find('img[src="' + src + '"]').parent().append(rectDiv);
                
                if (editable == false) {
                    rectDiv.on('click', function(e){
                        var image_iframe = document.getElementById('image-input');
                        image_iframe.contentWindow.focusImageSelection(this, true, e.pageX, e.pageY);
                    });
                }
            }
        } else {
            return;
        }

        var verticalOffset = 30;
        var text_iframe = document.getElementById('text-input');
        var containerDiv = text_iframe.contentWindow.document
                .getElementById('container-div-2');

        var selectedText = "No selection: alignment will default to entire text";
        var startElement = lookupElementByXPath(startOffsetXpath);
        var endElement = lookupElementByXPath(endOffsetXpath);
        
        if (startElement == null || endElement == null) {
            rectDiv.remove();
            return;
        }
    
        var range;
        var sel = text_iframe.contentWindow.rangy.getSelection();
        var range = text_iframe.contentWindow.rangy.createRange();
        range.selectNodeContents(containerDiv);
        if (startElement != containerDiv || endElement != containerDiv) {
            range.setStart(startElement, parseInt(startOffset));
            range.setEnd(endElement, parseInt(endOffset));
            if (range.textRange) {
                selectedText = range.textRange.text
            } else {
                selectedText = range.toString();
            }
        }
        sel.removeAllRanges();
        sel.addRange(range);

        range.collapse(true);

        var markerTextChar = "\ufeff";
        var markerTextCharEntity = "&#xfeff;";
        var markerEl;
        var markerId = "sel_" + new Date().getTime() + "_"
                + Math.random().toString().substr(2);

        markerEl = text_iframe.contentWindow.document.createElement("span");
        markerEl.id = markerId;
        markerEl.appendChild(text_iframe.contentWindow.document
                .createTextNode(markerTextChar));
        range.insertNode(markerEl);

        verticalOffset = markerEl.offsetTop;
        var parent = markerEl.parentNode;
        parent.removeChild(markerEl);
        parent.normalize();

        var image = jQuery(text_iframe.contentWindow.document.createElement("img"));
        if (editable == true) {
            image.attr('id', 'link_image');
            image.addClass('textAlignment');

            document.getElementById('textStartOffset').value = startOffset;
            document.getElementById('startOffsetXpath').value = startOffsetXpath;
            document.getElementById('textEndOffset').value = endOffset;
            document.getElementById('endOffsetXpath').value = endOffsetXpath;
            if (selectedText.toString().length > 60) {
                var beginsWith = selectedText.toString().substring(0, 30);
                var endsWith = selectedText.toString().substring(
                        selectedText.toString().length - 20);
                jQuery('#text-selection').html(
                        beginsWith + "..." + endsWith);
            } else {
                jQuery('#text-selection').html(selectedText.toString());
            }
        } else {
            image.attr('id', 'Text_' + annotationID).addClass('textAlignment');
        }
        rectDiv.attr('objectUrl', objectUrl);
        image.attr('style', 'position: absolute; left: 6px; top: '
                + verticalOffset + 'px; cursor: pointer; z-index: 2;');
        image.attr('height', '16');
        image.attr('width', '16');
        image.attr('objectUrl', objectUrl);
        image.attr('src', 'resources/link_black.png');
        image.attr('startOffset', startOffset);
        image.attr('startOffsetXpath', startOffsetXpath);
        image.attr('endOffset', endOffset);
        image.attr('endOffsetXpath', endOffsetXpath);
        image.attr('index', index);

        jQuery(text_iframe.contentWindow.document.getElementById('svg-links')).append(image);

        if (editable == false) {
            image.on('click', function(e){
                text_iframe.contentWindow.highlightImage(this, true, e.pageX, e.pageY);
                e.stopPropagation();
                //text_iframe.contentWindow.focusImageSelection(this, true, e.pageX, e.pageY);
            });
        }
        
        if (text_iframe.contentWindow.getSelection) {
            if (text_iframe.contentWindow.getSelection().empty) {
                text_iframe.contentWindow.getSelection().empty();
            } else if (text_iframe.contentWindow.getSelection().removeAllRanges) {
                text_iframe.contentWindow.getSelection().removeAllRanges();
            }
        } else if (text_iframe.contentWindow.document.selection) {
            text_iframe.contentWindow.document.selection.empty();
        }

        alignmentsInMemory.push(annotationID);
    }

    // Refresh the image reader with the images from the search bar
    function updateImageReader(arg) {
        console.log("update image reader",arg)
        if (arg && arg.added && arg.added.uri){
            var newImageUrl = arg.added.uri;
            clearImageSelection();
            var imageReaderUrl = "/" + modulePath
                + "/imageReader.html?ui=embed&url="
                + encodeURIComponent(newImageUrl);
            if (mode != READ_MODE) {
                imageReaderUrl += "&editable=true";
            }

            jQuery('#image-input').on('load',function(e) {
                if (mode == READ_MODE) {
                    refreshAnnotations();
                }
            }).attr('src', imageReaderUrl);
        }
    }

    jQuery.fn.redirectImageReader = function(obj) {
        updateImageReader({"added" : obj});
        $("#lhs-select").select2("data", obj);
    }
    
    // Refresh the text reader with the text from the search bar
    function updateTextReader(arg) {
        if (arg && arg.added && arg.added.uri){
            var newTextUrl = arg.added.uri;
    
            clearTextSelection();
            var textReaderUrl = "/" + modulePath
                + "/textReader.html?ui=embed&url="
                + encodeURIComponent(newTextUrl);
            if (mode != READ_MODE) {
                textReaderUrl += "&editable=true";
            }

            jQuery('#text-input').on('load',function(e) {
                if (mode == READ_MODE) {
                    refreshAnnotations();
                }
            }).attr('src',textReaderUrl);
        }
    }

    // Set the objectUrl in memory
    // READ MODE
    jQuery.fn.cycleImageZIndex = function(id) {
        var maxZ = 0;
        jQuery(alignmentsInMemory).each(function(index, element) {
            var img = jQuery("#image-input").contents().find('#Image_' + element);
            var newZ = parseInt(img.css('z-index')) + 1;
            if (newZ > maxZ) {
                maxZ = newZ;
            }
            img.css('z-index', newZ);
        });
        var img = jQuery("#image-input").contents().find('#Image_' + id);
        img.css('z-index', maxZ + 1);
    }

    // Set the objectUrl in memory
    // READ MODE
    jQuery.fn.cycleTextZIndex = function(id) {
        var maxZ = 0;
        jQuery(alignmentsInMemory).each(function(index, element) {
            var img = jQuery("#text-input").contents().find('#Text_' + element);

            var newZ = parseInt(img.css('z-index')) + 1;
            if (newZ > maxZ) {
                maxZ = newZ;
            }
            img.css('z-index', newZ);
        });
        var img = jQuery("#text-input").contents().find('#Text_' + id);
        img.css('z-index', maxZ + 1);
    }

    // Set the objectUrl in memory
    // READ MODE
    jQuery.fn.setObjectUrl = function(objectUrl) {
        jQuery('#objectUrl').val(objectUrl);
    }

    // Set the selected text annotation in the text iframe
    // READ MODE
    jQuery.fn.setSelectedText = function(objectUrl) {
        var text_iframe = document.getElementById('text-input');
        text_iframe.contentWindow.setSelectedText(objectUrl);
    }

    // Set the selected image annotation in the image iframe
    // READ MODE
    jQuery.fn.setSelectedImage = function(objectUrl, index) {
        var image_iframe = document.getElementById('image-input');
        image_iframe.contentWindow.setSelectedImage(objectUrl, index);
    }

    // Clear the objectUrl in memory
    // READ MODE
    jQuery.fn.clearObjectUrl = function() {
        jQuery('#objectUrl').val('');
    }

    // Clear the selected text annotation in the text iframe
    // READ MODE
    jQuery.fn.clearSelectedText = function() {
        var text_iframe = document.getElementById('text-input');
        text_iframe.contentWindow.clearSelectedText();
    }

    // Clear the selected image annotation in the image iframe
    // READ MODE
    jQuery.fn.clearSelectedImage = function() {
        var image_iframe = document.getElementById('image-input');
        image_iframe.contentWindow.clearSelectedImage();
    }

    // Refresh the text and image iframe with annotations
    // READ MODE
    jQuery.fn.refreshOrUpdateAnnotations = function() {
        refreshAnnotations();
    }

    // Check if the selected area should be visible
    // READ MODE
    jQuery.fn.showSelectedImage = function() {
        // FIXME!!!
        if (jQuery('#image-input').contents().find('#selectedImage').length == 0 
                && jQuery('#image-input').contents().find('img[src = "' 
                        + jQuery('#imageUrl').val() + '"]').length == 1 
                && jQuery('#imageW').val() != 0 
                && jQuery('#imageH').val() != 0) {
            var img = jQuery("#image-input").contents().find('img[src="' + jQuery('#imageUrl').val() + '"]')
            var imgHeight = img.height();
            var imgWidth = img.width();

            var rectDiv = jQuery(document.getElementById('image-input').contentWindow.document
                .createElement("div"));

            var objectUrl = jQuery('#objectUrl').val();
            var x = jQuery('#imageX').val();
            var y = jQuery('#imageY').val();
            var w = jQuery('#imageW').val();
            var h = jQuery('#imageH').val();

            rectDiv.attr('id', 'selectedImage').attr(
                    'onclick',
                    'resetImage(' + x + ',' + y + ','
                            + (parseFloat(x,10) + parseFloat(w,10)) + ','
                            + (parseFloat(y,10) + parseFloat(h,10)) + ')');

            jQuery('#imageX').val(x);
            jQuery('#imageY').val(y);
            jQuery('#imageW').val(w);
            jQuery('#imageH').val(h);
            jQuery('#image-selection').html(
                    "Image Selection " + Math.round((w * imgWidth) / 100)  + " x " 
                    + Math.round((h * imgHeight) / 100) + " px");
        
            rectDiv.attr('objectUrl', objectUrl).attr('x', x).attr('y', y)
                .attr('w', w).attr('h', h).css({
                    'position' : 'absolute',
                    'overflow-x' : 'hidden',
                    'overflow-y' : 'hidden',
                    'z-index' : '2',
                    'x' : x,
                    'y' : y,
                    'w' : w,
                    'h' : h,
                    'display' : 'block',
                    'opacity' : '0.4',
                    'filter' : 'alpha(opacity=40)',
                    'background-color' : 'rgb(127, 127, 0)',
                    'cursor' : 'pointer',
                    'border' : '3px solid yellow',
                    'left' : ((x / 100.00) * imgWidth) + 'px',
                    'top' : ((y / 100.00) * imgHeight) + 'px',
                    'width' : (((w / 100.00) * imgWidth) - 6) + 'px',
                    'height' : (((h / 100.00) * imgHeight) - 6) + 'px'
            });
            rectDiv.appendTo(jQuery('#image-input').contents()
                .find('img[src = "' + jQuery('#imageUrl').val() + '"]').parent()[0]);
        }
    }

    // Set the highlighted text in the text frame
    // TESTING
    jQuery.fn.highlightText = function(startOffset, endOffset) {
        var text_iframe = document.getElementById('text-input');
        text_iframe.contentWindow.focusTextOffsets(startOffset, endOffset);
    }

    // Clear the current selected image in memory
    // READ/CREATE/EDIT MODE
    function clearImageSelection() {
        jQuery('#imageX').val(0);
        jQuery('#imageY').val(0);
        jQuery('#imageW').val(0);
        jQuery('#imageH').val(0);
        jQuery('#image-selection')
            .html("No selection: alignment will default to entire image");
    }

    // Clear the current selected text link in memory
    // READ/CREATE/EDIT MODE
    function clearTextSelection() {
        jQuery('#textStartOffset').val(0);
        jQuery('#startOffsetXpath').val('/html[1]/body[1]/div[2]');
        jQuery('#textEndOffset').val(2);
        jQuery('#endOffsetXpath').val('/html[1]/body[1]/div[2]');
        jQuery('#text-selection')
            .html("No selection: alignment will default to entire text");
    }

    // Get the current selected image area in memory from the selected image in the image iframe
    // CREATE/EDIT MODE
    function updateImageSelection() {
        var image_iframe = document.getElementById('image-input');

        var selectedImage = image_iframe.contentWindow.document
                .getElementById('selectedImage');
        if (selectedImage) {
            selectedImage.parentNode.removeChild(selectedImage);
        }

        var selection = image_iframe.contentWindow.getSelection();
        var x1 = image_iframe.contentWindow.document.getElementById('imageX1').value;
        var y1 = image_iframe.contentWindow.document.getElementById('imageY1').value;
        var x2 = image_iframe.contentWindow.document.getElementById('imageX2').value;
        var y2 = image_iframe.contentWindow.document.getElementById('imageY2').value;
        var width = (parseFloat(x2) - parseFloat(x1));
        var height = (parseFloat(y2) - parseFloat(y1));

        if (image_iframe.contentWindow.selectionVisible()) {
            var img = jQuery(jQuery(selection.getOptions().parent).children('img')[0]);
            var image_url = img.attr('src');

            //jQuery('#imageUrl').val(image_url);
            //FIXME
            //jQuery('#lhs-select').select2('val',image_url);
            jQuery('#imageX').val(x1);
            jQuery('#imageY').val(y1);
            jQuery('#imageW').val(width);
            jQuery('#imageH').val(height);
            jQuery('#image-selection')
                .html(
                    "Image Selection "
                            + Math.round((width * img.width()) / 100)
                            + " x "
                            + Math.round((height * img.height()) / 100) 
                            + " px");

            var rectDiv = image_iframe.contentWindow.document
                    .createElement("div");
            rectDiv.setAttribute('id', 'selectedImage');
            rectDiv.setAttribute('onclick', 'resetImage(' 
                    + x1 + ',' 
                    + y1 + ','
                    + x2 + ',' 
                    + y2 + ')');
            rectDiv.setAttribute(
                            'style',
                            'position: absolute; overflow-x: hidden; overflow-y: hidden; z-index: 2;' 
                                    + 'display: block; opacity:0.4; filter:alpha(opacity=40); '
                                    + 'background-color: rgb(127, 127, 0); '
                                    + 'cursor:pointer; border: 3px solid yellow; left: '
                                    + ((x1 * img.width())/100)
                                    + 'px; top: '
                                    + ((y1 * img.height())/100)
                                    + 'px; width: '
                                    + (((width * img.width())/100) - 6)
                                    + 'px; height: '
                                    + (((height * img.height())/100) - 6) + 'px;');
            jQuery(rectDiv).appendTo(image_iframe.contentWindow.getSelection().getOptions().parent);
            //image_iframe.contentWindow.getSelection().getOptions().parent.appendChild(rectDiv);
        } else {
            clearImageSelection();
        }
    }

    function isWhiteSpace(ch) {
        return ((ch == 0x08) || (ch == 0x0a) || (ch == 0x0d) || (ch == 0x20));
    }

    function normalizedLength(st)  {
        var len = 0;
        var idx = 0;

        var inWhite = false;
        while (idx < st.length) {
            if (isWhiteSpace(st.charCodeAt(idx))) {
                if (inWhite) {
                    ++idx;
                    continue;
                }
                ++len;
                ++idx;
                inWhite = true;
                continue;
            }
            ++len;
            ++idx;
            inWhite = false;
        }
        return len;
    }

    function getPosition(textRange) {
        var element = textRange.parentElement();
        var range = document.getElementById('text-input')
                .contentWindow.document.body.createTextRange();
        range.moveToElementText(element);
        range.setEndPoint("EndToStart", textRange);
        var rangeLength = normalizedLength(range.text);
        var node = element.firstChild;

        while (node) {
            switch(node.nodeType) {
                case 3 :
                    var nodeLength = normalizedLength(node.data);
                    if (nodeLength >= rangeLength) {
                        return {node: node, offset: rangeLength};
                    }
                    rangeLength -= nodeLength;
                    break;
                case 1 :
                    rangeLength -= normalizedLength(node.innerText);
                    break;
            }
            node = node.nextSibling;
        }
        throw ('Unable to create locator for this selection. Please expand');
    }

    // Get the current selected text area in memory from the selected text in the text iframe
    // CREATE/EDIT MODE
    function updateTextSelection() {
        var text_iframe = document.getElementById('text-input');
        var container = text_iframe.contentWindow.document
                .getElementById('injected-text');

        var userSelection = text_iframe.contentWindow.rangy.getSelection();
        var range = userSelection.getRangeAt(0);
        var selectedText = userSelection.toString();

        if (range.textRange) {
            selectedText = range.textRange.text
        } else {
            selectedText = range.toString();
        }

        if (selectedText.toString().length == 0) {
            var selectedImage = text_iframe.contentWindow.document
                    .getElementById('link_image');
            if (selectedImage) {
                selectedImage.parentNode.removeChild(selectedImage);
            }

            clearTextSelection();
            
            return;
        }

        if (jQuery(userSelection.anchorNode).parents().index(jQuery(container)) == -1) {
            return;
        }

        if (! text_iframe.contentWindow.getSelection) {  
            var nativeRange = text_iframe.contentWindow.document.selection.createRange();

            var beginRange = nativeRange.duplicate();
            beginRange.collapse(true);
            var position = getPosition(beginRange);
            range.startContainer = position.node;
            range.startOffset = position.offset;

            var endRange = nativeRange.duplicate();
            endRange.collapse(false);
            position = getPosition(endRange);
            range.endContainer = position.node;
            range.endOffset = position.offset;
        }

        var selectedImage = text_iframe.contentWindow.document
                .getElementById('link_image');
        if (selectedImage) {
            selectedImage.parentNode.removeChild(selectedImage);
        }

        var startOffsetXpath = createXPathFromElement(range.startContainer);
        var endOffsetXpath = createXPathFromElement(range.endContainer);
        var startOffset = range.startOffset;
        var endOffset = range.endOffset;

        document.getElementById('startOffsetXpath').value = startOffsetXpath;
        document.getElementById('endOffsetXpath').value = endOffsetXpath;
        document.getElementById('textStartOffset').value = startOffset;
        document.getElementById('textEndOffset').value = endOffset;

        if (selectedText.toString().length > 60) {
            var beginsWith = selectedText.toString().substring(0, 30);
            var endsWith = selectedText.toString().substring(
                    selectedText.toString().length - 20);
            jQuery('#text-selection').html(beginsWith + "..." + endsWith);
        } else {
            jQuery('#text-selection').html(selectedText.toString());
        }

        range.collapse(true);

        var markerTextChar = "\ufeff";
        var markerTextCharEntity = "&#xfeff;";
        var markerEl;
        var markerId = "sel_" + new Date().getTime() + "_"
                + Math.random().toString().substr(2);

        markerEl = text_iframe.contentWindow.document.createElement("span");
        markerEl.id = markerId;
        markerEl.appendChild(text_iframe.contentWindow.document
                .createTextNode(markerTextChar));
        range.insertNode(markerEl);

        var verticalOffset = markerEl.offsetTop;
        var parent = markerEl.parentNode;
        parent.removeChild(markerEl);
        parent.normalize();

        var svg_links = text_iframe.contentWindow.document
                .getElementById('svg-links');
        var image = text_iframe.contentWindow.document.createElement("img");
        image.setAttribute('id', 'link_image');
        image.setAttribute('class', 'textAlignment');
        image.setAttribute('style', 'position: absolute; left: 6px; top: '
                + verticalOffset + 'px; cursor: pointer; z-index: 2;');
        image.setAttribute('height', '16');
        image.setAttribute('width', '16');
        image.setAttribute('src', 'resources/link_black.png');
        image.setAttribute('onclick',
                'highlightImage(this); stopPropagation(event);');
        image.setAttribute('startOffset', startOffset);
        image.setAttribute('startOffsetXpath', startOffsetXpath);
        image.setAttribute('endOffset', endOffset);
        image.setAttribute('endOffsetXpath', endOffsetXpath);
        svg_links.appendChild(image);

        text_iframe.contentWindow.rangy.getSelection().removeAllRanges();
    }

    // Retrieve XPath for element
    function createXPathFromElement(elm) {
        var segs = [];
        if (elm.nodeType == 3) {
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                if (sib.nodeType == 3) {
                    i++;
                }
            }
            segs.unshift('text()[' + i + ']');
            elm = elm.parentNode;
        }
        while (elm && elm.nodeType == 1) {
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                if (sib.nodeName == elm.nodeName) {
                    i++;
                }
            }
            segs.unshift(elm.nodeName.toLowerCase() + '[' + i + ']');
            elm = elm.parentNode;
        }
        return segs.length ? '/' + segs.join('/') : null;
    }

    // Retrieve element at XPath
    function lookupElementByXPath(path) {
        var aNode = document.getElementById('text-input').contentWindow.document.documentElement;
        var xpe = aNode.ownerDocument || aNode;

        if (xpe.createNSResolver) {
            var evaluator = new XPathEvaluator();
            var result = evaluator.evaluate(
                path,
                document.getElementById('text-input').contentWindow.document.documentElement,
                null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

            return result.singleNodeValue;
        } else {
            var paths = path.split('/');
            var node = document.getElementById('text-input').contentWindow.document.documentElement;
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

    // Submit a new alignment
    // CREATE MODE
    function submit() {
        var startOffset = jQuery('#textStartOffset').val();
        var startOffsetXpath = jQuery('#startOffsetXpath').val();
        var endOffset = jQuery('#textEndOffset').val();
        var endOffsetXpath = jQuery('#endOffsetXpath').val();

        var x = jQuery('#imageX').val();
        var y = jQuery('#imageY').val();
        var height = jQuery('#imageH').val();
        var width = jQuery('#imageW').val();

        if (jQuery('#image-selection').html() == "No selection: alignment will default to entire image" 
                && jQuery('#text-selection').html() == "No selection: alignment will default to entire text") {
            return;
        }
        
        var imageUrl = qualifyURL(jQuery('#lhs-select').select2('data').uri);
        var textUrl = qualifyURL(jQuery('#rhs-select').select2('data').uri);

        var createData = "<rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' "
                + "xmlns:dc='http://purl.org/dc/elements/1.1/' "
                + "xmlns:oa='http://www.w3.org/ns/oa#'>"
                + "<oa:Annotation rdf:about='/lorestore/oa/dummy'>"
                + "<rdf:type rdf:resource='http://austese.net/ns/annotation/Alignment'/>"
                + "<oa:hasTarget rdf:resource='"
                + imageUrl
                + "#xywh="
                + x
                + ","
                + y
                + ","
                + width
                + ","
                + height
                + "'/><oa:hasTarget rdf:resource='"
                + textUrl
                + "#xpath="
                + startOffsetXpath
                + ","
                + endOffsetXpath
                + "#char="
                + startOffset
                + ","
                + endOffset
                + "'/>"
                + "<"
                + "/"
                + "oa:Annotation ><" + "/" + "rdf:RDF>";

        jQuery.ajax({
            url : '/lorestore/oa/',
            type : 'POST',
            async:false,
            processData: false,
            //data: JSON.stringify(createData),
            data: createData,
            headers: {
                'Content-Type': 'application/rdf+xml'
                //'Content-Type': 'application/json'
            },
            success : function(res) {
                console.log("created alignment annotation",res)
                objectUrl = jQuery(jQuery(res).children()[0])
                        .children()[0].getAttribute('rdf:about');
            },
            error : function(xhr, status, error) {
               console.log("Error creating alignment",error, xhr,status);
            }
        });

        clearImageSelection();
        clearTextSelection();
        viewAlignment();
    }

    // Update an existing alignment
    // CREATE MODE
    function update() {
        var startOffset = document.getElementById('textStartOffset').value;
        var startOffsetXpath = document.getElementById('startOffsetXpath').value;
        var endOffset = document.getElementById('textEndOffset').value;
        var endOffsetXpath = document.getElementById('endOffsetXpath').value;

        var x = document.getElementById('imageX').value;
        var y = document.getElementById('imageY').value;
        var height = document.getElementById('imageH').value;
        var width = document.getElementById('imageW').value;

        var imageData = jQuery('#lhs-select').select2("data");
        // FIXME
        var textData = jQuery('#rhs-select').select2("data");
        var textUrl = qualifyURL(textData.uri);
        var imageUrl = qualifyURL(imageData.uri);
        
        var objectUrl = document.getElementById('objectUrl').value;

        var updateData = '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="'
                + objectUrl
                + '" ><rdf:type rdf:resource="http://www.openannotation.org/ns/Annotation"/>' 
                + '<rdf:type rdf:resource="http://austese.net/ns/annotation/Alignment"/>' 
                + '<hasTarget xmlns="http://www.openannotation.org/ns/" rdf:resource="'
                + imageUrl
                + '#xywh='
                + x
                + ','
                + y
                + ','
                + width
                + ','
                + height
                + '"/><hasTarget xmlns="http://www.openannotation.org/ns/" rdf:resource="'
                + textUrl
                + '#xpath='
                + startOffsetXpath
                + ','
                + endOffsetXpath
                + '#char='
                + startOffset
                + ','
                + endOffset
                + '"/><'
                + '/'
                + 'rdf:Description><rdf:Description rdf:about="'
                + textUrl
                + '#xpath='
                + startOffsetXpath
                + ','
                + endOffsetXpath
                + '#char='
                + startOffset
                + ','
                + endOffset
                + '"><isPartOf xmlns="http://purl.org/dc/terms/" rdf:resource="'
                + textUrl
                + '"'
                + '/'
                + '><'
                + '/'
                + 'rdf:Description><rdf:Description rdf:about="'
                + imageUrl
                + '#xywh='
                + x
                + ','
                + y
                + ','
                + width
                + ','
                + height
                + '"><isPartOf xmlns="http://purl.org/dc/terms/" rdf:resource="'
                + imageUrl
                + '"/><'
                + '/'
                + 'rdf:Description><'
                + '/'
                + 'rdf:RDF>';

        jQuery.ajax({
            url : objectUrl,
            type : 'PUT',
            data : updateData,
            async : false,
            contentType : "application/rdf+xml",
            xhrFields : {
                withCredentials : true
            },
            success : function(res) {

            },
            error : function(xhr, testStatus, error) {
                if (console && console.log) {
                    console.log("Error occured: " + error + " " + xhr + " "
                            + testStatus);
                }
            }
        });

        clearImageSelection();
        clearTextSelection();
        viewAlignment();
    }

    // Confirm delete alignment
    // READ/EDIT MODE
    function confirmDeleteAlignment() {
        var objectUrl = document.getElementById('objectUrl').value;
        if (!objectUrl || objectUrl.length <= 0) {
            return;
        }
        if (confirm("Are you sure you want to delete this?")) {
            deleteAlignment();
        }
    }

    // Delete an existing alignment
    // READ/EDIT MODE
    function deleteAlignment() {
        var objectUrl = document.getElementById('objectUrl').value;
        if (!objectUrl || objectUrl.length <= 0) {
            return;
        }

        jQuery.ajax({
            url : objectUrl,
            type : 'DELETE',
            async : false,
            contentType : "application/rdf+xml",
            xhrFields : {
                withCredentials : true
            },
            success : function(res) {

            },
            error : function(xhr, testStatus, error) {

               if (console && console.log) {
                    console.log("Error occured: " + error + " " + xhr + " "
                            + testStatus);
                }
            }
        });

        clearImageSelection();
        clearTextSelection();
        viewAlignment();
    }

    // Update view for CREATE MODE
    function addAlignment() {
        mode = CREATE_MODE;
        var imageData = jQuery('#lhs-select').select2('data');
        if (!imageData) {
            console.log("no image data")
            return;
        } else {
            var imageUrl = qualifyURL(imageData.uri);
        }
        var textUrl = qualifyURL(jQuery('#rhs-select').select2('data').uri);
        
        document.getElementById('image-input').src = "/" + modulePath
                + "/imageReader.html?ui=embed&editable=true&url="
                + encodeURIComponent(imageUrl);
        
        clearAnnotations();
        
        jQuery('#createNewRow').css('display', 'block');
        jQuery('#editRow').css('display', 'none');
        jQuery('#selectionRow').css('display', 'block');
        jQuery('#viewRow').css('display', 'none');

        clearImageSelection();
        clearTextSelection();
    }

    // Update view for READ MODE
    function viewAlignment() {
        mode = READ_MODE;

        jQuery('#createNewRow').css('display', 'none');
        jQuery('#editRow').css('display', 'none');
        jQuery('#selectionRow').css('display', 'none');
        jQuery('#viewRow').css('display', 'block');

        reloadAnnotations();
    }

    // Update view for EDIT MODE
    function editAlignment() {
        var objectUrl = jQuery('#objectUrl').val();
        if (!objectUrl || objectUrl.length <= 0) {
            return;
        }

        mode = EDIT_MODE;

        var image_iframe = document.getElementById('image-input');
        var annotationID = objectUrl.substring(objectUrl.lastIndexOf("/") + 1);
        var selectedImage = image_iframe.contentWindow.document
                .getElementById('Image_' + annotationID);

        var x = selectedImage.getAttribute('x');
        var y = selectedImage.getAttribute('y');
        var w = selectedImage.getAttribute('w');
        var h = selectedImage.getAttribute('h');

        var src = jQuery(jQuery(selectedImage).parent().find('img')[0]).attr('src');
        var index = parseInt(jQuery(selectedImage).parent().attr('id').substring('7'),10);

        var text_iframe = document.getElementById('text-input');
        var selectedText = text_iframe.contentWindow.document
                .getElementById('Text_' + annotationID);

        var startOffset = selectedText.getAttribute('startOffset');
        var startOffsetXpath = selectedText.getAttribute('startOffsetXpath');
        var endOffset = selectedText.getAttribute('endOffset');
        var endOffsetXpath = selectedText.getAttribute('endOffsetXpath');

        clearImageSelection();

        document.getElementById('image-input').onload = function() {
            addImageAndText(annotationID, objectUrl, src, index, x, y, w, h,
                    startOffset, startOffsetXpath, endOffset,
                    endOffsetXpath, true);
// FIXME
            //jQuery('#imageUrl').val(src);
            jQuery('#imageX').val(x);
            jQuery('#imageY').val(y);
            jQuery('#imageW').val(w);
            jQuery('#imageH').val(h);

            image_iframe.contentWindow.jumpToIndex(index);

            document.getElementById('image-input').onload = function() {}
            document.getElementById('text-input').onload = function() {}
        }
        jQuery('#image-input').attr('src',"/"
                + modulePath
                + "/imageReader.html?ui=embed&editable=true&url="
                + encodeURIComponent(qualifyURL(jQuery('#lhs-select').select2('data').uri)));

        jQuery('#createNewRow').css('display', 'none');
        jQuery('#editRow').css('display', 'block');
        jQuery('#selectionRow').css('display', 'block');
        jQuery('#viewRow').css('display', 'none');

        clearAnnotations();
    }

    var setUpSearchFields = function(elem,type){
        elem.select2({
            placeholder: 'Search by title or filename',
            minimumInputLength: 0,
            ajax: {
                dataType: 'json',
                url: '/' +repositoryModulePath + '/api/resources/',
                data: function(term,page){
                    var searchParams = {
                        query: term,
                        type: type,
                        pageSize: 10,
                        page: page
                    };
                    if (project) {
                        searchParams.project = project;
                    }
                    return searchParams;
                },
                results: function (data, page) { 
                    var more = (page * 10) < data.count;
                    data.more = more;
                    return data;
                }
            },
            initSelection: function(element, callback) {
                // load value when id is set
                var id=jQuery(element).val();
                var elemId = jQuery(element).prop('id');
                if (id!=="") {
                    jQuery.ajax({
                        url: '/' +repositoryModulePath + '/api/resources/' + id,
                        dataType: 'json',
                        headers: {
                            'Accept': 'application/json'
                        },
                        success: function(d){
                            console.log("got data init selection",d)
                            callback(d);
                            if (elemId == 'lhs-select'){
                                updateImageReader({added:d});
                            } else if (elemId == 'rhs-select'){
                                updateTextReader({added:d});
                            }
                        }
                    });
                }
            },
            formatResult: function(transcription){
                return getTemplate('resourceBareDetail')(transcription);
               // return '<b>' + transcription.filename + "</b>" + (transcription.metadata.title? ", " + transcription.metadata.title : "");
            },
            formatSelection: function(transcription){
                return getTemplate('resourceBareDetail')(transcription);
                //return '<b>' + transcription.filename + "</b>" + (transcription.metadata.title? ", " + transcription.metadata.title : "");
            },
            escapeMarkup: function(m){return m;}
        })
    }
    
    var READ_MODE = 0;
    var CREATE_MODE = 1;
    var EDIT_MODE = 2;
    var mode = READ_MODE;

    // initialize alignment ui
    setUpSearchFields(jQuery("#lhs-select"),'image');
    setUpSearchFields(jQuery("#rhs-select"),'text');
    
    reloadAnnotations();
    
    // set up handlers
    jQuery('#lhs-select').on('change',updateImageReader);
    jQuery('#rhs-select').on('change',updateTextReader);
    
    
    jQuery('#addAlignmentLink').on('click', addAlignment);
    jQuery('#editAlignmentLink').on('click', editAlignment);
    jQuery('#deleteAlignmentLink').on('click', confirmDeleteAlignment);
    
    jQuery('#imageSelBtn').on('click', updateImageSelection);
    jQuery('#textSelBtn').on('click', updateTextSelection);
    
    jQuery('#new-submit').on('click', submit);
    jQuery('#new-cancel').on('click', viewAlignment);
    
    jQuery('#edit-update').on('click', update);
    jQuery('#edit-delete').on('click', confirmDeleteAlignment);
    jQuery('#edit-cancel').on('click', viewAlignment);
            
      
})(jQuery);
