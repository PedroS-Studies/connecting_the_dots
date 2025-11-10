    const correctPassword = "secret";

    function ctrlPwd() {
      const input = document.getElementById("pwdInput").value;
      if (input === correctPassword) {
        document.getElementById("login").style.display = "none";
        document.getElementById("ctrlPanel").style.display = "block";
      } else {
        document.getElementById("error").textContent = "Wrong password. Try again.";
      }
    }

    document.getElementById('accessibilityToggle').addEventListener('change', function (e) {
  cookie1.accessibility = e.target.checked;
  document.getElementById('accessibilityLabel').textContent =
    'Accessible UI: ' + (e.target.checked ? 'On' : 'Off');

  if (e.target.checked) {
    changeToAccessible(); // Trigger your CSS swap
  }

  saveSession();
});

document.getElementById('saveCookiePrefs').addEventListener('click', function () {
  document.getElementById('cookieModal').style.display = 'none';
});


