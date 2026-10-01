import './style.css';
const nameInput = document.getElementById('person-name');
    const passportInput = document.getElementById('passport');
    const formatSelect = document.getElementById('entry-format');
    const extraInputs = Object.fromEntries(['department', 'instructor', 'trainee', 'pilot', 'pilot-passport', 'copilot', 'copilot-passport'].map(id => [id, document.getElementById(id)]));
    // Always start with the original format, including after browser form restoration.
    formatSelect.value = 'standard';
    function updateFormat() {
      const format = formatSelect.value;
      document.getElementById('personal-fields').hidden = !['standard', 'department'].includes(format);
      document.getElementById('department-fields').hidden = format !== 'department';
      document.getElementById('training-fields').hidden = format !== 'training';
      document.getElementById('air-fields').hidden = format !== 'air';
      feedback.textContent = '';
      render();
    }
    const checkout = document.getElementById('checkout');
    const result = document.getElementById('result');
    const feedback = document.getElementById('feedback');
    const formatTime = () => new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false });
    const previousEntry = document.getElementById('previous-entry');
    const previousStatus = document.getElementById('previous-status');
    let correctedEntryTime = null;
    let enteredAt = null;
    let exitedAt = '';
    const storageKey = 'eintrag.personal-details.v1';
    const storageStatus = document.getElementById('storage-status');
    function reportStorageError() {
      storageStatus.hidden = false;
      storageStatus.textContent = 'Die lokale Speicherung ist in diesem Browser nicht verfügbar. Du kannst deine Angaben weiterhin hier eingeben.';
    }
    function saveDetails() {
      try {
        if (!nameInput.value && !passportInput.value) {
          localStorage.removeItem(storageKey);
        } else {
          localStorage.setItem(storageKey, JSON.stringify({ name: nameInput.value, passport: passportInput.value }));
        }
        storageStatus.hidden = true;
      } catch { reportStorageError(); }
    }
    try {
      const storedDetails = localStorage.getItem(storageKey);
      if (storedDetails) {
        let details;
        try { details = JSON.parse(storedDetails); } catch { localStorage.removeItem(storageKey); }
        if (details && typeof details.name === 'string' && typeof details.passport === 'string') {
          nameInput.value = details.name;
          passportInput.value = details.passport;
          if (nameInput.value || passportInput.value) enteredAt = formatTime();
        }
      }
    } catch { reportStorageError(); }
    checkout.checked = false;
    function render() {
      const time = correctedEntryTime || enteredAt || formatTime();
      const value = id => extraInputs[id].value;
      const templates = {
        standard: `Name: ${nameInput.value}\nReisepassnummer: ${passportInput.value}\nEingetragen um: ${time}\n\nAusgetragen um: ${exitedAt}`,
        department: `Name: ${nameInput.value}\nReisepassnummer: ${passportInput.value}\nAbteilung: ${value('department')}\nEingetragen um: ${time}\n\nAusgetragen um: ${exitedAt}`,
        training: `### Ausbildung:\n\nAusbilder: ${value('instructor')}\nKüken: ${value('trainee')}\nEingetragen um: ${time}\n\nAusgetragen um: ${exitedAt}`,
        air: `Luftrettung:\nPilot: ${value('pilot')}\nReisepassnummer Pilot: ${value('pilot-passport')}\nCo-Pilot: ${value('copilot')}\nReisepassnummer Co-Pilot: ${value('copilot-passport')}\nEingetragen um: ${time}\n\nAusgetragen um: ${exitedAt}`,
      };
      const text = templates[formatSelect.value] || templates.standard;
      result.value = checkout.checked ? `~~${text}~~` : text;
    }
    function updateDetails() {
      if (!enteredAt && (nameInput.value || passportInput.value)) enteredAt = formatTime();
      saveDetails();
      feedback.textContent = '';
      render();
    }
    function updateCheckout() {
      if (checkout.checked && !enteredAt) enteredAt = formatTime();
      exitedAt = checkout.checked ? formatTime() : '';
      feedback.textContent = '';
      render();
    }
    nameInput.addEventListener('input', updateDetails);
    passportInput.addEventListener('input', updateDetails);
    checkout.addEventListener('change', updateCheckout);
    formatSelect.addEventListener('change', updateFormat);
    Object.values(extraInputs).forEach(input => input.addEventListener('input', () => {
      if (!enteredAt && input.value) enteredAt = formatTime();
      feedback.textContent = '';
      render();
    }));
    previousEntry.addEventListener('input', () => {
      const source = previousEntry.value.trim();
      const entryLine = source.match(/(?:^|\n)[ \t]*(?:~~)?Eingetragen um:[ \t]*([^\r\n]*)/i);
      const candidate = (entryLine ? entryLine[1] : source).replace(/~~$/, '').trim();
      const match = candidate.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?(?:[ \t]*Uhr)?$/i);
      correctedEntryTime = match ? `${match[1].padStart(2, '0')}:${match[2]}` : null;
      previousEntry.setAttribute('aria-invalid', String(Boolean(source && !match)));
      previousStatus.textContent = !source ? '' : match
        ? `Eintragungszeit übernommen: ${correctedEntryTime}`
        : 'Keine gültige Eintragungszeit gefunden. Bitte HH:MM eingeben, z. B. 14:30. Es gilt weiterhin die automatische Zeit.';
      feedback.textContent = '';
      render();
    });
    document.getElementById('copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(result.value);
        feedback.textContent = 'Text kopiert.';
      } catch {
        result.focus();
        result.select();
        feedback.textContent = 'Text markiert. Mit Strg+C oder dem Kopiermenü kopieren.';
      }
    });
    updateFormat();
    setInterval(() => { if (!enteredAt) render(); }, 1000);
    if (document.modelContext?.registerTool) {
      try {
        Promise.resolve(document.modelContext.registerTool({
          name: 'configure_entry',
          description: 'Setzt Name, Reisepassnummer und Austragungsstatus im sichtbaren Eintrag. Name und Reisepassnummer werden lokal im Browser gespeichert. Aktivieren hält die aktuelle Austragungszeit fest.',
          inputSchema: { type: 'object', properties: { name: { type: 'string' }, passport: { type: 'string' }, checkedOut: { type: 'boolean' } }, required: ['name', 'passport', 'checkedOut'], additionalProperties: false },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            if (!input || typeof input.name !== 'string' || typeof input.passport !== 'string' || typeof input.checkedOut !== 'boolean' || /[\r\n]/.test(input.name + input.passport)) throw new Error('Ungültige Eingabe.');
            nameInput.value = input.name;
            passportInput.value = input.passport;
            updateDetails();
            if (checkout.checked !== input.checkedOut) { checkout.checked = input.checkedOut; updateCheckout(); }
            return { text: result.value };
          }
        })).catch(() => {});
      } catch {}
    }
