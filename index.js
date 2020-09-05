// ==UserScript==
// @name         Master Skribbl Script
// @namespace    https://github.com/sbarrack/skribbl-community-scripts/
// @version      0.1
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
    const customUI = `
        <div style="text-align: center; color: white;">Don&rsquo;t Spell Menu</div>
        <div id="scsCustomUi" style="display: flex; margin-bottom: 5px;">
            <button id="postAwesome" class="btn btn-success btn-xs scs-post">
                Awesome Drawings
            </button>
            <button id="postGuess" class="btn btn-warning btn-xs scs-post">
                Guess Special
            </button>
            <button id="postShame" class="btn btn-danger btn-xs scs-post">
                Public Shaming
            </button>
        </div>
        <style>
            .scs-post { margin: 5px; position: relative; }
            .scs-post::after,
            .scs-post::before {
                position: absolute;
                top: 100%;
                left: 50%;
                background: #333;
                color: white;
                display: none;
            }
            .scs-post::after {
                content: 'I need your Discord name to post images!';
                transform: translate(-50%, 5px);
                border-radius: 8px;
                width: 300px;
                padding: 5px;
            }
            .scs-post::before {
                content: '';
                transform: translate(-50%, 3px) rotateZ(45deg);
                width: 10px;
                height: 10px;
            }
            .scs-post.show-tooltip::after,
            .scs-post.show-tooltip::before {
                display: block;
            }
        </style>
    `;
    const channels = Object.freeze({
        test: {
            url: 'https://discordapp.com/api/webhooks/750950778239451208/wDgMhEUTlxFjgR-4dMKK0X0Za-bdMcqPaSBnmmNFuM_Oz1MJv_Rjqbxtfj79P-waA4DX',
            name: 'testaroo'
        },
        awesome: {
            url: 'https://discordapp.com/api/webhooks/751460112589127730/eLakrsg55IMnhoH5Olh8znRfm5e5DdVo2dNbgR_9SqRFHl9VRnKGbM1PbTSAvjGn-knU',
            name: 'Awesome Drawing'
        },
        guess: {
            url: 'https://discordapp.com/api/webhooks/751460311713841272/zvMChva-Le1xzFeRWdTlYY8MFrihDROI8JB5FSgWO_2cT37toD-YzwQ_GVFrakARtmeW',
            name: 'Guess this Special Drawing'
        },
        shame: {
            url: 'https://discordapp.com/api/webhooks/751460495445327973/efFzJ6ZtVsAwNpqf29Lgtm_idqSbRIwzdi6fehhfxTxYZOa0g0BDJiOKAy1Gsy7nlDA_',
            name: 'Public Shaming'
        }
    }); // the channels to post it to
    const colors = Object.freeze([ 0xffffff, 0x000000, 0xc1c1c1, 0x4c4c4c, 0xef130b, 0x740b07,
        0xff7100, 0xc23800, 0xffe400, 0xe8a200, 0x00cc00, 0x005510, 0x00b2ff,
        0x00569e, 0x231fd3, 0x0e0865, 0xa300ba, 0x550069, 0xd37caa, 0xa75574,
        0xa0522d,0x63300d ]);

    var discordTag;
    var artist = 'picasso'; // TODO the image creator
    var word; // TODO the word, whether complete, blank, and/or with hints

    if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
        init();
    } else {
        addEventListener("DOMContentLoaded", init);
    }

    function init() {
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
        for (elem of document.getElementsByClassName('scs-post')) {
            elem.onclick = function (e) {
                let elem2;
                for (elem2 of document.getElementsByClassName('scs-post')) {
                    elem2.classList.remove('show-tooltip');
                }
                postImage(channels.test, e.target);
            };
        }

        // document.getElementById('postAwesome').onclick = function (e) {
        //     for (elem of document.getElementsByClassName('scs-post')) {
        //         elem.classList.remove('show-tooltip');
        //     }
        //     postImage(channels.awesome, e.target);
        // };
        // document.getElementById('postGuess').onclick = function (e) {
        //     for (elem of document.getElementsByClassName('scs-post')) {
        //         elem.classList.remove('show-tooltip');
        //     }
        //     postImage(channels.guess, e.target);
        // };
        // document.getElementById('postShaming').onclick = function (e) {
        //     for (elem of document.getElementsByClassName('scs-post')) {
        //         elem.classList.remove('show-tooltip');
        //     }
        //     postImage(channels.shame, e.target);
        // };
    };

    function postImage(channel, button) {
        if (discordTag) {
            word = document.getElementById('currentWord').innerText; // TODO get it from packet response instead

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
                                description: word.replaceAll('_', ' \\_') + ' by ' + artist + '\n' + res2.data.link,
                                url: 'https://stephenbarrack.com/skribbl-community-scripts/',
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
            button.classList.add('show-tooltip');
            setTimeout(function () {
                button.classList.remove('show-tooltip');
            }, 5000);
        }
    }

    function handleErr(err) {
        console.log(err);
    }

})(jQuery);
