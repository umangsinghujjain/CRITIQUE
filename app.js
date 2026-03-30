// Data Storage
let users = [
    {
        id: 1,
        email: 'creator@demo.com',
        username: 'GameMaster',
        password: 'demo123',
        role: 'creator',
        balance: 10000,
        tasksCompleted: 0
    },
    {
        id: 2,
        email: 'worker@demo.com',
        username: 'PixelPlayer',
        password: 'demo123',
        role: 'worker',
        balance: 0,
        tasksCompleted: 0
    }
];

let tasks = [
    {
        id: 1,
        creatorId: 1,
        title: 'Rate Cat Images',
        description: 'Rate these adorable cat images from 1-10',
        pricePerRating: 5,
        imageUrls: [
            'https://placekitten.com/400/300',
            'https://placekitten.com/400/301',
            'https://placekitten.com/400/302'
        ],
        status: 'active',
        totalSubmissions: 0
    },
    {
        id: 2,
        creatorId: 1,
        title: 'Dog Photo Quality Check',
        description: 'Rate the quality of these dog photos',
        pricePerRating: 8,
        imageUrls: [
            'https://placedog.net/400/300',
            'https://placedog.net/400/301'
        ],
        status: 'active',
        totalSubmissions: 0
    }
];

let submissions = [];
let transactions = [];

// Current user and task state
let currentUser = null;
let currentTask = null;
let currentImageIndex = 0;
let currentRating = 5;

// Rating emojis
const ratingEmojis = ['😢', '😕', '😐', '🙂', '😊', '😃', '😄', '🤩', '🔥', '⭐', '🏆'];

// Utility Functions
function generateId(array) {
    return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
}

function formatRupees(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

function getWorkerLevel(tasksCompleted) {
    return Math.floor(tasksCompleted / 10) + 1;
}

function formatDate(date) {
    return new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Navigation Functions
function showLanding() {
    hideAllPages();
    document.getElementById('landingPage').classList.remove('hidden');
}

function showLogin() {
    hideAllPages();
    document.getElementById('loginPage').classList.remove('hidden');
}

function showRegister() {
    hideAllPages();
    document.getElementById('registerPage').classList.remove('hidden');
}

function hideAllPages() {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('registerPage').classList.add('hidden');
    document.getElementById('creatorDashboard').classList.add('hidden');
    document.getElementById('workerDashboard').classList.add('hidden');
}

// Authentication
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        if (user.role === 'creator') {
            showCreatorDashboard();
        } else {
            showWorkerDashboard();
        }
    } else {
        alert('❌ INVALID CREDENTIALS! TRY AGAIN!');
    }
}

function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    // Check if email already exists
    if (users.find(u => u.email === email)) {
        alert('❌ EMAIL ALREADY REGISTERED!');
        return;
    }

    const newUser = {
        id: generateId(users),
        email,
        username,
        password,
        role,
        balance: role === 'creator' ? 10000 : 0,
        tasksCompleted: 0
    };

    users.push(newUser);
    alert('🎮 ACCOUNT CREATED! LOGIN TO START!');
    showLogin();
}

function handleLogout() {
    currentUser = null;
    currentTask = null;
    currentImageIndex = 0;
    showLanding();
}

// Creator Dashboard
function showCreatorDashboard() {
    hideAllPages();
    document.getElementById('creatorDashboard').classList.remove('hidden');
    document.getElementById('creatorUsername').textContent = currentUser.username;
    
    updateCreatorStats();
    loadCreatorTasks();
}

function updateCreatorStats() {
    const userTasks = tasks.filter(t => t.creatorId === currentUser.id);
    const totalSubmissions = submissions.filter(s => 
        userTasks.some(t => t.id === s.taskId)
    ).length;

    document.getElementById('creatorTotalTasks').textContent = userTasks.length;
    document.getElementById('creatorTotalSubmissions').textContent = totalSubmissions;
}

function showCreateTask() {
    document.getElementById('createTaskForm').classList.remove('hidden');
}

