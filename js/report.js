// report.js - Report item page functionality

document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Please login to report an item.');
        setTimeout(() => window.location.href = 'index.html', 1500);
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    if (type === 'lost' || type === 'found') {
        document.getElementById(type + 'Radio').checked = true;
    }

    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.max = `${yyyy}-${mm}-${dd}`;
    }

    setupFormValidation();
    setupPhotoPreview();
    setupCharCounter();
    initializeClockPicker();

    const form = document.getElementById('reportForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!validateForm()) return;

        const user = getCurrentUser();
        if (!user) {
            showToast('Please login first.');
            return;
        }

        const reportType = document.querySelector('input[name="reportType"]:checked').value;
        const itemName = document.getElementById('itemName').value.trim();
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value.trim();
        const location = document.getElementById('location').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const color = document.getElementById('color').value.trim();
        const brand = document.getElementById('brand').value.trim();
        const uniqueFeatures = document.getElementById('uniqueFeatures').value.trim();
        const photo = document.getElementById('photo').files[0];
        const contactPref = document.getElementById('contactPref').value;
        const identifiable = document.getElementById('identifiable').value.trim();

        const newItem = {
            id: 'item' + Date.now(),
            type: reportType,
            itemName,
            category,
            description,
            location,
            date,
            time,
            color,
            brand,
            uniqueFeatures,
            contactPref,
            identifiable,
            photo: photo ? photo.name : null,
            status: reportType,
            userId: user.id,
            createdAt: new Date().toISOString(),
            matchScore: null
        };

        const items = getItems();
        items.push(newItem);
        setItems(items);

        if (reportType === 'lost') {
            const matches = findMatchesForItem(newItem, items);
            if (matches.length > 0) {
                newItem.bestMatch = matches[0].item.id;
                newItem.matchScore = matches[0].score;
                const updatedItems = getItems();
                const idx = updatedItems.findIndex(i => i.id === newItem.id);
                if (idx !== -1) {
                    updatedItems[idx] = newItem;
                    setItems(updatedItems);
                }
                showToast(`Report submitted! We found a potential match (${matches[0].score}%).`);
            } else {
                showToast('Report submitted! We will notify you when a match is found.');
            }
        } else {
            showToast('Report submitted successfully!');
        }

        form.reset();
        document.getElementById('photoPreview').classList.remove('visible');
        document.getElementById('charCount').textContent = '0 / 500';
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
    });
});

function setupFormValidation() {
    const requiredFields = ['itemName', 'category', 'description', 'location', 'date'];
    requiredFields.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('blur', () => validateField(id));
    });
}

function validateField(fieldId) {
    const el = document.getElementById(fieldId);
    const group = el.closest('.form-group');
    const errorEl = group.querySelector('.form-error');
    let isValid = true;
    let message = '';

    if (el.hasAttribute('required') && !el.value.trim()) {
        isValid = false;
        message = 'This field is required.';
    }

    if (fieldId === 'date' && el.value) {
        const selectedDate = new Date(el.value + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate > today) {
            isValid = false;
            message = 'Date cannot be in the future.';
        }
    }

    if (fieldId === 'description' && el.value.length > 500) {
        isValid = false;
        message = 'Description must be 500 characters or less.';
    }

    group.classList.toggle('has-error', !isValid);
    if (errorEl) errorEl.textContent = message;

    return isValid;
}

function validateForm() {
    const fields = ['itemName', 'category', 'description', 'location', 'date'];
    return fields.every(id => validateField(id));
}

function setupPhotoPreview() {
    const photoInput = document.getElementById('photo');
    const preview = document.getElementById('photoPreview');

    photoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) {
            preview.classList.remove('visible');
            preview.src = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.add('visible');
        };
        reader.readAsDataURL(file);
    });
}

function setupCharCounter() {
    const textarea = document.getElementById('description');
    const counter = document.getElementById('charCount');

    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        counter.textContent = `${len} / 500`;
        if (len > 500) {
            textarea.closest('.form-group').classList.add('has-error');
        } else {
            textarea.closest('.form-group').classList.remove('has-error');
        }
    });
}

