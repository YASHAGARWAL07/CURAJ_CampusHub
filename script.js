// ===== UTILITY FUNCTIONS =====
const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// ===== BOOKMARK SYSTEM =====
class BookmarkManager {
  constructor() {
    this.bookmarks = JSON.parse(localStorage.getItem('cuHubBookmarks') || '[]');
    this.updateCount();
  }

  add(item) {
    if (!this.bookmarks.find(b => b.id === item.id)) {
      this.bookmarks.push({...item, id: Date.now(), addedAt: new Date().toISOString()});
      this.save();
      showToast('Bookmark added!', 'success');
      return true;
    }
    showToast('Already bookmarked', 'info');
    return false;
  }

  remove(id) {
    this.bookmarks = this.bookmarks.filter(b => b.id !== id);
    this.save();
    showToast('Bookmark removed', 'info');
    this.renderBookmarks();
  }

  save() {
    localStorage.setItem('cuHubBookmarks', JSON.stringify(this.bookmarks));
    this.updateCount();
  }

  updateCount() {
    const counter = $('bookmarkCount');
    if (counter) {
      counter.textContent = this.bookmarks.length;
      counter.style.display = this.bookmarks.length > 0 ? 'grid' : 'none';
    }
  }

  renderBookmarks() {
    const content = $('bookmarksContent');
    if (!content) return;

    if (this.bookmarks.length === 0) {
      content.innerHTML = `
        <div class="bookmarks-empty">
          <div class="bookmarks-empty-icon">⭐</div>
          <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">No Bookmarks Yet</h2>
          <p style="color: var(--text-muted);">Save your favorite items for quick access</p>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <h2 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem;">Your Bookmarks</h2>
      <div class="bookmarks-grid">
        ${this.bookmarks.map(b => `
          <div class="bookmark-item">
            <button class="bookmark-remove" onclick="bookmarkManager.remove(${b.id})">✕</button>
            <strong style="font-size: 1rem; font-weight: 700; display: block; margin-bottom: 0.5rem;">${b.title}</strong>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0.25rem 0;">${b.desc}</p>
            <span style="font-size: 0.8125rem; color: var(--primary-600); font-weight: 600;">${b.meta}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
}

const bookmarkManager = new BookmarkManager();

// ===== THEME TOGGLE =====
const themeToggle = $('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    showToast(`${theme === 'dark' ? '🌙 Dark' : '☀️ Light'} mode activated`, 'success');
  });
}

// ===== GREETING BASED ON TIME =====
(() => {
  const greetingTitle = $('greetingTitle');
  if (!greetingTitle) return;
  
  const hour = new Date().getHours();
  let greeting = 'Good Morning, Yash';
  
  if (hour >= 12 && hour < 18) {
    greeting = 'Good Afternoon, Yash';
  } else if (hour >= 18) {
    greeting = 'Good Evening, Yash';
  }
  
  greetingTitle.textContent = greeting;
})();

// ===== MOBILE MENU =====
const sidebar = $('sidebar');
const mobileMenuToggle = $('mobileMenuToggle');

if (mobileMenuToggle && sidebar) {
  mobileMenuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('mobile-open');
  });
  
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
      if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        sidebar.classList.remove('mobile-open');
      }
    }
  });
}

// ===== PROFILE DROPDOWN =====
const profileBtn = $('profileBtn');
const profileDropdown = $('profileDropdown');

if (profileBtn && profileDropdown) {
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('open');
    const notifPanel = $('notifPanel');
    if (notifPanel) notifPanel.classList.remove('open');
  });

  document.addEventListener('click', () => {
    profileDropdown.classList.remove('open');
  });

  const logoutBtn = $('dropdownLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        showToast('Logging out...', 'info');
        setTimeout(() => console.log('User logged out'), 1000);
      }
    });
  }
}

// ===== NOTIFICATIONS =====
const notifBtn = $('notifBtn');
const notifPanel = $('notifPanel');
const notifList = $('notifList');
const markAllRead = $('markAllRead');

const notifications = [
  { id: 1, icon: '🚗', text: 'New ride to Jaipur available at 5:30 PM', time: '5 min ago', unread: true },
  { id: 2, icon: '📚', text: 'TOC PYQs for Semester 4 uploaded', time: '1 hour ago', unread: true },
  { id: 3, icon: '🎉', text: 'Tech Fest registration starts next week', time: '2 hours ago', unread: false },
  { id: 4, icon: '🛒', text: 'Your listing received 3 new inquiries', time: '3 hours ago', unread: false }
];

