<?php
$module_path = drupal_get_path('module', 'alignment');
$rep_module_path = drupal_get_path('module','repository');
$project = null;
if (isset($_GET['project'])) {
 $project = $_GET['project'];
}
?>
<div id="metadata" 
 data-project="<?php print $project; ?>"
 data-repmodulepath="<?php print $rep_module_path; ?>"
 data-lhs="<?php print $left; ?>"
 data-rhs="<?php print $right; ?>"
 data-module="<?php print $module_path; ?>">
</div>

   <div class="row-fluid">
       <div class="span6">
         <input type="hidden" class="span12" id="lhs-select" value="<?php print $left; ?>"/>
       </div>
       <div class="span6">
         <input type="hidden" class="span12" id="rhs-select" value="<?php print $right; ?>"/>
       </div>
  </div>
       
  <div class="row-fluid">
    <iframe class="span6" id="image-input"
      src="about:blank" width="100%" height="550px"
      style="overflow: hidden" scrolling="no"></iframe>
    <iframe class="span6" id="text-input"
      src="about:blank" width="100%" height="550px"
      style="overflow: hidden" scrolling="no"></iframe>
   </div>
   
   <div class="row-fluid" id="viewRow">
       <div class="form-actions" id="edit-actions">
           <a id="addAlignmentLink" href="javascript:void(0);"><i class="icon-plus"></i> Add New</a><br />
           <a id="editAlignmentLink" href="javascript:void(0);"><i class="icon-wrench"> </i> Edit Existing</a><br />
           <a id="deleteAlignmentLink" href="javascript:void(0);"><i class="icon-remove"> </i> Delete Existing</a>
       </div>
   </div>
   <div class="row-fluid" id="selectionRow" style="display: none">
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
   <div class="row-fluid" id="createNewRow" style="display: none">
        <div class="form-actions" id="edit-actions">
            <button class="btn btn-primary form-submit" id="new-submit" name="op" value="Save">Save</button>
            <button class="btn form-submit" id="new-cancel" name="op" value="Cancel">Cancel</button>
        </div>
   </div>
   <div class="row-fluid" id="editRow" style="display: none">
        <div class="form-actions" id="edit-actions">
            <button class="btn btn-primary form-submit" id="edit-update" name="op" value="Update">Update</button>
            <button class="btn btn-danger form-submit" id="edit-delete" name="op" value="Delete">Delete</button>
            <button class="btn form-submit" id="edit-cancel" name="op" value="Cancel">Cancel</button>
            <input style="display: none" type="hidden" id="objectUrl" value="" />
        </div>
   </div>

