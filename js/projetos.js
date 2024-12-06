import requests from '../service/request.js';
import user from '../service/user.js';
import theme from '../service/theme.js';
import { applyBackground } from './backgroundManager.js';
import Modal from '../components/modal.js';

// Verifica se o usuário está logado
if (!user.load()) {
    window.location.href = 'login.html';
}

// Inicializa o tema
theme.init();

// Elementos DOM
const projectsGrid = document.getElementById('projectsGrid');
const userName = document.getElementById('userName');
const newProjectBtn = document.getElementById('newProjectBtn');
const projectModal = new Modal({
    title: 'Novo Projeto',
    content: `
        <form id="projectForm" class="responsive-form">
            <div class="form-group">
                <label for="projectName">Nome do Projeto</label>
                <input type="text" id="projectName" name="name" required>
            </div>
            <div class="form-group">
                <label for="projectDescription">Descrição</label>
                <textarea id="projectDescription" name="description" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="projectColor">Cor do Projeto</label>
                <input type="color" id="projectColor" name="color" value="#007AFF">
            </div>
        </form>
    `,
    onSubmit: async (formData) => {
        try {
            await requests.CreateBoard({
                Name: formData.name,
                Description: formData.description,
                HexaBackgroundCoor: formData.color,
                IsActive: true,
                CreatedBy: user.Id,
                UpdatedBy: user.Id
            });
            
            loadProjects();
        } catch (error) {
            console.error('Erro ao criar projeto:', error);
        }
    }
});
const logoutBtn = document.getElementById('logoutBtn');
const themeToggle = document.getElementById('themeToggle');
const projectSearch = document.getElementById('projectSearch');
const clearSearch = document.getElementById('clearSearch');
const sortButton = document.getElementById('sortButton');
let isAscending = true;

// Define o nome do usuário
userName.textContent = user.Name;

// Carrega o tema salvo
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.checked = true;
}

// Funções auxiliares
const createProjectCard = (project) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.borderLeft = `4px solid ${project.HexaBackgroundCoor || '#007AFF'}`;
    
    card.innerHTML = `
        <div class="project-header">
            <h3 class="project-title">${project.Name}</h3>
            <i class="fas fa-chevron-right"></i>
        </div>
        <p class="project-description">${project.Description || 'Sem descrição'}</p>
        <div class="project-footer">
            <span><i class="fas fa-clock"></i> Criado em ${new Date(project.CreatedOn).toLocaleDateString()}</span>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `kanban.html?boardId=${project.Id}`;
    });
    
    return card;
};

// Função de ordenação
const sortProjects = (ascending = true) => {
    const projects = Array.from(document.querySelectorAll('.project-card'));
    const sortedProjects = projects.sort((a, b) => {
        const titleA = a.querySelector('.project-title').textContent.toLowerCase();
        const titleB = b.querySelector('.project-title').textContent.toLowerCase();
        return ascending ? 
            titleA.localeCompare(titleB) : 
            titleB.localeCompare(titleA);
    });

    projectsGrid.innerHTML = '';
    sortedProjects.forEach(project => {
        projectsGrid.appendChild(project);
    });
};

// Carrega os projetos
const loadProjects = async () => {
    try {
        const projects = await requests.GetBoards();
        projectsGrid.innerHTML = '';
        
        const userProjects = projects.filter(project => project.CreatedBy === user.Id);
        
        if (userProjects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>Nenhum projeto encontrado</h3>
                    <p>Crie seu primeiro projeto clicando no botão acima</p>
                </div>
            `;
            return;
        }
        
        userProjects.forEach(project => {
            projectsGrid.appendChild(createProjectCard(project));
        });
        
        // Aplicar ordenação inicial
        sortProjects(isAscending);
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
    }
};

// Função de pesquisa
const filterProjects = (searchTerm) => {
    const projects = document.querySelectorAll('.project-card');
    const normalizedTerm = searchTerm.toLowerCase().trim();
    
    projects.forEach(card => {
        const title = card.querySelector('.project-title').textContent.toLowerCase();
        const description = card.querySelector('.project-description').textContent.toLowerCase();
        
        if (title.includes(normalizedTerm) || description.includes(normalizedTerm)) {
            card.style.display = '';
            card.style.animation = 'fadeIn 0.5s ease-out';
        } else {
            card.style.display = 'none';
        }
    });
    
    clearSearch.classList.toggle('visible', searchTerm.length > 0);
};

// Event Listeners
newProjectBtn.addEventListener('click', () => {
    projectModal.show();
});

logoutBtn.addEventListener('click', () => {
    user.clear();
});

themeToggle.checked = theme.current === 'dark';
themeToggle.addEventListener('change', (e) => {
    const isDark = theme.toggle() === 'dark';
    applyBackground('#007AFF', isDark);
});

projectSearch.addEventListener('input', (e) => filterProjects(e.target.value));

clearSearch.addEventListener('click', () => {
    projectSearch.value = '';
    filterProjects('');
    projectSearch.focus();
});

// Atalho de teclado para pesquisa
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        projectSearch.focus();
    }
});

// Event Listener para o botão de ordenação
sortButton.addEventListener('click', () => {
    isAscending = !isAscending;
    sortButton.classList.toggle('descending', !isAscending);
    sortButton.querySelector('span').textContent = isAscending ? 'A-Z' : 'Z-A';
    sortProjects(isAscending);
});

// Carrega os projetos ao iniciar
loadProjects();

// Após carregar os projetos
const defaultColor = '#007AFF';
const isDark = document.body.classList.contains('dark-theme');
applyBackground(defaultColor, isDark);
