$(function(){
    $('#form-login').on('submit', function(e){
        e.preventDefault();

        var data = {
            username: $('#input-username').val(),
            password: $('#input-password').val()
        }

        $.post(config.api_server + 'login', data, function(response){
            if(response.erro){
                $('.alert-error').text(response.description).show();
            } else {
                $('.alert-error').hide();
                window.location.href = 'index.html'
            }

        }, 'json')
    })

})