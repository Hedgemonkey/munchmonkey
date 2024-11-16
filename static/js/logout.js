document.addEventListener("DOMContentLoaded", function () {
    const logoutForm = document.querySelector("form.logout");

    logoutForm.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("Form submitted");

        // Get the form data
        const formData = new FormData(logoutForm);
        // Get the CSRF token from the form data
        const csrfTokenValue = formData.get('csrfmiddlewaretoken');
        console.log(formData);

        // Send the form data using AJAX
        fetch("/custom-logout/", {
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
                        // Handle successful logout
                        console.log("Logout successful:", data.message);
                        modalTitle.textContent = "Logout Successful";
                        modalBody.textContent = data.message;
                        closeButton.textContent = "Return";
                        closeButton.addEventListener("click", function () {
                            window.location.href = "/";
                        });
                    } else {
                        // Handle logout failure
                        console.log("Logout failed:", data.error);
                        modalTitle.textContent = "Logout Failed";
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