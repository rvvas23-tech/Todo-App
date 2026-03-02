document.addEventListener('DOMContentLoaded', () => {
  const todoInput = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-btn');
  const todoList = document.getElementById('todo-list');
  const itemsLeft = document.getElementById('items-left');
  const clearCompleted = document.getElementById('clear-completed');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  let currentFilter = 'all';

  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  function renderTodos() {
    todoList.innerHTML = '';
    
    const filteredTodos = todos.filter(todo => {
      if (currentFilter === 'active') return !todo.completed;
      if (currentFilter === 'completed') return todo.completed;
      return true;
    });

    filteredTodos.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      li.dataset.id = todo.id;
      
      li.innerHTML = `
        <label class="checkbox-wrapper">
          <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
          <span class="checkmark"></span>
        </label>
        <span class="todo-text">${escapeHTML(todo.text)}</span>
        <button class="delete-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;

      todoList.appendChild(li);
    });

    updateStats();
  }

  function addTodo(text) {
    if (text.trim() === '') return;
    
    const newTodo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false
    };
    
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
  }

  function toggleTodo(id) {
    todos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
  }

  function deleteTodo(id) {
    const li = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (li) {
      li.classList.add('fade-out');
      setTimeout(() => {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
      }, 300);
    }
  }

  function updateStats() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    itemsLeft.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
    
    const completedCount = todos.length - activeCount;
    clearCompleted.style.opacity = completedCount > 0 ? '1' : '0.5';
    clearCompleted.style.pointerEvents = completedCount > 0 ? 'auto' : 'none';
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Event Listeners
  addBtn.addEventListener('click', () => addTodo(todoInput.value));
  
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo(todoInput.value);
    }
  });

  todoList.addEventListener('click', (e) => {
    const li = e.target.closest('.todo-item');
    if (!li) return;

    const id = li.dataset.id;

    if (e.target.closest('.delete-btn')) {
      deleteTodo(id);
    } else if (e.target.closest('.checkbox-wrapper') || e.target.closest('.todo-text')) {
      // Prevent double toggle if clicking the label/input itself
      if (e.target.tagName !== 'INPUT') {
        toggleTodo(id); 
      } else {
        // If it was the actual input element, just let the state update and then save
        setTimeout(() => toggleTodo(id), 0);
      }
    }
  });

  clearCompleted.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  // Init
  renderTodos();
});