function hideCreateTask() {
    document.getElementById('createTaskForm').classList.add('hidden');
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskPrice').value = '';
    // Reset image URL inputs
    const container = document.getElementById('imageUrlInputs');
    container.innerHTML = `
        <div class="image-url-group">
            <input type="url" class="form-input image-url-input" placeholder="https://example.com/image.jpg" required>
        </div>
    `;
}

function addImageUrlInput() {
    const container = document.getElementById('imageUrlInputs');
    const newInput = document.createElement('div');
    newInput.className = 'image-url-group';
    newInput.innerHTML = `
        <input type="url" class="form-input image-url-input" placeholder="https://example.com/image.jpg" required>
        <button type="button" class="arcade-btn btn-orange btn-small" onclick="removeImageUrlInput(this)">✕</button>
    `;
    container.appendChild(newInput);
}

function removeImageUrlInput(button) {
    button.parentElement.remove();
}

function handleCreateTask(event) {
    event.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const price = parseInt(document.getElementById('taskPrice').value);
    
    const imageInputs = document.querySelectorAll('.image-url-input');
    const imageUrls = Array.from(imageInputs).map(input => input.value).filter(url => url);

    if (imageUrls.length === 0) {
        alert('❌ ADD AT LEAST ONE IMAGE URL!');
        return;
    }

    const newTask = {
        id: generateId(tasks),
        creatorId: currentUser.id,
        title,
        description,
        pricePerRating: price,
        imageUrls,
        status: 'active',
        totalSubmissions: 0
    };

    tasks.push(newTask);
    alert('✅ TASK CREATED SUCCESSFULLY!');
    hideCreateTask();
    loadCreatorTasks();
    updateCreatorStats();
}

function loadCreatorTasks() {
    const userTasks = tasks.filter(t => t.creatorId === currentUser.id);
    const container = document.getElementById('creatorTasksList');

    if (userTasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--neon-cyan); font-size: 10px;">NO TASKS YET. CREATE YOUR FIRST TASK!</p>';
        return;
    }

    container.innerHTML = userTasks.map(task => {
        const taskSubmissions = submissions.filter(s => s.taskId === task.id);
        return `
            <div class="task-card">
                <div class="task-title">${task.title}</div>
                <div class="task-desc">${task.description}</div>
                <div class="task-price">💰 ${formatRupees(task.pricePerRating)} per rating</div>
                <div style="font-size: 9px; color: var(--neon-green); margin: 10px 0;">
                    📸 ${task.imageUrls.length} images
                </div>
                <div style="font-size: 9px; color: var(--neon-yellow); margin: 10px 0;">
                    📊 ${taskSubmissions.length} submissions
                </div>
                <button class="arcade-btn btn-cyan btn-small" onclick="viewTaskSubmissions(${task.id})">VIEW SUBMISSIONS</button>
            </div>
        `;
    }).join('');
}

