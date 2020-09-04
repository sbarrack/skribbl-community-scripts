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

    const customUI = '\
        <div style="text-align: center; color: white;">Don&rsquo;t Spell Menu</div>\
        <div id="scsCustomUi" style="display: flex; margin-bottom: 5px;">\
            <button id="postAwesome" class="btn btn-success btn-xs scs-post">\
                Awesome Drawings\
            </button>\
            <button id="postGuess" class="btn btn-warning btn-xs scs-post">\
                Guess Special\
            </button>\
            <button id="postShame" class="btn btn-danger btn-xs scs-post">\
                Public Shaming\
            </button>\
        </div>\
        <style>\
            .scs-post { margin: 5px; }\
        </style>\
    ';
    const channels = Object.freeze({
        test: 'https://discordapp.com/api/webhooks/750950778239451208/wDgMhEUTlxFjgR-4dMKK0X0Za-bdMcqPaSBnmmNFuM_Oz1MJv_Rjqbxtfj79P-waA4DX',
        // awesome: 'https://discordapp.com/api/webhooks/751460112589127730/eLakrsg55IMnhoH5Olh8znRfm5e5DdVo2dNbgR_9SqRFHl9VRnKGbM1PbTSAvjGn-knU',
        // guess: 'https://discordapp.com/api/webhooks/751460311713841272/zvMChva-Le1xzFeRWdTlYY8MFrihDROI8JB5FSgWO_2cT37toD-YzwQ_GVFrakARtmeW',
        // shame: 'https://discordapp.com/api/webhooks/751460495445327973/efFzJ6ZtVsAwNpqf29Lgtm_idqSbRIwzdi6fehhfxTxYZOa0g0BDJiOKAy1Gsy7nlDA_'
    }); // the channels to post it to
    const colors = Object.freeze([ 0xffffff, 0x000000, 0xc1c1c1, 0x4c4c4c, 0xef130b, 0x740b07,
        0xff7100, 0xc23800, 0xffe400, 0xe8a200, 0x00cc00, 0x005510, 0x00b2ff,
        0x00569e, 0x231fd3, 0x0e0865, 0xa300ba, 0x550069, 0xd37caa, 0xa75574,
        0xa0522d,0x63300d ]);

    var user = 'george'; // the image poster
    var artist = 'picasso'; // the image creator
    var type = 'flameo hotman'; // the type of drawing
    var drawing; // the url of the image to be posted
    var word; // the word, whether complete, blank, and/or with hints

    if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
        init();
    } else {
        addEventListener("DOMContentLoaded", init);
    }

    function init() {
        document.getElementById('containerFreespace').innerHTML = customUI;
        document.getElementById('containerFreespace').style.background = 'none';

        let elem;
        for (elem of document.getElementsByClassName('scs-post')) {
            elem.onclick = function () {
                postImage(channels.test);
            };
        }

        // document.getElementById('postAwesome').onclick = function () {
        //     postImage(channels.awesome);
        // };
        // document.getElementById('postGuess').onclick = function () {
        //     postImage(channels.guess);
        // };
        // document.getElementById('postShaming').onclick = function () {
        //     postImage(channels.shame);
        // };
    };

    function postImage(channel) {
        drawing = document.getElementById('canvasGame').toDataURL().split(',')[1];
        word = document.getElementById('currentWord').innerText; // TODO get it from packet response instead

        let data = new FormData();
        data.append('image', drawing);
        data.append('name', Date.now() + '.png');
        data.append('title', word + ' by ' + artist);
        data.append('description', 'Posted by ' + user);

        fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Client-ID b5db76b67498dd6' }),
            body: data
        }).then(res => {
            res.json().then(res2 => {
                fetch(channel, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        embeds: [{
                            title: type,
                            description: word + ' by ' + artist + '\n' + res2.data.link,
                            url: 'https://stephenbarrack.com/skribbl-community-scripts/',
                            color: colors[Math.floor(Math.random() * colors.length)],
                            timestamp: new Date(),
                            footer: { text: user },
                            image: { url: res2.data.link }
                        }]
                    })
                }).then(res => console.log(res)).catch(err => handleErr(err));
            }).catch(err => handleErr(err));
        }).catch(err => handleErr(err));
    }

    function handleErr(err) {
        console.log(err);
    }

})(jQuery);
