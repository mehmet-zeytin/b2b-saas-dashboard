interface RevenueChartProps {
  searchTerm?: string;
  filterText?: string;
}

const chartData = [
  { label: 'Çocuk Tekstil', sales: 190 },
  { label: 'Erkek Giyim', sales: 315 },
  { label: 'Bayan Giyim', sales: 135 },
  { label: 'Ayakkabı', sales: 195 },
  { label: 'Oyuncak', sales: 290 },
  { label: 'Bakım Ürünleri', sales: 350 },
];

export default function RevenueChart({ searchTerm = '', filterText = '' }: RevenueChartProps) {
  const activeSearch = searchTerm || filterText;

  const filteredData = chartData.filter(item => 
    !activeSearch || item.label.toLowerCase().includes(activeSearch.toLowerCase())
  );

  const displayData = filteredData.length > 0 ? filteredData : chartData;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-slate-800 text-base">Satış Analizi / Verkoopanalyse</h2>
          <p className="text-xs text-slate-400">Sütun Grafiği ve Tutar Dağılımı</p>
        </div>
      </div>

      <div className="h-72 w-full bg-white rounded-lg border border-slate-200 p-4 relative flex flex-col justify-end">
        
        {/* Arka Plan Çizgileri */}
        <div className="absolute inset-x-4 top-8 bottom-16 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-slate-200 w-full flex justify-end text-[10px] text-slate-400 pr-2">400</div>
          <div className="border-b border-slate-200 w-full flex justify-end text-[10px] text-slate-400 pr-2">300</div>
          <div className="border-b border-slate-200 w-full flex justify-end text-[10px] text-slate-400 pr-2">200</div>
          <div className="border-b border-slate-200 w-full flex justify-end text-[10px] text-slate-400 pr-2">100</div>
          <div className="border-b border-slate-200 w-full flex justify-end text-[10px] text-slate-400 pr-2">0</div>
        </div>

        {/* Grafik Alanı */}
        <div className="relative z-10 h-48 w-full flex items-end justify-around px-4">
          {displayData.map((item, index) => {
            const salesHeight = (item.sales / 400) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center h-full justify-end relative group mx-2">
                
                {/* Mavi Sütun */}
                <div 
                  style={{ height: `${salesHeight}%` }}
                  className="w-10 bg-blue-600 rounded-t-sm transition-all hover:bg-blue-700 relative z-10"
                ></div>

                {/* Kategori Adı ve Sütun Altında Tutar Bilgisi */}
                <div className="flex flex-col items-center mt-2 w-full">
                  <span className="text-[11px] text-slate-700 font-semibold text-center truncate w-full">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded mt-0.5">
                    {item.sales} €
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}