document.addEventListener('DOMContentLoaded', function() {
    const bookingId = window.location.pathname.split('/').filter(Boolean).pop();
    const saveBookingButton = document.getElementById('saveBookingButton');

    if (saveBookingButton) {
        saveBookingButton.addEventListener('click', function() {
            saveBookingDetails(bookingId);
        });
    }

    function saveBookingDetails(bookingId) {
        const formData = new FormData();
        formData.append('start_time', document.getElementById('startTime').value);
        formData.append('guests', document.getElementById('guests').value);
        formData.append('status', document.getElementById('status').value);
        formData.append('comments_user', document.getElementById('commentsUser').value);
        formData.append('comments_staff', document.getElementById('commentsStaff').value);

        fetch(`/staff/api/bookings/${bookingId}/edit/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response data:', data);
            document.getElementById('responseMessage').innerText = data.status === 'success' ? transBookingDetailsUpdated : transFailedToUpdateBookingDetails;
            const responseModal = new bootstrap.Modal(document.getElementById('responseModal'));
            responseModal.show();
            if (data.status === 'success') {
                // Update non-editable fields dynamically
                document.getElementById('eventLocation').innerText = data.booking.event_location;
                document.getElementById('tables').innerText = data.booking.tables;
                setTimeout(() => {
                    location.reload();
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error saving booking details:', error);
            document.getElementById('responseMessage').innerText = transAnErrorOccurred;
            const responseModal = new bootstrap.Modal(document.getElementById('responseModal'));
            responseModal.show();
        });
    }

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