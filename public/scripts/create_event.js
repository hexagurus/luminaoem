document.addEventListener('DOMContentLoaded', () => {

    const createEventForm = document.getElementById('create-event-form');

    if (createEventForm) {
        createEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Check auth
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You must be logged in to create an event.');
                window.location.href = 'login.html';
                return;
            }

            const description = createEventForm.querySelector('textarea').value;
            const date = createEventForm.querySelector('input[type="date"]').value;
            const time = createEventForm.querySelector('input[type="time"]').value;

            const textInputs = createEventForm.querySelectorAll('input[type="text"]');
            // 0: title
            // 1: location name
            // 2: address

            const locName = textInputs[1].value;
            const address = document.getElementById('event-address').value;
            const lat = parseFloat(document.getElementById('event-lat').value) || 0;
            const lng = parseFloat(document.getElementById('event-lng').value) || 0;

            const priceVal = parseFloat(document.getElementById('event-price').value);
            const capVal = parseInt(document.getElementById('event-capacity').value);

            const img = createEventForm.querySelector('input[type="url"]').value;

            const payload = {
                title: textInputs[0].value,
                description: description,
                date: date,
                time: time,
                location: locName,
                address: address,
                latitude: lat,
                longitude: lng,
                price: priceVal,
                capacity: capVal,
                imageUri: img
            };

            const submitBtn = createEventForm.querySelector('button');

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Publishing...';

                const res = await apiAuthRequest('/api/events', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Event Published Successfully!');
                    window.location.href = 'index.html';
                } else {
                    alert('Failed to publish event: ' + (data.message || ''));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Something went wrong.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publish Event';
            }
        });
    }
});
