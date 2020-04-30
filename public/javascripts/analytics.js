$(document).ready(function () {

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

    let [authorNames] = Promise.all([getAuthorNames()])
}

/*
* Get all distinct author names
*/
async function getAuthorNames() {

}