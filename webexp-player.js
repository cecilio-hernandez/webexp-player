
          (function() {
  'use strict';
  
  window.webexpInitPlayer = function(config) {
    const container = config.container;

    
   document.addEventListener('DOMContentLoaded', function() {
  const playerContainer = container.querySelector('.audio-player-container');
  
if (playerContainer) {
    playerContainer.classList.add('disc-mode');
  }
  
   const modal = playerContainer.querySelector('.audio-player-modal');
  const backdrop = playerContainer.querySelector('.modal-backdrop');
  const closeBtn = playerContainer.querySelector('.close-modal-btn');
  const audio = playerContainer.querySelector('audio');
  const playBtn = playerContainer.querySelector('.play-btn');
  const prevBtn = playerContainer.querySelector('.prev-btn');
  const nextBtn = playerContainer.querySelector('.next-btn');
  const progress = playerContainer.querySelector('.progress');
  const progressBar = playerContainer.querySelector('.progress-bar');
  const currentTime = playerContainer.querySelector('.current-time');
  const remainingTime = playerContainer.querySelector('.remaining-time');
  const volumeBtn = playerContainer.querySelector('.volume-btn');
  const volumeControl = playerContainer.querySelector('.volume-control');
  const volumeSlider = playerContainer.querySelector('.volume-slider');
  const volumeHighIcon = playerContainer.querySelector('.volume-high-icon');
  const volumeMuteIcon = playerContainer.querySelector('.volume-mute-icon');
  const trackItems = playerContainer.querySelectorAll('.track-item');
  const currentTrackImage = playerContainer.querySelector('.current-track-image');
  const buttonTrackImage = playerContainer.querySelector('.current-track-image-btn');
  const trackTitle = playerContainer.querySelector('.track-title');
  const artistName = playerContainer.querySelector('.artist-name');
  
   const miniMusicBar = playerContainer.querySelector('.mini-music-bar');
  const miniPlayBtn = playerContainer.querySelector('.mini-play-btn');
  const miniPrevBtn = playerContainer.querySelector('.mini-prev-btn');
  const miniNextBtn = playerContainer.querySelector('.mini-next-btn');
  const miniExpandBtn = playerContainer.querySelector('.mini-expand-btn');
  const miniProgress = playerContainer.querySelector('.mini-progress');
  const miniTrackTitle = playerContainer.querySelector('.mini-track-title');
  const miniArtistName = playerContainer.querySelector('.mini-artist-name');
  const miniTrackImage = playerContainer.querySelector('.current-track-image-mini');
  
   const toggleBtn = playerContainer.querySelector('.music-toggle-btn');
  const musicIcon = toggleBtn ? toggleBtn.querySelector('.music-icon') : null;
  
  let currentTrackIndex = 0;
  let isMuted = false;
  let lastVolume = 1;
  let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  let isAndroid = /Android/.test(navigator.userAgent);
  let isMobile = isIOS || isAndroid;
  
   let playerState = {
    isPlaying: false,
    currentTime: 0,
    currentTrack: 0,
    volume: 1,
    lastInteraction: Date.now()
  };
  
   function initPlayer() {
     const savedDetailedState = localStorage.getItem('audioPlayerDetailedState');
    
    if (savedDetailedState) {
      try {
        const detailedState = JSON.parse(savedDetailedState);
        const stateAge = Date.now() - (detailedState.lastInteraction || 0);
        
         if (stateAge < 3600000) {
           let foundTrackIndex = findMatchingTrack(detailedState);
          
          if (foundTrackIndex !== -1) {
             currentTrackIndex = foundTrackIndex;
            
             loadTrack(currentTrackIndex, false);
            
             setCurrentTimeWithRetry(detailedState.currentTime || 0);
            
             if (isMobile) {
               lastVolume = detailedState.volume || 1;
            } else {
              audio.volume = detailedState.volume || 1;
              lastVolume = audio.volume;
            }
            
             if (detailedState.isPlaying) {
               if (isMobile) {
                setPlayButtonsToPauseState();
                setupMobileAutoPlayTrigger();
              } else {
                playAudioWithErrorHandling();
              }
            }
          } else {
             currentTrackIndex = 0;
            loadTrack(currentTrackIndex, false);
          }
        } else {
           console.log("Saved state is too old, using fresh state");
          basicInitialization();
        }
      } catch (error) {
        console.error('Error parsing saved detailed player state:', error);
         basicInitialization();
      }
    } else {
       basicInitialization();
    }
    
     updateMiniBarInfo();
    
     setupMarqueeForCurrentTrack();
  }
  
   function findMatchingTrack(detailedState) {
    let foundTrackIndex = -1;
    
     for (let i = 0; i < trackItems.length; i++) {
      if (trackItems[i].dataset.trackUrl === detailedState.trackData.url) {
        foundTrackIndex = i;
        break;
      }
    }
    
     if (foundTrackIndex === -1) {
      for (let i = 0; i < trackItems.length; i++) {
        if (trackItems[i].dataset.trackTitle === detailedState.trackData.title && 
            trackItems[i].dataset.artistName === detailedState.trackData.artist) {
          foundTrackIndex = i;
          break;
        }
      }
    }
    
    return foundTrackIndex;
  }
  
   function setCurrentTimeWithRetry(targetTime, attempts = 0) {
    try {
      audio.currentTime = targetTime;
    } catch (e) {
      if (attempts < 3) {
         setTimeout(() => {
          setCurrentTimeWithRetry(targetTime, attempts + 1);
        }, 300);
      }
    }
  }
  
   function playAudioWithErrorHandling() {
    audio.play().then(() => {
      setPlayButtonsToPauseState();
      savePlayerState();
      saveDetailedPlayerState();
    }).catch(error => {
      console.error('Error playing audio:', error);
      setPlayButtonsToPlayState();
    });
  }
  
   function setPlayButtonsToPlayState() {
    playerContainer.classList.remove('playing');
    
     if (playBtn) {
      playBtn.querySelector('.play-icon').style.display = 'block';
      playBtn.querySelector('.pause-icon').style.display = 'none';
    }
    
     if (miniPlayBtn) {
      miniPlayBtn.querySelector('.mini-play-icon').style.display = 'block';
      miniPlayBtn.querySelector('.mini-pause-icon').style.display = 'none';
    }
    
     if (toggleBtn && musicIcon) {
      musicIcon.style.opacity = '1';
      musicIcon.style.visibility = 'visible';
    }
    
     const playingTracks = playerContainer.querySelectorAll('.track-item.playing');
    playingTracks.forEach(track => {
      track.classList.remove('playing');
    });
  }
  
   function setPlayButtonsToPauseState() {
    playerContainer.classList.add('playing');
    
     if (playBtn) {
      playBtn.querySelector('.play-icon').style.display = 'none';
      playBtn.querySelector('.pause-icon').style.display = 'block';
    }
    
     if (miniPlayBtn) {
      miniPlayBtn.querySelector('.mini-play-icon').style.display = 'none';
      miniPlayBtn.querySelector('.mini-pause-icon').style.display = 'block';
    }
    
     if (toggleBtn && musicIcon) {
      musicIcon.style.opacity = '0';
      musicIcon.style.visibility = 'hidden';
    }
    
     const activeTrack = playerContainer.querySelector('.track-item.active');
    if (activeTrack) {
      activeTrack.classList.add('playing');
    }
  }
  
   function basicInitialization() {
    const savedState = localStorage.getItem('audioPlayerState');
    if (savedState) {
      try {
        playerState = JSON.parse(savedState);
        currentTrackIndex = playerState.currentTrack;
        
         if (trackItems[currentTrackIndex]) {
          loadTrack(currentTrackIndex, false);
          
           setCurrentTimeWithRetry(playerState.currentTime);
          
           if (playerState.isPlaying && !isMobile) {
            playAudioWithErrorHandling();
          } else if (playerState.isPlaying && isMobile) {
            setPlayButtonsToPauseState();
            setupMobileAutoPlayTrigger();
          }
        }
      } catch (error) {
        console.error('Error parsing saved player state:', error);
      }
    }
  }
  
   function setupMobileAutoPlayTrigger() {
    if (!isMobile) return;
    
     const setupInteractionEvents = () => {
      // One-time handler for user interaction to resume playback
      const resumeHandler = function() {
        if (audio.paused && playerContainer.classList.contains('playing')) {
          audio.play().catch(e => {
            console.log("Couldn't play audio, will try again on next interaction");
          });
        }
        
         document.removeEventListener('click', resumeHandler);
        document.removeEventListener('touchstart', resumeHandler);
        document.removeEventListener('keydown', resumeHandler);
        document.removeEventListener('scroll', resumeHandler);
      };
      
       document.addEventListener('click', resumeHandler, { once: true, passive: true });
      document.addEventListener('touchstart', resumeHandler, { once: true, passive: true });
      document.addEventListener('keydown', resumeHandler, { once: true, passive: true });
      document.addEventListener('scroll', resumeHandler, { once: true, passive: true });
      
       setTimeout(() => {
        if (audio.paused && playerContainer.classList.contains('playing')) {
           setupInteractionEvents();
        }
      }, 5000);
    };
    
     setupInteractionEvents();
    
     const visibilityHandler = function() {
      if (document.visibilityState === 'visible' && 
          audio.paused && 
          playerContainer.classList.contains('playing')) {
        audio.play().catch(e => {
          console.log("Auto-resume blocked, waiting for user interaction");
        });
      }
    };
    
     document.addEventListener('visibilitychange', visibilityHandler);
    
     if (audio.paused && playerContainer.classList.contains('playing')) {
      audio.play().catch(e => {
        console.log("Immediate play blocked, waiting for user interaction");
      });
    }
  }
 
function setupMarqueeForCurrentTrack() {
   clearAllMarquees();
  
   if (trackTitle) {
    setupPerfectMarquee(trackTitle);
  }
  
  if (miniTrackTitle) {
    setupPerfectMarquee(miniTrackTitle);
  }
}

function clearAllMarquees() {
   const elements = container.querySelectorAll('.marquee-processed');
  
  elements.forEach(element => {
     while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    element.classList.remove('marquee-processed');
    
     if (element.dataset.originalText) {
      element.textContent = element.dataset.originalText;
    }
  });
}

function setupPerfectMarquee(element) {
  if (!element) return;
  
   const originalText = element.textContent.trim();
  if (!originalText) return;
  
   element.dataset.originalText = originalText;
  element.textContent = '';
  element.classList.add('marquee-processed');
  
   const marqueeContainer = document.createElement('div');
  marqueeContainer.className = 'marquee-container';
  marqueeContainer.style.position = 'relative';
  marqueeContainer.style.width = '100%';
  marqueeContainer.style.height = '100%';
  marqueeContainer.style.overflow = 'hidden';
  element.appendChild(marqueeContainer);
  
   const contentWrapper = document.createElement('div');
  contentWrapper.className = 'marquee-content';
  contentWrapper.style.display = 'inline-block';
  contentWrapper.style.whiteSpace = 'nowrap';
  contentWrapper.style.willChange = 'transform';  
  contentWrapper.style.transform = 'translateZ(0)';  
  
   const textSpan1 = document.createElement('span');
  textSpan1.textContent = originalText;
  textSpan1.style.display = 'inline-block';
  contentWrapper.appendChild(textSpan1);
  
 
  const spacer = document.createElement('span');
  spacer.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
  spacer.style.display = 'inline-block';
  contentWrapper.appendChild(spacer);
  
 
  marqueeContainer.appendChild(contentWrapper);
  
   setTimeout(() => {
     const textWidth = textSpan1.offsetWidth;
    const containerWidth = marqueeContainer.offsetWidth;
    
     if (textWidth > containerWidth * 0.8) {
       const textSpan2 = document.createElement('span');
      textSpan2.textContent = originalText;
      textSpan2.style.display = 'inline-block';
      contentWrapper.appendChild(textSpan2);
      
       const spacer2 = document.createElement('span');
      spacer2.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
      spacer2.style.display = 'inline-block';
      contentWrapper.appendChild(spacer2);
      
       const textSpan3 = document.createElement('span');
      textSpan3.textContent = originalText;
      textSpan3.style.display = 'inline-block';
      contentWrapper.appendChild(textSpan3);
      
     
      
      const uniqueId = 'marquee-' + Math.random().toString(36).substr(2, 9);
      
    
      const animateWidth = textWidth + spacer.offsetWidth;
      
    
      const steps = Math.max(30, Math.ceil(animateWidth / 2)); // More steps = smoother animation
      
      const keyframes = `
        @keyframes ${uniqueId} {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-${animateWidth}px, 0, 0); }
        }
      `;
      
 
      const style = document.createElement('style');
      style.textContent = keyframes;
      document.head.appendChild(style);
      
 
      const duration = Math.max(8, animateWidth / 25);
      
 
      contentWrapper.style.animation = `${uniqueId} ${duration}s infinite linear`;
      
       
      contentWrapper.addEventListener('animationiteration', () => {
     
      });
    }
  }, 50);
}

function updateMarqueeText(element, newText) {
  if (!element) return;
  
 
  element.textContent = newText;
  element.dataset.originalText = newText;
  setupPerfectMarquee(element);
}

 
function setupMarquee() {
  setupMarqueeForCurrentTrack();
}
 
  
   
  function closeModalOnClickOutside(e) {
   
    if (!modal.querySelector('.audio-player-playlist').contains(e.target) && 
        !(toggleBtn && toggleBtn.contains(e.target))) {
      closeModal();
    }
  }
  
 
  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
   
    if (toggleBtn) {
      const musicIcon = toggleBtn.querySelector('.music-icon');
      const closeIcon = toggleBtn.querySelector('.close-icon');
      
      if (musicIcon && closeIcon) {
        musicIcon.style.display = 'none';
        closeIcon.style.display = 'block';
      }
    }
    
     setTimeout(() => {
      modal.addEventListener('click', closeModalOnClickOutside);
    }, 100);
    
     setTimeout(() => {
      setupMarqueeForCurrentTrack();
    }, 100);
  }
  
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';  
    
     modal.removeEventListener('click', closeModalOnClickOutside);
    
 
    if (toggleBtn) {
      const musicIcon = toggleBtn.querySelector('.music-icon');
      const closeIcon = toggleBtn.querySelector('.close-icon');
      
       if (closeIcon) {
        closeIcon.style.display = 'none';
      }
      
       if (musicIcon) {
        if (audio.paused) {
          musicIcon.style.display = 'block';
          musicIcon.style.opacity = '1';
          musicIcon.style.visibility = 'visible';
        } else {
          musicIcon.style.display = 'block';
          musicIcon.style.opacity = '0';
          musicIcon.style.visibility = 'hidden';
        }
      }
    }
  }
  
  // Button mode click handler
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent immediate trigger of closeModalOnClickOutside
      if (modal.classList.contains('open')) {
        closeModal();
      } else {
        openModal();
      }
    });
  }
  
  // Mini-bar expand button click handler
  if (miniExpandBtn) {
    miniExpandBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      openModal();
    });
  }
  
  // Make the entire mini-bar clickable to expand (except controls)
  if (miniMusicBar) {
    miniMusicBar.addEventListener('click', function(e) {
      // Don't open modal if clicking on controls
      if (!e.target.closest('.mini-controls')) {
        openModal();
      }
    });
    
    // Add swipe up detection for mobile
    let touchstartY = 0;
    
    miniMusicBar.addEventListener('touchstart', function(e) {
      touchstartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    miniMusicBar.addEventListener('touchend', function(e) {
      const touchendY = e.changedTouches[0].screenY;
      const diff = touchstartY - touchendY;
      
      // If swiped up more than 30px, open the modal
      if (diff > 30) {
        openModal();
      }
    }, { passive: true });
  }
  
  // Standard modal controls
  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent event bubbling
      closeModal();
    });
  }
  
  // Enhanced Mini-bar control buttons with proper event handling for mobile
  if (miniPlayBtn) {
    miniPlayBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent opening modal
      
      if (audio.paused) {
        playAudioWithErrorHandling();
      } else {
        audio.pause();
        setPlayButtonsToPlayState();
        savePlayerState();
        saveDetailedPlayerState();
      }
    });
  }
  
  if (miniPrevBtn) {
    miniPrevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent opening modal
      
      currentTrackIndex = (currentTrackIndex - 1 + trackItems.length) % trackItems.length;
      loadTrack(currentTrackIndex);
    });
  }
  
  if (miniNextBtn) {
    miniNextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent opening modal
      
      currentTrackIndex = (currentTrackIndex + 1) % trackItems.length;
      loadTrack(currentTrackIndex);
    });
  }
  
   function updateButtonTrackImage(trackImageUrl) {
    if (buttonTrackImage) {
      buttonTrackImage.src = trackImageUrl;
    }
  }
  
 function updateTrackInfo(index) {
  const trackItem = trackItems[index];
  
   trackItems.forEach(item => {
    item.classList.remove('active');
    item.classList.remove('playing');
  });
  
   trackItem.classList.add('active');
  
   if (!audio.paused) {
    trackItem.classList.add('playing');
  }
  
   const coverImage = trackItem.dataset.coverImage;
 
  if (currentTrackImage) currentTrackImage.src = coverImage;
  
   if (buttonTrackImage) buttonTrackImage.src = coverImage;
  
   const discImages = playerContainer.querySelectorAll('.disc-cover-image, .mini-disc-cover-image, .modal-disc-cover-image');
  discImages.forEach(img => {
    img.src = coverImage;
  });
  
   if (trackTitle) {
    updateMarqueeText(trackTitle, trackItem.dataset.trackTitle);
  }
  
  if (artistName) artistName.textContent = trackItem.dataset.artistName;
  
   if (miniTrackTitle) {
    updateMarqueeText(miniTrackTitle, trackItem.dataset.trackTitle);
  }
  
  if (miniArtistName) miniArtistName.textContent = trackItem.dataset.artistName;
  if (miniTrackImage) miniTrackImage.src = coverImage;
  
   setupMarqueeForCurrentTrack();
}
  
   function updateMiniBarInfo() {
    if (miniTrackTitle && miniArtistName && miniTrackImage) {
      const currentTrack = trackItems[currentTrackIndex];
      if (currentTrack) {
        updateMarqueeText(miniTrackTitle, currentTrack.dataset.trackTitle);
        miniArtistName.textContent = currentTrack.dataset.artistName;
        miniTrackImage.src = currentTrack.dataset.coverImage;
      }
    }
  }
  
   audio.addEventListener('timeupdate', function() {
    const currentSeconds = audio.currentTime;
    const durationSeconds = audio.duration || 0;
    
     const progressPercent = (currentSeconds / durationSeconds) * 100;
    if (progress) progress.style.width = `${progressPercent}%`;
    
     if (miniProgress) miniProgress.style.width = `${progressPercent}%`;
    
     if (currentTime) currentTime.textContent = formatTime(currentSeconds);
    if (remainingTime) remainingTime.textContent = formatTime(durationSeconds);
    
     if (Math.floor(currentSeconds) % 5 === 0) {
      savePlayerState();
      saveDetailedPlayerState();
    }
  });
  
   audio.addEventListener('loadedmetadata', function() {
    if (remainingTime) remainingTime.textContent = formatTime(audio.duration);
    
     const activeTrack = playerContainer.querySelector('.track-item.active');
    if (activeTrack) {
      activeTrack.querySelector('.track-duration').textContent = formatTime(audio.duration);
    }
  });
  
   audio.addEventListener('play', function() {
     const activeTrack = playerContainer.querySelector('.track-item.active');
    if (activeTrack) {
      activeTrack.classList.add('playing');
    }
  });

   audio.addEventListener('pause', function() {
     const playingTracks = playerContainer.querySelectorAll('.track-item.playing');
    playingTracks.forEach(track => {
      track.classList.remove('playing');
    });
  });
  
   function setupMobileAwareVolumeControl() {
     if (isIOS) {
      if (volumeControl) volumeControl.style.display = 'none';
      if (volumeBtn) volumeBtn.style.display = 'none';
    }
    
     if (isAndroid) {
      if (volumeSlider) {
         volumeSlider.addEventListener('change', function() {
          
          lastVolume = volumeSlider.value;
          
           if (lastVolume === 0) {
            volumeHighIcon.style.display = 'none';
            volumeMuteIcon.style.display = 'block';
            isMuted = true;
          } else {
            volumeHighIcon.style.display = 'block';
            volumeMuteIcon.style.display = 'none';
            isMuted = false;
          }
          
          savePlayerState();
          saveDetailedPlayerState();
        });
      }
    }
  }
  
   setupMobileAwareVolumeControl();
  
  
  if (playBtn) {
    playBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent closing modal
      if (audio.paused) {
        playAudioWithErrorHandling();
      } else {
        audio.pause();
        setPlayButtonsToPlayState();
        savePlayerState();
        saveDetailedPlayerState();
      }
    });
  }
  
 
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent closing modal
      currentTrackIndex = (currentTrackIndex - 1 + trackItems.length) % trackItems.length;
      loadTrack(currentTrackIndex);
    });
  }
  
   if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent closing modal
      currentTrackIndex = (currentTrackIndex + 1) % trackItems.length;
      loadTrack(currentTrackIndex);
    });
  }
  
  
  if (progressBar) {
    progressBar.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent closing modal
      const seekTime = (e.offsetX / progressBar.clientWidth) * audio.duration;
      setCurrentTimeWithRetry(seekTime);
    });
  }
  
   if (volumeBtn && !isIOS) {
    volumeBtn.addEventListener('click', function(e) {
      e.stopPropagation(); 
      
      if (isMobile) {
        
        if (isMuted) {
           
          try {
            audio.volume = lastVolume;
          } catch (e) {
            console.log("Mobile volume control is limited. Please use device buttons.");
          }
          volumeHighIcon.style.display = 'block';
          volumeMuteIcon.style.display = 'none';
          isMuted = false;
        } else {
         
          try {
            lastVolume = audio.volume;
            audio.volume = 0;
          } catch (e) {
            console.log("Mobile volume control is limited. Please use device buttons.");
          }
          volumeHighIcon.style.display = 'none';
          volumeMuteIcon.style.display = 'block';
          isMuted = true;
        }
      } else {
         
        if (isMuted) {
           
          audio.volume = lastVolume;
          volumeSlider.value = lastVolume;
          volumeHighIcon.style.display = 'block';
          volumeMuteIcon.style.display = 'none';
          isMuted = false;
        } else {
          
          if (volumeControl.classList.contains('active')) {
           
            lastVolume = audio.volume;
            audio.volume = 0;
            volumeSlider.value = 0;
            volumeHighIcon.style.display = 'none';
            volumeMuteIcon.style.display = 'block';
            isMuted = true;
            volumeControl.classList.remove('active');
          } else {
             
            volumeControl.classList.add('active');
            setTimeout(() => {
          
              document.addEventListener('click', hideVolumeControl);
            }, 10);
          }
        }
      }
      
      savePlayerState();
      saveDetailedPlayerState();
    });
  }
  
   
  function hideVolumeControl(e) {
    if (volumeControl && !volumeControl.contains(e.target)) {
      volumeControl.classList.remove('active');
      document.removeEventListener('click', hideVolumeControl);
    }
  }
  
  
  if (volumeSlider && !isMobile) {
    volumeSlider.addEventListener('input', function(e) {
      e.stopPropagation(); // Prevent closing modal
      audio.volume = volumeSlider.value;
      
       
      if (audio.volume === 0) {
        volumeHighIcon.style.display = 'none';
        volumeMuteIcon.style.display = 'block';
        isMuted = true;
      } else {
        volumeHighIcon.style.display = 'block';
        volumeMuteIcon.style.display = 'none';
        isMuted = false;
        lastVolume = audio.volume;
      }
      
      savePlayerState();
      saveDetailedPlayerState();
    });
  }
  
   
  audio.addEventListener('ended', function() {
    currentTrackIndex = (currentTrackIndex + 1) % trackItems.length;
    loadTrack(currentTrackIndex);
  });
  
 
  function loadTrack(index, autoplay = true) {
    const trackItem = trackItems[index];
    
    
    trackItems.forEach(item => {
      item.classList.remove('active');
      item.classList.remove('playing');
    });
    
    
    trackItem.classList.add('active');
   
    const trackUrl = trackItem.dataset.trackUrl;
    
     const wasPlaying = !audio.paused;
    
     audio.src = trackUrl;
    
     updateTrackInfo(index);
    
     if (progress) progress.style.width = '0%';
    if (miniProgress) miniProgress.style.width = '0%';
    if (currentTime) currentTime.textContent = '0:00';
    if (remainingTime) remainingTime.textContent = '0:00';
    
     audio.load();
    
     if (autoplay) {
      playAudioWithErrorHandling();
    } else if (wasPlaying && !isMobile) {
       playAudioWithErrorHandling();
    } else if (wasPlaying && isMobile) {
       setPlayButtonsToPauseState();
      setupMobileAutoPlayTrigger();
    } else {
      setPlayButtonsToPlayState();
    }
    
     savePlayerState();
    saveDetailedPlayerState();
  }
  
   trackItems.forEach((item, index) => {
     item.querySelector('.track-duration').textContent = '--:--';
    
    item.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent closing modal
      if (index !== currentTrackIndex) {
        currentTrackIndex = index;
        loadTrack(currentTrackIndex);
      } else {
         if (audio.paused) {
          playAudioWithErrorHandling();
        } else {
          audio.pause();
          setPlayButtonsToPlayState();
          savePlayerState();
          saveDetailedPlayerState();
        }
      }
    });
  });
  
   function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
  
   function savePlayerState() {
    playerState = {
      isPlaying: !audio.paused,
      currentTime: audio.currentTime,
      currentTrack: currentTrackIndex,
      volume: isMobile ? lastVolume : audio.volume,
      lastInteraction: Date.now()
    };
    localStorage.setItem('audioPlayerState', JSON.stringify(playerState));
  }
  
   function saveDetailedPlayerState() {
    const currentTrack = trackItems[currentTrackIndex];
    if (!currentTrack) return;
    
    const detailedState = {
      isPlaying: !audio.paused,
      currentTime: audio.currentTime,
      currentTrack: currentTrackIndex,
      volume: isMobile ? lastVolume : audio.volume,
      lastInteraction: Date.now(),
      trackData: {
        url: currentTrack.dataset.trackUrl,
        title: currentTrack.dataset.trackTitle,
        artist: currentTrack.dataset.artistName,
        cover: currentTrack.dataset.coverImage
      }
    };
    localStorage.setItem('audioPlayerDetailedState', JSON.stringify(detailedState));
    
     if (isMobile) {
       if (!window.miniAudioKeepAlive) {
        window.miniAudioKeepAlive = document.createElement('audio');
        window.miniAudioKeepAlive.volume = 0;
        window.miniAudioKeepAlive.loop = true;
        document.body.appendChild(window.miniAudioKeepAlive);
      }
      
       if (isIOS && !audio.paused) {
        try {
          window.miniAudioKeepAlive.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
          window.miniAudioKeepAlive.play().catch(() => {
           });
        } catch (e) {
         }
      }
    }
  }
  
   if (isMobile) {
     document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') {
         const savedState = localStorage.getItem('audioPlayerDetailedState');
        if (savedState) {
          try {
            const detailedState = JSON.parse(savedState);
            const stateAge = Date.now() - (detailedState.lastInteraction || 0);
            
             if (stateAge < 30000 && detailedState.isPlaying) {
               audio.play().catch(error => {
                console.log("Auto-resume blocked on mobile, user interaction required");
                
                 const resumeHandler = function() {
                  audio.play().catch(e => console.log("Still couldn't play audio"));
                  document.removeEventListener('click', resumeHandler);
                };
                document.addEventListener('click', resumeHandler, { once: true });
              });
            }
          } catch (e) {
           }
        }
      } else {
         savePlayerState();
        saveDetailedPlayerState();
      }
    });
    
     function setupMobileAudioContext() {
      try {
         if (window.AudioContext || window.webkitAudioContext) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const audioCtx = new AudioContext();
          
           const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
           gainNode.gain.value = 0;
          
          // Connect but make it silent
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
           oscillator.start();
          
           window.musicPlayerAudioContext = audioCtx;
          window.musicPlayerOscillator = oscillator;
          
           const resumeAudioContext = () => {
            if (audioCtx.state === 'suspended') {
              audioCtx.resume();
            }
          };
          
           document.addEventListener('click', resumeAudioContext, { once: true });
          document.addEventListener('touchstart', resumeAudioContext, { once: true });
        }
      } catch (e) {
        console.error('Error creating Audio Context:', e);
      }
    }
    
     setupMobileAudioContext();
    
     window.addEventListener('pagehide', function() {
      savePlayerState();
      saveDetailedPlayerState();
    });
    
    window.addEventListener('pageshow', function(event) {
       if (event.persisted) {
        setTimeout(() => {
           const savedState = localStorage.getItem('audioPlayerDetailedState');
          if (savedState) {
            try {
              const detailedState = JSON.parse(savedState);
              const stateAge = Date.now() - (detailedState.lastInteraction || 0);
              
               if (stateAge < 30000) {
                 if (detailedState.isPlaying) {
                  setPlayButtonsToPauseState();
                  
                   const resumeHandler = function() {
                    audio.play().catch(e => console.log("Couldn't play audio"));
                    document.removeEventListener('click', resumeHandler);
                  };
                  document.addEventListener('click', resumeHandler, { once: true });
                } else {
                  setPlayButtonsToPlayState();
                }
                
                 setCurrentTimeWithRetry(detailedState.currentTime || 0);
              }
            } catch (e) {
             }
          }
        }, 100);
      }
    });
    
 
    window.addEventListener('unload', function() {
       
      saveDetailedPlayerState();
      
      
      if (!audio.paused) {
        sessionStorage.setItem('music_player_was_playing', 'true');
        sessionStorage.setItem('music_player_track_position', audio.currentTime.toString());
        sessionStorage.setItem('music_player_track_url', trackItems[currentTrackIndex].dataset.trackUrl);
      }
    });
    
 
    const wasPlaying = sessionStorage.getItem('music_player_was_playing');
    if (wasPlaying === 'true') {
       
      sessionStorage.removeItem('music_player_was_playing');
      
     
      document.addEventListener('click', function resumeAfterNavigation() {
        if (audio.paused && playerContainer.classList.contains('playing')) {
          audio.play().catch(e => {
            console.log("Couldn't auto-resume after navigation");
          });
        }
        document.removeEventListener('click', resumeAfterNavigation);
      }, { once: true });
    }
  }
  
  
  document.addEventListener('visibilitychange', function() {
    savePlayerState();
    saveDetailedPlayerState();
  });
  
  
  window.addEventListener('beforeunload', function() {
    savePlayerState();
    saveDetailedPlayerState();
  });
  
 
  if (trackItems.length > 0) {
    
    initPlayer();
    
    
    preloadTrackMetadata();
  }
  
 
  function preloadTrackMetadata() {
    trackItems.forEach((item) => {
      const audioElement = new Audio();
      audioElement.src = item.dataset.trackUrl;
      
      audioElement.addEventListener('loadedmetadata', function() {
        const duration = audioElement.duration;
        item.querySelector('.track-duration').textContent = formatTime(duration);
      });
    });
  }
});
    };
})();
