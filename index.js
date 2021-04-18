// ==UserScript==
// @name         Master Skribbl Script
// @namespace    https://github.com/sbarrack/skribbl-community-scripts/
// @version      1.4
// @description  Collected and reworked Skribbl scripts
// @author       sbarrack
// @match        http*://skribbl.io/*
// @updateURL    https://raw.githubusercontent.com/sbarrack/skribbl-community-scripts/master/index.js
// @downloadURL  https://raw.githubusercontent.com/sbarrack/skribbl-community-scripts/master/index.js
// @grant        none
// ==/UserScript==
'use strict';

(function ($) {
  // #region Consts
  const developers = Object.freeze(['S', 'Jess']);
  const keybindPanel = `
<div>
  <label for="scsGamemode">Gamemode:</label>
  <select class="form-control" id="scsGamemode">
    <option>None</option>
    <option>Blind</option>
    <option>Deaf</option>
    <option>One shot</option>
  </select>
</div>
<h5>Keybinds</h5>
<p><i>Esc</i> unbinds a key binding.</p>
<div>
  <label for="scsChatFocus">Focus chat:</label>
  <select class="form-control" id="scsChatFocus">
    <option>None</option>
    <option>Shift</option>
    <option>Alt</option>
    <option>Ctrl</option>
  </select>
  <h5 class="plus">+</h5>
  <input class="form-control" id="scsChatFocus2" placeholder="Click to bind..." readonly>
</div>
<div>
  <label for="scsBrushSize">Brush size:</label>
  <select class="form-control" id="scsBrushSize">
    <option>None</option>
    <option>1-4</option>
    <option>Numpad 1-4</option>
  </select>
  <label for="scsBrushColor">Brush color:</label>
  <select class="form-control" id="scsBrushColor">
    <option>None</option>
    <option>0-9</option>
    <option>Numpad 0-9</option>
  </select>
</div>

<style>
  .scsTitleMenu {
    background-color: #fff;
    border-radius: 2px;
    padding: 8px;
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .scsTitleMenu > div { display: flex; margin-bottom: 10px; }
  .scsTitleMenu > h4, .scsTitleMenu > h5, .scsTitleMenu > p { text-align: center; }
  .scsTitleMenu p { font-size: 12px; }
  .scsTitleMenu h5 { font-size: 16px; }
  .scsTitleMenu h5.plus { margin-left: 10px; font-weight: bold; }
  .scsTitleMenu label {
    vertical-align: middle;
    align-self: center;
    margin-bottom: 0;
  }
  .scsTitleMenu > div > label:nth-child(n + 2) {
    margin-left: 10px;
  }
  .scsTitleMenu .form-control {
    margin-left: 10px;
    width: auto;
  }
</style>
`;
  const customUI = `<div id="scsCustomUi">
<div id="scsPostWrapper" data-toggle="tooltip" data-placement="top" title="Save the current image">
  <button id="scsPostAwesome" class="btn btn-success btn-xs scsPost">
    Save Drawing
  </button>
</div>
<div id="scsRainbowWrapper">
  <span>Brush mode:</span>
  <select class="form-control" id="scsRainbowMode" value="1-color">
    <option>1-color</option>
    <option>2-cycle</option>
    <option>Light</option>
    <option>Dark</option>
    <option>All</option>
    <option>Gray</option>
  </select>
  <span>Speed (ms):</span>
  <input type="number" id="scsRainbowSpeed" class="form-control" min="10" max="1000" value="50" step="10" size="4" maxlength="4">
</div>

<style>
  #rateDrawing { position: fixed; }
  div#currentWord { text-align: right; }
  #scsWordSize {
    flex: 1 1 auto;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 3px;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  #containerBoard .containerToolbar { display: flex !important }
  #scsCustomUi { color: white; }
  #scsCustomUi > div { margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
  .scsPost { position: relative; width: 100%; }
  #scsPostWrapper.disabled > * {
    opacity: 0.7;
    pointer-events: none;
  }
  #scsRainbowWrapper { margin-bottom: 10px; font-size: 12px; }
  #scsRainbowWrapper .form-control { width: auto; }
  .containerTools .tool[data-tool^="scs"].scsToolActive {
    background-color: #559105;
    filter: none;
  }
  .containerTools .tool[data-tool^="scs"]:hover {
    background-color: #699b37;
    filter: none;
  }
  div.colorPreview {
    width: 32px;
    height: 32px;
    margin-right: 24px;
  }
  .scsColorPreview {
    top: 16px;
    left: 16px;
    position: relative;
    width: 32px;
    height: 32px;
    z-index: -1;
    border-radius: 2px;
  }
  #randomIcon {
    display: none;
  }
  #containerPlayerlist .player .name:hover {
    cursor: pointer;
    text-decoration: underline;
  }
  #containerPlayerlist .player {
    max-height: 48px;
  }
  .scsMute {
    opacity: 0.5;
  }
  .scsMute .message,
  .scsDeaf .message {
    display: none !important;
  }
  .scsDeaf #boxMessages {
    opacity: 0;
  }
  [scsMuteSender] {
    display: none;
  }
</style>
</div>`;
  const colors = [
    0xffffff,
    0xc1c1c1,
    0xef130b,
    0xff7100,
    0xffe400,
    0x00cc00,
    0x00b2ff,
    0x231fd3,
    0xa300ba,
    0xd37caa,
    0xa0522d,
    0x000000,
    0x4c4c4c,
    0x740b07,
    0xc23800,
    0xe8a200,
    0x005510,
    0x00569e,
    0x0e0865,
    0x550069,
    0xa75574,
    0x63300d,
  ];
  const colorsRGB = [
    'rgb(255, 255, 255)',
    'rgb(193, 193, 193)',
    'rgb(239, 19, 11)',
    'rgb(255, 113, 0)',
    'rgb(255, 228, 0)',
    'rgb(0, 204, 0)',
    'rgb(0, 178, 255)',
    'rgb(35, 31, 211)',
    'rgb(163, 0, 186)',
    'rgb(211, 124, 170)',
    'rgb(160, 82, 45)',
    'rgb(0, 0, 0)',
    'rgb(76, 76, 76)',
    'rgb(116, 11, 7)',
    'rgb(194, 56, 0)',
    'rgb(232, 162, 0)',
    'rgb(0, 85, 16)',
    'rgb(0, 86, 158)',
    'rgb(14, 8, 101)',
    'rgb(85, 0, 105)',
    'rgb(167, 85, 116)',
    'rgb(99, 48, 13)',
  ];
  const settingKeys = [
    'scsChatFocus',
    'scsChatFocus2',
    'scsChatFocus2',
    'scsGamemode',
    'scsBrushSize',
    'scsBrushColor',
    'scsRainbowMode',
    'scsRainbowSpeed',
  ];
  // #endregion

  const settings = {};
  settingKeys.forEach(key => (settings[key] = localStorage.getItem(key)));
  addEventListener('beforeunload', () => {
    settingKeys.forEach(key => {
      if (!settings[key] || settings[key] === 'null') {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, settings[key]);
      }
    });
  });

  const scsElements = {};
  const hatchetAnchor = { x: null, y: null };
  const playerBlacklist = [];

  let lastColorIdx = 11;
  let canvas,
    currentWord,
    solvedWord,
    timer,
    chatModKey,
    chatFocusKey,
    chatInput,
    brushSizes,
    brushColors,
    currentGamemode,
    artist,
    currentWordSize,
    previousGuess = '';

  let primaryActiveColor, secondaryActiveColor;
  let isHatcheting, hatchInterval;

  function switchColors() {
    const secondaryColorIdx = colorsRGB.indexOf(secondaryActiveColor.style.backgroundColor);
    secondaryActiveColor.style.backgroundColor = primaryActiveColor.style.backgroundColor;
    if (secondaryColorIdx != -1) {
      brushColors[secondaryColorIdx].click();
    }
  }

  function initColorToggle() {
    primaryActiveColor = document.getElementsByClassName('colorPreview')[0];

    secondaryActiveColor = primaryActiveColor.cloneNode();
    secondaryActiveColor.classList.add('scsColorPreview');
    secondaryActiveColor.classList.remove('colorPreview');
    secondaryActiveColor.style.backgroundColor = colorsRGB[0];
    secondaryActiveColor = primaryActiveColor.appendChild(secondaryActiveColor);

    primaryActiveColor.setAttribute('title', 'Color (T)oggle');
    $(primaryActiveColor).tooltip('fixTitle');
    primaryActiveColor.addEventListener('click', switchColors);
  }

  function focusChat(e) {
    let modKey = true;
    if (chatModKey === 'Shift') {
      modKey = e.shiftKey;
    } else if (chatModKey === 'Alt') {
      modKey = e.altKey;
    } else if (chatModKey === 'Ctrl') {
      modKey = e.ctrlKey;
    }
    if (modKey && (!chatFocusKey || e.key === chatFocusKey)) {
      e.preventDefault();
      chatInput.focus();
    }
  }

  function initChatFocus() {
    const focusKeybind = document.getElementById('scsChatFocus');
    chatModKey = settings.scsChatFocus;
    focusKeybind.value = chatModKey || 'None';
    focusKeybind.addEventListener('change', e => {
      settings.scsChatFocus = e.target.value;
      chatModKey = e.target.value;
    });

    const focusKeybind2 = document.getElementById('scsChatFocus2');
    chatFocusKey = settings.scsChatFocus2;
    focusKeybind2.value = chatFocusKey;
    focusKeybind2.addEventListener('click', e => {
      function bindKey(e) {
        if (e.key !== 'Escape') {
          settings.scsChatFocus2 = e.key;
          e.target.value = e.key;
          chatFocusKey = e.key;
        } else {
          settings.scsChatFocus2 = '';
          e.target.value = '';
          chatFocusKey = '';
        }
        document.removeEventListener('keydown', bindKey);
      }

      document.addEventListener('keydown', bindKey);
      setTimeout(() => {
        document.removeEventListener('keydown', bindKey);
      }, 10000);
    });
  }

  function initPostImage() {
    const postWrapper = document.getElementById('scsPostWrapper');

    if (postWrapper) {
      postWrapper.setAttribute('title', 'Save the current image');
      $(postWrapper).tooltip();
    }

    document.getElementById('scsPostAwesome').addEventListener('click', e => {
      postImage();
    });

    let debounceTimeout;
    function clearDebounce() {
      clearTimeout(debounceTimeout);
      debounceTimeout = 0;
    }

    function postImage() {
      const canvasImage = canvas.toDataURL().split(',')[1];
      let word = currentWord.innerText;
      const timeLeft = timer.innerText;

      let wordParsed;
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(clearDebounce, 3000);
      } else {
        debounceTimeout = setTimeout(clearDebounce, 3000);
        if (solvedWord) {
          wordParsed = solvedWord;
        } else {
          wordParsed = word.replace(/_/g, '\\*');
        }

        const data = new FormData();
        data.append('image', canvasImage);
        data.append('name', Date.now() + '.png');
        data.append('title', word + ' by ' + artist);
        data.append('description', 'Saved image from skribbl.io');
        fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: new Headers({ Authorization: 'Client-ID b5db76b67498dd6' }),
          body: data,
        })
          .then(res => {
            res
              .json()
              .then(res2 => {
                alert(res2.data.link);
              })
              .catch(err => {
                console.debug(err);
                alert('Failed to send image to imgur :(');
              });
          })
          .catch(err => console.debug(err));
      }
    }
  }

  function initGamemode() {
    currentGamemode = sessionStorage.getItem('scsGamemode');
    const gamemodeInput = document.getElementById('scsGamemode');
    gamemodeInput.value = currentGamemode || 'None';
    gamemodeInput.addEventListener('change', e => {
      sessionStorage.setItem('scsGamemode', e.target.value);
      currentGamemode = e.target.value;
    });
  }

  function initBrushSelect() {
    const colorInput = document.getElementById('scsBrushColor');
    colorInput.value = settings.scsBrushColor || 'None';

    const sizeInput = document.getElementById('scsBrushSize');
    sizeInput.value = settings.scsBrushSize || 'None';

    brushColors = document.querySelectorAll('[data-color]');
    brushSizes = document.querySelectorAll('[data-size]');

    sizeInput.addEventListener('change', e => (settings.scsBrushSize = e.target.value));
    colorInput.addEventListener('change', e => (settings.scsBrushColor = e.target.value));
  }

  function selectBrushSize(e) {
    const brushSizeOptions = ['1', '2', '3', '4'];
    if (!brushSizeOptions.includes(e.key)) {
      return;
    }
    if (
      (settings.scsBrushSize === '1-4' && e.code.match(/Digit[0-9]/)) ||
      (settings.scsBrushSize === 'Numpad 1-4' && e.code.match(/Numpad[0-9]/))
    ) {
      brushSizes[+e.key - 1].click();
    }
  }

  function selectBrushColor(e) {
    const brushColorOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    if (!brushColorOptions.includes(e.key)) {
      return;
    }

    if (
      (settings.scsBrushColor === '0-9' && e.code.match(/Digit[0-9]/)) ||
      (settings.scsBrushColor === 'Numpad 0-9' && e.code.match(/Numpad[0-9]/))
    ) {
      let targetColor = 11;
      if (e.key === '0') {
        switch (lastColorIdx) {
          case 11:
            targetColor = 0;
            break;
          case 0:
            targetColor = 1;
            break;
          case 1:
            targetColor = 12;
        }
      } else if (lastColorIdx == +e.key + 1) {
        targetColor = +e.key + 12;
      } else {
        targetColor = +e.key + 1;
      }
      brushColors[targetColor].click();
      lastColorIdx = targetColor;
    }
  }

  function hatchCycle() {
    if (isHatcheting && hatchetAnchor.x && hatchetAnchor.y) {
      document.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: hatchetAnchor.x,
          clientY: hatchetAnchor.y,
        })
      );
    }
  }

  function initHatching() {
    // Make the anchor image
    const scsAnchor = document.createElement('img');
    scsAnchor.id = 'scsAnchor';
    scsAnchor.style.display = 'none';
    scsAnchor.style.position = 'absolute';
    scsAnchor.style.pointerEvents = 'none';
    scsAnchor.src =
      'https://raw.githubusercontent.com/sbarrack/skribbl-community-scripts/master/images/anchor.png';
    document.body.appendChild(scsAnchor);

    scsElements.scsAnchor = scsAnchor;

    // Make the tool
    const eraserTool = document.querySelector('[data-tool="erase"]');
    let hatchingTool = eraserTool.cloneNode(true);
    hatchingTool.setAttribute('data-tool', 'scsHatching');
    hatchingTool.firstChild.setAttribute(
      'title',
      '(H)atching (middle click to anchor, space to unanchor)'
    );
    hatchingTool.firstChild.setAttribute(
      'src',
      'https://raw.githubusercontent.com/sbarrack/skribbl-community-scripts/master/images/hatchet.gif'
    );
    hatchingTool = eraserTool.parentNode.insertBefore(hatchingTool, eraserTool);
    $(hatchingTool.firstChild).tooltip();

    // onClick logic
    hatchingTool.addEventListener('click', e => {
      hatchingTool.classList.toggle('scsToolActive');
      if (hatchingTool.classList.contains('scsToolActive')) {
        if (hatchetAnchor.x && hatchetAnchor.y) {
          scsAnchor.style.display = 'block';
        }
        hatchInterval = setInterval(hatchCycle, settings.scsRainbowSpeed);
      } else {
        scsAnchor.style.display = 'none';
        if (hatchInterval) {
          clearInterval(hatchInterval);
          hatchInterval = 0;
        }
      }
    });

    // Hatchet functionality
    document.addEventListener('mousedown', e => {
      if (hatchingTool.classList.contains('scsToolActive')) {
        if (e.button == 0) {
          isHatcheting = true;
        } else if (e.button == 1) {
          hatchetAnchor.x = e.clientX;
          hatchetAnchor.y = e.clientY;
          scsAnchor.style.display = 'block';
          scsAnchor.style.top = e.clientY - 4 + 'px';
          scsAnchor.style.left = (e.clientX - 13).toString(10) + 'px';
        }
      }
    });

    document.addEventListener('mouseup', e => {
      if (hatchingTool.classList.contains('scsToolActive')) {
        if (e.button == 0) {
          isHatcheting = false;
        }
      }
    });

    scsElements.hatchingTool = hatchingTool;
  }

  function initRainbow() {
    // Rainbow tick (change colors very fast)
    let rainbowIdx = 0;
    const grayCycle = [0, 1, 12, 11];
    function rainbowCycleTick() {
      if (settings.scsRainbowMode === '1-color') {
        const currentColorIdx = colorsRGB.indexOf(primaryActiveColor.style.backgroundColor);
        brushColors[(currentColorIdx + 11) % 22].click();
      } else if (settings.scsRainbowMode === '2-cycle') {
        switchColors();
      } else if (settings.scsRainbowMode === 'Light') {
        brushColors[(rainbowIdx % 7) + 2].click();
      } else if (settings.scsRainbowMode === 'Dark') {
        brushColors[(rainbowIdx % 7) + 13].click();
      } else if (settings.scsRainbowMode === 'Gray') {
        brushColors[grayCycle[rainbowIdx % 4]].click();
      } else if (settings.scsRainbowMode === 'All') {
        brushColors[rainbowIdx % 22].click();
      }
      rainbowIdx = (rainbowIdx + 1) % 22;
    }

    // Rainbow Tool stuff
    const eraserTool = document.querySelector('[data-tool="erase"]');
    let rainbowTool = eraserTool.cloneNode(true);
    rainbowTool.setAttribute('data-tool', 'scsRainbow');
    rainbowTool.firstChild.setAttribute('title', 'Magic b(R)ush');
    rainbowTool.firstChild.setAttribute(
      'src',
      'https://raw.githubusercontent.com/sbarrack/skribbl-community-scripts/master/images/brush.gif'
    );
    rainbowTool = eraserTool.parentNode.insertBefore(rainbowTool, eraserTool);
    $(rainbowTool.firstChild).tooltip();

    // Rainbow Interval for when tool is clicked
    let rainbowInterval;
    rainbowTool.addEventListener('click', e => {
      rainbowTool.classList.toggle('scsToolActive');
      if (rainbowTool.classList.contains('scsToolActive')) {
        rainbowInterval = setInterval(rainbowCycleTick, settings.scsRainbowSpeed);
      } else if (rainbowInterval) {
        clearInterval(rainbowInterval);
        rainbowInterval = null;
      }
    });
    scsElements.rainbowTool = rainbowTool;

    // Rainbow mode select
    const rainbowSelect = document.getElementById('scsRainbowMode');
    rainbowSelect.value = settings.scsRainbowMode || '1-cycle';
    rainbowSelect.addEventListener('change', e => (settings.scsRainbowMode = e.target.value));

    // Rainbow interval input
    const rainbowSpeedInput = document.getElementById('scsRainbowSpeed');
    settings.scsRainbowSpeed = parseInt(settings.scsRainbowSpeed) || 50;
    rainbowSpeedInput.value = settings.scsRainbowSpeed;
    rainbowSpeedInput.addEventListener('change', e => (settings.scsRainbowSpeed = e.target.value));
    rainbowSpeedInput.addEventListener('change', e => {
      settings.scsRainbowSpeed = parseInt(e.target.value);
      if (rainbowInterval) {
        clearInterval(rainbowInterval);
        rainbowInterval = setInterval(rainbowCycleTick, settings.scsRainbowSpeed);
      }

      if (hatchInterval) {
        clearInterval(hatchInterval);
        hatchInterval = setInterval(hatchCycle, settings.scsRainbowSpeed);
      }

      rainbowSpeedInput.blur();
    });
    scsElements.rainbowSpeed = rainbowSpeedInput;
  }

  function initChatBlacklist() {
    document.addEventListener('click', e => {
      if (e.target.classList.contains('name') && e.target.closest('#containerGamePlayers')) {
        e.stopImmediatePropagation();
        const name = e.target.innerText;
        const nameIdx = playerBlacklist.indexOf(name);
        if (nameIdx == -1) {
          playerBlacklist.push(name);
          e.target.parentElement.parentElement.classList.add('scsMute');
          Array.from(document.querySelectorAll('#boxMessages > p > b')).forEach((v, i, a) => {
            if (v.innerText.endsWith(': ') && v.innerText.slice(0, -2) === name) {
              v.parentElement.setAttribute('scsMuteSender', name);
            }
          });
        } else {
          playerBlacklist.splice(nameIdx, 1);
          e.target.parentElement.parentElement.classList.remove('scsMute');
          const escapedName = name.replace(/["\\]/g, '\\$&');
          Array.from(document.querySelectorAll(`[scsMuteSender="${escapedName}"]`)).forEach(
            (v, i, a) => {
              v.removeAttribute('scsMuteSender');
            }
          );
        }
      }
    });
  }

  function setWordCount() {
    let wordCount = currentWord.innerText;
    if (wordCount) {
      wordCount = wordCount.split(' ');

      wordCount.forEach((v, i, a) => {
        a[i] = v.replaceAll('-', '').length;
      });

      currentWordSize.innerHTML = `&nbsp;(${wordCount.join(',')})`;
    } else {
      currentWordSize.innerHTML = '';
    }
  }

  function initGameObserver() {
    const gameObserver = new MutationObserver(mutations => {
      const screenGame = mutations[0].target;
      if (screenGame.style.display !== 'none') {
        const visibleDrawer = Array.from(document.querySelectorAll('.drawing')).find(
          div => div.offsetParent
        );

        if (visibleDrawer) {
          artist = visibleDrawer.closest('.player').querySelector('.name').innerHTML;
        }

        if (currentGamemode === 'Blind') {
          canvas.style.opacity = 0;
        } else {
          canvas.style.opacity = 1;
        }

        if (currentGamemode === 'Deaf') {
          document.getElementsByClassName('containerGame')[0].classList.add('scsDeaf');
          currentWord.style.opacity = 0;
        } else {
          document.getElementsByClassName('containerGame')[0].classList.remove('scsDeaf');
          currentWord.style.opacity = 1;

          setWordCount();
        }

        function oneshot(e) {
          if (e.key === 'Enter') {
            chatInput.disabled = true;
            chatInput.removeEventListener('keyup', oneshot);
          }
        }

        if (currentGamemode === 'One shot') {
          chatInput.addEventListener('keyup', oneshot);
        }

        const drawingObserver = new MutationObserver(mutations => {
          const overlay = mutations[0].target;
          if (overlay.style.display !== 'none') {
            if (currentGamemode === 'Deaf') {
              chatInput.disabled = false;
              chatInput.removeEventListener('keyup', oneshot);
            }
          } else {
            if (currentGamemode !== 'Deaf') {
              setWordCount();
            } else {
              chatInput.addEventListener('keyup', oneshot);
            }
          }
        });
        drawingObserver.observe(document.getElementById('overlay'), {
          attributes: true,
          attributeFilter: ['style'],
        });
      }
    });
    gameObserver.observe(document.getElementById('screenGame'), {
      attributes: true,
      attributeFilter: ['style'],
    });

    const currentDrawerObserver = new MutationObserver(mutations => {
      const drawer = mutations[0].target;

      if (drawer.style.display !== 'none') {
        solvedWord = '';
        setTimeout(() => {
          artist = drawer.closest('.player').querySelector('.name').innerHTML;
        }, 3000);
      }
    });

    const playersObserver = new MutationObserver(mutations => {
      if (mutations.length > 1) {
        document.querySelectorAll('.drawing').forEach(div => {
          currentDrawerObserver.observe(div, {
            attributes: true,
            attributeFilter: ['style'],
          });
        });
      } else if (mutations[0].addedNodes.length > 0) {
        const newPlayer = mutations[0].addedNodes[0];
        currentDrawerObserver.observe(newPlayer.querySelector('.avatar .drawing'), {
          attributes: true,
          attributeFilter: ['style'],
        });
      }
    });

    playersObserver.observe(document.getElementById('containerGamePlayers'), {
      childList: true,
    });

    const chatObserver = new MutationObserver(mutations => {
      mutations.forEach(change => {
        change.addedNodes.forEach(msg => {
          const sender = msg.firstChild.innerText;
          const senderParsed = sender.slice(0, -2);
          if (sender.endsWith(': ') && playerBlacklist.includes(senderParsed)) {
            msg.setAttribute('scsMuteSender', senderParsed);
          }

          const wordMatch = sender.match(/The word was '(?<word>.*)'/);
          if (wordMatch) {
            solvedWord = wordMatch.groups.word;
          }
        });
      });
    });

    chatObserver.observe(document.getElementById('boxMessages'), {
      childList: true,
    });
  }

  function toggleHotkeys(e) {
    if (e.key === 'r') {
      scsElements.rainbowTool.click();
    } else if (e.key === 't') {
      switchColors();
    } else if (e.key === 'h') {
      scsElements.hatchingTool.click();
    } else if (e.key === ' ' && scsElements.hatchingTool.classList.contains('scsToolActive')) {
      e.preventDefault();
      e.stopPropagation();
      Object.assign(hatchetAnchor, { x: null, y: null });
      scsElements.scsAnchor.style.display = 'none';
    }
  }

  function init() {
    canvas = document.getElementById('canvasGame');
    currentWord = document.getElementById('currentWord');
    timer = document.getElementById('timer');
    chatInput = document.getElementById('inputChat');

    currentWordSize = document.createElement('div');
    currentWordSize.id = 'scsWordSize';
    currentWord.parentNode.insertBefore(currentWordSize, currentWord.nextSibling);

    const panelElem = document.createElement('div');
    panelElem.classList.add('scsTitleMenu');
    panelElem.innerHTML = keybindPanel;
    const userPanel = document.querySelector('#screenLogin > .login-content > .loginPanelContent');
    userPanel.parentNode.insertBefore(panelElem, userPanel.nextSibling);
    const penTooltip = document.querySelector('[data-tool="pen"] > .toolIcon');
    penTooltip.setAttribute('title', '(B)rush (middle click to pick colors)');
    $(penTooltip).tooltip('fixTitle');

    const containerFreespace = document.getElementById('containerFreespace');
    containerFreespace.innerHTML = customUI;
    containerFreespace.style.background = 'none';

    initColorToggle();
    initChatFocus();
    initPostImage();
    initGamemode();
    initBrushSelect();

    initHatching();
    initRainbow();
    initChatBlacklist();
    initGameObserver();

    document.addEventListener('keydown', e => {
      if (document.activeElement.tagName !== 'INPUT') {
        focusChat(e);
        toggleHotkeys(e);
        selectBrushSize(e);
        selectBrushColor(e);
      } else if (document.activeElement.id === 'inputChat') {
        if (e.key === 'ArrowUp') {
          chatInput.value = previousGuess;
        } else if (e.key === 'Enter') {
          previousGuess = chatInput.value;
        }
      }
    });

    canvas.addEventListener('mousedown', e => {
      if (e.button == 1 && !scsElements.hatchingTool.classList.contains('scsToolActive')) {
        const rect = canvas.getBoundingClientRect();
        const color = Uint32Array.from(
          canvas
            .getContext('2d')
            .getImageData(
              Math.floor(((e.clientX - rect.x) / rect.width) * canvas.width),
              Math.floor(((e.clientY - rect.y) / rect.height) * canvas.height),
              1,
              1
            ).data
        );
        const pickIdx = colors.indexOf((color[0] << 16) | (color[1] << 8) | color[2]);
        if (pickIdx != -1) {
          brushColors[pickIdx].click();
        }
      }
    });
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})(jQuery);
