// FILE: booking/static/booking/js/view_booking.js

document.addEventListener('DOMContentLoaded', function() {
    var viewBookingModal = document.getElementById('viewBookingModal');
    viewBookingModal.addEventListener('show.bs.modal', function(event) {
        var button = event.relatedTarget;
        var bookingId = button.getAttribute('data-booking-id');

        fetch(`/staff/view_booking/${bookingId}/`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('booking-event').textContent = data.event;
                document.getElementById('booking-user').textContent = data.user;
                document.getElementById('booking-user-phone').textContent = data.user_phone;
                document.getElementById('booking-user-email').textContent = data.user_email;
                document.getElementById('booking-start-time').textContent = data.start_time;
                document.getElementById('booking-end-time').textContent = data.end_time;
                document.getElementById('booking-guests').textContent = data.number_of_people;
                document.getElementById('booking-confirmed').textContent = data.confirmed ? 'Yes' : 'No';
                document.getElementById('booking-comments-user').textContent = data.comments_user || '';
                document.getElementById('booking-comments-staff').textContent = data.comments_staff || '';
                document.getElementById('booking-id').value = bookingId; // Set the booking ID in the hidden input field

                // Show or hide the canceled message
                if (data.canceled) {
                    document.getElementById('booking-canceled').style.display = 'block';
                    document.getElementById('confirmRejectButton').disabled = true; // Disable the Confirm/Reject button
                } else {
                    document.getElementById('booking-canceled').style.display = 'none';
                    document.getElementById('confirmRejectButton').disabled = false; // Enable the Confirm/Reject button
                }
            });
    });

    const goToEditBookingButton = document.getElementById('goToEditBookingButton');
    goToEditBookingButton.addEventListener('click', function() {
        const bookingId = document.getElementById('booking-id').value;
        window.location.href = `/staff/bookings/${bookingId}/`;
    });

    const confirmCancelBookingButton = document.getElementById('confirmCancelBookingButton');
    confirmCancelBookingButton.addEventListener('click', function() {
        const bookingId = document.getElementById('booking-id').value;
        fetch(`/staff/bookings/${bookingId}/cancel/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log(`Booking with ID ${bookingId} has been successfully canceled.`);
                location.reload();
            } else {
                console.error('Failed to cancel booking:', data.message);
            }
        })
        .catch(error => {
            console.error('Error canceling booking:', error);
        });
    });

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