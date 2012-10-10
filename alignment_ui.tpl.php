<?php
$module_path = drupal_get_path('module', 'alignment');
?>
<div class="login-popup" id="login-box">
	<p>
		Lorestore login required<a class="close" href="#"
			onclick="exitLogin()"><i class="icon-remove"></i> </a>
	</p>
	<form action="/lorestore/j_spring_security_check" class="signin"
		method="post" onsubmit="return false;"
		name="loginform">
        <fieldset class="textbox">
    		<input type="text" placeholder="Username" name="j_username" id="j_username" /> 
    		<input type="password" placeholder="Password" name="j_password" id="j_password" />
    		<p id="login_error_message">Invalid username or password.</p>
    		<button id="annoLogin" type="button" class="btn" onclick="login()">Login</button>
    		<button id="annoExitLogin" type="button" class="btn" onclick="exitLogin()">Cancel</button>
		</fieldset>
	</form>
</div>
<div class="span12">
<div class="row">
    <div class="span6">
            <div class="row ">
                <fieldset class="control-group">                        
                   <div class="input-append">
                       <input id="image-search" type="text"><span id="image-search-button" class="add-on"><i class="icon-search"></i></span>
                   </div>
                </fieldset>
            </div>
            <div class="row">
                <iframe id="image-input"
                src="about:blank" width="97%" height="550px"></iframe>
            </div>
    </div>
    <div class="span6">
            <div class="row">
                <fieldset class="control-group">
                   <div class="input-append">
                       <input id="text-search" type="text"><span id="text-search-button" class="add-on"><i class="icon-search"></i></span>
                   </div>
                </fieldset>
            </div>
            <div class="row">
                <iframe id="text-input"
                        src="about:blank" width="97%" height="550px"
                        style="overflow: hidden" scrolling="no"></iframe>
            </div>
    </div>
</div>

<div class="row" id="viewRow">
			<div class="form-actions" id="edit-actions">
				<a href="javascript:void(0);"
					onclick="addAlignment(); return false;"><i class="icon-plus"></i>
					Add New</a><br /> <a href="javascript:void(0);"
					onclick="editAlignment(); return false;"><i class="icon-wrench"></i>
					Edit Existing</a><br /> <a href="javascript:void(0);"
					onclick="confirmDeleteAlignment(); return false;"><i
					class="icon-remove"></i> Delete Existing</a>
			</div>
</div>
<div class="row" id="selectionRow" style="display: none">
		<div class="span6">
			<table>
				<tr>
					<td>
						<button style="margin: 0px 4px;" onclick="updateImageSelection();"
							class="btn">
							<i class="icon-pencil"></i>
						</button>
						<p style="display: none">
							<input style="display: none" type="hidden" id="imageUrl" value="" />
							<input style="display: none" type="hidden" id="imageX" value="0" />
							<input style="display: none" type="hidden" id="imageY" value="0" />
							<input style="display: none" type="hidden" id="imageW" value="0" />
							<input style="display: none" type="hidden" id="imageH" value="0" />
						</p>
					</td>
					<td><label style="margin: 0px 5px" id="image-selection">No
							selection: alignment will default to entire image</label>
					</td>
				</tr>
			</table>
		</div>
		<div class="span6">
			<table>
				<tr>
					<td>
						<button style="margin: 0px 4px;" onclick="updateTextSelection();"
							class="btn">
							<i class="icon-pencil"></i>
						</button>
						<p style="display: none">
							<input style="display: none" type="hidden" id="textUrl" value="" />
							<input style="display: none" type="hidden" id="startOffsetXpath"
								value="" /> <input style="display: none" type="hidden"
								id="endOffsetXpath" value="" /> <input style="display: none"
								type="hidden" id="textStartOffset" value="0" /> <input
								style="display: none" type="hidden" id="textEndOffset" value="0" />
						</p>
					</td>
					<td><label id="text-selection">No selection: alignment will default
							to entire text</label></td>
				</tr>
			</table>
		</div>
</div>
<div class="row" id="createNewRow" style="display: none">
			<div class="form-actions" id="edit-actions">
				<button class="btn btn-primary form-submit" id="new-submit"
					name="op" value="Save" onclick="submit()">Save</button>
				<button class="btn form-submit" id="new-cancel" name="op"
					value="Cancel" onclick="viewAlignment();">Cancel</button>
			</div>
