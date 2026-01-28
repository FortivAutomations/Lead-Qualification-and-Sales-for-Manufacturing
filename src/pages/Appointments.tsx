import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { Calendar, Clock, User, Mail } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Appointment {
  id: string;
  lead_name: string | null;
  lead_email: string | null;
  start_time: string | null;
  end_time: string | null;
  date: string | null;
}

const Appointments = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointment_details')
        .select('id, lead_name, lead_email, start_time, end_time, date')
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Appointment[];
    },
  });

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      if (!appointment.date) return true;

      const appointmentDate = parseISO(appointment.date);
      
      if (startDate) {
        const filterStart = startOfDay(parseISO(startDate));
        if (isBefore(appointmentDate, filterStart)) return false;
      }
      
      if (endDate) {
        const filterEnd = endOfDay(parseISO(endDate));
        if (isAfter(appointmentDate, filterEnd)) return false;
      }
      
      return true;
    });
  }, [appointments, startDate, endDate]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '-';
    return timeStr;
  };

  return (
    <DashboardLayout title="Appointments" subtitle="View and manage scheduled appointments">
      <div className="space-y-6">

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-48"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Calendar className="w-12 h-12 mb-2 opacity-50" />
                <p>No appointments found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Lead Name
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Lead Email
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Start Time
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        End Time
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        {appointment.lead_name || '-'}
                      </TableCell>
                      <TableCell>{appointment.lead_email || '-'}</TableCell>
                      <TableCell>{formatTime(appointment.start_time)}</TableCell>
                      <TableCell>{formatTime(appointment.end_time)}</TableCell>
                      <TableCell>{formatDate(appointment.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
