data = {};

//obrabotka spiska 
// nagladnyj primer v chrome  http://freerutor.org/page/1
/* primer vyvod v konsol' 
[... document.getElementsByClassName("fr_screen")].forEach(function (e) {
      console.log({
        url: e.getElementsByTagName("a")[0].attributes.getNamedItem("href").value,
        title: e.getElementsByTagName("img")[0].attributes.getNamedItem("title").value,
        icon: e.getElementsByTagName("img")[0].attributes.getNamedItem("src").value,
      })
    });
 */
function ScrapeList(pageHtml) {
  var returnValue = [];
  content = pageHtml.dom.getElementById("dle-content");
  if (content) {
    content.getElementByClassName("fr_screen").forEach(function (e) {
      returnValue.push({
        url: e.getElementByTagName("a")[0].attributes.getNamedItem("href").value,
        title: e.getElementByTagName("img")[0].attributes.getNamedItem("title").value,
        icon: e.getElementByTagName("img")[0].attributes.getNamedItem("src").value,
      });
    });
  }
  //document.getElementsByClassName("fr_navigation")[0].children[document.getElementsByClassName("fr_navigation")[0].children.length - 1].nodeName
  if (pageHtml.dom.getElementByClassName("fr_navigation").length !== 0) {
    returnValue.endOfData = pageHtml.dom.getElementByClassName("fr_navigation")[0].children[pageHtml.dom.getElementByClassName("fr_navigation")[0].children.length - 1].nodeName !== 'a'
  } else returnValue.endOfData = true;
  return returnValue;
};

function ScrapeSearch(pageHtml) {
  var returnValue = [];
  content = pageHtml.dom.getElementById("dle-content");
  if (content) {
    //content.getElementsByClassName('titlelast');
    content.getElementByClassName('titlelast').forEach(function (e) {
      returnValue.push({
        url: e.getElementByTagName("a")[0].attributes.getNamedItem("href").value,
        title: e.getElementByTagName("a")[0].attributes.getNamedItem("title").value,
        // icon: e.getElementByTagName("img")[0].attributes.getNamedItem("src").value,
      });
    });
  }
  //document.getElementsByClassName("fr_navigation")[0].children[document.getElementsByClassName("fr_navigation")[0].children.length - 1].nodeName
  if (pageHtml.dom.getElementByClassName("fr_navigation").length !== 0) {
    returnValue.endOfData = pageHtml.dom.getElementByClassName("fr_navigation")[0].children[pageHtml.dom.getElementByClassName("fr_navigation")[0].children.length - 1].nodeName !== 'a'
  } else returnValue.endOfData = true;
  log.p(returnValue)
  return returnValue;
};

function videoLinks(pageHtml) {
  pageHtml.dom.getElementByClassName("fr_download").forEach(function (e) {
    uri = e.attributes.getNamedItem("href").value.replace('/engine/', BASE_URL + '/engine/');
    title = e.textContent;
    page.appendItem(uri, "directory", {
      title: title
    });
  });
};


function populateItemsFromList(page, list) {
  log.d({
    function: "populateItemsFromList",
    list: list
  });
  for (i = 0; i < list.length; i++) {
    page.appendItem(PREFIX + ":moviepage:" + JSON.stringify(list[i]), "video", {
      title: list[i].title,
      description: list[i].description,
      icon: list[i].icon,
      logo: list[i].icon
    });
    page.entries++;
  }
}

exports.list = function (page, params) {
  url = params.page ? params.href + params.page : params.href //+ "/";
  page.loading = true;
  page.metadata.logo = LOGO;
  page.metadata.title = params.title;
  //page.model.contents = "grid";
  page.type = "directory";
  page.entries = 0;
  log.d("exports.list");
  log.d(params);
  log.d("params.args:" + params.args);
  var nextPage = 1;

  function loader() {
    log.d({
      "params.page": params.page,
      "params.href": params.href
    });
    url = params.page ? params.href + params.page : params.href //+ "/";
    log.d("url=" + url); //http://getmovie.cc/serials-anime/page/2/
    var resp = http.request(BASE_URL + url);
    pageHtml = {
      text: resp,
      dom: html.parse(resp).root
    };
    log.d(pageHtml);
    /do=search/.test(url) ? list = ScrapeSearch(pageHtml) : list = ScrapeList(pageHtml);
    populateItemsFromList(page, list);
    nextPage++;
    params.page = "/page/" + nextPage;
    page.haveMore(list !== undefined && list.endOfData !== undefined && !list.endOfData);


    // api.call(page, BASE_URL + url, null, function(pageHtml) {
    //     list = ScrapeList(url, pageHtml);
    //     populateItemsFromList(page, list);
    //     nextPage++;
    //     params.page = "/page/" + nextPage + "/";
    //     page.haveMore(list.endOfData !== undefined && !list.endOfData);
    // });
    page.loading = false;
  }
  loader();
  page.asyncPaginator = loader;
};

// vyzov s url
// PREFIX:moviepage:url
exports.moviepage = function (page, mdata) {
  page.metadata.title = mdata.title;
  page.metadata.logo = data.icon;
  page.loading = true;
  page.type = "directory";
  /{"url":"/.test(mdata) ? (data = JSON.parse(mdata)) : (data.url = mdata);
  log.d({
    function: "moviepage",
    data: data
  });
  page.metadata.logo = data.icon;
  //delaem zapros na stranicu
  var resp = http.request(data.url);
  pageHtml = {
    text: resp,
    dom: html.parse(resp).root
  };

  //trailer
  try {
    trailer = pageHtml.dom.getElementByClassName('fr_tr-trailer');
    page.appendItem(trailer[0].attributes.getNamedItem("href").value, "directory", {
      title: trailer[0].textContent
    });
  } catch (err) {;
  }

  pageHtml.dom.getElementByClassName("fr_download").forEach(function (e) {
    page.appendItem(e.attributes.getNamedItem("href").value.replace('/engine/', BASE_URL + '/engine/'), "directory", {
      title: e.textContent
    });
  });

  //list = ScrapePage(pageHtml);
  //populateItemsFromList(page, list);

  // api.call(page, data.url, null, function(pageHtml) {
  //list = ScrapePage(pageHtml);
  //populateItemsFromList(page, list);
  // });
  page.loading = false;
};