export default class Modal {
    constructor(options = {}) {
        this.id = options.id || `modal-${Math.random().toString(36).substr(2, 9)}`;
        this.title = options.title || '';
        this.content = options.content || '';
        this.onSubmit = options.onSubmit || (() => {});
        this.onClose = options.onClose || (() => {});
        this.submitText = options.submitText || 'Salvar';
        this.cancelText = options.cancelText || 'Cancelar';
        this.size = options.size || 'medium';
        this.element = null;
        this.touchStartY = 0;
        this.touchDiff = 0;
        this.isClosing = false;
        this.scrollLock = false;
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = this.id;
        modal.className = `modal modal-${this.size} fade-in-up`;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `${this.id}-title`);
        
        modal.innerHTML = `
            <div class="modal-content glass" role="document">
                <div class="modal-header p-responsive flex flex-between flex-center">
                    <h2 class="text-responsive" id="${this.id}-title">${this.title}</h2>
                    <button class="close-btn touch-target" title="Fechar" aria-label="Fechar modal">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="modal-drag-handle"></div>
                <div class="modal-body p-responsive" role="main">
                    ${this.content}
                </div>
                <div class="modal-actions p-responsive flex flex-center">
                    <button type="button" class="cancel-btn touch-target" aria-label="${this.cancelText}">
                        <i class="fas fa-times" aria-hidden="true"></i>
                        ${this.cancelText}
                    </button>
                    <button type="submit" class="submit-btn touch-target" aria-label="${this.submitText}">
                        <i class="fas fa-check" aria-hidden="true"></i>
                        ${this.submitText}
                    </button>
                </div>
            </div>
        `;

        this.element = modal;
        this.setupEventListeners();
        document.body.appendChild(modal);
        this.setupResponsiveLayout();
        this.setupKeyboardNavigation();
        this.setupTouchGestures();
    }

    setupEventListeners() {
        const closeBtn = this.element.querySelector('.close-btn');
        const cancelBtn = this.element.querySelector('.cancel-btn');
        const submitBtn = this.element.querySelector('.submit-btn');
        const modalContent = this.element.querySelector('.modal-content');
        const form = this.element.querySelector('form');

        // Feedback visual e sonoro para interações
        [closeBtn, cancelBtn, submitBtn].forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.classList.add('active');
                this.playHapticFeedback();
            });
            btn.addEventListener('touchend', () => btn.classList.remove('active'));
        });

        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validateForm(form)) {
                    this.onSubmit(this.getFormData());
                }
            });
        }

        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const form = this.element.querySelector('form');
            if (!form || this.validateForm(form)) {
                this.onSubmit(this.getFormData());
            }
        });

        this.element.addEventListener('click', (e) => {
            if (e.target === this.element && !this.isClosing) this.close();
        });

        // Animação de entrada
        requestAnimationFrame(() => {
            modalContent.style.transform = 'translateY(0) scale(1)';
            modalContent.style.opacity = '1';
            this.element.style.backdropFilter = 'blur(10px)';
        });
    }

    setupTouchGestures() {
        const modalContent = this.element.querySelector('.modal-content');
        const dragHandle = this.element.querySelector('.modal-drag-handle');

        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        const handleTouchStart = (e) => {
            if (this.scrollLock) return;
            startY = e.touches[0].clientY;
            currentY = startY;
            isDragging = true;
            modalContent.classList.add('swiping');
            modalContent.style.transition = 'none';
        };

        const handleTouchMove = (e) => {
            if (!isDragging || this.scrollLock) return;
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;

            if (diff > 0) {
                const opacity = Math.max(0, 1 - diff / 500);
                modalContent.style.transform = `translateY(${diff}px)`;
                this.element.style.backgroundColor = `rgba(0, 0, 0, ${0.5 * opacity})`;
            }
        };

        const handleTouchEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            modalContent.classList.remove('swiping');
            modalContent.style.transition = '';

            const diff = currentY - startY;
            if (diff > 100) {
                this.close();
            } else {
                modalContent.style.transform = '';
                this.element.style.backgroundColor = '';
            }
        };

        dragHandle.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
    }

    setupKeyboardNavigation() {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !this.isClosing) {
                this.close();
            }

            if (e.key === 'Tab') {
                const focusableElements = this.element.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                this.showError(input, 'Este campo é obrigatório');
            } else if (input.type === 'email' && input.value && !this.isValidEmail(input.value)) {
                isValid = false;
                this.showError(input, 'Email inválido');
            }
        });

        return isValid;
    }

    showError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        
        const existingError = input.parentElement.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
        
        input.classList.add('error');
        input.parentElement.appendChild(errorDiv);
        
        input.addEventListener('input', () => {
            input.classList.remove('error');
            errorDiv.remove();
        }, { once: true });

        this.playHapticFeedback();
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    playHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    show() {
        if (!this.element) {
            this.createModal();
        }
        
        requestAnimationFrame(() => {
            this.element.classList.add('show');
            document.body.classList.add('modal-open');
            
            const firstInput = this.element.querySelector('input, button');
            if (firstInput) {
                firstInput.focus();
            }
        });
    }

    close() {
        if (this.isClosing) return;
        this.isClosing = true;

        const modalContent = this.element.querySelector('.modal-content');
        modalContent.style.transform = 'translateY(20px) scale(0.95)';
        modalContent.style.opacity = '0';
        this.element.style.backdropFilter = 'blur(0px)';

        setTimeout(() => {
            this.element.classList.remove('show');
            document.body.classList.remove('modal-open');
            this.onClose();
            this.isClosing = false;
        }, 300);
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
