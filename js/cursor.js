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

    // Configurações do rastro
    const trailSettings = {
        maxTrails: 20,
        trailInterval: 30, // Intervalo entre os pontos do rastro
        trails: [],
        lastTrailTime: 0,
        mouseSpeed: { x: 0, y: 0 },
        lastMousePosition: { x: 0, y: 0 },
        mouseVelocity: 0
    };

    // Função para criar um ponto do rastro
    function createTrailDot() {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail';
        document.body.appendChild(dot);
        return {
            element: dot,
            active: false,
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0
        };
    }

    // Inicializa os pontos do rastro
    for (let i = 0; i < trailSettings.maxTrails; i++) {
        trailSettings.trails.push(createTrailDot());
    }

    let currentTrailIndex = 0;
    let lastTime = performance.now();

    // Função para atualizar a velocidade do mouse
    function updateMouseVelocity(e) {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) || 16;
        
        const dx = e.clientX - trailSettings.lastMousePosition.x;
        const dy = e.clientY - trailSettings.lastMousePosition.y;
        
        trailSettings.mouseSpeed.x = dx / deltaTime;
        trailSettings.mouseSpeed.y = dy / deltaTime;
        
        trailSettings.mouseVelocity = Math.sqrt(dx * dx + dy * dy) / deltaTime;
        
        trailSettings.lastMousePosition = { x: e.clientX, y: e.clientY };
        lastTime = currentTime;
    }

    // Função para atualizar um ponto do rastro
    function updateTrailDot(trail, x, y, velocity) {
        const { element } = trail;
        
        // Remove classe ativa anterior
        element.classList.remove('active');
        void element.offsetWidth; // Força reflow
        
        // Posiciona o ponto
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        
        // Ajusta o tamanho baseado na velocidade
        const scale = Math.min(1, 0.3 + velocity * 2);
        element.style.transform = `translate(-50%, -50%) scale(${scale})`;
        
        // Ativa a animação
        element.classList.add('active');
    }

    // Atualiza a posição do cursor e cria o rastro
    document.addEventListener('mousemove', (e) => {
        // Atualiza velocidade do mouse
        updateMouseVelocity(e);
        
        // Atualiza cursor principal
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        
        // Atualiza follower com suavização
        requestAnimationFrame(() => {
            follower.style.left = `${e.clientX}px`;
            follower.style.top = `${e.clientY}px`;
        });

        // Ajusta intervalo do rastro baseado na velocidade
        const dynamicInterval = Math.max(20, 80 - trailSettings.mouseVelocity * 100);
        
        // Cria pontos do rastro
        const now = Date.now();
        if (now - trailSettings.lastTrailTime > dynamicInterval) {
            const trail = trailSettings.trails[currentTrailIndex];
            
            updateTrailDot(trail, e.clientX, e.clientY, trailSettings.mouseVelocity);
            
            currentTrailIndex = (currentTrailIndex + 1) % trailSettings.maxTrails;
            trailSettings.lastTrailTime = now;
        }
    });

    // Função para adicionar estados do cursor
    function addCursorState(element, state) {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add(`cursor-${state}`);
            follower.classList.add(`follower-${state}`);
            
            // Efeito especial no rastro
            trailSettings.trails.forEach(trail => {
                trail.element.style.setProperty('--trail-opacity', state === 'clickable' ? '0.6' : '0.3');
            });
        });

        element.addEventListener('mouseleave', () => {
            cursor.classList.remove(`cursor-${state}`);
            follower.classList.remove(`follower-${state}`);
            
            // Restaura efeito do rastro
            trailSettings.trails.forEach(trail => {
                trail.element.style.removeProperty('--trail-opacity');
            });
        });

        if (state === 'clickable') {
            element.addEventListener('mousedown', () => {
                cursor.classList.add('cursor-click');
                follower.classList.add('follower-click');
                
                // Efeito de explosão no rastro
                trailSettings.trails.forEach((trail, index) => {
                    setTimeout(() => {
                        trail.element.style.transform = 'translate(-50%, -50%) scale(1.5)';
                        setTimeout(() => {
                            trail.element.style.transform = '';
                        }, 200);
                    }, index * 10);
                });
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