function renderNotifications() {
  if (!notifList) return;
  
  notifList.innerHTML = notifications.map(notif => `
    <div class="notif-item ${notif.unread ? 'unread' : ''}" data-id="${notif.id}">
      <div class="notif-icon">${notif.icon}</div>
      <div class="notif-content">
        <p class="notif-text">${notif.text}</p>
        <span class="notif-time">${notif.time}</span>
      </div>
    </div>
  `).join('');
  
  const unreadCount = notifications.filter(n => n.unread).length;
  const notifCount = $('notifCount');
  const notifDot = $('notifDot');
  
  if (notifCount) {
    notifCount.textContent = unreadCount;
    notifCount.style.display = unreadCount > 0 ? 'grid' : 'none';
  }
  
  if (notifDot) {
    notifDot.style.display = unreadCount > 0 ? 'block' : 'none';
  }

  $$('.notif-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      const notif = notifications.find(n => n.id === id);
      if (notif && notif.unread) {
        notif.unread = false;
        renderNotifications();
        showToast('Notification marked as read', 'success');
      }
    });
  });
}

if (notifBtn && notifPanel) {
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifPanel.classList.toggle('open');
    if (profileDropdown) profileDropdown.classList.remove('open');
  });

  document.addEventListener('click', () => {
    notifPanel.classList.remove('open');
  });
}

if (markAllRead) {
  markAllRead.addEventListener('click', () => {
    notifications.forEach(notif => notif.unread = false);
    renderNotifications();
    showToast('All notifications marked as read', 'success');
  });
}

renderNotifications();

// ===== DATA =====
const DATA = {
  rides: [
    { title: 'Campus → Jaipur', desc: '5:30 PM · 2 seats available', meta: '₹80 per seat · Dishant Tailor' },
    { title: 'Campus → Railway Station', desc: '4:00 PM · 1 seat available', meta: '₹40 per seat · Anil Kumawat' },
    { title: 'Campus → Jaipur', desc: '6:15 PM · 3 seats available', meta: '₹90 per seat · Yash Agarwal' },
    { title: 'Campus → Bus Stand', desc: '3:45 PM · 2 seats available', meta: '₹30 per seat · Mr. Sahani' },
    { title: 'Campus → Ajmer', desc: '7:00 AM · 2 seats available', meta: '₹120 per seat · Vikas Kumar' },
    { title: 'Campus → Shopping Mall', desc: '2:30 PM · 3 seats available', meta: '₹25 per seat · Priya Singh' }
  ],
  marketplace: [
    { title: 'Casio FX-991ES Calculator', desc: 'Like new condition · Used for 1 semester', meta: '₹400 · CSE 2nd Year' },
    { title: 'Data Structures Book by Karumanchi', desc: 'Excellent condition · No marks', meta: '₹250 · 3rd Year Student' },
    { title: 'Laptop Stand Adjustable', desc: 'Barely used · Perfect condition', meta: '₹350 · MBA Student' },
    { title: 'Engineering Drawing Kit', desc: 'Complete set with compass', meta: '₹200 · 1st Year' },
    { title: 'TI-84 Plus Calculator', desc: 'Great condition · With manual', meta: '₹800 · Final Year' }
  ],
  'lost-found': [
    { title: 'Blue Water Bottle', desc: 'Found near Library Block A', meta: 'Reported today at 2:30 PM' },
    { title: 'Black Notebook with Red Cover', desc: 'Found in Canteen', meta: 'Reported yesterday' },
    { title: 'Lost: Silver Watch', desc: 'Near Sports Ground', meta: 'Lost on Monday' },
    { title: 'Found: USB Drive 32GB', desc: 'In Computer Lab 3', meta: 'Reported today' },
    { title: 'Lost: Blue Backpack', desc: 'Contains textbooks', meta: 'Lost near Hostel B' }
  ],
  notes: [
    { title: 'TOC PYQs 2024', desc: 'Complete with solutions · Semester 4', meta: 'Uploaded by seniors · 156 downloads' },
    { title: 'DSA Complete Notes', desc: 'Handwritten notes with diagrams', meta: 'Uploaded 2 days ago · 89 downloads' },
    { title: 'DBMS Tutorial Series', desc: 'Complete SQL and NoSQL notes', meta: 'Uploaded last week · 234 downloads' },
    { title: 'Computer Networks PYQs', desc: 'Last 5 years papers', meta: 'Uploaded 1 week ago · 178 downloads' },
    { title: 'Operating Systems Notes', desc: 'Process, threads, scheduling', meta: 'Uploaded 3 days ago · 145 downloads' }
  ],
  events: [
    { title: 'AI/ML Workshop', desc: 'Hands-on machine learning session', meta: 'Tomorrow 4 PM · Seminar Hall' },
    { title: 'CodeStorm Hackathon 2024', desc: '48-hour coding competition', meta: 'Next Week · Main Hall' },
    { title: 'Tech Talk: Web3 & Blockchain', desc: 'Guest lecture by industry expert', meta: 'Friday 3 PM · Auditorium' },
    { title: 'Photography Club Meetup', desc: 'Portfolio review session', meta: 'Sunday 11 AM · Campus Garden' },
    { title: 'Robotics Workshop', desc: 'Build your first robot', meta: 'Saturday 2 PM · Lab 4' }
  ],
  complaints: [
    { title: 'WiFi Issue – Hostel B5', desc: 'Slow internet connection in rooms', meta: 'Status: In Progress · 2 days old' },
    { title: 'Mess Food Quality', desc: 'Quality concerns during dinner', meta: 'Status: Under Review · 1 day old' },
    { title: 'Library AC Not Working', desc: 'Reading hall is too hot', meta: 'Status: Resolved · Today' },
    { title: 'Streetlight Problem', desc: 'Lights not working near Block C', meta: 'Status: Pending · 3 days old' },
    { title: 'Water Shortage in Hostel A', desc: 'No water supply in morning', meta: 'Status: In Progress · Today' }
  ]
};