function viewTaskSubmissions(taskId) {
    const task = tasks.find(t => t.id === taskId);
    const taskSubmissions = submissions.filter(s => s.taskId === taskId);

    if (taskSubmissions.length === 0) {
        alert('ℹ️ NO SUBMISSIONS YET!');
        return;
    }

    let html = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 999; overflow-y: auto; padding: 20px;">
            <div class="container">
                <div class="arcade-card">
                    <button class="arcade-btn btn-yellow btn-small" onclick="closeSubmissionsModal()">✕ CLOSE</button>
                    <h2 style="font-size: 16px; margin: 20px 0; color: var(--neon-pink);">SUBMISSIONS: ${task.title}</h2>
                    <div class="submissions-list">
    `;

    taskSubmissions.forEach(sub => {
        const worker = users.find(u => u.id === sub.workerId);
        html += `
            <div class="submission-item">
                <div class="submission-info">👤 Worker: ${worker ? worker.username : 'Unknown'}</div>
                <div class="submission-info">🕒 ${formatDate(sub.timestamp)}</div>
                <div class="submission-rating">⭐ Rating: ${sub.rating}/10</div>
                <div class="submission-info">💰 Amount: ${formatRupees(sub.amountEarned)}</div>
                <span class="status-badge status-${sub.status}">${sub.status.toUpperCase()}</span>
                ${sub.status === 'pending' ? `
                    <div class="submission-actions">
                        <button class="arcade-btn btn-green btn-small" onclick="approveSubmission(${sub.id})">APPROVE</button>
                        <button class="arcade-btn btn-orange btn-small" onclick="rejectSubmission(${sub.id})">REJECT</button>
                    </div>
                ` : ''}
            </div>
        `;
    });

    html += `
                    </div>
                </div>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'submissionsModal';
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

function closeSubmissionsModal() {
    const modal = document.getElementById('submissionsModal');
    if (modal) modal.remove();
}

function approveSubmission(submissionId) {
    const submission = submissions.find(s => s.id === submissionId);
    if (submission) {
        submission.status = 'approved';
        alert('✅ SUBMISSION APPROVED!');
        closeSubmissionsModal();
        loadCreatorTasks();
    }
}

function rejectSubmission(submissionId) {
    const submission = submissions.find(s => s.id === submissionId);
    if (submission) {
        submission.status = 'rejected';
        // Refund the worker
        const worker = users.find(u => u.id === submission.workerId);
        if (worker) {
            worker.balance -= submission.amountEarned;
        }
        alert('❌ SUBMISSION REJECTED!');
        closeSubmissionsModal();
        loadCreatorTasks();
    }
}

// Worker Dashboard
function showWorkerDashboard() {
    hideAllPages();
    document.getElementById('workerDashboard').classList.remove('hidden');
    document.getElementById('workerUsername').textContent = currentUser.username;
    
    updateWorkerStats();
    showAvailableTasks();
}

function updateWorkerStats() {
    const level = getWorkerLevel(currentUser.tasksCompleted);
    const totalEarned = transactions
        .filter(t => t.userId === currentUser.id && t.type === 'earned')
        .reduce((sum, t) => sum + t.amount, 0);

    document.getElementById('workerBalance').textContent = formatRupees(currentUser.balance);
    document.getElementById('workerLevel').textContent = level;
    document.getElementById('workerTasksCompleted').textContent = currentUser.tasksCompleted;
    document.getElementById('workerTotalEarned').textContent = formatRupees(totalEarned);
}

function showAvailableTasks() {
    document.getElementById('availableTasksSection').classList.remove('hidden');
    document.getElementById('taskRatingSection').classList.add('hidden');
    document.getElementById('transactionHistorySection').classList.add('hidden');
    
    loadAvailableTasks();
}

function loadAvailableTasks() {
    const availableTasks = tasks.filter(t => t.status === 'active');
    const container = document.getElementById('availableTasksList');

    if (availableTasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--neon-cyan); font-size: 10px;">NO TASKS AVAILABLE RIGHT NOW!</p>';
        return;
    }

    container.innerHTML = availableTasks.map(task => {
        const creator = users.find(u => u.id === task.creatorId);
        return `
            <div class="task-card">
                <div class="task-title">${task.title}</div>
                <div class="task-desc">${task.description}</div>
                <div class="task-price">💰 ${formatRupees(task.pricePerRating)} per rating</div>
                <div style="font-size: 9px; color: var(--neon-green); margin: 10px 0;">
                    📸 ${task.imageUrls.length} images to rate
                </div>
                <div style="font-size: 8px; color: var(--neon-cyan); margin: 5px 0;">
                    Created by: ${creator ? creator.username : 'Unknown'}
                </div>
                <button class="arcade-btn btn-green btn-small mt-20" onclick="startTask(${task.id})">START TASK 🎮</button>
            </div>
        `;
    }).join('');
}

function startTask(taskId) {
    currentTask = tasks.find(t => t.id === taskId);
    currentImageIndex = 0;
    currentRating = 5;

    document.getElementById('availableTasksSection').classList.add('hidden');
    document.getElementById('taskRatingSection').classList.remove('hidden');
    
    loadCurrentImage();
}

