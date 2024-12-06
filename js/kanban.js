import requests from '../service/request.js';
import user from '../service/user.js';
import theme from '../service/theme.js';
import Coluna from '../components/coluna.js';
import Task from '../components/task.js';
import Modal from '../components/modal.js';
import { applyBackground } from './backgroundManager.js';

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
const editBoardBtn = document.getElementById('editBoardBtn');
const deleteBoardBtn = document.getElementById('deleteBoardBtn');
const backButton = document.getElementById('backButton');

async function loadBoard() {
    try {
        const board = await requests.GetBoardById(boardId);
        projectName.textContent = board.Name;
        
        const color = board.HexaBackgroundCoor || '#007AFF';
        const isDark = document.body.classList.contains('dark-theme');
        applyBackground(color, isDark);
        
        const columns = await requests.GetColumnsByBoardId(boardId);
        kanbanBoard.innerHTML = '';
        
        columns.forEach(async column => {
            const tasks = await requests.GetTasksByColumnId(column.Id);
            const colunaComponent = new Coluna(
                column,
                handleDeleteColumn,
                handleAddTask,
                handleEditColumn
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
    const taskModal = Modal.createTaskModal(
        async (formData) => {
            try {
                await requests.UpdateTask({
                    ...task,
                    Title: formData.title,
                    Description: formData.description,
                    UpdatedBy: user.Id
                });
                loadBoard();
            } catch (error) {
                console.error('Erro ao atualizar tarefa:', error);
            }
        },
        task // Passando a task existente para preencher o modal
    );
    taskModal.show();
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

async function handleEditColumn(column) {
    const columnModal = Modal.createColumnModal(
        async (formData) => {
            try {
                await requests.UpdateColumn({
                    ...column,
                    Name: formData.name,
                    UpdatedBy: user.Id
                });
                loadBoard();
            } catch (error) {
                console.error('Erro ao atualizar coluna:', error);
            }
        },
        column
    );
    columnModal.show();
}

// Handler para edição do projeto
async function handleEditProject(project) {
    const projectModal = Modal.createProjectModal(
        async (formData) => {
            try {
                await requests.UpdateBoard({
                    ...project,
                    Name: formData.name,
                    Description: formData.description,
                    HexaBackgroundCoor: formData.color,
                    UpdatedBy: user.Id
                });
                loadBoard();
            } catch (error) {
                console.error('Erro ao atualizar projeto:', error);
            }
        },
        project
    );
    projectModal.show();
}

// Handler para exclusão do projeto
async function handleDeleteProject() {
    if (confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
        try {
            await requests.DeleteBoard(boardId);
            window.location.href = 'projetos.html';
        } catch (error) {
            console.error('Erro ao excluir projeto:', error);
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

editBoardBtn.addEventListener('click', async () => {
    try {
        const board = await requests.GetBoardById(boardId);
        handleEditProject(board);
    } catch (error) {
        console.error('Erro ao carregar dados do projeto:', error);
    }
});

deleteBoardBtn.addEventListener('click', handleDeleteProject);

backButton.addEventListener('click', () => {
    window.location.href = 'projetos.html';
});

// Inicialização
loadBoard();
