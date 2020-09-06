// ==UserScript==
// @name         Master Skribbl Script
// @namespace    https://github.com/sbarrack/skribbl-community-scripts/
// @version      0.4
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

    const inputName = '<input class="form-control" id="scsDiscord" autocomplete maxlength="32" placeholder="Discord username here...">';
    const keybindPanel = `
        <h4>Don't Spell Keybinds</h4>
        <div style="display: flex;">
            <label>Focus chat:</label>
            <select class="form-control" id="scsChatFocus">
                <option>None</option>
                <option>Shift</option>
                <option>Alt</option>
                <option>Ctrl</option>
            </select>
            <h5>+</h5>
            <input class="form-control" id="scsChatFocus2" placeholder="Click to bind..." readonly>
        </div>

        <style>
            .scsKeybinds {
                background-color: #fff;
                border-radius: 2px;
                padding: 8px;
                margin-top: 20px;
            }
            .scsKeybinds h4 { text-align: center; }
            .scsKeybinds h5 { margin-left: 10px; font-weight: bold; }
            .scsKeybinds label {
                vertical-align: middle;
                align-self: center;
                margin-bottom: 0;
            }
            .scsKeybinds .form-control {
                margin-left: 10px;
                width: auto;
            }
        </style>
    `;
    const customUI = `
        <div style="text-align: center; color: white;">Don&rsquo;t Spell Menu</div>
        <div id="scsCustomUi">
            <button id="scsPostAwesome" class="btn btn-success btn-xs scsPost">
                Awesome Drawings
            </button>
            <button id="scsPostGuess" class="btn btn-warning btn-xs scsPost">
                Guess Special
            </button>
            <button id="scsPostShame" class="btn btn-danger btn-xs scsPost">
                Public Shaming
            </button>

            <style>
                #scsCustomUi { display: flex; margin-bottom: 5px; }
                .scsPost { margin: 5px; position: relative; }
                .scsPost::after,
                .scsPost::before {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    background: #333;
                    color: white;
                    display: none;
                }
                .scsPost::after {
                    content: 'I need your Discord name to post images!';
                    transform: translate(-50%, 5px);
                    border-radius: 8px;
                    width: 300px;
                    padding: 5px;
                }
                .scsPost::before {
                    content: '';
                    transform: translate(-50%, 3px) rotateZ(45deg);
                    width: 10px;
                    height: 10px;
                }
                .scsPost.showTooltip::after,
                .scsPost.showTooltip::before {
                    display: block;
                }
            </style>
        </div>
    `;

    const channels = Object.freeze({
        awesome: {
            url: 'https://discordapp.com/api/webhooks/751907596486836224/rnXVyqNhBNdB9uXToub2re8-vmaHdTOU_PsvarZ57dCzi4Uzz4dXwfiucIMccmm82z2V',
            name: 'Awesome Drawing'
        },
        guess: {
            url: 'https://discordapp.com/api/webhooks/751907596486836224/rnXVyqNhBNdB9uXToub2re8-vmaHdTOU_PsvarZ57dCzi4Uzz4dXwfiucIMccmm82z2V',
            name: 'Guess this Special Drawing'
        },
        shame: {
            url: 'https://discordapp.com/api/webhooks/751907596486836224/rnXVyqNhBNdB9uXToub2re8-vmaHdTOU_PsvarZ57dCzi4Uzz4dXwfiucIMccmm82z2V',
            name: 'Public Shaming'
        }
    });
    const colors = Object.freeze([ 0xffffff, 0x000000, 0xc1c1c1, 0x4c4c4c, 0xef130b, 0x740b07,
        0xff7100, 0xc23800, 0xffe400, 0xe8a200, 0x00cc00, 0x005510, 0x00b2ff,
        0x00569e, 0x231fd3, 0x0e0865, 0xa300ba, 0x550069, 0xd37caa, 0xa75574,
        0xa0522d,0x63300d ]);

    var discordTag;
    var artist;
    var word;

    if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
        init();
    } else {
        addEventListener("DOMContentLoaded", init);
    }

    function init() {
        let panelElem = document.createElement('div');
        panelElem.classList.add('scsKeybinds');
        panelElem.innerHTML = keybindPanel;
        document.querySelector('#screenLogin .loginPanelContent').parentNode.append(panelElem);

        imagePoster();
        initChatFocus();
        observeDrawer();

        document.body.onkeydown = (event) => {
            focusChat(event);
        };
    };

    function initChatFocus() {
        let chatModKey = document.getElementById('scsChatFocus').value = localStorage.getItem('scsChatFocus');
        let chatFocusKey = document.getElementById('scsChatFocus2').value = localStorage.getItem('scsChatFocus2');
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
        switch (chatModKey) {
            case 'Shift':
                modKeyIsGood = event.shiftKey;
                break;
            case 'Alt':
                modKeyIsGood = event.altKey;
                break;
            case 'Ctrl':
                modKeyIsGood = event.ctrlKey;
                break;
            default:
                break;
        }
        if (event.key === chatFocusKey && modKeyIsGood) {
            event.preventDefault();
            $('#inputChat').focus();
        } else if (!chatFocusKey && event.key === chatModKey) {
            event.preventDefault();
            $('#inputChat').focus();
        }
    }

    function imagePoster() {
        document.querySelector('#screenLogin .loginPanelTitle').innerHTML += inputName;
        discordTag = localStorage.getItem('scsDiscord');
        if (discordTag) {
            document.getElementById('scsDiscord').value = discordTag;
        }
        document.getElementById('scsDiscord').onchange = function (event) {
            localStorage.setItem('scsDiscord', event.target.value);
            discordTag = event.target.value;
        };
        
        document.getElementById('containerFreespace').innerHTML = customUI;
        document.getElementById('containerFreespace').style.background = 'none';

        let elem;
        document.getElementById('scsPostAwesome').onclick = function (e) {
            for (elem of document.getElementsByClassName('scsPost')) {
                elem.classList.remove('showTooltip');
            }
            postImage(channels.awesome, e.target);
        };
        document.getElementById('scsPostGuess').onclick = function (e) {
            for (elem of document.getElementsByClassName('scsPost')) {
                elem.classList.remove('showTooltip');
            }
            postImage(channels.guess, e.target);
        };
        document.getElementById('scsPostShame').onclick = function (e) {
            for (elem of document.getElementsByClassName('scsPost')) {
                elem.classList.remove('showTooltip');
            }
            postImage(channels.shame, e.target);
        };
    }

    function observeDrawer() {
        let gameObserver = new MutationObserver(mutations => {
            let screenGame = mutations[0].target;
    
            if (screenGame.style.display !== "none") {
                let visibleDrawer = Array.from(document.querySelectorAll(".drawing")).filter(div => div.offsetParent)[0];
                if (visibleDrawer) {
                    artist = visibleDrawer.closest('.player').querySelector('.name').innerHTML;
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
        } else {
            button.classList.add('showTooltip');
            setTimeout(function () {
                button.classList.remove('showTooltip');
            }, 5000);
        }
    }

    function handleErr(err) {
        console.log(err);
    }

})(jQuery);
