$(document).ready(async function () {
    await initAnalytics()
    $('#overall-search-btn').on('click', function () {
        changeFilter(parseInt($('#overall-filter').val()))
    })
    $('#author-search-btn').on('click', function () {
        analyseAuthor($('#author-name').val())
    })
})

/**
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

    $.when(getAuthorNames(), getOverallResults(2), getArticlesInfo()).then(
        // All initialisation succeed, render results on the page
        (authorNames, topArticles, articleInfo) => {
            autoCompleteAuthorName(authorNames.names)
            renderTopArticles(2, topArticles)
            console.log(articleInfo)
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

/**
 * -------------------------------------------------------------------------------
 * Author Analytics Functions
 * --------------------------------------------------------------------------------
 */

/**
 * Get all distinct author names
 */
async function getAuthorNames() {
    return $.post({
        url: '/analytics/get-authors',
    })
}

/**
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
 * Make author analytics with input author name.
 */
function analyseAuthor(authorName) {
    // validate input
    if (authorName === '') {
        Toast.fire({
            icon: 'error',
            title: 'Please type an author name.'
        })
    } else {
        let loadingContent = {
                title: 'Analysing ...',
                text: 'Analysing article revisions created by this author ...'
            },
            type = 'POST',
            url = 'analytics/analyse-by-author',
            data = {
                author: authorName
            },
            doneFn = (results) => {
                renderAuthorAnalyticsResults(results)
            },
            errorFn = (error) => {
            }

        sendAjaxRequest(true, loadingContent, type, url, data, doneFn, errorFn, true)
    }
}

/**
 * Render author analytics results on page.
 */
function renderAuthorAnalyticsResults(results) {
    let wrapper = $('#author-analytics-results')
    wrapper.empty()
    results.forEach((result, index) => {
        let card = $('<div/>').addClass('card')
        // result heading
        let cardHeading = $('<div/>').addClass('card-header').attr('id', `heading-${index}`)
        let button = $('<button/>').addClass('text-left m-0 p-0 btn btn-link btn-block').attr({
            'type': 'button',
            'data-toggle': 'collapse',
            'data-target': `#collapse-${index}`,
            'aria-expanded': 'true'
        })
        let h5 = $('<h5/>').addClass('m-0 p-0').append(
            $('<a/>').addClass('nav-link').append(
                $('<i/>').addClass('nav-link-icon lnr-inbox')
            ).append(
                $('<span/>').text(result._id)
            ).append(
                $('<div/>').addClass('ml-auto badge badge-pill badge-secondary').text(result.count)
            )
        )
        // result table
        let collapse = $('<div/>', {
                id: `collapse-${index}`,
                'class': 'collapse',
                'data-parent': '#author-analytics-results',
                'aria-labelledby': `heading-${index}`
            }),
            cardBody = $('<div/>', {
                'class': 'card-body'
            }),
            table = $('<table/>', {
                    'class': 'mb-0 table table-striped'
                }
            ),
            thead = $('<thead/>')
                .append($('<tr/>')
                    .append($('<th/>', {
                        'class': 'text-center',
                        'style': 'width: 10%',
                        'text': '#'
                    }))
                    .append($('<th/>', {
                        'class': 'text-center',
                        'style': 'width: 60%',
                        'text': 'Title'
                    }))
                    .append($('<th/>', {
                        'class': 'text-center',
                        'style': 'width: 20%',
                        'text': 'Timestamp'
                    }))),
            tbody = $('<tbody/>')
        result.timestamps.forEach((timestamp, index) => {
            tbody.append($('<tr/>')
                .append($('<th/>', {
                    'class': 'text-center',
                    'scope': 'row',
                    'text': index + 1
                }))
                .append($('<td/>', {
                    'class': 'text-center',
                    'text': result._id
                }))
                .append($('<td/>', {
                    'class': 'text-center',
                    'text': timestamp
                })))
        })

        card.append(cardHeading.append(button.append(h5)))
            .append(collapse.append(cardBody.append(table.append(thead).append(tbody))))
        wrapper.append(card)
    })
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
        let rank = $('<th/>').addClass('text-center').attr('scope', 'row').text(index + 1)
        let tr = $('<tr/>').append(rank)
        for (let value of Object.values(row)) {
            tr.append($('<td/>').addClass('text-center').text(value))
        }
        $(`${table} tbody`).append(tr)
    })
}

/**
 * Process overall analytics with a customised filter.
 */
function changeFilter(filter) {
    let loadingContent = {
            title: 'Analysing ...',
            text: 'Making overall analytics ...'
        },
        type = 'POST',
        url = '/analytics/overall-tops',
        data = {
            filter: filter
        },
        doneFn = (results) => {
            $('#overall-top-articles-tables tbody').empty()
            renderTopArticles(filter, results)
        },
        errorFn = (error) => {
        }

    sendAjaxRequest(true, loadingContent, type, url, data, doneFn, errorFn, true)
}

/**
 * -------------------------------------------------------------------------------
 * Individual Article Analytics Functions
 * --------------------------------------------------------------------------------
 */

/**
 * Send AJAX request to get all article titles and the number of their revisions.
 */
async function getArticlesInfo() {
    return $.post({
        url: 'analytics/get-articles',
    })
}
