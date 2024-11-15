/* JS Code for sign up form */

document.getElementById('signup_form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    // Perform form validation and other checks here

    // Display success or error message using JavaScript
    var errorMessage = '';

    // Check for specific error messages
    if (this.elements['username'].validity.valueMissing) {
        errorMessage = 'Please enter a username.';
    } else if (this.elements['username'].validity.tooShort) {
        errorMessage = 'Username must be at least 3 characters long.';
    } else if (this.elements['username'].validity.patternMismatch) {
        errorMessage = 'Username can only contain letters, numbers, and underscores.';
    } else if (this.elements['password1'].value !== this.elements['password2'].value) {
        errorMessage = 'Passwords do not match.';
    } else if (this.elements['password1'].validity.tooShort) {
        errorMessage = 'Password must be at least 8 characters long.';
    } else if (this.elements['password1'].validity.patternMismatch) {
        errorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
    }

    if (errorMessage) {
        // Display error message in a modal pop up using Bootstrap
        $('#errorModal .modal-body').text(errorMessage);
        $('#errorModal').modal('show');
    } else {
        // Display success message in a modal pop up using Bootstrap
        $('#successModal .modal-body').text('Your signup was successful!');
        $('#successModal').modal('show');

        // Submit the form
        this.submit();
    }
});