/**
 * Tracking options
 *
 * @see tracking.js for all the default configuration options.
 * @see https://bitbucket.org/adnostic-ondemand/ad-templates
 */
var trackOptions = {
  publication: 'SundayTimes',
  issueDate: '22/06/2014',
  clientName:  'Rimmel',
  campaignName: 'Idol Eyes',
  adName: 'Rimmel IdolEyes',
  videoSelector: '',
  // Tracking options
  debug: false, // false: no debug, true: console logging, 'alert: throws alert boxes
  /**
   * Dart 'pixel' tracking URLs
   * Possible properties are:
   *  - onLoad
   *  - orientationChange
   *  - element_[elementID] for onclick pixel loading where elementID is the ID of the clickable element.
   * Tracking URLs need to be listed as an array for each property, e.g ['http://url1", "http://url2']
   */
  dartPixels: {
    onLoad: {
      single: [
        'http://ad.doubleclick.net/N359/ad/impcount.co.uk/;kw=sundaytimesstylerimmelkatejun16;sz=1x1;ord=' + ord + '?'
      ]
    },
	

  },
trackVideos: true,
  videoSelector: '.button-video',
  videos: {
    gig : {
      single: 'http://live.adnostic.io/rimmel/idoleyes/gig.mp4'
    },
    hippie : {
      single: 'http://live.adnostic.io/rimmel/idoleyes/hippie.mp4'
    },
    boho : {
      single: 'http://live.adnostic.io/rimmel/idoleyes/boho.mp4'
    },
    summer : {
      single: 'http://live.adnostic.io/rimmel/idoleyes/summer.mp4'
    }
  },
	 
  // multiple buy now and get gig tracking for future mid change.. just copy same link x 4..
  ctas: {
    buynow : {
      single: 'http://pubads.g.doubleclick.net/gampad/clk?id=65845260&iu=/359/impcount.co.uk'
    }
   
  }
};
