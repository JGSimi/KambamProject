export default class MenuLateral {
    constructor(onAddProject, onSelectProject, onEditProject, onDeleteProject) {
        this.onAddProject = onAddProject;
        this.onSelectProject = onSelectProject;
        this.onEditProject = onEditProject;
        this.onDeleteProject = onDeleteProject;
        this.selectedProjectId = null;
        this.isMobile = window.innerWidth < 768;
    }

    render() {
        const menuElement = document.createElement('nav');
        menuElement.className = `menu-lateral glass fade-in-up ${this.isMobile ? 'menu-mobile' : ''}`;
        
        menuElement.innerHTML = `
            <div class="menu-header p-responsive flex flex-between flex-center ${this.isMobile ? 'hide-mobile' : ''}">
                <h2 class="text-responsive">Projetos</h2>
                <button class="menu-btn add-project touch-target" title="Novo Projeto">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="projects-list custom-scrollbar"></div>
            <div class="mobile-menu flex flex-center ${!this.isMobile ? 'hide-desktop' : ''}">
                <button class="mobile-menu-btn touch-target" title="Projetos">
                    <i class="fas fa-folder"></i>
                    <span class="hide-mobile">Projetos</span>
                </button>
                <button class="mobile-menu-btn touch-target" title="Novo Projeto">
                    <i class="fas fa-plus"></i>
                    <span class="hide-mobile">Novo</span>
                </button>
                <button class="mobile-menu-btn touch-target" title="Configurações">
                    <i class="fas fa-cog"></i>
                    <span class="hide-mobile">Configurações</span>
                </button>
                <button class="mobile-menu-btn touch-target" title="Perfil">
                    <i class="fas fa-user"></i>
                    <span class="hide-mobile">Perfil</span>
                </button>
            </div>
        `;

        this.element = menuElement;
        this.setupEventListeners();
        this.setupResponsiveLayout();
        return menuElement;
    }

    renderProject(project) {
        const isSelected = project.Id === this.selectedProjectId;
        return `
            <div class="project-item ${isSelected ? 'selected' : ''}" data-project-id="${project.Id}">
                <div class="project-color" style="background-color: ${project.HexaBackgroundCoor || '#007AFF'}"></div>
                <div class="project-info flex-grow">
                    <h3 class="project-name text-responsive">${project.Name}</h3>
                    <p class="project-description text-responsive ${this.isMobile ? 'hide-mobile' : ''}">${project.Description || ''}</p>
                </div>
                <div class="project-actions flex flex-center">
                    <button class="project-btn edit-project touch-target" title="Editar Projeto">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="project-btn delete-project touch-target" title="Excluir Projeto">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    updateProjects(projects) {
        const projectsList = this.element.querySelector('.projects-list');
        projectsList.innerHTML = projects.map(project => this.renderProject(project)).join('');
        this.setupProjectEventListeners();
    }

    setupEventListeners() {
        const addProjectBtn = this.element.querySelector('.add-project');
        const mobileMenuBtns = this.element.querySelectorAll('.mobile-menu-btn');

        addProjectBtn?.addEventListener('click', () => this.onAddProject());

        // Adiciona feedback visual para interações touch
        mobileMenuBtns.forEach(btn => {
            btn.addEventListener('touchstart', () => btn.classList.add('active'));
            btn.addEventListener('touchend', () => btn.classList.remove('active'));
            
            // Adiciona feedback visual para hover em desktop
            btn.addEventListener('mouseenter', () => {
                if (!this.isMobile) btn.classList.add('hover');
            });
            btn.addEventListener('mouseleave', () => {
                if (!this.isMobile) btn.classList.remove('hover');
            });
        });

        // Configura os botões do menu mobile
        mobileMenuBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.title.toLowerCase();
                switch(action) {
                    case 'projetos':
                        this.toggleProjectsList();
                        break;
                    case 'novo projeto':
                        this.onAddProject();
                        break;
                    case 'configurações':
                        // Implementar configurações
                        break;
                    case 'perfil':
                        // Implementar perfil
                        break;
                }
            });
        });
    }

    setupProjectEventListeners() {
        const projectItems = this.element.querySelectorAll('.project-item');
        
        projectItems.forEach(item => {
            const projectId = item.dataset.projectId;
            const editBtn = item.querySelector('.edit-project');
            const deleteBtn = item.querySelector('.delete-project');

            item.addEventListener('click', (e) => {
                if (!e.target.closest('.project-actions')) {
                    this.selectProject(projectId);
                    if (this.isMobile) {
                        this.toggleProjectsList();
                    }
                }
            });

            editBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onEditProject(projectId);
            });

            deleteBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onDeleteProject(projectId);
            });
        });
    }

    setupResponsiveLayout() {
        // Função para atualizar o estado mobile/desktop
        const updateLayout = () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth < 768;

            // Só atualiza se houve mudança no estado
            if (wasMobile !== this.isMobile) {
                this.element.classList.toggle('menu-mobile', this.isMobile);
                document.body.classList.toggle('has-mobile-menu', this.isMobile);
                
                // Atualiza visibilidade dos elementos
                const mobileElements = this.element.querySelectorAll('.hide-mobile');
                const desktopElements = this.element.querySelectorAll('.hide-desktop');
                
                mobileElements.forEach(el => {
                    el.style.display = this.isMobile ? 'none' : '';
                });
                
                desktopElements.forEach(el => {
                    el.style.display = this.isMobile ? '' : 'none';
                });

                // Fecha a lista de projetos ao mudar para mobile
                if (this.isMobile) {
                    this.element.classList.remove('show-projects');
                }
            }
        };

        // Atualiza o layout inicialmente
        updateLayout();

        // Adiciona listener para redimensionamento da janela
        window.addEventListener('resize', () => {
            requestAnimationFrame(updateLayout);
        });
    }

    selectProject(projectId) {
        this.selectedProjectId = projectId;
        const projectItems = this.element.querySelectorAll('.project-item');
        projectItems.forEach(item => {
            item.classList.toggle('selected', item.dataset.projectId === projectId);
        });
        this.onSelectProject(projectId);
    }

    toggleProjectsList() {
        if (!this.isMobile) return;
        this.element.classList.toggle('show-projects');
        
        // Adiciona/remove classe no body para prevenir scroll
        document.body.classList.toggle('modal-open', this.element.classList.contains('show-projects'));
    }
}
