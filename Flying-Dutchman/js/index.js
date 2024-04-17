$(document).ready(function () {
    $('#loginForm').submit(function (event) {
        event.preventDefault();
        var username = $('#username').val();
        var password = $('#password').val();
        
        // Perform user authentication
        var user = DB_USERS.find(user => user.username === username && user.password === password);
        
        if (user) {
            // If user found, store the username in session storage and redirect
            if(user.user_type === 'employee'){
                sessionStorage.setItem('loggedInUser', username);
                window.location.href = 'bartender.html';
            } 
            else if (user.user_type === 'customer') {
                sessionStorage.setItem('loggedInUser', username);
                window.location.href = 'Customer.html';
            }
            else {
                alert('Not correct authority');
            }
        } else {
            // If user not found, display an error message or handle it as needed
            alert('Invalid username or password');
        }
    });
});



function buttonClicked(type) {
    if (type === 'vip') {
        var popup = document.getElementById('popup');
        popup.style.display = 'flex';
        document.getElementById('loginForm').action = 'customer.html';
    } else if (type === 'order') {
        location.href='customer.html';
    } else if (type === 'employee') {
        var popup = document.getElementById('popup');
        popup.style.display = 'flex';
        document.getElementById('loginForm').action = 'employee.html';
    }
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}
