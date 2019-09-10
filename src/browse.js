data = {};
//obrabotka spiska
//nagladnyj primer v chrome  http://freerutor.org/page/1
/* primer vyvod v konsol' 
[... document.getElementsByClassName("tp1_body")].forEach(function (e) {
      console.log({
        url: e.getElementsByTagName("a")[0].attributes.getNamedItem("href").value,
        title: e.getElementsByTagName("img")[0].attributes.getNamedItem("alt").value,
        icon: e.getElementsByTagName("img")[0].attributes.getNamedItem("src").value,
      })
    });
 */

function ScrapeList(pageHtml) {
  var returnValue = [];
  //document.getElementsByClassName("main__content")
  content = pageHtml.dom.getElementById('dle-content');
  //content = pageHtml.dom.getElementByClassName("main__content")[0];
  if (content) {
    content.getElementByClassName('tp1_body').forEach(function (e) {
      desc = e.textContent
        .replace('Оригинальное наименование:', '\nОригинальное наименование:')
        .replace('Оригинальное название:', '\Оригинальное название:')
        .replace('Произведено:', '\nПроизведено:')
        .replace('Категория:', '\nКатегория:')
        .replace('Режиссер постановщик: ', '\nРежиссер постановщик:')
        .replace('В главных ролях:', '\nВ главных ролях:')
        .replace('Название:', '\nНазвание:')
        .replace('Оригинальное название:', '\nОригинальное название:')
        .replace('Год выпуска:', '\nГод выпуска:')
        .replace('Жанр:', '\nЖанр:')
        .replace('Выпущено:', '\nВыпущено:')
        .replace('Режиссер:', '\nРежиссер:')
        .replace('В ролях:', '\nВ ролях:')
      returnValue.push({
        url: e.getElementByTagName('a')[0].attributes.getNamedItem('href').value,
        title: e.getElementByTagName('img')[0].attributes.getNamedItem('alt').value,
        icon: e.getElementByTagName('img')[0].attributes.getNamedItem('src').value,
        // description: desc
      });
    });
  }
  //document.getElementsByClassName("fr_navigation")[0].children[document.getElementsByClassName("fr_navigation")[0].children.length - 1].nodeName
  var navigation = pageHtml.dom.getElementByClassName('paginator');
  if (navigation.length !== 0) {
    returnValue.endOfData = !navigation[0].children[0].children[navigation[0].children[0].children.length - 1].children[0].attributes.length;
  } else returnValue.endOfData = true;
  return returnValue;
}
//obrabotka spiska dlya poiska
function ScrapeSearch(pageHtml) {
  var returnValue = [];
  //document.getElementById('dle-content')
  content = pageHtml.dom.getElementById('dle-content');
  if (content) {
    //content.getElementsByClassName('titlelast');
    content.getElementByClassName('first bg').forEach(function (e) {
      returnValue.push({
        url: e.getElementByTagName('a')[1].attributes.getNamedItem('href').value,
        title: e.getElementByTagName('a')[1].textContent,
        icon: e.getElementByTagName("img")[0].attributes.getNamedItem("src").value,
      });
    });
  }
  //document.getElementsByClassName("fr_navigation")[0].children[document.getElementsByClassName("fr_navigation")[0].children.length - 1].nodeName
  var navigation = pageHtml.dom.getElementByClassName('pagination');
  if (navigation.length !== 0) {
    returnValue.endOfData = navigation[0].children[navigation[0].children.length - 1].nodeName !== 'A';
  } else returnValue.endOfData = true;
  return returnValue;
}

function populateItemsFromList(page, list) {
  log.d({
    function: 'populateItemsFromList',
    list: list
  });
  for (i = 0; i < list.length; i++) {
    page.appendItem(PREFIX + ':moviepage:' + JSON.stringify(list[i]), 'video', {
      title: list[i].title,
      description: list[i].description,
      icon: /^http/.test(list[i].icon) ? list[i].icon : BASE_URL + list[i].icon,
      logo: /^http/.test(list[i].icon) ? list[i].icon : BASE_URL + list[i].icon,
    });
    page.entries++;
  }
}

