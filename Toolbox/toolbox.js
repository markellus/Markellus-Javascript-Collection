/*
    Javascript Toolbox: helper functions for Markellus Javascript Collection
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
 * @brief Loads additional scripts and style sheets.
 *
 * @param strFileName Name of file that should be loaded
 * @param strFileType file type (js or css)
 */
async function loadHeaderFile(strFileName, strFileType) {
    let elFileRef = document.getElementById("__MKDEP_" + strFileName);
    if(elFileRef != null) return;

    if (strFileType === "js") {
        elFileRef = document.createElement('script');
        elFileRef.setAttribute("type", "text/javascript");
        elFileRef.setAttribute("src", "./js/"+strFileName);
        elFileRef.async = false;
    } else if (strFileType === "css") {
        elFileRef = document.createElement("link");
        elFileRef.setAttribute("rel", "stylesheet");
        elFileRef.setAttribute("type", "text/css");
        elFileRef.setAttribute("href", "./css/"+strFileName)
    }
    elFileRef.setAttribute("id", "__MKDEP_" + strFileName);
    document.head.insertBefore(elFileRef, document.head.firstChild);
}

/**
 * @brief resets all css animations of a given DOM element.
 * @param el The DOM element
 */
function resetAnimation(el) {
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null;
}

/**
 * @brief Displays an error message.
 * @param strMessage The error message as a string
 */
function showErrorMessage(strMessage) {
    console.error("[ERROR]: " + strMessage)
}
