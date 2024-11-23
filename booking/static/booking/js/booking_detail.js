// FILE: booking/static/booking/js/booking_detail.js

document.addEventListener('DOMContentLoaded', function() {
    const bookingId = window.location.pathname.split('/').filter(Boolean).pop();
    const saveBookingButton = document.getElementById('saveBookingButton');
    const cancelBookingButton = document.getElementById('cancelBookingButton');
    const confirmCancelBookingButton = document.getElementById('confirmCancelBookingButton');
    const startTimeSelect = document.getElementById('startTime');
    const guestsInput = document.getElementById('guests');
    const eventIdElement = document.getElementById('eventId');

    if (!eventIdElement) {
        console.error('Event ID is not set.');
        return;
    }

    const eventId = eventIdElement.value;

    if (saveBookingButton) {
        saveBookingButton.addEventListener('click', function() {
            saveBookingDetails(bookingId);
        });
    }

    if (confirmCancelBookingButton) {
        confirmCancelBookingButton.addEventListener('click', function() {
            cancelBooking(bookingId);
        });
    }

    if (eventId) {
        fetchAvailableSlots(eventId, bookingId);
    } else {
        console.error('Event ID is not set.');
    }

    function fetchAvailableSlots(eventId, bookingId) {
        fetch(`/api/available_slots/?event_id=${eventId}`)
            .then(response => response.json())
            .then(data => {
                startTimeSelect.innerHTML = '<option value="">Select a time</option>';
                data.available_slots.forEach(slot => {
                    const option = document.createElement('option');
                    option.value = slot.time;
                    option.textContent = `${slot.time} (${slot.available_tables} tables available)`;
                    option.className = slot.available ? 'bg-success text-white' : 'bg-danger text-white';
                    option.disabled = !slot.available;
                    startTimeSelect.appendChild(option);
                });

                // Fetch the current booking details to set the initial start time and guests
                fetch(`/staff/api/bookings/${bookingId}/`)
                    .then(response => response.json())
                    .then(data => {
                        let currentStartTime = data.booking.start_time;
                        console.log('currentStartTime:', currentStartTime);  // Debugging: Print the currentStartTime value
                        currentStartTime = currentStartTime.replace('T', ' ').substring(0, 16);  // Format the currentStartTime correctly
                        console.log('Formatted currentStartTime:', currentStartTime);  // Debugging: Print the formatted currentStartTime value
                        console.log('startTimeSelect options:', Array.from(startTimeSelect.options).map(option => option.value));  // Debugging: Print the options in the startTimeSelect dropdown
                        const currentOption = Array.from(startTimeSelect.options).find(option => option.value === currentStartTime);
                        if (currentOption) {
                            currentOption.selected = true;
                        } else {
                            console.error('Current start time option not found in dropdown.');
                        }
                        guestsInput.value = data.booking.number_of_people;  // Set the guests input value
                    });
            });
    }

    function saveBookingDetails(bookingId) {
        const startTimeValue = document.getElementById('startTime').value;
        console.log('start_time:', startTimeValue);  // Debugging: Print the start_time value

        const formData = new FormData();
        formData.append('start_time', startTimeValue);
        formData.append('guests', document.getElementById('guests').value);
        formData.append('status', document.getElementById('status').value);
        formData.append('comments_user', document.getElementById('commentsUser').value);
        formData.append('comments_staff', document.getElementById('commentsStaff').value);

        fetch(`/staff/api/bookings/${bookingId}/edit/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response data:', data);
            document.getElementById('responseMessage').innerText = data.message || 'Booking details updated successfully.';
            const responseModal = new bootstrap.Modal(document.getElementById('responseModal'));
            responseModal.show();
            if (data.status === 'success') {
                // Update non-editable fields dynamically
                document.getElementById('eventLocation').textContent = data.booking.event.location;
                document.getElementById('tables').textContent = data.booking.tables;
            }
        });
    }

    function cancelBooking(bookingId) {
        fetch(`/staff/bookings/${bookingId}/cancel/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response data:', data);
            document.getElementById('responseMessage').innerText = data.message;
            const responseModal = new bootstrap.Modal(document.getElementById('responseModal'));
            responseModal.show();
            if (data.status === 'success') {
                // Update non-editable fields dynamically
                document.getElementById('status').value = 'Cancelled';
                document.querySelector('.card.mb-4').classList.add('bg-danger', 'text-white');
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-danger';
                alertDiv.role = 'alert';
                alertDiv.innerText = 'This booking has been canceled.';
                document.querySelector('.card-body').prepend(alertDiv);
                saveBookingButton.style.display = 'none';
                cancelBookingButton.style.display = 'none';
                const addNewBookingButton = document.createElement('a');
                addNewBookingButton.href = '/staff/bookings/add/';
                addNewBookingButton.className = 'btn btn-success';
                addNewBookingButton.innerText = 'Add New Booking';
                document.getElementById('bookingForm').appendChild(addNewBookingButton);
            }
        });
    }

    // Helper function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});