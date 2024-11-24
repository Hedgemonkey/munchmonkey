// FILE: booking/static/booking/js/confirm_booking.js

document.addEventListener('DOMContentLoaded', function() {
    var confirmBookingModal = document.getElementById('confirmBookingModal');
    confirmBookingModal.addEventListener('show.bs.modal', function(event) {
        var button = event.relatedTarget;
        var bookingId = button.getAttribute('data-booking-id');
        var form = document.getElementById('confirm-booking-form');
        form.action = `/staff/bookings/confirm/${bookingId}/`;

        fetch(`/staff/view_booking/${bookingId}/`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('confirmBookingId').value = bookingId;
                document.getElementById('confirm-booking-confirmed').value = data.confirmed ? 'true' : 'false';
                document.getElementById('confirm-booking-comments-staff').value = data.comments_staff || '';
            });
    });

    var confirmBookingForm = document.getElementById('confirm-booking-form');
    confirmBookingForm.addEventListener('submit', function(event) {
        event.preventDefault();
        var formData = new FormData(confirmBookingForm);
        var bookingId = document.getElementById('confirmBookingId').value;

        fetch(`/staff/bookings/confirm/${bookingId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response data:', data);
            if (data.status === 'success') {
                location.reload();
            } else {
                alert('Error: ' + data.message);
            }
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