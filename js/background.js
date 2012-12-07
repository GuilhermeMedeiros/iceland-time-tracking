var notification = webkitNotifications.createNotification(
  'icon.png',  // icon url - can be relative
  'Ainda ta trampando nesse projeto?',  // notification title
  'HEIN?!?!?!?!?!?!!?!?!?!??!!'  // notification body text
);

notification.onclick = function(){
    chrome.tabs.create({url: "index.html"});

    this.cancel();
};

chrome.alarms.create({periodInMinutes: 0.1})

chrome.alarms.onAlarm.addListener(function() {
    notification.show();

});
