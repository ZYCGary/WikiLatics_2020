window.Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

/*
* A global function to handle ajax request
* */
window.sendAjaxRequest = function (loading = true, loadingContent, type, url, data, doneFn, errorFn, errorAlert = true) {
    if (loading) {
        Swal.fire({
            icon: 'info',
            title: loadingContent.title,
            text: loadingContent.text,
            showConfirmButton: false,
            allowOutsideClick: false
        })
    }

    $.ajax({
        type: type,
        url: url,
        data: data,
    }).done(function (data) {
        Swal.close();
        doneFn(data)
    }).fail(function (data) {
        Swal.close();
        errorFn(data);
        if (errorAlert)
            Toast.fire({
                icon: 'error',
                title: data.error
            })
    })
}

$(document).ready(function () {
    handleMessageAlert();
})

/*
* Response message alert handler
*/
function handleMessageAlert() {
    let successAlert = $('.success-alert'),
        errorAlert = $('.error-alert');

    if(successAlert.length) {
        Toast.fire({
            icon: 'success',
            title: successAlert.attr('msg'),
        })
    }

    if(errorAlert.length) {
        Toast.fire({
            icon: 'error',
            title: errorAlert.attr('msg'),
        })
    }
}
