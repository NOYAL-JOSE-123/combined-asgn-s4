// API Configuration (Replace with your JSONBin details)
const API_BASE_URL = 'https://api.jsonbin.io/v3';
const BIN_ID = 'YOUR_BIN_ID'; // Replace after creating bin
const API_KEY = 'YOUR_API_KEY'; // Replace with your API key

// Register student
document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentData = {
        id: Date.now(),
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        registrationNumber: document.getElementById('registrationNumber').value,
        course: document.getElementById('course').value,
        semester: document.getElementById('semester').value,
        registeredAt: new Date().toISOString()
    };
    
    // Validate email format
    if (!validateEmail(studentData.email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate registration number format (e.g., 2024CS001)
    if (!validateRegNumber(studentData.registrationNumber)) {
        showMessage('Registration number should be in format: YYYYXX000 (e.g., 2024CS001)', 'error');
        return;
    }
    
    try {
        // First, get existing data
        const existingData = await getStudents();
        let students = [];
        
        if (existingData && existingData.record) {
            students = existingData.record;
        }
        
        // Add new student
        students.push(studentData);
        
        // Update bin
        const response = await fetch(`${API_BASE_URL}/bins/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(students)
        });
        
        if (response.ok) {
            showMessage('Student registered successfully!', 'success');
            document.getElementById('studentForm').reset();
            loadStudents(); // Refresh the list
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error registering student. Please try again.', 'error');
    }
});

// Load students
document.getElementById('loadStudents').addEventListener('click', loadStudents);

async function loadStudents() {
    try {
        const data = await getStudents();
        const students = data.record || [];
        
        const studentsList = document.getElementById('studentsList');
        
        if (students.length === 0) {
            studentsList.innerHTML = '<p style="text-align:center; color:#666;">No students registered yet.</p>';
            return;
        }
        
        studentsList.innerHTML = students.map(student => `
            <div class="student-card">
                <h3>${escapeHtml(student.fullName)}</h3>
                <p><strong>Reg No:</strong> ${escapeHtml(student.registrationNumber)}</p>
                <p><strong>Email:</strong> ${escapeHtml(student.email)}</p>
                <p><strong>Course:</strong> ${escapeHtml(student.course)}</p>
                <p><strong>Semester:</strong> ${student.semester || 'Not specified'}</p>
                <p><small>Registered: ${new Date(student.registeredAt).toLocaleString()}</small></p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading students:', error);
        showMessage('Error loading students list', 'error');
    }
}

async function getStudents() {
    const response = await fetch(`${API_BASE_URL}/bins/${BIN_ID}/latest`, {
        headers: {
            'X-Master-Key': API_KEY
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    
    return await response.json();
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateRegNumber(regNumber) {
    const re = /^\d{4}[A-Z]{2}\d{3}$/;
    return re.test(regNumber);
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
        messageDiv.className = 'message';
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load students on page load
window.addEventListener('load', () => {
    if (BIN_ID !== 'YOUR_BIN_ID' && API_KEY !== 'YOUR_API_KEY') {
        loadStudents();
    } else {
        document.getElementById('studentsList').innerHTML = 
            '<p style="text-align:center; color:#ff6b6b;">⚠️ API not configured. Please set up JSONBin first.</p>';
    }
});