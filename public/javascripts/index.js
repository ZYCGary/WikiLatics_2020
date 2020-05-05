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
            doneFn = () => {
                Toast.fire({
                    icon: 'success',
                    title: 'Data imported. You are ready to analytic data'
                })
            },
            errorFn = (error) => {}

        sendAjaxRequest(true, loadingContent, type, url, data, doneFn, errorFn, true)
    })
}
