
//form validation for creating new user
const signupForm = document.getElementById('signupForm');
const newUsername = document.getElementById('newUsername');
const newConfirmPassword = document.getElementById('Cpassword');
const newPassword = document.getElementById('newPassword');

signupForm.addEventListener('submit', (event) => {
  const username = newUsername.value.trim();
  const password = newPassword.value;
  const confirmPassword = newConfirmPassword.value;

  const errors = [];

  if (username.length < 5) {
    errors.push('Username must have at least 5 characters');
  }
  if (username.value < 5) {
    errors.push('Username must have at least 5 characters');
  }
  if (password.length == '' || confirmPassword.length == '') {
    errors.push('must need a password');
  }

  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (errors.length > 0) {
    event.preventDefault(); // Prevent the form from submitting
    const errorMessage = errors.join('\n');
    alert(errorMessage);
  } else {
    console.log('Form is valid. Submitting...');
    // The form will be submitted as usual because there are no errors.
  }
});



// end
let editModal = document.getElementById('editModal')
editModal.addEventListener('show.bs.modal', function (event) {
  // Button that triggered the modal
  let button = event.relatedTarget
  // Extract info from data-bs-* attributes
  let userName = button.getAttribute('data-username')
  let email = button.getAttribute('data-email')
  let userId = button.getAttribute('data-userid')
  // Update the input's value
  let inputUserId = editModal.querySelector('#username')
  let inputEmail = editModal.querySelector('#email')
  let Uid = editModal.querySelector('#Uid')
  inputUserId.value = userName
  inputEmail.value = email
  Uid.value = userId
  console.log(`id from befor the model${userId}`);
})
// _______________________________________

// form validation for update
const updateuser = document.getElementById('updateuser');
const editUsername = document.getElementById('username');
const editEmail = document.getElementById('email');

updateuser.addEventListener('submit', async (event) => {
  event.preventDefault();
  const userId = document.getElementById('Uid').value
  const username = editUsername.value;
  const email = editEmail;
  const errors = [];
  // 
  const updatedData = {
    name: editUsername.value,
    email: editEmail.value,
  };
  const response = await fetch(`/admin/usermanagement/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedData)
  });
  if (response.ok) {
    window.location.reload();
  } else {
    console.error('Error updating user');
  }


});

let deleteModel = document.getElementById('deleteModal');
deleteModel.addEventListener('show.bs.modal', function(event) {
  // Button that triggered the modal
  let button = event.relatedTarget;
  let userId = button.getAttribute('data-userid');
  let userName = button.getAttribute('data-username');

  let Uid = deleteModal.querySelector('#CNFcls');
  Uid.value = userId;

  // Set the user._id value to the name_user element
  let nameUserElement = document.getElementById('name_user');
  nameUserElement.textContent = userName;
});


//  <!-- Deleting the data -->

const deleteButton = document.querySelector('.delete-button');
deleteButton.addEventListener('click', async (event) => {
  const userId = document.getElementById('CNFcls')
  const response = await fetch(`/admin/usermanagement/${userId.value}`, {
    method: 'DELETE'
  });
  if (response.ok) {
    // Refresh the page or update the user list
    window.location.reload();
  } else {
    console.error('Error deleting user');
  }
});

const userblock = document.querySelectorAll(".btnblock"); // Change the selector to select elements with class "btn_icon"

userblock.forEach((data) => {
    data.addEventListener('click', async (event) => {
        console.log("user blocked");
        let button = event.currentTarget; // Use event.currentTarget to get the clicked button
        console.log(button);
        let userId = button.getAttribute('data-userid');

        const data = {
            userid: userId
        };

        try {
            const response = await fetch(`/admin/usermanagement/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                window.location.reload();
            } else {
                console.error('Error updating user');
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    });
});





// block
const btnunblock = document.querySelectorAll(".btnunblock");
btnunblock.forEach((data) => {
    data.addEventListener('click', async (event) => {
        console.log("user unblock");
        let button = event.currentTarget; // Use event.currentTarget to get the clicked button
        console.log(button);
        let userId = button.getAttribute('data-userid');

        const data = {
            userid: userId
        };

        try {
            const response = await fetch(`/admin/usermanagementblock/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                window.location.reload();
            } else {
                console.error('Error updating user');
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    });
});



