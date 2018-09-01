// console.log("Kinorrent loaded");

/**
 * getDomFromUrl - Получает DOM страницы по URL
 *
 * @param {string} url Ссылка на страницу
 *
 * @returns {object} Объект DOM страницы
 */
function getDomFromUrl(url) {
    // console.log(url);
    var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", url, false);
        xmlhttp.send();
    parser = new DOMParser();
    return parser.parseFromString(xmlhttp.responseText, "text/html");
}

/**
 * getRating - Получает значение рейтинга Кинопоиска и IMDB по ID фильма
 *
 * @param {number}  kId          ID фильма на сайте Кинопоиск
 * @param {boolean} [imdb=false] Если передан параметр true, выведет рейтинг IMDB. По-умолчанию выводит рейтинг Кинопоиска
 *
 * @returns {number} Значение рейтинга
 */
function getRating(kId, imdb = false) {
    var url = "https://neftbot.tk/kinopoisk/?kid=" + kId;
    var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", url, false);
        xmlhttp.send();
    var rating = JSON.parse(xmlhttp.responseText);
    if (imdb) {
        return rating["imdb"];
    } else {
        return rating["kp"];
    }
}

/**
 * processing - Обрабатывает найденные строки и добавляет необходимые css-классы и теги
 *
 * @param {object} titleObj Тег с ссылкой на фильм и заголовком
 *
 */
function processing(titleObj) {
    var url = new URL(titleObj, document.location);
        url = url.href;
    var page = getDomFromUrl(url);
    var badge = page.querySelector('[title*="kinopoisk.ru/rating"]');
    if (badge !== null) {
        badge = badge.title;
        badge = badge.match("rating/(.*).gif");
        var kId = badge[1];

        var rating = getRating(kId, false);
        if (rating == 0) {
            rating = getRating(kId, true);
            if (rating > 0) {
                var ratingClass = " kinorrent-imdb";
            }
        } else {
            var ratingClass = " kinorrent-kinopoisk";
        }

        if (rating > 0) {
            titleObj.closest("tr").className += " kinorrent-tr";
            if (rating > 6.9) {
                ratingClass += " kinorrent-good";
            } else if (rating < 6) {
                ratingClass += " kinorrent-bad";
                titleObj.closest("tr").className += " kinorrent-tr-bad";
            }

            var ratingEl = document.createElement('span');
            ratingEl.className = "kinorrent kinorrent-rating " + ratingClass;
            ratingEl.innerHTML = Sanitizer.escapeHTML(rating.toFixed(1));
            ratingEl.title = "Рейтинг фильма";
            titleObj.parentNode.insertBefore(ratingEl, titleObj);
        }
    }
}

var titles = document.querySelectorAll("#search_form table.forumline a.topictitle, #search_form table.forumline a.topicpremod, table.forumline a.topictitle");
if (titles !== null) {
    for (var i = 0; i < titles.length; i++) {
        processing(titles[i]);
    }
}
