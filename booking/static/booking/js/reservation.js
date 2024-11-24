// FILE: booking/static/booking/js/reservation.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    const eventSelect = document.getElementById('eventLocation');
    const dateSelect = document.getElementById('eventDate');
    const startTimeSelect = document.getElementById('startTime');
    const guestsInput = document.getElementById('guests');
    const tablesInput = document.getElementById('tables');
    const reservationForm = document.getElementById('reservationForm');
    const bookingConfirmationModal = new bootstrap.Modal(document.getElementById('bookingConfirmationModal'));
    const bookingIdSpan = document.getElementById('bookingId');

    if (eventSelect) {
        eventSelect.addEventListener('change', function() {
            console.log('Event location changed:', eventSelect.value);
            if (eventSelect.value) {
                fetchAvailableSlots(eventSelect.value, dateSelect.value);
            } else {
                startTimeSelect.innerHTML = '<option value="">Select a time</option>';
            }
        });
    }

    if (dateSelect) {
        dateSelect.addEventListener('change', function() {
            console.log('Event date changed:', dateSelect.value);
            if (eventSelect.value && dateSelect.value) {
                fetchAvailableSlots(eventSelect.value, dateSelect.value);
            } else {
                startTimeSelect.innerHTML = '<option value="">Select a time</option>';
            }
        });
    }

    if (guestsInput) {
        guestsInput.addEventListener('input', function() {
            const guests = parseInt(guestsInput.value, 10);
            console.log('Guests input changed:', guests);
            if (!isNaN(guests)) {
                const tables = Math.ceil(guests / 4);
                tablesInput.value = tables;
            } else {
                tablesInput.value = '';
            }
        });
    }

    if (reservationForm) {
        reservationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Form submission intercepted');
            const formData = new FormData(reservationForm);
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            fetch(reservationForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Response received:', data);
                if (data.success) {
                    bookingIdSpan.textContent = data.booking_id;
                    bookingConfirmationModal.show();
                } else {
                    alert('Error: ' + JSON.stringify(data.errors));
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    function fetchAvailableSlots(eventLocation, eventDate) {
        console.log('Fetching available slots for:', eventLocation, eventDate);
        fetch(`/api/available_slots/?event_location=${eventLocation}&event_date=${eventDate}`)
            .then(response => response.json())
            .then(data => {
                console.log('Available slots received:', data);
                startTimeSelect.innerHTML = '<option value="">Select a time</option>';
                data.available_slots.forEach(slot => {
                    if (slot.available) {
                        const option = document.createElement('option');
                        option.value = slot.time;
                        option.textContent = `${slot.time} (${slot.available_tables} tables available)`;
                        option.className = 'bg-success text-white';
                        startTimeSelect.appendChild(option);
                    }
                });
            });
    }

    // Cancel Reservation Functionality
    const cancelReservationModal = new bootstrap.Modal(document.getElementById('cancelReservationModal'));
    const cancelReservationIdInput = document.getElementById('cancelReservationId');
    const confirmCancelReservationButton = document.getElementById('confirmCancelReservation');

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('cancel-reservation-btn')) {
            const reservationId = event.target.getAttribute('data-reservation-id');
            console.log('Cancel button clicked for reservation ID:', reservationId);
            cancelReservationIdInput.value = reservationId;
            cancelReservationModal.show();
        }
    });

    if (confirmCancelReservationButton) {
        confirmCancelReservationButton.addEventListener('click', function() {
            const reservationId = cancelReservationIdInput.value;
            console.log('Confirm cancel button clicked for reservation ID:', reservationId);
            const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
            fetch(`/cancel_reservation/${reservationId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Cancel response received:', data);
                if (data.success) {
                    location.reload();
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
});