</div>
<div class="row" id="editRow" style="display: none">
			<div class="form-actions" id="edit-actions">
				<button class="btn btn-primary form-submit" id="edit-update"
					name="op" value="Update" onclick="update()">Update</button>
				<button class="btn btn-danger form-submit" id="edit-delete"
					name="op" value="Delete" onclick="confirmDeleteAlignment()">Delete
				</button>
				<button class="btn form-submit" id="edit-cancel" name="op"
					value="Cancel" onclick="viewAlignment()">Cancel</button>
				<input style="display: none" type="hidden" id="objectUrl" value="" />
			</div>
</div>
</div>
<script type="text/javascript">
var placeholderFunction;
var loggedIn = false;

// Refresh the text and image iframe with annotations
// READ MODE
function refreshAnnotations(imageUrl, textUrl) {
    var imageUrl = qualifyURL(imageUrl);
    var textUrl = qualifyURL(textUrl);

    document.getElementById('text-input').onload = function(e) {
        document.getElementById('image-input').onload = function(e) {
            // Remove onload functions
            document.getElementById('image-input').onload = function(e) {
            };
            document.getElementById('text-input').onload = function(e) {
            };
            loadAnnotations(imageUrl, textUrl);
        }

        jQuery('#image-search').val(imageUrl);
        document.getElementById('image-input').src = "/<?php print $module_path; ?>/imageReader.html?ui=embed&url="
                + encodeURIComponent(imageUrl);
        jQuery('#imageUrl').val(imageUrl);
    }

    jQuery('#text-search').val(textUrl);
    document.getElementById('text-input').src = "/<?php print $module_path; ?>/textReader.html?ui=embed&url="
            + encodeURIComponent(textUrl);
    jQuery('#textUrl').val(textUrl);
}

function qualifyURL(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.href;
}

// Load annotations for a given image and text
// READ MODE
function loadAnnotations(imageUrl, textUrl) {
    jQuery
            .ajax({
                url : '/lorestore/oac/?annotates=' + imageUrl,
                type : 'GET',
                async : false,
                contentType : "application/rdf+xml",
                success : function(res) {
                    var patt1 = "#xpath=[^=#,]+,[^=#,]+#char=[0-9]+,[0-9]+$";
                    var patt2 = "#xywh=[0-9]+,[0-9]+,[0-9]+,[0-9]+$";
                    var patt3 = /[^=#,]+/g;
                    var patt4 = /[0-9]+/g;

                    var length = res.childNodes[1].childNodes.length;
                    for ( var i = 0; i < length; i++) {
                        if (res.childNodes[1].childNodes[i].getElementsByTagName) {
                            var hasTargets = res.childNodes[1].childNodes[i]
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

                                var objectUrl = res.childNodes[1].childNodes[i]
                                        .getAttribute('rdf:about');
                                var annotationID = objectUrl
                                        .substring(objectUrl.lastIndexOf("/") + 1);

                                var res1 = hasTargets[0]
                                        .getAttribute('rdf:resource');
                                var res2 = hasTargets[1]
                                        .getAttribute('rdf:resource');

                                var matchs;
                                var numbers;
                                if (res1.match(patt1)
                                        && res1.substring(0, textUrl.length) === textUrl) {
                                    matchs = res1.match(patt1);
                                    results = matchs.toString().match(patt3);
                                    if (results.length == 6) {
                                        startOffset = results[4];
                                        startOffsetXpath = results[1];
                                        endOffset = results[5];
                                        endOffsetXpath = results[2];
                                    }
                                }

                                if (res1.match(patt2)
                                        && res1.substring(0, imageUrl.length) === imageUrl) {
                                    matchs = res1.match(patt2);
                                    numbers = matchs.toString().match(patt4);
                                    if (numbers.length == 4) {
                                        x = numbers[0];
                                        y = numbers[1];
                                        w = numbers[2];
                                        h = numbers[3];
                                    }
                                }

                                if (res2.match(patt1)
                                        && res2.substring(0, textUrl.length) === textUrl) {
                                    matchs = res2.match(patt1);
                                    results = matchs.toString().match(patt3);
                                    if (results.length == 6) {
                                        startOffset = results[4];
                                        startOffsetXpath = results[1];
                                        endOffset = results[5];
                                        endOffsetXpath = results[2];
                                    }
                                }

                                if (res2.match(patt2)
                                        && res2.substring(0, imageUrl.length) === imageUrl) {
                                    matchs = res2.match(patt2);
                                    numbers = matchs.toString().match(patt4);
                                    if (numbers.length == 4) {
                                        x = numbers[0];
                                        y = numbers[1];
                                        w = numbers[2];
                                        h = numbers[3];
                                    }
                                }
                                if (startOffset != -1 && startOffsetXpath != ''
                                        && endOffset != -1
                                        && endOffsetXpath != '' && x != -1
                                        && y != -1 && w != -1 && h != -1) {
                                    addImageAndText(annotationID, objectUrl, x,
                                            y, w, h, startOffset,
                                            startOffsetXpath, endOffset,
                                            endOffsetXpath, false);
                                }
                            }
                        }
                    }
                },
                error : function(xhr, testStatus, error) {
                    if (console && console.log) {
                        console.log("Error occured: " + error + " " + xhr + " "
                                + testStatus);
                    }
                    return;
                }
            });
}

