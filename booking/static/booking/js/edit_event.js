// FILE: static/booking/js/edit_event.js

$(document).ready(function() {
    $('#confirm-remove-btn').on('click', function() {
        // Submit the form to remove the event
        $('#confirmRemoveModal form').submit();
    });
});