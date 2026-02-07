(function() {
    let canvas = null;
    let ctx = null;
    let container = null;
    let resizeHandler = null;
    
    function getEdgePoint(elementId, fromEdge, offsetPercent = 0.5) {
        const el = document.getElementById(elementId);
        if (!el) return {x: 0, y: 0};
        
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        let x, y;
        
        if (fromEdge === 'top') {
            x = rect.left + (rect.width * offsetPercent) - containerRect.left;
            y = rect.top - containerRect.top;
        } else if (fromEdge === 'bottom') {
            x = rect.left + (rect.width * offsetPercent) - containerRect.left;
            y = rect.top + rect.height - containerRect.top;
        } else if (fromEdge === 'right') {
            x = rect.left + rect.width - containerRect.left;
            y = rect.top + (rect.height * offsetPercent) - containerRect.top;
        } else if (fromEdge === 'left') {
            x = rect.left - containerRect.left;
            y = rect.top + (rect.height * offsetPercent) - containerRect.top;
        } else {
            x = rect.left + rect.width / 2 - containerRect.left;
            y = rect.top + rect.height / 2 - containerRect.top;
        }
        
        return {x, y};
    }
    
    function drawArrows() {
        if (!ctx || !canvas) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const prosecutorRight = getEdgePoint('prosecutor', 'right', 0.5);
        const governorLeft = getEdgePoint('governor', 'left', 0.5);
        
        const mvdTop = getEdgePoint('mvd', 'top', 0.5);
        const rosgvardiaTop = getEdgePoint('rosgvardia', 'top', 0.5);
        const fsbTop = getEdgePoint('fsb', 'top', 0.5);
        const minzdravTop = getEdgePoint('minzdrav', 'top', 0.5);
        
        const prosecutorBottomLeft = getEdgePoint('prosecutor', 'bottom', 0.25);
        const prosecutorBottomCenter = getEdgePoint('prosecutor', 'bottom', 0.5);
        const prosecutorBottomRight = getEdgePoint('prosecutor', 'bottom', 0.75);
        
        const governorBottomCenter = getEdgePoint('governor', 'bottom', 0.5);
        
        ctx.strokeStyle = '#8b0000';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#8b0000';
        
        drawTwoWayArrow(prosecutorRight, governorLeft);
        drawArrow(mvdTop, prosecutorBottomLeft);
        drawArrow(rosgvardiaTop, prosecutorBottomCenter);
        drawArrow(fsbTop, prosecutorBottomRight);
        drawArrow(minzdravTop, governorBottomCenter);
    }
    
    function drawArrow(from, to) {
        const startX = from.x;
        const startY = from.y;
        const endX = to.x;
        const endY = to.y;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        const angle = Math.atan2(endY - startY, endX - startX);
        const arrowLength = 10;
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowLength * Math.cos(angle - Math.PI / 6),
            endY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowLength * Math.cos(angle + Math.PI / 6),
            endY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }
    
    function drawTwoWayArrow(point1, point2) {
        const startX = point1.x;
        const startY = point1.y;
        const endX = point2.x;
        const endY = point2.y;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        let angle = Math.atan2(endY - startY, endX - startX);
        drawArrowHead(endX, endY, angle);
        
        angle = Math.atan2(startY - endY, startX - endX);
        drawArrowHead(startX, startY, angle);
    }
    
    function drawArrowHead(x, y, angle) {
        const arrowLength = 10;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
            x - arrowLength * Math.cos(angle - Math.PI / 6),
            y - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            x - arrowLength * Math.cos(angle + Math.PI / 6),
            y - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }
    
    function resizeCanvas() {
        if (!canvas || !container) return;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawArrows();
    }
    
    function initFracLead() {
        container = document.getElementById('hierarchy-container');
        canvas = document.getElementById('hierarchy-canvas');
        
        if (!container || !canvas) return;
        
        ctx = canvas.getContext('2d');
        resizeHandler = resizeCanvas;
        
        resizeCanvas();
        window.addEventListener('resize', resizeHandler);
    }
    
    function cleanupFracLead() {
        if (resizeHandler) {
            window.removeEventListener('resize', resizeHandler);
        }
    }
    
    if (typeof window.RODINA === 'undefined') window.RODINA = {};
    window.RODINA.fracLead = {
        init: initFracLead,
        cleanup: cleanupFracLead,
        redraw: drawArrows
    };
    
    if (document.readyState !== 'loading') {
        initFracLead();
    } else {
        document.addEventListener('DOMContentLoaded', initFracLead);
    }
})();