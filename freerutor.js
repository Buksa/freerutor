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
//ver 0.0.15

// parsit plugin.json
var plugin = JSON.parse(Plugin.manifest);
// PREFIX unikalnyj id plagina
var PREFIX = plugin.id;
//logo beret iz kornevoj papki s plago
var LOGO = Plugin.path + 'logo.png';
//user agent mestami nuzhno spofit'
var UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36';

var result = '',
  referer = BASE_URL,
  data = {};

//sistemnye biblioteki tak skazat'
var page = require('showtime/page');
var service = require('showtime/service');
var settings = require('showtime/settings');
var io = require('native/io');
var prop = require('showtime/prop');

var http = require('showtime/http');
var html = require('showtime/html');
// fail browse browse.js
var browse = require('./src/browse');
// log
var log = require('./src/log');
// api
var api = require('./src/api');

// Create the service (ie, icon on home screen)
service.create(plugin.title, PREFIX + ':start', 'video', true, LOGO);
// Create the settings
//stranica nastroik plagina
settings.globalSettings(plugin.id, plugin.title, LOGO, plugin.synopsis);
settings.createInfo('info', LOGO, 'Plugin developed by ' + plugin.author + '. \n');
settings.createDivider('Settings:');
settings.createString('domain', 'Домен', 'http://kinopad.club', function(v) {
  service.domain = v;
});
settings.createBool('debug', 'Debug', false, function(v) {
  service.debug = v;
});
settings.createBool('bg', 'Background', true, function(v) {
  service.bg = v;
});

// adress sajta
var BASE_URL = service.domain;
// http inspector pri zaprose na domen freerutor.org movian budet spufit' useragent v referala
io.httpInspectorCreate(service.domain + '.*', function(ctrl) {
  ctrl.setHeader('User-Agent', UA);
  ctrl.setHeader('Referer', service.domain);
});

// put' dlay obrabotki browse
new page.Route(PREFIX + ':browse:(.*):(.*)', function(page, href, title) {
  //vyzov function list iz file browse.js s parametrami href title
  browse.list(page, {
    href: href,
    title: title
  });
});
//put' dlya obrabotki moviepage
new page.Route(PREFIX + ':moviepage:(.*)', function(page, data) {
  //vyzov function moviepage iz file browse.js s parametrami data
  browse.moviepage(page, data);
});

//put' dlya obrabotki search so stranicy plaga
new page.Route(PREFIX + ':search:(.*)', function(page, query) {
  page.metadata.icon = LOGO;
  page.metadata.title = 'Search results for: ' + query;
  //  page.type = 'directory';
  //index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=lost
  browse.list(page, {
    href: '/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=' + query,
    title: query,
    search: 1
  });
});
// seacher dlya globalnogo poiska
page.Searcher(PREFIX, LOGO, function(page, query) {
  page.metadata.icon = LOGO;
  //page.metadata.title = 'Search results for: ' + query;
  browse.list(page, {
    href: '/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=' + query,
    title: query,
    search: 1
  });
});

