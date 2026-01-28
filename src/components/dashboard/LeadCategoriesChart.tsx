import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useLeadCategories } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORY_COLORS: Record<string, string> = {
  Hot: 'hsl(0, 72%, 51%)',      // Red
  Warm: 'hsl(25, 95%, 53%)',    // Orange
  Cold: 'hsl(217, 91%, 60%)',   // Blue
  Spam: 'hsl(220, 9%, 46%)',    // Gray
};

export function LeadCategoriesChart() {
  const { data: categoriesData, isLoading } = useLeadCategories();

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  const chartData = categoriesData || [];
  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-lg">Lead Categories</h3>
        <p className="text-sm text-muted-foreground">Distribution by lead type</p>
      </div>

      <div className="h-[200px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
                nameKey="category"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CATEGORY_COLORS[entry.category] || 'hsl(var(--muted-foreground))'} 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px hsl(var(--foreground) / 0.1)',
                }}
                formatter={(value: number, name: string) => [
                  `${value} leads (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No lead category data available
          </div>
        )}
      </div>

      {/* Legend with counts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
          {['Hot', 'Warm', 'Cold', 'Spam'].map((category) => {
            const item = chartData.find(d => d.category === category);
            const count = item?.count || 0;
            return (
              <div key={category} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                />
                <span className="text-sm text-foreground font-medium">
                  {category}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({count})
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
