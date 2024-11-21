// FILE: static/booking/js/events_overview.js

$(document).ready(function() {
    let eventIdToRemove = null;

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

    $('#confirmRemoveModal').on('show.bs.modal', function(event) {
        const button = $(event.relatedTarget);
        eventIdToRemove = button.data('event-id');
    });

    $('#confirm-remove-btn').on('click', function() {
        if (eventIdToRemove) {
            // Single event removal
            $.ajax({
                url: `/staff/events/${eventIdToRemove}/remove/`,
                method: "POST",
                data: {
                    csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
                },
                success: function() {
                    location.reload();
                },
                error: function() {
                    alert('An error occurred while removing the event.');
                }
            });
        } else {
            // Multiple events removal
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
                    data: {
                        'selected_events': selectedEvents,  // Correct parameter name
                        csrfmiddlewaretoken: csrfToken
                    },
                    traditional: true,  // Ensure arrays are sent correctly
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
        }
    });

    updateRemoveButtonState();
});