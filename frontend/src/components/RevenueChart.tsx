interface RevenueChartProps {
  searchTerm?: string;
  filterText?: string;
}

const chartData = [
  { month: 'Oca / Jan', value: 45, height: 'h-[45%]' },
  { month: 'Şub / Feb', value: 60, height: 'h-[60%]' },
  { month: 'Mar / Maart', value: 35, height: 'h-[35%]' },
  { month: 'Nis / Apr', value: 80, height: 'h-[80%]' },
  { month: 'May / Mei', value: 65, height: 'h-[65%]' },
  { month: 'Haz / Jun', value: 95, height: 'h-[95%]' },
];

export default function RevenueChart({ searchTerm = '', filterText = '' }: RevenueChartProps) {
  const activeSearch = searchTerm || filterText;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-slate-800 text-base">Gelir Analizi / Omzetanalyse</h2>
          <p className="text-xs text-slate-400">Aylık performans / Maandelijkse prestaties</p>
        </div>
        {activeSearch && (
          <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-medium">
            Filtre / Filter: {activeSearch}
          </span>
        )}
      </div>

      {/* Sütun Grafiği (Bar Chart) Tasarımı */}
      <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-4 border-b border-slate-100">
        {chartData.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group">
            {/* Çubuk */}
            <div className="w-full bg-slate-100 group-hover:bg-blue-50 rounded-t-lg transition-all flex items-end justify-center relative overflow-hidden h-full">
              <div
                className={`w-full bg-blue-600 group-hover:bg-blue-700 transition-all rounded-t-lg ${item.height}`}
              ></div>
            </div>
            {/* Ay Etiketi */}
            <span className="text-[11px] text-slate-500 mt-2 font-medium">
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}