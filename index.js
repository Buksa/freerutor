/**
 *  freerutor plugin for Movian
 *
 *  Copyright (C) 2017 Buksa
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
//ver 0.1.1

// parsit plugin.json
var plugin = JSON.parse(Plugin.manifest);
// PREFIX unikalnyj id plagina
var PREFIX = plugin.id;
//logo beret iz kornevoj papki s plago
var LOGO = Plugin.path + 'logo.png';
//user agent mestami nuzhno spofit'
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36';

var result = '',
  referer = BASE_URL,
  data = {};

//sistemnye biblioteki tak skazat'
var page = require('movian/page');
var service = require('movian/service');
var settings = require('movian/settings');
var io = require('native/io');
var prop = require('movian/prop');
var popup = require('native/popup');

var http = require('movian/http');
var html = require('movian/html');
// fail browse browse.js
var browse = require('./src/browse');
// log
var log = require('./src/log');
// api
var api = require('./src/api');
var loggedIn = false;

// Create the service (ie, icon on home screen)
service.create(plugin.title, PREFIX + ':start', 'video', true, LOGO);
// Create the settings
//stranica nastroik plagina
settings.globalSettings(plugin.id, plugin.title, LOGO, plugin.synopsis);
settings.createInfo('info', LOGO, 'Plugin developed by ' + plugin.author + '. \n');
settings.createDivider('Settings:');
settings.createString('domain', 'Домен', 'https://labtor.tv', function (v) {
  service.domain = v;
});
settings.createBool('debug', 'Debug', false, function (v) {
  service.debug = v;
});
settings.createBool('bg', 'Background', true, function (v) {
  service.bg = v;
});

// adress sajta
var BASE_URL = service.domain;
// http inspector pri zaprose na domen freerutor.org movian budet spufit' useragent v referala
io.httpInspectorCreate(service.domain + '.*', function (ctrl) {
  ctrl.setHeader('User-Agent', UA);
  ctrl.setHeader('Referer', service.domain);
});

// put' dlay obrabotki browse
new page.Route(PREFIX + ':browse:(.*):(.*)', function (page, href, title) {
  //vyzov function list iz file browse.js s parametrami href title
  browse.list(page, {
    href: href,
    title: title
  });
});
//put' dlya obrabotki moviepage
new page.Route(PREFIX + ':moviepage:(.*)', function (page, data) {
  //vyzov function moviepage iz file browse.js s parametrami data
  browse.moviepage(page, data);
});

//put' dlya obrabotki search so stranicy plaga
// new page.Route(PREFIX + ':search:(.*)', function(page, query) {
//page.metadata.icon = LOGO;
//page.metadata.title = 'Search results for: ' + query;
////  page.type = 'directory';
////index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=lost
//browse.list(page, {
//  href: '/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=' + query,
//  title: query,
//  search: 1
//});
// });
// // seacher dlya globalnogo poiska
// page.Searcher(PREFIX, LOGO, function(page, query) {
//page.metadata.icon = LOGO;
////page.metadata.title = 'Search results for: ' + query;
//browse.list(page, {
//  href: '/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=' + query,
//  title: query,
//  search: 1
//});
// });

// Landing page
//startovay stranica plagina
new page.Route(PREFIX + ':start', function (page) {
  page.type = 'directory';
  page.metadata.title = PREFIX;
  page.metadata.icon = LOGO;

  resp = http.request(service.domain, {
    caching: true, // Enables Movian's built-in HTTP cache
    cacheTime: 6000,
    headers: {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
      "User-Agent": UA,
      "Accept-Encoding": "gzip, deflate, br"
    }
  }).toString();
  // needlogin = /\?do=register/.test(resp);
  //console.log(resp);
  // login(needlogin);



  // // dobodlyaen poisk na start page bydet vyzavat' uri PREFIX + ":search:"+zapros
  // page.appendItem(PREFIX + ':search:', 'search', {
  //   title: 'Search freerutor'
  // });

  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=films-tor:Фильмы SD", "directory", {
    title: "Фильмы SD"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=filmy-dvd-5:Фильмы DVD", "directory", {
    title: "Фильмы DVD"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=filmshd:Фильмы HD", "directory", {
    title: "Фильмы HD"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=filmy720:Фильмы 720,1080,Blu-Ray", "directory", {
    title: "Фильмы 720,1080,Blu-Ray"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=filmy-avc:Фильмы AVC", "directory", {
    title: "Фильмы AVC"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=3d-filmy-torrent:3D фильмы", "directory", {
    title: "3D фильмы"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=4k_ultra:4K фильмы", "directory", {
    title: "4K фильмы"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=serials:Русские сериалы", "directory", {
    title: "Русские сериалы"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=zarubezhnye-serialy-tor:Зарубежные сериалы", "directory", {
    title: "Зарубежные сериалы"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=serialy720:Зарубежные сериалы HD", "directory", {
    title: "Зарубежные сериалы HD"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=mult:Мультфильмы", "directory", {
    title: "Мультфильмы"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=multserialy:Мультсериалы", "directory", {
    title: "Мультсериалы"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=3d-multfilmy:3D мультфильмы", "directory", {
    title: "3D мультфильмы"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=tv:ТВ передачи", "directory", {
    title: "ТВ передачи"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=dokumentalnyy:Документальный", "directory", {
    title: "Документальный"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=umor:Юмор", "directory", {
    title: "Юмор"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=sport:Спорт", "directory", {
    title: "Спорт"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=oboi:Обои/Картинки", "directory", {
    title: "Обои/Картинки"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=mp3:Музыка", "directory", {
    title: "Музыка"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=video-klipy:Видео клипы", "directory", {
    title: "Видео клипы"
  });
  page.appendItem(PREFIX + ":browse:/index.php?do=cat&category=audio-kniki-torrent:Аудио книги", "directory", {
    title: "Аудио книги"
  });
});

// function login(query) {
//   if (loggedIn)
//     return false;

//   var reason = "Login required"
//   var do_query = false;

//   while (true) {
//     var credentials = popup.getAuthCredentials("Login labtor", reason, do_query);

//     if (!credentials) {
//       if (query && !do_query) {
//         do_query = true;
//         continue;
//       }
//       reason = "No credentials"
//       return false;
//     }

//     if (credentials.rejected) {
//       reason = 'Rejected by user'
//       console.log('Rejected by use')
//       return false;
//     }
//     var v = http.request("https://labtor.tv", {
//       headers: {
//         "Origin": "https://labtor.tv",
//         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Safari/537.36",
//         "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
//         "Referer": "https://labtor.tv/",
//         "Accept-Encoding": "gzip, deflate, br",
//         "Accept-Language": "ru,en-US;q=0.9,en;q=0.8,zh;q=0.7",
//         "Upgrade-Insecure-Requests": 1,
//         "Content-Type": "application/x-www-form-urlencoded",
//         'cache-control': 'max-age=0',

//         // -H "Connection: keep-alive" 
//         // -H "Pragma: no-cache" 
//         // -H "Cache-Control: no-cache" 
//         // -H "Sec-Fetch-Mode: navigate" 
//         // -H "Sec-Fetch-Site: same-origin" 


//       },
//       postdata: {
//         login_name: credentials.username,
//         login_password: credentials.password,
//         login: 'submit'
//       },
//     });
//     console.log(v);

//     var doc = XML.parse(v).response;
//     if (doc.error) {
//       reason = doc.error;
//       do_query = true;
//       continue;
//     }
//     showtime.trace('Logged in to Headweb as user: ' + credentials.username);
//     loggedIn = true;
//     return false;
//   }
// }