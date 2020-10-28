// ==UserScript==
// @name         Master Skribbl Script
// @namespace    https://github.com/sbarrack/skribbl-community-scripts/
// @version      1.0
// @description  Collected and reworked Skribbl scripts
// @author       sbarrack
// @match        http*://skribbl.io/*
// @updateURL    https://raw.githubusercontent.com/sbarrack/skribbl-community-scripts/master/index.js
// @downloadURL  https://raw.githubusercontent.com/sbarrack/skribbl-community-scripts/master/index.js
// @supportURL   https://github.com/sbarrack/skribbl-community-scripts/issues
// @grant        none
// ==/UserScript==

(function($) {
    'use strict';

    const keybindPanel = `
        <h4>Don't Spell</h4>
        <div>
            <label for="scsDiscord">Username:</label>
            <input class="form-control" id="scsDiscord" autocomplete maxlength="32" placeholder="Discord username here..." style="width: 100%;">
        </div>
        <div>
            <label for="scsGamemode">Gamemode:</label>
            <select class="form-control" id="scsGamemode">
                <option>None</option>
                <option>Blind</option>
                <option>Deaf</option>
                <option>One shot</option>
            </select>
        </div>
        <div style="display: inline !important;">
            <div style="margin-bottom: 5px; display: flex; align-items: center;">
                <label for="scsPalletChecked">Color pallet:</label>
                <input class="form-check-input" type="checkbox" id="scsPalletChecked" style="margin: 0 0 0 10px;" value="palletEnabled">
            </div>
            <textarea id="scsPallet" class="form-control" placeholder="JSON-formatted CSS color values (e.g. #rrggbb, #rgb, or rgb(rrr, ggg, bbb))..." style="width: 100%; margin: 0; max-height: 20em; min-height: 7em; resize: vertical;"></textarea>
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
        <div id="scsPostWrapper" data-toggle="tooltip" data-placement="top" title="Post the current image to D.S.">
            <button id="scsPostAwesome" class="btn btn-success btn-xs scsPost">
                Awesome Drawings
            </button>
            <button id="scsPostGuess" class="btn btn-warning btn-xs scsPost">
                Guess Special
            </button>
            <button id="scsPostShame" class="btn btn-danger btn-xs scsPost">
                Public Shaming
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
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            #containerBoard .containerToolbar { display: flex !important }
            #scsCustomUi { color: white; }
            #scsCustomUi > div { margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
            .scsPost { position: relative; }
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
        </style>
    </div>`;

    const channels = Object.freeze({
        awesome: {
            url: 'https://discordapp.com/api/webhooks/752344316965421176/9mhUnpdXj-nmjB_L93yOeA3ZwQUD6vanFU1kMQkNJ96VVNCL0arhvz1gCvIm3ycifCOv',
            name: 'Awesome Drawing'
        },
        guess: {
            url: 'https://discordapp.com/api/webhooks/752343877247303761/fiIApqzoCfjVOQmLHBQmtSTDtZZvcibIoriIVZ5BXo5y5tq1fIR7K3OY1hlxyn70QklN',
            name: 'Guess this Special Drawing'
        },
        shame: {
            url: 'https://discordapp.com/api/webhooks/751460495445327973/efFzJ6ZtVsAwNpqf29Lgtm_idqSbRIwzdi6fehhfxTxYZOa0g0BDJiOKAy1Gsy7nlDA_',
            name: 'Public Shaming'
        }
    });
    const colors = [
        0xffffff, 0xc1c1c1, 0xef130b, 0xff7100, 0xffe400, 0x00cc00, 0x00b2ff, 0x231fd3, 0xa300ba, 0xd37caa, 0xa0522d,
        0x000000, 0x4c4c4c, 0x740b07, 0xc23800, 0xe8a200, 0x005510, 0x00569e, 0x0e0865, 0x550069, 0xa75574, 0x63300d
    ];
    const colorsRGB = [
        'rgb(255, 255, 255)', 'rgb(193, 193, 193)', 'rgb(239, 19, 11)', 'rgb(255, 113, 0)',
        'rgb(255, 228, 0)', 'rgb(0, 204, 0)', 'rgb(0, 178, 255)', 'rgb(35, 31, 211)',
        'rgb(163, 0, 186)', 'rgb(211, 124, 170)', 'rgb(160, 82, 45)', 'rgb(0, 0, 0)',
        'rgb(76, 76, 76)', 'rgb(116, 11, 7)', 'rgb(194, 56, 0)', 'rgb(232, 162, 0)',
        'rgb(0, 85, 16)', 'rgb(0, 86, 158)', 'rgb(14, 8, 101)', 'rgb(85, 0, 105)',
        'rgb(167, 85, 116)', 'rgb(99, 48, 13)'
    ];
    
    const hatchetAnchor = { x: null, y: null };

    let lastColorIdx = 11;
    let playerBlacklist = [];

    let canvas, currentWord, solutionText, timer, chatModKey, chatFocusKey, chatInput;
    let discordTag, artist, word;
    let currentGamemode;
    let sizeSelection, brushSizes;
    let colorSelection, brushColors;
    let rainbowMode, rainbowTool, rainbowSpeed, primaryActiveColor, secondaryActiveColor;
    let hatchingTool, isHatcheting;
    let scsAnchor;
    let pallet, palletCheckedInput;

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    function init() {
        canvas = document.getElementById('canvasGame');
        solutionText = document.querySelector('#overlay .text');
        currentWord = document.getElementById('currentWord');
        timer = document.getElementById('timer');
        chatInput = document.getElementById('inputChat');

        let panelElem = document.createElement('div');
        panelElem.classList.add('scsTitleMenu');
        panelElem.innerHTML = keybindPanel;
        let userPanel = document.querySelector('#screenLogin > .login-content > .loginPanelContent');
        userPanel.parentNode.insertBefore(panelElem, userPanel.nextSibling);
        $('[data-tool="pen"] > .toolIcon').attr('title', '(B)rush (middle click to pick colors)').tooltip('fixTitle');

        initChatFocus();
        initPostImage(); // TODO clean up starting here
        initGamemode();
        initBrushSelect();
        initBrushColor();
        initRainbow();
        initHatching();
        initPallet();
        initChatBlacklist();
        initGameObserver();

        document.addEventListener('keydown', (e) => {
            if (document.activeElement.id !== 'inputChat') {
                focusChat(e);
                toggleHotkeys(e);
                selectBrushSize(e);
                selectBrushColor(e);
            }
        });
        canvas.addEventListener('mousedown', e => {
            if (e.button == 1 && !hatchingTool.classList.contains('scsToolActive')) {
                let rect = canvas.getBoundingClientRect();
                let color = Uint32Array.from(canvas.getContext('2d').getImageData(
                    Math.floor((e.clientX - rect.x) / rect.width * canvas.width),
                    Math.floor((e.clientY - rect.y) / rect.height * canvas.height),
                    1, 1).data);
                let pickIdx = colors.indexOf(color[0] << 16 | color[1] << 8 | color[2]);
                if (pickIdx != -1) {
                    brushColors[pickIdx].click();
                }
            }
        });
    };

    function initChatFocus() {
        let focusKeybind = document.getElementById('scsChatFocus');
        let focusKeybind2 = document.getElementById('scsChatFocus2');

        chatModKey = localStorage.getItem('scsChatFocus');
        focusKeybind.value = chatModKey ? chatModKey : 'None';
        chatFocusKey = focusKeybind2.value = localStorage.getItem('scsChatFocus2');

        focusKeybind.addEventListener('change', function (event) {
            localStorage.setItem('scsChatFocus', event.target.value);
            chatModKey = event.target.value;
        });
        focusKeybind2.addEventListener('click', function (event) {
            document.addEventListener('keydown', bindKey);
            setTimeout(function () {
                document.removeEventListener('keydown', bindKey);
            }, 10000);
            
            function bindKey(e) {
                if (e.key !== 'Escape') {
                    localStorage.setItem('scsChatFocus2', e.key);
                    event.target.value = e.key;
                    chatFocusKey = e.key;
                } else {
                    localStorage.setItem('scsChatFocus2', '');
                    event.target.value = '';
                    chatFocusKey = '';
                }
                document.removeEventListener('keydown', bindKey);
            }
        });
    }

    function focusChat(event) {
        let modKey = true;
        if (chatModKey === 'Shift') {
            modKey = event.shiftKey;
        } else if (chatModKey === 'Alt') {
            modKey = event.altKey;
        } else if (chatModKey === 'Ctrl') {
            modKey = event.ctrlKey;
        }
        if ((event.key === chatFocusKey && modKey) || (!chatFocusKey && event.key === chatModKey)) {
            event.preventDefault();
            chatInput.focus();
        }
    }

    function toggleHotkeys(e) {
        if (e.key === 'r') {
            rainbowTool.click();
        } else if (e.key === 't') {
            switchColors();
        } else if (e.key === 'h') {
            hatchingTool.click();
        } else if (e.key === ' ' && hatchingTool.classList.contains('scsToolActive')) {
            e.preventDefault();
            e.stopPropagation();
            Object.assign(hatchetAnchor, { x: null, y: null });
            scsAnchor.style.display = 'none';
        }
    }

    function selectBrushSize(event) {
        if (!['1', '2', '3', '4'].includes(event.key)) {
            return;
        }
        if ((sizeSelection === '1-4' && event.code.match(/Digit[0-9]/)) || (sizeSelection === 'Numpad 1-4' && event.code.match(/Numpad[0-9]/))) {
            brushSizes[+event.key - 1].click();
        }
    }

    function selectBrushColor(event) {
        if (!['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) {
            return;
        }
        if ((colorSelection === '0-9' && event.code.match(/Digit[0-9]/)) || (colorSelection === 'Numpad 0-9' && event.code.match(/Numpad[0-9]/))) {
            let targetColor = 11;
            if (event.key === '0') {
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
            } else if (lastColorIdx == +event.key + 1) {
                targetColor = +event.key + 12;
            } else {
                targetColor = +event.key + 1;
            }
            brushColors[targetColor].click();
            lastColorIdx = targetColor;
        }
    }

    function initChatBlacklist() {
        document.addEventListener('click', e => {
            if (e.target.classList.contains('name') && e.target.parentElement.parentElement.classList.contains('player')) {
                e.stopImmediatePropagation();
                let name = e.target.innerText;
                let nameIdx = playerBlacklist.indexOf(name);
                if (nameIdx == -1) {
                    playerBlacklist.push(name);
                    e.target.parentElement.parentElement.classList.add('scsMute');
                } else {
                    playerBlacklist.splice(nameIdx, 1);
                    e.target.parentElement.parentElement.classList.remove('scsMute');
                }
            }
        });
    }

    function initPallet() {
        pallet = localStorage.getItem('scsPallet');
        let palletInput = document.getElementById('scsPallet');
        if (pallet) {
            palletInput.value = pallet;
        }

        palletCheckedInput = document.getElementById('scsPalletChecked');
        palletCheckedInput.checked = localStorage.getItem('scsPalletChecked') === 'true';

        palletInput.onchange = function (event) {
            let parsedPallet = JSON.stringify(JSON.parse(event.target.value));
            localStorage.setItem('scsPallet', parsedPallet);
            pallet = parsedPallet;
        };
        palletCheckedInput.onchange = function (event) {
            localStorage.setItem('scsPalletChecked', event.target.checked);
        };
    }

    function initHatching() {
        let eraserTool = document.querySelector('[data-tool="erase"]');
        hatchingTool = eraserTool.cloneNode(true);
        hatchingTool.setAttribute('data-tool', 'scsHatching');
        hatchingTool.firstChild.setAttribute('title', '(H)atching (middle click to anchor, space to unanchor)');
        hatchingTool.firstChild.setAttribute('src', 'https://raw.githubusercontent.com/sbarrack/skribbl-community-scripts/master/images/hatchet.gif');
        hatchingTool = eraserTool.parentNode.insertBefore(hatchingTool, eraserTool);
        $(hatchingTool.firstChild).tooltip();
        
        scsAnchor = document.createElement('img');
        scsAnchor.id = 'scsAnchor';
        scsAnchor.style.display = 'none';
        scsAnchor.style.position = 'absolute';
        scsAnchor.style.pointerEvents = 'none';
        scsAnchor.src = 'https://raw.githubusercontent.com/sbarrack/skribbl-community-scripts/master/images/anchor.png';
        document.body.appendChild(scsAnchor);

        let hatchInterval = 0;
        hatchingTool.onclick = function(event) {
            hatchingTool.classList.toggle('scsToolActive');
            if (hatchingTool.classList.contains('scsToolActive')) {
                if (hatchetAnchor.x && hatchetAnchor.y) {
                    scsAnchor.style.display = 'block';
                }
                hatchInterval = setInterval(hatchCycle, rainbowSpeed.value);
            } else {
                scsAnchor.style.display = 'none';
                if (hatchInterval) {
                    clearInterval(hatchInterval);
                    hatchInterval = 0;
                }
            }
        };

        document.addEventListener('mousedown', event => {
            if (hatchingTool.classList.contains('scsToolActive')) {
                if (event.button == 0) {
                    isHatcheting = true;
                } else if (event.button == 1) {
                    scsAnchor.style.display = 'block';
                    Object.assign(hatchetAnchor, { x: event.clientX, y: event.clientY });
                    scsAnchor.style.top = (event.clientY - 4) + 'px';
                    scsAnchor.style.left = (event.clientX - 13).toString(10) + 'px';
                }
            }
        });
        document.addEventListener('mouseup', event => {
            if (hatchingTool.classList.contains('scsToolActive')) {
                if (event.button == 0) {
                    isHatcheting = false;
                }
            }
        });
    }

    function hatchCycle() {
        if (isHatcheting && hatchetAnchor.x && hatchetAnchor.y) {
            document.dispatchEvent(new MouseEvent('mousemove', {
                bubbles: true,
                cancelable: true,
                clientX: hatchetAnchor.x,
                clientY: hatchetAnchor.y
            }));
        }
    }

    function initRainbow() {
        primaryActiveColor = document.getElementsByClassName('colorPreview')[0];
        secondaryActiveColor = primaryActiveColor.cloneNode();
        secondaryActiveColor.classList.add('scsColorPreview');
        secondaryActiveColor.classList.remove('colorPreview');
        secondaryActiveColor.style.backgroundColor = colorsRGB[0];
        secondaryActiveColor = primaryActiveColor.appendChild(secondaryActiveColor);
        $(primaryActiveColor).attr('title', 'Color (T)oggle').tooltip('fixTitle');

        primaryActiveColor.onclick = function (event) {
            switchColors();
        };

        let eraserTool = document.querySelector('[data-tool="erase"]');
        rainbowTool = eraserTool.cloneNode(true);
        rainbowTool.setAttribute('data-tool', 'scsRainbow');
        rainbowTool.firstChild.setAttribute('title', 'Magic b(R)ush');
        rainbowTool.firstChild.setAttribute('src', 'https://raw.githubusercontent.com/sbarrack/skribbl-community-scripts/master/images/brush.gif');
        rainbowTool = eraserTool.parentNode.insertBefore(rainbowTool, eraserTool);
        $(rainbowTool.firstChild).tooltip();

        rainbowSpeed = document.getElementById('scsRainbowSpeed');
        let rainbowInterval = 0;
        rainbowTool.onclick = function(event) {
            rainbowTool.classList.toggle('scsToolActive');
            if (rainbowTool.classList.contains('scsToolActive')) {
                rainbowInterval = setInterval(rainbowCycle, rainbowSpeed.value);
            } else {
                if (rainbowInterval) {
                    clearInterval(rainbowInterval);
                    rainbowInterval = 0;
                }
            }
        };

        rainbowMode = localStorage.getItem('scsRainbowMode');
        let rainbowSelect = document.getElementById('scsRainbowMode');
        rainbowSelect.value = rainbowMode ? rainbowMode : '1-cycle';

        rainbowSelect.onchange = function (event) {
            localStorage.setItem('scsRainbowMode', event.target.value);
            rainbowMode = event.target.value;
        };

        rainbowSpeed.onchange = function(event) {
            if (rainbowInterval) {
                clearInterval(rainbowInterval);
                rainbowInterval = setInterval(rainbowCycle, event.target.value);
            }
        };
    }

    let rainbowIdx = 0;
    const grayCycle = [ 0, 1, 12, 11 ];
    function rainbowCycle() {
        if (rainbowMode === '1-color') {
            let altColorIdx = colorsRGB.indexOf(primaryActiveColor.style.backgroundColor);
            brushColors[altColorIdx >= 11 ? altColorIdx - 11 : altColorIdx + 11].click();
        } else if (rainbowMode === '2-cycle') {
            switchColors();
        } else if (rainbowMode === 'Light') {
            brushColors[rainbowIdx % 7 + 2].click();
        } else if (rainbowMode === 'Dark') {
            brushColors[rainbowIdx % 7 + 13].click();
        } else if (rainbowMode === 'Gray') {
            brushColors[grayCycle[rainbowIdx % 4]].click();
        } else if (rainbowMode === 'All') {
            brushColors[rainbowIdx % 22].click();
        }
        rainbowIdx += 1;
    }

    function switchColors() {
        let secondaryColorIdx = colorsRGB.indexOf(secondaryActiveColor.style.backgroundColor);
        secondaryActiveColor.style.backgroundColor = primaryActiveColor.style.backgroundColor;
        brushColors[secondaryColorIdx].click();
    }

    function initBrushColor() {
        colorSelection = localStorage.getItem('scsBrushColor');
        let colorInput = document.getElementById('scsBrushColor');
        colorInput.value = colorSelection ? colorSelection : 'None';

        colorInput.onchange = function (event) {
            localStorage.setItem('scsBrushColor', event.target.value);
            colorSelection = event.target.value;
        };

        brushColors = document.querySelectorAll('[data-color]');
    }

    function initBrushSelect() {
        sizeSelection = localStorage.getItem('scsBrushSize');
        let sizeInput = document.getElementById('scsBrushSize');
        sizeInput.value = sizeSelection ? sizeSelection : 'None';

        sizeInput.onchange = function (event) {
            localStorage.setItem('scsBrushSize', event.target.value);
            sizeSelection = event.target.value;
        };

        brushSizes = document.querySelectorAll('[data-size]');
    }

    function initGamemode() {
        currentGamemode = sessionStorage.getItem('scsGamemode');
        let gamemodeInput = document.getElementById('scsGamemode');
        gamemodeInput.value = currentGamemode ? currentGamemode : 'None';

        gamemodeInput.onchange = function (event) {
            sessionStorage.setItem('scsGamemode', event.target.value);
            currentGamemode = event.target.value;
        };
    }

    function initPostImage() {
        let postWrapper;

        discordTag = localStorage.getItem('scsDiscord');
        if (discordTag) {
            document.getElementById('scsDiscord').value = discordTag;
        }
        document.getElementById('scsDiscord').onchange = function (event) {
            localStorage.setItem('scsDiscord', event.target.value);
            discordTag = event.target.value;
            if (postWrapper) {
                if (discordTag) {
                    $('#scsPostWrapper').attr('title', 'Post the current image to D.S.').tooltip('fixTitle');
                    postWrapper.classList.remove('disabled');
                } else {
                    $('#scsPostWrapper').attr('title', 'I need your Discord username!').tooltip('fixTitle');
                    postWrapper.classList.add('disabled');
                }
            }
        };

        document.getElementById('containerFreespace').innerHTML = customUI;
        document.getElementById('containerFreespace').style.background = 'none';

        postWrapper = document.getElementById('scsPostWrapper');
        if (postWrapper && !discordTag) {
            postWrapper.setAttribute('title', 'I need your Discord username!');
            postWrapper.classList.add('disabled');
        }
        $('#scsPostWrapper').tooltip();

        document.getElementById('scsPostAwesome').onclick = function (e) {
            postImage(channels.awesome);
        };
        document.getElementById('scsPostGuess').onclick = function (e) {
            postImage(channels.guess);
        };
        document.getElementById('scsPostShame').onclick = function (e) {
            postImage(channels.shame);
        };
    }

    function initGameObserver() {
        let gameObserver = new MutationObserver(mutations => {
            let screenGame = mutations[0].target;

            if (screenGame.style.display !== 'none') {
                let visibleDrawer = Array.from(document.querySelectorAll('.drawing')).filter(div => div.offsetParent)[0];
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
                }
                if (currentGamemode === 'One shot') {
                    chatInput.addEventListener('keyup', oneshot);

                    let drawingObserver = new MutationObserver(mutations => {
                        let overlay = mutations[0].target;
                        if (overlay.style.display !== 'none') {
                            chatInput.disabled = false;
                            chatInput.removeEventListener('keyup', oneshot);
                        } else {
                            chatInput.addEventListener('keyup', oneshot);
                        }
                    });
                    drawingObserver.observe(document.getElementById('overlay'), {
                        attributes: true,
                        attributeFilter: ['style']
                    });

                    function oneshot(e) {
                        if (e.key === 'Enter') {
                            chatInput.disabled = true;
                            chatInput.removeEventListener('keyup', oneshot);
                        }
                    }
                }

                if (pallet && palletCheckedInput.checked) {
                    pallet = JSON.parse(pallet);
                    if (pallet) {
                        if (pallet.colors) {
                            pallet.colors.forEach((v, i, a) => {
                                if (Number.isSafeInteger(v.index)) {
                                    if ((v.index > 0 && v.index < 11) || (v.index > 11 && v.index < 22)) {
                                        if (/^#([0-9a-f]{3}){1,2}$/i.test(v.color)) {
                                            let t = v.color.length == 7;
                                            brushColors[v.index].style.backgroundColor = v.color;
                                            colors[v.index] = parseInt(v.color.slice(1), 16);
                                            colorsRGB[v.index] = 'rgb(' + 
                                            parseInt(v.color.slice(1, t ? 3 : 2), 16).toString(10) +
                                            parseInt(v.color.slice(t ? 3 : 2, t ? 5 : 3), 16).toString(10) +
                                            parseInt(v.color.slice(t ? 5 : 3, t ? 7 : 4), 16).toString(10) +
                                            ')';
                                        } else if (/rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/.test(v.color)) {
                                            colorsRGB[v.index] = v.color;
                                            let components = v.color.slice(4, v.color.length - 1).split(', ');
                                            components.forEach((w, j, b) => {
                                                b[j] = parseInt(w, 10).toString(16);
                                            });
                                            components = components.join('');
                                            brushColors[v.index].style.backgroundColor = '#' + components;
                                            colors[v.index] = parseInt(components, 16);
                                        } else {
                                            console.error(`Invalid color ${v.color} at index ${v.index}!`);
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            };
        });
        gameObserver.observe(document.getElementById('screenGame'), {
            attributes: true,
            attributeFilter: ['style']
        });

        let currentDrawerObserver = new MutationObserver(mutations => {
            let drawer = mutations[0].target;

            if (drawer.style.display !== 'none') {
                setTimeout(() => {
                    artist = drawer.closest('.player').querySelector('.name').innerHTML;
                }, 3000);
            };
        });
        let playersObserver = new MutationObserver(mutations => {
            if (mutations.length > 1) {
                document.querySelectorAll('.drawing').forEach(div => {
                    currentDrawerObserver.observe(div, {
                        attributes: true,
                        attributeFilter: ['style']
                    });
                });
            } else if (mutations[0].addedNodes.length > 0) {
                let newPlayer = mutations[0].addedNodes[0];
                currentDrawerObserver.observe(newPlayer.querySelector('.avatar .drawing'), {
                    attributes: true,
                    attributeFilter: ['style']
                });
            }
        });
        playersObserver.observe(document.getElementById('containerGamePlayers'), {
            childList: true
        });

        let chatObserver = new MutationObserver(mutations => {
            mutations.forEach(change => {
                change.addedNodes.forEach(msg => {
                    let sender = msg.firstChild.innerText;
                    if (sender.endsWith(': ') && playerBlacklist.includes(sender.slice(0, -2))) {
                        msg.remove();
                    }
                });
            });
        });
        chatObserver.observe(document.getElementById('boxMessages'), {
            childList: true
        });
    }

    let debouncePostTimeout;
    function clearDebounce() {
        clearTimeout(debouncePostTimeout);
        debouncePostTimeout = 0;
    }
    function postImage(channel) {
        let canvasImage = canvas.toDataURL().split(',')[1];
        let wordParsed = solutionText.innerText;
        word = currentWord.innerText;
        let timeLeft = timer.innerText;
        if (debouncePostTimeout) {
            clearTimeout(debouncePostTimeout);
            debouncePostTimeout = setTimeout(clearDebounce, 3000);
        } else {
            if (discordTag) {
                debouncePostTimeout = setTimeout(clearDebounce, 3000);
                if (channel.name === channels.guess.name) {
                    let words = word.split(/(\s+)/).filter(e => e.trim().length > 0);
                    words.forEach((v, i, a) => { a[i] = v.length.toString(10); });
                    words = words.join(' ');
                    wordParsed = word.replace(/[a-z_]/gi, '\\*') + ` ${words} ||${word.replace(/_/g, '\\*')}||`;
                } else {
                    if (wordParsed.startsWith('The word was: ')) {
                        word = wordParsed.slice(14);
                    }
                    wordParsed = word.replace(/_/g, '\\*');
                }
    
                let data = new FormData();
                data.append('image', canvasImage);
                data.append('name', Date.now() + '.png');
                data.append('title', word + ' by ' + artist);
                data.append('description', 'Posted by ' + discordTag);
    
                fetch('https://api.imgur.com/3/image', {
                    method: 'POST',
                    headers: new Headers({ 'Authorization': 'Client-ID b5db76b67498dd6' }),
                    body: data
                }).then(res => {
                    res.json().then(res2 => {
                        fetch(channel.url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                embeds: [{
                                    title: channel.name,
                                    description: wordParsed + ' by ' + artist + '\n' + res2.data.link + ' with ' + timeLeft + ' sec(s) remaining',
                                    url: 'https://github.com/sbarrack/skribbl-community-scripts/',
                                    color: colors[Math.floor(Math.random() * colors.length)],
                                    timestamp: new Date(),
                                    footer: { text: discordTag },
                                    image: { url: res2.data.link }
                                }]
                            })
                        }).then(res => console.debug(res)).catch(err => handleErr(err));
                    }).catch(err => handleErr(err));
                }).catch(err => handleErr(err));
            }
        }
    }

    function handleErr(err) {
        console.debug(err);
    }

})(jQuery);
