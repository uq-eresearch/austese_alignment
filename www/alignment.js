  // Refresh the text and image iframe with annotations
  // READ MODE
  function refreshAnnotations(imageUrl, textUrl) {
    document.getElementById('text-input').onload = function(e) {             
      document.getElementById('image-input').onload = function(e) { 
        // Remove onload functions
        document.getElementById('image-input').onload = function(e) {};
        document.getElementById('text-input').onload = function(e) {};
        loadAnnotations(imageUrl, textUrl);
      }

      document.getElementById('image-search').value = imageUrl;
      document.getElementById('image-input').src = "http://localhost/imageReader.html?ui=embed&url=" + encodeURIComponent(imageUrl);
      document.getElementById('imageUrl').value = imageUrl;
    }

    document.getElementById('text-search').value = textUrl;
    document.getElementById('text-input').src = "http://localhost/textReader.html?ui=embed&url=" + encodeURIComponent(textUrl);
    document.getElementById('textUrl').value = textUrl;
  }

  // Load annotations for a given image and text
  // READ MODE
  function loadAnnotations(imageUrl, textUrl) {
    jQuery.ajax({
      url: 'http://localhost/lorestore/oac/?annotates=' + imageUrl,
      type: 'GET',
      async: false,
      contentType: "application/rdf+xml",      
      success: function(res) {
        var patt1 = "#char=[0-9]+,[0-9]+$";
        var patt2 = "#xywh=[0-9]+,[0-9]+,[0-9]+,[0-9]+$";
        var patt3=/[0-9]+/g;

        var length = res.childNodes[1].childNodes.length;
        for (var i = 0; i < length; i++) {
          if (res.childNodes[1].childNodes[i].getElementsByTagName) {
            var hasTargets = res.childNodes[1].childNodes[i].getElementsByTagName('hasTarget');
            if (hasTargets.length == 2) {
              var startOffset = -1;
              var endOffset = -1;
              var x = -1;
              var y = -1;
              var w = -1;
              var h = -1;

              var objectUrl = res.childNodes[1].childNodes[i].getAttribute('rdf:about');
              var annotationID = objectUrl.substring(objectUrl.lastIndexOf("/") + 1);
              
              var res1 = hasTargets[0].getAttribute('rdf:resource');
              var res2 = hasTargets[1].getAttribute('rdf:resource');
          
              var matchs;
              var numbers;
              if (res1.match(patt1) && res1.substring(0, textUrl.length) === textUrl) {
                matchs = res1.match(patt1);
                numbers = matchs.toString().match(patt3); 
                if (numbers.length == 2) {
                  startOffset = numbers[0];
                  endOffset = numbers[1];
                }
              }
              
              if (res1.match(patt2) && res1.substring(0, imageUrl.length) === imageUrl) {
                matchs = res1.match(patt2);
                numbers = matchs.toString().match(patt3); 
                if (numbers.length == 4) {
                    x = numbers[0];
                    y = numbers[1];
                    w = numbers[2];
                    h = numbers[3];
                }
              }

              if (res2.match(patt1) && res2.substring(0, textUrl.length) === textUrl) {
                matchs = res2.match(patt1);
                numbers = matchs.toString().match(patt3); 
                if (numbers.length == 2) {
                  startOffset = numbers[0];
                  endOffset = numbers[1];
                }
              }

              if (res2.match(patt2) && res2.substring(0, imageUrl.length) === imageUrl) {
                matchs = res2.match(patt2);
                numbers = matchs.toString().match(patt3); 
                if (numbers.length == 4) {
                  x = numbers[0];
                  y = numbers[1];
                  w = numbers[2];
                  h = numbers[3];
                }
              }
              if(startOffset != -1 && endOffset != -1 && x != -1 && y != -1 && w != -1 && h != -1) {
                addImageAndText(annotationID, objectUrl, x, y, w, h, startOffset, endOffset, false);
              }
            }
          }
        }
      },
      error: function(xhr, testStatus, error){
        console.log("Error occured: "+error+" "+xhr+" "+testStatus); 
        return;
      }
    });
  }
  
  // Add a given image and text annotation to the image and text iframe
  // READ MODE
  function addImageAndText(annotationID, objectUrl, x, y, w, h, startOffset, endOffset, editable) {
    var image_iframe = document.getElementById('image-input');
    var offset = parseInt(image_iframe.contentWindow.document.getElementById('offsetX').value, 10);
    var rectDiv = image_iframe.contentWindow.document.createElement("div");
    if (editable == true) {
      rectDiv.setAttribute('id','selectedImage');
      rectDiv.setAttribute('onclick','resetImage(' + x + ',' + y + ',' + (parseInt(x, 10) + parseInt(w,10)) + ','+ (parseInt(y, 10) + parseInt(h,10)) + ')');

      document.getElementById('imageX').value = x;
      document.getElementById('imageY').value = y;
      document.getElementById('imageW').value = w;
      document.getElementById('imageH').value = h;
      document.getElementById('image-selection').innerHTML = "Image Selection " + w + " x " + h + " px";
    } else {
      rectDiv.setAttribute('id','Image_' + annotationID);
      rectDiv.setAttribute('onclick' , 'focusImageSelection(this)');
    }
    rectDiv.setAttribute('objectUrl',objectUrl);
    rectDiv.setAttribute('x', x);
    rectDiv.setAttribute('y', y);
    rectDiv.setAttribute('w', w);
    rectDiv.setAttribute('h', h);
    rectDiv.setAttribute('style','position: absolute; overflow-x: hidden; overflow-y: hidden; z-index: 2; display: block; opacity:0.4; filter:alpha(opacity=40); background-color: rgb(127, 127, 0);  cursor:pointer; border: 3px solid yellow; left: ' + (x - 0 + offset) + 'px; top: ' + y + 'px; width: ' + (w - 4) + 'px; height: ' + (h - 4) + 'px;');
    var bookReader = image_iframe.contentWindow.document.getElementById('BookReader');
    bookReader.parentNode.appendChild(rectDiv);

    var verticalOffset = 30;
    var text_iframe = document.getElementById('text-input');
    var injectedText = text_iframe.contentWindow.document.getElementById('injected-text');
        
    var selectedText;

    if (text_iframe.contentWindow.getSelection && text_iframe.contentWindow.document.createRange) {
      var sel = text_iframe.contentWindow.getSelection();
      var range = text_iframe.contentWindow.document.createRange();
      range.selectNodeContents(injectedText);
      range.setStart(injectedText.childNodes[0], startOffset);
      range.setEnd(injectedText.childNodes[0], endOffset);
      selectedText = range.toString();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (text_iframe.contentWindow.document.selection && text_iframe.contentWindow.document.body.createTextRange) {
      var textRange = text_iframe.contentWindow.document.body.createTextRange();
      textRange.moveToElementText(injectedText);
      textRange.setStart(injectedText.childNodes[0], startOffset);
      textRange.setEnd(injectedText.childNodes[0], endOffset);
      selectedText = textRange.toString();
      textRange.select();
    }

    range.collapse(true);

    var markerTextChar = "\ufeff";
    var markerTextCharEntity = "&#xfeff;";
    var markerEl;
    var markerId = "sel_" + new Date().getTime() + "_" + Math.random().toString().substr(2);

    markerEl = text_iframe.contentWindow.document.createElement("span");
    markerEl.id = markerId;
    markerEl.appendChild(text_iframe.contentWindow.document.createTextNode(markerTextChar) );
    range.insertNode(markerEl);

    verticalOffset = markerEl.offsetTop;
    var parent = markerEl.parentNode;
    parent.removeChild(markerEl);
    parent.normalize();

    var svg_links = text_iframe.contentWindow.document.getElementById('svg-links');
    var image = text_iframe.contentWindow.document.createElement("img");
    if (editable == true) {
      image.setAttribute('id','link_image');

      document.getElementById('textStartOffset').value = startOffset;
      document.getElementById('textEndOffset').value = endOffset;
      if (selectedText.toString().length > 60) {
        var beginsWith = selectedText.toString().substring(0, 30);
        var endsWith = selectedText.toString().substring(selectedText.toString().length - 20);
        document.getElementById('text-selection').innerHTML = beginsWith + "..." + endsWith;
      } else {
        document.getElementById('text-selection').innerHTML = selectedText.toString();
      }
    } else {
      image.setAttribute('id','Text_' + annotationID);
    }
    rectDiv.setAttribute('objectUrl',objectUrl);
    image.setAttribute('style','position: absolute; left: 6px; top: ' + (verticalOffset -10) + 'px; cursor: pointer;');
    image.setAttribute('height', '16');
    image.setAttribute('width', '16');
    image.setAttribute('objectUrl',objectUrl);
    image.setAttribute('src', 'http://localhost/link_black.png');
    image.setAttribute('onclick', 'highlightImage(this)');
    image.setAttribute('startOffset', startOffset);
    image.setAttribute('endOffset', endOffset);

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
  }
  
  // Refresh the image reader with the images from the search bar
  // READ MODE
  function updateImageReader() {
    var newImageUrl = document.getElementById('image-search').value;

    clearImageSelection();

    if (mode == READ_MODE) {
        refreshAnnotations(newImageUrl, document.getElementById('textUrl').value);
    } else {
        document.getElementById('image-input').src = "http://localhost/imageReader.html?ui=embed&editable=true&url=" + encodeURIComponent(newImageUrl);
        document.getElementById('imageUrl').value = newImageUrl;
    }
  }
   
  // Refresh the text reader with the text from the search bar
  // READ MODE
  function updateTextField() {
    var newTextUrl = document.getElementById('text-search').value;
          
    clearTextSelection();

    if (mode == READ_MODE) {
      refreshAnnotations(document.getElementById('imageUrl').value, newTextUrl);
    } else {
      document.getElementById('text-input').src = "http://localhost/textReader.html?ui=embed&url=" + encodeURIComponent(newTextUrl);
      document.getElementById('textUrl').value = newTextUrl;
    }
  }

  // Set the objectUrl in memory
  // READ MODE
  function setObjectUrl(objectUrl) {
    document.getElementById('objectUrl').value = objectUrl;
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
    document.getElementById('objectUrl').value = '';
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
    document.getElementById('imageX').value = 0;
    document.getElementById('imageY').value = 0;
    document.getElementById('imageW').value = 0;
    document.getElementById('imageH').value = 0;
    document.getElementById('image-selection').innerHTML = "No selection: alignment will default to entire image";
  }

  // Clear the current selected text link in memory
  // READ/CREATE/EDIT MODE
  function clearTextSelection() {
    document.getElementById('textStartOffset').value = 0;
    document.getElementById('textEndOffset').value = 0;
    document.getElementById('text-selection').innerHTML = "No selection: alignment will default to entire text";
  }

  // Get the current selected image area in memory from the selected image in the image iframe
  // CREATE/EDIT MODE
  function updateImageSelection() {
    var image_iframe = document.getElementById('image-input');

    var selectedImage = image_iframe.contentWindow.document.getElementById('selectedImage');
    if (selectedImage) {
      selectedImage.parentNode.removeChild(selectedImage);
    }

    var offset = image_iframe.contentWindow.document.getElementById('offsetX').value;
    var x1 = image_iframe.contentWindow.document.getElementById('imageX1').value;
    var y1 = image_iframe.contentWindow.document.getElementById('imageY1').value;
    var x2 = image_iframe.contentWindow.document.getElementById('imageX2').value;
    var y2 = image_iframe.contentWindow.document.getElementById('imageY2').value;
    var height = image_iframe.contentWindow.document.getElementById('imageHeight').value;
    var width = image_iframe.contentWindow.document.getElementById('imageWidth').value;
    
    if (image_iframe.contentWindow.selectionVisible()) {
      document.getElementById('imageX').value = x1;
      document.getElementById('imageY').value = y1;
      document.getElementById('imageW').value = width;
      document.getElementById('imageH').value = height;
      document.getElementById('image-selection').innerHTML = "Image Selection " + image_iframe.contentWindow.document.getElementById('imageWidth').value + " x " +
                                  image_iframe.contentWindow.document.getElementById('imageHeight').value + " px";

      var rectDiv = image_iframe.contentWindow.document.createElement("div");
      rectDiv.setAttribute('id','selectedImage');
      rectDiv.setAttribute('onclick','resetImage(' + x1 + ',' + y1 + ',' + x2 + ','+ y2 + ')');
      rectDiv.setAttribute('style','position: absolute; overflow-x: hidden; overflow-y: hidden; z-index: 2; display: block; opacity:0.4; filter:alpha(opacity=40); background-color: rgb(127, 127, 0);  cursor:pointer; border: 3px solid yellow; left: ' + (parseInt(x1, 10) + parseInt(offset, 10)) + 'px; top: ' + y1 + 'px; width: ' + (parseInt(width, 10) - 4) + 'px; height: ' + (parseInt(height, 10) - 4) + 'px;');
      var bookReader = image_iframe.contentWindow.document.getElementById('BookReader');
      bookReader.parentNode.appendChild(rectDiv);
    } else {
      document.getElementById('imageX').value = 0;
      document.getElementById('imageY').value = 0;
      document.getElementById('imageW').value = 0;
      document.getElementById('imageH').value = 0;
      document.getElementById('image-selection').innerHTML = "No selection: alignment will default to entire image";
    }
  }

  // Get the current selected text area in memory from the selected text in the text iframe
  // CREATE/EDIT MODE
  function updateTextSelection() {
    var text_iframe = document.getElementById('text-input');
    var container = text_iframe.contentWindow.document.getElementById('injected-text');

    var selectedImage = text_iframe.contentWindow.document.getElementById('link_image');
    if (selectedImage) {
      selectedImage.parentNode.removeChild(selectedImage);
    }

    var userSelection;
    if (text_iframe.contentWindow.getSelection) {
      userSelection = text_iframe.contentWindow.getSelection();
    } else if (text_iframe.contentWindow.document.selection) { 
      userSelection = text_iframe.contentWindow.document.selection.createRange();
    }

    var selectedText = userSelection;
    if (userSelection.text) {
      selectedText = userSelection.text;
    }

    if (selectedText.toString().length == 0) {
      document.getElementById('textStartOffset').value = 0;
      document.getElementById('textEndOffset').value = 0;

      document.getElementById('text-selection').innerHTML = "No selection: alignment will default to entire text"; 
      return;
    }

    if (userSelection.anchorNode.parentNode.id != 'injected-text') {
      return;
    }

    var range;
    if (userSelection.getRangeAt) {
      range = userSelection.getRangeAt(0);
    } else {
      var range = document.createRange();
      range.setStart(userSelection.anchorNode,userSelection.anchorOffset);
      range.setEnd(userSelection.focusNode,userSelection.focusOffset);
    }

    var startOffset = 0;
    var endOffset = 0;
    if (text_iframe.contentWindow.getSelection) {
      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(text_iframe.contentWindow.document);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      startOffset = preCaretRange.toString().length;

      preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(text_iframe.contentWindow.document);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      endOffset = preCaretRange.toString().length;
    } else if (text_iframe.contentWindow.document.selection) {
      var preCaretTextRange = document.body.createTextRange();
      preCaretTextRange.moveToElementText(text_iframe.contentWindow.document);
      preCaretTextRange.setEndPoint("StartToStart", range);
      startOffset = preCaretTextRange.text.length;

      preCaretTextRange = document.body.createTextRange();
      preCaretTextRange.moveToElementText(text_iframe.contentWindow.document);
      preCaretTextRange.setEndPoint("EndToEnd", range);
      endOffset = preCaretTextRange.text.length;
    }

    document.getElementById('textStartOffset').value = startOffset;
    document.getElementById('textEndOffset').value = endOffset;
    if (selectedText.toString().length > 60) {
      var beginsWith = selectedText.toString().substring(0, 30);
      var endsWith = selectedText.toString().substring(selectedText.toString().length - 20);
      document.getElementById('text-selection').innerHTML = beginsWith + "..." + endsWith;
    } else {
      document.getElementById('text-selection').innerHTML = selectedText.toString();
    }

    range.collapse(true);

    var markerTextChar = "\ufeff";
    var markerTextCharEntity = "&#xfeff;";
    var markerEl;
    var markerId = "sel_" + new Date().getTime() + "_" + Math.random().toString().substr(2);

    markerEl = text_iframe.contentWindow.document.createElement("span");
    markerEl.id = markerId;
    markerEl.appendChild(text_iframe.contentWindow.document.createTextNode(markerTextChar) );
    range.insertNode(markerEl);

    var verticalOffset = markerEl.offsetTop;
    var parent = markerEl.parentNode;
    parent.removeChild(markerEl);
    parent.normalize();

    var svg_links = text_iframe.contentWindow.document.getElementById('svg-links');
    var image = text_iframe.contentWindow.document.createElement("img");
    image.setAttribute('id','link_image');
    image.setAttribute('style','position: absolute; left: 6px; top: ' + (verticalOffset - 10) + 'px; cursor: pointer;');
    image.setAttribute('height', '16');
    image.setAttribute('width', '16');
    image.setAttribute('src', 'http://localhost/link_black.png');
    image.setAttribute('onclick', 'highlightImage(this)');
    image.setAttribute('startOffset', startOffset);
    image.setAttribute('endOffset', endOffset);
    svg_links.appendChild(image);
    if (text_iframe.contentWindow.getSelection) {
      if (text_iframe.contentWindow.getSelection().empty) {  // Chrome
        text_iframe.contentWindow.getSelection().empty();
      } else if (text_iframe.contentWindow.getSelection().removeAllRanges) {  // Firefox
        text_iframe.contentWindow.getSelection().removeAllRanges();
      }
    } else if (text_iframe.contentWindow.document.selection) {  // IE?
      text_iframe.contentWindow.document.selection.empty();
    }

  }

  // Submit a new alignment
  // CREATE MODE
  function submit() {
    var startOffset = document.getElementById('textStartOffset').value;
    var endOffset = document.getElementById('textEndOffset').value;

    var x = document.getElementById('imageX').value;
    var y = document.getElementById('imageY').value;
    var height = document.getElementById('imageH').value;
    var width = document.getElementById('imageW').value;

    var imageUrl = document.getElementById('imageUrl').value;
    var textUrl = document.getElementById('textUrl').value;

    var createData = "<rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:dc='http://purl.org/dc/elements/1.1/'     xmlns:oac='http://www.openannotation.org/ns/'><oac:Annotation rdf:about='http://localhost:8081/lorestore/oac/dummy'><rdf:type rdf:resource='http://austese.net/ns/annotation/Alignment'/><oac:hasTarget rdf:resource='" + imageUrl + "#xywh=" + x +"," + y +"," + width +"," + height +"'/><oac:hasTarget rdf:resource='" + textUrl + "#char=" + startOffset + "," + endOffset + "'/><" + "/" + "oac:Annotation ><" + "/" + "rdf:RDF>";

    jQuery.ajax({
      url: 'http://localhost/lorestore/j_spring_security_check?j_password=adminpwd&j_username=admin&submit=',
      type: 'POST',
        async: false,
        contentType: "application/rdf+xml",      
        success: function(res) {
      },
      error: function(xhr, testStatus, error){
        console.log("Error occured: "+error+" "+xhr+" "+testStatus); 
        return;
      }
    });

    var objectUrl;

    jQuery.ajax({
      url: 'http://localhost/lorestore/oac',
      type: 'POST',
      data: createData,
      async: false,
      contentType: "application/rdf+xml",      
      success: function(res) {
              objectUrl = res.childNodes[1].childNodes[1].getAttribute('rdf:about');
      },
      error: function(xhr, testStatus, error){
              console.log("Error occured: "+error+" "+xhr+" "+testStatus); 
              return;
      }
    });

    var updateData = '<?xml-stylesheet type="text/xsl" href="/lorestore/stylesheets/OAC.xsl"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="' + objectUrl + '" ><rdf:type rdf:resource="http://www.openannotation.org/ns/Annotation"/><rdf:type rdf:resource="http://austese.net/ns/annotation/Alignment"/><hasTarget xmlns="http://www.openannotation.org/ns/" rdf:resource="' + imageUrl + '#xywh=' + x +',' + y +',' + width +',' + height +'"/><hasTarget xmlns="http://www.openannotation.org/ns/" rdf:resource="' + textUrl + '#char=' + startOffset + ',' + endOffset + '"/><' + '/' + 'rdf:Description><rdf:Description rdf:about="' + textUrl + '#char=' + startOffset + ',' + endOffset + '"><isPartOf xmlns="http://purl.org/dc/terms/" rdf:resource="' + textUrl + '"' + '/' + '><' + '/' + 'rdf:Description><rdf:Description rdf:about="' + imageUrl + '#xywh=' + x +',' + y +',' + width +',' + height +'"><isPartOf xmlns="http://purl.org/dc/terms/" rdf:resource="' + imageUrl + '"/><' + '/' + 'rdf:Description><' + '/' + 'rdf:RDF>';

    jQuery.ajax({
      url: objectUrl,
      type: 'PUT',
      data: updateData,
      async: false,
      contentType: "application/rdf+xml",      
      success: function(res) {
        console.log(res);
      },
      error: function(xhr, testStatus, error){
        console.log("Error occured: "+error+" "+xhr+" "+testStatus); 
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
    var endOffset = document.getElementById('textEndOffset').value;

    var x = document.getElementById('imageX').value;
    var y = document.getElementById('imageY').value;
    var height = document.getElementById('imageH').value;
    var width = document.getElementById('imageW').value;

    var imageUrl = document.getElementById('imageUrl').value;
    var textUrl = document.getElementById('textUrl').value;

    var objectUrl =  document.getElementById('objectUrl').value;

    jQuery.ajax({
      url: 'http://localhost/lorestore/j_spring_security_check?j_password=adminpwd&j_username=admin&submit=',
      type: 'POST',
      async: false,
      contentType: "application/rdf+xml",      
      success: function(res) {
      },
      error: function(xhr, testStatus, error){
        console.log("Error occured: "+error+" "+xhr+" "+testStatus); 
        return;
      }
    });

    var updateData = '<?xml-stylesheet type="text/xsl" href="/lorestore/stylesheets/OAC.xsl"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="' + objectUrl + '" ><rdf:type rdf:resource="http://www.openannotation.org/ns/Annotation"/><rdf:type rdf:resource="http://austese.net/ns/annotation/Alignment"/><hasTarget xmlns="http://www.openannotation.org/ns/" rdf:resource="' + imageUrl + '#xywh=' + x +',' + y +',' + width +',' + height +'"/><hasTarget xmlns="http://www.openannotation.org/ns/" rdf:resource="' + textUrl + '#char=' + startOffset + ',' + endOffset + '"/><' + '/' + 'rdf:Description><rdf:Description rdf:about="' + textUrl + '#char=' + startOffset + ',' + endOffset + '"><isPartOf xmlns="http://purl.org/dc/terms/" rdf:resource="' + textUrl + '"' + '/' + '><' + '/' + 'rdf:Description><rdf:Description rdf:about="' + imageUrl + '#xywh=' + x +',' + y +',' + width +',' + height +'"><isPartOf xmlns="http://purl.org/dc/terms/" rdf:resource="' + imageUrl + '"/><' + '/' + 'rdf:Description><' + '/' + 'rdf:RDF>';

    jQuery.ajax({
      url: objectUrl,
      type: 'PUT',
      data: updateData,
      async: false,
      contentType: "application/rdf+xml",      
      success: function(res) {
        console.log(res);
      },
      error: function(xhr, testStatus, error){
        console.log("Error occured: "+error+" "+xhr+" "+testStatus); 
        return;
      }
    });

    clearImageSelection();
    clearTextSelection();
    viewAlignment();
  }

  // Delete an existing alignment
  // EDIT MODE
  function deleteAlignment() {
    if (confirm("Are you sure you want to delete this?")) {
      var objectUrl =  document.getElementById('objectUrl').value;

      jQuery.ajax({
        url: objectUrl,
        type: 'DELETE',
        async: false,
        contentType: "application/rdf+xml",      
        success: function(res) {
          console.log(res);
        },
        error: function(xhr, testStatus, error){
          console.log("Error occured: "+error+" "+xhr+" "+testStatus); 
          return;
        }
      });

      clearImageSelection();
      clearTextSelection();
      viewAlignment();
    }
  }
  
  // Update view for CREATE MODE
  function addAlignment() {
      mode = CREATE_MODE;
      
      document.getElementById('image-input').src = "http://localhost/imageReader.html?ui=embed&editable=true&url=" + encodeURIComponent(document.getElementById('imageUrl').value);
      document.getElementById('text-input').src = "http://localhost/textReader.html?ui=embed&url=" + encodeURIComponent(document.getElementById('textUrl').value);
      document.getElementById('createNewRow').style.display = 'table-row';
      document.getElementById('editRow').style.display = 'none';
      document.getElementById('selectionRow').style.display = 'table-row';
      document.getElementById('viewRow').style.display = 'none';
  }

  // Update view for READ MODE
  function viewAlignment() {
      mode = READ_MODE;
      
      document.getElementById('createNewRow').style.display = 'none';
      document.getElementById('editRow').style.display = 'none';
      document.getElementById('selectionRow').style.display = 'none';
      document.getElementById('viewRow').style.display = 'table-row';

      refreshAnnotations(document.getElementById('imageUrl').value, document.getElementById('textUrl').value);
  }

  // Update view for EDIT MODE
  function editAlignment() {
      mode = EDIT_MODE;

      var image_iframe = document.getElementById('image-input');
      var objectUrl = document.getElementById('objectUrl').value;
      var annotationID = objectUrl.substring(objectUrl.lastIndexOf("/") + 1);
      var selectedImage = image_iframe.contentWindow.document.getElementById('Image_' + annotationID);

      var x = selectedImage.getAttribute('x');
      var y = selectedImage.getAttribute('y');
      var w = selectedImage.getAttribute('w');
      var h = selectedImage.getAttribute('h');

      var text_iframe = document.getElementById('text-input');
      var selectedText = text_iframe.contentWindow.document.getElementById('Text_' + annotationID);

      var startOffset = selectedText.getAttribute('startOffset');
      var endOffset = selectedText.getAttribute('endOffset');

      document.getElementById('text-input').onload = function() {
        document.getElementById('image-input').onload = function() {
          addImageAndText(annotationID, objectUrl, x, y, w, h, startOffset, endOffset, true);
          document.getElementById('image-input').onload = function() {}
          document.getElementById('text-input').onload = function() {}
        }
        document.getElementById('image-input').src = "http://localhost/imageReader.html?ui=embed&editable=true&url=" + encodeURIComponent(document.getElementById('imageUrl').value);
      }
      document.getElementById('text-input').src = "http://localhost/textReader.html?ui=embed&url=" + encodeURIComponent(document.getElementById('textUrl').value);

      document.getElementById('createNewRow').style.display = 'none';
      document.getElementById('editRow').style.display = 'table-row';
      document.getElementById('selectionRow').style.display = 'table-row';
      document.getElementById('viewRow').style.display = 'none';
  }