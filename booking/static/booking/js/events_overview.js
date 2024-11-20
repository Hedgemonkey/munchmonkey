// FILE: static/booking/js/events_overview.js

$(document).ready(function() {
    function updateRemoveButtonState() {
        const selectedEvents = $('.event-checkbox:checked').length;
        $('#remove-selected').prop('disabled', selectedEvents === 0);
    }

    $('.event-card').on('click', function() {
        const checkbox = $(this).find('.event-checkbox');
        checkbox.prop('checked', !checkbox.prop('checked'));
        $(this).toggleClass('border-selected', checkbox.prop('checked'));
        updateRemoveButtonState();
    });

    $('#remove-selected').on('click', function() {
        const selectedEvents = $('.event-checkbox:checked').map(function() {
            return $(this).val();
        }).get();
        if (selectedEvents.length > 0) {
            // Handle the removal of selected events
            console.log('Selected events to remove:', selectedEvents);
        } else {
            alert('No events selected.');
        }
    });

    updateRemoveButtonState();
});