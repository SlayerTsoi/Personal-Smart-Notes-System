// Modify API_BASE_URL to point to the backend API endpoint.
const API_BASE_URL = '/api';

// Language Configuration
const translations = {
    zh: {
        appTitle: "个人智能笔记系统",
        searchPlaceholder: "搜索笔记...",
        newNote: "新建笔记",
        selectNote: "选择笔记或创建新笔记",
        selectNoteDesc: "点击左侧笔记列表中的项目或创建新笔记开始记录",
        noteTitlePlaceholder: "笔记标题",
        noteContentPlaceholder: "开始输入笔记内容...",
        tag: "标签",
        delete: "删除",
        save: "保存",
        lastEdited: "最后编辑: ",
        normal: "普通",
        important: "重要",
        completed: "已完成",
        justNow: "刚刚",
        yesterday: "昨天",
        daysAgo: "天前",
        noteSaved: "笔记已保存",
        noteDeleted: "笔记已删除",
        markAs: "笔记标记为",
        confirmDelete: "确定要删除这个笔记吗？此操作无法撤销。",
        noNotesFound: "没有找到匹配的笔记",
        loading: "加载中...",
        errorLoading: "加载笔记失败",
        errorSaving: "保存失败",
        errorDeleting: "删除失败",
        networkError: "网络连接失败，请检查服务器是否运行",
        serverError: "服务器错误"
    },
    en: {
        appTitle: "Personal Smart Notes",
        searchPlaceholder: "Search notes...",
        newNote: "New Note",
        selectNote: "Select a note or create a new one",
        selectNoteDesc: "Click on an item in the note list on the left or create a new note to start recording",
        noteTitlePlaceholder: "Note title",
        noteContentPlaceholder: "Start typing note content...",
        tag: "Tag",
        delete: "Delete",
        save: "Save",
        lastEdited: "Last edited: ",
        normal: "Normal",
        important: "Important",
        completed: "Completed",
        justNow: "Just now",
        yesterday: "Yesterday",
        daysAgo: "days ago",
        noteSaved: "Note saved",
        noteDeleted: "Note deleted",
        markAs: "Note marked as",
        confirmDelete: "Are you sure you want to delete this note? This action cannot be undone.",
        noNotesFound: "No matching notes found",
        loading: "Loading...",
        errorLoading: "Failed to load notes",
        errorSaving: "Failed to save",
        errorDeleting: "Failed to delete",
        networkError: "Network connection failed, please check if server is running",
        serverError: "Server error"
    }
};

// Current language
let currentLang = 'en';

// Notes data - retrieved from the backend
let notes = [];
let currentNoteId = null;

// DOM elements
const notesList = document.getElementById('notesList');
const emptyState = document.getElementById('emptyState');
const editorHeader = document.getElementById('editorHeader');
const editorBody = document.getElementById('editorBody');
const editorFooter = document.getElementById('editorFooter');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const lastEdited = document.getElementById('lastEdited');
const statusTag = document.getElementById('statusTag');
const newNoteBtn = document.getElementById('newNoteBtn');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');
const tagBtn = document.getElementById('tagBtn');
const searchInput = document.getElementById('searchInput');
const zhBtn = document.getElementById('zhBtn');
const enBtn = document.getElementById('enBtn');

// Text elements
const appTitle = document.getElementById('appTitle');
const newNoteText = document.getElementById('newNoteText');
const emptyTitle = document.getElementById('emptyTitle');
const emptyDescription = document.getElementById('emptyDescription');
const tagText = document.getElementById('tagText');
const deleteText = document.getElementById('deleteText');
const saveText = document.getElementById('saveText');
const lastEditedText = document.getElementById('lastEditedText');
const statusText = document.getElementById('statusText');

// API functions
async function fetchNotes() {
    try {
        showLoadingState();
        const response = await fetch(`${API_BASE_URL}/notes`);
        
        if (!response.ok) {
            if (response.status === 0) {
                throw new Error(translations[currentLang].networkError);
            } else {
                throw new Error(`${translations[currentLang].serverError}: ${response.status}`);
            }
        }
        
        notes = await response.json();
        renderNotesList();
        hideLoadingState();
    } catch (error) {
        console.error('Failed to retrieve notes:', error);
        showErrorState(error.message || translations[currentLang].errorLoading);
    }
}

async function createNote(noteData) {
    try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Note creation failed');
        }
        
        const newNote = await response.json();
        return newNote;
    } catch (error) {
        console.error('Note creation failed:', error);
        showNotification(error.message || translations[currentLang].errorSaving);
        throw error;
    }
}

