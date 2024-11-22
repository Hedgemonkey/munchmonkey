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
            });
    });

    const goToEditBookingButton = document.getElementById('goToEditBookingButton');
    goToEditBookingButton.addEventListener('click', function() {
        const bookingId = document.getElementById('booking-id').value;
        window.location.href = `/staff/bookings/${bookingId}/`;
    });
});