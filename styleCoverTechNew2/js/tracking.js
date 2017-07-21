/**
 * @file Generic tracking plugin for ads
 *
 * @version 1.6.3
 *
 * [changeLog]
 *
 * 1.5.3
 *   - Fixed Bug with Internal Navigation category.
 *   - Optimised the tracking label concatenation.
 *
 * 1.6.0
 *   - Added multiple video element functionality to trackVideos()
 *   - Added CTA element href replacement to trackCtas()
 *   - Auto Offline Mode added. Appeding data-offline-message attributes automatically.
 *
 * 1.6.1
 *   - Bug fix for tracking videos
 *
 * 1.6.2
 *   - Preloader updated
 *
 * 1.6.3
 *   - useGa and useOga options added.
 */

(function($) {

  // Provide default settings
  var defaultSettings = {
    publication: '',
    issueDate: '',
    clientName:  'Adnostic',
    campaignName: 'Testing',
    adName: '',
    trackOnLoad: true,
    trackOrientation: true,
    trackInternalNavigation: true,
    internalNavigationSelector: '.navigation',
    internalNavigationEvents: 'click',
    trackVideos: true,
    videoSelector: '.button-video',
    trackCtas: true,
    ctaSelector: '.cta',
    dartPixels: {},
    useOga: true,
    useGa: true,
    debug: false,
    useLiveReload: false,
    viewportInfo: false,
    loadPixel: null,
    loadClick: null
  };

  // jQuery plugin definition
  $.fn.track = function(option, settings) {

    // Check if user is setting/getting properties manually after plugin creation
    if (typeof option === 'object') {
      settings = option;
    }
    else if (typeof option == 'string') {
      var data = this.data('_tracker');

      // Check if plugin has already been initialized for this element
      if (data) {
        if (option === 'reset') data.reset();
        if (defaultSettings[option] !== undefined) {
          if (settings !== undefined) {
            if (option == 'title') {
              data.content.html(settings);
            }
            data.settings[option] = settings;
            return true;
          }
          else {
            return data.settings[option];
          }
        }
      }
      return false;
    }

    // Extend user settings with default settings
    settings = $.extend({}, defaultSettings, settings || {});

    return this.each(function() {
      var elem = $(this);
      $settings = $.extend(true, {}, settings);

      // Test for Offline GA
      if ($settings.useOga && typeof _ogaq != 'object') {
        elem.html('oga.js is missing.');
        return false;
      }

      var tracker = new Tracker($settings); // create a Tracker object

      elem.data('_tracker', tracker); // Store the tracker object for later reference - setters/getters

      tracker.init();
    });
  };

  // Create our tracker class
  // this will store the unique individual properties for each tracker
  var Tracker = function(settings) {
    this.tracker = null;
    this.settings = settings;

    this.orientation = null;
    this.orientationKey = null;
    this.d = $(document);

    return this;
  };

  Tracker.prototype = {

    init: function() {
      var $this = this;

      this.generatePixelTrackers();

      // Keep track of orientation changes
      if (this.settings.trackOrientation === true) this.updateOrientation();

      // Set up onload tracking
      if (this.settings.trackOnLoad === true) this.trackOnLoad();

      // Set up Call to action tracking
      if (this.settings.trackCtas === true) this.trackCtas();

      // Set up internal navigation tracking
      if (this.settings.trackInternalNavigation === true) this.trackInternalNavigation();

      // Set up video tracking
      if (this.settings.trackVideos === true) this.trackVideos();
    },

    /**
     * Generate pixel tracking tags per tracking aspect and per the number of
     * tracking URLs configured in the given aspect.
     */
    generatePixelTrackers: function() {
      // Get each 'aspect'
      $.each(this.settings.dartPixels, function(key, val) {
        var n = 0;
        // Count the number of tracking URLs configured.
        $.each(val, function(k, v) {
          if (typeof v == 'object') {
            n = (Object.keys(v).length > 0) ? Object.keys(v).length : n;
          }
        });
        // Create a number of img tags equal to the largest number of configured urls in an aspect.
        for (var i = 1; n >= i; i++) {
          $('body').prepend('<img class="tracking tracking-'+ key +'" id="tracking-'+ key +'-'+ i +'"/>');
        }
      });
    },

    /**
     * Set up onload tracking for both GA and DART if required.
     */
    trackOnLoad: function() {
      var $this = this;

      // Track onLoad on window load()
      $(window).load(function() {
        $this.track({}, 'Initial view', 'View', $this.getLabel(), $this.getPixels('onLoad'));
      });
    },

    /**
     * This sets up click listeners for tracking on the configured call to
     * action links - links leading to external locations (using selector '.cta'
     * by default)
     *
     * Any extra information about the link should go into the data-event-label
     * in the markup.
     */
    trackCtas: function() {
      var $this = this;

      // Set up click listeners and call tracking as category 'External link'
      $(this.settings.ctaSelector).preBind('click', function(e) {
        var $button = $(this),
        id = $button.attr('id'),
        key = $this.settings.trackOrientation === false ? 'single' : $this.getOrientation(),
        // if separate portrait/landscape values are left empty, check for single.
        href = typeof $this.settings.ctas !== 'undefined' ? typeof $this.settings.ctas[id] !== 'undefined' ? $this.settings.ctas[id][key] || $this.settings.ctas[id]['single'] || false : false : false;
        if (href !== false) {
          // Update link href
          $button.attr('href', href);
        }
        $this.track($(this), 'External link', 'Tap', $this.getLabel($button), $this.getPixels('element_'+ id));
      });
    },

    /**
     * This sets up click listeners for tracking on the configured call to
     * action links - links leading to external locations (using selector '.cta'
     * by default)
     *
     * Any extra information about the link should go into the data-event-label
     * in the markup.
     */
    trackVideos: function() {
      var $this = this;

      // Set up click listeners and call tracking as category 'Play Video'
      // @see $.fn.preBind()
      $(this.settings.videoSelector).preBind('click', function(e) {
        var $button = $(this),
          id = $button.attr('id'),
          key = $this.settings.trackOrientation === false ? 'single' : $this.getOrientation(),
          vidId = $this.settings.videos[id]['videoId'] || 'popup video', //enables us to track mutiple video elements if we need to
          // if separate portrait/landscape values are left empty, check for single.
          src = $this.settings.videos[id][key] || $this.settings.videos[id]['single'] || false;
        if (src !== false) {
          // Update video src and track in GA
          $('#'+vidId).attr('src', src);
          $this.track($button, 'Play Video', 'Tap', $this.getLabel($button), $this.getPixels('element_'+ id));
        }
      });
    },

    /**
     * Set up listeners to configured events and elements
     *
     * @todo load any configured pixel tracking for these events.
     */
    trackInternalNavigation: function() {
      var $this = this;

      $(this.settings.internalNavigationSelector).bind('click', function(e) {
        var $button = $(this),
          id = $button.attr('id');

        $this.track($(this), 'Internal Navigation', 'Tap', $this.getLabel($button), $this.getPixels('element_'+ id));
      });
    },

    /**
     * Set up and keep track of the current orientation in the plugin object.
     */
    trackOrientation: function() {
      var $this = this;

      // Track orientation
      $this.track({}, 'Orientation', 'Orientation change', $this.getLabel(), $this.getPixels('orientationChange'));
    },

    /**
     * Generic function to perform tracking
     *
     * Since the entire Tracker object along with its methods is exposed to the
     * element which the plugin is called on, this method can be called
     * externally, e.g outside the plugin.
     * Example: $(document).data('_tracker').track($element, category, action);
     *
     * @param {Object} $element  A jQuery selected object or an empty object
     *   to track.
     * @param {String} category  GA event category
     * @param {String} action  GA event action
     * @param {String} label  GA event label extra information. If $element is
     *   not empty, the label from the data-event-label attribute ofthe element
     *   will be used.
     * @param {Object} clicks  Optional DART pixel tracking urls with ID as key
     *   If $element is not empty, the configured pixel tracking URLs will be
     *   used.
     *   Example: {onLoad: ['http://track.ing/px.gif', 'http://some.other/url']}
     */
    track: function($element, category, action, label, dartPixels) {
      // Set defaults if arguments are missing.
      category = category || 'Category';
      action = action || 'Action';
      label = label || this.getLabel($element);
      dartPixels = dartPixels || this.getPixels('element_'+ $element.attr('id'));

      var $this = this, debugMsg = '';

      // Track event through oga
      if(!$settings.useGa){
        $settings.useOga = false;
      }
      if($settings.useOga){
        _ogaq.push(['_trackEvent', category, action, label]);
        debugMsg = "OGA:\n_trackEvent, "+ category +', '+ action +', '+ label;
      }else{
        if($settings.useGa){
          _gaq.push(['_trackEvent', category, action, label]);
          debugMsg = "GA:\n_trackEvent, "+ category +', '+ action +', '+ label;
        }else{
          debugMsg = "GA TRACKING IS DISABLED";
        }
      }

      // Load relevant pixel tracking if any
      $.each(dartPixels, function(key, val) {
        if (!isEmpty(val)) {
          debugMsg += "\n\nDART Pixels:\n";
          $.each(val, function(k, v) {
            $('#tracking-'+ key +'-'+ (k + 1)).attr('src', v);
            debugMsg += v +"\n";
          });
        }
      });

      if (this.settings.debug === true) console.log(debugMsg);
      else if (this.settings.debug == 'alert') alert(debugMsg);
    },

    /**
     * Set up and keep track of the current orientation in the plugin object.
     */
    updateOrientation: function() {
      var $this = this;

      this.orientation = this.getOrientation();

      $(window).bind('orientationchange', function(e) {
        $this.orientation = $this.getOrientation();
        if ($this.settings.trackOrientation) {
          $this.trackOrientation();
        }
      });
    },

    // Return the current orientation. Checks document width vs height if it's
    // not supported by the browser
    getOrientation: function() {
      if (typeof getOrientation == 'function') {
        return getOrientation();
      }
      var orientation = window.orientation || ((this.d.width() > this.d.height()) ? 90 : 0);
      return (orientation == -90 || orientation == 90) ? 'landscape' : 'portrait';
    },

    getLabel: function($element) {
      var extra = extra || '';
      $element = $element || {};

      // Add element label from data property if it exists.
      extra += (typeof $element.data == 'function') ? ' | '+ $element.data('event-label') : '';

      // Add orientation if trackOrienation is true
      extra += (this.settings.trackOrientation) ? ' | '+ this.getOrientation() : '';

      return [ this.settings.publication,' | ',
              this.settings.issueDate,' | ',
              this.settings.clientName,' | ',
              this.settings.campaignName,' | ',
              this.settings.adName,
              extra ].join('');
    },

    /**
     * Collect configured pixel tracking links attached to a document event or
     * an element
     *
     * @param  {string} id The html id of the element. If this is attached to an
     *   element then id MUST start with 'element_'
     * @return {array}  An array of pixel elements to pass on to this.track();
     */
    getPixels: function(id) {
      // Return early if id is not set;
      if (typeof id === 'undefined') return;

      // @todo Add jQuery selector to check if there is an element at all and return early if not.

      var $this = this,
        pixels = {},
        orientationKey = this.settings.trackOrientation === false ? 'single' : this.getOrientation();
      pixels[id] = [];

      if (!isEmpty($this.settings.dartPixels[id])) {
        // if separate portrait/landscape values are left empty, check for single.
        if (isEmpty($this.settings.dartPixels[id][orientationKey])) orientationKey = 'single';

        $.each($this.settings.dartPixels[id][orientationKey], function(key, val) {
          pixels[id].push(val);
        });
      }

      return pixels;
    }

  };

})(jQuery);
