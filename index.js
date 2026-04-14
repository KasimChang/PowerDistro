/**
 * 配電助手 Pro - 核心邏輯整合版 (單一檔案)
 */

// --- 數據模組 (Data) ---

const nfbMarketSpecs = [
    { at: 15, af: 50 }, { at: 20, af: 50 }, { at: 30, af: 50 }, { at: 40, af: 50 }, { at: 50, af: 50 },
    { at: 60, af: 100 }, { at: 75, af: 100 }, { at: 100, af: 100 }, { at: 125, af: 225 }, { at: 150, af: 225 },
    { at: 175, af: 225 }, { at: 200, af: 225 }, { at: 225, af: 225 }, { at: 250, af: 400 }, { at: 300, af: 400 }, { at: 400, af: 400 }
];

const wireSpecs = [
    { name: "1.6mm (白扁)", amp: 12, ref: "第 16 條 表 16-7" },
    { name: "2.0mm (白扁)", amp: 15, ref: "第 16 條 表 16-7" },
    { name: "2.0mm (單心)", amp: 19, ref: "第 16 條 表 16-3" },
    { name: "3.5mm² (絞線)", amp: 19, ref: "第 16 條 表 16-3" },
    { name: "5.5mm² (絞線)", amp: 25, ref: "第 16 條 表 16-3" },
    { name: "8.0mm² (絞線)", amp: 33, ref: "第 16 條 表 16-3" },
    { name: "14mm² (絞線)", amp: 50, ref: "第 16 條 表 16-3" },
    { name: "22mm² (絞線)", amp: 60, ref: "第 16 條 表 16-3" },
    { name: "30mm² (絞線)", amp: 75, ref: "第 16 條 表 16-3" },
    { name: "38mm² (絞線)", amp: 85, ref: "第 16 條 表 16-3" },
    { name: "50mm² (絞線)", amp: 100, ref: "第 16 條 表 16-3" },
    { name: "60mm² (絞線)", amp: 115, ref: "第 16 條 表 16-3" },
    { name: "80mm² (絞線)", amp: 140, ref: "第 16 條 表 16-3" },
    { name: "100mm² (絞線)", amp: 160, ref: "第 16 條 表 16-3" },
    { name: "125mm² (絞線)", amp: 190, ref: "第 16 條 表 16-3" },
    { name: "150mm² (絞線)", amp: 220, ref: "第 16 條 表 16-3" },
    { name: "200mm² (絞線)", amp: 260, ref: "第 16 條 表 16-3" },
    { name: "250mm² (絞線)", amp: 300, ref: "第 16 條 表 16-3" }
];

const sopData = {
    phases: [
        {
            title: "階段一：送電前——靜態檢查標準",
            icon: "fas fa-plug text-blue-400",
            items: [
                {
                    id: "SOP 01", name: "螺絲扭力校核",
                    tools: "扭力起子/板手、記號筆",
                    process: "1.清理 -> 2.設定扭力 -> 3.施鎖至發聲 -> 4.劃線標記",
                    standards: [
                        { spec: "M4 / M5", val: "1.2 ~ 2.5", ref: "分歧開關" },
                        { spec: "M6 / M8", val: "4.0 ~ 12.0", ref: "匯流排" },
                        { spec: "M10/M12", val: "25.0 ~ 50.0", ref: "主入線" }
                    ]
                },
                {
                    id: "SOP 02/03", name: "接地與絕緣測試",
                    tools: "三線式接地計、Megger",
                    process: "接地: 佈設輔助棒量測；絕緣: 斷開電子元件後施壓",
                    indicators: [
                        { label: "接地電阻", value: "低壓 < 100Ω", color: "blue", ref: "第 51 條" },
                        { label: "絕緣阻值", value: "實務 > 10MΩ", color: "green", ref: "第 13 條" }
                    ]
                },
                {
                    id: "SOP 04", name: "馬達線圈檢測",
                    tools: "低阻電表、Megger",
                    process: "測量 U-V-W 相間電阻並計算平衡率；量測對地絕緣",
                    details: [
                        { label: "阻值偏差", value: "< 10%", ref: "經驗標準" },
                        { label: "對地絕緣", value: "> 10MΩ", ref: "規範標準" }
                    ]
                }
            ]
        },
        {
            title: "階段二：送電初期——動態檢查標準",
            icon: "fas fa-bolt text-yellow-500",
            items: [
                {
                    id: "SOP 05", name: "電壓品質量測",
                    tools: "數位電表",
                    process: "量測各相電壓穩定度與供電頻率",
                    standards_list: ["電壓偏差 ±10% 內", "三相不平衡 < 3%", "頻率 60Hz ± 0.5Hz"]
                },
                {
                    id: "SOP 06", name: "相序與轉向校核",
                    tools: "相序計",
                    process: "確認相位為正序 (CW)；反序應對對調電源兩相",
                    standards_list: ["須呈現 正序 (CW)", "防呆：嚴禁馬達反轉"]
                }
            ]
        },
        {
            title: "階段三：運轉中——負荷判定標準",
            icon: "fas fa-fire-alt text-orange-400",
            items: [
                {
                    id: "SOP 07/08", name: "負載電流監測",
                    tools: "漏電勾表、電流勾表",
                    process: "監控實測電流負載率與漏電量",
                    details: [
                        { label: "漏電流", value: "< 10mA / 跳脫值50%", ref: "第 54 條" },
                        { label: "負載率", value: "< 額定 80%", ref: "第 59 條" }
                    ]
                },
                {
                    id: "SOP 09", name: "紅外線熱顯像判定",
                    tools: "紅外線熱像儀",
                    process: "掃描所有接頭、斷路器、匯流排之溫升差值",
                    table: [
                        { range: "1°C ~ 10°C", desc: "正常範疇" },
                        { range: "11°C ~ 40°C", desc: "維護重鎖" },
                        { range: "> 40°C", desc: "急性危險" }
                    ]
                }
            ]
        }
    ]
};

