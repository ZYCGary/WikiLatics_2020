$(document).ready(function () {
    initAnalytics()
})

/*
* Initialise analytics.
* This function is always called when the analytics page is loaded, requesting for necessary data and parsing
* default analytics results of Overall, Individual and Author Analytics components.
*/
function initAnalytics() {
    Swal.fire({
        icon: 'info',
        title: 'Analysing Data ...',
        showConfirmButton: false,
        allowOutsideClick: false
    })

    let tasks = {}
    tasks.authorNames = getAuthorNames(done)

    try {
        let {authorNames} = async.parallel(tasks)
        console.log(authorNames)
    }catch (err) {
        console.err(err)
    }
}

/*
* Get all distinct author names
*/
async function getAuthorNames(done) {
    let type = 'POST',
        url = '/analytics/get-authors',
        data = {},
        doneFn = (result) => {
            done(null, result.names)
        },
        errorFn = (err) => {
            done(err, null)
        }

    sendAjaxRequest(false, {}, type, url, data, doneFn, errorFn, true)
}
