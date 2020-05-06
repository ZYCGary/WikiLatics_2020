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

    $.when(getAuthorNames(), getOverallResults(2)).then(
        // All initialisation succeed, render results on the page
        (authorNames, result2) => {
            autoCompleteAuthorName(authorNames.names)
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
* -------------------------------------------------------------------------------
* Author Analytics Functions
* --------------------------------------------------------------------------------
*/

/*
* Get all distinct author names
*/
async function getAuthorNames() {
    return $.post({
        url: '/analytics/get-authors',
    })
}

/*
* Autocomplete author name
*/
function autoCompleteAuthorName(nameList) {
    $('#author-name').autocomplete({
        lookup: nameList,
        lookupLimit: 10,
        minChars: 2
    });
}

/*
* -------------------------------------------------------------------------------
* Overall Analytics Functions
* --------------------------------------------------------------------------------
*/

/*
* Send AJAX request to get the overall analytics results
*/
async function getOverallResults(filter) {
    return $.post({
        url: 'analytics/overall-tops',
        data: {
            filter: filter
        }
    })
}
