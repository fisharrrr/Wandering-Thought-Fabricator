let quill;

// Initialize Quill
document.addEventListener('DOMContentLoaded', function() {
    quill = new Quill('#editor-container', {
        theme: 'snow'
    });
});

let ideas = JSON.parse(localStorage.getItem('ideas')) || [];
let finishedIdeas = JSON.parse(localStorage.getItem('finishedIdeas')) || [];
let currentIndex = null;
let isRandomStarted = false;

function saveIdea() {
    const text = quill.root.innerHTML.trim();
    if (text) {
        const idea = {
            title: text,
            details: '',
            deadline: '',
            finishedDate: null
        };
        ideas.push(idea);
        quill.setContents([]);
        updateIdeasList();
        localStorage.setItem('ideas', JSON.stringify(ideas));
    }
}

function updateIdeasList() {
    const tabs = document.getElementById('ideaTabs');
    tabs.innerHTML = '';
    ideas.forEach((idea, index) => {
        const item = document.createElement('li');
        item.className = 'idea-item';
        item.innerHTML = idea.title;
        item.onclick = (e) => {
            if (!e.target.matches('.delete-btn, button')) {
                toggleIdeaDetails(index);
            }
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteIdea(index);
        };

        const details = document.createElement('div');
        details.className = 'idea-details';
        details.innerHTML = `
            Deadline: ${idea.deadline || 'No deadline set'}<br>
            <div id="editor-container-${index}"></div>
            <button onclick="saveDetails(${index})">Save Details</button>
        `;
        
        item.appendChild(deleteBtn);
        item.appendChild(details);
        tabs.appendChild(item);

        // Initialize a new Quill editor for each idea's details
        new Quill(`#editor-container-${index}`, {
            theme: 'snow'
        });
    });

    updateFinishedIdeasList();
}

function updateFinishedIdeasList() {
    const finishedTabs = document.getElementById('finishedIdeaTabs');
    finishedTabs.innerHTML = '';
    finishedIdeas.forEach((idea) => {
        const item = document.createElement('li');
        item.className = 'idea-item';
        item.innerHTML = `
            ${idea.title}<br>
            Finished on: ${idea.finishedDate}<br>
            Deadline: ${idea.deadline}<br>
            <div class="markdown">${marked.parse(idea.details)}</div>
        `;
        finishedTabs.appendChild(item);
    });
}

function toggleIdeaDetails(index) {
    currentIndex = index;
    const items = document.querySelectorAll('.idea-item');
    items.forEach((item, idx) => {
        const details = item.querySelector('.idea-details');
        if (idx === index) {
            details.style.display = details.style.display === 'block' ? 'none' : 'block';
        } else {
            details.style.display = 'none';
        }
    });
}

function saveDetails(index) {
    const detailsEditor = document.querySelector(`#editor-container-${index} .ql-editor`).innerHTML.trim();
    ideas[index].details = detailsEditor;
    localStorage.setItem('ideas', JSON.stringify(ideas));
    alert(`Details saved for ${ideas[index].title}`);
    if (index === currentIndex) {
        updateOngoingIdea();
    }
}

function deleteIdea(index) {
    ideas.splice(index, 1);
    localStorage.setItem('ideas', JSON.stringify(ideas));
    updateIdeasList();
    if (index === currentIndex) {
        document.getElementById('ongoingIdea').innerHTML = 'No ongoing idea';
        currentIndex = null;
    }
}

function handleRandomOrNext() {
    if (!isRandomStarted) {
        startRandomIdea();
        isRandomStarted = true;
        document.getElementById('randomNextButton').textContent = 'Finish and Next';
    } else {
        finishAndNextIdea();
    }
}

function startRandomIdea() {
    if (ideas.length > 0) {
        const randomIndex = Math.floor(Math.random() * ideas.length);
        setOngoingIdea(randomIndex);
    }
}

function finishAndNextIdea() {
    if (currentIndex !== null) {
        const finishedIdea = ideas[currentIndex];
        finishedIdea.finishedDate = new Date().toLocaleString();
        finishedIdeas.push(finishedIdea);
        ideas.splice(currentIndex, 1);
        localStorage.setItem('ideas', JSON.stringify(ideas));
        localStorage.setItem('finishedIdeas', JSON.stringify(finishedIdeas));
        updateIdeasList();

        if (ideas.length > 0) {
            currentIndex = currentIndex >= ideas.length ? 0 : currentIndex;
            setOngoingIdea(currentIndex);
        } else {
            document.getElementById('ongoingIdea').innerHTML = 'No ongoing idea';
            currentIndex = null;
        }
    }
}

function setOngoingIdea(index) {
    currentIndex = index;
    const ongoingIdea = ideas[currentIndex];
    ongoingIdea.deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();
    localStorage.setItem('ideas', JSON.stringify(ideas));
    updateOngoingIdea();
    updateIdeasList();
}

function updateOngoingIdea() {
    if (currentIndex !== null) {
        const ongoingIdea = ideas[currentIndex];
        const ongoingIdeaDisplay = document.getElementById('ongoingIdea');
        ongoingIdeaDisplay.innerHTML = `
            <strong>Ongoing Idea: ${ongoingIdea.title}</strong><br>
            Deadline: ${ongoingIdea.deadline}<br>
            <div class="markdown">${marked.parse(ongoingIdea.details)}</div>
        `;
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active-section');
    });
    document.getElementById(sectionId).classList.add('active-section');
}

// Initialize
updateIdeasList();