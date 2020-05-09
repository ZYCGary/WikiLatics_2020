$(document).ready(async function () {
    await initAnalytics()
    $('#overall-search-btn').on('click', function () {
        changeFilter(parseInt($('#overall-filter').val()))
    })
    $('#author-search-btn').on('click', function () {
        analyseAuthor($('#author-name').val())
    })
    $('#article-search-btn').on('click', function () {
        analyseArticle($('#article-select').val())
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

    $.when(
        getAuthorNames(),
        getOverallResults(2),
        getArticlesInfo(),
        requestOverallRevisionDistributionData()
    ).then(
        // All initialisation succeed, render results on the page
        (authorNames, topArticles, articleInfo, overallChartsData) => {
            autoCompleteAuthorName(authorNames.names)
            renderTopArticles(2, topArticles)
            renderArticlesInfo(articleInfo.articlesInfo)
            let pieChartData = overallChartsData[0].pie
            renderPieChart(pieChartData)
            console.log(pieChartData)
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
                console.error(error)
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
 * Render overall pie chart data on the page.
 */
function renderPieChart(data) {
    // sort user type by the number of revisions
    let userRevCount = {
        regular: data.regularRevCount,
        bot: data.botRevCount,
        administrator: data.adminRevCount,
        anonymous: data.anonRevCount
    }
    let sortedUserRevCount = Object.entries(userRevCount).sort((a, b) => a[1] - b[1]).reverse()
    console.log(sortedUserRevCount)
    let sortedUserTypes = []
    sortedUserRevCount.forEach(item => {
        sortedUserTypes.push({
            type: item[0],
            percent: (item[1] / data.totalRevCount * 100).toFixed(2)
        })
    })

    // show pie chart description
    $('#overall-pie-chart-description').text(`The graph shows the revision number distribution by user type, 
    in which ${data.totalUserCount} number of users are taken into consideration for this analysis. 
    From the pie chart, it is clear that the revisions were meade mostly by ${sortedUserTypes[0].type} users that cover for ${sortedUserTypes[0].percent} percent, 
    followed by ${sortedUserTypes[1].type} users with ${sortedUserTypes[1].percent} percent. 
    The ${sortedUserTypes[2].type} users stands at ${sortedUserTypes[2].percent} percent, 
    which is larger than revisions made by ${sortedUserTypes[3].type} users (${sortedUserTypes[3].percent} percent).`)

    // draw overall pie chart
    let ctx = $('#overall-pie-chart')
    let pieData = {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132)',
                'rgba(54, 162, 235)',
                'rgba(255, 206, 86)',
                'rgba(75, 192, 192)'
            ],
        }]
    }
    let revCounts = {
        Regular: data.regularRevCount,
        Bot: data.botRevCount,
        Administrator: data.adminRevCount,
        Anonymous: data.anonRevCount
    }
    for (let [key, value] of Object.entries(revCounts)) {
        pieData.labels.push(key)
        pieData.datasets[0].data.push(value)
    }
    drawPieChar(ctx, pieData)
}

/**
 * Request for chart data for the analytics on revision number distribution by year and by user type.
 */
function requestOverallRevisionDistributionData() {
    return $.post({
        url: 'analytics/overall-charts-data',
    })
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

/**
 * Render articles information into the dropdown menu.
 */
function renderArticlesInfo(articlesInfo) {
    articlesInfo.forEach(info => {
        $('#article-select').append($('<option/>', {
            'text': `${info._id} (${info.count})`,
            'value': info._id
        }))
    })
}

/**
 * Send AJAX request to analyse selected article.
 */
function analyseArticle(article) {
    let loadingContent = {
            title: 'Analysing ...',
            text: 'Making individual article analytics ...'
        },
        type = 'POST',
        url = '/analytics/analyse-article',
        data = {
            article: article
        },
        doneFn = (results) => {
            // renderArticleSummary(results)
            renderArticleCharts(results)
            Toast.fire({
                icon: 'success',
                title: results.message
            })
        },
        errorFn = (error) => {
        }

    sendAjaxRequest(true, loadingContent, type, url, data, doneFn, errorFn, true)
}

/**
 * Render analysed article information.
 */
function renderArticleSummary(data) {
    let wrapper = $('#article-analytics-results')
    wrapper.empty()
    let card = $('<div/>').addClass('card')
    // result heading
    let cardHeading = $('<div/>').addClass('card-header').attr('id', `article-heading-1`)
    let button = $('<button/>').addClass('text-left m-0 p-0 btn btn-link btn-block').attr({
        'type': 'button',
        'data-toggle': 'collapse',
        'data-target': `#article-collapse-1`,
        'aria-expanded': 'true'
    })
    let h5 = $('<h5/>').addClass('m-0 p-0').append(
        $('<a/>').addClass('nav-link').append(
            $('<i/>').addClass('nav-link-icon lnr-inbox')
        ).append(
            $('<span/>').text(data.title)
        ).append(
            $('<div/>').addClass('ml-auto badge badge-pill badge-secondary').text(data.revisionCount)
        )
    )

    // Collapse for top news and top regular users.
    let collapse = $('<div/>', {
        id: `article-collapse-1`,
        'class': 'collapse',
        'data-parent': '#article-analytics-results',
        'aria-labelledby': `article-heading-1`
    })

    // Top 5 regular users table.
    let userCardBody = $('<div/>', {
            'class': 'card-body'
        }).append($('<h5/>', {
            'class': 'card-title',
            'text': 'Top 5 regular users on this article'
        })),
        userTable = $('<table/>', {
                'class': 'mb-0 table table-striped'
            }
        ),
        userThead = $('<thead/>')
            .append($('<tr/>')
                .append($('<th/>', {
                    'class': 'text-center',
                    'style': 'width: 10%',
                    'text': '#'
                }))
                .append($('<th/>', {
                    'class': 'text-center',
                    'style': 'width: 60%',
                    'text': 'Regular Users'
                }))
                .append($('<th/>', {
                    'class': 'text-center',
                    'style': 'width: 20%',
                    'text': 'Contributions'
                }))),
        userTbody = $('<tbody/>')
    data.topRegularUsers.forEach((user, index) => {
        userTbody.append($('<tr/>')
            .append($('<th/>', {
                'class': 'text-center',
                'scope': 'row',
                'text': index + 1
            }))
            .append($('<td/>', {
                'class': 'text-center',
                'text': user._id
            }))
            .append($('<td/>', {
                'class': 'text-center',
                'text': user.count
            })))
    })
    // Top 3 news table.
    let newsCardBody = $('<div/>', {
            'class': 'card-body'
        }).append($('<h5/>', {
            'class': 'card-title',
            'text': 'Top 3 news about the individual article obtained'
        })),
        newsTable = $('<table/>', {
                'class': 'mb-0 table table-striped'
            }
        ),
        newsThead = $('<thead/>')
            .append($('<tr/>')
                .append($('<th/>', {
                    'class': 'text-center',
                    'style': 'width: 10%',
                    'text': '#'
                }))
                .append($('<th/>', {
                    'class': 'text-center',
                    'style': 'width: 90%',
                    'text': 'Regular Users'
                }))),
        newsTbody = $('<tbody/>')
    data.topNews.forEach((news, index) => {
        newsTbody.append($('<tr/>')
            .append($('<th/>', {
                'class': 'text-center',
                'scope': 'row',
                'text': index + 1
            }))
            .append($('<td/>', {
                'class': 'text-center'
            })
                .append($('<a/>', {
                    'href': news.url,
                    'text': news.title
                }))))
    })
    card.append(cardHeading.append(button.append(h5)))
        .append(collapse.append(userCardBody.append(userTable.append(userThead).append(userTbody)))
            .append(newsCardBody.append(newsTable.append(newsThead).append(newsTbody))))
    wrapper.append(card)
}

function renderArticleCharts(data) {
    // Render bar chart 1
    let chartOneData = data.barChartOneData
    console.log(chartOneData)
    let ctx = $('#article-analytics-chart-1')
    renderBarChartByYearByType(ctx, chartOneData)
}

/**
 * -------------------------------------------------------------------------------
 * Universal functions
 * --------------------------------------------------------------------------------
 */
function drawPieChar(ctx, data, options) {
    let myPieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options
    });
}

function renderBarChartByYearByType(ctx, data, options) {
    let minYear = Math.min(data.bot[0]._id, data.admin[0]._id, data.anon[0]._id, data.regular[0]._id)
    let maxYear = Math.max(data.bot.reverse()[0]._id, data.admin.reverse()[0]._id, data.anon.reverse()[0]._id, data.regular.reverse()[0]._id)
    let years = []
    for (let year = minYear; year <= maxYear; year++) {
        years.push(year)
    }
    let bot = reconstructUserTypesData(data.bot)
    let admin = reconstructUserTypesData(data.admin)
    let anon = reconstructUserTypesData(data.anon)
    let regular = reconstructUserTypesData(data.regular)
    let botData = buildBarChartDataByYear(years, bot)
    let adminData = buildBarChartDataByYear(years, admin)
    let anonData = buildBarChartDataByYear(years, anon)
    let regularData = buildBarChartDataByYear(years, regular)

    console.log(bot, admin, anon, regular)
    console.log(botData, adminData, anonData, regularData)

    let myPieChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Bot',
                    data: botData,
                    backgroundColor: 'rgba(255, 99, 132)'
                },
                {
                    label: 'Administrator',
                    data: adminData,
                    backgroundColor: 'rgba(54, 162, 235)'
                },
                {
                    label: 'Anonymous',
                    data: anonData,
                    backgroundColor: 'rgba(255, 206, 86)'
                },
                {
                    label: 'Regular',
                    data: regularData,
                    backgroundColor: 'rgba(75, 192, 192)'
                }]
        },
        options: options
    });
}

function reconstructUserTypesData(data) {
    let result = {}
    for (let rec of data) {
        result[rec._id] = rec.count
    }
    return result
}

function buildBarChartDataByYear(year, data) {
    let result = []
    for (y of year) {
        result.push(data.hasOwnProperty(y) ? data[y] : 0)
    }
    return result
}
