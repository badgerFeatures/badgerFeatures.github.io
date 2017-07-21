/**
 * Wrapper for the Google Analytics' ga.js _gaq object to handle events while
 * offline.
 */

var _ogaq = {
  container: '_oga', // Name of the container to use in localStorage.
  ls : null, //Local Storage var used to swap refence to HTML5 localStorage and the Javascript Fall Back.
  /**
   * Check and create/flush localStorage and set up event online listener.
   */
  init: function() {
    var $this = this;
    if(this.localStorageAvailible() === true){
      this.ls = localStorage;
    }else{
      this.ls = this.localStorageFB;
    }
    if (this.ls.getItem(this.container) === null || this.ls.getItem(this.container) === undefined) {
      // Set up the localStorage if it doesn't exist yet.
      this.ls.setItem(this.container, '[]');
    }
    else {
      // Try to flush contents of localStorage.
      this.flush();
    }

    // Set up event listeners.
    if (window.addEventListener) {
      this.listen(window, 'online ononline', function() {
        setTimeout(function(){ $this.flush(); },500);
      }, false);
    }
  },

  /**
   * [localStorageAvailible Checks to see if local storage is available.]
   * @return {[type]} [description]
   */
  localStorageAvailible: function(){
    try {
        localStorage.setItem('test', 'mod');
        localStorage.removeItem('test');
        return true;
    } catch(e) {
        return false;
    }
  },

  /**
   * [localStorageFB (Local Storage Fallback) Handles the fallback for when HTML5 local storage is unavilable. Simulates localStorage functionality]
   * @type {Object}
   */
  localStorageFB: {

    /**
     * [localStorageObj the local storage data]
     * @type {Object}
     */
    localStorageObj: {},
    /**
     * [getItem gets the requested current local storage data]
     * @param  {[string]} key [name of the local storage you wish to get]
     * @return {[any]}     [storage data]
     */
    getItem: function(key) {
      return this.localStorageObj[key];
    },
    /**
     * [setItem sets the requested current local storage data]
     * @param {[string]} key   [name of the local storage you wish to set]
     * @param {[any]} store [your data you wish to store]
     */
    setItem: function(key, store) {
      this.localStorageObj[key] = store;
    }
  },

  /**
   * Returns TRUE if browser is online or if it doesn't support onLine/offLine
   * detection.
   */
  online: function() {
    return (navigator.onLine || !('onLine' in navigator)) ? true : false;
  },

  /**
   * Push method to either push events via _gaq or store events in localStorage
   */
  push: function(arr) {
    var _ogaNetworkState = this.online() ? 'online' : 'offline';

    // Append current network state to event label automatically
    if (arr[0] == '_trackEvent')
      arr[3] += ' | ('+ _ogaNetworkState +')';
    if (_ogaNetworkState == 'online') {
      // Use ga.js as normal
      _gaq.push(arr);
    }
    else {
      // Browser is offline: store the event in localStorage
      var stored = JSON.parse(this.ls.getItem(this.container));
      stored.push(arr);
      this.ls.setItem(this.container, JSON.stringify(stored));
    }
  },

  /**
   * Flush all events in localStorage
   *
   * @todo: work around GA resource limits,
   * more info: https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide#implementationConsiderations
   * Possible solution is to count every event pushed during the session and set
   * the number of items to flush accordingly. After flushing some events at
   * once a 1/sec throttling occurs with setTimeout()
   * Would need to remove sent items only from localStorage
   */
  flush: function() {
    var items = JSON.parse(this.ls.getItem(this.container));

    if (this.online && items.length > 0) {
      // Loop through localStorage items and push them.
      this.forEach(items, function(k, v) {
        _gaq.push(v);
      });

      // Empty the local storage container.
      this.ls.setItem(this.container, '[]');
    }
  },

  /**
   * Add event listeners to multiple events on the same element.
   *
   * @param object el  Element object to attach the listeners to
   * @param string s  Events delimited by a space
   * @param function fn  Function to call during events
   */
  listen: function(el, s, fn) {
    this.forEach(s.split(' '), function(k, v) {
      el.addEventListener(v, fn, false);
    });
  },

  /**
   * Iterate over an Object, Array of String with a given callBack function
   * From: http://michd.me/blog/javascript-foreach-object-array-and-string/
   *
   * @param {Object|Array|String} collection
   * @param {Function} callBack
   * @return {Null}
   */
  forEach: function(collection, callBack) {
    var
      i = 0, // Array and string iteration
      iMax = 0, // Collection length storage for loop initialisation
      key = '', // Object iteration
      collectionType = '';

    // Verify that callBack is a function
    if (typeof callBack !== 'function') {
      throw new TypeError("forEach: callBack should be function, " + typeof callBack + "given.");
    }

    // Find out whether collection is array, string or object
    switch (Object.prototype.toString.call(collection)) {
    case "[object Array]":
      collectionType = 'array';
      break;

    case "[object Object]":
      collectionType = 'object';
      break;

    case "[object String]":
      collectionType = 'string';
      break;

    default:
      collectionType = Object.prototype.toString.call(collection);
      throw new TypeError("forEach: collection should be array, object or string, " + collectionType + " given.");
    }

    switch (collectionType) {
    case "array":
      for (i = 0, iMax = collection.length; i < iMax; i += 1) {
          callBack(i, collection[i]);
      }
      break;

    case "string":
      for (i = 0, iMax = collection.length; i < iMax; i += 1) {
          callBack(i, collection.charAt(i));
      }
      break;

    case "object":
      for (key in collection) {
        // Omit prototype chain properties and methods
        if (collection.hasOwnProperty(key)) {
          callBack(key, collection[key]);
        }
      }
      break;

    default:
      throw new Error("Continuity error in forEach, this should not be possible.");
    }

    return null;
  }

};

// Launch init
_ogaq.init();
