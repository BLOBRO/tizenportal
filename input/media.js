/**
 * Media remote control (fork BLOBRO)
 *
 * Websites play video with their own HTML5 <video> player. TizenBrew
 * registers the remote's media keys for TizenPortal, so the TV no longer
 * handles them, but nothing forwarded them to the page: Play/Pause, Stop,
 * Fast-forward and Rewind did nothing on ordinary sites.
 *
 * This module drives the main video of the page:
 * - Play/Pause (short press): play or pause
 * - Play/Pause (long press): full screen on/off
 * - Fast-forward / Rewind: +/- 10 seconds (30 s with Next/Previous track)
 * - Stop: pause and leave full screen
 * - In full screen: OK = play/pause, Left/Right = -/+ 10 s, Back = leave
 *
 * ES5 only (Tizen 3/4 browser engines).
 */

import { KEYS } from './keys.js';

var SEEK_STEP = 10;
var BIG_SEEK_STEP = 30;
var LONG_PRESS_MS = 500;

var playDownAt = 0;
var pseudoFullscreenVideo = null;
var pseudoFullscreenSaved = null;
var osdElement = null;
var osdTimer = null;

var PLAY_KEYS = [KEYS.PLAY, KEYS.PAUSE, KEYS.PLAY_PAUSE];

function isPlayKey(keyCode) {
  return PLAY_KEYS.indexOf(keyCode) !== -1;
}

/**
 * Is this key one of the remote's media keys?
 */
export function isMediaControlKey(keyCode) {
  return isPlayKey(keyCode) ||
    keyCode === KEYS.STOP ||
    keyCode === KEYS.FAST_FORWARD ||
    keyCode === KEYS.REWIND ||
    keyCode === KEYS.TRACK_NEXT ||
    keyCode === KEYS.TRACK_PREVIOUS;
}

// ---------------------------------------------------------------------------
// Finding the video
// ---------------------------------------------------------------------------

function collectVideos(doc, out) {
  var list;
  try {
    list = doc.getElementsByTagName('video');
  } catch (e) {
    return;
  }
  for (var i = 0; i < list.length; i++) {
    out.push(list[i]);
  }
  // Same-origin iframes only (cross-origin players cannot be reached)
  var frames;
  try {
    frames = doc.getElementsByTagName('iframe');
  } catch (e2) {
    return;
  }
  for (var j = 0; j < frames.length; j++) {
    try {
      var inner = frames[j].contentDocument;
      if (inner) collectVideos(inner, out);
    } catch (e3) {
      // cross-origin: ignore
    }
  }
}

function visibleArea(video) {
  try {
    var r = video.getBoundingClientRect();
    var w = Math.max(0, Math.min(r.right, window.innerWidth) - Math.max(r.left, 0));
    var h = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
    return w * h;
  } catch (e) {
    return 0;
  }
}

function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement ||
    document.webkitCurrentFullScreenElement || null;
}

/**
 * The video the user most likely means: the one in full screen, then a
 * playing one, then the biggest visible one.
 */
