// FILE: static/booking/js/user_management.js

document.addEventListener('DOMContentLoaded', function() {
    fetch('/staff/api/users/')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched data:', data); // Debugging statement
            if (data && data.users) {
                const userTableBody = document.getElementById('user-table-body');
                const userCardsContainer = document.getElementById('user-cards');
                const selectUserName = document.getElementById('selectUserName');
                const selectUserUsername = document.getElementById('selectUserUsername');
                const selectedUserCard = document.getElementById('selectedUserCard');
                const resetSearchButton = document.getElementById('resetSearchButton');

                data.users.forEach(user => {
                    console.log('Processing user:', user); // Debugging statement

                    // Calculate booking statistics
                    const currentDate = new Date();
                    const upcomingBookings = user.bookings.filter(booking => new Date(booking.start_time) > currentDate);
                    const confirmedUpcomingBookings = upcomingBookings.filter(booking => booking.status === 'Confirmed');
                    const unconfirmedUpcomingBookings = upcomingBookings.filter(booking => booking.status === 'Requested');
                    const totalConfirmedBookings = user.bookings.filter(booking => booking.status === 'Confirmed');
                    const totalUnconfirmedBookings = user.bookings.filter(booking => booking.status === 'Requested');

                    // Populate selection lists
                    const nameOption = document.createElement('option');
                    nameOption.value = user.id;
                    nameOption.innerText = `${user.first_name} ${user.last_name} - ${user.username}`;
                    selectUserName.appendChild(nameOption);

                    const usernameOption = document.createElement('option');
                    usernameOption.value = user.id;
                    usernameOption.innerText = `${user.username} - ${user.first_name} ${user.last_name}`;
                    selectUserUsername.appendChild(usernameOption);

                    // Populate table rows for larger screens
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.first_name} ${user.last_name}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.phone}</td>
                        <td>${user.role}</td>
                        <td class="d-flex p-0">
                            <button class="btn btn-info btn-sm flex-fill" onclick="displaySelectedUserCard(${user.id})">${transView}</button>
                            <button class="btn btn-secondary btn-sm flex-fill" onclick="openEditUserModal(${user.id})" data-bs-toggle="modal" data-bs-target="#editUserModal">${transEdit}</button>
                            ${user.is_manager ? `<button class="btn btn-warning btn-sm flex-fill" onclick="openChangeRoleModal(${user.id})" data-bs-toggle="modal" data-bs-target="#changeRoleModal">${transChangeRole}</button>` : ''}
                        </td>
                    `;
                    userTableBody.appendChild(row);

                    // Populate cards for smaller screens
                    const card = document.createElement('div');
                    card.className = 'col-12 mb-4 user-card'; // Ensure one card per row
                    card.setAttribute('data-user-id', user.id);
                    card.innerHTML = `
                        <div class="card">
                            <div class="card-header bg-primary text-white">
                                <h5 class="card-title">${user.username}</h5>
                            </div>
                            <div class="card-body">
                                <p class="card-text">
                                    <strong>${transName}:</strong> ${user.first_name} ${user.last_name}<br>
                                    <strong>${transEmail}:</strong> ${user.email}<br>
                                    <strong>${transPhone}:</strong> ${user.phone}<br>
                                    <strong>${transRole}:</strong> ${user.role}<br>
                                    <strong>Upcoming Bookings:</strong> ${upcomingBookings.length}<br>
                                    &emsp;Confirmed: <span class="text-success fw-bold">${confirmedUpcomingBookings.length}</span><br>
                                    &emsp;Unconfirmed: <span class="text-danger fw-bold">${unconfirmedUpcomingBookings.length}</span><br>
                                    <strong>Total Bookings to Date:</strong> ${user.bookings.length}<br>
                                    &emsp;Confirmed: <span class="text-success fw-bold">${totalConfirmedBookings.length}</span><br>
                                    &emsp;Unconfirmed: <span class="text-danger fw-bold">${totalUnconfirmedBookings.length}</span>
                                </p>
                                <div id="userBookings-${user.id}" class="form-group">
                                    ${user.bookings.length > 0 ? `
                                        <select class="form-select">
                                            ${user.bookings.map(booking => {
                                                const bookingDate = new Date(booking.start_time);
                                                const formattedDate = bookingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                                const formattedTime = bookingDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                                                return `<option value="${booking.id}">${booking.event_location} - ${formattedDate} ${formattedTime} - ${booking.guests} Guests - ${booking.tables} Tables - ${booking.status}</option>`;
                                            }).join('')}
                                        </select>
                                        <button class="btn btn-primary mt-2" onclick="showBooking(${user.id})">${transShowBooking}</button>
                                    ` : `<p>${transNoBookingsFound}</p>`}
                                </div>
                            </div>
                            <div class="card-footer p-0 d-flex">
                                <button class="btn btn-secondary btn-sm w-100" onclick="openEditUserModal(${user.id})" data-bs-toggle="modal" data-bs-target="#editUserModal">${transEdit}</button>
                                ${user.is_manager ? `<button class="btn btn-warning btn-sm w-100" onclick="openChangeRoleModal(${user.id})" data-bs-toggle="modal" data-bs-target="#changeRoleModal">${transChangeRole}</button>` : ''}
                            </div>
                        </div>
                    `;
                    userCardsContainer.appendChild(card);
                });

                // Event listeners for selection lists
                selectUserName.addEventListener('change', function() {
                    const userId = this.value;
                    if (userId) {
                        displaySelectedUserCard(userId);
                    }
                });

                selectUserUsername.addEventListener('change', function() {
                    const userId = this.value;
                    if (userId) {
                        displaySelectedUserCard(userId);
                    }
                });

                // Event listener for reset button
                resetSearchButton.addEventListener('click', function() {
                    selectUserName.value = '';
                    selectUserUsername.value = '';
                    selectedUserCard.innerHTML = '';
                    document.querySelectorAll('.user-card').forEach(card => {
                        card.style.display = 'block';
                    });
                });

                window.displaySelectedUserCard = function(userId) {
                    const user = data.users.find(user => user.id == userId);
                    if (user) {
                        // Recalculate booking statistics
                        const currentDate = new Date();
                        const upcomingBookings = user.bookings.filter(booking => new Date(booking.start_time) > currentDate);
                        const confirmedUpcomingBookings = upcomingBookings.filter(booking => booking.status === 'Confirmed');
                        const unconfirmedUpcomingBookings = upcomingBookings.filter(booking => booking.status === 'Requested');
                        const totalConfirmedBookings = user.bookings.filter(booking => booking.status === 'Confirmed');
                        const totalUnconfirmedBookings = user.bookings.filter(booking => booking.status === 'Requested');

                        const card = document.createElement('div');
                        card.className = 'col-12 mb-4'; // Ensure one card per row
                        card.innerHTML = `
                            <div class="card user-card w-100" data-user-id="${user.id}">
                                <div class="card-header bg-primary text-white">
                                    <h5 class="card-title">${user.username}</h5>
                                </div>
                                <div class="card-body">
                                    <p class="card-text">
                                        <strong>${transName}:</strong> ${user.first_name} ${user.last_name}<br>
                                        <strong>${transEmail}:</strong> ${user.email}<br>
                                        <strong>${transPhone}:</strong> ${user.phone}<br>
                                        <strong>${transRole}:</strong> ${user.role}<br>
                                        <strong>Upcoming Bookings:</strong> ${upcomingBookings.length}<br>
                                        &emsp;Confirmed: <span class="text-success fw-bold">${confirmedUpcomingBookings.length}</span><br>
                                        &emsp;Unconfirmed: <span class="text-danger fw-bold">${unconfirmedUpcomingBookings.length}</span><br>
                                        <strong>Total Bookings to Date:</strong> ${user.bookings.length}<br>
                                        &emsp;Confirmed: <span class="text-success fw-bold">${totalConfirmedBookings.length}</span><br>
                                        &emsp;Unconfirmed: <span class="text-danger fw-bold">${totalUnconfirmedBookings.length}</span>
                                    </p>
                                    <div id="userBookings-${user.id}" class="form-group">
                                        ${user.bookings.length > 0 ? `
                                            <select class="form-select">
                                                ${user.bookings.map(booking => {
                                                    const bookingDate = new Date(booking.start_time);
                                                    const formattedDate = bookingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                                    const formattedTime = bookingDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                                                    return `<option value="${booking.id}">${booking.event_location} - ${formattedDate} ${formattedTime} - ${booking.guests} Guests - ${booking.tables} Tables - ${booking.status}</option>`;
                                                }).join('')}
                                            </select>
                                            <button class="btn btn-primary mt-2" onclick="showBooking(${user.id})">${transShowBooking}</button>
                                        ` : `<p>${transNoBookingsFound}</p>`}
                                    </div>
                                </div>
                                <div class="card-footer p-0 d-flex">
                                    <button class="btn btn-secondary btn-sm w-100" onclick="openEditUserModal(${user.id})" data-bs-toggle="modal" data-bs-target="#editUserModal">${transEdit}</button>
                                    ${user.is_manager ? `<button class="btn btn-warning btn-sm w-100" onclick="openChangeRoleModal(${user.id})" data-bs-toggle="modal" data-bs-target="#changeRoleModal">${transChangeRole}</button>` : ''}
                                </div>
                            </div>
                        `;
                        selectedUserCard.innerHTML = '';
                        selectedUserCard.appendChild(card);

                        // Hide all other user cards
                        document.querySelectorAll('.user-card').forEach(card => {
                            card.style.display = 'none';
                        });

                        // Show the selected user card
                        document.querySelector(`.user-card[data-user-id="${userId}"]`).style.display = 'block';

                        // Scroll to the top of the selected user card
                        selectedUserCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            } else {
                console.error('No users found in the fetched data');
            }
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
});

function showBooking(userId) {
    const bookingSelect = document.querySelector(`#userBookings-${userId} select`);
    const selectedBookingId = bookingSelect.value;
    if (selectedBookingId) {
        window.location.href = `/staff/bookings/${selectedBookingId}/`;
    }
}

function openEditUserModal(userId) {
    fetch(`/staff/api/users/${userId}/`)
        .then(response => response.json())
        .then(user => {
            document.getElementById('editUserName').value = user.first_name + ' ' + user.last_name;
            document.getElementById('editUserUsername').value = user.username;
            document.getElementById('editUserEmail').value = user.email;
            document.getElementById('editUserPhone').value = user.phone;
            document.getElementById('saveEditButton').onclick = function() {
                saveUserDetails(userId);
            };
        })
        .catch(error => {
            console.error('Error fetching user details for edit:', error);
        });
}

function saveUserDetails(userId) {
    const formData = new FormData();
    const name = document.getElementById('editUserName').value.split(' ');
    formData.append('first_name', name[0]);
    formData.append('last_name', name.slice(1).join(' '));
    formData.append('username', document.getElementById('editUserUsername').value);
    formData.append('email', document.getElementById('editUserEmail').value);
    formData.append('phone', document.getElementById('editUserPhone').value);

    fetch(`/staff/api/users/${userId}/edit/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response data:', data);
        document.getElementById('responseMessage').innerText = data.status === 'success' ? transUserDetailsUpdated : transFailedToUpdateUserDetails;
        const responseModal = new bootstrap.Modal(document.getElementById('responseModal'));
        responseModal.show();
        if (data.status === 'success') {
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    })
    .catch(error => {
        console.error('Error saving user details:', error);
        document.getElementById('responseMessage').innerText = transAnErrorOccurred;
        const responseModal = new bootstrap.Modal(document.getElementById('responseModal'));
        responseModal.show();
    });
}

function openChangeRoleModal(userId) {
    document.getElementById('saveRoleButton').onclick = function() {
        changeUserRole(userId);
    };
}

function changeUserRole(userId) {
    const newRole = document.getElementById('newRole').value;
    console.log(`Changing role for user ${userId} to ${newRole}`);
    const formData = new FormData();
    formData.append('role', newRole);
    fetch(`/staff/api/users/${userId}/role/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response data:', data);
        document.getElementById('responseMessage').innerText = data.status === 'success' ? transUserRoleUpdated : transFailedToUpdateUserRole;
        const responseModal = new bootstrap.Modal(document.getElementById('responseModal'));
        responseModal.show();
        if (data.status === 'success') {
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    })
    .catch(error => {
        console.error('Error changing user role:', error);
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