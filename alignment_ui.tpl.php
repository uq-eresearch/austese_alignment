<?php
$module_path = drupal_get_path('module', 'alignment');
?>


<link rel="stylesheet" type="text/css" href="/alignment/alignment.css" />
<div class="login-popup" id="login-box" style="width:220px"><p>Lorestore login required<a class="close" href="#" onclick="exitLogin()"><i class="icon-remove"></i></a></p><form action="/lorestore/j_spring_security_check" class="signin" method="post" style="margin: 0px" onsubmit="return false;" name="loginform><fieldset class="textbox"><input type="text" placeholder="Username" name="j_username" id="j_username" style="width:212px"/><input type="password" placeholder="Password" name="j_password" id="j_password" style="width:212px; margin-bottom: 4px;" /><p id='login_error_message' style='color: red; display: none;'>Invalid username or password.</p><button type="button" style="width:105px; margin-top: 4px; margin-right: 5px;" onclick="login()">Login</button><button type="button" style="width:105px; margin-top: 4px; margin-left: 5px;" onclick="exitLogin()">Cancel</button></fieldset></form></div>
<table width="1140px" cellpadding="10" style="margin-left: auto; margin-right: auto;">
  <tr>
    <td>
      <div class="navbar-search pull-left">
        <input id="image-search" type="text" class="search-query" placeholder="Search" style="width:490px; margin: 0px;" /><button style="margin: 0px 0px 0px 4px;" onclick="updateImageReader();" class="btn" id="image-search-button"><i class="icon-search"></i></button>
      </div>
    </td>
    <td>
      <div class="navbar-search pull-left">
        <input id="text-search" type="text" class="search-query" placeholder="Search" style="width:490px; margin: 0px;" /><button style="margin: 0px 0px 0px 4px;" onclick="updateTextReader();"  type="submit" class="btn" id="text-search-button"><i class="icon-search"></i></button>
      </div>
    </td>
  </tr>
  <tr>
    <td width="50%" height="600px">
      <iframe id="image-input" src="about:blank" width="100%" height="100%"></iframe>
    </td>
    <td width="50%" height="600px">
      <iframe id="text-input" src="about:blank" width="100%" height="100%" style="overflow:hidden" scrolling="no"></iframe>
    </td>
  </tr>  
  <tr id="viewRow">
    <td colspan="2">
      <div class="form-actions form-wrapper" id="edit-actions">
        <a href="javascript:void(0);" onclick="addAlignment(); return false;"><i class="icon-plus"></i> Add New</a><br /><a href="javascript:void(0);" onclick="editAlignment(); return false;"><i class="icon-wrench"></i> Edit Existing</a><br /><a href="javascript:void(0);" onclick="confirmDeleteAlignment(); return false;"><i class="icon-remove"></i> Delete Existing</a>
      </div>
    </td>
  </tr>
  <tr id="selectionRow" style="display:none">
    <td width="50%">
      <table>
        <tr>
          <td>
            <button style="margin: 0px 4px;" onclick="updateImageSelection();" class="btn"><i class="icon-pencil"></i></button>
            <p style="display:none">
              <input style="display:none" type="hidden" id="imageUrl" value=""/>
              <input style="display:none" type="hidden" id="imageX" value="0"/>
              <input style="display:none" type="hidden" id="imageY" value="0"/>
              <input style="display:none" type="hidden" id="imageW" value="0"/>
              <input style="display:none" type="hidden" id="imageH" value="0"/>
            </p>
          </td>
          <td>
            <label style="margin: 0px 5px" id="image-selection">No selection: alignment will default to entire image</label>
          </td>
        </tr>
      </table>
    </td>
    <td width="50%">
      <table>
        <tr>
          <td>
            <button style="margin: 0px 4px;" onclick="updateTextSelection();" class="btn"><i class="icon-pencil"></i></button>
            <p style="display:none">
              <input style="display:none" type="hidden" id="textUrl" value=""/>
              <input style="display:none" type="hidden" id="startOffsetXpath" value=""/>
              <input style="display:none" type="hidden" id="endOffsetXpath" value=""/>
              <input style="display:none" type="hidden" id="textStartOffset" value="0"/>
              <input style="display:none" type="hidden" id="textEndOffset" value="0"/>
            </p>
          </td>
          <td>
            <label id="text-selection">No selection: alignment will default to entire text</label>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr id="createNewRow" style="display:none">
    <td colspan="2">
      <div class="form-actions form-wrapper" id="edit-actions">
        <button class="btn btn-primary form-submit" id="new-submit" name="op" value="Save" onclick="submit()">Save</button> <button class="btn form-submit" id="new-cancel" name="op" value="Cancel" onclick="viewAlignment();">Cancel</button>
      </div>
    </td>
  </tr>
  <tr id="editRow" style="display:none"> 
    <td colspan="2">
      <div class="form-actions form-wrapper" id="edit-actions">
        <button class="btn btn-primary form-submit" id="edit-update" name="op" value="Update" onclick="update()">Update</button> <button class="btn btn-danger form-submit" id="edit-delete" name="op" value="Delete" onclick="confirmDeleteAlignment()">Delete</button> <button class="btn form-submit" id="edit-cancel" name="op" value="Cancel" onclick="viewAlignment()">Cancel</button> 
         <input style="display:none" type="hidden" id="objectUrl" value=""/>
      </div>
    </td>
  </tr>
</table>
<script>
  var READ_MODE = 0;
  var CREATE_MODE = 1;
  var EDIT_MODE = 2;
  var mode = READ_MODE;

  window.onload = function(e){ 
    var defaultImage = '<?php print $left; ?>';
    var defaultText = '<?php print $right; ?>';
    refreshAnnotations(defaultImage, defaultText);
  }

</script>