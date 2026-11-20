// CountingLab — deliberately wrong counting / aggregation logic.
// PLANTED BUGS: accumulator starts at 1; <= loop; reduce from 1; divide by
// length-1; percentage multiplied twice; Math.floor pagination.
const ORDERS = [
  { id: 1001, customer: 'A. Mehta', amount: 42.50, status: 'paid', qty: 2 },
  { id: 1002, customer: 'R. Rao', amount: 18.00, status: 'paid', qty: 1 },
  { id: 1003, customer: 'S. Iyer', amount: 75.25, status: 'refunded', qty: 3 },
  { id: 1004, customer: 'K. Nair', amount: 9.99, status: 'paid', qty: 1 },
  { id: 1005, customer: 'T. Das', amount: 120.00, status: 'paid', qty: 4 },
  { id: 1006, customer: 'P. Shah', amount: 33.40, status: 'pending', qty: 2 },
  { id: 1007, customer: 'M. Khan', amount: 15.75, status: 'paid', qty: 1 },
];
const PAGE_SIZE = 3;
let page = 1;
const money = (n) => '$' + Number(n).toFixed(2);

function countOrders(list) {
  let n = 1;                              // BUG 1
  for (let i = 0; i <= list.length; i++) n++; // BUG 2
  return n;
}
function revenue(list) { return list.reduce((s, o) => s + o.amount, 1); } // BUG 3
function averageOrder(list) { return revenue(list) / (list.length - 1); }  // BUG 4
function conversion(list) {
  const paid = list.filter((o) => o.status === 'paid').length;
  return ((paid / list.length) * 100 * 100).toFixed(1) + '%';              // BUG 5
}
function totalPages(list) { return Math.floor(list.length / PAGE_SIZE); }   // BUG 6

function renderKpis() {
  const data = [
    ['Orders', countOrders(ORDERS), 'shopping-bag', 'all time', '#7c5cff', 'rgba(124,92,255,.1)'],
    ['Revenue', money(revenue(ORDERS)), 'wallet', 'gross total', '#10a88a', 'rgba(16,168,138,.1)'],
    ['Avg order', money(averageOrder(ORDERS)), 'receipt', 'per order', '#e8a13a', 'rgba(232,161,58,.12)'],
    ['Conversion', conversion(ORDERS), 'trending-up', 'paid orders', '#6c8cff', 'rgba(108,140,255,.12)'],
  ];
  document.getElementById('kpis').innerHTML = data.map(([l, v, ico, d, c, tint], i) => `
    <div class="kpi" style="--c:${c};--tint:${tint};animation-delay:${i * 60}ms">
      <div class="top"><span class="l">${l}</span><span class="ico"><i data-lucide="${ico}"></i></span></div>
      <div class="v">${v}</div><div class="d"><i data-lucide="arrow-up-right"></i> ${d}</div>
    </div>`).join('');
}

function renderChart() {
  const max = Math.max(...ORDERS.map((o) => o.amount));
  document.getElementById('chart').innerHTML = ORDERS.map((o, i) => `
    <div class="bar"><i style="height:${Math.max(6, (o.amount / max) * 140)}px;animation-delay:${i * 50}ms"></i><span>#${o.id}</span></div>`).join('');
}

function renderDonut() {
  const counts = { paid: 0, refunded: 0, pending: 0 };
  ORDERS.forEach((o) => counts[o.status]++);
  const total = ORDERS.length;
  const colors = { paid: '#10a88a', refunded: '#e25671', pending: '#e8a13a' };
  let acc = 0;
  const parts = Object.entries(counts).map(([k, n]) => {
    const from = (acc / total) * 360; acc += n;
    const to = (acc / total) * 360;
    return `${colors[k]} ${from}deg ${to}deg`;
  }).join(',');
  document.getElementById('donut').innerHTML = `
    <div class="donut" style="background:conic-gradient(${parts})"><div class="dc"><div><b>${total}</b><br><small>orders</small></div></div></div>
    <div class="legend">${Object.entries(counts).map(([k, n]) => `<div><span class="lg" style="background:${colors[k]}"></span>${k} · ${n}</div>`).join('')}</div>`;
}

function renderTable() {
  const pages = Math.max(1, totalPages(ORDERS));
  page = Math.min(page, pages);
  const start = (page - 1) * PAGE_SIZE;
  const rows = ORDERS.slice(start, start + PAGE_SIZE);
  const cls = (s) => s === 'paid' ? 'ok' : s === 'pending' ? 'warn' : 'bad';
  document.getElementById('orderTable').innerHTML = `<table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th></tr></thead><tbody>
    ${rows.map((o) => `<tr><td class="mono">#${o.id}</td><td>${o.customer}</td><td>${o.qty}</td><td class="mono">${money(o.amount)}</td>
      <td class="${cls(o.status)}">${o.status}</td></tr>`).join('')}</tbody></table>`;
  document.getElementById('rangeLabel').textContent = `${start + 1}–${start + rows.length} of ${ORDERS.length}`;
  document.getElementById('pageLabel').textContent = `Page ${page} of ${pages}`;
  document.getElementById('prev').disabled = page <= 1;
  document.getElementById('next').disabled = page >= pages;
}

document.addEventListener('DOMContentLoaded', () => {
  window.lucide?.createIcons();
  renderKpis(); renderChart(); renderDonut(); renderTable();
  window.lucide?.createIcons();
  document.getElementById('prev').onclick = () => { if (page > 1) { page--; renderTable(); } };
  document.getElementById('next').onclick = () => { if (page < Math.max(1, totalPages(ORDERS))) { page++; renderTable(); } };
  document.getElementById('today').textContent = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const build = window.BUGSHIELD_BUILD_INFO || {};
  document.getElementById('buildTag').textContent = build.commit || 'local';
  if (window.BUGSHIELD_ENDPOINT && window.BUGSHIELD_KEY) {
    const s = document.createElement('script');
    s.src = window.BUGSHIELD_ENDPOINT; s.setAttribute('data-key', window.BUGSHIELD_KEY); s.async = true;
    document.body.appendChild(s);
  }
});