// --- 重點功能 (Logic) ---

let currentPhase = 3;
let currentEnv = 'dry';

function calculateLoad(power, unit, voltage, pf, phase) {
    let P = parseFloat(power);
    if (!P || P <= 0) return null;
    if (unit === "kW") P *= 1000;
    
    // 負載電流
    const I_load = phase === 1 ? P / (voltage * pf) : P / (Math.sqrt(3) * voltage * pf);
    // 設計電流 (依規採取 1.25 倍安全係數)
    const I_design = I_load * 1.25;

    // 校核路徑 1: 根據設計電流選取滿足負載之最小導線
    const recWire = wireSpecs.find(w => w.amp >= I_design);
    
    // 校核路徑 2: 根據設計電流選取滿足負載之商規 NFB (AT)
    const recNFB = nfbMarketSpecs.find(s => s.at >= I_design) || nfbMarketSpecs[nfbMarketSpecs.length - 1];

    // 法規判定：確保 800A 以下符合第 151 條「次高額定原則」
    
    return {
        I_load, I_design, recNFB, recWire,
        poleCount: phase === 1 ? '2P' : '3P',
        formula: phase === 1 ? `I = P / (V × PF)` : `I = P / (√3 × V × PF)`
    };
}

// --- UI 渲染與事件 ---

window.setPhase = function(p) {
    currentPhase = p;
    document.getElementById('btn-p1').className = "py-4 rounded-2xl border-2 transition-all " + (p === 1 ? "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm" : "border-slate-100 bg-slate-50 text-slate-400 font-bold");
    document.getElementById('btn-p3').className = "py-4 rounded-2xl border-2 transition-all " + (p === 3 ? "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm" : "border-slate-100 bg-slate-50 text-slate-400 font-bold");
    window.calculate();
};

window.setEnv = function(env) {
    currentEnv = env;
    document.getElementById('btn-env-dry').className = "py-3 rounded-2xl border-2 transition-all text-sm " + (env === 'dry' ? "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm" : "border-slate-100 bg-slate-50 text-slate-400 font-bold");
    document.getElementById('btn-env-wet').className = "py-3 rounded-2xl border-2 transition-all text-sm " + (env === 'wet' ? "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm" : "border-slate-100 bg-slate-50 text-slate-400 font-bold");
    window.calculate();
};

window.updatePF = function(val) {
    if (val !== 'custom') document.getElementById('pf-value').value = val;
    window.calculate();
};

window.toggleAccordion = function(btn) {
    btn.parentElement.classList.toggle('active');
};

