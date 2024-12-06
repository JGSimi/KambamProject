export default class Task {
    constructor(task, onEdit, onDelete) {
        this.task = task;
        this.onEdit = onEdit;
        this.onDelete = onDelete;
    }

    render() {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.draggable = true;
        taskElement.dataset.taskId = this.task.Id;
        
        taskElement.innerHTML = `
            <div class="task-content">
                <h4 class="task-title">${this.task.Title}</h4>
                <p class="task-description">${this.task.Description || ''}</p>
            </div>
            <div class="task-actions">
                <button class="task-btn edit-task" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn delete-task" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        this.setupEventListeners(taskElement);
        return taskElement;
    }

    setupEventListeners(element) {
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', this.task.Id);
            element.classList.add('dragging');
        });

        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
        });

        const editBtn = element.querySelector('.edit-task');
        const deleteBtn = element.querySelector('.delete-task');

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onEdit(this.task);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onDelete(this.task.Id);
        });
    }
}
