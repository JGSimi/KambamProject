const user = {
    Id: null,
    Name: null,
    BirthDate: null,
    PhoneNumber: null,
    Email: null,
    
    // Método para salvar no localStorage
    save() {
        localStorage.setItem('user', JSON.stringify({
            Id: this.Id,
            Name: this.Name,
            BirthDate: this.BirthDate,
            PhoneNumber: this.PhoneNumber,
            Email: this.Email
        }));
    },
    
    // Método para carregar do localStorage
    load() {
        const data = localStorage.getItem('user');
        if (data) {
            const userData = JSON.parse(data);
            this.Id = userData.Id;
            this.Name = userData.Name;
            this.BirthDate = userData.BirthDate;
            this.PhoneNumber = userData.PhoneNumber;
            this.Email = userData.Email;
            return true;
        }
        return false;
    },
    
    // Método para limpar os dados
    clear() {
        this.Id = null;
        this.Name = null;
        this.BirthDate = null;
        this.PhoneNumber = null;
        this.Email = null;
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

export default user;