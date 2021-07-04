module.exports = {
    fixBaseUrl(url) {
        return url.endsWith('/') ? url : url + "/"
    }
}