// Declare ideas in the global scope
let ideas = JSON.parse(localStorage.getItem('ideas')) || [];
let finishedIdeas = JSON.parse(localStorage.getItem('finishedIdeas')) || [];
let currentIdeaIndex = -1;

document.addEventListener('DOMContentLoaded', function() {
    const ideaInput = document.getElementById('ideaInput');
    const ongoingIdea = document.getElementById('ongoingIdea');
    const taskTitle = document.getElementById('taskTitle');
    const taskDetails = document.getElementById('taskDetails');
    const taskDeadline = document.getElementById('taskDeadline');
    const doneNextButton = document.getElementById('doneNextButton');
    const menuButton = document.getElementById('menuButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const mainContent = document.getElementById('mainContent');
    const ideasPage = document.getElementById('ideasPage');
    const finishedIdeasPage = document.getElementById('finishedIdeasPage');
    const aboutPage = document.getElementById('aboutPage');

    function saveIdea(idea) {
        const randomDays = Math.floor(Math.random() * 15) + 1; // Random number between 1 and 15
        const deadline = new Date(Date.now() + randomDays * 24 * 60 * 60 * 1000);
        ideas.push({
            title: idea,
            details: '',
            deadline: deadline.toLocaleDateString()
        });
        localStorage.setItem('ideas', JSON.stringify(ideas));
    }

    function displayNextIdea() {
        currentIdeaIndex++;
        if (currentIdeaIndex >= ideas.length) {
            currentIdeaIndex = 0;
        }
        if (ideas.length > 0) {
            const idea = ideas[currentIdeaIndex];
            taskTitle.textContent = idea.title;
            taskDetails.textContent = idea.details || 'No details added yet.';
            taskDeadline.textContent = `Deadline: ${idea.deadline}`;
            ongoingIdea.style.display = 'block';
        } else {
            ongoingIdea.style.display = 'none';
        }
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
                <p>${idea.details || 'No details added yet.'}</p>
                <p>Deadline: ${idea.deadline}</p>
            `;
            ideaTabs.appendChild(item);
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
                <p>Deadline was: ${idea.deadline}</p>
            `;
            finishedTabs.appendChild(item);
        });
    }

    // Initialize
    showPage('main');
    if (ideas.length > 0) {
        displayNextIdea();
    }
});
