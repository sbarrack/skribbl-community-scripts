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
// ==/UserScript==

(function($) {
    'use strict';

    const channel = {
        test: 'https://discordapp.com/api/webhooks/750950778239451208/wDgMhEUTlxFjgR-4dMKK0X0Za-bdMcqPaSBnmmNFuM_Oz1MJv_Rjqbxtfj79P-waA4DX'
    }; // the channels to post it to
    const colors = [ 0xffffff, 0x000000, 0xc1c1c1, 0x4c4c4c, 0xef130b, 0x740b07,
        0xff7100, 0xc23800, 0xffe400, 0xe8a200, 0x00cc00, 0x005510, 0x00b2ff,
        0x00569e, 0x231fd3, 0x0e0865, 0xa300ba, 0x550069, 0xd37caa, 0xa75574,
        0xa0522d,0x63300d ];

    let user = 'george'; // the image poster
    let artist = 'picasso'; // the image creator
    let word = 'idk'; // the word, whether complete, blank, and/or with hints
    let type = 'flameo hotman'; // the type of drawing
    let drawing; // the url of the image to be posted

    setTimeout(function () {
        drawing = document.getElementById('canvasGame').toDataURL().split(',')[1];

        let data = new FormData();
        data.append('image', drawing);
        // data.append('type', 'base64');
        data.append('name', Date.now() + '.png');
        data.append('title', word + ' by ' + artist);
        data.append('description', 'Posted by ' + user);

        fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Client-ID b5db76b67498dd6' }),
            body: data
        }).then(res => {
            res.json().then(res2 => {
                console.log(res2);

                fetch(channel.test, {
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
                }).then(res => console.log(res)).catch(err => console.log(err));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }, 10000)

})(jQuery);
