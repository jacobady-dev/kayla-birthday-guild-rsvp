(() => {
  const music = document.querySelector('#background-music');
  if (!music) return;

  const MAX_AMBIENT_VOLUME = 0.09;

  function capVolume() {
    if (music.volume > MAX_AMBIENT_VOLUME) {
      music.volume = MAX_AMBIENT_VOLUME;
    }
  }

  music.addEventListener('volumechange', capVolume);
  music.addEventListener('play', capVolume);
  capVolume();
})();
