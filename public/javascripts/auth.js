/**
 * Handle client side actions in auth pages
 * */
$(document).ready(function () {
    submitRegisterForm()
    submitLoginForm()
})

/**
 * Validate register form submission
 */
function submitRegisterForm() {
    let form = $('#register-form')
    form.on('submit', function () {
        if (!form.valid()) {
            return false
        }
    })

    form.validate({
        rules: {
            username: {
                required: true,
                minlength: 6,
                maxlength: 20,
            },
            email: {
                required: true,
                minlength: 5,
                maxlength: 255,
                email: true
            },
            password: {
                required: true,
                minlength: 8,
                maxlength: 25,
            },
            password_confirm: {
                required: true,
                equalTo: '#password'
            }
        },
        messages: {}
    })
}

/**
 * Validate login form submission
 */
function submitLoginForm() {
    let form = $('#login-form')
    form.on('submit', function () {
        if (!form.valid()) {
            return false
        }
    })

    form.validate({
        rules: {
            username: {
                required: true,
                minlength: 6,
                maxlength: 20,
            },
            password: {
                required: true,
                minlength: 8,
                maxlength: 25,
            },
        },
        messages: {}
    })
}
