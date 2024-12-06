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
        modal.className = `modal modal-${this.size}`;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${this.title}</h2>
                    <button class="close-btn" title="Fechar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${this.content}
                </div>
                <div class="modal-actions">
                    <button type="button" class="cancel-btn">
                        <i class="fas fa-times"></i>
                        ${this.cancelText}
                    </button>
                    <button type="submit" class="submit-btn">
                        <i class="fas fa-check"></i>
                        ${this.submitText}
                    </button>
                </div>
            </div>
        `;

        this.element = modal;
        this.setupEventListeners();
        document.body.appendChild(modal);
    }

    setupEventListeners() {
        const closeBtn = this.element.querySelector('.close-btn');
        const cancelBtn = this.element.querySelector('.cancel-btn');
        const submitBtn = this.element.querySelector('.submit-btn');
        const modalContent = this.element.querySelector('.modal-content');

        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.onSubmit(this.getFormData());
        });

        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) this.close();
        });

        // Animação de entrada
        requestAnimationFrame(() => {
            modalContent.style.transform = 'translateY(0)';
            modalContent.style.opacity = '1';
        });
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
        });
    }

    close() {
        const modalContent = this.element.querySelector('.modal-content');
        modalContent.style.transform = 'translateY(20px)';
        modalContent.style.opacity = '0';

        setTimeout(() => {
            this.element.classList.remove('show');
            this.onClose();
        }, 300);
    }

    static createTaskModal(onSubmit) {
        return new Modal({
            title: 'Nova Tarefa',
            content: `
                <form id="taskForm">
                    <div class="form-group">
                        <label for="taskTitle">Título</label>
                        <input type="text" id="taskTitle" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="taskDescription">Descrição</label>
                        <textarea id="taskDescription" name="description" rows="3"></textarea>
                    </div>
                </form>
            `,
            onSubmit,
            submitText: 'Criar Tarefa'
        });
    }

    static createColumnModal(onSubmit) {
        return new Modal({
            title: 'Nova Coluna',
            content: `
                <form id="columnForm">
                    <div class="form-group">
                        <label for="columnName">Nome da Coluna</label>
                        <input type="text" id="columnName" name="name" required>
                    </div>
                </form>
            `,
            onSubmit,
            submitText: 'Criar Coluna',
            size: 'small'
        });
    }
}
