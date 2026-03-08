/**
 * REFERENCE CODE: Skill Connection System (Current Version)
 * For Programmer Reference.
 * 
 * This code handles:
 * 1. SVG path calculation between nodes.
 * 2. Orthogonal routing (L-shaped).
 * 3. Photon head animation.
 * 4. State management to prevent animation flicker.
 */

// --- DATA STRUCTURE ---
const connectionsMap = {
    'skill-orch': ['skill-llm', 'skill-nodes'],
    'skill-llm': ['skill-orch', 'skill-nodes'],
    'skill-auto': ['skill-orch', 'skill-llm', 'skill-nodes', 'skill-unreal', 'skill-fintech'],
    // ... add more as per task
};

// --- CORE FUNCTION ---
function drawConnections(activeId) {
    if (currentActiveId === activeId) return;
    currentActiveId = activeId;

    // 1. Clear Canvas
    skillsCanvas.innerHTML = '';
    if (!activeId || !connectionsMap[activeId]) return;

    const targets = connectionsMap[activeId];
    const startRect = skillTags[activeId].getBoundingClientRect();
    const containerRect = skillsCanvas.getBoundingClientRect();

    targets.forEach(targetId => {
        const targetEl = skillTags[targetId];
        const endRect = targetEl.getBoundingClientRect();

        // Calculate Centers
        const ox = (startRect.left < containerRect.left + containerRect.width / 2) ?
            (startRect.left - containerRect.left) : (startRect.right - containerRect.left);
        const ix = (endRect.left < containerRect.left + containerRect.width / 2) ?
            (endRect.left - containerRect.left) : (endRect.right - containerRect.left);
        const sy = (startRect.top + startRect.height / 2) - containerRect.top;
        const ey = (endRect.top + endRect.height / 2) - containerRect.top;

        // --- BRAIN: SMART ROUTING ---
        const isLeft = (startRect.left - containerRect.left) < containerRect.width / 2;
        const randOffset = (Math.random() - 0.5) * 15;
        const gx = isLeft ? (-15 + randOffset) : (containerRect.width + 15 + randOffset);

        let d;
        // Bridge Routing for same-row neighbors
        if (Math.abs(sy - ey) < 30) {
            const topGutter = Math.min(sy, ey) - 40 + randOffset;
            d = `M ${ox} ${sy} L ${gx} ${sy} L ${gx} ${topGutter} L ${ix} ${topGutter} L ${ix} ${ey}`;
        } else {
            // Standard L-shape
            d = `M ${ox} ${sy} L ${gx} ${sy} L ${gx} ${ey} L ${ix} ${ey}`;
        }

        // --- SVG CREATION ---
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', 'connection-line');
        skillsCanvas.appendChild(path);

        const photon = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        photon.setAttribute('r', '4');
        photon.setAttribute('class', 'photon-head');
        skillsCanvas.appendChild(photon);

        // --- ANIMATION ---
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        const dur = Math.max(1200, Math.min(3000, len * 8));

        path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], {
            duration: dur,
            easing: 'ease-out',
            fill: 'forwards'
        }).onfinish = () => {
            path.classList.add('active'); // triggers CSS marching ants
        };

        photon.animate([{ offsetDistance: '0%' }, { offsetDistance: '100%' }], {
            duration: dur,
            easing: 'ease-out',
            fill: 'forwards'
        });
        photon.style.offsetPath = `path("${d}")`;
    });
}
