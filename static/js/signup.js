document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.querySelector("form.signup");

    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("Form submitted");

        // Get the form data
        const formData = new FormData(signupForm);
        // Get the CSRF token from the form data
        const csrfTokenValue = formData.get('csrfmiddlewaretoken');
        // Get the original page URL from the hidden input field
        let originalPage = formData.get('original_page');
        console.log(formData);

        // Check if originalPage is null and provide a default redirect URL
        if (!originalPage) {
            originalPage = "/";
        }

        // Send the form data using AJAX
        fetch(customSignupUrl, {
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
                        // Handle successful signup
                        console.log("Signup successful:", data.message);
                        modalTitle.textContent = "Signup Successful";
                        modalBody.textContent = data.message;
                        closeButton.textContent = "Return";
                        closeButton.addEventListener("click", function () {
                            // Perform login after successful signup
                            const loginFormData = new FormData();
                            loginFormData.append('login', formData.get('username'));
                            loginFormData.append('password', formData.get('password1'));
                            loginFormData.append('csrfmiddlewaretoken', csrfTokenValue);

                            fetch(customLoginUrl, {
                                method: "POST",
                                body: loginFormData,
                                headers: {
                                    'X-CSRFToken': csrfTokenValue,
                                },
                            })
                                .then((loginResponse) => {
                                    if (loginResponse.ok) {
                                        window.location.href = originalPage;
                                    } else {
                                        throw new Error('Login after signup failed.');
                                    }
                                })
                                .catch((loginError) => {
                                    console.error("Login error:", loginError);
                                    modalTitle.textContent = "Login Error";
                                    modalBody.textContent = loginError.message;
                                    closeButton.textContent = "Close";
                                    new bootstrap.Modal(responseModal).show();
                                });
                        });
                    } else {
                        // Handle signup failure
                        console.log("Signup failed:", data.error);
                        modalTitle.textContent = "Signup Failed";
                        modalBody.innerHTML = ""; // Clear previous content
                        const errorList = document.createElement("ul");
                        for (const [field, errors] of Object.entries(data.error)) {
                            errors.forEach(function (error) {
                                const listItem = document.createElement("li");
                                listItem.textContent = `${error}`;
                                errorList.appendChild(listItem);
                            });
                        }
                        modalBody.appendChild(errorList);
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
});