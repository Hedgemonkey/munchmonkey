// FILE: static/booking/js/events_overview.js

$(document).ready(function() {
    function updateRemoveButtonState() {
        const selectedEvents = $('.event-checkbox:checked').length;
        $('#remove-selected').prop('disabled', selectedEvents === 0);
    }

    function printSelectedEvents() {
        const selectedEvents = $('.event-checkbox:checked').map(function() {
            return $(this).val();
        }).get();
        console.log('Selected events:', selectedEvents);  // Debugging statement
    }

    $('.event-card').on('click', function() {
        const checkbox = $(this).find('.event-checkbox');
        checkbox.prop('checked', !checkbox.prop('checked'));
        $(this).toggleClass('border-selected', checkbox.prop('checked'));
        updateRemoveButtonState();
        printSelectedEvents();  // Print selected events to console
    });

    $('.event-card form').on('click', function(event) {
        event.stopPropagation();
    });

    $('#remove-selected').on('click', function() {
        const selectedEvents = $('.event-checkbox:checked').map(function() {
            return $(this).val();
        }).get();
        const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
        console.log('Selected events:', selectedEvents);  // Debugging statement
        console.log('CSRF token:', csrfToken);  // Debugging statement
        if (selectedEvents.length > 0) {
            $.ajax({
                url: removeSelectedEventsUrl,
                method: "POST",
                data: $.param({
                    selected_events: selectedEvents,
                    csrfmiddlewaretoken: csrfToken
                }),
                success: function() {
                    location.reload();
                },
                error: function() {
                    alert('An error occurred while removing the selected events.');
                }
            });
        } else {
            alert('No events selected.');
        }
    });

    updateRemoveButtonState();
});