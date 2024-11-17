document.addEventListener("DOMContentLoaded", function () {
    const changePasswordForm = document.querySelector("form.change-password");

    if (changePasswordForm) {
        changePasswordForm.addEventListener("submit", function (event) {
            event.preventDefault();
            console.log("Change password form submitted");

            // Get the form data
            const formData = new FormData(changePasswordForm);
            // Get the CSRF token from the form data
            const csrfTokenValue = formData.get('csrfmiddlewaretoken');
            // Get the original page URL from the hidden input field
            const originalPage = formData.get('original_page') || '/';
            console.log(formData);

            // Send the form data using AJAX
            fetch(changePasswordForm.action, {
                method: "POST",
                body: formData,
                headers: {
                    'X-CSRFToken': csrfTokenValue,
                },
            })
                .then((response) => {
                    console.log("Response received:", response);
                    // Check if the response is successful
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Network response was not ok.');
                    }
                })
                .then((data) => {
                    console.log("Data received:", data);
                    const responseModal = document.getElementById("responseModal");
                    if (responseModal) {
                        const modalBody = responseModal.querySelector(".modal-body");
                        const modalTitle = responseModal.querySelector(".modal-title");
                        const closeButton = responseModal.querySelector("#modalCloseButton");

                        if (data.success) {
                            modalTitle.textContent = "Password Change Successful";
                            modalBody.textContent = data.message;
                            closeButton.textContent = "Return";
                            closeButton.addEventListener("click", function () {
                                window.location.href = data.redirect_url || originalPage;
                            });
                        } else {
                            modalTitle.textContent = "Password Change Failed";
                            modalBody.innerHTML = ""; // Clear previous content
                            if (data.login_form) {
                                modalTitle.textContent = "Password Change Successful. Please log in again.";
                                // Display the login form in the modal
                                modalBody.innerHTML = data.login_form;
                                // Attach event listener to the login form within the modal
                                const loginForm = modalBody.querySelector("form.login");
                                if (loginForm) {
                                    loginForm.addEventListener("submit", function (event) {
                                        event.preventDefault();
                                        console.log("Login form submitted");

                                        // Get the form data
                                        const loginFormData = new FormData(loginForm);
                                        // Get the CSRF token from the form data
                                        const loginCsrfTokenValue = loginFormData.get('csrfmiddlewaretoken');
                                        console.log(loginFormData);

                                        // Send the form data using AJAX
                                        fetch(loginForm.action, {
                                            method: "POST",
                                            body: loginFormData,
                                            headers: {
                                                'X-CSRFToken': loginCsrfTokenValue,
                                            },
                                        })
                                            .then((response) => {
                                                console.log("Response received:", response);
                                                // Check if the response is successful
                                                if (response.ok) {
                                                    return response.json();
                                                } else {
                                                    throw new Error('Network response was not ok.');
                                                }
                                            })
                                            .then((data) => {
                                                console.log("Data received:", data);
                                                if (data.success) {
                                                    modalTitle.textContent = "Login Successful";
                                                    modalBody.textContent = data.message;
                                                    closeButton.textContent = "Return";
                                                    closeButton.addEventListener("click", function () {
                                                        window.location.href = originalPage;
                                                    });
                                                } else {
                                                    modalTitle.textContent = "Login Failed";
                                                    modalBody.innerHTML = ""; // Clear previous content
                                                    if (data.error) {
                                                        const errorList = document.createElement("ul");
                                                        if (typeof data.error === 'string') {
                                                            const listItem = document.createElement("li");
                                                            listItem.textContent = data.error;
                                                            errorList.appendChild(listItem);
                                                        } else {
                                                            for (const [field, errors] of Object.entries(data.error)) {
                                                                errors.forEach(function (error) {
                                                                    const listItem = document.createElement("li");
                                                                    listItem.textContent = `${field}: ${error}`;
                                                                    errorList.appendChild(listItem);
                                                                });
                                                            }
                                                        }
                                                        modalBody.appendChild(errorList);
                                                    } else {
                                                        modalBody.textContent = "An unknown error occurred.";
                                                    }
                                                    closeButton.textContent = "Close";
                                                }
                                            })
                                            .catch((error) => {
                                                console.error("Error:", error);
                                                modalTitle.textContent = "Error";
                                                modalBody.textContent = error.message;
                                                closeButton.textContent = "Close";
                                            });
                                    });
                                }
                            } else if (typeof data.error === 'string') {
                                // Handle general error message
                                modalBody.textContent = data.error;
                            } else if (typeof data.error === 'object') {
                                // Handle field-specific errors
                                const errorList = document.createElement("ul");
                                for (const [field, errors] of Object.entries(data.error)) {
                                    errors.forEach(function (error) {
                                        const listItem = document.createElement("li");
                                        listItem.textContent = `${field}: ${error}`;
                                        errorList.appendChild(listItem);
                                    });
                                }
                                modalBody.appendChild(errorList);
                            } else {
                                modalBody.textContent = "An unknown error occurred.";
                            }
                            closeButton.textContent = "Close";
                        }
                        new bootstrap.Modal(responseModal).show();
                    } else {
                        console.error("Response modal not found in the DOM.");
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    const responseModal = document.getElementById("responseModal");
                    if (responseModal) {
                        const modalBody = responseModal.querySelector(".modal-body");
                        const modalTitle = responseModal.querySelector(".modal-title");
                        const closeButton = responseModal.querySelector("#modalCloseButton");

                        modalTitle.textContent = "Error";
                        modalBody.textContent = error.message;
                        closeButton.textContent = "Close";
                        new bootstrap.Modal(responseModal).show();
                    } else {
                        console.error("Response modal not found in the DOM.");
                    }
                });
        });
    }
});