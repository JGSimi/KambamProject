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
        this.position = options.position || 'center';
        this.animation = options.animation || 'fade';
        this.backgroundImage = options.backgroundImage || null;
        this.validationRules = options.validationRules || {};
        this.customFormComponents = options.customFormComponents || {};
        this.element = null;
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.touchDiff = 0;
        this.isClosing = false;
        this.scrollLock = false;
        
        if (!document.getElementById('modal-styles')) {
            this.addStyles();
        }
    }

    addStyles() {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(8px);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 1000;
            }

            .modal.show {
                opacity: 1;
            }

            .modal-content {
                position: relative;
                width: 90%;
                max-width: 500px;
                background: var(--card-background);
                backdrop-filter: blur(20px) saturate(180%);
                border-radius: 16px;
                box-shadow: 0 8px 32px var(--shadow-color);
                transform: translateY(20px) scale(0.95);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                overflow: hidden;
                border: 1px solid var(--border-color);
            }

            .modal.show .modal-content {
                transform: translateY(0) scale(1);
                opacity: 1;
            }

            .modal-header {
                position: relative;
                padding: 20px 24px;
                border-bottom: 1px solid var(--border-color);
                background: var(--card-background);
            }

            .modal-header h2 {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--text-color);
            }

            .modal-drag-handle {
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 40px;
                height: 4px;
                background: var(--border-color);
                border-radius: 2px;
                margin: 8px 0;
            }

            .modal-body {
                padding: 24px;
                max-height: calc(100vh - 200px);
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                color: var(--text-color);
            }

            .modal-body::-webkit-scrollbar {
                width: 8px;
            }

            .modal-body::-webkit-scrollbar-track {
                background: var(--border-color);
                border-radius: 4px;
            }

            .modal-body::-webkit-scrollbar-thumb {
                background: var(--text-secondary);
                border-radius: 4px;
            }

            .modal-actions {
                padding: 16px 24px;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                border-top: 1px solid var(--border-color);
                background: var(--card-background);
            }

            .modal button {
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 500;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                border: none;
                cursor: pointer;
            }

            .modal button i {
                font-size: 1rem;
            }

            .close-btn {
                position: absolute;
                right: 16px;
                top: 16px;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--border-color);
                border: none;
                cursor: pointer;
                transition: all 0.2s ease;
                color: var(--text-color);
            }

            .close-btn:hover {
                background: var(--hover-shadow);
                transform: scale(1.1);
            }

            .cancel-btn {
                background: var(--border-color);
                color: var(--text-color);
            }

            .cancel-btn:hover {
                background: var(--hover-shadow);
                transform: scale(1.02);
            }

            .submit-btn {
                background: var(--primary-color);
                color: white;
            }

            .submit-btn:hover {
                filter: brightness(1.1);
                transform: scale(1.02);
            }

            .modal input,
            .modal textarea,
            .modal select {
                width: 100%;
                padding: 12px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                margin-bottom: 16px;
                font-size: 1rem;
                background: var(--card-background);
                color: var(--text-color);
                transition: all 0.2s ease;
            }

            .modal input:focus,
            .modal textarea:focus,
            .modal select:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px var(--shadow-color);
            }

            .modal label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: var(--text-color);
            }

            .modal .form-error {
                color: #FF3B30;
                font-size: 0.85rem;
                margin-top: -12px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .modal .form-error::before {
                content: "!";
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 16px;
                height: 16px;
                background: #FF3B30;
                color: white;
                border-radius: 50%;
                font-size: 0.75rem;
                font-weight: bold;
            }

            .modal input.error {
                border-color: #FF3B30;
                background: rgba(255, 59, 48, 0.05);
            }

            .modal input[type="color"] {
                height: 40px;
                padding: 4px;
                cursor: pointer;
            }

            .modal select {
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8.825L1.175 4 2.238 2.938 6 6.7l3.763-3.762L10.825 4z'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 12px center;
                padding-right: 36px;
            }

            @media (max-width: 768px) {
                .modal-content {
                    width: 100%;
                    max-width: none;
                    margin: 16px;
                    border-radius: 12px;
                }

                .modal-body {
                    max-height: calc(100vh - 180px);
                }
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-4px); }
                75% { transform: translateX(4px); }
            }

            .modal .error-shake {
                animation: shake 0.4s ease-in-out;
            }

            .modal-mobile {
                margin: 0;
                border-radius: 20px 20px 0 0;
                height: 85vh;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                transform: translateY(100%);
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .modal.show .modal-mobile {
                transform: translateY(0);
            }

            .modal .form-group {
                margin-bottom: 20px;
            }

            .modal .form-group:last-child {
                margin-bottom: 0;
            }

            /* Position variants */
            .modal-right .modal-content {
                margin-left: auto;
                height: 100vh;
                border-radius: 16px 0 0 16px;
                transform: translateX(100%);
            }

            .modal-left .modal-content {
                margin-right: auto;
                height: 100vh;
                border-radius: 0 16px 16px 0;
                transform: translateX(-100%);
            }

            .modal-bottom .modal-content {
                margin-top: auto;
                border-radius: 16px 16px 0 0;
                transform: translateY(100%);
            }

            /* Size variants */
            .modal-small .modal-content { max-width: 400px; }
            .modal-medium .modal-content { max-width: 600px; }
            .modal-large .modal-content { max-width: 800px; }
            .modal-fullscreen .modal-content {
                width: 100%;
                height: 100%;
                max-width: none;
                border-radius: 0;
            }

            /* Animation variants */
            .animation-fade .modal-content {
                opacity: 0;
                transform: scale(0.95);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .animation-slide.modal-right .modal-content {
                transform: translateX(100%);
            }

            .animation-slide.modal-left .modal-content {
                transform: translateX(-100%);
            }

            .animation-slide.modal-bottom .modal-content {
                transform: translateY(100%);
            }

            .animation-scale .modal-content {
                transform: scale(0.7);
                opacity: 0;
            }

            .modal.show .modal-content {
                transform: none;
                opacity: 1;
            }

            /* Background image support */
            .modal-content[style*="background-image"] {
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
            }

            /* Toast notifications */
            .modal-toast {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(100%);
                background: var(--card-background);
                padding: 12px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px var(--shadow-color);
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 1100;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .modal-toast.show {
                transform: translateX(-50%) translateY(0);
            }

            .modal-toast i {
                font-size: 1.2rem;
            }

            .toast-success { border-left: 4px solid #34C759; }
            .toast-error { border-left: 4px solid #FF3B30; }
            .toast-warning { border-left: 4px solid #FF9500; }
            .toast-info { border-left: 4px solid #007AFF; }

            /* Custom form components */
            .form-group {
                margin-bottom: 20px;
                position: relative;
            }

            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: var(--text-color);
            }

            .form-control {
                width: 100%;
                padding: 12px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                background: var(--card-background);
                color: var(--text-color);
                transition: all 0.2s ease;
            }

            .form-control:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px var(--shadow-color);
            }

            .form-error-message {
                color: #FF3B30;
                font-size: 0.85rem;
                margin-top: 4px;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            /* Keyboard navigation */
            .modal *:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
                border-radius: 4px;
            }

            /* Touch feedback */
            @media (hover: none) {
                .modal button:active {
                    transform: scale(0.95);
                }
            }
        `;
        document.head.appendChild(style);
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = this.id;
        modal.className = `modal modal-${this.size} modal-${this.position} animation-${this.animation}`;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `${this.id}-title`);
        
        const backgroundStyle = this.backgroundImage ? 
            `style="background-image: url('${this.backgroundImage}');"` : '';
        
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content glass" role="document" ${backgroundStyle}>
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
        this.setupCustomFormComponents();
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

        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;

        const handleTouchStart = (e) => {
            if (this.scrollLock) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            currentX = startX;
            currentY = startY;
            isDragging = true;
            modalContent.classList.add('swiping');
            modalContent.style.transition = 'none';
        };

        const handleTouchMove = (e) => {
            if (!isDragging || this.scrollLock) return;
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
            const diffX = currentX - startX;
            const diffY = currentY - startY;

            if (this.position === 'bottom' && diffY > 0) {
                modalContent.style.transform = `translateY(${diffY}px)`;
                this.element.style.backgroundColor = `rgba(0, 0, 0, ${0.5 - diffY/1000})`;
            } else if (this.position === 'right' && diffX < 0) {
                modalContent.style.transform = `translateX(${diffX}px)`;
                this.element.style.backgroundColor = `rgba(0, 0, 0, ${0.5 + diffX/1000})`;
            } else if (this.position === 'left' && diffX > 0) {
                modalContent.style.transform = `translateX(${diffX}px)`;
                this.element.style.backgroundColor = `rgba(0, 0, 0, ${0.5 - diffX/1000})`;
            }
        };

        const handleTouchEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            modalContent.classList.remove('swiping');
            modalContent.style.transition = '';

            const diffX = currentX - startX;
            const diffY = currentY - startY;
            const threshold = window.innerWidth * 0.3;

            if (
                (this.position === 'bottom' && diffY > threshold) ||
                (this.position === 'right' && diffX < -threshold) ||
                (this.position === 'left' && diffX > threshold)
            ) {
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
        const errors = {};

        inputs.forEach(input => {
            const rules = this.validationRules[input.name];
            if (!rules) return;

            const value = input.value.trim();
            const fieldErrors = [];

            rules.forEach(rule => {
                if (rule.required && !value) {
                    fieldErrors.push('Este campo é obrigatório');
                }
                if (rule.minLength && value.length < rule.minLength) {
                    fieldErrors.push(`Mínimo de ${rule.minLength} caracteres`);
                }
                if (rule.maxLength && value.length > rule.maxLength) {
                    fieldErrors.push(`Máximo de ${rule.maxLength} caracteres`);
                }
                if (rule.pattern && !rule.pattern.test(value)) {
                    fieldErrors.push(rule.message || 'Formato inválido');
                }
                if (rule.custom && !rule.custom(value)) {
                    fieldErrors.push(rule.message || 'Valor inválido');
                }
            });

            if (fieldErrors.length > 0) {
                isValid = false;
                errors[input.name] = fieldErrors;
                this.showError(input, fieldErrors[0]);
            }
        });

        return { isValid, errors };
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

    setupCustomFormComponents() {
        Object.entries(this.customFormComponents).forEach(([selector, component]) => {
            const container = this.element.querySelector(selector);
            if (container) {
                component.render(container);
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `modal-toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        });
    }

    getToastIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }
}
