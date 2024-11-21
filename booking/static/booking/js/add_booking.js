// FILE: booking/static/booking/js/add_booking.js

document.addEventListener('DOMContentLoaded', function() {
    const eventSelect = document.getElementById('id_event');
    const dateTimeFields = document.getElementById('date-time-fields');
    const startTimeSelect = document.getElementById('id_start_time');

    eventSelect.addEventListener('change', function() {
        if (eventSelect.value) {
            dateTimeFields.style.display = 'block';
            fetchAvailableSlots(eventSelect.value);
        } else {
            dateTimeFields.style.display = 'none';
            startTimeSelect.innerHTML = '<option value="">Select a time</option>';
        }
    });

    function fetchAvailableSlots(eventId) {
        fetch(`/api/available_slots/?event_id=${eventId}`)
            .then(response => response.json())
            .then(data => {
                startTimeSelect.innerHTML = '<option value="">Select a time</option>';
                data.available_slots.forEach(slot => {
                    const option = document.createElement('option');
                    option.value = slot.time;
                    option.textContent = slot.time;
                    option.className = slot.available ? 'bg-success text-white' : 'bg-danger text-white';
                    option.disabled = !slot.available;
                    startTimeSelect.appendChild(option);
                });
            });
    }
});