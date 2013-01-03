var notification = webkitNotifications.createNotification(
  'icon.png',  // icon url - can be relative
  'Não esquece de fazer check-in!',  // notification title
  'Se não o apoca te pega.'  // notification body text
);

notification.onclick = function(){
    chrome.tabs.create({url: "index.html"});

    this.cancel();
};

chrome.alarms.create({periodInMinutes: 0.1})

chrome.alarms.onAlarm.addListener(function() {
    notification.show();

});




var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key': 'anonymous',
  'consumer_secret': 'anonymous',
  // 'scope': 'http://www.iceland2.com/',
  'app_name': 'Iceland 2nd Nation - Time Tracking'
});


window.onload = function(){
    console.log(oauth.hasToken())
}

function authorize(){

    oauth.authorize(function() {
        alert('authorized')
    });

}


chrome.browserAction.onClicked.addListener(authorize);