// ===== MODAL =====
const modal = $('rideModal');
const modalTitle = $('modalTitle');
const modalBody = $('rideModalBody');
const modalFilters = $('modalFilters');
const closeModalBtn = $('closeRideModal');
const modalBackdrop = $('rideBackdrop');
const modalActionBtn = $('modalActionBtn');

const MODAL_ACTIONS = {
  'rides': 'Post New Ride',
  'marketplace': 'List Item for Sale',
  'lost-found': 'Report Lost/Found Item',
  'notes': 'Upload Notes/PYQs',
  'events': 'Create Event',
  'complaints': 'File New Complaint'
};

let currentModalType = '';

function renderModalItems(items) {
  if (!modalBody) return;
  
  if (items.length === 0) {
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">😕</div>
        <p style="color: var(--text-muted); font-size: 0.875rem;">No items match your filter.</p>
      </div>
    `;
    return;
  }

  modalBody.innerHTML = items.map(item => `
    <div class="ride-card" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
      <div style="flex: 1;">
        <strong>${item.title}</strong>
        <p>${item.desc}</p>
        <span>${item.meta}</span>
      </div>
      <button onclick="bookmarkManager.add(${JSON.stringify(item).replace(/"/g, '&quot;')})" 
              style="flex-shrink: 0; width: 40px; height: 40px; background: var(--bg-secondary); 
              border: 1px solid var(--border-color); border-radius: var(--radius-md); 
              cursor: pointer; transition: all var(--transition-base); display: grid; place-items: center;">
        ⭐
      </button>
    </div>
  `).join('');
}

function openModal(title, subtitle, items, filters = [], type = '') {
  if (!modal) return;
  
  currentModalType = type;
  if (modalTitle) modalTitle.textContent = title;
  
  const modalSubtitle = modal.querySelector('.modal-subtitle');
  if (modalSubtitle) modalSubtitle.textContent = subtitle;

  if (modalActionBtn && type && MODAL_ACTIONS[type]) {
    const span = modalActionBtn.querySelector('span');
    if (span) span.textContent = MODAL_ACTIONS[type];
  }

  renderModalItems(items);

  if (modalFilters) {
    if (filters.length > 0) {
      modalFilters.innerHTML = filters.map((filter, i) => 
        `<button class="filter-chip ${i === 0 ? 'active' : ''}">${filter}</button>`
      ).join('');
      
      modalFilters.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          modalFilters.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          
          const filterText = chip.textContent.toLowerCase();
          
          if (filterText === 'all' || filterText.includes('all')) {
            renderModalItems(items);
          } else {
            const filteredItems = items.filter(item => 
              item.title.toLowerCase().includes(filterText) || 
              item.desc.toLowerCase().includes(filterText) ||
              item.meta.toLowerCase().includes(filterText)
            );
            renderModalItems(filteredItems);
          }
          
          showToast(`Filtered: ${chip.textContent}`, 'info');
        });
      });
      modalFilters.style.display = 'flex';
    } else {
      modalFilters.style.display = 'none';
    }
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  currentModalType = '';
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
});

if (modalActionBtn) {
  modalActionBtn.addEventListener('click', () => {
    if (currentModalType && MODAL_ACTIONS[currentModalType]) {
      showToast(`Opening ${MODAL_ACTIONS[currentModalType]} form...`, 'info');
      setTimeout(() => {
        showToast('Feature coming soon!', 'success');
      }, 1000);
    }
  });
}

// ===== SECTION ROUTER =====
function openSection(type) {
  const sectionData = {
    'rides': { 
      title: 'Ride Share', 
      subtitle: 'Available rides with verified students', 
      filters: ['All Rides', 'Jaipur', 'Station', 'Bus Stand'] 
    },
    'marketplace': { 
      title: 'Marketplace', 
      subtitle: 'Latest listings from campus', 
      filters: ['All Items', 'Books', 'Electronics', 'Stationery'] 
    },
    'lost-found': { 
      title: 'Lost & Found', 
      subtitle: 'Recently reported items', 
      filters: ['All', 'Lost', 'Found', 'Today'] 
    },
    'notes': { 
      title: 'Notes & PYQs', 
      subtitle: 'Recently uploaded study materials', 
      filters: ['All', 'Notes', 'PYQs', 'Semester 4'] 
    },
    'events': { 
      title: 'Events & Clubs', 
      subtitle: 'Upcoming campus events', 
      filters: ['All', 'Workshops', 'Hackathons', 'Meetups'] 
    },
    'complaints': { 
      title: 'Complaints & Issues', 
      subtitle: 'Current complaint status', 
      filters: ['All', 'Pending', 'In Progress', 'Resolved'] 
    }
  };

  const section = sectionData[type];
  if (!section) return;

  const items = DATA[type] || [];
  openModal(section.title, section.subtitle, items, section.filters, type);
}

$$('[data-action]').forEach(btn => {
  btn.addEventListener('click', () => openSection(btn.dataset.action));
});

const openRideModal = $('openRideModal');
if (openRideModal) {
  openRideModal.addEventListener('click', () => openSection('rides'));
}

// ===== NAVIGATION =====
const dashboardContent = $('dashboardContent');
const aboutContent = $('aboutContent');
const bookmarksContent = $('bookmarksContent');

$$('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    $$('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    const page = link.dataset.page;
    
    if (dashboardContent) dashboardContent.style.display = 'none';
    if (aboutContent) aboutContent.style.display = 'none';
    if (bookmarksContent) bookmarksContent.style.display = 'none';
    
    if (page === 'about') {
      if (aboutContent) aboutContent.style.display = 'block';
      generateAboutSection();
      showToast('About CU Hub', 'info');
    } else if (page === 'bookmarks') {
      if (bookmarksContent) bookmarksContent.style.display = 'block';
      bookmarkManager.renderBookmarks();
      showToast('Your bookmarks', 'info');
    } else if (page === 'dashboard') {
      if (dashboardContent) dashboardContent.style.display = 'block';
    } else if (DATA[page]) {
      if (dashboardContent) dashboardContent.style.display = 'block';
      openSection(page);
    }
    
    if (window.innerWidth <= 768 && sidebar) {
      sidebar.classList.remove('mobile-open');
    }
  });
});

// ===== AI ASSISTANT =====
const aiFab = $('aiFab');
const aiWidget = $('aiWidget');
const aiBody = $('aiBody');
const aiForm = $('aiForm');
const aiInput = $('aiInput');
const closeAiWidget = $('closeAiWidget');

function toggleAI() {
  if (!aiWidget || !aiFab) return;
  const isOpen = aiWidget.classList.toggle('open');
  if (isOpen && aiInput) {
    setTimeout(() => aiInput.focus(), 300);
    showToast('AI Assistant ready!', 'info');
  }
}

if (aiFab) aiFab.addEventListener('click', toggleAI);
if (closeAiWidget) closeAiWidget.addEventListener('click', toggleAI);

function addAiMessage(text, type = 'bot') {
  if (!aiBody) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `ai-message ${type}`;
  
  const avatarHTML = type === 'bot' ? `
    <div class="message-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
        <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
        <path d="M9 14s1 2 3 2 3-2 3-2"></path>
      </svg>
    </div>` : '';
  
  messageDiv.innerHTML = `${avatarHTML}<div class="message-content"><p>${text}</p></div>`;
  aiBody.appendChild(messageDiv);
  aiBody.scrollTop = aiBody.scrollHeight;
}

const aiResponses = {
  ride: 'I found 6 available rides! The next ride to Jaipur is at 5:30 PM with 2 seats available for ₹80 per seat. Opening Rides section...',
  notes: 'Great! We have the latest TOC PYQs for 2024 with complete solutions. Opening Notes & PYQs section...',
  event: 'Exciting events coming up! Tomorrow there\'s an AI/ML Workshop at 4 PM. Opening Events section...',
  help: 'I\'m your CURAJ AI Assistant! I can help you with:\n• Finding rides\n• Browsing marketplace\n• Accessing notes and PYQs\n• Checking events\n• Filing complaints\n\nWhat would you like to explore?',
  default: 'I can help you navigate CU Hub! Try asking about rides, notes, events, or marketplace items. 😊'
};

if (aiForm) {
  aiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!aiInput || !aiInput.value.trim()) return;
    
    const text = aiInput.value.trim();
    addAiMessage(text, 'user');
    aiInput.value = '';
    
    setTimeout(() => {
      let response = aiResponses.default;
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('ride') || lowerText.includes('jaipur')) {
        response = aiResponses.ride;
        setTimeout(() => openSection('rides'), 2000);
      } else if (lowerText.includes('note') || lowerText.includes('pyq')) {
        response = aiResponses.notes;
        setTimeout(() => openSection('notes'), 2000);
      } else if (lowerText.includes('event') || lowerText.includes('workshop')) {
        response = aiResponses.event;
        setTimeout(() => openSection('events'), 2000);
      } else if (lowerText.includes('help')) {
        response = aiResponses.help;
      } else if (lowerText.includes('marketplace')) {
        response = 'Opening Marketplace for you!';
        setTimeout(() => openSection('marketplace'), 2000);
      } else if (lowerText.includes('lost') || lowerText.includes('found')) {
        response = 'Let me check Lost & Found for you!';
        setTimeout(() => openSection('lost-found'), 2000);
      }
      
      addAiMessage(response);
    }, 600);
  });
}

$$('.suggestion-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const text = chip.textContent;
    if (aiInput) {
      aiInput.value = text;
      aiForm.dispatchEvent(new Event('submit'));
    }
  });
});

// ===== SEARCH =====
const searchInput = $('globalSearch');
const searchResults = $('searchResults');
const searchClear = $('searchClear');

const SEARCH_INDEX = [
  { key: 'lost found', title: 'Lost & Found', desc: 'Search lost items on campus', action: () => openSection('lost-found'), icon: '🔍' },
  { key: 'ride share jaipur', title: 'Ride Share', desc: 'Find rides to Jaipur & more', action: () => openSection('rides'), icon: '🚗' },
  { key: 'marketplace buy sell', title: 'Marketplace', desc: 'Buy & sell items', action: () => openSection('marketplace'), icon: '🛒' },
  { key: 'notes pyq study', title: 'Notes & PYQs', desc: 'Access study materials', action: () => openSection('notes'), icon: '📚' },
  { key: 'event workshop', title: 'Events & Clubs', desc: 'Workshops & activities', action: () => openSection('events'), icon: '🎉' },
  { key: 'complaint issue', title: 'Complaints', desc: 'Register campus issues', action: () => openSection('complaints'), icon: '⚠️' },
  { key: 'ai assistant help', title: 'AI Assistant', desc: 'Chat with AI', action: () => toggleAI(), icon: '🤖' },
  { key: 'bookmark favorite', title: 'Bookmarks', desc: 'Your saved items', action: () => {
    $$('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('.nav-link[data-page="bookmarks"]')?.classList.add('active');
    if (dashboardContent) dashboardContent.style.display = 'none';
    if (aboutContent) aboutContent.style.display = 'none';
    if (bookmarksContent) {
      bookmarksContent.style.display = 'block';
      bookmarkManager.renderBookmarks();
    }
  }, icon: '⭐' }
];

function performSearch() {
  if (!searchInput || !searchResults) return;
  const query = searchInput.value.trim().toLowerCase();
  
  if (!query) {
    searchResults.classList.remove('open');
    if (searchClear) searchClear.classList.remove('show');
    return;
  }

  if (searchClear) searchClear.classList.add('show');

  const matches = SEARCH_INDEX.filter(item => 
    item.key.includes(query) || 
    item.title.toLowerCase().includes(query) || 
    item.desc.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    searchResults.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
        <p style="color: var(--text-muted); font-size: 0.875rem;">No results found for "${query}"</p>
      </div>
    `;
  } else {
    searchResults.innerHTML = matches.map((r, i) => `
      <div class="search-item" data-index="${i}">
        <div class="search-icon-wrapper">${r.icon}</div>
        <div class="search-info">
          <strong>${r.title}</strong>
          <span>${r.desc}</span>
        </div>
      </div>
    `).join('');
    
    searchResults.querySelectorAll('.search-item').forEach((el, index) => {
      el.addEventListener('click', () => {
        matches[index].action();
        clearSearch();
        showToast(`Opening ${matches[index].title}...`, 'info');
      });
    });
  }
  searchResults.classList.add('open');
}

