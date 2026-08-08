self.addEventListener('push', function(event) {
  let data = { title: 'Rafeeq Care Reminder', body: 'Time for your daily family care review and reflection.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Rafeeq Care Reminder', body: event.data.text() };
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Rafeeq Care Reminder', {
      body: data.body,
      icon: 'favicon.ico'
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
