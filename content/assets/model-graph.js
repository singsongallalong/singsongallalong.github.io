(function(){
    function getVar(name, fallback){
	const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	return v || fallback;
    }

    function buildStyle(){
	const nodeFill   = getVar('--graph-node', '#6b8afd');
	const nodeBorder = getVar('--graph-node-border', '#2b3a80');
	const nodeDim    = getVar('--graph-node-dim', '#c7cfe8');

	const edgeColor  = getVar('--graph-edge', '#93a0c6');
	const edgeDim    = getVar('--graph-edge-dim', '#c9d1ec');
	const arrowColor = getVar('--graph-arrow', edgeColor);

	const tagHit     = getVar('--graph-hit', '#13c3a3');
	const highlight  = getVar('--graph-highlight', '#ffb703');

	return [
	    /* Nodes — rounded, soft glow, label halo */
	    { selector: 'node', style: {
		'shape': 'round-rectangle',
		'background-color': nodeFill,
		'border-color': nodeBorder,
		'border-width': 1,

		/* key bits */
		'width': 'label',
		'height': 'label',
		'padding': '10px 12px',

		'label': 'data(label)',
		'text-wrap': 'wrap',
		'text-max-width': 140,   // tweak to taste
		'text-valign': 'center',
		'text-halign': 'center',

		/* typography */
		'font-family': 'var(--graph-font, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif)',
		'font-size': 12,
		'font-weight': 600,

		/* readability halo */
		'text-outline-color': 'rgba(0,0,0,.28)',
		'text-outline-width': 2,
		'color': '#111',
		'min-zoomed-font-size': 7,

		/* nice shadow */
		'shadow-blur': 12,
		'shadow-color': 'rgba(0,0,0,.18)',
		'shadow-opacity': 1,
		'shadow-offset-x': 0, 'shadow-offset-y': 2
	    }},
	    /* Dim “stub” nodes (missing pages) */
	    { selector: 'node[stub = 1]', style: {
		'background-opacity': .45,
		'border-style': 'dashed'
	    }},

	    /* Tag hit = keep fill but add a ring glow so other encodings (e.g. time) can coexist */
	    { selector: 'node.tag-hit', style: {
		'border-width': 4,
		'border-color': tagHit,
		'shadow-blur': 16,
		'shadow-color': 'rgba(19,195,163,.35)'
	    }},
	    { selector: 'node.tag-miss', style: {
		'background-color': nodeDim,
		'border-color': edgeDim,
		'color': '#222',
		'text-outline-color': 'rgba(0,0,0,.18)'
	    }},

	    /* Edges — right-angled, subtle, with soft arrows */
	    { selector: 'edge', style: {
		'width': 2,
		'opacity': .9,
		'line-color': edgeColor,
		'target-arrow-color': arrowColor,
		'target-arrow-shape': 'triangle-backcurve',
		'arrow-scale': 1,
		/* orthogonal look */
		'curve-style': 'taxi',
		'taxi-direction': 'horizontal',
		'taxi-turn': 12,
		'taxi-turn-min-distance': 8
	    }},

	    /* Dim edges when nodes are dimmed */
	    { selector: 'edge.tag-miss', style: {
		'line-color': edgeDim,
		'target-arrow-color': edgeDim,
		'opacity': .7
	    }},

	    /* Hover / selection highlight */
	    { selector: '.highlight', style: {
		'background-color': highlight,
		'line-color': highlight,
		'target-arrow-color': highlight,
		'border-color': highlight
	    }},
	    { selector: ':selected', style: {
		'border-width': 4, 'border-color': highlight
	    }},
	];
    }

    function sizeByOutDegree(cy){
	const counts = new Map();
	cy.nodes().forEach(n => counts.set(n.id(), 0));
	cy.edges().forEach(e => counts.set(e.data('source'), (counts.get(e.data('source'))||0)+1));
	const vals = [...counts.values()];
	const min = Math.min(...vals), max = Math.max(...vals);
	cy.nodes().forEach(n => {
	    const k = counts.get(n.id()) || 0;
	    const s = 36 + (max===min ? 0 : (k-min) * (28/(max-min))); // 36–64px
	    n.style({ width: s, height: s });
	});
    }

    async function initModelGraph(opts){
	const container = document.querySelector(opts.container || '#cy');
	const resp = await fetch(opts.dataUrl);
	const { nodes = [], edges = [] } = await resp.json();

	// Build elements
	const elements = [
	    ...nodes.map(n => ({ data: n })),
	    ...edges.map(e => ({ data: e })),
	];

	const cy = cytoscape({
	    container,
	    elements,
	    wheelSensitivity: 0.2,
	    style: buildStyle(),
	    layout: {
		name: 'dagre',
		rankDir: opts.rankDir || 'LR',
		nodeSep: 48,
		rankSep: 90,
		edgeSep: 16
	    }
	});

	// optional sizing by influence (uncomment if you like)
	// sizeByOutDegree(cy);

	// relabel on zoom: lighten halo at far zoom to reduce clutter
	cy.on('zoom', () => {
	    const z = cy.zoom();
	    const halo = z < 0.7 ? 1 : (z > 1.5 ? .18 : .28);
	    cy.nodes().style('text-outline-color', `rgba(0,0,0,${halo})`);
	});

	// click to navigate
	cy.on('tap', 'node', ev => {
	    const url = ev.target.data('url');
	    if (url) location.href = url;
	});

	// Public helpers for your controls
	cy.__applyTag = function(kind, slug){
	    const s = (slug||'').trim().toLowerCase();
	    cy.nodes().removeClass('tag-hit tag-miss');
	    cy.edges().removeClass('tag-miss');
	    if(!s) return;
	    cy.nodes().forEach(n => {
		const list = (kind==='theme') ? (n.data('themes')||[]) : (n.data('memes')||[]);
		if (list.includes(s)) n.addClass('tag-hit');
		else n.addClass('tag-miss');
	    });
	    // dim edges if both ends are misses
	    cy.edges().forEach(e => {
		const a = e.source().hasClass('tag-miss');
		const b = e.target().hasClass('tag-miss');
		if (a && b) e.addClass('tag-miss');
	    });
	};

	cy.__clearTag = function(){
	    cy.nodes().removeClass('tag-hit tag-miss');
	    cy.edges().removeClass('tag-miss');
	};

	cy.__rerun = function(){
	    cy.layout({ name:'dagre', rankDir: opts.rankDir || 'LR', nodeSep:48, rankSep:90, edgeSep:16 }).run();
	};

	cy.__fit = function(){ cy.fit(undefined, 60); };

	// re-apply style if CSS variables change (manual trigger)
	cy.__restyle = function(){ cy.style(buildStyle()); };

	return cy;
    }

    // expose global
    window.initModelGraph = initModelGraph;
})();
