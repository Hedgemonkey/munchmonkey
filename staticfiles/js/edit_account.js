document.addEventListener("DOMContentLoaded", function () {
    const editAccountForm = document.querySelector("form.edit-account");

    if (editAccountForm) {
        editAccountForm.addEventListener("submit", function (event) {
            event.preventDefault();
            console.log("Edit account form submitted");

            // Get the form data
            const formData = new FormData(editAccountForm);
            // Get the CSRF token from the form data
            const csrfTokenValue = formData.get('csrfmiddlewaretoken');
            console.log(formData);

            // Send the form data using AJAX
            fetch(editAccountForm.action, {
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
                            modalTitle.textContent = "Edit Successful";
                            modalBody.textContent = data.message;
                            closeButton.textContent = "Return";
                            closeButton.addEventListener("click", function () {
                                window.location.href = data.redirect_url;
                            });
                        } else {
                            modalTitle.textContent = "Edit Failed";
                            modalBody.textContent = data.error;
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