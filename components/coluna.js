export default class Coluna {
    constructor(column, onDelete, onAddTask, onEdit) {
        this.column = column;
        this.onDelete = onDelete;
        this.onAddTask = onAddTask;
        this.onEdit = onEdit;
    }

    render() {
        const columnElement = document.createElement('div');
        columnElement.className = 'kanban-column glass fade-in-up';
        columnElement.dataset.columnId = this.column.Id;
        
        columnElement.innerHTML = `
            <div class="column-header p-responsive flex flex-between flex-center">
                <h3 class="column-title text-responsive">${this.column.Name}</h3>
                <div class="column-actions flex flex-center">
                    <button class="column-btn add-task touch-target" title="Adicionar Tarefa">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="column-btn edit-column touch-target" title="Editar Coluna">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="column-btn delete-column touch-target" title="Excluir Coluna">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="task-list p-responsive" data-column-id="${this.column.Id}"></div>
        `;

        this.setupEventListeners(columnElement);
        this.setupResponsiveLayout(columnElement);
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
        
        // Adiciona feedback visual para interações touch
        const buttons = element.querySelectorAll('.column-btn');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', () => btn.classList.add('active'));
            btn.addEventListener('touchend', () => btn.classList.remove('active'));
        });
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

    setupResponsiveLayout(element) {
        // Observador de redimensionamento para ajustes responsivos
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const width = entry.contentRect.width;
                if (width < 576) {
                    element.classList.add('column-mobile');
                } else {
                    element.classList.remove('column-mobile');
                }
            }
        });

        resizeObserver.observe(element);
    }
}
