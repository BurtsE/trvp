export default class Auth {
    async Login(event) {
        event.preventDefault();
        const login = document.getElementById('login').value
        const password = document.getElementById('password').value
        try {
            fetch("/auth", {
                method: 'POST',
                body: JSON.stringify({'login': login, 'password': password}),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
            }).then((response) => response.json()).then((data) => {
                if (data.login) {
                    localStorage.setItem('Username', data.login)
                } else {
                    console.log("could not get user: ", data)
                }
            })
        } catch (error) {
            console.log(error)
        }
        location.reload()
    }
    async Logout(event) {
        event.preventDefault()
        try {
            fetch("/logout")
            localStorage.removeItem('Username')
        } catch (error) {
            console.log(error)
        }
        location.reload()
    }
    render() {
        const username = localStorage.getItem('Username')
        if (username) {
            const logoutBtn = document.createElement('button');
            logoutBtn.setAttribute('type', 'button');
            logoutBtn.classList.add('logout-btn');
            logoutBtn.addEventListener('click', this.Logout)

            const userInfo = document.createElement('div');
            userInfo.innerHTML = 
            `
                    <div class="user-info__avatar"></div>
                        <span class="user-info__username">${username}</span>
            `
            userInfo.id = "user-info"
            userInfo.class = "user-info"
            userInfo.appendChild(logoutBtn)
            return userInfo
        }

        const form = document.createElement('form');
        form.classList.add('login_form');
        form.action = '/auth'
        form.method = 'POST'

        const submit = document.createElement('input');
        submit.type = 'submit'
        submit.placeholder = 'Авторизоваться'
        form.appendChild(submit)
        submit.onclick = this.Login


        const password = document.createElement('input');
        password.id = 'password';
        password.type = 'text';
        password.name = 'password';
        password.placeholder = 'Пароль'
        form.appendChild(password)

        const login = document.createElement('input');
        login.id = 'login';
        login.type = 'text';
        login.name = 'login';
        login.placeholder = 'Логин'
        form.appendChild(login)

        return form
    }
}