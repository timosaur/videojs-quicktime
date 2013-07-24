/**
 * @fileoverview Quicktime Media Controller - Wrapper for Quicktime player
 */

/**
 * Quicktime Media Controller - Wrapper for Quicktime player
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @param {Function=} ready
 * @constructor
 */


videojs.Quicktime = videojs.MediaTechController.extend({
  init: function(player, options, ready){
    console.log("init", player, options, ready);
    console.log("this",this);
    videojs.MediaTechController.call(this, player, options, ready);

    this.features.fullscreenResize = false;

    this.player_ = player;

    this.parent_el_ = options['parentEl'];

    var src;
    if (typeof player.options().src === 'undefined') {
      var sources = player.options().sources,
          i = 0;
      while (i < sources.length) {
        if (typeof sources[i].type !== 'undefined' && 'video/quicktime' == sources[i].type) {
          src = sources[i].src;
          break;
        }
        i++;
      }
    } else {
      src = player.options().src;
    }

    if (src)
      this.loadQuicktime(src);
  }
});

// videojs.Quicktime.prototype.dispose = function(){
//   this.qtplayer.destroy();
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
  console.log("Current Time", this.qtplayer.GetTime() / this.qtplayer.GetTimeScale());
  return this.qtplayer.GetTime() / this.qtplayer.GetTimeScale();
};

videojs.Quicktime.prototype.setCurrentTime = function(seconds){
  console.log("setting");
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

videojs.Quicktime.isSupported = function(){
  return true;
};

videojs.Quicktime.prototype.supportsFullScreen = function() {
  return false;
};

videojs.Quicktime.canPlaySource = function(srcObj){
  return (srcObj.type === 'video/quicktime');
};

videojs.Quicktime.prototype.src = function(src){
  this.qtplayer.SetURL(src);
};

// Events
videojs.Quicktime.prototype.onReady = function(){
  console.log("readying", this);
  this.isReady_ = true;
  this.player_.trigger('techready');

  this.triggerReady();

  // Hide the poster when ready because YouTube has it's own
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

videojs.Quicktime.prototype.onEnded = function(){
  this.player_.trigger('pause');
  this.player_.trigger('ended');
};

// Create the Quicktime player
videojs.Quicktime.prototype.loadQuicktime = function(src){
  var player = this.player_;
  // var objId = player.id() + '_quicktime';

  // TODO: options

  // Load Quicktime object 
  function makeQT(){
      return _QTGenerate("QT_WriteOBJECT", false, arguments);
  }
  var qt_object = makeQT(
    src, player.options().width, player.options().height, ''
    , 'scale', 'tofit'
    , 'postdomevents', 'true'
    , 'enablejavascript', 'true'
    , 'controller', 'false'
    , 'autoplay', 'false'
    , 'href', 'javascript:function(){}'
  );
  console.log(qt_object);

  var placeHolder = document.createElement('div');
  placeHolder.innerHTML = qt_object;

  // Set element object
  this.el_ = placeHolder.firstChild;
  this.parent_el_.appendChild(this.el_);
  // Get video embed in object
  this.qtplayer = this.el_.lastChild;

  this.qtplayer.vjsTech = this;

  // Load Quicktime events
  this.onQtEvent('qt_canplay', videojs.bind(this, this.onReady));
  this.onQtEvent('qt_error', videojs.bind(this, this.onError));
  this.onQtEvent('qt_ended', videojs.bind(this, this.onEnded));

  var self = this;
  this.onQtEvent('qt_timechanged', function() {
    console.log("qt timechanged");
    self.player_.trigger('timeupdate');
  });
};

// Define function that adds another function as a DOM event listener
videojs.Quicktime.prototype.onQtEvent = function(event, handler){
  if (document.addEventListener)
    this.qtplayer.addEventListener(event, handler);
  else
    this.qtplayer.attachEvent('on' + evt, handler);  // IE
}

