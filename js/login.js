import requests from '../service/request.js';
import user from '../service/user.js';

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const submitButton = loginForm.querySelector('button[type="submit"]');
const errorMessage = loginForm.querySelector('.error-message');

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    emailInput.classList.add('error');
    loginForm.classList.add('shake');
    
    setTimeout(() => {
        loginForm.classList.remove('shake');
    }, 500);
}

function clearError() {
    errorMessage.classList.remove('show');
    emailInput.classList.remove('error');
}

function setLoading(isLoading) {
    submitButton.classList.toggle('loading', isLoading);
    emailInput.disabled = isLoading;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

emailInput.addEventListener('input', () => {
    clearError();
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    
    const email = emailInput.value.trim();
    
    if (!validateEmail(email)) {
        showError('Por favor, insira um email válido');
        return;
    }
    
    setLoading(true);
    
    try {
        const userData = await requests.GetPersonByEmail(email);
        
        if (userData && userData.Id) {
            // Salvar dados do usuário
            Object.assign(user, userData);
            user.save();
            
            // Feedback visual de sucesso
            loginForm.classList.add('success-animation');
            
            // Redirecionar após breve delay para mostrar o feedback
            setTimeout(() => {
                window.location.href = 'projetos.html';
            }, 500);
        } else {
            showError('Email não encontrado. Verifique e tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showError('Ocorreu um erro ao fazer login. Tente novamente.');
    } finally {
        setLoading(false);
    }
});

// Autofocar no campo de email ao carregar a página
window.addEventListener('load', () => {
    emailInput.focus();
}); 