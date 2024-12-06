export default class Coluna {
    constructor(column, onDelete, onAddTask, onEdit, onTaskMove) {
        this.column = column;
        this.onDelete = onDelete;
        this.onAddTask = onAddTask;
        this.onEdit = onEdit;
        this.onTaskMove = onTaskMove;
    }

    render() {
        const columnElement = document.createElement('div');
        columnElement.className = 'kanban-column';
        columnElement.dataset.columnId = this.column.Id;
        
        columnElement.innerHTML = `
            <div class="column-header">
                <h3>${this.column.Name}</h3>
                <div class="column-actions">
                    <button class="column-btn edit-btn" title="Editar coluna">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="column-btn delete-btn" title="Excluir coluna">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="task-list"></div>
            <button class="add-task-btn">
                <i class="fas fa-plus"></i>
                Adicionar Tarefa
            </button>
        `;

        // Event Listeners para drag and drop
        const taskList = columnElement.querySelector('.task-list');
        
        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (!draggable) return;
            
            const afterElement = this.getDragAfterElement(taskList, e.clientY);
            if (afterElement) {
                taskList.insertBefore(draggable, afterElement);
            } else {
                taskList.appendChild(draggable);
            }
        });

        taskList.addEventListener('drop', async (e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            const newColumnId = this.column.Id;
            
            if (this.onTaskMove) {
                await this.onTaskMove(taskId, newColumnId);
            }
        });

        // Botões de ação
        const addTaskBtn = columnElement.querySelector('.add-task-btn');
        const editBtn = columnElement.querySelector('.edit-btn');
        const deleteBtn = columnElement.querySelector('.delete-btn');

        addTaskBtn.addEventListener('click', () => this.onAddTask(this.column.Id));
        editBtn.addEventListener('click', () => this.onEdit(this.column));
        deleteBtn.addEventListener('click', () => this.onDelete(this.column.Id));

        return columnElement;
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}