function clearSearch() {
  if (!searchInput) return;
  searchInput.value = '';
  if (searchResults) searchResults.classList.remove('open');
  if (searchClear) searchClear.classList.remove('show');
}

if (searchInput) {
  searchInput.addEventListener('input', debounce(performSearch, 300));
}

if (searchClear) {
  searchClear.addEventListener('click', () => {
    clearSearch();
    searchInput.focus();
  });
}

document.addEventListener('click', (e) => {
  if (searchResults && !e.target.closest('.search-wrapper')) {
    searchResults.classList.remove('open');
  }
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }
  
  if ((e.metaKey || e.ctrlKey) && e.key === '/') {
    e.preventDefault();
    toggleAI();
  }
});

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
  const container = $('toastContainer');
  if (!container) return;

  const icons = { 
    success: '✓', 
    error: '✕', 
    info: 'ℹ' 
  };
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== ABOUT SECTION =====
function generateAboutSection() {
  const aboutContent = $('aboutContent');
  if (!aboutContent) return;
  
  aboutContent.innerHTML = `
<div class="about-content">
  <section class="about-hero">
    <div class="hero-badge">
      <svg class="hero-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/>
      </svg>
      <span>CURAJ Students Platform</span>
    </div>
    <h1 class="about-title">
      <span class="title-line">Simplifying</span>
      <span class="title-line gradient-text">Campus Life</span>
    </h1>
    <p class="about-subtitle">Your All-in-One Digital Platform for CURAJ Students</p>
    <p class="about-description">
      One campus. One platform. Everything you need.
    </p>
    <div class="hero-stats">
      <div class="stat-item">
        <span class="stat-number">500+</span>
        <span class="stat-label">Active Students</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-number">6</span>
        <span class="stat-label">Core Features</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-number">24/7</span>
        <span class="stat-label">AI Support</span>
      </div>
    </div>
  </section>

  <section class="about-mission">
    <div class="section-header">
      <span class="section-badge">About CU Hub</span>
      <h2 class="section-title">Made with ❤️ for CURAJ students by a student</h2>
    </div>
    <div class="mission-content">
      <p class="mission-text">
        CU Hub is the <strong>unified digital ecosystem</strong> designed exclusively for Central University of Rajasthan students. 
        Say goodbye to scattered WhatsApp groups, lost Google Drive links, and fragmented communication channels.
      </p>
      <p class="mission-text">
        We've consolidated everything you need into one <strong>fast, secure, and campus-only platform</strong>—from buying 
        secondhand textbooks to finding rides, accessing PYQs, discovering events, and getting instant AI-powered assistance.
      </p>
      <div class="mission-highlight">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Trusted by students. Built with care. Secured for CURAJ only.</span>
      </div>
    </div>
  </section>

  <section class="features-showcase">
    <div class="section-header">
      <span class="section-badge">What CU Hub Offers</span>
      <h2 class="section-title">Everything You Need, One Platform</h2>
    </div>
    
    <div class="features-showcase-grid">
      <div class="showcase-card" data-feature="marketplace">
        <div class="showcase-icon marketplace-gradient">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <h3 class="showcase-title">Buy & Sell</h3>
        <p class="showcase-subtitle">Student Marketplace</p>
        <ul class="showcase-list">
          <li>Secondhand gadgets, books, calculators, cycles</li>
          <li>Campus-verified users only</li>
          <li>Direct student-to-student, no middlemen</li>
          <li>Fair pricing, fast transactions</li>
        </ul>
        <div class="showcase-tag">Trusted Community</div>
      </div>

      <div class="showcase-card" data-feature="lost-found">
        <div class="showcase-icon lost-gradient">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
        <h3 class="showcase-title">Lost & Found</h3>
        <p class="showcase-subtitle">Recover What Matters</p>
        <ul class="showcase-list">
          <li>Report lost items: ID cards, bottles, earphones, bags</li>
          <li>Smart filtering for quick discovery</li>
          <li>Photo uploads for better identification</li>
          <li>Reunite items with rightful owners faster</li>
        </ul>
        <div class="showcase-tag">Smart Discovery</div>
      </div>

      <div class="showcase-card" data-feature="notes">
        <div class="showcase-icon notes-gradient">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </div>
        <h3 class="showcase-title">Seniors' Notes & PYQs</h3>
        <p class="showcase-subtitle">Study Resources Hub</p>
        <ul class="showcase-list">
          <li>Senior-verified notes and PYQs</li>
          <li>Subject-wise & semester-wise organization</li>
          <li>No more WhatsApp group hunting</li>
          <li>Always accessible, always updated</li>
        </ul>
        <div class="showcase-tag">Academic Excellence</div>
      </div>

      <div class="showcase-card" data-feature="events">
        <div class="showcase-icon events-gradient">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <h3 class="showcase-title">Events & Clubs</h3>
        <p class="showcase-subtitle">Campus Activities</p>
        <ul class="showcase-list">
          <li>Workshops, hackathons, tech fests</li>
          <li>Cultural events and club activities</li>
          <li>Real-time announcements</li>
          <li>Easy participation and registration</li>
        </ul>
        <div class="showcase-tag">Stay Connected</div>
      </div>

      <div class="showcase-card" data-feature="rides">
        <div class="showcase-icon rides-gradient">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
            <polygon points="12 15 17 21 7 21 12 15"></polygon>
          </svg>
        </div>
        <h3 class="showcase-title">Ride Sharing</h3>
        <p class="showcase-subtitle">Travel Smart</p>
        <ul class="showcase-list">
          <li>Post rides when going outside campus</li>
          <li>Earn by offering empty bike/car seats</li>
          <li>Affordable & time-saving</li>
          <li>Student-friendly, eco-conscious</li>
        </ul>
        <div class="showcase-tag">Save Money</div>
      </div>

      <div class="showcase-card" data-feature="complaints">
        <div class="showcase-icon complaints-gradient">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="showcase-title">Campus Complaints</h3>
        <p class="showcase-subtitle">Voice Your Concerns</p>
        <ul class="showcase-list">
          <li>Register campus issues transparently</li>
          <li>Track complaint resolution status</li>
          <li>Category-wise filtering</li>
          <li>Make campus better together</li>
        </ul>
        <div class="showcase-tag">Community Voice</div>
      </div>
    </div>
  </section>

  <section class="ai-section">
    <div class="ai-section-content">
      <div class="ai-visual">
        <div class="ai-glow-orb"></div>
        <div class="ai-icon-large">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
            <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
            <path d="M9 14s1 2 3 2 3-2 3-2"></path>
          </svg>
        </div>
        <div class="ai-particles">
          <span class="particle"></span>
          <span class="particle"></span>
          <span class="particle"></span>
        </div>
      </div>
      <div class="ai-text">
        <span class="section-badge">Powered by AI</span>
        <h2 class="section-title">CURAJ AI Assistant – Your Smart Campus Companion</h2>
        <p class="ai-description">
          Meet your personal AI assistant, trained exclusively for CURAJ. Get instant answers to campus-related 
          questions, navigate features effortlessly, and experience intelligent search like never before.
        </p>
        <ul class="ai-features">
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>24/7 campus-specific assistance</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Smart global search (Ctrl+K / ⌘K)</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Future integration with SIH CURAJ AI model</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Accurate, concise, and trustworthy responses</span>
          </li>
        </ul>
        <button class="ai-cta" onclick="toggleAI()">
          <span>Try AI Assistant</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </section>

  <section class="security-section">
    <div class="security-badge">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>
    <h3 class="security-title">Secure & Campus-Only</h3>
    <p class="security-description">
      Your safety and privacy come first. CU Hub is accessible only to verified CURAJ students.
    </p>
    <div class="security-features">
      <div class="security-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Login restricted to @curaj.ac.in emails only</span>
      </div>
      <div class="security-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Verified student-only community</span>
      </div>
      <div class="security-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Privacy-focused, trust-first approach</span>
      </div>
    </div>
  </section>

  <section class="why-section">
    <div class="section-header">
      <span class="section-badge">Why CU Hub?</span>
      <h2 class="section-title">Because Campus Life Shouldn't Be Complicated</h2>
    </div>
    <div class="why-grid">
      <div class="why-card">
        <div class="why-number">01</div>
        <h4>One Campus, One Platform</h4>
        <p>Everything you need—rides, notes, marketplace, events—unified in a single, elegant interface.</p>
      </div>
      <div class="why-card">
        <div class="why-number">02</div>
        <h4>Built by a Student, for Students</h4>
        <p>Created by a CURAJ student who understands your challenges, needs, and daily campus struggles.</p>
      </div>
      <div class="why-card">
        <div class="why-number">03</div>
        <h4>Save Time, Reduce Stress</h4>
        <p>No more juggling multiple WhatsApp groups, Drive links, or fragmented communication channels.</p>
      </div>
      <div class="why-card">
        <div class="why-number">04</div>
        <h4>Campus-Only Trust</h4>
        <p>Interact only with verified CURAJ students. Safe, secure, and built for our community.</p>
      </div>
    </div>
  </section>

  <section class="howto-section">
    <div class="section-header">
      <span class="section-badge">Getting Started</span>
      <h2 class="section-title">How to Use CU Hub</h2>
    </div>
    <div class="howto-steps">
      <div class="howto-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h4>Navigate with Ease</h4>
          <p>Use the elegant sidebar to access all features—Dashboard, Rides, Marketplace, Notes, Events, and more.</p>
        </div>
      </div>
      <div class="howto-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h4>Search Instantly</h4>
          <p>Press <kbd>Ctrl+K</kbd> (or <kbd>⌘K</kbd> on Mac) to activate global smart search. Find anything in seconds.</p>
        </div>
      </div>
      <div class="howto-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h4>Post & Browse</h4>
          <p>List items for sale, post rides, upload notes, or browse existing listings with intuitive filters.</p>
        </div>
      </div>
      <div class="howto-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <h4>Chat with AI</h4>
          <p>Need help? Click the AI assistant icon or press <kbd>Ctrl+/</kbd> to get instant campus-specific answers 24/7.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="developer-section-enhanced">
    <div class="developer-backdrop"></div>
    <div class="developer-container">
      <div class="developer-content-wrapper">
        <div class="developer-image-wrapper">
          <div class="image-glow"></div>
          <div class="image-frame">
            <img src="photo.jpeg" alt="Yash Agarwal - CU Hub Creator" 
                 onerror="this.src='https://ui-avatars.com/api/?name=Yash+Agarwal&background=4F46E5&color=fff&size=400'">
          </div>
          <div class="floating-badge badge-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            <span>Full-Stack Dev</span>
          </div>
          <div class="floating-badge badge-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
            <span>CURAJ Student</span>
          </div>
        </div>
        
        <div class="developer-info-wrapper">
          <div class="developer-badge-top">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Built & Designed By</span>
          </div>
          
          <h2 class="developer-name-enhanced">Yash Agarwal</h2>
          <p class="developer-title-enhanced">B.Tech Computer Science & Engineering, 2nd Year</p>
          <p class="developer-university">Central University of Rajasthan</p>
          
          <p class="developer-bio">
            Passionate about solving real-world problems through technology. CU Hub was born from the vision 
            of creating a unified, trusted digital ecosystem for CURAJ students—simplifying campus life one 
            feature at a time.
          </p>
          
          <div class="developer-links-enhanced">
            <a href="https://yashagarwalportfolio-roan.vercel.app/" target="_blank" class="dev-link" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>Portfolio</span>
            </a>
            <a href="https://github.com/YASHAGARWAL07" target="_blank" class="dev-link" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              <span>GitHub</span>
            </a>
            <a href="https://www.linkedin.com/in/yash-agarwal0007/" target="_blank" class="dev-link" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
              <span>LinkedIn</span>
            </a>
          </div>
          
          <div class="developer-contact-enhanced">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <a href="mailto:Yashagarwal.connect@gmail.com">Yashagarwal.connect@gmail.com</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="footer-cta">
    <h3>Ready to Transform Your Campus Experience?</h3>
    <p>Join hundreds of CURAJ students already using CU Hub</p>
    <button class="cta-button" onclick="document.querySelector('.nav-link[data-page=\\'dashboard\\']').click()">
      <span>Explore CU Hub</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </button>
  </section>
</div>
  `;
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('%cCU Hub Enhanced 🚀', 'color: #4F46E5; font-size: 18px; font-weight: bold;');
  console.log('%cProfessional · Modern · Beautiful', 'color: #10b981; font-size: 12px;');

  setTimeout(() => {
    if (typeof showToast === 'function') {
      showToast('Welcome to CU Hub! 👋', 'success');
    }
  }, 500);

  const sidebar = document.querySelector('.sidebar');
  const profileDropdown = document.querySelector('.profile-dropdown');
  const notifPanel = document.querySelector('.notif-panel');

  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 768 && sidebar) {
      sidebar.classList.remove('mobile-open');
    }
    profileDropdown?.classList.remove('open');
    notifPanel?.classList.remove('open');
  }, 250));
});