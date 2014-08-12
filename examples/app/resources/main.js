$(function() {
    $('body')
            .delegate('a.active', 'click', function(e) {
                e.preventDefault();
            })//
            .delegate('.dropdown-menu.no-self-hide', 'click', function(e) {
                e.stopPropagation();
            });

    setupUserBar();
    setupUserInfo(window.USER_INFO);
});

function setupUserBar() {
    var form = $('#user-bar form');
    var login = form.find('input[name="login"]');
    var password = form.find('input[name="password"]');
    var message = form.find('.error');

    form.submit(function() {
        $.ajax(form.attr('action'), {
            type: 'POST',
            dataType: 'json',
            data: form.serialize(),
            success: function(data) {
                if (data.error) {
                    message.text(data.error);
                    message.show();
                } else {
                    setupUserInfo(data);
                }
            },
            error: function() {
                message.text('Вход временно недоступен');
                message.show();
            }
        });
        return false;
    });

    $('#user-bar .login-link').click(function() {
        _.delay(function() {
            login.focus();
        }, 200);

        login.val('');
        password.val('');
        message.hide();
    });

    $('#user-bar .logout-action').click(function(e) {
        $.ajax($(this).attr('href'), {
            type: 'GET',
            success: function() {
                setupUserInfo();
            }
        });
        return false;
    });
}

function setupUserInfo(info) {
    if (info) {
        $('#user-bar .e_user_info_name__value').text(info.userName);
        $('#user-bar .e_user_info_currency__value').text(info.balance);
        // $('#user-bar .e_user_info_inbox__value').text(info.mailCount);

        $('#user-bar .login').hide();
        $('#user-bar .user-info').show();
    } else {
        $('#user-bar .user-info').hide();
        $('#user-bar .login [data-toggle="dropdown"]').parent().removeClass('open');
        $('#user-bar .login').show();
    }
}