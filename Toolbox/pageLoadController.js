/*
    Javascript page load controller: Allows loading new pages without bowser reloading.
    Copyright (C) 2019  Marcel Bulla

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


/**
 * Allows loading new pages without bowser reloading.
 */
class PageLoadController {

    constructor() {

        //Cache with pages that were alredy loaded once
        this.mapCachedPages = new Map();

        //Event Bindings
        this._loadPage = this._loadPage.bind(this);
        window.onpopstate = this.onPagePop.bind(this);
    }

    /**
     * @brief For qualified links: Activates the option to load the new page content without actually having to reload
     *        the page (background animations, headers and footers, etc. remain). Links that support this function must
     *        declare the CSS class "dynamiclink".
     */
    enable() {
        let arrLinks = document.getElementsByClassName("dynamiclink");
        for (let i = 0; i < arrLinks.length; i++) {
            const elLink = arrLinks[i];
            elLink.onclick = this._loadPage;
        }
    }

    /**
     * @brief Called when a new page is to be loaded.
     */
    _loadPage(event) {
        //The calling element determines which page to load
        const strUrl = event.target.getAttribute("href");
        this._loadPageInternal(strUrl);
        //Must always return false so that the browser does not reload the page itself
        return false;
    }

    /**
     * @brief Loads a subpage with the specified URL.
     * @param strUrl The URL of the subpage.
     */
    _loadPageInternal(strUrl) {
        if (this.mapCachedPages.has(strUrl)) {
            //Check whether the page is already in the cache.
            this._applyPageCache(strUrl, true);
        } else {
            //Otherwise send a request to the server and download the page.
            let xhr = new XMLHttpRequest();
            xhr.onload = this.onPageDataReceived.bind(this, xhr, strUrl);
            xhr.open("POST", strUrl);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send("dynamiclink=true");
        }
    }

    /**
     * Loads a subpage from the cache.
     * @param strUrl The URL of the subpage.
     * @param bPush  true, if the load event is to appear in the browser history, otherwise false.
     */
    _applyPageCache(strUrl, bPush) {
        console.log("apply cache: " + strUrl + ", push=" + bPush);

        //Load cache
        const cache = this.mapCachedPages.get(strUrl);

        //Replace title
        let elHeadline = document.getElementById("headline");
        elHeadline.innerHTML = cache.title;

        //Remove old stuff
        let elContentOld = document.getElementById("content-old");
        elContentOld.remove();

        let elContent = document.getElementById("content");
        elContent.id = "content-old";
        resetAnimation(elContent);

        //Add new stuff
        let elContentNew = document.createElement(elContent.tagName);
        elContentNew.id = "content";
        elContentNew.classList.add("content");
        elContentNew.innerHTML = cache.content;
        elContent.parentNode.appendChild(elContentNew);
        resetAnimation(elContentNew);

        //Reactivate controller
        this.enable();
        this._transformToNewPage(true);

        if (bPush) {
            //Manipulate browser history
            history.pushState(null, "PageLoadController::ManagedHistory", strUrl);
        }
    }

    /**
     * @brief Adjusts existing elements to a new subpage.
     */
    _transformToNewPage(bAnimate) {

        let bIsIndex = this.isIndex();
        console.log("transformToNewPage(" + bAnimate + "), bIsIndex =" + bIsIndex);
        let arrElements = document.getElementsByClassName("makesmall");
        for (let i = 0; i < arrElements.length; i++) {
            arrElements[i].classList.remove("ani");
            if (bIsIndex) {
                arrElements[i].classList.remove("small");
            } else {
                arrElements[i].classList.add("small");
            }
            if (bAnimate) {
                arrElements[i].classList.add("ani");
            }
            resetAnimation(arrElements[i]);
        }
    }

    /**
     * Checks if the current page is the website index
     */
    isIndex() {
        const elIndex = document.getElementById("index");
        return elIndex != null && elIndex.parentElement.id === "content";
    }


    /**
     * Called when a new subpage has been downloaded.
     * @param xhr    Reference to the XMLHttpRequest
     * @param strUrl URL of the subpage
     */
    onPageDataReceived(xhr, strUrl) {
        if (xhr.status >= 200 && xhr.status < 300) {
            //Mount Cache
            let elCache = document.createElement("cache");
            elCache.innerHTML = xhr.response;
            let cache = new PageCache(strUrl,
                elCache.getElementsByTagName("title")[0].innerHTML,
                elCache.getElementsByTagName("cachecontent")[0].innerHTML);
            console.log("writing cache for site  \"" + cache.title  +"\" @" + cache.url);
            this.mapCachedPages.set(strUrl, cache);
            this._applyPageCache(strUrl, window.location.pathname !== strUrl);
            elCache.remove();
        } else {
            //Meh
            showErrorMessage("Failed to load resource " + strUrl);
        }
    }

    /**
     * Called when the browser history is manipulated (e.g. navigating using the forward and backward buttons).
     */
    onPagePop(event) {
        if(this.mapCachedPages.has(window.location.pathname)) {
            this._applyPageCache(window.location.pathname, false);
        } else {
            this._loadPageInternal(window.location.pathname);
        }
    }

}

class PageCache {

    constructor(strUrl, strTitle, elContent) {

        this.url = strUrl;
        this.title = strTitle;
        this.content = elContent;
    }
}

let pageLoadController = null;

document.addEventListener("DOMContentLoaded", function(event) {
    pageLoadController = new PageLoadController();
    pageLoadController.enable();
    pageLoadController._transformToNewPage(false);
});