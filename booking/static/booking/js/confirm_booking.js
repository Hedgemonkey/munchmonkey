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
                document.getElementById('confirm-booking-confirmed').value = data.confirmed ? 'true' : 'false';
                document.getElementById('confirm-booking-comments-staff').value = data.comments_staff || '';
            });
    });
});