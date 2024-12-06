import requests from '../service/request.js';
import user from '../service/user.js';
import theme from '../service/theme.js';
import Coluna from '../components/coluna.js';
import Task from '../components/task.js';
import Modal from '../components/modal.js';

// Verificações iniciais e configurações
if (!user.load()) {
    window.location.href = 'login.html';
}

theme.init();

const boardId = new URLSearchParams(window.location.search).get('boardId');
if (!boardId) window.location.href = 'projetos.html';

// Elementos DOM e handlers
const kanbanBoard = document.getElementById('kanbanBoard');
const projectName = document.getElementById('projectName');
const addColumnBtn = document.getElementById('addColumnBtn');

async function loadBoard() {
    try {
        const board = await requests.GetBoardById(boardId);
        projectName.textContent = board.Name;
        
        const columns = await requests.GetColumnsByBoardId(boardId);
        kanbanBoard.innerHTML = '';
        
        columns.forEach(async column => {
            const tasks = await requests.GetTasksByColumnId(column.Id);
            const colunaComponent = new Coluna(
                column,
                handleDeleteColumn,
                handleAddTask
            );
            
            const colunaElement = colunaComponent.render();
            const taskList = colunaElement.querySelector('.task-list');
            
            tasks.forEach(task => {
                const taskComponent = new Task(
                    task,
                    handleEditTask,
                    handleDeleteTask
                );
                taskList.appendChild(taskComponent.render());
            });
            
            kanbanBoard.appendChild(colunaElement);
        });
    } catch (error) {
        console.error('Erro ao carregar quadro:', error);
    }
}

// Handlers
async function handleDeleteColumn(columnId) {
    if (confirm('Tem certeza que deseja excluir esta coluna?')) {
        try {
            await requests.DeleteColumn(columnId);
            loadBoard();
        } catch (error) {
            console.error('Erro ao excluir coluna:', error);
        }
    }
}

async function handleAddTask(columnId) {
    const taskModal = Modal.createTaskModal(async (formData) => {
        try {
            await requests.CreateTask({
                Title: formData.title,
                Description: formData.description,
                ColumnId: columnId,
                CreatedBy: user.Id,
                UpdatedBy: user.Id
            });
            loadBoard();
        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
        }
    });
    taskModal.show();
}

async function handleEditTask(task) {
    // Implementar lógica do modal de edição
}

async function handleDeleteTask(taskId) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        try {
            await requests.DeleteTask(taskId);
            loadBoard();
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
        }
    }
}

// Event Listeners
addColumnBtn.addEventListener('click', () => {
    const columnModal = Modal.createColumnModal(async (formData) => {
        try {
            await requests.CreateColumn({
                Name: formData.name,
                BoardId: boardId,
                CreatedBy: user.Id,
                UpdatedBy: user.Id
            });
            loadBoard();
        } catch (error) {
            console.error('Erro ao criar coluna:', error);
        }
    });
    columnModal.show();
});

// Inicialização
loadBoard();