function loadCurrentImage() {
    if (!currentTask) return;

    document.getElementById('currentTaskTitle').textContent = currentTask.title;
    document.getElementById('currentTaskDesc').textContent = currentTask.description;
    document.getElementById('currentImageIndex').textContent = currentImageIndex + 1;
    document.getElementById('totalImages').textContent = currentTask.imageUrls.length;
    document.getElementById('currentTaskImage').src = currentTask.imageUrls[currentImageIndex];
    
    // Reset rating
    document.getElementById('rateSlider').value = 5;
    updateRating(5);
}

function updateRating(value) {
    currentRating = parseInt(value);
    document.getElementById('ratingValue').textContent = value;
    document.getElementById('ratingEmoji').textContent = ratingEmojis[value];
}

function submitRating() {
    if (!currentTask) return;

    // Create submission
    const submission = {
        id: generateId(submissions),
        taskId: currentTask.id,
        workerId: currentUser.id,
        imageUrl: currentTask.imageUrls[currentImageIndex],
        rating: currentRating,
        timestamp: new Date().toISOString(),
        status: 'pending',
        amountEarned: currentTask.pricePerRating
    };

    submissions.push(submission);

    // Update user balance
    currentUser.balance += currentTask.pricePerRating;

    // Create transaction
    const transaction = {
        id: generateId(transactions),
        userId: currentUser.id,
        taskId: currentTask.id,
        amount: currentTask.pricePerRating,
        type: 'earned',
        timestamp: new Date().toISOString(),
        description: `Rated image for: ${currentTask.title}`
    };

    transactions.push(transaction);

    // Update task
    currentTask.totalSubmissions++;

    // Show celebration
    showCelebration(currentTask.pricePerRating);

    // Move to next image or complete task
    setTimeout(() => {
        currentImageIndex++;
        if (currentImageIndex < currentTask.imageUrls.length) {
            loadCurrentImage();
        } else {
            // Task completed
            currentUser.tasksCompleted++;
            alert('🏆 TASK COMPLETED! ALL IMAGES RATED!');
            
            // Check for level up
            const newLevel = getWorkerLevel(currentUser.tasksCompleted);
            const oldLevel = getWorkerLevel(currentUser.tasksCompleted - 1);
            if (newLevel > oldLevel) {
                showLevelUp(newLevel);
            }
            
            exitTask();
        }
    }, 2500);
}

function showCelebration(amount) {
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.innerHTML = `
        <div class="celebration-text">🎉 EXCELLENT! 🎉</div>
        <div class="celebration-amount">YOU EARNED ${formatRupees(amount)}!</div>
    `;
    document.body.appendChild(celebration);

    setTimeout(() => celebration.remove(), 2000);
    updateWorkerStats();
}

function showLevelUp(level) {
    setTimeout(() => {
        const levelUp = document.createElement('div');
        levelUp.className = 'celebration';
        levelUp.innerHTML = `
            <div class="celebration-text">⭐ LEVEL UP! ⭐</div>
            <div class="celebration-amount">YOU ARE NOW LEVEL ${level}!</div>
        `;
        document.body.appendChild(levelUp);

        setTimeout(() => levelUp.remove(), 3000);
    }, 500);
}

function exitTask() {
    currentTask = null;
    currentImageIndex = 0;
    showAvailableTasks();
    updateWorkerStats();
}

function showTransactionHistory() {
    document.getElementById('availableTasksSection').classList.add('hidden');
    document.getElementById('taskRatingSection').classList.add('hidden');
    document.getElementById('transactionHistorySection').classList.remove('hidden');
    
    loadTransactionHistory();
}

function loadTransactionHistory() {
    const userTransactions = transactions.filter(t => t.userId === currentUser.id);
    const container = document.getElementById('transactionList');

    if (userTransactions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--neon-cyan); font-size: 10px;">NO TRANSACTIONS YET!</p>';
        return;
    }

    container.innerHTML = userTransactions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map(trans => `
            <div class="transaction-item">
                <div>
                    <div class="transaction-desc">${trans.description}</div>
                    <div class="transaction-time">${formatDate(trans.timestamp)}</div>
                </div>
                <div class="transaction-amount">+${formatRupees(trans.amount)}</div>
            </div>
        `).join('');
}

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    showLanding();
});