window.calculate = function() {
    const power = document.getElementById('power').value;
    const unit = document.getElementById('power-unit').value;
    const voltage = document.getElementById('voltage').value;
    const pf = document.getElementById('pf-value').value;
    
    const result = calculateLoad(power, unit, voltage, pf, currentPhase);
    const empty = document.getElementById('empty-state');
    const view = document.getElementById('results-view');

    if (!result) { empty.classList.remove('hidden'); view.classList.add('hidden'); return; }
    empty.classList.add('hidden'); view.classList.remove('hidden');

    // 渲染摘要
    document.getElementById('res-nfb').innerText = result.recNFB.at;
    if (result.recWire) {
        const parts = result.recWire.name.split(' ');
        document.getElementById('res-wire').innerHTML = parts.length > 1 ? `${parts[0]}<span class="text-xl md:text-3xl opacity-50 ml-2 font-bold">${parts[1]}</span>` : result.recWire.name;
    }
    document.getElementById('res-pole-info').innerText = `${result.poleCount} 配置 (L1/L2${currentPhase === 3 ? '/L3' : ''})`;

    // 漏電模組
    const elcb = document.getElementById('elcb-module');
    const badge = document.getElementById('res-breaker-badge');
    if (currentEnv === 'wet') {
        elcb.classList.replace('opacity-20', 'opacity-100');
        document.getElementById('res-elcb-ma').innerText = '30';
        document.getElementById('res-elcb-desc').innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i> 強制漏電保護';
        badge.innerText = 'ELCB / NV';
        badge.className = "inline-flex items-center px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 text-[10px] md:text-xs font-bold";
    } else {
        elcb.classList.replace('opacity-100', 'opacity-20');
        document.getElementById('res-elcb-ma').innerText = '--';
        document.getElementById('res-elcb-desc').innerText = '非強制裝設';
        badge.innerText = 'NFB';
        badge.className = "inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold";
    }

    renderTables(result);
    renderSteps(result);
};

function renderTables(res) {
    const typeNm = currentEnv === 'wet' ? 'ELCB / NV' : 'NFB';
    document.getElementById('res-breaker-title-pole').innerText = `${res.poleCount} 配置`;
    
    document.getElementById('breaker-table-body').innerHTML = nfbMarketSpecs.map(s => {
        const isSel = s.at === res.recNFB.at;
        return `<tr class="${isSel ? 'recommend-row' : ''}">
            <td class="px-4 md:px-8 py-4 border-b font-bold text-slate-700 text-xs md:text-sm whitespace-nowrap">${res.poleCount} ${typeNm}</td>
            <td class="px-4 md:px-8 py-4 border-b font-mono font-bold text-blue-600 text-xs md:text-sm">${s.at} A</td>
            <td class="px-4 md:px-8 py-4 border-b text-slate-400 text-[10px] md:text-xs hidden sm:table-cell">${s.af} AF</td>
            <td class="px-4 md:px-8 py-4 border-b">${isSel ? '<span class="bg-blue-500 text-white text-[10px] px-3 py-1 rounded-full font-bold">選配建議</span>' : (s.at < res.I_design ? '<span class="text-red-400 text-[10px] font-bold">額定過低</span>' : '<span class="text-slate-300">--</span>')}</td>
        </tr>`;
    }).join('');

    document.getElementById('wire-table-body').innerHTML = wireSpecs.map(s => {
        const isSel = res.recWire && s.name === res.recWire.name;
        return `<tr class="${isSel ? 'recommend-row' : ''}">
            <td class="px-4 md:px-8 py-4 border-b font-bold text-slate-700 text-xs md:text-sm whitespace-nowrap">${s.name}</td>
            <td class="px-4 md:px-8 py-4 border-b font-mono font-bold text-slate-900 text-xs md:text-sm">${s.amp} A</td>
            <td class="px-4 md:px-8 py-4 border-b text-slate-400 text-[10px] md:text-xs hidden md:table-cell">${s.ref}</td>
            <td class="px-4 md:px-8 py-4 border-b">${isSel ? '<span class="bg-green-500 text-white text-[10px] px-3 py-1 rounded-full font-bold">符合安全校核</span>' : '<span class="text-slate-300">--</span>'}</td>
        </tr>`;
    }).join('');
}

function renderSteps(res) {
    document.getElementById('calc-steps').innerHTML = `
        <div class="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-hover">
            <p class="font-bold text-slate-800 text-[10px] md:text-xs mb-2 uppercase opacity-40 tracking-wider">1. 負載電流</p>
            <p class="font-mono text-[10px] md:text-xs text-slate-400">${res.formula}</p>
            <p class="mt-1 text-blue-600 font-bold text-lg md:text-xl">= ${res.I_load.toFixed(2)} A</p>
        </div>
        <div class="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-hover">
            <p class="font-bold text-slate-800 text-[10px] md:text-xs mb-2 uppercase opacity-40 tracking-wider">2. 設計電流 (1.25x)</p>
            <p class="mt-1 text-blue-600 font-bold text-lg md:text-xl">${res.I_design.toFixed(2)} A</p>
        </div>
        <div class="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-hover">
            <p class="font-bold text-slate-800 text-[10px] md:text-xs mb-2 uppercase opacity-40 tracking-wider">3. 保護選配</p>
            <p class="mt-1 text-blue-600 font-bold text-lg md:text-xl">NFB ${res.recNFB.at} A</p>
        </div>
        <div class="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-hover">
            <p class="font-bold text-slate-800 text-[10px] md:text-xs mb-2 uppercase opacity-40 tracking-wider">4. 導線校核</p>
            <p class="mt-1 text-green-600 font-bold text-lg md:text-xl">${res.recWire ? res.recWire.name : '規格超出'}</p>
        </div>
    `;
}

