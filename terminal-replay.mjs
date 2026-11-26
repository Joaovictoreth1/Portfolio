export function createReplay(text, { show, complete, schedule, cancel }) {
    const characters = Array.from(text);
    let position = 0;
    let timer;

    function step() {
        position = Math.min(position + 5, characters.length);
        if (position === characters.length) {
            timer = undefined;
            complete();
            return;
        }
        show(characters.slice(0, position).join(''));
        timer = schedule(step);
    }

    return {
        get active() { return timer !== undefined; },
        start() {
            if (timer !== undefined) return;
            position = 0;
            step();
        },
        stop() {
            if (timer === undefined) return;
            cancel(timer);
            timer = undefined;
            complete();
        },
    };
}

const languages = {
    pt: { replay: 'Repetir animação', stop: 'Mostrar tudo', heading: 'Perfil em código' },
    en: { replay: 'Replay animation', stop: 'Show all', heading: 'Profile in code' },
};

export function bindTerminalReplay(document, motion, codeLines) {
    const code = document.getElementById('code-block');
    const region = document.getElementById('code-scroll');
    const preview = document.getElementById('terminal-preview');
    const previewCode = preview.querySelector('code');
    const button = document.getElementById('terminal-replay');
    const template = document.createElement('template');
    let labels = languages.pt;

    code.innerHTML = codeLines.join('\n');
    const text = codeLines.map(line => {
        template.innerHTML = line;
        return template.content.textContent;
    }).join('\n');

    const replay = createReplay(text, {
        show(value) {
            previewCode.textContent = value;
            preview.hidden = false;
            code.parentElement.classList.add('sr-only');
            button.textContent = labels.stop;
        },
        complete() {
            preview.hidden = true;
            previewCode.textContent = '';
            code.parentElement.classList.remove('sr-only');
            button.textContent = labels.replay;
        },
        schedule: task => window.setTimeout(task, 20),
        cancel: timer => window.clearTimeout(timer),
    });

    button.hidden = motion.matches;
    button.addEventListener('click', () => {
        if (replay.active) replay.stop();
        else if (!motion.matches) replay.start();
    });
    motion.addEventListener('change', () => {
        if (motion.matches) replay.stop();
        button.hidden = motion.matches;
    });
    return language => {
        labels = languages[language] ?? languages.pt;
        region.setAttribute('aria-label', labels.heading);
        button.textContent = replay.active ? labels.stop : labels.replay;
    };
}
