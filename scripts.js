// Declare ideas in the global scope
let ideas = JSON.parse(localStorage.getItem('ideas')) || [];
let finishedIdeas = JSON.parse(localStorage.getItem('finishedIdeas')) || [];
let currentIdeaIndex = -1;
let quill;
let countdownInterval;

document.addEventListener('DOMContentLoaded', function() {
    const ideaInput = document.getElementById('ideaInput');
    const ongoingIdea = document.getElementById('ongoingIdea');
    const taskTitle = document.getElementById('taskTitle');
    const taskDetails = document.getElementById('taskDetails');
    const taskDeadline = document.getElementById('taskDeadline');
    const countdownClock = document.getElementById('countdownClock');
    const doneNextButton = document.getElementById('doneNextButton');
    const menuButton = document.getElementById('menuButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const mainContent = document.getElementById('mainContent');
    const ideasPage = document.getElementById('ideasPage');
    const finishedIdeasPage = document.getElementById('finishedIdeasPage');
    const aboutPage = document.getElementById('aboutPage');
    const editPage = document.getElementById('editPage');
    const saveEditButton = document.getElementById('saveEditButton');

    quill = new Quill('#editor', {
        theme: 'snow'
    });

    function saveIdea(idea) {
        ideas.push({
            title: idea,
            details: '',
            deadline: null
        });
        localStorage.setItem('ideas', JSON.stringify(ideas));
    }

    function setRandomDeadline() {
        const randomDays = Math.floor(Math.random() * 15) + 1;
        return new Date(Date.now() + randomDays * 24 * 60 * 60 * 1000);
    }

    function displayNextIdea() {
        clearInterval(countdownInterval);
        currentIdeaIndex++;
        if (currentIdeaIndex >= ideas.length) {
            currentIdeaIndex = 0;
        }
        if (ideas.length > 0) {
            const idea = ideas[currentIdeaIndex];
            if (!idea.deadline) {
                idea.deadline = setRandomDeadline();
                localStorage.setItem('ideas', JSON.stringify(ideas));
            }
            taskTitle.textContent = idea.title;
            taskDetails.innerHTML = idea.details || 'No details added yet.';
            taskDeadline.textContent = `Deadline: ${idea.deadline.toLocaleDateString()}`;
            ongoingIdea.style.display = 'block';
            updateCountdown();
        } else {
            ongoingIdea.style.display = 'none';
        }
    }

    function updateCountdown() {
        const idea = ideas[currentIdeaIndex];
        const deadline = new Date(idea.deadline);
        countdownInterval = setInterval(() => {
            const now = new Date();
            const distance = deadline - now;
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownClock.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;

            if (distance < 0) {
                clearInterval(countdownInterval);
                countdownClock.textContent = "EXPIRED";
            }
        }, 1000);
    }

    ideaInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim() !== '') {
            saveIdea(this.value.trim());
            this.value = '';
            if (ideas.length === 1) {
                displayNextIdea();
            }
        }
    });

    doneNextButton.addEventListener('click', function() {
        if (ideas.length > 0) {
            const finishedIdea = ideas.splice(currentIdeaIndex, 1)[0];
            finishedIdea.finishedDate = new Date().toLocaleString();
            finishedIdeas.push(finishedIdea);
            localStorage.setItem('ideas', JSON.stringify(ideas));
            localStorage.setItem('finishedIdeas', JSON.stringify(finishedIdeas));
            displayNextIdea();
        }
    });

    menuButton.addEventListener('click', function() {
        dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', function(event) {
        if (!menuButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    dropdownMenu.addEventListener('click', function(event) {
        if (event.target.classList.contains('menu-item')) {
            event.preventDefault();
            const page = event.target.getAttribute('data-page');
            showPage(page);
            dropdownMenu.classList.remove('show');
        }
    });

    function showPage(page) {
        mainContent.style.display = 'none';
        ideasPage.style.display = 'none';
        finishedIdeasPage.style.display = 'none';
        aboutPage.style.display = 'none';
        editPage.style.display = 'none';

        switch(page) {
            case 'main':
                mainContent.style.display = 'flex';
                break;
            case 'ideas':
                ideasPage.style.display = 'block';
                updateIdeasList();
                break;
            case 'finished':
                finishedIdeasPage.style.display = 'block';
                updateFinishedIdeasList();
                break;
            case 'about':
                aboutPage.style.display = 'block';
                break;
            case 'edit':
                editPage.style.display = 'block';
                quill.setContents(quill.clipboard.convert(ideas[currentIdeaIndex].details));
                break;
        }
    }

    function updateIdeasList() {
        const ideaTabs = document.getElementById('ideaTabs');
        ideaTabs.innerHTML = '';
        ideas.forEach((idea, index) => {
            const item = document.createElement('div');
            item.className = 'idea-item';
            item.innerHTML = `
                <h3>${idea.title}</h3>
                <button class="delete-idea" data-index="${index}">Delete</button>
            `;
            item.querySelector('h3').addEventListener('click', () => {
                currentIdeaIndex = index;
                showPage('edit');
            });
            ideaTabs.appendChild(item);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-idea').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = this.getAttribute('data-index');
                ideas.splice(index, 1);
                localStorage.setItem('ideas', JSON.stringify(ideas));
                updateIdeasList();
            });
        });
    }

    function updateFinishedIdeasList() {
        const finishedTabs = document.getElementById('finishedIdeaTabs');
        finishedTabs.innerHTML = '';
        finishedIdeas.forEach((idea) => {
            const item = document.createElement('div');
            item.className = 'finished-idea-item';
            item.innerHTML = `
                <h3>${idea.title}</h3>
                <p>${idea.details || 'No details added.'}</p>
                <p>Finished on: ${idea.finishedDate}</p>
                <p>Deadline was: ${new Date(idea.deadline).toLocaleDateString()}</p>
            `;
            finishedTabs.appendChild(item);
        });
    }

    saveEditButton.addEventListener('click', function() {
        ideas[currentIdeaIndex].details = quill.root.innerHTML;
        localStorage.setItem('ideas', JSON.stringify(ideas));
        showPage('main');
        displayNextIdea();
    });

    taskDetails.addEventListener('click', function() {
        showPage('edit');
    });

    // Initialize
    showPage('main');
    if (ideas.length > 0) {
        displayNextIdea();
    }
});
