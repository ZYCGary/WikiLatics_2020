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
        (authorNames, topArticles) => {
            autoCompleteAuthorName(authorNames.names)
            console.log(topArticles)
            renderTopArticles(2, topArticles)
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

/**
 * -------------------------------------------------------------------------------
 * Overall Analytics Functions
 * --------------------------------------------------------------------------------
 */

/**
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

/**
 * Build tables for overall analytics results
 */
function renderTopArticles(filter, topArticles) {
    buildTopArticlesTable('#overall-max-revision-table', `Top ${filter} articles with the highest number of revisions`, topArticles.topRevisions.max)
    buildTopArticlesTable('#overall-min-revision-table', `Top ${filter} articles with the smallest number of revisions`, topArticles.topRevisions.min)
    buildTopArticlesTable('#overall-max-user-table', `Top ${filter} articles edited by the largest group of registered users`, topArticles.topUsers.max)
    buildTopArticlesTable('#overall-min-user-table', `Top ${filter} articles edited by the smallest group of registered users`, topArticles.topUsers.min)
    buildTopArticlesTable('#overall-max-history-table', `Top ${filter} articles with the longest history`, topArticles.topHistories.max)
    buildTopArticlesTable('#overall-min-history-table', `Top ${filter} articles with the shortest history`, topArticles.topHistories.min)
}

/**
 * A function for table building
 */
function buildTopArticlesTable(table, title, rows) {
    $(`${table} .card-title`).text(title);
    rows.forEach((row, index) => {
        console.log(index, row)
        let rank = $('<th/>').addClass('text-center').attr('scope', 'row').text(index + 1)
        let tr = $('<tr/>').append(rank)
        for (let value of Object.values(row)) {
            console.log(value)
            tr.append($('<td/>').addClass('text-center').text(value))
        }
        $(`${table} tbody`).append(tr)
    })
}
