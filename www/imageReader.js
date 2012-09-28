function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}

var areaSelect;

window.onload = function() {
  br = new BookReader();

  br.getPageWidth = function(index) {
    return 800;
  }

  br.getPageHeight = function(index) {
    return 1200;
  }

  br.getPageURI = function(index, reduce, rotate) {
    var leafStr = '000';
    var imgStr = (index+1).toString();
    var re = new RegExp("0{"+imgStr.length+"}$");
    if(getUrlVars()["url"]) {
      var url = decodeURIComponent(getUrlVars()["url"]);
    } else {
      var url = 'http://www.archive.org/download/BookReader/img/page'+leafStr.replace(re, imgStr) + '.jpg';
    }
    return url;
  }

  br.getPageSide = function(index) {
    if (0 == (index & 0x1)) {
      return 'R';
    } else {
      return 'L';
    }
  }

  br.getSpreadIndices = function(pindex) {   
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
  }

  br.getPageNum = function(index) {
    return index+1;
  }

  br.numLeafs = 1;

  br.bookTitle= 'Open Library BookReader Presentation';
  br.bookUrl  = 'http://openlibrary.org';

  br.imagesBaseURL = '../BookReader/images/';

  br.getEmbedCode = function(frameWidth, frameHeight, viewParams) {
    return "Embed code not supported in bookreader demo.";
  }

  br.init();
  
  $('#BRtoolbar').hide();
  $('#BRnav').hide();
  $('#textSrch').hide();
  $('#btnSrch').hide();

  $('#offsetX').val(Math.round($('#pageID').offset().left));

  if (getUrlVars()["editable"] == 'true') {
    areaSelect = $('#pageID').imgAreaSelect({
      handles: true,
      instance: true,
      onSelectEnd: function(img, selection) {
        $('#offsetX').val(Math.round($(img).offset().left));
        $('#imageX1').val(selection.x1);
        $('#imageY1').val(selection.y1);
        $('#imageX2').val(selection.x2);
        $('#imageY2').val(selection.y2);
        $('#imageWidth').val(selection.width);
        $('#imageHeight').val(selection.height);
      }
    });  
  } else {
    $('#pageID').click(function() {
      $("[selected=selected]").attr("selected","")
        .css("background-color","rgb(127,127,0)")
        .css("border","3px solid yellow");
      parent.window.clearObjectUrl();
      parent.window.clearSelectedText();
    });
  }
}

function resetImage(x1,y1,x2,y2) {
  areaSelect.setOptions({ show: true });
  areaSelect.setSelection(x1,y1,x2,y2);
  areaSelect.update();
}

function selectionVisible() {
  return !(areaSelect.getSelection().width == 0 && areaSelect.getSelection().height == 0);
}

function focusImageSelection(img, sync) {
  if (img.getAttribute('selected') != 'selected') {
    $("[selected=selected]").attr("selected","")
      .css("background-color","rgb(127,127,0)")
      .css("border","3px solid yellow");
    img.style.border = '3px dotted purple';
    img.style.backgroundColor = 'rgb(127,0,127)';
    img.setAttribute('selected','selected');

    if (sync == true) {
      parent.window.setObjectUrl(img.getAttribute("objectUrl"));
      parent.window.setSelectedText(img.getAttribute("objectUrl"));
    }
  }
}

function setSelectedImage(objectUrl) {
  $("[selected=selected]").attr("selected","")
    .css("background-color","rgb(127,127,0)")
    .css("border","3px solid yellow");
  
  var img = $("[objectUrl='" + objectUrl + "']")[0];
  img.style.border = '3px dotted purple';
  img.style.backgroundColor = 'rgb(127,0,127)';
  img.setAttribute('selected','selected');
}

function clearSelectedImage() {
  $("[selected=selected]").attr("selected","")
    .css("background-color","rgb(127,127,0)")
    .css("border","3px solid yellow");
}

function getSelectedObjectUrl() {
  var selectedDivs = $("[selected=selected]");
  if (selectedDivs.length != 1) {
    return;
  }
  return selectedDivs[0].getAttribute('objectUrl');
}