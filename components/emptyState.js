export function createEmptyState(type) {
    const emptyStateContainer = document.createElement('div');
    emptyStateContainer.className = 'empty-state-container';
    
    const icon = document.createElement('i');
    const message = document.createElement('p');
    const suggestion = document.createElement('p');
    
    let iconClass, messageText, suggestionText;
    
    switch(type) {
        case 'project':
            iconClass = 'fas fa-project-diagram';
            messageText = 'Nenhum projeto encontrado';
            suggestionText = 'Crie um novo projeto para começar';
            break;
        case 'column':
            iconClass = 'fas fa-columns';
            messageText = 'Nenhuma coluna encontrada';
            suggestionText = 'Adicione uma coluna para organizar suas tasks';
            break;
        case 'task':
            iconClass = 'fas fa-tasks';
            messageText = 'Nenhuma task encontrada';
            suggestionText = 'Adicione uma nova task para começar';
            break;
        default:
            iconClass = 'fas fa-inbox';
            messageText = 'Nada encontrado';
            suggestionText = 'Comece adicionando um novo item';
    }
    
    icon.className = `${iconClass} empty-state-icon`;
    message.className = 'empty-state-message';
    suggestion.className = 'empty-state-suggestion';
    
    message.textContent = messageText;
    suggestion.textContent = suggestionText;
    
    emptyStateContainer.appendChild(icon);
    emptyStateContainer.appendChild(message);
    emptyStateContainer.appendChild(suggestion);
    
    return emptyStateContainer;
}

// Adiciona os estilos necessários
const style = document.createElement('style');
style.textContent = `
    .empty-state-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        margin: 1rem;
        animation: slideUp 0.5s ease-out;
        transform-origin: center;
        transition: all 0.3s ease;
    }

    .empty-state-container:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .empty-state-icon {
        font-size: 3rem;
        color: #8e8e93;
        margin-bottom: 1rem;
        animation: bounce 2s infinite;
    }

    .empty-state-message {
        font-size: 1.25rem;
        color: #1d1d1f;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }

    .empty-state-suggestion {
        font-size: 0.9rem;
        color: #86868b;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-15px);
        }
        60% {
            transform: translateY(-7px);
        }
    }
`;

document.head.appendChild(style);