export function findMainVideo() {
  if (pseudoFullscreenVideo && document.documentElement.contains(pseudoFullscreenVideo)) {
    return pseudoFullscreenVideo;
  }

  var videos = [];
  collectVideos(document, videos);
  if (!videos.length) return null;

  var fs = getFullscreenElement();
  if (fs) {
    if (fs.tagName === 'VIDEO') return fs;
    for (var i = 0; i < videos.length; i++) {
      if (fs.contains(videos[i])) return videos[i];
    }
  }

  var best = null;
  var bestScore = -1;
  for (var k = 0; k < videos.length; k++) {
    var v = videos[k];
    var score = visibleArea(v);
    if (!v.paused && !v.ended) score += 1e9;   // a playing video wins
    if (v.readyState > 0) score += 1e6;         // has media loaded
    if (score > bestScore) {
      bestScore = score;
      best = v;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// On-screen display (works over site players in full screen too)
// ---------------------------------------------------------------------------

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '--:--';
  seconds = Math.floor(seconds);
  var h = Math.floor(seconds / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = seconds % 60;
  var mm = (h > 0 && m < 10 ? '0' : '') + m;
  var ss = (s < 10 ? '0' : '') + s;
  return (h > 0 ? h + ':' : '') + mm + ':' + ss;
}

function showOsd(text) {
  var fs = getFullscreenElement();
  // A <video> in real full screen cannot host children: nothing to draw on
  var host = fs && fs.tagName !== 'VIDEO' ? fs : document.body;
  if (!host) return;

  if (!osdElement) {
    osdElement = document.createElement('div');
    osdElement.id = 'tp-media-osd';
    osdElement.style.cssText = 'position:fixed;top:48px;right:56px;z-index:2147483647;' +
      'padding:14px 28px;border-radius:30px;background:rgba(10,12,18,0.88);color:#fff;' +
      'font:600 24px/1.2 SamsungOne,TizenSans,Arial,sans-serif;pointer-events:none;' +
      'box-shadow:0 8px 24px rgba(0,0,0,0.5);opacity:0;transition:opacity 0.2s ease;';
  }
  if (osdElement.parentNode !== host) {
    host.appendChild(osdElement);
  }
  osdElement.textContent = text;
  osdElement.style.opacity = '1';
  if (osdTimer) clearTimeout(osdTimer);
  osdTimer = setTimeout(function() {
    if (osdElement) osdElement.style.opacity = '0';
  }, 1800);
}

function positionText(video) {
  return formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function togglePlay(video) {
  if (video.paused || video.ended) {
    try {
      var p = video.play();
      if (p && typeof p.then === 'function') {
        p.then(null, function(err) {
          showOsd('Lecture impossible');
          console.warn('TizenPortal [Media]: play() refused: ' + (err && err.message));
        });
      }
    } catch (e) {
      showOsd('Lecture impossible');
      return;
    }
    showOsd('▶  Lecture  ' + positionText(video));
  } else {
    video.pause();
    showOsd('❚❚  Pause  ' + positionText(video));
  }
}

function seek(video, delta) {
  var duration = video.duration;
  // Live streams have an infinite duration: seeking is limited to what is buffered
  var target = video.currentTime + delta;
  if (isFinite(duration) && duration > 0) {
    target = Math.max(0, Math.min(duration - 0.5, target));
  } else if (video.seekable && video.seekable.length) {
    var start = video.seekable.start(0);
    var end = video.seekable.end(video.seekable.length - 1);
    target = Math.max(start, Math.min(end, target));
  } else {
    target = Math.max(0, target);
  }
  try {
    video.currentTime = target;
  } catch (e) {
    showOsd('Avance impossible sur ce direct');
    return;
  }
  showOsd((delta > 0 ? '▶▶  +' : '◀◀  -') + Math.abs(delta) + ' s   ' + positionText(video));
}

function isInFullscreen() {
  return !!getFullscreenElement() || !!pseudoFullscreenVideo;
}

function enterPseudoFullscreen(video) {
  // Fallback when the Fullscreen API is refused: stretch the video over the page
  pseudoFullscreenSaved = video.getAttribute('style');
  pseudoFullscreenVideo = video;
  video.style.cssText = (pseudoFullscreenSaved || '') +
    ';position:fixed!important;top:0!important;left:0!important;width:100vw!important;' +
    'height:100vh!important;max-width:none!important;max-height:none!important;' +
    'z-index:2147483646!important;background:#000!important;object-fit:contain!important;';
}

function exitPseudoFullscreen() {
  if (!pseudoFullscreenVideo) return;
  if (pseudoFullscreenSaved === null) {
    pseudoFullscreenVideo.removeAttribute('style');
  } else {
    pseudoFullscreenVideo.setAttribute('style', pseudoFullscreenSaved);
  }
  pseudoFullscreenVideo = null;
  pseudoFullscreenSaved = null;
}

function exitFullscreen() {
  if (pseudoFullscreenVideo) {
    exitPseudoFullscreen();
    return;
  }
  try {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
  } catch (e) {
    // ignore
  }
}

function enterFullscreen(video) {
  // Prefer the player container (keeps the site's subtitles and controls)
  var target = video.parentNode && video.parentNode.nodeType === 1 &&
    video.parentNode !== document.body ? video.parentNode : video;
  var req = target.requestFullscreen || target.webkitRequestFullscreen ||
    target.webkitRequestFullScreen;
  if (!req) {
    enterPseudoFullscreen(video);
    return;
  }
  try {
    var result = req.call(target);
    if (result && typeof result.then === 'function') {
      result.then(null, function() {
        enterPseudoFullscreen(video);
      });
    }
  } catch (e) {
    enterPseudoFullscreen(video);
  }
  // Some engines ignore the request silently
  setTimeout(function() {
    if (!getFullscreenElement() && !pseudoFullscreenVideo) {
      enterPseudoFullscreen(video);
    }
  }, 400);
}

function toggleFullscreen(video) {
  if (isInFullscreen()) {
    exitFullscreen();
    showOsd('Plein écran désactivé');
  } else {
    enterFullscreen(video);
    showOsd('Plein écran');
  }
}

// ---------------------------------------------------------------------------
// Key handling (called by input/handler.js on target sites only)
// ---------------------------------------------------------------------------

/**
 * Handle keydown. Returns true when the key was used.
 */
export function handleMediaKeyDown(event) {
  var keyCode = event.keyCode;

  if (isPlayKey(keyCode)) {
    if (!findMainVideo()) return false;
    // Decided on keyup (short = play/pause, long = full screen)
    if (!event.repeat && !playDownAt) playDownAt = Date.now();
    return true;
  }

  if (keyCode === KEYS.STOP) {
    var stopVideo = findMainVideo();
    if (!stopVideo) return false;
    stopVideo.pause();
    if (isInFullscreen()) exitFullscreen();
    showOsd('■  Arrêt');
    return true;
  }

  if (keyCode === KEYS.FAST_FORWARD || keyCode === KEYS.REWIND ||
      keyCode === KEYS.TRACK_NEXT || keyCode === KEYS.TRACK_PREVIOUS) {
    var seekVideo = findMainVideo();
    if (!seekVideo) return false;
    var step = (keyCode === KEYS.TRACK_NEXT || keyCode === KEYS.TRACK_PREVIOUS) ? BIG_SEEK_STEP : SEEK_STEP;
    var forward = keyCode === KEYS.FAST_FORWARD || keyCode === KEYS.TRACK_NEXT;
    seek(seekVideo, forward ? step : -step);
    return true;
  }

  // Full screen controls
  if (isInFullscreen()) {
    var fsVideo = findMainVideo();
    if (!fsVideo) return false;
    if (keyCode === KEYS.LEFT || keyCode === KEYS.RIGHT) {
      seek(fsVideo, keyCode === KEYS.RIGHT ? SEEK_STEP : -SEEK_STEP);
      return true;
    }
    if (keyCode === KEYS.ENTER) {
      if (!event.repeat) togglePlay(fsVideo);
      return true;
    }
    if (keyCode === KEYS.BACK || keyCode === 27) {
      exitFullscreen();
      showOsd('Plein écran désactivé');
      return true;
    }
  }

  return false;
}

/**
 * Handle keyup. Returns true when the key was used.
 */
export function handleMediaKeyUp(event) {
  if (!isPlayKey(event.keyCode) || !playDownAt) return false;
  var held = Date.now() - playDownAt;
  playDownAt = 0;
  var video = findMainVideo();
  if (!video) return false;
  if (held >= LONG_PRESS_MS) {
    toggleFullscreen(video);
  } else {
    togglePlay(video);
  }
  return true;
}
