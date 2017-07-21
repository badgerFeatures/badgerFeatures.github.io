/**
 * @file Base helper and dev functions
 */

var d = document.documentElement;

/**
 * Add livereload.js to touch devices.
 *
 * Assuming the SITENAME.1.2.3.4.xip.io hostname is in use this will construct
 * <script type-"text/javascript" src="//1.2.3.4:35729/livereload.js?snipver=1"></script>
 */
if (trackOptions.useLiveReload) {
  var pattern = new RegExp("((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))(\.xip\.io)$"),
    matches = window.location.hostname.match(pattern);
  if (matches !== null && matches[1] && Modernizr && Modernizr.touch) {
    var head = document.getElementsByTagName('head')[0],
      lr = document.createElement('script');
    lr.type = 'text/javascript';
    lr.src = '//'+ matches[1] +':35729/livereload.js?snipver=1';
    head.appendChild(lr);
  }
}

/**
 * Check if object is empty
 */
function isEmptyObject(obj) {
  for(var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }
  return true;
}

isEmpty = function(x,p){for(p in x)return!1;return!0};


/**
 * Return the current orientation. Checks document width vs height if it's
 * not supported by the browser
 */
function getOrientation() {
  var $d = $d || $(document),
    orientation = window.orientation || (($d.width() > $d.height()) ? 90 : 0);

  return (orientation == -90 || orientation == 90) ? 'landscape' : 'portrait';
}

function getMarkerPosition() {
  var markerPosition = d.clientWidth / 1280 * 100;
  return (markerPosition > 100) ? 100 : markerPosition;
}

(function($) {
  /**
   * Add debug class to display CSS based debugging info.
   */
  if (trackOptions.debug) {
    $('html').addClass('debug');
    $('.page').append('<ul class="colour-guide"><li></li><li></li><li></li></ul><div class="marker"></div>');
    var $marker = $('.marker');
    $marker.css('left', getMarkerPosition() + '%');
    $(window).bind('resize orientationchange', function(e) {
      $marker.css('left', getMarkerPosition() + '%');
    });
  }
  if (trackOptions.viewportInfo) {
    $('.page').append('<div class="datasheet"><div class="viewport"><div class="wrapper">W: <span class="width"></span></div><div class="wrapper">H: <span class="height"></span></div><div class="wrapper">O: <span class="orientation"></span></div></div><div class="modernizr"></div></div>');

    // Client width / height
    var $vWidth = $('.viewport .width'),
      $vHeight = $('.viewport .height'),
      $vOrientation = $('.viewport .orientation');

    $vWidth.text(d.clientWidth);
    $vHeight.text(d.clientHeight);
    $vOrientation.text(getOrientation());

    $(window).bind('resize orientationchange', function(e) {
      $vWidth.text(d.clientWidth);
      $vHeight.text(d.clientHeight);
      $vOrientation.text(getOrientation());
    });

    // // List Modernizr classes
    $('.modernizr').text($('html').attr('class'));
  }

  /**
   * Auto Offline Mode for External Links and Videos elems that dont already have an offline message, This is used to make sure anything that links to a live resource has the correct data atrribute
   */
  if(!isEmptyObject(trackOptions.ctas)){
    for (var i in trackOptions.ctas) {
      $cta = $('#'+i);
      if(!$cta.attr('data-offline-message')) $cta.attr('data-offline-message', '');
    }
  }

  if(!isEmptyObject(trackOptions.videos)){
    for (var j in trackOptions.videos) {
      $videoBtn = $('#'+j);
      if(!$videoBtn.attr('data-offline-message')) $videoBtn.attr('data-offline-message', 'Please go online to watch this video');
    }
  }

  /**
   * Offline external link handling
   *
   * Display a message when clicking on http links or any element which has the
   * data-offline-message attribute set when browser is offline
   */
  // Generate overlay markup
  $('body').append('<div id="error-overlay"><div class="error-box"><div class="message"></div><div class="close-button">OK</div></div></div>');

  // Event listener
  //$('a[href^="http"]').attr('target', '_blank');
  /*$('a[href^="http"], *[data-offline-message]').bind('click', function(e) {

  });*/
  $('body').on('click', 'a[href]', function(e) {
    $(this).attr('target', '_blank');
    offlineHandler(e, $(this));
  });
  $('body').on('click', '*[data-offline-message]', function(e) {
    offlineHandler(e, $(this));
  });

  function offlineHandler(e, $this){
    if (_ogaq.online() === false) {
      e.preventDefault();
      var message = $this.data('offline-message') || 'You need to go online to visit this site.';
      $('#error-overlay .message').text(message);
      $('#error-overlay').show();
    }
  }

  // Error overlay close listener
  $('#error-overlay').click(function(e) {
    $('#error-overlay').hide();
    $('#error-overlay .message').text('');
  });

  /**
   * preBind() - Add an event binding *before* any pre-existing bindings.
   *
   * This is a modified version of http://gist.github.com/jonathanconway/1046209
   */
  $.fn.preBind = function(type, data, fn) {
    this.each(function() {
      var $this = $(this);

      $this.bind(type, data, fn);

      var currentBindings = $._data($this[0], 'events');
      if ($.isArray(currentBindings[type])) {
        currentBindings[type].unshift(currentBindings[type].pop());
      }
    });

    return this;
  };

})(jQuery);
