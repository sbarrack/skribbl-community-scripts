// ==UserScript==
// @name         Master Skribbl Script
// @namespace    https://github.com/sbarrack/skribbl-community-scripts/
// @version      0.8
// @description  Collected and reworked Skribbl scripts
// @author       sbarrack
// @license      none
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
            <label>Username:</label>
            <input class="form-control" id="scsDiscord" autocomplete maxlength="32" placeholder="Discord username here..." style="width: 100%;">
        </div>
        <div>
            <label>Gamemode:</label>
            <select class="form-control" id="scsGamemode">
                <option>None</option>
                <option>Blind</option>
            </select>
        </div>
        <h5>Keybinds</h5>
        <p><i>Esc</i> unbinds a key binding.</p>
        <div>
            <label>Focus chat:</label>
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
            <label>Brush size:</label>
            <select class="form-control" id="scsBrushSize">
                <option>None</option>
                <option>1-4</option>
                <option>Numpad 1-4</option>
            </select>
            <label>Brush color:</label>
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
            .scsTitleMenu > div > label:nth-child(n + 1) {
                margin-left: 10px;
            }
            .scsTitleMenu .form-control {
                margin-left: 10px;
                width: auto;
            }
        </style>
    `;
    const customUI = `
        <div id="scsCustomUi">
            <h5 style="text-align: center; color: white;">Don&rsquo;t Spell</h5>
            <div id="scsPostWrapper" style="display: flex;" data-toggle="tooltip" data-placement="top" title="Post the current image to D.S.">
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

            <style>
                #containerBoard .containerToolbar { display: flex !important }
                #scsCustomUi { color: white; }
                #scsCustomUi > div { margin-bottom: 5px; }
                .scsPost { margin: 5px; position: relative; }
                #scsPostWrapper.disabled > * {
                    opacity: 0.7;
                    pointer-events: none;
                }
            </style>
        </div>
    `;

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
    const colors = Object.freeze([ 0xffffff, 0x000000, 0xc1c1c1, 0x4c4c4c, 0xef130b, 0x740b07,
        0xff7100, 0xc23800, 0xffe400, 0xe8a200, 0x00cc00, 0x005510, 0x00b2ff,
        0x00569e, 0x231fd3, 0x0e0865, 0xa300ba, 0x550069, 0xd37caa, 0xa75574,
        0xa0522d, 0x63300d ]);

    var discordTag, artist, word;
    var chatModKey, chatFocusKey;
    var currentGamemode;
    var sizeSelection, brushSizes;
    var colorSelection, brushColors, lastColorIdx = 11;

    if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
        init();
    } else {
        addEventListener("DOMContentLoaded", init);
    }

    function init() {
        let panelElem = document.createElement('div');
        panelElem.classList.add('scsTitleMenu');
        panelElem.innerHTML = keybindPanel;

        let userPanel = document.querySelector('#screenLogin .loginPanelContent');
        userPanel.parentNode.insertBefore(panelElem, userPanel.nextSibling);

        document.getElementsByClassName('login-ad')[0].remove();

        initPostImage();
        initGamemode();
        initChatFocus();
        initBrushSelect();
        initBrushColor();
        initGameObserver();

        document.body.onkeydown = (event) => {
            if (document.activeElement.id !== 'inputChat') {
                focusChat(event);
                selectBrushSize(event);
                selectBrushColor(event);
            }
        };
    };

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

    function selectBrushColor(event) {
        if (!['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) {
            return;
        }
        if ((colorSelection === '0-9' && event.code.match(/Digit[0-9]/)) || (colorSelection === 'Numpad 0-9' && event.code.match(/Numpad[0-9]/))) {
            let targetColor = 11;
            if (event.key === '0') { // monochrome
                switch (lastColorIdx) {
                    case 11:
                        targetColor = 0;
                        break;
                    case 0:
                        targetColor = 1;
                        break;
                    case 1:
                        targetColor = 12;
                        break;
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

    function selectBrushSize(event) {
        if (!['1', '2', '3', '4'].includes(event.key)) {
            return;
        }
        if ((sizeSelection === '1-4' && event.code.match(/Digit[0-9]/)) || (sizeSelection === 'Numpad 1-4' && event.code.match(/Numpad[0-9]/))) {
            brushSizes[+event.key - 1].click();
        }
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

    function initChatFocus() {
        chatModKey = localStorage.getItem('scsChatFocus');
        document.getElementById('scsChatFocus').value = chatModKey ? chatModKey : 'None';
        chatFocusKey = document.getElementById('scsChatFocus2').value = localStorage.getItem('scsChatFocus2');

        document.getElementById('scsChatFocus2').onclick = function (event) {
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
        };
        document.getElementById('scsChatFocus').onchange = function (event) {
            localStorage.setItem('scsChatFocus', event.target.value);
            chatModKey = event.target.value;
        };
    }

    function focusChat(event) {
        let modKeyIsGood = true;
        if (chatModKey === 'Shift') {
            modKeyIsGood = event.shiftKey;
        } else if (chatModKey === 'Alt') {
            modKeyIsGood = event.altKey;
        } else if (chatModKey === 'Ctrl') {
            modKeyIsGood = event.ctrlKey;
        }
        if ((event.key === chatFocusKey && modKeyIsGood) || (!chatFocusKey && event.key === chatModKey)) {
            event.preventDefault();
            document.getElementById('inputChat').focus();
        }
    }

    function createTooltips() {
        let postWrapper = document.getElementById('scsPostWrapper');
        if (postWrapper) {
            if (!discordTag) {
                postWrapper.setAttribute('data-toggle', 'tooltip');
                postWrapper.setAttribute('data-placement', 'top');
                postWrapper.setAttribute('title', 'I need your Discord username!');
                postWrapper.classList.add('disabled');
            } else {
                postWrapper.removeAttribute('data-toggle');
                postWrapper.removeAttribute('data-placement');
                postWrapper.removeAttribute('title');
                postWrapper.classList.remove('disabled');
                $('#scsPostWrapper').tooltip();
            }
        }
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
            postImage(channels.awesome, e.target);
        };
        document.getElementById('scsPostGuess').onclick = function (e) {
            postImage(channels.guess, e.target);
        };
        document.getElementById('scsPostShame').onclick = function (e) {
            postImage(channels.shame, e.target);
        };
    }

    function initGameObserver() {
        let gameObserver = new MutationObserver(mutations => {
            let screenGame = mutations[0].target;

            if (screenGame.style.display !== "none") {
                let visibleDrawer = Array.from(document.querySelectorAll(".drawing")).filter(div => div.offsetParent)[0];
                if (visibleDrawer) {
                    artist = visibleDrawer.closest('.player').querySelector('.name').innerHTML;
                }

                if (currentGamemode === 'Blind') {
                    document.getElementById('canvasGame').style.opacity = 0;
                } else {
                    document.getElementById('canvasGame').style.opacity = 1;
                }
            };
        });
        gameObserver.observe(document.getElementById('screenGame'), {
            attributes: true,
            attributeFilter: ['style']
        });

        let currentDrawerObserver = new MutationObserver(mutations => {
            let drawer = mutations[0].target;

            if (drawer.style.display !== "none") {
                artist = drawer.closest('.player').querySelector('.name').innerHTML;
            };
        });

        let playersObserver = new MutationObserver(mutations => {
            if (mutations.length > 1) {
                document.querySelectorAll(".drawing").forEach(div => {
                    currentDrawerObserver.observe(div, {
                        attributes: true,
                        attributeFilter: ['style']
                    });
                });
            } else if (mutations[0].addedNodes.length > 0) {
                let newPlayer = mutations[0].addedNodes[0];
                currentDrawerObserver.observe(newPlayer.querySelector(".avatar .drawing"), {
                    attributes: true,
                    attributeFilter: ['style']
                });
            }
        });
        playersObserver.observe(document.getElementById("containerGamePlayers"), {
            childList: true
        });
    }

    function postImage(channel, button) {
        if (discordTag) {
            word = document.getElementById('currentWord').innerText;
            word = word.replaceAll('_', '\\*');
            if (channel.name === channels.guess.name) {
                word = word.replaceAll(/[a-z,A-Z]/g, '\\*') + ' ||' + word + '||';
            }

            let data = new FormData();
            data.append('image', document.getElementById('canvasGame').toDataURL().split(',')[1]);
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
                                description: word + ' by ' + artist + '\n' + res2.data.link,
                                url: 'https://github.com/sbarrack/skribbl-community-scripts/',
                                color: colors[Math.floor(Math.random() * colors.length)],
                                timestamp: new Date(),
                                footer: { text: discordTag },
                                image: { url: res2.data.link }
                            }]
                        })
                    }).then(res => console.log(res)).catch(err => handleErr(err));
                }).catch(err => handleErr(err));
            }).catch(err => handleErr(err));
        }
    }

    function handleErr(err) {
        console.log(err);
    }

})(jQuery);
