export default class Task {
    constructor(task, onEdit, onDelete) {
        this.task = task;
        this.onEdit = onEdit;
        this.onDelete = onDelete;
    }

    render() {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card glass fade-in-up';
        taskElement.draggable = true;
        taskElement.dataset.taskId = this.task.Id;
        
        taskElement.innerHTML = `
            <div class="task-content p-responsive">
                <h4 class="task-title text-responsive">${this.task.Title}</h4>
                <p class="task-description text-responsive">${this.task.Description || ''}</p>
                ${this.renderPriority()}
                ${this.renderDueDate()}
            </div>
            <div class="task-actions flex flex-center">
                <button class="task-btn edit-task touch-target" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn delete-task touch-target" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        this.setupEventListeners(taskElement);
        return taskElement;
    }

    renderPriority() {
        if (!this.task.Priority) return '';
        const priorityColors = {
            high: 'var(--priority-high)',
            medium: 'var(--priority-medium)',
            low: 'var(--priority-low)'
        };
        return `
            <div class="task-priority flex flex-center" style="color: ${priorityColors[this.task.Priority.toLowerCase()]}">
                <i class="fas fa-flag"></i>
                <span>${this.task.Priority}</span>
            </div>
        `;
    }

    renderDueDate() {
        if (!this.task.DueDate) return '';
        const date = new Date(this.task.DueDate);
        const formattedDate = date.toLocaleDateString('pt-BR');
        return `
            <div class="task-due-date flex flex-center">
                <i class="fas fa-calendar-alt"></i>
                <span>${formattedDate}</span>
            </div>
        `;
    }

    setupEventListeners(element) {
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', this.task.Id);
            element.classList.add('dragging');
            // Adiciona efeito de feedback visual durante o drag
            requestAnimationFrame(() => {
                element.style.opacity = '0.6';
                element.style.transform = 'scale(1.02)';
            });
        });

        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
            // Remove o efeito visual
            element.style.opacity = '';
            element.style.transform = '';
        });

        const editBtn = element.querySelector('.edit-task');
        const deleteBtn = element.querySelector('.delete-task');

        // Adiciona feedback visual para interações touch
        [editBtn, deleteBtn].forEach(btn => {
            btn.addEventListener('touchstart', () => btn.classList.add('active'));
            btn.addEventListener('touchend', () => btn.classList.remove('active'));
        });

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onEdit(this.task);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onDelete(this.task.Id);
        });

        // Adiciona interação de hover suave
        element.addEventListener('mouseenter', () => {
            element.classList.add('task-hover');
        });

        element.addEventListener('mouseleave', () => {
            element.classList.remove('task-hover');
        });
    }
}
