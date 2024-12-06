import requests from '../service/request.js';
import user from '../service/user.js';
import theme from '../service/theme.js';
import { applyBackground } from './backgroundManager.js';

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
const projectModal = document.getElementById('projectModal');
const projectForm = document.getElementById('projectForm');
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
    projectModal.classList.add('show');
});

projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDescription').value;
    const color = document.getElementById('projectColor').value;
    
    try {
        await requests.CreateBoard({
            Name: name,
            Description: description,
            HexaBackgroundCoor: color,
            IsActive: true,
            CreatedBy: user.Id,
            UpdatedBy: user.Id
        });
        
        projectModal.classList.remove('show');
        projectForm.reset();
        loadProjects();
    } catch (error) {
        console.error('Erro ao criar projeto:', error);
    }
});

document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        projectModal.classList.remove('show');
        projectForm.reset();
    });
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