async function updateNote(noteId, noteData) {
    try {
        const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Notes update failed');
        }
        
        const updatedNote = await response.json();
        return updatedNote;
    } catch (error) {
        console.error('Notes update failed:', error);
        showNotification(error.message || translations[currentLang].errorSaving);
        throw error;
    }
}

async function deleteNoteFromServer(noteId) {
    try {
        const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Deleting notes failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Deleting notes failed:', error);
        showNotification(error.message || translations[currentLang].errorDeleting);
        throw error;
    }
}

// initialization
function init() {
    setupEventListeners();
    fetchNotes();
}

// Set language
function setLanguage(lang) {
    currentLang = lang;
    
    // Update language button status
    zhBtn.classList.toggle('active', lang === 'zh');
    enBtn.classList.toggle('active', lang === 'en');
    
    // Update all text content
    appTitle.textContent = translations[lang].appTitle;
    searchInput.placeholder = translations[lang].searchPlaceholder;
    newNoteText.textContent = translations[lang].newNote;
    emptyTitle.textContent = translations[lang].selectNote;
    emptyDescription.textContent = translations[lang].selectNoteDesc;
    noteTitle.placeholder = translations[lang].noteTitlePlaceholder;
    noteContent.placeholder = translations[lang].noteContentPlaceholder;
    tagText.textContent = translations[lang].tag;
    deleteText.textContent = translations[lang].delete;
    saveText.textContent = translations[lang].save;
    lastEditedText.textContent = translations[lang].lastEdited;
    
    // Update status label text
    updateStatusTagText();
    
    // Re-render the note list
    renderNotesList();
}

// Update status label text
function updateStatusTagText() {
    if (currentNoteId) {
        const note = notes.find(n => n.id === currentNoteId);
        if (note) {
            statusText.textContent = translations[currentLang][note.status];
        }
    } else {
        statusText.textContent = translations[currentLang].normal;
    }
}

