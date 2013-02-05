
var notification = function(){

  var notification = webkitNotifications.createNotification(
    'icon.png',  // icon url - can be relative
    'Não esqueça de fazer check-in.',  // notification title
    'Clique aqui!'  // notification body text
  );

  notification.onclick = function(){
      chrome.tabs.create({url: "index.html"});
      this.cancel();
  };

  notification.show();
}

chrome.alarms.create({periodInMinutes: 30})

chrome.alarms.onAlarm.addListener(function() {
  notification()
});

notification();