// Landing page
//startovay stranica plagina
new page.Route(PREFIX + ':start', function(page) {
  page.type = 'directory';
  page.metadata.title = PREFIX;
  page.metadata.icon = LOGO;
  // dobodlyaen poisk na start page bydet vyzavat' uri PREFIX + ":search:"+zapros
  page.appendItem(PREFIX + ':search:', 'search', {
    title: 'Search freerutor'
  });

  // categorii so stranicy
  // http://freerutor.org/ v chrome ctrl+shift+i zakladka elements crtl+shift+c
  // ishem class gde nashi kategorii > fr_menu
  // zakladka console  vvodem document.getElementsByClassName("fr_menu")[1];
  // ento nash block s kotorum my budem rabotat'

  /* naglyadnyj primer vyvod v konsol' 
    [...document.getElementsByClassName("fr_menu")[1].children].forEach(function (i) {
         href = i.getElementsByTagName("a")[0].attributes.getNamedItem("href").value;
         title = i.getElementsByTagName("a")[0].text;
         console.log('page.appendItem(PREFIX + ":browse:' + href + ':' + title + '", "directory", { title: ' + title + '});')
     });
     */

  //sozdaet item na stranice budet vyzyvat' PREFIX + ":browse:(href):(title)"
page.appendItem('', 'separator', {title: 'Фильмы'});
page.appendItem(PREFIX + ':browse:/filmy/torrent-novinki-tor:Новинки кинопроката', 'directory', {
  title: 'Новинки кинопроката'
});
page.appendItem(PREFIX + ':browse:/filmy/films-tor:Фильмы (DVDRip,SATRip)', 'directory', {
  title: 'Фильмы (DVDRip,SATRip)'
});
page.appendItem(PREFIX + ':browse:/filmy/filmy-dvd-5:Фильмы (DVD-5,DVD-9)', 'directory', {
  title: 'Фильмы (DVD-5,DVD-9)'
});
page.appendItem(PREFIX + ':browse:/filmy/filmshd:HDRip,WEB-DLRip', 'directory', { title: 'Фильмы HDRip,WEB-DLRip' });
page.appendItem(PREFIX + ':browse:/filmy/filmy720:Фильмы 720P,1080P,Blu-Ray', 'directory', {
  title: 'Фильмы 720P,1080P,Blu-Ray'
});
page.appendItem(PREFIX + ':browse:/filmy/filmy-avc:Фильмы (AVC)', 'directory', { title: 'Фильмы (AVC)' });
page.appendItem(PREFIX + ':browse:/filmy/3d-filmy-torrent:3D фильмы', 'directory', { title: '3D фильмы' });
page.appendItem(PREFIX + ':browse:/filmy/4k_ultra:4K фильмы', 'directory', { title: '4K фильмы' });
page.appendItem(PREFIX + ':browse:/filmy:Все Фильмы', 'directory', { title: 'Все Фильмы' });
page.appendItem('', 'separator', {title: 'Мульфильмы'});
page.appendItem(PREFIX + ':browse:/mult:Мульфильмы', 'directory', { title: 'Мульфильмы' });
page.appendItem(PREFIX + ':browse:/mult/multserialy:Мультсериалы', 'directory', { title: 'Мультсериалы' });
page.appendItem(PREFIX + ':browse:/mult/3d-multfilmy:3D мультфильмы', 'directory', { title: '3D мультфильмы' });
page.appendItem('', 'separator', {title: 'Cериалы'});
page.appendItem(PREFIX + ':browse:/serials:Русские сериалы', 'directory', { title: 'Русские сериалы' });
page.appendItem(PREFIX + ':browse:/zarubezhnye-serialy-tor:Зарубежные сериалы', 'directory', {
  title: 'Зарубежные сериалы'
});
page.appendItem(PREFIX + ':browse:/zarubezhnye-serialy-tor/serialy720:Cериалы 720P,1080P', 'directory', {
  title: 'Cериалы 720P,1080P'
});
page.appendItem('', 'separator', {title: 'Разное'});
page.appendItem(PREFIX + ':browse:/tv:ТВ передачи', 'directory', { title: 'ТВ передачи' });
page.appendItem(PREFIX + ':browse:/tv/dokumentalnyy:Документальный', 'directory', { title: 'Документальный' });
page.appendItem(PREFIX + ':browse:/tv/umor:Юмор', 'directory', { title: 'Юмор' });
page.appendItem(PREFIX + ':browse:/sport:Спорт', 'directory', { title: 'Спорт' });
page.appendItem(PREFIX + ':browse:/mp3:Музыка', 'directory', { title: 'Музыка' });
page.appendItem(PREFIX + ':browse:/mp3/video-klipy:Видео клипы', 'directory', { title: 'Видео клипы' });
page.appendItem(PREFIX + ':browse:/audio-kniki-torrent:Аудио книги', 'directory', { title: 'Аудио книги' });
});