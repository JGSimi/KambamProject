export default class Coluna {
    constructor(column, onDelete, onAddTask, onEdit) {
        this.column = column;
        this.onDelete = onDelete;
        this.onAddTask = onAddTask;
        this.onEdit = onEdit;
    }

    render() {
        const columnElement = document.createElement('div');
        columnElement.className = 'kanban-column';
        columnElement.dataset.columnId = this.column.Id;
        
        columnElement.innerHTML = `
            <div class="column-header">
                <h3 class="column-title">${this.column.Name}</h3>
                <div class="column-actions">
                    <button class="column-btn add-task" title="Adicionar Tarefa">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="column-btn edit-column" title="Editar Coluna">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="column-btn delete-column" title="Excluir Coluna">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="task-list" data-column-id="${this.column.Id}"></div>
        `;

        this.setupEventListeners(columnElement);
        return columnElement;
    }

    setupEventListeners(element) {
        const addTaskBtn = element.querySelector('.add-task');
        const editColumnBtn = element.querySelector('.edit-column');
        const deleteColumnBtn = element.querySelector('.delete-column');
        const taskList = element.querySelector('.task-list');
        
        addTaskBtn.addEventListener('click', () => this.onAddTask(this.column.Id));
        editColumnBtn.addEventListener('click', () => this.onEdit(this.column));
        deleteColumnBtn.addEventListener('click', () => this.onDelete(this.column.Id));
        
        this.setupDragAndDrop(taskList);
    }

    setupDragAndDrop(taskList) {
        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            taskList.classList.add('drag-over');
        });
        
        taskList.addEventListener('dragleave', () => {
            taskList.classList.remove('drag-over');
        });
        
        taskList.addEventListener('drop', (e) => {
            e.preventDefault();
            taskList.classList.remove('drag-over');
            const taskId = e.dataTransfer.getData('text/plain');
            if (taskId) {
                this.onTaskDropped(taskId, this.column.Id);
            }
        });
    }
}
