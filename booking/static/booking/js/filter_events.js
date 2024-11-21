// FILE: booking/static/booking/js/filter_events.js

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('id_location').addEventListener('change', filterEvents);
    document.getElementById('id_date').addEventListener('change', filterEvents);
    document.getElementById('reset-button').addEventListener('click', resetFilters);

    function filterEvents() {
        const location = document.getElementById('id_location').value;
        const date = document.getElementById('id_date').value;
        const eventCards = document.querySelectordocument.addEventListener('DOMContentLoaded', function() {
            var viewBookingModal = document.getElementById('viewBookingModal');
            viewBookingModal.addEventListener('show.bs.modal', function(event) {
                var button = event.relatedTarget;
                var bookingId = button.getAttribute('data-booking-id');
        
                fetch(`/staff/view_booking/${bookingId}/`)
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('booking-event').textContent = data.event;
                        document.getElementById('booking-user').textContent = data.user;
                        document.getElementById('booking-start-time').textContent = data.start_time;
                        document.getElementById('booking-end-time').textContent = data.end_time;
                        document.getElementById('booking-guests').textContent = data.number_of_people;
                        document.getElementById('booking-confirmed').textContent = data.confirmed ? 'Yes' : 'No';
                        document.getElementById('booking-comments-user').textContent = data.comments_user || '';
                        document.getElementById('booking-comments-staff').textContent = data.comments_staff || '';
                    });
            });
        });All('.event-card');

        eventCards.forEach(card => {
            const cardLocation = card.getAttribute('data-location');
            const cardDate = card.getAttribute('data-date');
            let showCard = true;

            if (location && location !== '' && cardLocation !== location) {
                showCard = false;
            }

            if (date && date !== '' && cardDate !== date) {
                showCard = false;
            }

            if (showCard) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function resetFilters() {
        document.getElementById('id_location').value = '';
        document.getElementById('id_date').value = '';
        filterEvents();
    }
});