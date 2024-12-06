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
            <div class="task-header">
                <h4 class="task-title">${this.task.Title}</h4>
                <div class="task-actions">
                    <button class="task-btn edit-btn" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn delete-btn" title="Excluir">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <p class="task-description">${this.task.Description || ''}</p>
        `;

        // Event Listeners para drag and drop
        taskElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', this.task.Id);
            taskElement.classList.add('dragging');
        });

        taskElement.addEventListener('dragend', () => {
            taskElement.classList.remove('dragging');
        });

        // Botões de ação
        const editBtn = taskElement.querySelector('.edit-btn');
        const deleteBtn = taskElement.querySelector('.delete-btn');

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onEdit(this.task);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onDelete(this.task.Id);
        });

        return taskElement;
    }
}
