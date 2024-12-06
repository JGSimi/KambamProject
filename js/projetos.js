import requests from '../service/request.js';
import user from '../service/user.js';
import theme from '../service/theme.js';

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

// Carrega os projetos
const loadProjects = async () => {
    try {
        const projects = await requests.GetBoards();
        projectsGrid.innerHTML = '';
        
        if (projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>Nenhum projeto encontrado</h3>
                    <p>Crie seu primeiro projeto clicando no botão acima</p>
                </div>
            `;
            return;
        }
        
        projects.forEach(project => {
            projectsGrid.appendChild(createProjectCard(project));
        });
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
    }
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
themeToggle.addEventListener('change', () => {
    theme.toggle();
});

// Carrega os projetos ao iniciar
loadProjects();
