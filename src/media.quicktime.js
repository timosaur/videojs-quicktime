/**
 * @fileoverview YouTube Media Controller - Wrapper for YouTube Media API
 */

/**
 * YouTube Media Controller - Wrapper for YouTube Media API
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @param {Function=} ready
 * @constructor
 */


videojs.Quicktime = videojs.MediaTechController.extend({
  init: function(player, options, ready){
    console.log("init", player, options, ready);
    videojs.MediaTechController.call(this, player, options, ready);

    console.log("this",this);
    
    console.log("player", this.id_);
    console.log(this);
    this.features.fullscreenResize = false;
    
    this.player_ = player;
    console.log("player controls",player.controls());
    // this.player_.controls(true);
    // this.controls(true);
    // this.player_el_ = document.getElementById(this.player_.id());

    console.log(this.player_el_);

    console.log("options", this.player_.options());

    console.log("controls", this.player_.controls());
    console.log("controls", this.player_.controlBar);

    // this.player_.addChild('controlBar');

    // window.controlbar = this.player_.controlBar.el();
    window.myplayer = this;
    // Disable lockShowing because YouTube controls are there
    // if (this.player_.options().ytcontrols){
    //   this.player_.controls(false);
    // }
    
    // Regex that parse the video ID for any YouTube URL
    // var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    // var match = player.options().src.match(regExp);

    // if (match && match[2].length == 11){
    //   this.videoId = match[2];

    //   // Show the YouTube poster only if we don't use YouTube poster (otherwise the controls pop, it's not nice)
    //   if (!this.player_.options().ytcontrols){
    //     // Set the YouTube poster only if none is specified
    //     if (typeof this.player_.poster() == 'undefined') {
    //       this.player_.poster('http://img.youtube.com/vi/' + this.videoId + '/0.jpg');
    //     }

    //     // Cover the entire iframe to have the same poster than YouTube
    //     // Doesn't exist right away because the DOM hasn't created it
    //     var self = this;
    //     setTimeout(function(){ self.player_.posterImage.el().style.backgroundSize = 'cover'; }, 50);
    //   }
    // } else {
    //   this.videoId = '';
    // }

    // this.id_ = this.player_.id() + '_youtube_api';

    // this.el_ = videojs.Component.prototype.createEl('object', {
    //   id: this.id_,
    //   className: 'vjs-tech',
    //   scrolling: 'no',
    //   marginWidth: 0,
    //   marginHeight: 0,
    //   frameBorder: 0,
    //   webkitAllowFullScreen: '',
    //   mozallowfullscreen: '',
    //   allowFullScreen: ''
    // });
    
    // this.player_el_.insertBefore(this.el_, this.player_el_.firstChild);
    
    // var params = {
    //   enablejsapi: 1,
    //   iv_load_policy: 3,
    //   playerapiid: this.id(),
    //   disablekb: 1,
    //   wmode: 'transparent',
    //   controls: (this.player_.options().ytcontrols)?1:0,
    //   showinfo: 0,
    //   modestbranding: 1,
    //   rel: 0,
    //   autoplay: (this.player_.options().autoplay)?1:0,
    //   loop: (this.player_.options().loop)?1:0
    // };
    
    // // Make autoplay work for iOS
    // if (this.player_.options().autoplay) {
    //   this.playOnReady = true;
    // }
    
    // // Check if we have a playlist
    // var regExp = /[?&]list=([^#\&\?]+)/;
    // var match = player.options().src.match(regExp);
    
    // if (match != null && match.length > 1) {
    //   params.list = match[1];
    // }
    
    // // If we are not on a server, don't specify the origin (it will crash)
    // if (window.location.protocol != 'file:') {
    //   params.origin = window.location.protocol + '//' + window.location.hostname;
    // }

    // this.el_.src = 'http://www.youtube.com/embed/' + this.videoId + '?' + videojs.Quicktime.makeQueryString(params);

    // if (this.player_.options().ytcontrols){
    //   // Remove the big play button and the control bar, we use Vimeo controls
    //   // Doesn't exist right away because the DOM hasn't created it
    //   var self = this;
    //   setTimeout(function(){ 
    //     var bigPlayDom = self.player_.bigPlayButton.el();
    //     bigPlayDom.parentNode.removeChild(bigPlayDom);
        
    //     var controlBarDom = self.player_.controlBar.el();
    //     controlBarDom.parentNode.removeChild(controlBarDom);
    //   }, 50);
    // }

    // this.loadQuicktime();
    var parentEl = options['parentEl'];

    var objId = player.id() + '_quicktime';

    var source = player.options().src;

    // TODO: options

    // Load quicktime object 
    function makeQT(){
        return _QTGenerate("QT_WriteOBJECT", false, arguments);
    }
    var qt_object = makeQT(
      player.options().src, player.options().width, player.options().height, ''
      , 'scale', 'tofit'
      , 'postdomevents', 'true'
      , 'enablejavascript', 'true'
      , 'controller', 'false'
      , 'autoplay', 'false'
      , 'href', 'javascript:function(){}'
    );
    console.log(qt_object);

    parentEl.innerHTML = qt_object;

    // Get video embed in object
    this.qtplayer = this.el_ = parentEl.firstChild.lastChild;

    // this.onReady();
    // console.log("loaded");
    var self = this;

    this.onQtEvent('qt_canplay', function() {
      self.onReady();
    });

    this.onQtEvent('qt_ended', function() {
      console.log("qt ended");
      self.player_.trigger('ended');
      self.player_.trigger('pause');
    });

    this.onQtEvent('qt_timechanged', function() {
      console.log("qt timechanged");
      // me.player_.trigger('timeupdate');
    });
    this.onQtEvent('qt_error', function() {
      self.onError();
    });
  }
});

