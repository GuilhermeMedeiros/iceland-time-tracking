
var notification = function(){

  var notification = webkitNotifications.createNotification(
    'icon.png',  // icon url - can be relative
    'Não esquece de fazer check-in hein!',  // notification title
    'É só clicar em um botãozinho. Não custa nada.'  // notification body text
  );

  notification.onclick = function(){
      chrome.tabs.create({url: "index.html"});
      this.cancel();
  };

  notification.show();
}

chrome.alarms.create({periodInMinutes: 60})

chrome.alarms.onAlarm.addListener(function() {
  notification()
});

notification();