(function($) {

    Drupal.behaviors.alignment_openid = {
      attach: function (context) {
			  // Overwrite the default behavior 
        Drupal.behaviors.openid = {
          attach: function (context) {
            var loginElements = $('.form-item-name, .form-item-pass, li.openid-link');
            var openidElements = $('.form-item-openid-identifier, li.user-link');
            var cookie = $.cookie('Drupal.visitor.openid_identifier');

            $('.page-header').text('Login using OpenID');
            $('.user-link').children().text('Log in using username/password');
    
            // This behavior attaches by ID, so is only valid once on a page.
            if (!$('#edit-openid-identifier.openid-processed').length) {
              if (cookie) {
                $('#edit-openid-identifier').val(cookie);
              }
      
              $('#edit-openid-identifier').addClass('openid-processed');
              loginElements.hide();
              // Use .css('display', 'block') instead of .show() to be Konqueror friendly.
              openidElements.css('display', 'block');
            }

            $('li.openid-link:not(.openid-processed)', context)
              .addClass('openid-processed')
              .click(function () {
                loginElements.hide();
                openidElements.css('display', 'block');
        
                // Remove possible error message.
                $('#edit-name, #edit-pass').removeClass('error');
                $('div.messages.error').hide();
                $('.page-header').text('Login using OpenID');
                // Set focus on OpenID Identifier field.
                $('#edit-openid-identifier')[0].focus();
                return false;
              });
    
            $('li.user-link:not(.openid-processed)', context)
              .addClass('openid-processed')
              .click(function () {
                openidElements.hide();
                loginElements.css('display', 'block');
                // Clear OpenID Identifier field and remove possible error message.
                $('#edit-openid-identifier').val('').removeClass('error');
                $('div.messages.error').css('display', 'block');
                $('.page-header').text('Login');
                // Set focus on username field.
                $('#edit-name')[0].focus();
                return false;
              });
          }
        };
      }
    };
})(jQuery);