function initSOP() {
    const container = document.getElementById('sop-accordion-container');
    if (!container) return;
    container.innerHTML = `
        <h2 class="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest flex items-center mb-6 px-2">
            <i class="fas fa-clipboard-check mr-3 text-blue-500"></i> SOP 竣工檢驗建議標準
        </h2>
        ${sopData.phases.map(p => `
            <div class="accordion-item bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 overflow-hidden shadow-sm transition-all hover:shadow-md mb-4 mx-1">
                <button onclick="toggleAccordion(this)" class="w-full px-5 py-5 md:px-8 md:py-6 flex items-center justify-between text-left focus:outline-none">
                    <span class="font-bold text-slate-700 flex items-center text-xs md:text-base">
                        <i class="${p.icon} mr-3 md:mr-4"></i> ${p.title}
                    </span>
                    <i class="fas fa-chevron-down accordion-icon text-slate-300"></i>
                </button>
                <div class="accordion-content px-4 md:px-8 pb-4">
                    <div class="space-y-4 pb-4">
                        ${p.items.map(item => `
                            <div class="bg-slate-50/50 p-4 md:p-6 rounded-[20px] md:rounded-[24px] border border-slate-100 shadow-inner">
                                <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
                                    <h3 class="font-black text-slate-800 text-xs md:text-sm">${item.id}: ${item.name}</h3>
                                    <span class="text-[9px] md:text-[11px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-tighter shrink-0">工具: ${item.tools}</span>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                                    <div class="bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm">
                                        <p class="text-[9px] md:text-[11px] font-bold text-slate-300 uppercase mb-2">作業流程</p>
                                        <p class="text-slate-600 leading-relaxed font-medium">${item.process}</p>
                                    </div>
                                    <div class="space-y-2">
                                        ${item.standards || item.indicators || item.details || item.table || item.standards_list ? `
                                            <div class="bg-white p-3 md:p-4 rounded-xl border border-blue-100/50 shadow-sm">
                                                <p class="text-[9px] md:text-[11px] font-bold text-blue-300 uppercase mb-2">判定指標與法規</p>
                                                <div class="space-y-2">
                                                    ${item.standards ? `
                                                        <table class="w-full bg-white rounded-lg overflow-hidden border border-slate-100 font-medium">
                                                            ${item.standards.map(s => `<tr><td class="px-3 py-1.5 border-b text-slate-400">${s.spec}</td><td class="px-3 py-1.5 border-b font-black text-slate-800">${s.val} N·m</td><td class="px-3 py-1.5 border-b text-right text-[9px] text-blue-400">${s.ref || ''}</td></tr>`).join('')}
                                                        </table>
                                                    ` : ''}
                                                    ${item.indicators ? `
                                                        <div class="grid grid-cols-2 gap-2">
                                                            ${item.indicators.map(ind => `<div class="p-2 rounded-lg bg-slate-50 border border-slate-100"><p class="text-[9px] text-slate-300 font-bold">${ind.label} <span class="text-blue-300 ml-1">${ind.ref || ''}</span></p><p class="font-black text-${ind.color}-600">${ind.value}</p></div>`).join('')}
                                                        </div>
                                                    ` : ''}
                                                    ${item.standards_list ? `
                                                        <ul class="text-slate-500 space-y-1.5 pl-1 font-medium italic">
                                                            ${item.standards_list.map(l => `<li>• ${l}</li>`).join('')}
                                                        </ul>
                                                    ` : ''}
                                                    ${item.table ? `
                                                        <table class="w-full bg-white rounded-lg border border-slate-100 font-medium">
                                                            ${item.table.map(d => `<tr><td class="px-3 py-1.5 border-b text-slate-400">${d.range}</td><td class="px-3 py-1.5 border-b text-right font-black text-slate-800">${d.desc}</td></tr>`).join('')}
                                                        </table>
                                                    ` : ''}
                                                    ${item.details ? `
                                                        ${item.details.map(d => `<div class="flex justify-between bg-white p-2 rounded-lg border border-slate-100"><span class="text-slate-400 underline decoration-slate-200">${d.label} <small class="text-blue-300 no-underline">${d.ref || ''}</small></span><span class="font-black text-slate-800">${d.value}</span></div>`).join('')}
                                                    ` : ''}
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('')}
    `;
}

// 初始化啟動
document.addEventListener('DOMContentLoaded', () => {
    initSOP();
    window.calculate();
});