// Add a given image and text annotation to the image and text iframe
// READ MODE
function addImageAndText(annotationID, objectUrl, x, y, w, h, startOffset,
        startOffsetXpath, endOffset, endOffsetXpath, editable) {

    var rectDiv = jQuery(document.getElementById('image-input').contentWindow.document
            .createElement("div"));
    try {
        if (editable == true) {

            rectDiv.attr('id', 'selectedImage').attr(
                    'onclick',
                    'resetImage(' + x + ',' + y + ','
                            + (parseInt(x, 10) + parseInt(w, 10)) + ','
                            + (parseInt(y, 10) + parseInt(h, 10)) + ')');

            jQuery('#imageX').val(x);
            jQuery('#imageY').val(y);
            jQuery('#imageW').val(w);
            jQuery('#imageH').val(h);
            jQuery('#image-selection').html(
                    "Image Selection " + w + " x " + h + " px");
        } else {
            rectDiv.attr('id', 'Image_' + annotationID).attr('onclick',
                    'focusImageSelection(this, true)');
        }
        rectDiv.attr('objectUrl', objectUrl).attr('x', x).attr('y', y).attr(
                'w', w).attr('h', h).css({
            'position' : 'absolute',
            'overflow-x' : 'hidden',
            'overflow-y' : 'hidden',
            'z-index' : '2',
            'display' : 'block',
            'opacity' : '0.4',
            'filter' : 'alpha(opacity=40)',
            'background-color' : 'rgb(127, 127, 0)',
            'cursor' : 'pointer',
            'border' : '3px solid yellow',
            'left' : (x + 'px'),
            'top' : (y + 'px'),
            'width' : (w - 4) + 'px',
            'height' : (h - 4) + 'px'
        });
        rectDiv.appendTo(jQuery('#image-input').contents().find('#pagediv0'));

        var verticalOffset = 30;
        var text_iframe = document.getElementById('text-input');
        var injectedText = text_iframe.contentWindow.document
                .getElementById('injected-text');

        var selectedText;

        if (text_iframe.contentWindow.getSelection
                && text_iframe.contentWindow.document.createRange) {
            var sel = text_iframe.contentWindow.getSelection();
            var range = text_iframe.contentWindow.document.createRange();
            range.selectNodeContents(injectedText);
            range.setStart(lookupElementByXPath(startOffsetXpath), startOffset);
            range.setEnd(lookupElementByXPath(endOffsetXpath), endOffset);
            selectedText = range.toString();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (text_iframe.contentWindow.document.selection
                && text_iframe.contentWindow.document.body.createTextRange) {
            var textRange = text_iframe.contentWindow.document.body
                    .createTextRange();
            textRange.moveToElementText(injectedText);
            textRange.setStart(lookupElementByXPath(startOffsetXpath),
                    startOffset);
            textRange.setEnd(lookupElementByXPath(endOffsetXpath), endOffset);
            selectedText = textRange.toString();
            textRange.select();
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

        verticalOffset = markerEl.offsetTop;
        var parent = markerEl.parentNode;
        parent.removeChild(markerEl);
        parent.normalize();

        var svg_links = text_iframe.contentWindow.document
                .getElementById('svg-links');
        var image = text_iframe.contentWindow.document.createElement("img");
        if (editable == true) {
            image.setAttribute('id', 'link_image');

            document.getElementById('textStartOffset').value = startOffset;
            document.getElementById('startOffsetXpath').value = startOffsetXpath;
            document.getElementById('textEndOffset').value = endOffset;
            document.getElementById('endOffsetXpath').value = endOffsetXpath;
            if (selectedText.toString().length > 60) {
                var beginsWith = selectedText.toString().substring(0, 30);
                var endsWith = selectedText.toString().substring(
                        selectedText.toString().length - 20);
                jQuery('#text-selection').html(beginsWith + "..." + endsWith);
            } else {
                jQuery('#text-selection').html(selectedText.toString());
            }
        } else {
            image.setAttribute('id', 'Text_' + annotationID);
        }
        rectDiv.attr('objectUrl', objectUrl);
        image.setAttribute('style', 'position: absolute; left: 6px; top: '
                + (verticalOffset - 10) + 'px; cursor: pointer;');
        image.setAttribute('height', '16');
        image.setAttribute('width', '16');
        image.setAttribute('objectUrl', objectUrl);
        image.setAttribute('src', 'resources/link_black.png');
        image.setAttribute('onclick',
                'highlightImage(this); event.stopPropagation();');
        image.setAttribute('startOffset', startOffset);
        image.setAttribute('startOffsetXpath', startOffsetXpath);
        image.setAttribute('endOffset', endOffset);
        image.setAttribute('endOffsetXpath', endOffsetXpath);

        svg_links.appendChild(image);

        if (text_iframe.contentWindow.getSelection) {
            if (text_iframe.contentWindow.getSelection().empty) {
                text_iframe.contentWindow.getSelection().empty();
            } else if (text_iframe.contentWindow.getSelection().removeAllRanges) {
                text_iframe.contentWindow.getSelection().removeAllRanges();
            }
        } else if (text_iframe.contentWindow.document.selection) {
            text_iframe.contentWindow.document.selection.empty();
        }
    } catch (e) {
        if (console && console.log) {
            console.log("Error", e);
        }
    }
}

// Refresh the image reader with the images from the search bar
// READ MODE
function updateImageReader() {
    var newImageUrl = jQuery('#image-search').val();

    clearImageSelection();

    if (mode == READ_MODE) {
        refreshAnnotations(newImageUrl, jQuery('#textUrl').val());
    } else {
        document.getElementById('image-input').src = "/<?php print $module_path; ?>/imageReader.html?ui=embed&editable=true&url="
                + encodeURIComponent(newImageUrl);
        document.getElementById('imageUrl').value = newImageUrl;
    }
}

// Refresh the text reader with the text from the search bar
// READ MODE
function updateTextReader() {
    var newTextUrl = jQuery('#text-search').val();

    clearTextSelection();

    if (mode == READ_MODE) {
        refreshAnnotations(jQuery('#imageUrl').val(), newTextUrl);
    } else {
        document.getElementById('text-input').src = "/<?php print $module_path; ?>/textReader.html?ui=embed&editable=true&url="
                + encodeURIComponent(newTextUrl);
        jQuery('#textUrl').val(newTextUrl);
    }
}

// Set the objectUrl in memory
// READ MODE
function setObjectUrl(objectUrl) {
    jQuery('#objectUrl').val(objectUrl);
}

// Set the selected text annotation in the text iframe
// READ MODE
function setSelectedText(objectUrl) {
    var text_iframe = document.getElementById('text-input');
    text_iframe.contentWindow.setSelectedText(objectUrl);
}

// Set the selected image annotation in the image iframe
// READ MODE
function setSelectedImage(objectUrl) {
    var image_iframe = document.getElementById('image-input');
    image_iframe.contentWindow.setSelectedImage(objectUrl);
}

// Clear the objectUrl in memory
// READ MODE
function clearObjectUrl() {
    jQuery('#objectUrl').val('');
}

// Clear the selected text annotation in the text iframe
// READ MODE
function clearSelectedText() {
    var text_iframe = document.getElementById('text-input');
    text_iframe.contentWindow.clearSelectedText();
}

// Clear the selected image annotation in the image iframe
// READ MODE
function clearSelectedImage() {
    var image_iframe = document.getElementById('image-input');
    image_iframe.contentWindow.clearSelectedImage();
}

// Clear the current selected image in memory
// READ/CREATE/EDIT MODE
function clearImageSelection() {
    jQuery('#imageX').val(0);
    jQuery('#imageY').val(0);
    jQuery('#imageW').val(0);
    jQuery('#imageH').val(0);
    jQuery('#image-selection').html(
            "No selection: alignment will default to entire image");
}

// Clear the current selected text link in memory
// READ/CREATE/EDIT MODE
function clearTextSelection() {
    jQuery('#textStartOffset').val(0);
    jQuery('#startOffsetXpath').val('');
    jQuery('#textEndOffset').val(0);
    jQuery('#endOffsetXpath').val('');
    jQuery('#text-selection').html(
            "No selection: alignment will default to entire text");
}

// Get the current selected image area in memory from the selected image in the
// image iframe
// CREATE/EDIT MODE
function updateImageSelection() {
    var image_iframe = document.getElementById('image-input');

    var selectedImage = image_iframe.contentWindow.document
            .getElementById('selectedImage');
    if (selectedImage) {
        selectedImage.parentNode.removeChild(selectedImage);
    }

    var x1 = image_iframe.contentWindow.document.getElementById('imageX1').value;
    var y1 = image_iframe.contentWindow.document.getElementById('imageY1').value;
    var x2 = image_iframe.contentWindow.document.getElementById('imageX2').value;
    var y2 = image_iframe.contentWindow.document.getElementById('imageY2').value;
    var height = image_iframe.contentWindow.document
            .getElementById('imageHeight').value;
    var width = image_iframe.contentWindow.document
            .getElementById('imageWidth').value;

    if (image_iframe.contentWindow.selectionVisible()) {
        jQuery('#imageX').val(x1);
        jQuery('#imageY').val(y1);
        jQuery('#imageW').val(width);
        jQuery('#imageH').val(height);
        jQuery('#image-selection').html(
                "Image Selection "
                        + image_iframe.contentWindow.document
                                .getElementById('imageWidth').value
                        + " x "
                        + image_iframe.contentWindow.document
                                .getElementById('imageHeight').value + " px");

        var rectDiv = image_iframe.contentWindow.document.createElement("div");
        rectDiv.setAttribute('id', 'selectedImage');
        rectDiv.setAttribute('onclick', 'resetImage(' + x1 + ',' + y1 + ','
                + x2 + ',' + y2 + ')');
        rectDiv
                .setAttribute(
                        'style',
                        'position: absolute; overflow-x: hidden; overflow-y: hidden; z-index: 2; display: block; opacity:0.4; filter:alpha(opacity=40); background-color: rgb(127, 127, 0);  cursor:pointer; border: 3px solid yellow; left: '
                                + x1
                                + 'px; top: '
                                + y1
                                + 'px; width: '
                                + (parseInt(width, 10) - 4)
                                + 'px; height: '
                                + (parseInt(height, 10) - 4) + 'px;');
        image_iframe.contentWindow.document.getElementById('pagediv0')
                .appendChild(rectDiv);
    } else {
        document.getElementById('imageX').value = 0;
        document.getElementById('imageY').value = 0;
        document.getElementById('imageW').value = 0;
        document.getElementById('imageH').value = 0;
        jQuery('#image-selection').html(
                "No selection: alignment will default to entire image");
    }
}

// Get the current selected text area in memory from the selected text in the
// text iframe
// CREATE/EDIT MODE
function updateTextSelection() {
    var text_iframe = document.getElementById('text-input');
    var container = text_iframe.contentWindow.document
            .getElementById('injected-text');

    var userSelection;
    if (text_iframe.contentWindow.getSelection) {
        userSelection = text_iframe.contentWindow.getSelection();
    } else if (text_iframe.contentWindow.document.selection) {
        userSelection = text_iframe.contentWindow.document.selection
                .createRange();
    }

    var selectedText = userSelection;
    if (userSelection.text) {
        selectedText = userSelection.text;
    }

    if (selectedText.toString().length == 0) {
        var selectedImage = text_iframe.contentWindow.document
                .getElementById('link_image');
        if (selectedImage) {
            selectedImage.parentNode.removeChild(selectedImage);
        }

        document.getElementById('textStartOffset').value = 0;
        document.getElementById('startOffsetXpath').value = '';
        document.getElementById('textEndOffset').value = 0;
        document.getElementById('endOffsetXpath').value = '';

        jQuery('#text-selection').html(
                "No selection: alignment will default to entire text");
        return;
    }

    if (jQuery(userSelection.anchorNode).parents().index(
            jQuery(text_iframe.contentWindow.document
                    .getElementById('injected-text'))) == -1) {
        return;
    }

    var selectedImage = text_iframe.contentWindow.document
            .getElementById('link_image');
    if (selectedImage) {
        selectedImage.parentNode.removeChild(selectedImage);
    }

    var range;
    if (userSelection.getRangeAt) {
        range = userSelection.getRangeAt(0);
    } else {
        var range = document.createRange();
        range.setStart(userSelection.anchorNode, userSelection.anchorOffset);
        range.setEnd(userSelection.focusNode, userSelection.focusOffset);
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
    image.setAttribute('style', 'position: absolute; left: 6px; top: '
            + (verticalOffset - 10) + 'px; cursor: pointer;');
    image.setAttribute('height', '16');
    image.setAttribute('width', '16');
    image.setAttribute('src', 'resources/link_black.png');
    image.setAttribute('onclick',
            'highlightImage(this); event.stopPropagation();');
    image.setAttribute('startOffset', startOffset);
    image.setAttribute('startOffsetXpath', startOffsetXpath);
    image.setAttribute('endOffset', endOffset);
    image.setAttribute('endOffsetXpath', endOffsetXpath);
    svg_links.appendChild(image);
    if (text_iframe.contentWindow.getSelection) {
        if (text_iframe.contentWindow.getSelection().empty) {// Chrome
            text_iframe.contentWindow.getSelection().empty();
        } else if (text_iframe.contentWindow.getSelection().removeAllRanges) {// Firefox
            text_iframe.contentWindow.getSelection().removeAllRanges();
        }
    } else if (text_iframe.contentWindow.document.selection) {// IE?
        text_iframe.contentWindow.document.selection.empty();
    }
}

// Retrieve XPath for element
function createXPathFromElement(elm) {
    var allNodes = document.getElementsByTagName('*');
    var segs = [];
    if (elm.nodeType == 3) {
        for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
            if (sib.nodeType == 3) {
                i++;
            }
        }
        ;
        segs.unshift('/text()[' + i + ']');
        elm = elm.parentNode;
    }
    while (elm && elm.nodeType == 1) {
        for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
            if (sib.localName == elm.localName) {
                i++;
            }
        }
        ;
        segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
        elm = elm.parentNode;
    }
    return segs.length ? '/' + segs.join('/') : null;
};

// Retrieve element at XPath
function lookupElementByXPath(path) {
    var evaluator = new XPathEvaluator();
    var result = evaluator
            .evaluate(
                    path,
                    document.getElementById('text-input').contentWindow.document.documentElement,
                    null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
}

// Login to lorestore
// CREATE/EDIT MODE
function showLogin() {
    var loginBox = jQuery('#login-box').fadeIn(300);

    var popMargTop = (loginBox.height() + 24) / 2;
    var popMargLeft = (loginBox.width() + 24) / 2;

    loginBox.css({
        'margin-top' : -popMargTop,
        'margin-left' : -popMargLeft
    });

    jQuery('body').append('<div id="mask"></div>');
    jQuery('#mask').fadeIn(300);
}

function login() {
    var j_username = jQuery('input[name="j_username"]').attr('value');
    var j_password = jQuery('input[name="j_password"]').attr('value');
    jQuery.ajax({
        url : '/lorestore/j_spring_security_check?j_password=' + j_password
                + '&j_username=' + j_username + '&submit=',
        type : 'POST',
        async : false,
        contentType : "application/rdf+xml",
        xhrFields : {
            withCredentials : true
        },
        success : function(data, textStatus, jqXHR) {
            if (data.toString().indexOf("Incorrect") == -1) {
                exitLogin();
                placeholderFunction();
            } else {
                jQuery('#login_error_message').css('display', 'inline');
            }
        },
        error : function(xhr, testStatus, error) {
            exitLogin();
        }
    });
}

function exitLogin() {
    jQuery('#mask , .login-popup').fadeOut(300, function() {
        jQuery('#mask').remove();
    });
    jQuery('#login_error_message').css('display', 'none');
    return false;
}

// Submit a new alignment
// CREATE MODE
function submit() {
    var startOffset = document.getElementById('textStartOffset').value;
    var startOffsetXpath = document.getElementById('startOffsetXpath').value;
    var endOffset = document.getElementById('textEndOffset').value;
    var endOffsetXpath = document.getElementById('endOffsetXpath').value;

    var x = document.getElementById('imageX').value;
    var y = document.getElementById('imageY').value;
    var height = document.getElementById('imageH').value;
    var width = document.getElementById('imageW').value;

    var imageUrl = document.getElementById('imageUrl').value;
    var textUrl = document.getElementById('textUrl').value;

    var createData = "<rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:dc='http://purl.org/dc/elements/1.1/'     xmlns:oac='http://www.openannotation.org/ns/'><oac:Annotation rdf:about='/lorestore/oac/dummy'><rdf:type rdf:resource='http://austese.net/ns/annotation/Alignment'/><oac:hasTarget rdf:resource='"
            + imageUrl
            + "#xywh="
            + x
            + ","
            + y
            + ","
            + width
            + ","
            + height
            + "'/><oac:hasTarget rdf:resource='"
            + textUrl
            + "#xpath="
            + startOffsetXpath
            + ","
            + endOffsetXpath
            + "#char="
            + startOffset
            + ","
            + endOffset
            + "'/><"
            + "/"
            + "oac:Annotation ><"
            + "/"
            + "rdf:RDF>";

    var objectUrl;

    jQuery.ajax({
        url : '/lorestore/oac',
        type : 'POST',
        data : createData,
        async : false,
        contentType : "application/rdf+xml",
        xhrFields : {
            withCredentials : true
        },
        success : function(res) {
            loggedIn = true;
            objectUrl = res.childNodes[1].childNodes[1]
                    .getAttribute('rdf:about');
        },
        error : function(xhr, testStatus, error) {
            loggedIn = false;
            if (xhr.status == 403) {
                placeholderFunction = submit;
                showLogin();
            } else if (console && console.log) {
                console.log("Error occured: " + error + " " + xhr + " "
                        + testStatus);
            }
            return;
        }
    });

    if (!loggedIn) {
        return;
    }

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
            + '"/>'
            + '<hasTarget xmlns="http://www.openannotation.org/ns/" rdf:resource="'
            + textUrl
            + '#xpath='
            + startOffsetXpath
            + ','
            + endOffsetXpath
            + '#char='
            + startOffset
            + ','
            + endOffset
            + '"/>'
            + '<'
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
            + 'rdf:Description>'
            + '<rdf:Description rdf:about="'
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
            + imageUrl + '"/><' + '/' + 'rdf:Description><' + '/' + 'rdf:RDF>';

    jQuery.ajax({
        url : objectUrl,
        type : 'PUT',
        data : updateData,
        async : false,
        contentType : "application/rdf+xml",
        xhrFields : {
            withCredentials : true
        },
        error : function(xhr, testStatus, error) {
            if (console && console.log) {
                console.log("Error occured: " + error + " " + xhr + " "
                        + testStatus);
            }
            return;
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

    var imageUrl = document.getElementById('imageUrl').value;
    var textUrl = document.getElementById('textUrl').value;

    var objectUrl = document.getElementById('objectUrl').value;

    var updateData = '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="'
            + objectUrl
            + '" ><rdf:type rdf:resource="http://www.openannotation.org/ns/Annotation"/><rdf:type rdf:resource="http://austese.net/ns/annotation/Alignment"/><hasTarget xmlns="http://www.openannotation.org/ns/" rdf:resource="'
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
            + imageUrl + '"/><' + '/' + 'rdf:Description><' + '/' + 'rdf:RDF>';

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
            loggedIn = true;
        },
        error : function(xhr, testStatus, error) {
            loggedIn = false;
            if (xhr.status == 403) {
                placeholderFunction = update;
                showLogin();
            } else if (console && console.log) {
                console.log("Error occured: " + error + " " + xhr + " "
                        + testStatus);
            }
            return;
        }
    });

    if (!loggedIn) {
        return;
    }

    clearImageSelection();
    clearTextSelection();
    viewAlignment();
}

// Check the user has selected an alignment and is logged-in
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
            loggedIn = true;
        },
        error : function(xhr, testStatus, error) {
            loggedIn = false;
            if (xhr.status == 403) {
                placeholderFunction = deleteAlignment;
                showLogin();
            } else if (console && console.log) {
                console.log("Error occured: " + error + " " + xhr + " "
                        + testStatus);
            }
            return;
        }
    });

    if (!loggedIn) {
        return;
    }

    clearImageSelection();
    clearTextSelection();
    viewAlignment();
}