exports.list = function (page, params) {
  url = params.page ? params.href + params.page : params.href; //+ "/";
  page.loading = true;
  page.metadata.logo = LOGO;
  page.metadata.title = params.search ? page.metadata.title : params.title;
  //page.model.contents = "grid";
  page.type = 'directory';
  page.entries = 0;
  log.d('exports.list');
  log.d(params);
  log.d('params.args:' + params.args);
  var nextPage = 1;

  function loader() {
    log.d({
      'params.page': params.page,
      'params.href': params.href
    });
    url = params.page ? params.href + params.page : params.href; //+ "/";
    log.d('url=' + url);
    api.call(page, BASE_URL + url, null, function (pageHtml) {
      console.log(pageHtml);
      /do=search/.test(url) ? (list = ScrapeSearch(pageHtml)) : (list = ScrapeList(pageHtml));
      populateItemsFromList(page, list);
      nextPage++;
      params.page = '&cstart=' + nextPage;
      page.haveMore(list !== undefined && list.endOfData !== undefined && !list.endOfData);
    });
    page.loading = false;
  }
  loader();
  page.asyncPaginator = loader;
};
// vyzov s url
// PREFIX:moviepage:url
exports.moviepage = function (page, mdata) {
  page.loading = true;
  page.type = 'directory';
  /{"url":"/.test(mdata) ? (data = JSON.parse(mdata)) : (data.url = mdata);
  log.d({
    function: 'moviepage',
    data: data
  });
  page.metadata.title = data.title;
  page.metadata.logo = data.icon;
  //delaem zapros na stranicu
  var resp = http.request(data.url, {
    debug: service.debug,
    noFail: true, // Don't throw on HTTP errors (400- status code)
    compression: true, // Will send 'Accept-Encoding: gzip' in request
    caching: true, // Enables Movian's built-in HTTP cache
    cacheTime: 3600
  });
  pageHtml = {
    text: resp,
    dom: html.parse(resp).root
  };
  //background
  if (service.bg) {
    try {
      var fr_hid = pageHtml.dom.getElementByClassName('fr_hid')[0];
      if (fr_hid) {
        page.metadata.backgroundAlpha = 0.5; //?
        page.metadata.background = fr_hid.getElementByTagName('a')[0].attributes.getNamedItem('href').value;
      }
    } catch (err) {
      log.d('oshibka v BG');
      log.d(err.stack);
    }
  }
  // trailer(page);
  videoLinks(page);
  poxozhie(page);
  page.loading = false;
};

function videoLinks(page) {
  try {
    var seed = pageHtml.dom.getElementByClassName('floatright gr')[0].textContent;
    var peer = pageHtml.dom.getElementByClassName('floatright red rd')[0].textContent;

    // [...document.getElementsByClassName("modtor")[0].children].forEach(function (e) {
    //   console.log({
    //     url: e.attributes.getNamedItem("href").value,
    //     title: e.textContent

    //   })
    // });
    var links = pageHtml.dom.getElementByClassName('modtor')[0].children;
    links.forEach(function (e) {
      uri = e.attributes.getNamedItem('href').value.replace('/index.php', BASE_URL + '/index.php');
      title = e.textContent.replace('СКАЧАТЬ ТОРРЕНТ', 'Торрент ссылка ' + '[' + seed + '/' + peer + ']');
      page.appendItem(uri, 'directory', {
        title: title
      });
    });
  } catch (error) {
    log.d('oshibka v videoLinks');
    log.d(error.stack);
  }
}

function trailer(page) {
  //trailer
  try {
    var trailer = pageHtml.dom.getElementByClassName('fr_tr-trailer')[0];
    page.appendItem(trailer.attributes.getNamedItem('href').value, 'directory', {
      title: trailer.textContent
    });
  } catch (err) {
    console.error('oshibka v trailer');
    log.d(err.stack);
  }
}

function poxozhie(page) {
  try {
    // dobovlyaem seporator poxozhie
    fr_rela = pageHtml.dom.getElementByClassName('tables3 w100p')[0];
    if (fr_rela) {
      page.appendItem('', 'separator', {
        title: 'Похожие'
      });
      //obrabotka spiska
      //nagladnyj primer v chrome  http://freerutor.org/497873-plohoy-frenk-2017-web-dlrip
      /*
      [... document.getElementsByClassName('first')].forEach(function (e) {
      console.log({
        url: e.getElementsByTagName('a')[0].attributes.getNamedItem("href").value,
        title: e.getElementsByTagName('a')[0].textContent,
      });
    });
    */
      fr_rela.getElementByClassName('first').forEach(function (e) {
        data = {
          url: e.getElementByTagName('a')[0].attributes.getNamedItem("href").value,
          title: e.getElementByTagName('a')[0].textContent
        };
        page.appendItem(PREFIX + ':moviepage:' + JSON.stringify(data), 'directory', {
          title: data.title
        });
      });
    }
  } catch (err) {
    log.d('oshibka v poxozhie');
    log.d(err.stack);
  }
}