// videojs.Quicktime.prototype.dispose = function(){
//   this.ytplayer.destroy();
//   videojs.MediaTechController.prototype.dispose.call(this);
// };

videojs.Quicktime.prototype.play = function(){
  console.log("play");
  if (this.isReady_){
    this.qtplayer.Play();
    this.player_.trigger('play');
  } else { 
    // We will play it when the API will be ready
    this.playOnReady = true;
  }
};

videojs.Quicktime.prototype.pause = function(){
  this.qtplayer.Stop();
  this.player_.trigger('pause');
};

videojs.Quicktime.prototype.paused = function(){ return this.qtplayer.GetRate() === 0; };

videojs.Quicktime.prototype.currentTime = function(seconds){
  console.log("Current Time", this.qtplayer.GetTime(), "duration", this.qtplayer.GetDuration());
  return this.qtplayer.GetTime() / this.qtplayer.GetTimeScale();
};

videojs.Quicktime.prototype.setCurrentTime = function(seconds){
  this.qtplayer.SetTime(seconds * this.qtplayer.GetTimeScale());
  this.player_.trigger('timeupdate');
};

videojs.Quicktime.prototype.duration = function(){
  console.log("Duration", this.qtplayer.GetDuration() / this.qtplayer.GetTimeScale());
  return this.qtplayer.GetDuration() / this.qtplayer.GetTimeScale();
};

videojs.Quicktime.prototype.buffered = function(){
  var loadedBytes = this.qtplayer.GetMaxBytesLoaded();
  var totalBytes = this.qtplayer.GetMovieSize();
  if (!loadedBytes || !totalBytes) return 0;

  var duration = this.qtplayer.GetDuration() / this.qtplayer.GetTimeScale();
  var secondsBuffered = (loadedBytes / totalBytes) * duration;
  // var secondsOffset = (this.qtplayer.getVideoStartBytes() / totalBytes) * duration;
  var secondsOffset = 0;
  return videojs.createTimeRange(secondsOffset, secondsOffset + secondsBuffered);
};

videojs.Quicktime.prototype.volume = function() {
  this.volumeVal = this.qtplayer.GetVolume()/256.0;
  console.log("Volume", this.volumeVal);
  return this.volumeVal;
};

videojs.Quicktime.prototype.setVolume = function(percentAsDecimal){
  if (percentAsDecimal && percentAsDecimal != this.volumeVal) {
    this.qtplayer.SetVolume(percentAsDecimal * 256.0);
    this.volumeVal = percentAsDecimal;
    this.player_.trigger('volumechange');
  }
};

videojs.Quicktime.prototype.muted = function() {
  console.log("Mute", this.qtplayer.GetMute());
  return this.qtplayer.GetMute();
};

videojs.Quicktime.prototype.setMuted = function(muted) { 
  if (muted) {
    this.qtplayer.SetMute(true);
  } else { 
    this.qtplayer.SetMute(false);
  }
  var self = this;
  setTimeout(function() { self.player_.trigger('volumechange'); }, 50);
};

videojs.Quicktime.prototype.ended = function(){ return this.qtplayer.GetTime() === this.qtplayer.GetDuration(); };

videojs.Quicktime.prototype.onReady = function(){
  console.log("readying", this);
  this.isReady_ = true;
  this.player_.trigger('techready');

  // Hide the poster when ready because YouTube has it's own
  this.triggerReady();
  this.player_.trigger('durationchange');

  // Play right away if we clicked before ready
  if (this.playOnReady){
    this.qtplayer.Play();
  }
};

videojs.Quicktime.prototype.onError = function(error){
    this.player_.error = "Quicktime Error";
    this.player_.trigger('error');
};

videojs.Quicktime.isSupported = function(){
  return true;
};

videojs.Quicktime.prototype.supportsFullScreen = function() {
  return false;
};

videojs.Quicktime.canPlaySource = function(srcObj){
  return (srcObj.type === 'video/quicktime');
};

// Create the YouTube player
videojs.Quicktime.prototype.loadQuicktime = function(){
  // this.qtplayer.vjsTech = this;
};

/* Define function that adds another function as a DOM event listener */
videojs.Quicktime.prototype.onQtEvent = function(event, handler){
  if (document.addEventListener)
    this.qtplayer.addEventListener(event, handler);
  else
    this.qtplayer.attachEvent('on' + evt, handler);  // IE
}

