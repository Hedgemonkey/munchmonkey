document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("form");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("Form submitted");

        // Get the form data
        const formData = new FormData(loginForm);
        // Get the CSRF token from the form data
        const csrfTokenValue = formData.get('csrfmiddlewaretoken');
        // Get the original page URL from the hidden input field
        const originalPage = formData.get('original_page');
        console.log(formData);

        // Send the form data using AJAX
        fetch(customLoginUrl, {
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
                        // Handle successful login
                        console.log("Login successful:", data.message);
                        modalTitle.textContent = "Login Successful";
                        modalBody.textContent = data.message;
                        closeButton.textContent = "Return";
                        closeButton.addEventListener("click", function () {
                            window.location.href = originalPage;
                        });
                    } else {
                        // Handle login failure
                        console.log("Login failed:", data.error);
                        modalTitle.textContent = "Login Failed";
                        modalBody.innerHTML = ""; // Clear previous content
                        if (data.error && data.error.__all__) {
                            const errorList = document.createElement("ul");
                            data.error.__all__.forEach(function (error) {
                                const listItem = document.createElement("li");
                                listItem.textContent = error;
                                errorList.appendChild(listItem);
                            });
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
});