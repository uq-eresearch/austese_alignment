<?php
$module_path = drupal_get_path('module', 'alignment');
?>
<div class="login-popup" id="login-box" style="margin-top: -83px; margin-left: -122px; ">
    <a id="annoClose" class="close" href="#">
        <i class="icon-remove"></i>
    </a>
    <label for="edit-openid-identifier" class="control-label">Log in using OpenID</label>
    <div class="controls">
        <input type="text" id="edit-openid-identifier" name="openid_identifier" value="https://www.google.com/accounts/o8/id" style="width: 292px" maxlength="255" class="form-text" />
        <p class="help-block">
            <a href="http://openid.net/" style="font-size: .8em;">What is OpenID?</a>
            <button id="annoLogin" class="btn form-submit" id="edit-submit" name="op" value="Log in" style="float:right">Log in</button>
        </p>
    </div>
</div>
<div class="login-popup" id="login-waiting-box" style="margin-top: -64px; margin-left: -64px; width: 128px; height: 128px;">
    <a id="annoExitLogin" class="close" href="#" style="position:aboslute">
        <i class="icon-remove"></i>
    </a>
    <img src="/<?php print $module_path; ?>/resources/loading.gif" style="position:absolute; z-index: -1;"/>
</div>
<div id="alignment-ui" data-module="<?php print $module_path; ?>" class="span12">
   <div class="row">
       <div class="span6">
            <div class="row ">
                <fieldset class="control-group">
                   <div class="input-append">
                       <input id="image-search" type="text" value="<?php print $left; ?>" /><span id="image-search-button" class="add-on"><i class="icon-search"></i></span>
                   </div>
                </fieldset>
            </div>
            <div class="row">
                <iframe id="image-input"
                        src="about:blank" width="97%" height="550px"
                        style="overflow: hidden" scrolling="no"></iframe>
            </div>
       </div>
       <div class="span6">
            <div class="row">
                <fieldset class="control-group">
                   <div class="input-append">
                       <input id="text-search" type="text" value="<?php print $right; ?>" /><span id="text-search-button" class="add-on"><i class="icon-search"></i></span>
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
   <br />
   <div class="row" id="viewRow">
       <div class="form-actions" id="edit-actions">
           <a id="addAlignmentLink" href="javascript:void(0);"><i class="icon-plus"></i> Add New</a><br />
           <a id="editAlignmentLink" href="javascript:void(0);"><i class="icon-wrench"> </i> Edit Existing</a><br />
           <a id="deleteAlignmentLink" href="javascript:void(0);"><i class="icon-remove"> </i> Delete Existing</a>
       </div>
   </div>
   <div class="row" id="selectionRow" style="display: none">
        <div class="span6">
            <table>
                <tr>
                    <td>
                        <button id="imageSelBtn" style="margin: 0px 4px;" class="btn">
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
                        <button id="textSelBtn" style="margin: 0px 4px;" class="btn">
                            <i class="icon-pencil"></i>
                        </button>
                        <p style="display: none">
                            <input style="display: none" type="hidden" id="textUrl" value="" />
                            <input style="display: none" type="hidden" id="startOffsetXpath" value="/html[1]/body[1]/div[2]" /> 
                            <input style="display: none" type="hidden" id="endOffsetXpath" value="/html[1]/body[1]/div[2]" /> 
                            <input style="display: none" type="hidden" id="textStartOffset" value="0" /> 
                            <input style="display: none" type="hidden" id="textEndOffset" value="2" />
                        </p>
                    </td>
                    <td><label id="text-selection">No selection: alignment will default to entire text</label></td>
                </tr>
            </table>
        </div>
   </div>
   <div class="row" id="createNewRow" style="display: none">
        <div class="form-actions" id="edit-actions">
            <button class="btn btn-primary form-submit" id="new-submit" name="op" value="Save">Save</button>
            <button class="btn form-submit" id="new-cancel" name="op" value="Cancel">Cancel</button>
        </div>
   </div>
   <div class="row" id="editRow" style="display: none">
        <div class="form-actions" id="edit-actions">
            <button class="btn btn-primary form-submit" id="edit-update" name="op" value="Update">Update</button>
            <button class="btn btn-danger form-submit" id="edit-delete" name="op" value="Delete">Delete</button>
            <button class="btn form-submit" id="edit-cancel" name="op" value="Cancel">Cancel</button>
            <input style="display: none" type="hidden" id="objectUrl" value="" />
        </div>
   </div>
</div>