function initializeClockPicker() {
    const clock = document.getElementById('circularClock');
    const hiddenInput = document.getElementById('time');
    const hourHand = document.getElementById('clockHourHand');
    const minuteHand = document.getElementById('clockMinuteHand');
    const digital = document.getElementById('clockDigital');
    const timeEntry = document.getElementById('timeEntry');

    if (!clock || !hiddenInput || !hourHand || !minuteHand || !digital || !timeEntry) {
        return;
    }

    let currentMinutes = 0;
    let visualMinutes = 0;
    let animationFrameId = null;

    function createClockTicks() {
        const ticks = clock.querySelector('#clockTicks');
        if (!ticks) return;

        const namespace = 'http://www.w3.org/2000/svg';
        for (let index = 0; index < 60; index += 1) {
            const angle = (index * 6 - 90) * Math.PI / 180;
            const isMajor = index % 5 === 0;
            const outerRadius = 84;
            const innerRadius = isMajor ? 75 : 80;
            const tick = document.createElementNS(namespace, 'line');
            tick.setAttribute('x1', String(100 + Math.cos(angle) * outerRadius));
            tick.setAttribute('y1', String(100 + Math.sin(angle) * outerRadius));
            tick.setAttribute('x2', String(100 + Math.cos(angle) * innerRadius));
            tick.setAttribute('y2', String(100 + Math.sin(angle) * innerRadius));
            tick.setAttribute('class', `clock-tick ${isMajor ? 'major' : 'minor'}`);
            ticks.appendChild(tick);
        }
    }

    function applyClockAppearance() {
        const svgShapes = clock.querySelectorAll('circle, line, text');
        svgShapes.forEach((shape) => {
            if (shape.classList.contains('clock-face')) {
                shape.setAttribute('fill', '#ffffff');
                shape.setAttribute('stroke', '#176b87');
            } else if (shape.classList.contains('clock-border')) {
                shape.setAttribute('fill', 'none');
                shape.setAttribute('stroke', '#176b87');
            } else if (shape.classList.contains('clock-tick')) {
                shape.setAttribute('stroke', '#176b87');
            } else if (shape.classList.contains('clock-hand')) {
                shape.setAttribute('stroke', '#176b87');
            } else if (shape.classList.contains('clock-center-dot')) {
                shape.setAttribute('fill', '#176b87');
                shape.setAttribute('stroke', '#176b87');
            } else if (shape.classList.contains('clock-number')) {
                shape.setAttribute('fill', '#176b87');
            }
        });
    }

    function formatInputTime(minutes) {
        const hour = Math.floor(minutes / 60) % 24;
        const minute = minutes % 60;
        const normalizedHour = String(hour).padStart(2, '0');
        const normalizedMinute = String(minute).padStart(2, '0');
        return `${normalizedHour}:${normalizedMinute}`;
    }

    function formatDisplayTime(minutes) {
        const hour24 = Math.floor(minutes / 60) % 24;
        const minute = minutes % 60;
        const suffix = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = ((hour24 + 11) % 12) + 1;
        return `${String(hour12)}:${String(minute).padStart(2, '0')} ${suffix}`;
    }

    function renderClockHands(minutes) {
        const hour = Math.floor(minutes / 60) % 12;
        const minute = minutes % 60;
        const hourAngle = (hour + minute / 60) * 30;
        const minuteAngle = minute * 6;

        hourHand.setAttribute('x2', String(100 + Math.cos((hourAngle - 90) * Math.PI / 180) * 55));
        hourHand.setAttribute('y2', String(100 + Math.sin((hourAngle - 90) * Math.PI / 180) * 55));
        minuteHand.setAttribute('x2', String(100 + Math.cos((minuteAngle - 90) * Math.PI / 180) * 75));
        minuteHand.setAttribute('y2', String(100 + Math.sin((minuteAngle - 90) * Math.PI / 180) * 75));
    }

    function updateClockDisplay(minutes, animate = true) {
        const targetMinutes = ((minutes % 1440) + 1440) % 1440;

        if (!animate) {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            visualMinutes = targetMinutes;
            renderClockHands(targetMinutes);
            hiddenInput.value = formatInputTime(targetMinutes);
            digital.textContent = formatDisplayTime(targetMinutes);
            timeEntry.value = formatDisplayTime(targetMinutes);
            return;
        }

        const startMinutes = visualMinutes;
        const delta = ((targetMinutes - startMinutes + 720 + 1440) % 1440) - 720;
        const duration = 420;
        const startTime = performance.now();

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        function animate(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const nextMinutes = startMinutes + delta * eased;
            visualMinutes = nextMinutes;
            renderClockHands((nextMinutes + 1440) % 1440);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }

            visualMinutes = targetMinutes;
            renderClockHands(targetMinutes);
            hiddenInput.value = formatInputTime(targetMinutes);
            digital.textContent = formatDisplayTime(targetMinutes);
            timeEntry.value = formatDisplayTime(targetMinutes);
        }

        animationFrameId = requestAnimationFrame(animate);
        currentMinutes = targetMinutes;
    }

    function getPointerAngle(clientX, clientY) {
        const rect = clock.querySelector('.clock-svg').getBoundingClientRect();
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);
        return (Math.atan2(dy, dx) * 180 / Math.PI + 450) % 360;
    }

    function getTimeFromAngle(angle) {
        return Math.round(angle / 360 * 1440) % 1440;
    }

    function parseEnteredTime(value) {
        const match = value.trim().match(/^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i);
        if (!match) return null;

        const hour = Number(match[1]);
        const minute = Number(match[2]);
        if (hour < 1 || hour > 12) return null;

        const isPM = match[3].toUpperCase() === 'PM';
        return ((hour % 12) + (isPM ? 12 : 0)) * 60 + minute;
    }

    function commitEnteredTime() {
        const enteredMinutes = parseEnteredTime(timeEntry.value);
        if (enteredMinutes === null) {
            timeEntry.setCustomValidity('Enter a time like 9:41 AM or 2:05 PM.');
            timeEntry.reportValidity();
            return;
        }

        timeEntry.setCustomValidity('');
        currentMinutes = enteredMinutes;
        updateClockDisplay(currentMinutes, false);
    }

    timeEntry.addEventListener('input', () => timeEntry.setCustomValidity(''));
    timeEntry.addEventListener('change', commitEnteredTime);
    timeEntry.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            commitEnteredTime();
            timeEntry.blur();
        }
    });
    timeEntry.addEventListener('blur', () => {
        if (timeEntry.value.trim()) commitEnteredTime();
    });

    clock.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        currentMinutes = getTimeFromAngle(getPointerAngle(event.clientX, event.clientY));
        updateClockDisplay(currentMinutes, true);

        let previousAngle = getPointerAngle(event.clientX, event.clientY);
        let accumulatedMinutes = 0;
        const dragHandler = (moveEvent) => {
            const angle = getPointerAngle(moveEvent.clientX, moveEvent.clientY);
            let angleDelta = angle - previousAngle;
            if (angleDelta > 180) angleDelta -= 360;
            if (angleDelta < -180) angleDelta += 360;
            previousAngle = angle;

            accumulatedMinutes += angleDelta * 0.25;
            const minuteDelta = Math.trunc(accumulatedMinutes);
            if (minuteDelta !== 0) {
                accumulatedMinutes -= minuteDelta;
                currentMinutes = (currentMinutes + minuteDelta + 1440) % 1440;
                updateClockDisplay(currentMinutes, false);
            }
        };
        const stopDrag = () => {
            window.removeEventListener('pointermove', dragHandler);
            window.removeEventListener('pointerup', stopDrag);
            window.removeEventListener('pointercancel', stopDrag);
        };

        window.addEventListener('pointermove', dragHandler);
        window.addEventListener('pointerup', stopDrag);
        window.addEventListener('pointercancel', stopDrag);
    });

    clock.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            currentMinutes = (currentMinutes + 5) % 1440;
            updateClockDisplay(currentMinutes, true);
            return;
        }

        const step = event.shiftKey ? 15 : 5;
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            currentMinutes = (currentMinutes + step) % 1440;
            updateClockDisplay(currentMinutes, true);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            currentMinutes = (currentMinutes - step + 1440) % 1440;
            updateClockDisplay(currentMinutes, true);
        }
    });

    createClockTicks();
    applyClockAppearance();
    updateClockDisplay(currentMinutes, false);
}