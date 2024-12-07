document.addEventListener('DOMContentLoaded', () => {
    // Verifica se é um dispositivo touch
    if (window.matchMedia('(hover: none)').matches) return;

    // Cria os elementos do cursor
    const cursor = document.createElement('div');
    const follower = document.createElement('div');
    
    cursor.className = 'cursor';
    follower.className = 'cursor-follower';
    
    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    // Atualiza a posição do cursor
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        // Adiciona um pequeno atraso para o follower
        requestAnimationFrame(() => {
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        });
    });

    // Função para adicionar estados do cursor
    function addCursorState(element, state) {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add(`cursor-${state}`);
            follower.classList.add(`follower-${state}`);
        });

        element.addEventListener('mouseleave', () => {
            cursor.classList.remove(`cursor-${state}`);
            follower.classList.remove(`follower-${state}`);
        });

        // Adiciona efeito de clique apenas para elementos clicáveis
        if (state === 'clickable') {
            element.addEventListener('mousedown', () => {
                cursor.classList.add('cursor-click');
                follower.classList.add('follower-click');
            });

            element.addEventListener('mouseup', () => {
                cursor.classList.remove('cursor-click');
                follower.classList.remove('follower-click');
            });
        }
    }

    // Função para inicializar os elementos
    function initElements() {
        // Elementos clicáveis
        document.querySelectorAll('a, button, .clickable, .project-card, .task-card, .add-task-btn, .action-btn')
            .forEach(el => addCursorState(el, 'clickable'));

        // Elementos de texto
        document.querySelectorAll('input:not([type="checkbox"]), textarea, [contenteditable="true"]')
            .forEach(el => addCursorState(el, 'text'));
    }

    // Observer para elementos dinâmicos
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Se é um elemento
                    // Verifica o próprio elemento
                    if (node.matches('a, button, .clickable, .project-card, .task-card, .add-task-btn, .action-btn')) {
                        addCursorState(node, 'clickable');
                    }
                    if (node.matches('input:not([type="checkbox"]), textarea, [contenteditable="true"]')) {
                        addCursorState(node, 'text');
                    }

                    // Verifica elementos filhos
                    node.querySelectorAll('a, button, .clickable, .project-card, .task-card, .add-task-btn, .action-btn')
                        .forEach(el => addCursorState(el, 'clickable'));
                    node.querySelectorAll('input:not([type="checkbox"]), textarea, [contenteditable="true"]')
                        .forEach(el => addCursorState(el, 'text'));
                }
            });
        });
    });

    // Inicializa
    initElements();
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}); 