// Update view for CREATE MODE
function addAlignment() {
    mode = CREATE_MODE;

    document.getElementById('image-input').src = "/<?php print $module_path; ?>/imageReader.html?ui=embed&editable=true&url="
            + encodeURIComponent(document.getElementById('imageUrl').value);
    document.getElementById('text-input').src = "/<?php print $module_path; ?>/textReader.html?ui=embed&editable=true&url="
            + encodeURIComponent(document.getElementById('textUrl').value);
    jQuery('#createNewRow').css('display', 'block');
    jQuery('#editRow').css('display', 'none');
    jQuery('#selectionRow').css('display', 'block');
    jQuery('#viewRow').css('display', 'none');

    jQuery('#image-search').attr('disabled', 'disabled');
    jQuery('#text-search').attr('disabled', 'disabled');
    jQuery('#image-search-button').attr('disabled', 'disabled');
    jQuery('#text-search-button').attr('disabled', 'disabled');
}

// Update view for READ MODE
function viewAlignment() {
    mode = READ_MODE;

    jQuery('#createNewRow').css('display', 'none');
    jQuery('#editRow').css('display', 'none');
    jQuery('#selectionRow').css('display', 'none');
    jQuery('#viewRow').css('display', 'block');

    jQuery('#image-search').removeAttr('disabled');
    jQuery('#text-search').removeAttr('disabled');
    jQuery('#image-search-button').removeAttr('disabled');
    jQuery('#text-search-button').removeAttr('disabled');

    refreshAnnotations(jQuery('#imageUrl').val(), jQuery('#textUrl').val());
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

    var text_iframe = document.getElementById('text-input');
    var selectedText = text_iframe.contentWindow.document
            .getElementById('Text_' + annotationID);

    var startOffset = selectedText.getAttribute('startOffset');
    var startOffsetXpath = selectedText.getAttribute('startOffsetXpath');
    var endOffset = selectedText.getAttribute('endOffset');
    var endOffsetXpath = selectedText.getAttribute('endOffsetXpath');

    document.getElementById('text-input').onload = function() {
        document.getElementById('image-input').onload = function() {
            addImageAndText(annotationID, objectUrl, x, y, w, h, startOffset,
                    startOffsetXpath, endOffset, endOffsetXpath, true);
            document.getElementById('image-input').onload = function() {
            }
            document.getElementById('text-input').onload = function() {
            }
        }
        document.getElementById('image-input').src = "/<?php print $module_path; ?>/imageReader.html?ui=embed&editable=true&url="
                + encodeURIComponent(document.getElementById('imageUrl').value);
    }
    document.getElementById('text-input').src = "/<?php print $module_path; ?>/textReader.html?ui=embed&editable=true&url="
            + encodeURIComponent(document.getElementById('textUrl').value);

    jQuery('#createNewRow').css('display', 'none');
    jQuery('#editRow').css('display', 'block');
    jQuery('#selectionRow').css('display', 'block');
    jQuery('#viewRow').css('display', 'none');

    jQuery('#image-search').attr('disabled', 'disabled');
    jQuery('#text-search').attr('disabled', 'disabled');
    jQuery('#image-search-button').attr('disabled', 'disabled');
    jQuery('#text-search-button').attr('disabled', 'disabled');
}

// Clear the selected image annotation in the image iframe
// TESTING
function highlightText(startOffset, endOffset) {
    jQuery('#text-input').contentWindow
            .focusTextOffsets(startOffset, endOffset);
}

var READ_MODE = 0;
var CREATE_MODE = 1;
var EDIT_MODE = 2;
var mode = READ_MODE;

window.onload = function(e) {
    var defaultImage = '<?php print $left; ?>';
    var defaultText = '<?php print $right; ?>';
    refreshAnnotations(defaultImage, defaultText);
}
</script>
