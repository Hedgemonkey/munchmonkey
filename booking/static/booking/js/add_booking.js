document.addEventListener('DOMContentLoaded', function() {
    const eventSelect = document.getElementById('id_event');
    const dateTimeFields = document.getElementById('date-time-fields');
    const startTimeSelect = document.getElementById('id_start_time');
    const createUserBtn = document.getElementById('create-user-btn');
    const newUserFields = document.getElementById('new-user-fields');
    const saveNewUserBtn = document.getElementById('save-new-user-btn');
    const userSelect = document.getElementById('id_user');

    eventSelect.addEventListener('change', function() {
        if (eventSelect.value) {
            dateTimeFields.style.display = 'block';
            fetchAvailableSlots(eventSelect.value);
        } else {
            dateTimeFields.style.display = 'none';
            startTimeSelect.innerHTML = '<option value="">Select a time</option>';
        }
    });

    createUserBtn.addEventListener('click', function() {
        newUserFields.style.display = 'block';
        createUserBtn.style.display = 'none';
    });

    saveNewUserBtn.addEventListener('click', function() {
        const firstName = document.getElementById('new_user_first_name').value;
        const lastName = document.getElementById('new_user_last_name').value;
        const phone = document.getElementById('new_user_phone').value;
        const email = document.getElementById('new_user_email').value;

        fetch('/staff/create_user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                email: email
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const newUserOption = document.createElement('option');
                newUserOption.value = data.user_id;
                newUserOption.textContent = data.username;
                userSelect.appendChild(newUserOption);
                userSelect.value = data.user_id;
                newUserFields.style.display = 'none';
                createUserBtn.style.display = 'block';
            } else {
                alert(data.error);
            }
        });
    });

    function fetchAvailableSlots(eventId) {
        fetch(`/api/available_slots/?event_id=${eventId}`)
            .then(response => response.json())
            .then(data => {
                startTimeSelect.innerHTML = '<option value="">Select a time</option>';
                data.available_slots.forEach(slot => {
                    const option = document.createElement('option');
                    option.value = slot.time;
                    option.textContent = `${slot.time} (${slot.available_tables} tables available)`;
                    option.className = slot.available ? 'bg-success text-white' : 'bg-danger text-white';
                    option.disabled = !slot.available;
                    startTimeSelect.appendChild(option);
                });
            });
    }
});