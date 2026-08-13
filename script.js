document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  const setActiveLink = () => {
    let current = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 120 && rect.bottom >= 120) current = section.id;
    });
    navLinkEls.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };
  document.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ---------- Terminal typing effect ---------- */
  const terminalBody = document.getElementById('terminalBody');

  const terminalLines = [
    { type: 'prompt', text: 'whoami' },
    { type: 'out', text: 'al // penetration tester' },
    { type: 'prompt', text: 'cat mission.txt' },
    { type: 'out', text: 'Break things safely, so no one else breaks them for real.' },
    { type: 'prompt', text: 'nmap -sV -Pn target.scope' },
    { type: 'out', text: '22/tcp   open  ssh\n80/tcp   open  http\n445/tcp  open  microsoft-ds' },
    { type: 'prompt', text: './enumerate.sh --ad --quiet' },
    { type: 'out', text: '[+] domain admins enumerated\n[+] kerberoastable accounts: 3\n[+] report drafted' },
  ];

  function typeTerminal() {
    if (!terminalBody) return;

    if (prefersReducedMotion) {
      terminalBody.innerHTML = terminalLines.map(line => {
        return line.type === 'prompt'
          ? `<div class="term-line"><span class="term-prompt">$ </span>${escapeHtml(line.text)}</div>`
          : `<div class="term-line term-out">${escapeHtml(line.text)}</div>`;
      }).join('');
      return;
    }

    let lineIndex = 0;
    let charIndex = 0;
    let currentLineEl = null;

    const cursor = document.createElement('span');
    cursor.className = 'term-cursor';

    function typeNextChar() {
      if (lineIndex >= terminalLines.length) {
        if (currentLineEl) currentLineEl.appendChild(cursor);
        return;
      }

      const line = terminalLines[lineIndex];

      if (charIndex === 0) {
        currentLineEl = document.createElement('div');
        currentLineEl.className = 'term-line' + (line.type === 'out' ? ' term-out' : '');
        if (line.type === 'prompt') {
          const promptSpan = document.createElement('span');
          promptSpan.className = 'term-prompt';
          promptSpan.textContent = '$ ';
          currentLineEl.appendChild(promptSpan);
        }
        currentLineEl.appendChild(document.createTextNode(''));
        terminalBody.appendChild(currentLineEl);
      }

      if (charIndex < line.text.length) {
        currentLineEl.lastChild.textContent += line.text[charIndex];
        charIndex++;
        terminalBody.scrollTop = terminalBody.scrollHeight;
        setTimeout(typeNextChar, line.type === 'prompt' ? 32 : 12);
      } else {
        lineIndex++;
        charIndex = 0;
        setTimeout(typeNextChar, line.type === 'prompt' ? 260 : 420);
      }
    }

    typeNextChar();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  typeTerminal();

  /* ---------- Scroll reveal: skill cards ---------- */
  const skillCards = document.querySelectorAll('.skill-card');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');

        const fill = entry.target.querySelector('.skill-fill');
        const percentLabel = entry.target.querySelector('.skill-percent');
        const percent = entry.target.getAttribute('data-percent');

        if (fill && percent) {
          requestAnimationFrame(() => {
            fill.style.width = `${percent}%`;
          });
        }

        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  skillCards.forEach(card => revealObserver.observe(card));

  /* ---------- Animated stat counters ---------- */
  const statNums = document.querySelectorAll('.stat-num');

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;

      if (prefersReducedMotion) {
        el.textContent = target;
        countObserver.unobserve(el);
        return;
      }

      const duration = 1200;
      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => countObserver.observe(el));

  /* ---------- Contact form ---------- */
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const submitLabel = document.getElementById('submitLabel');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');

      const nameError = document.getElementById('nameError');
      const emailError = document.getElementById('emailError');
      const messageError = document.getElementById('messageError');

      [nameError, emailError, messageError].forEach(el => el.textContent = '');
      formStatus.textContent = '';
      formStatus.classList.remove('error');

      let valid = true;

      if (!name.value.trim()) {
        nameError.textContent = 'Please enter your name.';
        valid = false;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailPattern.test(email.value.trim())) {
        emailError.textContent = 'Please enter a valid email address.';
        valid = false;
      }

      if (!message.value.trim()) {
        messageError.textContent = 'Please add a short message.';
        valid = false;
      }

      if (!valid) {
        formStatus.textContent = '[!] fix the fields above and resend.';
        formStatus.classList.add('error');
        return;
      }

      submitLabel.textContent = 'Sending...';

      setTimeout(() => {
        submitLabel.textContent = 'Send message';
        formStatus.textContent = `[+] message received. I'll reply to ${email.value.trim()} shortly.`;
        form.reset();
      }, 700);
    });
  }

});

