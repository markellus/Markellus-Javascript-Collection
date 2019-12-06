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