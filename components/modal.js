export default class Modal {
    constructor(options = {}) {
        this.id = options.id || `modal-${Math.random().toString(36).substr(2, 9)}`;
        this.title = options.title || '';
        this.content = options.content || '';
        this.onSubmit = options.onSubmit || (() => {});
        this.onClose = options.onClose || (() => {});
        this.submitText = options.submitText || 'Salvar';
        this.cancelText = options.cancelText || 'Cancelar';
        this.size = options.size || 'medium'; // small, medium, large
        this.element = null;
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = this.id;
        modal.className = `modal modal-${this.size} fade-in-up`;
        
        modal.innerHTML = `
            <div class="modal-content glass">
                <div class="modal-header p-responsive flex flex-between flex-center">
                    <h2 class="text-responsive">${this.title}</h2>
                    <button class="close-btn touch-target" title="Fechar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body p-responsive">
                    ${this.content}
                </div>
                <div class="modal-actions p-responsive flex flex-center">
                    <button type="button" class="cancel-btn touch-target">
                        <i class="fas fa-times"></i>
                        ${this.cancelText}
                    </button>
                    <button type="submit" class="submit-btn touch-target">
                        <i class="fas fa-check"></i>
                        ${this.submitText}
                    </button>
                </div>
            </div>
        `;

        this.element = modal;
        this.setupEventListeners();
        document.body.appendChild(modal);
        this.setupResponsiveLayout();
    }

    setupEventListeners() {
        const closeBtn = this.element.querySelector('.close-btn');
        const cancelBtn = this.element.querySelector('.cancel-btn');
        const submitBtn = this.element.querySelector('.submit-btn');
        const modalContent = this.element.querySelector('.modal-content');

        // Adiciona feedback visual para interações touch
        [closeBtn, cancelBtn, submitBtn].forEach(btn => {
            btn.addEventListener('touchstart', () => btn.classList.add('active'));
            btn.addEventListener('touchend', () => btn.classList.remove('active'));
        });

        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.onSubmit(this.getFormData());
        });

        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) this.close();
        });

        // Animação de entrada aprimorada
        requestAnimationFrame(() => {
            modalContent.style.transform = 'translateY(0) scale(1)';
            modalContent.style.opacity = '1';
            this.element.style.backdropFilter = 'blur(10px)';
        });
    }

    setupResponsiveLayout() {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const width = entry.contentRect.width;
                const modalContent = this.element.querySelector('.modal-content');
                
                if (width < 576) {
                    modalContent.classList.add('modal-mobile');
                    this.adjustMobileLayout();
                } else {
                    modalContent.classList.remove('modal-mobile');
                    this.adjustDesktopLayout();
                }
            }
        });

        resizeObserver.observe(this.element);
    }

    adjustMobileLayout() {
        const modalContent = this.element.querySelector('.modal-content');
        modalContent.style.width = '100%';
        modalContent.style.margin = '0';
        modalContent.style.borderRadius = '20px 20px 0 0';
        modalContent.style.height = '85vh';
    }

    adjustDesktopLayout() {
        const modalContent = this.element.querySelector('.modal-content');
        modalContent.style.width = '';
        modalContent.style.margin = '';
        modalContent.style.borderRadius = '';
        modalContent.style.height = '';
    }

    getFormData() {
        const form = this.element.querySelector('form');
        if (!form) return null;
        return Object.fromEntries(new FormData(form));
    }

    show() {
        if (!this.element) {
            this.createModal();
        }
        requestAnimationFrame(() => {
            this.element.classList.add('show');
            document.body.style.overflow = 'hidden'; // Previne scroll do body
        });
    }

    close() {
        const modalContent = this.element.querySelector('.modal-content');
        modalContent.style.transform = 'translateY(20px) scale(0.95)';
        modalContent.style.opacity = '0';
        this.element.style.backdropFilter = 'blur(0px)';

        setTimeout(() => {
            this.element.classList.remove('show');
            document.body.style.overflow = ''; // Restaura scroll do body
            this.onClose();
        }, 300);
    }

    static createTaskModal(onSubmit, existingTask = null) {
        return new Modal({
            title: existingTask ? 'Editar Tarefa' : 'Nova Tarefa',
            content: `
                <form id="taskForm" class="responsive-form">
                    <div class="form-group">
                        <label for="taskTitle" class="text-responsive">Título</label>
                        <input type="text" 
                               id="taskTitle" 
                               name="title" 
                               class="touch-target"
                               value="${existingTask?.Title || ''}"
                               required>
                    </div>
                    <div class="form-group">
                        <label for="taskDescription" class="text-responsive">Descrição</label>
                        <textarea id="taskDescription" 
                                  name="description"
                                  class="touch-target"
                                  rows="3">${existingTask?.Description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="taskPriority" class="text-responsive">Prioridade</label>
                        <select id="taskPriority" 
                                name="priority"
                                class="touch-target">
                            <option value="low" ${existingTask?.Priority === 'low' ? 'selected' : ''}>Baixa</option>
                            <option value="medium" ${existingTask?.Priority === 'medium' ? 'selected' : ''}>Média</option>
                            <option value="high" ${existingTask?.Priority === 'high' ? 'selected' : ''}>Alta</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="taskDueDate" class="text-responsive">Data de Entrega</label>
                        <input type="date"
                               id="taskDueDate"
                               name="dueDate"
                               class="touch-target"
                               value="${existingTask?.DueDate || ''}">
                    </div>
                </form>
            `,
            onSubmit,
            submitText: existingTask ? 'Salvar Alterações' : 'Criar Tarefa'
        });
    }

    static createColumnModal(onSubmit, existingColumn = null) {
        return new Modal({
            title: existingColumn ? 'Editar Coluna' : 'Nova Coluna',
            content: `
                <form id="columnForm" class="responsive-form">
                    <div class="form-group">
                        <label for="columnName" class="text-responsive">Nome da Coluna</label>
                        <input type="text" 
                               id="columnName" 
                               name="name"
                               class="touch-target"
                               value="${existingColumn?.Name || ''}"
                               required>
                    </div>
                </form>
            `,
            onSubmit,
            submitText: existingColumn ? 'Salvar Alterações' : 'Criar Coluna',
            size: 'small'
        });
    }

    static createProjectModal(onSubmit, existingProject = null) {
        return new Modal({
            title: existingProject ? 'Editar Projeto' : 'Novo Projeto',
            content: `
                <form id="projectForm" class="responsive-form">
                    <div class="form-group">
                        <label for="projectName" class="text-responsive">Nome do Projeto</label>
                        <input type="text" 
                               id="projectName" 
                               name="name"
                               class="touch-target"
                               value="${existingProject?.Name || ''}"
                               required>
                    </div>
                    <div class="form-group">
                        <label for="projectDescription" class="text-responsive">Descrição</label>
                        <textarea id="projectDescription" 
                                name="description"
                                class="touch-target"
                                rows="3">${existingProject?.Description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="projectColor" class="text-responsive">Cor do Projeto</label>
                        <input type="color" 
                               id="projectColor" 
                               name="color"
                               class="touch-target"
                               value="${existingProject?.HexaBackgroundCoor || '#007AFF'}">
                    </div>
                </form>
            `,
            onSubmit,
            submitText: existingProject ? 'Salvar Alterações' : 'Criar Projeto'
        });
    }
}
