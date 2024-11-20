// FILE: booking/static/booking/js/filter_events.js

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('id_location').addEventListener('change', filterEvents);
    document.getElementById('id_date').addEventListener('change', filterEvents);

    function filterEvents() {
        const location = document.getElementById('id_location').value;
        const date = document.getElementById('id_date').value;
        const eventCards = document.querySelectorAll('.event-card');

        eventCards.forEach(card => {
            const cardLocation = card.getAttribute('data-location');
            const cardDate = card.getAttribute('data-date');
            let showCard = true;

            if (location && cardLocation !== location) {
                showCard = false;
            }

            if (date && cardDate !== date) {
                showCard = false;
            }

            if (showCard) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
});