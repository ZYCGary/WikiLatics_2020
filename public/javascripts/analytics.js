$(document).ready(async function () {
    await initAnalytics()
})

/*
* Initialise analytics.
* This function is always called when the analytics page is loaded, requesting for necessary data and parsing
* default analytics results of Overall, Individual and Author Analytics components.
*/
async function initAnalytics() {
    Swal.fire({
        icon: 'info',
        title: 'Analysing Data ...',
        showConfirmButton: false,
        allowOutsideClick: false
    })

    $.when(getAuthorNames(), getAuthorNames()).then(
        // All initialisation succeed, render results on the page
        (result1, result2) => {
            console.log(result1, result2)
            const authorNames = result1.names
            console.log(authorNames)
            Swal.close()
        },
        // One of the requests fails, reject the initialisation process
        () => {
            Swal.close()
            Toast.fire({
                icon: 'error',
                title: 'Server internal error, please refresh the page to retry'
            })
        })
}

/*
* Get all distinct author names
*/
async function getAuthorNames() {
    return $.post({
        url: '/analytics/get-authors',
    })
}
