$(document).ready(() => {
    importData()
})

const importData = () => {
    $('#import-data').on('click', function () {
        let loadingContent = {
                title: 'Importing data',
                text: 'This would take one or two minutes, please wait till process finished'
            },
            type = 'POST',
            url = '/analytics/import-data',
            data = {},
            doneFn = (result) => {
                if (result.status === '202') {
                    console.log(result)
                }
                console.log(result)
            },
            errorFn = (error) => {}

        sendAjaxRequest(true, loadingContent, type, url, data, doneFn, errorFn, true)
    })
}