// Rendering Notes List
function renderNotesList(filteredNotes = null) {
    const notesToRender = filteredNotes || notes;
    
    if (notesToRender.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <i class="material-icons">search_off</i>
                <p>${translations[currentLang].noNotesFound}</p>
            </div>`;
        return;
    }
    
    // Sort by last edit time (newest first).
    const sortedNotes = [...notesToRender].sort((a, b) => {
        return new Date(b.lastEdited) - new Date(a.lastEdited);
    });
    
    notesList.innerHTML = sortedNotes.map(note => `
        <div class="note-item ${currentNoteId === note.id ? 'active' : ''}" data-id="${note.id}">
            <div class="note-title">${note.title}</div>
            <div class="note-preview">${note.content.substring(0, 50)}${note.content.length > 50 ? '...' : ''}</div>
            <div class="note-meta">
                <span>${formatDate(note.lastEdited)}</span>
                <span class="status-tag ${note.status !== 'normal' ? note.status : ''}">
                    ${translations[currentLang][note.status]}
                </span>
            </div>
        </div>
    `).join('');
    
    // Add click event
    document.querySelectorAll('.note-item').forEach(item => {
        item.addEventListener('click', () => {
            const noteId = item.getAttribute('data-id');
            openNote(noteId);
        });
    });
}

// Display loading status
function showLoadingState() {
    notesList.innerHTML = `
        <div class="empty-state">
            <i class="material-icons">refresh</i>
            <p>${translations[currentLang].loading}</p>
        </div>`;
}

// Error status is displayed.
function showErrorState(message) {
    notesList.innerHTML = `
        <div class="empty-state">
            <i class="material-icons">error</i>
            <p>${message}</p>
            <button onclick="fetchNotes()" style="margin-top: 10px; padding: 5px 10px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                重试
            </button>
        </div>`;
}

// Hide loading status
function hideLoadingState() {
    // The state will be updated in renderNotesList
}

// Open Notes
function openNote(noteId) {
    currentNoteId = noteId;
    const note = notes.find(n => n.id === noteId);
    
    if (note) {
        // Update UI
        emptyState.style.display = 'none';
        editorHeader.style.display = 'flex';
        editorBody.style.display = 'block';
        editorFooter.style.display = 'flex';
        
        // Fill data
        noteTitle.value = note.title;
        noteContent.value = note.content;
        lastEdited.textContent = formatDate(note.lastEdited);
        
        // Update status tags
        updateStatusTag(note.status);
        
        // Update event status
        document.querySelectorAll('.note-item').forEach(item => {
            if (item.getAttribute('data-id') === noteId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// Update status tags
function updateStatusTag(status) {
    statusTag.className = 'status-tag';
    if (status !== 'normal') {
        statusTag.classList.add(status);
    }
    
    // Update label text
    statusText.textContent = translations[currentLang][status];
}

// Create a new note
async function createNewNote() {
    try {
        const newNote = {
            title: translations[currentLang].noteTitlePlaceholder,
            content: '',
            status: 'normal'
        };
        
        const createdNote = await createNote(newNote);
        
        // Add to local list
        notes.unshift(createdNote);
        
        renderNotesList();
        openNote(createdNote.id);
        showNotification(translations[currentLang].noteSaved);
    } catch (error) {
        console.error('Failed to create new note:', error);
    }
}

// Save Notes
async function saveNote() {
    if (currentNoteId === null) return;
    
    const noteIndex = notes.findIndex(n => n.id === currentNoteId);
    if (noteIndex !== -1) {
        try {
            const updatedNoteData = {
                title: noteTitle.value,
                content: noteContent.value,
                status: notes[noteIndex].status
            };
            
            const updatedNote = await updateNote(currentNoteId, updatedNoteData);
            
            // Update local list
            notes[noteIndex] = updatedNote;
            
            // Update UI
            lastEdited.textContent = translations[currentLang].justNow;
            renderNotesList();
            
            // A message indicating successful saving was displayed.
            showNotification(translations[currentLang].noteSaved);
        } catch (error) {
            console.error('保存笔记失败:', error);
        }
    }
}

// Delete notes
async function deleteNote() {
    if (currentNoteId === null) return;
    
    if (confirm(translations[currentLang].confirmDelete)) {
        try {
            await deleteNoteFromServer(currentNoteId);
            
            // Remove from local list
            notes = notes.filter(n => n.id !== currentNoteId);
            currentNoteId = null;
            
            // Update UI
            emptyState.style.display = 'flex';
            editorHeader.style.display = 'none';
            editorBody.style.display = 'none';
            editorFooter.style.display = 'none';
            
            renderNotesList();
            showNotification(translations[currentLang].noteDeleted);
        } catch (error) {
            console.error('Deleting notes failed:', error);
        }
    }
}

// Switching Notes Status
async function toggleNoteStatus() {
    if (currentNoteId === null) return;
    
    const noteIndex = notes.findIndex(n => n.id === currentNoteId);
    if (noteIndex !== -1) {
        const currentStatus = notes[noteIndex].status;
        let newStatus;
        
        if (currentStatus === 'normal') {
            newStatus = 'important';
        } else if (currentStatus === 'important') {
            newStatus = 'completed';
        } else {
            newStatus = 'normal';
        }
        
        try {
            const updatedNoteData = {
                title: notes[noteIndex].title,
                content: notes[noteIndex].content,
                status: newStatus
            };
            
            const updatedNote = await updateNote(currentNoteId, updatedNoteData);
            
            // Update local list
            notes[noteIndex] = updatedNote;
            
            updateStatusTag(newStatus);
            renderNotesList();
            
            showNotification(`${translations[currentLang].markAs} ${translations[currentLang][newStatus]}`);
        } catch (error) {
            console.error('Failed to update note status:', error);
        }
    }
}

// Search Notes
function searchNotes(query) {
    if (!query.trim()) {
        renderNotesList();
        return;
    }
    
    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(query.toLowerCase()) || 
        note.content.toLowerCase().includes(query.toLowerCase())
    );
    
    renderNotesList(filteredNotes);
}

// Formatting Dates
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return translations[currentLang].yesterday;
        } else if (diffDays <= 7) {
            return `${diffDays} ${translations[currentLang].daysAgo}`;
        } else {
            return date.toLocaleDateString(currentLang === 'zh' ? 'zh-CN' : 'en-US');
        }
    } catch (e) {
        return dateString;
    }
}

// Show notification
function showNotification(message) {
    // Create a notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background-color: var(--success-color);
        color: white;
        padding: 12px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        z-index: 1000;
        transition: opacity 0.3s;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Fade out and remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Set up event listeners
function setupEventListeners() {
    newNoteBtn.addEventListener('click', createNewNote);
    saveBtn.addEventListener('click', saveNote);
    deleteBtn.addEventListener('click', deleteNote);
    tagBtn.addEventListener('click', toggleNoteStatus);
    
    // Search function
    searchInput.addEventListener('input', (e) => {
        searchNotes(e.target.value);
    });
    
    // Language switching
    zhBtn.addEventListener('click', () => setLanguage('zh'));
    enBtn.addEventListener('click', () => setLanguage('en'));
    
    // Auto-save (with image stabilization)
    let saveTimeout;
    noteTitle.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveNote, 1000);
    });
    
    noteContent.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveNote, 1000);
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', init);