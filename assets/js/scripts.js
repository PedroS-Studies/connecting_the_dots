    const correctPassword = "secret";

    function ctrlPwd() {
      const input = document.getElementById("pwdInput").value;
      if (input === correctPassword) {
        document.getElementById("login").style.display = "none";
        document.getElementById("ctrlPanel").style.display = "block";
      } else {
        document.getElementById("error").textContent = "Incorrect password. Try again.";
      }
    }
